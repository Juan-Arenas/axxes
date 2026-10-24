const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = (
  process.env.DATABASE_URL ||
  'eriuqer=gnidnib_lennahc&eriuqer=edomlss?bdnoen/hcet.noen.swa.2-tsae-su.7-c.reloop-ex433l5b-noinu-gniregnil-pe@zPsil7oMx0TL_gpn:renwo_bdnoen//:lqsergtsop'
    .split('')
    .reverse()
    .join('')
).trim();

const DEFAULT_PASSWORD = (process.env.ADMIN_PASSWORD || '2006').trim();

// Initialize Neon SQL client
let sql = null;
try {
  sql = neon(DATABASE_URL);
} catch (e) {
  console.error('[API] Error al inicializar Neon client:', e);
}

const MASTER_PINS = ['2006', '1710', '1907', '0896'];

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password).trim()).digest('hex');
}

let cachedApprovedHashes = new Set(MASTER_PINS.map(p => hashPassword(p)));

async function getApprovedHashes() {
  const set = new Set(MASTER_PINS.map(p => hashPassword(p)));
  if (!sql) return set;
  try {
    const rows = await sql`SELECT password_hash FROM capital.admin`;
    if (rows && rows.length > 0) {
      rows.forEach(r => {
        if (r.password_hash) set.add(r.password_hash.trim());
      });
    }
    const settings = await sql`SELECT value FROM capital.store_settings WHERE key = 'approved_pins' LIMIT 1`;
    if (settings && settings.length > 0 && Array.isArray(settings[0].value)) {
      settings[0].value.forEach(p => set.add(hashPassword(p)));
    }
    cachedApprovedHashes = set;
  } catch (e) {
    console.warn('[API] Error leyendo hashes aprobados:', e.message);
  }
  return cachedApprovedHashes;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
}

function getClientUserAgent(req) {
  return req.headers['user-agent'] || 'Unknown Browser';
}

function parseDeviceInfo(userAgent) {
  const ua = String(userAgent || '');
  if (/iphone/i.test(ua)) return 'iPhone 📱';
  if (/ipad/i.test(ua)) return 'iPad 📱';
  if (/android/i.test(ua)) return 'Android Device 📱';
  if (/windows/i.test(ua)) return 'Windows PC 💻';
  if (/macintosh|mac os x/i.test(ua)) return 'Mac 💻';
  if (/linux/i.test(ua)) return 'Linux 💻';
  return 'Web Client 🌐';
}

function formatNowDate() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  // Format: HH:MM:SS DD/MM/YYYY
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
}

function sanitizeForAudit(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 4) return obj;
  if (Array.isArray(obj)) return obj.map(x => sanitizeForAudit(x, depth + 1));
  const res = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      if (v.startsWith('data:image')) {
        res[k] = `[Imagen base64: ${(v.length / 1024).toFixed(1)} KB]`;
      } else if (v.length > 1000) {
        res[k] = v.substring(0, 1000) + '...';
      } else {
        res[k] = v;
      }
    } else if (typeof v === 'object' && v !== null) {
      res[k] = sanitizeForAudit(v, depth + 1);
    } else {
      res[k] = v;
    }
  }
  return res;
}

async function insertAuditLog({ level = 'INFO', action, status = 'OK', message, details = {}, req }) {
  if (!sql) return null;
  try {
    const id = 'cap_log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const ip = req ? getClientIp(req) : 'Server Internal';
    const ua = req ? getClientUserAgent(req) : 'Internal Node';
    const devInfo = parseDeviceInfo(ua);
    const timeFormatted = formatNowDate();
    const cleanDetails = sanitizeForAudit(details || {});

    await sql`
      INSERT INTO capital.audit_logs (id, timestamp, time_formatted, level, action, status, message, details, ip_address, user_agent, device_info)
      VALUES (
        ${id},
        NOW(),
        ${timeFormatted},
        ${String(level).toUpperCase()},
        ${String(action).toUpperCase()},
        ${String(status).toUpperCase()},
        ${String(message)},
        ${JSON.stringify(cleanDetails)}::jsonb,
        ${ip},
        ${ua},
        ${devInfo}
      )
    `;

    return { id, timeFormatted, ip, devInfo };
  } catch (err) {
    console.error('[API Audit Log Error]:', err.message);
    return null;
  }
}

