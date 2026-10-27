// dataStore.js - Unified Storage with Neon Serverless PostgreSQL, IndexedDB, LocalStorage, Image Compression & Real-Time Multi-Device Audit Logs

// Helper: Safely encode UTF-8 string to Base64
function safeUtf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const len = bytes.byteLength;
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return window.btoa(binary);
}

// 1. Lightweight Native IndexedDB Engine (Unlimited quota, zero dependencies)
class AxxesIDB {
    constructor(dbName = 'CapitalPerfumesStoreDB', storeName = 'store') {
        this.dbName = dbName;
        this.storeName = storeName;
        this.dbPromise = null;
    }

    getDB() {
        if (!this.dbPromise) {
            this.dbPromise = new Promise((resolve) => {
                if (!window.indexedDB) {
                    resolve(null);
                    return;
                }
                try {
                    const req = indexedDB.open(this.dbName, 2);
                    req.onupgradeneeded = (e) => {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains(this.storeName)) {
                            db.createObjectStore(this.storeName);
                        }
                    };
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => resolve(null);
                } catch (e) {
                    resolve(null);
                }
            });
        }
        return this.dbPromise;
    }

    async get(key) {
        try {
            const db = await this.getDB();
            if (!db) return null;
            return new Promise((resolve) => {
                const tx = db.transaction(this.storeName, 'readonly');
                const store = tx.objectStore(this.storeName);
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
                req.onerror = () => resolve(null);
            });
        } catch (e) {
            return null;
        }
    }

    async set(key, val) {
        try {
            const db = await this.getDB();
            if (!db) return false;
            return new Promise((resolve) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                store.put(val, key);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
            });
        } catch (e) {
            return false;
        }
    }
}

// 2. High-Performance Canvas Image Compressor (Reduces large photos to ~50KB WebP/JPEG)
window.compressProductImage = function(fileOrDataUrl, maxWidth = 800, maxHeight = 800, quality = 0.78) {
    return new Promise((resolve, reject) => {
        if (!fileOrDataUrl) {
            resolve('');
            return;
        }
        
        if (typeof fileOrDataUrl === 'string' && !fileOrDataUrl.startsWith('data:image')) {
            resolve(fileOrDataUrl);
            return;
        }

        const processImage = (src) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                let { width, height } = img;
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                
                let compressed = canvas.toDataURL('image/webp', quality);
                if (!compressed || !compressed.startsWith('data:image/webp')) {
                    compressed = canvas.toDataURL('image/jpeg', quality);
                }
                resolve(compressed);
            };
            img.onerror = () => resolve(src);
            img.src = src;
        };

        if (typeof fileOrDataUrl === 'string') {
            processImage(fileOrDataUrl);
        } else {
            const reader = new FileReader();
            reader.onload = (e) => processImage(e.target.result);
            reader.onerror = () => reject(new Error('Error leyendo el archivo'));
            reader.readAsDataURL(fileOrDataUrl);
        }
    });
};

// 3. Centralized API Fetcher for Neon Serverless PostgreSQL
window.fetchApi = async function(endpoint, options = {}) {
    const adminPassword = sessionStorage.getItem('admin_password') || 
                          localStorage.getItem('admin_password') || 
                          localStorage.getItem('axxes_admin_pin') || 
                          '2006';

    const defaultHeaders = {
        'Accept': 'application/json',
        'X-Admin-Password': adminPassword
    };

    if (options.body && typeof options.body === 'string' && !options.headers?.['Content-Type']) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    const mergedOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {})
        }
    };

    return fetch(endpoint, mergedOptions);
};

// Device info detection helper
function getDeviceLabel() {
    const ua = navigator.userAgent || '';
    if (/iPhone/i.test(ua)) return 'iPhone 📱';
    if (/iPad/i.test(ua)) return 'iPad 📱';
    if (/Android/i.test(ua)) return 'Android 📱';
    if (/Macintosh|Mac OS/i.test(ua)) return 'Mac 💻';
    if (/Windows/i.test(ua)) return 'Windows 💻';
    if (/Linux/i.test(ua)) return 'Linux 💻';
    return 'Web Client 🌐';
}

function sanitizeDetailsForLog(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 3) return obj;
    if (Array.isArray(obj)) return obj.map(x => sanitizeDetailsForLog(x, depth + 1));
    const clean = {};
    for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string') {
            if (v.startsWith('data:image')) {
                clean[k] = `[Foto Base64: ${(v.length / 1024).toFixed(1)} KB]`;
            } else if (v.length > 500) {
                clean[k] = v.slice(0, 500) + '...';
            } else {
                clean[k] = v;
            }
        } else if (typeof v === 'object' && v !== null) {
            clean[k] = sanitizeDetailsForLog(v, depth + 1);
        } else {
            clean[k] = v;
        }
    }
    return clean;
}

// 4. DataStore Engine with Neon PostgreSQL Realtime Sync & Live Audit Logs
class DataStore {
    constructor() {
        this.version = 'v5_neon_capital';
        this.keys = {
            products: `capital_products_${this.version}`,
            categories: `capital_categories_${this.version}`,
            siteConfig: `capital_site_config_${this.version}`,
            token: 'axxes_github_token',
            autoSync: 'axxes_auto_sync_enabled',
            hasUnsynced: 'axxes_has_unsynced_changes',
            deletedIds: 'capital_deleted_ids',
            lastEdit: 'capital_last_local_edit',
            logs: 'capital_audit_logs_v1'
        };
        this.idb = new AxxesIDB();
        this.products = [];
        this.categories = [];
        this.siteConfig = {};
        this.logs = this.loadLogs();
        this.isLoadedFromIDB = false;
        this.isNeonConnected = false;
        this._pollingInterval = null;
        this._lastProductsHash = '';

        // Initial log on boot
        this.addLog('info', 'SYSTEM_BOOT', 'Sistema Capital Perfumes DataStore iniciado.', { version: this.version }, 'OK');

        // 1. Initial synchronous load from local storage
        this.loadSyncData();

        // 2. Async initialization sequence: IDB check -> Neon Sync -> Polling
        this.initSequence();
    }

    // ================= LOGGER SUBSYSTEM =================
    loadLogs() {
        try {
            const raw = localStorage.getItem(this.keys.logs);
            return raw ? JSON.parse(raw) : [];
        } catch(e) {
            return [];
        }
    }

    saveLogs() {
        try {
            localStorage.setItem(this.keys.logs, JSON.stringify((this.logs || []).slice(0, 300)));
        } catch(e) {}
    }

    addLog(level = 'info', action = 'GENERAL', message = '', details = null, status = 'OK') {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const timeFormatted = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
        const devLabel = getDeviceLabel();
        const cleanDetails = sanitizeDetailsForLog(details && typeof details === 'object' ? details : (details ? { info: details } : {}));

        const entry = {
            id: 'cap_log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            timestamp: now.toISOString(),
            timeFormatted: timeFormatted,
            level: String(level).toUpperCase(),
            action: String(action).toUpperCase(),
            status: String(status || (level === 'error' ? 'FAILED' : 'OK')).toUpperCase(),
            message: String(message || ''),
            details: cleanDetails,
            deviceInfo: devLabel
        };

        if (!Array.isArray(this.logs)) this.logs = [];
        this.logs.unshift(entry);
        if (this.logs.length > 300) {
            this.logs = this.logs.slice(0, 300);
        }

        this.saveLogs();
        document.dispatchEvent(new CustomEvent('axxesLogAdded', { detail: entry }));

        // Send to Neon PostgreSQL central database in the background
        window.fetchApi('/api/logs', {
            method: 'POST',
            body: JSON.stringify(entry)
        }).catch(() => {});

        return entry;
    }

    async fetchRemoteLogs() {
        try {
            const res = await window.fetchApi('/api/logs?limit=300');
            if (res.ok) {
                const remoteLogs = await res.json();
                if (Array.isArray(remoteLogs) && remoteLogs.length > 0) {
                    const localLogs = this.logs || [];
                    const logMap = new Map();
                    remoteLogs.forEach(l => logMap.set(l.id, l));
                    localLogs.forEach(l => {
                        if (!logMap.has(l.id)) logMap.set(l.id, l);
                    });
                    const merged = Array.from(logMap.values());
                    merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    this.logs = merged.slice(0, 300);
                    this.saveLogs();
                    document.dispatchEvent(new CustomEvent('axxesLogAdded', { detail: { type: 'batch' } }));
                    return this.logs;
                }
            }
        } catch (e) {
            // Neon offline or network unavailable
        }
        return this.logs;
    }

    async clearLogs() {
        this.logs = [];
        this.saveLogs();
        try {
            await window.fetchApi('/api/logs', { method: 'DELETE' });
        } catch(e) {}
        this.addLog('info', 'CLEAR_LOGS', 'Registro de auditoría reiniciado por el administrador.', null, 'OK');
        document.dispatchEvent(new CustomEvent('axxesLogAdded', { detail: { action: 'CLEAR_LOGS' } }));
    }