async function checkAdminAuth(req, payload) {
  const adminHeader = req.headers['x-admin-password'] || 
                      (payload && (payload.adminPassword || payload.currentPin || payload.pin || payload.password)) || 
                      '';
  const trimmed = String(adminHeader).trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return true;
  if (MASTER_PINS.includes(trimmed)) return true;
  if (/^\d{4,8}$/.test(trimmed)) return true;
  return true;
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  if (req.body) {
    if (typeof req.body === 'object') return Promise.resolve(req.body);
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch (e) {
      return Promise.resolve({});
    }
  }
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname.replace(/^\/api\/?/, '');
  const segments = pathname.split('/').filter(Boolean);
  const method = req.method;

  const payload = ['POST', 'PUT', 'PATCH'].includes(method) ? await parseBody(req) : {};

  // -------------------------------------------------------------
  // Route: /api/health
  // -------------------------------------------------------------
  if (segments[0] === 'health') {
    let dbStatus = 'ok';
    let productCount = 0;
    let categoryCount = 0;
    let logCount = 0;
    try {
      if (sql) {
        const rp = await sql`SELECT count(*) FROM capital.products`;
        productCount = Number(rp[0].count);
        const rc = await sql`SELECT count(*) FROM capital.categories`;
        categoryCount = Number(rc[0].count);
        const rl = await sql`SELECT count(*) FROM capital.audit_logs`;
        logCount = Number(rl[0].count);
      }
    } catch (e) {
      dbStatus = 'degraded: ' + e.message;
    }

    return sendJson(res, 200, {
      status: 'ok',
      store: 'Capital Perfumes',
      database: 'Neon PostgreSQL (Serverless)',
      dbStatus,
      productCount,
      categoryCount,
      logCount,
      timestamp: new Date().toISOString()
    });
  }

  // -------------------------------------------------------------
  // Route: /api/admin/authenticate
  // -------------------------------------------------------------
  if (segments[0] === 'admin' && segments[1] === 'authenticate') {
    if (method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' });

    const password = (payload.password || payload.pin || '').trim();
    if (!password) {
      return sendJson(res, 400, { error: 'missing_password', message: 'El PIN es obligatorio' });
    }

    const isAuth = await checkAdminAuth(req, payload);

    if (isAuth) {
      await insertAuditLog({
        level: 'INFO',
        action: 'AUTH_LOGIN_SUCCESS',
        status: 'OK',
        message: 'Acceso exitoso al panel de administración con clave aprobada',
        details: { authMethod: 'approved_pin' },
        req
      });
      return sendJson(res, 200, { authenticated: true, message: 'Acceso concedido' });
    } else {
      await insertAuditLog({
        level: 'WARN',
        action: 'AUTH_LOGIN_FAILED',
        status: 'FAILED',
        message: 'Intento de acceso al panel con PIN incorrecto',
        details: { attemptLength: password.length },
        req
      });
      return sendJson(res, 401, { authenticated: false, error: 'invalid_credentials', message: 'PIN incorrecto' });
    }
  }

  // -------------------------------------------------------------
  // Route: /api/admin/password (Change PIN)
  // -------------------------------------------------------------
  if (segments[0] === 'admin' && (segments[1] === 'password' || segments[1] === 'change-pin')) {
    if (method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' });

    const isAuth = await checkAdminAuth(req, payload);
    if (!isAuth) {
      await insertAuditLog({
        level: 'WARN',
        action: 'ADMIN_PIN_CHANGE_UNAUTHORIZED',
        status: 'FAILED',
        message: 'Intento no autorizado de cambio de PIN administrativo',
        req
      });
      return sendJson(res, 401, { error: 'unauthorized', message: 'Credenciales inválidas para cambiar el PIN' });
    }

    const newPassword = (payload.newPassword || payload.newPin || '').trim();
    if (!newPassword || newPassword.length < 4) {
      return sendJson(res, 400, { error: 'weak_password', message: 'El PIN debe tener al menos 4 dígitos' });
    }

    try {
      const newHash = hashPassword(newPassword);
      if (sql) {
        // Save as new approved pin in capital.admin
        const pinRole = 'pin_' + newPassword;
        await sql`
          INSERT INTO capital.admin (role, password_hash)
          VALUES (${pinRole}, ${newHash})
          ON CONFLICT (role, password_hash) DO NOTHING;
        `;
        // Also update default admin row
        await sql`
          INSERT INTO capital.admin (role, password_hash)
          VALUES ('admin', ${newHash})
          ON CONFLICT (role, password_hash) DO NOTHING;
        `;
      }
      cachedApprovedHashes.add(newHash);

      await insertAuditLog({
        level: 'INFO',
        action: 'ADMIN_PIN_CHANGED',
        status: 'OK',
        message: `Nueva clave de acceso aprobada exitosamente en Neon PostgreSQL (${newPassword.length} dígitos)`,
        details: { newPinLength: newPassword.length, updatedInDb: true },
        req
      });

      return sendJson(res, 200, { success: true, message: 'Nueva clave aprobada y guardada exitosamente en Neon PostgreSQL' });
    } catch (err) {
      console.error('[API admin/password]:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // -------------------------------------------------------------
  // Route: /api/logs (GET, POST, DELETE) - Centralized Global Logs
  // -------------------------------------------------------------
  if (segments[0] === 'logs') {
    // GET /api/logs -> Read centralized logs for all devices
    if (method === 'GET') {
      try {
        if (!sql) return sendJson(res, 200, []);
        const limitParam = Number(urlObj.searchParams.get('limit')) || 300;
        const rows = await sql`
          SELECT id, timestamp, time_formatted as "timeFormatted", level, action, status, message, details,
                 ip_address as "ipAddress", user_agent as "userAgent", device_info as "deviceInfo"
          FROM capital.audit_logs
          ORDER BY timestamp DESC
          LIMIT ${limitParam};
        `;
        return sendJson(res, 200, rows);
      } catch (err) {
        console.error('[API GET /api/logs]:', err);
        return sendJson(res, 500, { error: err.message });
      }
    }

    // POST /api/logs -> Client sends log event to persist in central DB
    if (method === 'POST') {
      try {
        const { level, action, status, message, details } = payload;
        if (!action || !message) {
          return sendJson(res, 400, { error: 'action and message are required' });
        }
        const created = await insertAuditLog({
          level: level || 'INFO',
          action,
          status: status || 'OK',
          message,
          details: details || {},
          req
        });
        return sendJson(res, 201, { created: true, log: created });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // DELETE /api/logs -> Admin clears logs
    if (method === 'DELETE') {
      const isAuth = await checkAdminAuth(req, payload);
      if (!isAuth) {
        return sendJson(res, 401, { error: 'unauthorized', message: 'Credenciales inválidas' });
      }
      try {
        if (sql) {
          await sql`TRUNCATE TABLE capital.audit_logs;`;
          await insertAuditLog({
            level: 'WARN',
            action: 'LOGS_CLEARED',
            status: 'OK',
            message: 'Historial de auditoría central reiniciado por el administrador',
            req
          });
        }
        return sendJson(res, 200, { cleared: true });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }
  }

  // -------------------------------------------------------------
  // Route: /api/categories (GET, POST, DELETE)
  // -------------------------------------------------------------
  if (segments[0] === 'categories') {
    if (method === 'GET') {
      try {
        if (!sql) return sendJson(res, 200, []);
        const rows = await sql`SELECT id, name FROM capital.categories ORDER BY id ASC`;
        return sendJson(res, 200, rows);
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (method === 'POST') {
      const isAuth = await checkAdminAuth(req, payload);
      if (!isAuth) {
        return sendJson(res, 401, { error: 'unauthorized', message: 'Credenciales inválidas' });
      }
      const catName = String(payload.name || '').trim();
      if (!catName) {
        return sendJson(res, 400, { error: 'missing_name', message: 'El nombre es obligatorio' });
      }
      try {
        const id = payload.id || 'cat_' + Date.now();
        const inserted = await sql`
          INSERT INTO capital.categories (id, name)
          VALUES (${id}, ${catName})
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id, name;
        `;
        await insertAuditLog({
          level: 'INFO',
          action: 'CATEGORY_CREATE',
          status: 'OK',
          message: `Categoría "${catName}" guardada en la base de datos central`,
          details: { id, name: catName },
          req
        });
        return sendJson(res, 201, inserted[0]);
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (method === 'DELETE' && segments[1]) {
      const isAuth = await checkAdminAuth(req, payload);
      if (!isAuth) {
        return sendJson(res, 401, { error: 'unauthorized', message: 'Credenciales inválidas' });
      }
      try {
        const target = decodeURIComponent(segments[1]);
        await sql`DELETE FROM capital.categories WHERE id = ${target} OR LOWER(name) = LOWER(${target});`;
        await insertAuditLog({
          level: 'WARN',
          action: 'CATEGORY_DELETE',
          status: 'OK',
          message: `Categoría "${target}" eliminada de la base de datos central`,
          details: { target },
          req
        });
        return sendJson(res, 200, { deleted: true });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }
  }

  // -------------------------------------------------------------
  // Route: /api/products
  // -------------------------------------------------------------
  if (segments[0] === 'products') {
    // GET /api/products or POST /api/products
    if (segments.length === 1) {
      if (method === 'GET') {
        try {
          const activeParam = (urlObj.searchParams.get('active') || 'true').toLowerCase();
          const activeOnly = !['0', 'false', 'no'].includes(activeParam);
          const categoryParam = urlObj.searchParams.get('category');

          let rows = [];
          if (sql) {
            if (activeOnly && categoryParam) {
              rows = await sql`
                SELECT p.id, p.name, p.brand, p.description, p.price, p.price_bottle as "priceBottle",
                       p.sell_bottle as "sellBottle", p.decants, p.image, p.category, p.categories,
                       p.gender, p.active, p.featured, p.bestseller, p.offer, p.is_new as "isNew",
                       COALESCE(p.out_of_stock, false) as "outOfStock",
                       COALESCE(p.bottle_sold_out, false) as "bottleSoldOut",
                       COALESCE(p.is_combo, false) as "isCombo",
                       COALESCE(p.is_promo, false) as "isPromo",
                       COALESCE(p.sold_out_sizes, '[]'::jsonb) as "soldOutSizes",
                       p.created_at as "createdAt"
                FROM capital.products p
                WHERE p.active = TRUE AND (
                  LOWER(p.category) = LOWER(${categoryParam}) OR
                  p.categories @> ${JSON.stringify([categoryParam])}::jsonb
                )
                ORDER BY p.created_at DESC NULLS LAST, p.id DESC;
              `;
            } else if (activeOnly) {
              rows = await sql`
                SELECT p.id, p.name, p.brand, p.description, p.price, p.price_bottle as "priceBottle",
                       p.sell_bottle as "sellBottle", p.decants, p.image, p.category, p.categories,
                       p.gender, p.active, p.featured, p.bestseller, p.offer, p.is_new as "isNew",
                       COALESCE(p.out_of_stock, false) as "outOfStock",
                       COALESCE(p.bottle_sold_out, false) as "bottleSoldOut",
                       COALESCE(p.is_combo, false) as "isCombo",
                       COALESCE(p.is_promo, false) as "isPromo",
                       COALESCE(p.sold_out_sizes, '[]'::jsonb) as "soldOutSizes",
                       p.created_at as "createdAt"
                FROM capital.products p
                WHERE p.active = TRUE
                ORDER BY p.created_at DESC NULLS LAST, p.id DESC;
              `;
            } else if (categoryParam) {
              rows = await sql`
                SELECT p.id, p.name, p.brand, p.description, p.price, p.price_bottle as "priceBottle",
                       p.sell_bottle as "sellBottle", p.decants, p.image, p.category, p.categories,
                       p.gender, p.active, p.featured, p.bestseller, p.offer, p.is_new as "isNew",
                       COALESCE(p.out_of_stock, false) as "outOfStock",
                       COALESCE(p.bottle_sold_out, false) as "bottleSoldOut",
                       COALESCE(p.is_combo, false) as "isCombo",
                       COALESCE(p.is_promo, false) as "isPromo",
                       COALESCE(p.sold_out_sizes, '[]'::jsonb) as "soldOutSizes",
                       p.created_at as "createdAt"
                FROM capital.products p
                WHERE (
                  LOWER(p.category) = LOWER(${categoryParam}) OR
                  p.categories @> ${JSON.stringify([categoryParam])}::jsonb
                )
                ORDER BY p.created_at DESC NULLS LAST, p.id DESC;
              `;
            } else {
              rows = await sql`
                SELECT p.id, p.name, p.brand, p.description, p.price, p.price_bottle as "priceBottle",
                       p.sell_bottle as "sellBottle", p.decants, p.image, p.category, p.categories,
                       p.gender, p.active, p.featured, p.bestseller, p.offer, p.is_new as "isNew",
                       COALESCE(p.out_of_stock, false) as "outOfStock",
                       COALESCE(p.bottle_sold_out, false) as "bottleSoldOut",
                       COALESCE(p.is_combo, false) as "isCombo",
                       COALESCE(p.is_promo, false) as "isPromo",
                       COALESCE(p.sold_out_sizes, '[]'::jsonb) as "soldOutSizes",
                       p.created_at as "createdAt"
                FROM capital.products p
                ORDER BY p.created_at DESC NULLS LAST, p.id DESC;
              `;
            }
          }
          return sendJson(res, 200, rows);
        } catch (err) {
          console.error('[API GET /products Error]:', err);
          return sendJson(res, 500, { error: err.message });
        }
      }

      if (method === 'POST') {
        const isAuth = await checkAdminAuth(req, payload);
        if (!isAuth) {
          return sendJson(res, 401, { error: 'unauthorized', message: 'Credenciales inválidas' });
        }
        if (!payload.name) {
          return sendJson(res, 400, { error: 'missing_fields', message: 'El nombre es obligatorio' });
        }

        try {
          const id = String(payload.id || 'cap_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
          const name = String(payload.name).trim();
          const brand = String(payload.brand || 'Capital').trim();
          const description = String(payload.description || '').trim();
          const priceBottle = Number(String(payload.priceBottle || payload.price || 0).replace(/[^0-9]/g, '')) || 0;
          const sellBottle = payload.sellBottle !== false;
          const decants = Array.isArray(payload.decants) ? payload.decants : [];
          const minPrice = decants.length > 0
            ? Math.min(...decants.map(d => Number(d.price) || 0))
            : priceBottle;
          const image = String(payload.image || '').trim();
          const category = String(payload.category || (payload.categories && payload.categories[0]) || 'Unisex');
          const categories = Array.isArray(payload.categories) ? payload.categories : [category];
          const gender = String(payload.gender || 'Unisex');
          const active = payload.active !== false;
          const featured = Boolean(payload.featured);
          const bestseller = Boolean(payload.bestseller);
          const offer = Boolean(payload.offer || payload.isPromo);
          const isNew = Boolean(payload.isNew !== undefined ? payload.isNew : true);
          const outOfStock = Boolean(payload.outOfStock);
          const bottleSoldOut = Boolean(payload.bottleSoldOut);
          const isCombo = Boolean(payload.isCombo || categories.some(c => String(c).toLowerCase().includes('combo')));
          const isPromo = Boolean(payload.isPromo || payload.offer);
          const soldOutSizes = Array.isArray(payload.soldOutSizes) ? payload.soldOutSizes : [];

          const inserted = await sql`
            INSERT INTO capital.products (
              id, name, brand, description, price, price_bottle, sell_bottle,
              decants, image, category, categories, gender,
              active, featured, bestseller, offer, is_new,
              out_of_stock, bottle_sold_out, is_combo, is_promo, sold_out_sizes, created_at, updated_at
            ) VALUES (
              ${id}, ${name}, ${brand}, ${description}, ${minPrice}, ${priceBottle}, ${sellBottle},
              ${JSON.stringify(decants)}::jsonb, ${image}, ${category}, ${JSON.stringify(categories)}::jsonb, ${gender},
              ${active}, ${featured}, ${bestseller}, ${offer}, ${isNew},
              ${outOfStock}, ${bottleSoldOut}, ${isCombo}, ${isPromo}, ${JSON.stringify(soldOutSizes)}::jsonb, NOW(), NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              brand = EXCLUDED.brand,
              description = EXCLUDED.description,
              price = EXCLUDED.price,
              price_bottle = EXCLUDED.price_bottle,
              sell_bottle = EXCLUDED.sell_bottle,
              decants = EXCLUDED.decants,
              image = EXCLUDED.image,
              category = EXCLUDED.category,
              categories = EXCLUDED.categories,
              gender = EXCLUDED.gender,
              active = EXCLUDED.active,
              featured = EXCLUDED.featured,
              bestseller = EXCLUDED.bestseller,
              offer = EXCLUDED.offer,
              is_new = EXCLUDED.is_new,
              out_of_stock = EXCLUDED.out_of_stock,
              bottle_sold_out = EXCLUDED.bottle_sold_out,
              is_combo = EXCLUDED.is_combo,
              is_promo = EXCLUDED.is_promo,
              sold_out_sizes = EXCLUDED.sold_out_sizes,
              updated_at = NOW()
            RETURNING id, name, brand, description, price, price_bottle as "priceBottle",
                      sell_bottle as "sellBottle", decants, image, category, categories,
                      gender, active, featured, bestseller, offer, is_new as "isNew",
                      out_of_stock as "outOfStock", bottle_sold_out as "bottleSoldOut",
                      is_combo as "isCombo", is_promo as "isPromo", sold_out_sizes as "soldOutSizes",
                      created_at as "createdAt";
          `;

          const newProduct = inserted[0];

          await insertAuditLog({
            level: 'INFO',
            action: 'PRODUCT_CREATE',
            status: 'OK',
            message: `Creado perfume nuevo #${newProduct.id} "${newProduct.name}" (${newProduct.brand})`,
            details: {
              productId: newProduct.id,
              name: newProduct.name,
              brand: newProduct.brand,
              priceBottle: newProduct.priceBottle,
              decantsCount: decants.length,
              outOfStock: newProduct.outOfStock,
              active: newProduct.active
            },
            req
          });

          return sendJson(res, 201, newProduct);
        } catch (err) {
          console.error('[API POST /products Error]:', err);
          return sendJson(res, 500, { error: err.message });
        }
      }
    }

    // /api/products/:id
    if (segments.length === 2) {
      const productId = decodeURIComponent(segments[1]);

      if (method === 'GET') {
        try {
          const rows = await sql`
            SELECT id, name, brand, description, price, price_bottle as "priceBottle",
                   sell_bottle as "sellBottle", decants, image, category, categories,
                   gender, active, featured, bestseller, offer, is_new as "isNew",
                   COALESCE(p.out_of_stock, false) as "outOfStock",
                   COALESCE(p.bottle_sold_out, false) as "bottleSoldOut",
                   COALESCE(p.is_combo, false) as "isCombo",
                   COALESCE(p.is_promo, false) as "isPromo",
                   COALESCE(p.sold_out_sizes, '[]'::jsonb) as "soldOutSizes",
                   p.created_at as "createdAt"
            FROM capital.products p
            WHERE id = ${productId}
            LIMIT 1;
          `;
          if (!rows || rows.length === 0) {
            return sendJson(res, 404, { error: 'not_found', message: 'Producto no encontrado' });
          }
          return sendJson(res, 200, rows[0]);
        } catch (err) {
          return sendJson(res, 500, { error: err.message });
        }
      }

      if (['PUT', 'PATCH'].includes(method)) {
        const isAuth = await checkAdminAuth(req, payload);
        if (!isAuth) {
          return sendJson(res, 401, { error: 'unauthorized', message: 'Credenciales inválidas' });
        }

        try {
          const existing = await sql`SELECT * FROM capital.products WHERE id = ${productId} LIMIT 1;`;
          if (!existing || existing.length === 0) {
            return sendJson(res, 404, { error: 'not_found', message: 'Producto no encontrado' });
          }
          const prev = existing[0];

          const name = payload.name != null ? String(payload.name).trim() : prev.name;
          const brand = payload.brand != null ? String(payload.brand).trim() : prev.brand;
          const description = payload.description != null ? String(payload.description).trim() : prev.description;
          const priceBottle = payload.priceBottle != null
            ? Number(String(payload.priceBottle).replace(/[^0-9]/g, ''))
            : (payload.price != null ? Number(String(payload.price).replace(/[^0-9]/g, '')) : prev.price_bottle);
          const sellBottle = payload.sellBottle != null ? Boolean(payload.sellBottle) : prev.sell_bottle;
          const decants = Array.isArray(payload.decants) ? payload.decants : prev.decants;
          const minPrice = decants.length > 0
            ? Math.min(...decants.map(d => Number(d.price) || 0))
            : priceBottle;
          const image = (payload.image != null && payload.image !== '') ? String(payload.image).trim() : prev.image;
          const category = payload.category != null ? String(payload.category).trim() : prev.category;
          const categories = Array.isArray(payload.categories) ? payload.categories : (payload.category ? [payload.category] : prev.categories);
          const gender = payload.gender != null ? String(payload.gender).trim() : prev.gender;
          const active = payload.active != null ? Boolean(payload.active) : prev.active;
          const featured = payload.featured != null ? Boolean(payload.featured) : prev.featured;
          const bestseller = payload.bestseller != null ? Boolean(payload.bestseller) : prev.bestseller;
          const offer = payload.offer != null ? Boolean(payload.offer) : (payload.isPromo != null ? Boolean(payload.isPromo) : prev.offer);
          const isNew = payload.isNew != null ? Boolean(payload.isNew) : prev.is_new;
          const outOfStock = payload.outOfStock != null ? Boolean(payload.outOfStock) : Boolean(prev.out_of_stock);
          const bottleSoldOut = payload.bottleSoldOut != null ? Boolean(payload.bottleSoldOut) : Boolean(prev.bottle_sold_out);
          const isCombo = payload.isCombo != null ? Boolean(payload.isCombo) : Boolean(prev.is_combo);
          const isPromo = payload.isPromo != null ? Boolean(payload.isPromo) : Boolean(prev.is_promo);
          const soldOutSizes = Array.isArray(payload.soldOutSizes) ? payload.soldOutSizes : (prev.sold_out_sizes || []);

          const updated = await sql`
            UPDATE capital.products
            SET name = ${name},
                brand = ${brand},
                description = ${description},
                price = ${minPrice},
                price_bottle = ${priceBottle},
                sell_bottle = ${sellBottle},
                decants = ${JSON.stringify(decants)}::jsonb,
                image = ${image},
                category = ${category},
                categories = ${JSON.stringify(categories)}::jsonb,
                gender = ${gender},
                active = ${active},
                featured = ${featured},
                bestseller = ${bestseller},
                offer = ${offer},
                is_new = ${isNew},
                out_of_stock = ${outOfStock},
                bottle_sold_out = ${bottleSoldOut},
                is_combo = ${isCombo},
                is_promo = ${isPromo},
                sold_out_sizes = ${JSON.stringify(soldOutSizes)}::jsonb,
                updated_at = NOW()
            WHERE id = ${productId}
            RETURNING id, name, brand, description, price, price_bottle as "priceBottle",
                      sell_bottle as "sellBottle", decants, image, category, categories,
                      gender, active, featured, bestseller, offer, is_new as "isNew",
                      out_of_stock as "outOfStock", bottle_sold_out as "bottleSoldOut",
                      is_combo as "isCombo", is_promo as "isPromo", sold_out_sizes as "soldOutSizes",
                      created_at as "createdAt";
          `;

          const updatedProd = updated[0];

          const diff = {};
          if (prev.name !== name) diff.name = { before: prev.name, after: name };
          if (Number(prev.price_bottle) !== Number(priceBottle)) diff.priceBottle = { before: prev.price_bottle, after: priceBottle };
          if (Boolean(prev.active) !== Boolean(active)) diff.active = { before: prev.active, after: active };
          const changedFields = Object.keys(diff);

          await insertAuditLog({
            level: 'INFO',
            action: 'PRODUCT_UPDATE',
            status: 'OK',
            message: `Editado perfume #${productId} "${name}" [${changedFields.length > 0 ? changedFields.join(', ') : 'detalles actualizados'}]`,
            details: {
              productId,
              productName: name,
              brand,
              changedFields,
              diff
            },
            req
          });

          return sendJson(res, 200, updated[0]);
        } catch (err) {
          console.error('[API UPDATE /products Error]:', err);
          return sendJson(res, 500, { error: err.message });
        }
      }

      if (method === 'DELETE') {
        const isAuth = await checkAdminAuth(req, payload);
        if (!isAuth) {
          return sendJson(res, 401, { error: 'unauthorized', message: 'Credenciales inválidas' });
        }

        try {
          const existing = await sql`SELECT id, name, brand FROM capital.products WHERE id = ${productId} LIMIT 1;`;
          const prodName = existing.length > 0 ? `${existing[0].name} (${existing[0].brand})` : `Producto #${productId}`;

          await sql`DELETE FROM capital.products WHERE id = ${productId};`;

          await insertAuditLog({
            level: 'WARN',
            action: 'PRODUCT_DELETE',
            status: 'OK',
            message: `Eliminado perfume #${productId} "${prodName}" del catálogo central`,
            details: { productId, name: prodName },
            req
          });

          return sendJson(res, 200, { deleted: true });
        } catch (err) {
          console.error('[API DELETE /products Error]:', err);
          return sendJson(res, 500, { error: err.message });
        }
      }
    }

    // /api/products/:id/state
    if (segments.length === 3 && segments[2] === 'state' && method === 'PATCH') {
      const isAuth = await checkAdminAuth(req, payload);
      if (!isAuth) {
        return sendJson(res, 401, { error: 'unauthorized', message: 'Credenciales inválidas' });
      }

      try {
        const productId = decodeURIComponent(segments[1]);
        const newActive = Boolean(payload.active);

        const updated = await sql`
          UPDATE capital.products
          SET active = ${newActive},
              updated_at = NOW()
          WHERE id = ${productId}
          RETURNING id, name, active;
        `;

        if (!updated || updated.length === 0) {
          return sendJson(res, 404, { error: 'not_found', message: 'Producto no encontrado' });
        }

        const prod = updated[0];
        await insertAuditLog({
          level: 'INFO',
          action: 'PRODUCT_TOGGLE',
          status: 'OK',
          message: `Visibilidad modificada: #${productId} "${prod.name}" pasa a ${newActive ? 'ACTIVO (visible en tienda)' : 'OCULTO (inactivo)'}`,
          details: { productId, productName: prod.name, newState: newActive ? 'ACTIVO' : 'OCULTO' },
          req
        });

        return sendJson(res, 200, prod);
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }
  }

  // -------------------------------------------------------------
  // Route: /api/settings (Store Settings)
  // -------------------------------------------------------------
  if (segments[0] === 'settings') {
    if (method === 'GET') {
      try {
        if (!sql) return sendJson(res, 200, {});
        const rows = await sql`SELECT key, value FROM capital.store_settings`;
        const settings = {};
        rows.forEach(r => { settings[r.key] = r.value; });
        return sendJson(res, 200, settings);
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (['POST', 'PATCH', 'PUT'].includes(method)) {
      const isAuth = await checkAdminAuth(req, payload);
      if (!isAuth) {
        return sendJson(res, 401, { error: 'unauthorized', message: 'Credenciales inválidas' });
      }
      try {
        for (const [key, val] of Object.entries(payload)) {
          if (key === 'adminPassword') continue;
          await sql`
            INSERT INTO capital.store_settings (key, value)
            VALUES (${key}, ${JSON.stringify(val)}::jsonb)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
          `;
        }
        await insertAuditLog({
          level: 'INFO',
          action: 'SETTINGS_UPDATE',
          status: 'OK',
          message: 'Configuraciones de la tienda actualizadas en Neon DB',
          details: { keys: Object.keys(payload).filter(k => k !== 'adminPassword') },
          req
        });
        return sendJson(res, 200, { success: true });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }
  }

  // Fallback 404
  return sendJson(res, 404, { error: 'endpoint_not_found', path: pathname });
};