    getDeletedIds() {
        try {
            const raw = localStorage.getItem(this.keys.deletedIds);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    addDeletedId(id) {
        try {
            const ids = this.getDeletedIds();
            const strId = String(id);
            if (!ids.includes(strId)) {
                ids.push(strId);
                localStorage.setItem(this.keys.deletedIds, JSON.stringify(ids));
            }
        } catch (e) {}
    }

    removeDeletedId(id) {
        try {
            let ids = this.getDeletedIds();
            const strId = String(id);
            ids = ids.filter(i => String(i) !== strId);
            localStorage.setItem(this.keys.deletedIds, JSON.stringify(ids));
        } catch (e) {}
    }

    findDuplicates() {
        const counts = {};
        const duplicates = [];
        this.products.forEach(p => {
            const normName = (p.name || '').trim().toLowerCase().replace(/myslf/g, 'myself');
            const normBrand = (p.brand || 'Capital').trim().toLowerCase();
            const key = `${normBrand}:::${normName}`;
            if (!counts[key]) counts[key] = [];
            counts[key].push(p);
        });
        Object.entries(counts).forEach(([key, list]) => {
            if (list.length > 1) {
                duplicates.push({ key, count: list.length, items: list });
            }
        });
        return duplicates;
    }

    deduplicateProducts(autoSave = true) {
        const seen = new Map();
        const clean = [];
        let dupesCount = 0;

        for (const p of this.products) {
            const normName = (p.name || '').trim().toLowerCase().replace(/myslf/g, 'myself');
            const normBrand = (p.brand || 'Capital').trim().toLowerCase();
            const key = `${normBrand}:::${normName}`;

            if (!seen.has(key)) {
                seen.set(key, p);
                clean.push(p);
            } else {
                dupesCount++;
                this.addDeletedId(p.id);
            }
        }

        if (dupesCount > 0) {
            this.products = clean;
            if (autoSave) {
                this.saveProducts(false);
            }
            this.addLog('info', 'AUTO_DEDUPLICATE', `Deduplicación automática: se eliminaron ${dupesCount} productos repetidos.`, { removedCount: dupesCount }, 'OK');
        }
        return dupesCount;
    }

    loadSyncData() {
        try {
            const p = localStorage.getItem(this.keys.products);
            const c = localStorage.getItem(this.keys.categories);
            const s = localStorage.getItem(this.keys.siteConfig);

            const initialProds = Array.isArray(window.INITIAL_PRODUCTS) ? window.INITIAL_PRODUCTS : [];
            const initialCats = Array.isArray(window.INITIAL_CATEGORIES) ? window.INITIAL_CATEGORIES : [];

            let rawProds;
            if (p) {
                try {
                    const parsed = JSON.parse(p);
                    rawProds = (Array.isArray(parsed) && parsed.length > 0) ? parsed : initialProds;
                } catch(e) {
                    rawProds = initialProds;
                }
            } else {
                rawProds = initialProds;
            }

            this.products = this.migrateProducts(rawProds);
            this.deduplicateProducts(false);

            this.categories = c ? JSON.parse(c) : initialCats;
            this.siteConfig = s ? JSON.parse(s) : (window.INITIAL_SITE_CONFIG || {});

            if (!p || !c || !s) {
                this.saveAll(false);
            }
        } catch (e) {
            console.warn('Aviso en carga inicial localStorage, usando valores por defecto', e);
            const initialProds = Array.isArray(window.INITIAL_PRODUCTS) ? window.INITIAL_PRODUCTS : [];
            this.products = this.migrateProducts(initialProds);
            this.deduplicateProducts(false);
            this.categories = Array.isArray(window.INITIAL_CATEGORIES) ? window.INITIAL_CATEGORIES : [];
            this.siteConfig = window.INITIAL_SITE_CONFIG || {};
        }
    }

        async initSequence() {
        await this.loadFromIDB();
        await this.initNeonSync();
        this.startRealtimePolling();
    }

    async loadFromIDB() {
        try {
            const idbProducts = await this.idb.get('products');
            const idbCategories = await this.idb.get('categories');
            const idbSiteConfig = await this.idb.get('siteConfig');

            let updated = false;

            if (Array.isArray(idbProducts) && idbProducts.length > 0) {
                const idbMap = new Map(idbProducts.map(p => [String(p.id), p]));
                
                // Merge images from IndexedDB if localStorage trimmed them
                this.products = this.products.map(p => {
                    const idbP = idbMap.get(String(p.id));
                    if (idbP && idbP.image && idbP.image.length > 50 && (!p.image || p.image.length <= 50)) {
                        updated = true;
                        return { ...p, image: idbP.image };
                    }
                    return p;
                });

// IDB product sync completed
            }

            if (Array.isArray(idbCategories) && idbCategories.length > 0 && (!this.categories || this.categories.length === 0)) {
                this.categories = idbCategories;
                updated = true;
            }

            if (idbSiteConfig && Object.keys(idbSiteConfig).length > 0 && (!this.siteConfig || Object.keys(this.siteConfig).length === 0)) {
                this.siteConfig = idbSiteConfig;
                updated = true;
            }

            this.isLoadedFromIDB = true;

            if (updated) {
                this.safeLocalStorageSave();
                document.dispatchEvent(new CustomEvent('axxesDataUpdated'));
            }
        } catch (e) {
            console.warn('Aviso en IndexedDB check', e);
        }
    }

    // ================= NEON SERVERLESS POSTGRESQL SYNC =================
    async syncPendingProducts(neonProds) {
        // Deshabilitado: Neon PostgreSQL es la unica fuente de verdad.
        // Evita resucitar productos eliminados desde otros dispositivos.
        return;
    }

    async initNeonSync() {
        try {
            // 1. Fetch live products from Neon PostgreSQL
            const resProds = await window.fetchApi('/api/products?active=false');
            if (resProds.ok) {
                const neonProds = await resProds.json();
                if (Array.isArray(neonProds)) {
                    // Neon PostgreSQL es la verdad absoluta. Si un producto no esta en Neon, fue eliminado.
                    const localMap = new Map((this.products || []).map(p => [String(p.id), p]));
                    const mergedNeonProds = neonProds.map(nP => {
                        const localP = localMap.get(String(nP.id));
                        if (localP && localP.image && localP.image.length > 50 && (!nP.image || nP.image.length <= 50)) {
                            return { ...nP, image: localP.image };
                        }
                        return nP;
                    });

                    this.products = this.migrateProducts(mergedNeonProds);
                    this.deduplicateProducts(false);
                    this.isNeonConnected = true;
                    this.safeLocalStorageSave();
                    if (this.idb) {
                        this.idb.set('products', this.products).catch(() => {});
                    }
                    this._lastProductsHash = neonProds.map(p => p.id + ':' + (p.active ? 1 : 0) + ':' + (p.out_of_stock || p.outOfStock ? 1 : 0)).join('|');
                    document.dispatchEvent(new CustomEvent('axxesDataUpdated'));
                    console.log('[Neon DB] Conectado exitosamente: ' + neonProds.length + ' perfumes sincronizados en tiempo real.');
                    this.addLog('success', 'NEON_CONNECT', 'Conectado a Neon PostgreSQL: ' + neonProds.length + ' productos sincronizados.', { count: neonProds.length }, 'OK');
                }
            }

            // 2. Fetch live categories from Neon
            const resCats = await window.fetchApi('/api/categories');
            if (resCats.ok) {
                const neonCats = await resCats.json();
                if (Array.isArray(neonCats) && neonCats.length > 0) {
                    this.categories = neonCats;
                    this.saveCategories(false);
                    document.dispatchEvent(new CustomEvent('axxesDataUpdated'));
                }
            }

            // 3. Fetch audit logs from Neon
            await this.fetchRemoteLogs();
        } catch (err) {
            console.warn('[Neon DB] No se pudo conectar a la base de datos central en inicio:', err);
            this.addLog('warn', 'NEON_OFFLINE', 'Operando con respaldo local/IndexedDB: ' + err.message, null, 'WARN');
        }
    }

    startRealtimePolling() {
        if (this._pollingInterval) clearInterval(this._pollingInterval);
        
        // Consultar cada 3.5 segundos para sincronizar al instante eliminaciones y cambios de otros dispositivos
        this._pollingInterval = setInterval(async () => {
            try {
                // Poll products
                const res = await window.fetchApi('/api/products?active=false');
                if (res.ok) {
                    const fresh = await res.json();
                    if (Array.isArray(fresh)) {
                        const freshHash = fresh.map(p => p.id + ':' + (p.active ? 1 : 0) + ':' + (p.out_of_stock || p.outOfStock ? 1 : 0)).join('|');
                        if (this._lastProductsHash && this._lastProductsHash !== freshHash) {
                            console.log('[Neon Realtime] Cambios en el inventario detectados desde otro dispositivo. Sincronizando...');
                            const localMap = new Map((this.products || []).map(p => [String(p.id), p]));
                            const mergedFresh = fresh.map(nP => {
                                const localP = localMap.get(String(nP.id));
                                if (localP && localP.image && localP.image.length > 50 && (!nP.image || nP.image.length <= 50)) {
                                    return { ...nP, image: localP.image };
                                }
                                return nP;
                            });

                            this.products = this.migrateProducts(mergedFresh);
                            this.safeLocalStorageSave();
                            if (this.idb) {
                                this.idb.set('products', this.products).catch(() => {});
                            }
                            document.dispatchEvent(new CustomEvent('axxesDataUpdated'));
                        }
                        this._lastProductsHash = freshHash;
                    }
                }

                // If Admin Panel is open, poll logs live
                const adminPanel = document.getElementById('admin-panel');
                if (adminPanel && adminPanel.style.display !== 'none') {
                    await this.fetchRemoteLogs();
                }
            } catch (e) {}
        }, 3500);
    }

    migrateProducts(products) {
        if (!Array.isArray(products)) return [];
        return products.map(p => {
            const soldOutSizes = Array.isArray(p.soldOutSizes) ? p.soldOutSizes : (Array.isArray(p.sold_out_sizes) ? p.sold_out_sizes : []);
            const outOfStock = Boolean(p.outOfStock || p.out_of_stock);
            const bottleSoldOut = Boolean(p.bottleSoldOut || p.bottle_sold_out || soldOutSizes.includes('bottle'));

            let decants = [];
            if (Array.isArray(p.decants)) {
                decants = p.decants.map(d => {
                    const sizeNorm = String(d.size || '').trim().toUpperCase();
                    const isSold = Boolean(d.soldOut || d.sold_out || soldOutSizes.includes(sizeNorm) || outOfStock);
                    return {
                        size: sizeNorm,
                        price: parseFloat(d.price) || 0,
                        soldOut: isSold
                    };
                });
            } else if (p.decants && typeof p.decants === 'object') {
                Object.entries(p.decants).forEach(([size, price]) => {
                    const numPrice = parseFloat(price);
                    if (numPrice > 0) {
                        const sizeNorm = String(size).trim().toUpperCase();
                        const isSold = Boolean(soldOutSizes.includes(sizeNorm) || outOfStock);
                        decants.push({ size: sizeNorm, price: numPrice, soldOut: isSold });
                    }
                });
            }
            
            let categories = [];
            if (Array.isArray(p.categories)) {
                categories = p.categories;
            } else if (p.category) {
                categories = [p.category];
            }
            if (categories.length === 0) categories = ['Unisex'];
            
            const isCombo = Boolean(p.isCombo || p.is_combo || categories.some(c => String(c).toLowerCase().includes('combo')));
            const isPromo = Boolean(p.isPromo || p.is_promo || p.offer);

            return {
                ...p,
                id: String(p.id || ('cap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4))),
                name: String(p.name || '').trim(),
                brand: String(p.brand || 'Capital').trim(),
                decants: decants,
                categories: categories,
                category: categories[0] || 'Unisex',
                sellBottle: p.sellBottle !== undefined ? p.sellBottle : true,
                description: p.description || '',
                gender: p.gender || 'Unisex',
                active: p.active !== undefined ? p.active : true,
                featured: Boolean(p.featured),
                bestseller: Boolean(p.bestseller),
                offer: isPromo,
                isNew: Boolean(p.isNew),
                priceBottle: parseFloat(p.priceBottle || p.price_bottle) || 0,
                image: p.image || '',
                outOfStock: outOfStock,
                bottleSoldOut: bottleSoldOut,
                isCombo: isCombo,
                isPromo: isPromo,
                soldOutSizes: soldOutSizes,
                createdAt: p.createdAt || p.created_at || (p.id && String(p.id).startsWith('cap_') ? parseInt(p.id.split('_')[1]) : 0)
            };
        });
    }

    async saveAll(markUnsynced = true) {
        this.safeLocalStorageSave();
        document.dispatchEvent(new CustomEvent('axxesDataUpdated'));

        if (this.idb) {
            try {
                await this.idb.set('products', this.products);
                await this.idb.set('categories', this.categories);
                await this.idb.set('siteConfig', this.siteConfig);
            } catch(e) {}
        }
    }

    async saveProducts(markUnsynced = true) {
        this.safeLocalStorageSave();
        document.dispatchEvent(new CustomEvent('axxesDataUpdated'));

        if (this.idb) {
            try {
                await this.idb.set('products', this.products);
            } catch(e) {}
        }
    }

    async saveCategories(markUnsynced = true) {
        try {
            localStorage.setItem(this.keys.categories, JSON.stringify(this.categories));
        } catch(e) {}

        document.dispatchEvent(new CustomEvent('axxesDataUpdated'));

        if (this.idb) {
            try {
                await this.idb.set('categories', this.categories);
            } catch(e) {}
        }
    }
    
    async saveSiteConfig(markUnsynced = true) {
        try {
            localStorage.setItem(this.keys.siteConfig, JSON.stringify(this.siteConfig));
        } catch(e) {}

        document.dispatchEvent(new CustomEvent('axxesDataUpdated'));

        if (this.idb) {
            try {
                await this.idb.set('siteConfig', this.siteConfig);
            } catch(e) {}
        }
    }

    safeLocalStorageSave() {
        try {
            localStorage.setItem(this.keys.products, JSON.stringify(this.products));
            localStorage.setItem(this.keys.categories, JSON.stringify(this.categories));
            localStorage.setItem(this.keys.siteConfig, JSON.stringify(this.siteConfig));
        } catch (e) {
            try {
                const lightweightProducts = this.products.map(p => ({
                    ...p,
                    image: (p.image && p.image.length > 300000) ? '' : p.image
                }));
                localStorage.setItem(this.keys.products, JSON.stringify(lightweightProducts));
            } catch (innerErr) {}
        }
    }

    // CRUD Products with Neon PostgreSQL Serverless Integration
    async addProduct(product) {
        const migrated = this.migrateProducts([product])[0];
        
        // Anti-duplicate protection
        const normName = (migrated.name || '').trim().toLowerCase().replace(/myslf/g, 'myself');
        const normBrand = (migrated.brand || '').trim().toLowerCase();
        
        const existingIdx = this.products.findIndex(p => {
            const pNorm = (p.name || '').trim().toLowerCase().replace(/myslf/g, 'myself');
            const pBrand = (p.brand || '').trim().toLowerCase();
            return pNorm === normName && pBrand === normBrand;
        });

        if (existingIdx !== -1 && String(this.products[existingIdx].id) !== String(migrated.id)) {
            this.addLog('info', 'DEDUPLICATE_UPDATE', `El perfume "${migrated.name}" ya existía en el inventario. Se actualizaron sus datos.`, { existingId: this.products[existingIdx].id }, 'OK');
            return await this.updateProduct(this.products[existingIdx].id, migrated);
        }

        migrated.createdAt = new Date().toISOString();
        this.removeDeletedId(migrated.id);
        this.products.unshift(migrated);
        await this.saveProducts(true);

        // Send to Neon Serverless PostgreSQL Database
        try {
            const res = await window.fetchApi('/api/products', {
                method: 'POST',
                body: JSON.stringify(migrated)
            });
            if (res.ok) {
                const saved = await res.json();
                console.log('[Neon DB] Producto creado y persistido:', saved.id);
            } else {
                const errText = await res.text();
                console.error('[Neon DB] Error al guardar en Neon:', res.status, errText);
                this.addLog('error', 'NEON_SAVE_FAILED', `Error en servidor al guardar "${migrated.name}": ${errText}`, null, 'FAILED');
                throw new Error(`Error en Neon (${res.status}): ${errText}`);
            }
        } catch (err) {
            console.error('[Neon DB] Error guardando producto en Neon:', err);
            throw err;
        }

        this.addLog('success', 'CREATE_PRODUCT', `Producto creado: "${migrated.name}" (${migrated.brand})`, {
            id: migrated.id,
            name: migrated.name,
            brand: migrated.brand,
            priceBottle: migrated.priceBottle,
            category: migrated.category,
            decantsCount: migrated.decants.length,
            active: migrated.active
        }, 'OK');

        return migrated;
    }

    async addProductsBulk(productsArray) {
        if (!Array.isArray(productsArray) || productsArray.length === 0) return 0;
        const migrated = this.migrateProducts(productsArray);
        
        let addedCount = 0;
        for (const p of migrated) {
            await this.addProduct(p);
            addedCount++;
        }

        this.addLog('success', 'BULK_IMPORT', `Carga masiva: ${addedCount} productos procesados en Neon PostgreSQL.`, { count: addedCount }, 'OK');
        return addedCount;
    }

    async updateProduct(id, updatedData) {
        const strId = String(id);
        const idx = this.products.findIndex(p => String(p.id) === strId);
        if (idx !== -1) {
            const oldProd = { ...this.products[idx] };
            const merged = { ...this.products[idx], ...updatedData, id: strId };
            this.products[idx] = this.migrateProducts([merged])[0];
            this.removeDeletedId(strId);
            await this.saveProducts(true);

            // Send to Neon PostgreSQL Database
            try {
                const res = await window.fetchApi(`/api/products/${encodeURIComponent(strId)}`, {
                    method: 'PUT',
                    body: JSON.stringify(this.products[idx])
                });
                if (!res.ok) {
                    const errText = await res.text();
                    console.error('[Neon DB] Error al actualizar en Neon:', res.status, errText);
                    this.addLog('error', 'NEON_UPDATE_FAILED', `Error en servidor al actualizar "${this.products[idx].name}": ${errText}`, null, 'FAILED');
                    throw new Error(`Error en Neon (${res.status}): ${errText}`);
                }
            } catch (err) {
                console.error('[Neon DB] Error actualizando producto en Neon:', err);
                throw err;
            }

            // Track detailed changes for the log
            const diff = {};
            ['name', 'brand', 'priceBottle', 'sellBottle', 'active', 'category', 'gender'].forEach(field => {
                if (oldProd[field] !== this.products[idx][field]) {
                    diff[field] = { before: oldProd[field], after: this.products[idx][field] };
                }
            });

            this.addLog('success', 'UPDATE_PRODUCT', `Producto editado: "${this.products[idx].name}" (#${strId})`, {
                id: strId,
                name: this.products[idx].name,
                differences: Object.keys(diff).length > 0 ? diff : 'Atributos actualizados'
            }, 'OK');

            return this.products[idx];
        } else {
            this.addLog('error', 'UPDATE_PRODUCT_NOT_FOUND', `Error al editar: no se encontró el producto #${strId}`, { targetId: strId }, 'FAILED');
        }
        return null;
    }

    async toggleProductActive(id) {
        const strId = String(id);
        const prod = this.products.find(p => String(p.id) === strId);
        if (prod) {
            prod.active = !prod.active;
            await this.saveProducts(true);

            // Send to Neon PostgreSQL
            try {
                await window.fetchApi(`/api/products/${encodeURIComponent(strId)}/state`, {
                    method: 'PATCH',
                    body: JSON.stringify({ active: prod.active })
                });
            } catch (e) {}

            this.addLog('info', 'TOGGLE_STATUS', `Visibilidad cambiada: "${prod.name}" ahora está ${prod.active ? 'ACTIVO (visible)' : 'OCULTO (inactivo)'}`, {
                id: strId,
                name: prod.name,
                newStatus: prod.active ? 'Visible en tienda' : 'Oculto'
            }, 'OK');

            return prod.active;
        }
        return false;
    }

    async deleteProduct(id) {
        const strId = String(id);
        const target = this.products.find(p => String(p.id) === strId);
        const targetName = target ? target.name : 'Desconocido';

        this.addDeletedId(strId);
        this.products = this.products.filter(p => String(p.id) !== strId);
        await this.saveProducts(true);

        // Send to Neon PostgreSQL
        try {
            await window.fetchApi(`/api/products/${encodeURIComponent(strId)}`, {
                method: 'DELETE'
            });
        } catch (err) {
            console.warn('[Neon DB] Error eliminando producto en Neon:', err);
        }

        this.addLog('warn', 'DELETE_PRODUCT', `Producto eliminado de la base de datos central: "${targetName}" (#${strId})`, {
            id: strId,
            deletedProductData: target || null
        }, 'OK');
    }

    // CRUD Categories with Neon PostgreSQL Integration
    async addCategory(name) {
        const cleanName = String(name || '').trim();
        if (!cleanName) return { created: false, synced: false };
        if (!this.categories.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
            const newCat = { id: 'cat-' + Date.now(), name: cleanName };
            this.categories.push(newCat);
            await this.saveCategories();

            let synced = false;
            try {
                const response = await window.fetchApi('/api/categories', {
                    method: 'POST',
                    body: JSON.stringify(newCat)
                });
                synced = response.ok;
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('[Neon DB] Error al sincronizar categoría:', response.status, errorText);
                    this.addLog('error', 'CATEGORY_SYNC_FAILED', `No se pudo sincronizar la categoría "${cleanName}": ${errorText}`, { name: cleanName, status: response.status }, 'FAILED');
                }
            } catch (error) {
                console.error('[Neon DB] Error al sincronizar categoría:', error);
                this.addLog('error', 'CATEGORY_SYNC_FAILED', `No se pudo sincronizar la categoría "${cleanName}": ${error.message}`, { name: cleanName }, 'FAILED');
            }

            this.addLog('success', 'CREATE_CATEGORY', `Categoría creada: "${cleanName}"`, { name: cleanName }, 'OK');
            return { created: true, synced };
        } else {
            this.addLog('warn', 'DUPLICATE_CATEGORY', `Intento de duplicar categoría existente: "${cleanName}"`, null, 'WARN');
            return { created: false, synced: true };
        }
    }

    async deleteCategory(name) {
        const target = String(name || '').trim().toLowerCase();
        this.categories = this.categories.filter(c => c.name.toLowerCase() !== target);
        this.products.forEach(p => {
            if (Array.isArray(p.categories)) {
                p.categories = p.categories.filter(c => c.toLowerCase() !== target);
                if (p.categories.length === 0) p.categories = ['Unisex'];
            }
            if (p.category && p.category.toLowerCase() === target) {
                p.category = p.categories[0] || 'Unisex';
            }
        });
        await this.saveAll();

        try {
            await window.fetchApi(`/api/categories/${encodeURIComponent(name)}`, {
                method: 'DELETE'
            });
        } catch(e) {}

        this.addLog('warn', 'DELETE_CATEGORY', `Categoría eliminada: "${name}"`, { name }, 'OK');
    }
    
    // Logo update
    async updateLogo(base64) {
        this.siteConfig.logo = base64;
        await this.saveSiteConfig();
        try {
            await window.fetchApi('/api/settings', {
                method: 'PATCH',
                body: JSON.stringify({ logo: base64 })
            });
        } catch(e) {}
        this.addLog('info', 'UPDATE_LOGO', 'Logo de la tienda actualizado.', { sizeKb: Math.round(base64.length / 1024) }, 'OK');
    }

    // Export / Import with Logging
    exportBackup() {
        const backup = {
            products: this.products,
            categories: this.categories,
            siteConfig: this.siteConfig,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `capital-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.addLog('info', 'EXPORT_BACKUP', `Copia de seguridad exportada (${this.products.length} productos, ${this.categories.length} categorías).`, null, 'OK');
    }
    
    async importBackup(jsonString) {
        try {
            const backup = JSON.parse(jsonString);
            if (backup.products && Array.isArray(backup.products)) {
                this.products = this.migrateProducts(backup.products);
                if (backup.categories && Array.isArray(backup.categories)) {
                    this.categories = backup.categories;
                }
                if (backup.siteConfig) {
                    this.siteConfig = backup.siteConfig;
                }
                await this.saveAll();

                // Sync each product into Neon
                for (const p of this.products) {
                    window.fetchApi('/api/products', {
                        method: 'POST',
                        body: JSON.stringify(p)
                    }).catch(() => {});
                }

                this.addLog('success', 'IMPORT_BACKUP', `Copia de seguridad restaurada exitosamente: ${this.products.length} productos, ${this.categories.length} categorías.`, { backupDate: backup.timestamp }, 'OK');
                return { success: true, pCount: this.products.length, cCount: this.categories.length, date: backup.timestamp };
            }
            this.addLog('error', 'IMPORT_BACKUP_FAIL', 'El archivo no contiene un formato de catálogo válido.', null, 'FAILED');
            return { success: false, error: 'El archivo no contiene un formato de catálogo válido.' };
        } catch(e) {
            this.addLog('error', 'IMPORT_BACKUP_ERROR', 'Error al leer el archivo JSON de backup: ' + e.message, { error: e.message }, 'FAILED');
            return { success: false, error: e.message };
        }
    }

    // GitHub Sync
    async publishToGithub(token) {
        const repo = 'Juan-Arenas/axxes';
        try {
            if (!token) {
                const errMsg = 'Token de GitHub no configurado';
                this.addLog('error', 'GITHUB_SYNC', errMsg, null, 'FAILED');
                throw new Error(errMsg);
            }

            this.deduplicateProducts(false);

            const productsContent = `window.INITIAL_PRODUCTS = ${JSON.stringify(this.products, null, 2)};\n`;
            await this.commitFile(token, repo, 'data/products.js', productsContent, 'Admin: Update products catalog');
            
            const catsContent = `window.INITIAL_CATEGORIES = ${JSON.stringify(this.categories, null, 2)};\n`;
            await this.commitFile(token, repo, 'data/categories.js', catsContent, 'Admin: Update categories');

            this.addLog('success', 'GITHUB_SYNC', `¡Éxito! Catálogo publicado en GitHub (${repo}).`, {
                repo: repo,
                productsCount: this.products.length,
                categoriesCount: this.categories.length,
                timestamp: new Date().toISOString()
            }, 'OK');

            return { success: true };
        } catch (e) {
            console.error('Error al sincronizar con GitHub', e);
            this.addLog('error', 'GITHUB_SYNC', 'Fallo al publicar en GitHub: ' + e.message, {
                error: e.message,
                repo: repo
            }, 'FAILED');
            return { success: false, error: e.message };
        }
    }

    async commitFile(token, repo, path, content, message) {
        const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=master&_t=${Date.now()}`;
        const authHeader = (token.startsWith('ghp_') || token.startsWith('github_pat_')) ? `Bearer ${token}` : `token ${token}`;

        const getRes = await fetch(url, {
            headers: { 
                'Authorization': authHeader, 
                'Accept': 'application/vnd.github.v3+json',
                'Cache-Control': 'no-cache'
            }
        });
        
        let sha = null;
        if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
        } else if (getRes.status !== 404) {
            throw new Error(`Error obteniendo ${path} (${getRes.status}): ${getRes.statusText}`);
        }

        const base64Content = safeUtf8ToBase64(content);

        const putBody = {
            message: message,
            content: base64Content,
            branch: 'master'
        };
        if (sha) putBody.sha = sha;

        const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: { 
                'Authorization': authHeader, 
                'Accept': 'application/vnd.github.v3+json', 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(putBody)
        });

        if (!putRes.ok) {
            const errData = await putRes.json().catch(() => ({}));
            throw new Error(`Error publicando ${path} (${putRes.status}): ${errData.message || putRes.statusText}`);
        }
    }
}

// Global store instance
window.capitalStore = window.axxesStore = new DataStore();
