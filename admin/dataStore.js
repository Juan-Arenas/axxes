// dataStore.js - Robust Unified Storage with IndexedDB, LocalStorage, Image Compression, GitHub Cloud Sync & Developer Activity Logger

// Helper: Safely encode UTF-8 string to Base64 (supporting multi-MB large files without stack overflow)
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
    constructor(dbName = 'AxxesStoreDB', storeName = 'store') {
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

// 2. High-Performance Canvas Image Compressor (Reduces 8MB photos to ~50KB WebP/JPEG)
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

// 3. DataStore Engine with Developer Activity Logger
class DataStore {
    constructor() {
        this.version = 'v2';
        this.keys = {
            products: `axxes_products_${this.version}`,
            categories: `axxes_categories_${this.version}`,
            siteConfig: `axxes_site_config_${this.version}`,
            token: 'axxes_github_token',
            autoSync: 'axxes_auto_sync_enabled',
            hasUnsynced: 'axxes_has_unsynced_changes',
            deletedIds: 'axxes_deleted_ids',
            lastEdit: 'axxes_last_local_edit',
            logs: 'axxes_system_logs_v1'
        };
        this.idb = new AxxesIDB();
        this.products = [];
        this.categories = [];
        this.siteConfig = {};
        this.logs = this.loadLogs();
        this.isLoadedFromIDB = false;

        // Initial log on boot
        this.addLog('info', 'SYSTEM_BOOT', 'Sistema Axxes DataStore iniciado correctamente.', { version: this.version }, 'OK');

        // 1. Initial fast synchronous load
        this.loadSyncData();

        // 2. Asynchronous deep check against IndexedDB
        this.loadFromIDB();

        // 3. Live cloud check
        this.syncFromLiveCloud();
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
        const timeFormatted = now.toLocaleTimeString('es-CO', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
        const entry = {
            id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            timestamp: now.toISOString(),
            timeFormatted: timeFormatted,
            level: level, // 'success' | 'error' | 'warn' | 'info'
            action: action,
            message: String(message || ''),
            details: details,
            status: status || (level === 'error' ? 'FAILED' : 'OK')
        };

        if (!Array.isArray(this.logs)) this.logs = [];
        this.logs.unshift(entry);
        if (this.logs.length > 300) {
            this.logs = this.logs.slice(0, 300);
        }

        this.saveLogs();
        document.dispatchEvent(new CustomEvent('axxesLogAdded', { detail: entry }));
        return entry;
    }

    clearLogs() {
        this.logs = [];
        this.saveLogs();
        this.addLog('info', 'CLEAR_LOGS', 'Registro de logs limpiado por el administrador.', null, 'OK');
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

    // Deduplication Engine: Detects and unifies perfumes with identical name + brand
    findDuplicates() {
        const counts = {};
        const duplicates = [];
        this.products.forEach(p => {
            const normName = (p.name || '').trim().toLowerCase().replace(/myslf/g, 'myself');
            const normBrand = (p.brand || 'AXXES').trim().toLowerCase();
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
            const normBrand = (p.brand || 'AXXES').trim().toLowerCase();
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
            this.addLog('info', 'AUTO_DEDUPLICATE', `Deduplicación automática: se eliminaron ${dupesCount} productos repetidos del catálogo.`, { removedCount: dupesCount }, 'OK');
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

            const rawProds = p ? JSON.parse(p) : initialProds;
            this.products = this.migrateProducts(rawProds);
            
            // Clean any duplicates that might have been stored previously
            this.deduplicateProducts(false);

            const deletedIds = this.getDeletedIds();
            if (deletedIds.length > 0) {
                this.products = this.products.filter(item => !deletedIds.includes(String(item.id)));
            }

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
            this.addLog('warn', 'LOCAL_STORAGE_WARN', 'No se pudo leer localStorage por completo, usando valores iniciales.', { error: e.message }, 'WARN');
        }
    }

    async loadFromIDB() {
        try {
            const idbProducts = await this.idb.get('products');
            const idbCategories = await this.idb.get('categories');
            const idbSiteConfig = await this.idb.get('siteConfig');

            let updated = false;
            const deletedIds = this.getDeletedIds();

            if (Array.isArray(idbProducts) && idbProducts.length > 0) {
                const filteredIDB = idbProducts.filter(item => !deletedIds.includes(String(item.id)));
                
                // If local in-memory products is empty, recover from IDB
                if (this.products.length === 0 && filteredIDB.length > 0) {
                    this.products = this.migrateProducts(filteredIDB);
                    this.deduplicateProducts(false);
                    updated = true;
                } else {
                    // Enrich in-memory products with any high-res images from IDB if localStorage stripped them
                    this.products.forEach(p => {
                        if (!p.image || p.image.length === 0) {
                            const match = filteredIDB.find(ip => String(ip.id) === String(p.id));
                            if (match && match.image) {
                                p.image = match.image;
                                updated = true;
                            }
                        }
                    });
                }
            }

            if (Array.isArray(idbCategories) && idbCategories.length > 0 && this.categories.length === 0) {
                this.categories = idbCategories;
                updated = true;
            }

            if (idbSiteConfig && Object.keys(idbSiteConfig).length > 0 && Object.keys(this.siteConfig).length === 0) {
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

    async syncFromLiveCloud() {
        try {
            const hasUnsavedEdits = localStorage.getItem(this.keys.hasUnsynced) === 'true';
            const lastLocalEdit = parseInt(localStorage.getItem(this.keys.lastEdit) || '0', 10);
            const lastPublish = parseInt(localStorage.getItem('axxes_last_published_time') || '0', 10);
            const timeSinceRecentActivity = Date.now() - Math.max(lastLocalEdit, lastPublish);
            
            // If the admin user has uncommitted edits OR has worked/published in the last 15 minutes,
            // DO NOT overwrite local state with stale Fastly/GitHub raw CDN caches!
            if (hasUnsavedEdits || timeSinceRecentActivity < 15 * 60 * 1000) {
                return;
            }

            const deletedIds = this.getDeletedIds();

            // 1. Sync Products
            const url = `https://raw.githubusercontent.com/Juan-Arenas/axxes/master/data/products.js?_t=${Date.now()}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                const text = await res.text();
                const match = text.match(/window\.INITIAL_PRODUCTS\s*=\s*(\[[\s\S]*?\])\s*;/);
                if (match && match[1]) {
                    const cloudProducts = JSON.parse(match[1]);
                    
                    if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
                        const validCloud = cloudProducts.filter(p => !deletedIds.includes(String(p.id)));
                        const migratedCloud = this.migrateProducts(validCloud);

                        // Deduplicate cloud list
                        const seen = new Set();
                        const uniqueCloud = [];
                        migratedCloud.forEach(p => {
                            const normKey = `${(p.brand || '').trim().toLowerCase()}:::${(p.name || '').trim().toLowerCase().replace(/myslf/g, 'myself')}`;
                            if (!seen.has(normKey)) {
                                seen.add(normKey);
                                uniqueCloud.push(p);
                            }
                        });
                        
                        // Only overwrite if this.products is empty (e.g. pure visitor on new device)
                        if (this.products.length === 0) {
                            this.products = uniqueCloud;
                            await this.saveAll(false);
                            document.dispatchEvent(new CustomEvent('axxesDataUpdated'));
                            this.addLog('info', 'CLOUD_SYNC_FETCH', `Sincronización en vivo: ${this.products.length} productos obtenidos de GitHub.`, null, 'OK');
                        }
                    }
                }
            }

            // 2. Sync Categories
            const catUrl = `https://raw.githubusercontent.com/Juan-Arenas/axxes/master/data/categories.js?_t=${Date.now()}`;
            const catRes = await fetch(catUrl, { cache: 'no-store' });
            if (catRes.ok) {
                const catText = await catRes.text();
                const catMatch = catText.match(/window\.INITIAL_CATEGORIES\s*=\s*(\[[\s\S]*?\])\s*;/);
                if (catMatch && catMatch[1]) {
                    const cloudCats = JSON.parse(catMatch[1]);
                    if (Array.isArray(cloudCats) && cloudCats.length > 0 && !hasUnsavedEdits) {
                        const existingNames = new Set(this.categories.map(c => c.name.toLowerCase()));
                        let added = false;
                        cloudCats.forEach(cc => {
                            if (!existingNames.has(cc.name.toLowerCase())) {
                                this.categories.push(cc);
                                existingNames.add(cc.name.toLowerCase());
                                added = true;
                            }
                        });
                        if (added) {
                            await this.saveCategories(false);
                            document.dispatchEvent(new CustomEvent('axxesDataUpdated'));
                        }
                    }
                }
            }
        } catch (e) {
            // Offline or rate-limited
        }
    }

    migrateProducts(products) {
        if (!Array.isArray(products)) return [];
        return products.map(p => {
            let decants = [];
            if (Array.isArray(p.decants)) {
                decants = p.decants.map(d => ({
                    size: String(d.size || '').trim().toUpperCase(),
                    price: parseFloat(d.price) || 0
                }));
            } else if (p.decants && typeof p.decants === 'object') {
                Object.entries(p.decants).forEach(([size, price]) => {
                    const numPrice = parseFloat(price);
                    if (numPrice > 0) {
                        decants.push({ size: String(size).trim().toUpperCase(), price: numPrice });
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
            
            return {
                ...p,
                id: String(p.id || ('axx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4))),
                name: String(p.name || '').trim(),
                brand: String(p.brand || 'AXXES').trim().toUpperCase(),
                decants: decants,
                categories: categories,
                category: categories[0] || 'Unisex',
                sellBottle: p.sellBottle !== undefined ? p.sellBottle : true,
                description: p.description || '',
                gender: p.gender || 'Unisex',
                active: p.active !== undefined ? p.active : true,
                featured: Boolean(p.featured),
                bestseller: Boolean(p.bestseller),
                offer: Boolean(p.offer),
                isNew: Boolean(p.isNew),
                priceBottle: parseFloat(p.priceBottle) || 0,
                image: p.image || ''
            };
        });
    }

    async saveAll(markUnsynced = true) {
        this.safeLocalStorageSave();

        if (markUnsynced) {
            try { 
                localStorage.setItem(this.keys.hasUnsynced, 'true'); 
                localStorage.setItem(this.keys.lastEdit, Date.now().toString());
            } catch(e) {}
            this.handleAutoSync();
        }

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

        if (markUnsynced) {
            try { 
                localStorage.setItem(this.keys.hasUnsynced, 'true'); 
                localStorage.setItem(this.keys.lastEdit, Date.now().toString());
            } catch(e) {}
            this.handleAutoSync();
        }

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

        if (markUnsynced) {
            try { 
                localStorage.setItem(this.keys.hasUnsynced, 'true'); 
                localStorage.setItem(this.keys.lastEdit, Date.now().toString());
            } catch(e) {}
            this.handleAutoSync();
        }

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

        if (markUnsynced) {
            try { 
                localStorage.setItem(this.keys.hasUnsynced, 'true'); 
                localStorage.setItem(this.keys.lastEdit, Date.now().toString());
            } catch(e) {}
            this.handleAutoSync();
        }

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
            console.warn('LocalStorage quota alcanzada, datos asegurados en IndexedDB', e);
            this.addLog('warn', 'STORAGE_QUOTA', 'Límite de LocalStorage alcanzado. Guardando copia aligerada en IDB.', null, 'WARN');
            try {
                const lightweightProducts = this.products.map(p => ({
                    ...p,
                    image: (p.image && p.image.length > 300000) ? '' : p.image
                }));
                localStorage.setItem(this.keys.products, JSON.stringify(lightweightProducts));
            } catch (innerErr) {}
        }
    }

    // CRUD Products with Logging & Anti-Duplication Protection
    async addProduct(product) {
        const migrated = this.migrateProducts([product])[0];
        
        // Prevent duplicate creation if a product with the same name and brand already exists
        const normName = (migrated.name || '').trim().toLowerCase().replace(/myslf/g, 'myself');
        const normBrand = (migrated.brand || '').trim().toLowerCase();
        
        const existingIdx = this.products.findIndex(p => {
            const pNorm = (p.name || '').trim().toLowerCase().replace(/myslf/g, 'myself');
            const pBrand = (p.brand || '').trim().toLowerCase();
            return pNorm === normName && pBrand === normBrand;
        });

        if (existingIdx !== -1 && String(this.products[existingIdx].id) !== String(migrated.id)) {
            // Update existing instead of creating duplicate clone
            this.addLog('info', 'DEDUPLICATE_UPDATE', `El perfume "${migrated.name}" ya existía en el inventario. Se actualizaron sus datos en lugar de duplicarlo.`, { existingId: this.products[existingIdx].id }, 'OK');
            return await this.updateProduct(this.products[existingIdx].id, migrated);
        }

        this.removeDeletedId(migrated.id);
        this.products.unshift(migrated);
        await this.saveProducts(true);

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
        migrated.forEach(p => {
            const normName = (p.name || '').trim().toLowerCase().replace(/myslf/g, 'myself');
            const normBrand = (p.brand || '').trim().toLowerCase();
            
            const existingIdx = this.products.findIndex(ep => {
                const epNorm = (ep.name || '').trim().toLowerCase().replace(/myslf/g, 'myself');
                const epBrand = (ep.brand || '').trim().toLowerCase();
                return epNorm === normName && epBrand === normBrand;
            });

            if (existingIdx !== -1) {
                // Update existing product without creating clone
                this.products[existingIdx] = { ...this.products[existingIdx], ...p, id: this.products[existingIdx].id };
            } else {
                this.removeDeletedId(p.id);
                this.products.unshift(p);
                addedCount++;
            }
        });

        await this.saveProducts(true);

        this.addLog('success', 'BULK_IMPORT', `Carga masiva: ${addedCount} productos nuevos agregados (existentes actualizados sin duplicar).`, {
            count: addedCount,
            sample: migrated.slice(0, 4).map(p => ({ id: p.id, name: p.name, brand: p.brand, price: p.priceBottle }))
        }, 'OK');

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
                differences: Object.keys(diff).length > 0 ? diff : 'Sin cambios en atributos principales (decants o foto modificados)'
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

            this.addLog('info', 'TOGGLE_STATUS', `Visibilidad cambiada: "${prod.name}" ahora está ${prod.active ? 'ACTIVO' : 'OCULTO'}`, {
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
        const targetBrand = target ? (target.brand || '').trim().toLowerCase() : '';
        const targetNormName = target ? (target.name || '').trim().toLowerCase().replace(/myslf/g, 'myself') : '';

        // Register this ID as explicitly deleted
        this.addDeletedId(strId);

        // Also identify and register any existing orphan clone IDs of this perfume
        if (targetNormName) {
            this.products.forEach(p => {
                const pNorm = (p.name || '').trim().toLowerCase().replace(/myslf/g, 'myself');
                const pBrand = (p.brand || '').trim().toLowerCase();
                if (pNorm === targetNormName && pBrand === targetBrand) {
                    this.addDeletedId(p.id);
                }
            });
        }

        // Filter out target and any duplicates
        this.products = this.products.filter(p => {
            if (String(p.id) === strId) return false;
            if (targetNormName) {
                const pNorm = (p.name || '').trim().toLowerCase().replace(/myslf/g, 'myself');
                const pBrand = (p.brand || '').trim().toLowerCase();
                if (pNorm === targetNormName && pBrand === targetBrand) return false;
            }
            return true;
        });

        // Ensure deleted state is immediately written to IndexedDB
        if (this.idb) {
            try {
                await this.idb.set('products', this.products);
            } catch(e) {}
        }

        await this.saveProducts(true);

        this.addLog('warn', 'DELETE_PRODUCT', `Producto eliminado del catálogo: "${targetName}" (#${strId})`, {
            id: strId,
            deletedProductData: target || null
        }, 'OK');
    }

    // CRUD Categories with Logging
    async addCategory(name) {
        const cleanName = String(name || '').trim();
        if (!cleanName) return;
        if (!this.categories.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
            this.categories.push({ id: 'cat-' + Date.now(), name: cleanName });
            await this.saveCategories();
            this.addLog('success', 'CREATE_CATEGORY', `Categoría creada: "${cleanName}"`, { name: cleanName }, 'OK');
        } else {
            this.addLog('warn', 'DUPLICATE_CATEGORY', `Intento de duplicar categoría existente: "${cleanName}"`, null, 'WARN');
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
        this.addLog('warn', 'DELETE_CATEGORY', `Categoría eliminada: "${name}" (productos actualizados)`, { name }, 'OK');
    }
    
    async updateCategory(oldName, newName) {
        const oldTarget = String(oldName || '').trim().toLowerCase();
        const cleanNew = String(newName || '').trim();
        const cat = this.categories.find(c => c.name.toLowerCase() === oldTarget);
        if (cat && cleanNew) {
            cat.name = cleanNew;
            this.products.forEach(p => {
                if (Array.isArray(p.categories)) {
                    const idx = p.categories.findIndex(c => c.toLowerCase() === oldTarget);
                    if (idx !== -1) p.categories[idx] = cleanNew;
                }
                if (p.category && p.category.toLowerCase() === oldTarget) {
                    p.category = cleanNew;
                }
            });
            await this.saveAll();
            this.addLog('info', 'UPDATE_CATEGORY', `Categoría renombrada: "${oldName}" ➔ "${cleanNew}"`, { oldName, cleanNew }, 'OK');
        }
    }
    
    // Logo update
    async updateLogo(base64) {
        this.siteConfig.logo = base64;
        await this.saveSiteConfig();
        this.addLog('info', 'UPDATE_LOGO', 'Logo de la tienda actualizado.', { sizeKb: Math.round(base64.length / 1024) }, 'OK');
    }

    // Automatic GitHub background sync
    async handleAutoSync() {
        const token = localStorage.getItem(this.keys.token);
        const autoSync = localStorage.getItem(this.keys.autoSync) !== 'false';
        if (token && autoSync) {
            clearTimeout(this._syncDebounce);
            this._syncDebounce = setTimeout(async () => {
                try {
                    const res = await this.publishToGithub(token);
                    if (res.success) {
                        localStorage.removeItem(this.keys.hasUnsynced);
                        document.dispatchEvent(new CustomEvent('axxesGithubSynced', { detail: { success: true } }));
                    }
                } catch(e) {
                    console.warn('Auto-sync error', e);
                }
            }, 1500);
        }
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
        a.download = `axxes-backup-${new Date().toISOString().slice(0,10)}.json`;
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

    // --- GITHUB SYNC (PUBLISH TO PRODUCTION) WITH LOGGING ---
    async publishToGithub(token) {
        const repo = 'Juan-Arenas/axxes';
        try {
            if (!token) {
                const errMsg = 'Token de GitHub no configurado';
                this.addLog('error', 'GITHUB_SYNC', errMsg, null, 'FAILED');
                throw new Error(errMsg);
            }

            // Guarantee that the catalog is 100% clean and duplicate-free before publishing
            this.deduplicateProducts(false);

            // 1. Update data/products.js
            const productsContent = `window.INITIAL_PRODUCTS = ${JSON.stringify(this.products, null, 2)};\n`;
            await this.commitFile(token, repo, 'data/products.js', productsContent, 'Admin: Update products catalog');
            
            // 2. Update data/categories.js
            const catsContent = `window.INITIAL_CATEGORIES = ${JSON.stringify(this.categories, null, 2)};\n`;
            await this.commitFile(token, repo, 'data/categories.js', catsContent, 'Admin: Update categories');

            localStorage.removeItem(this.keys.hasUnsynced);
            localStorage.setItem('axxes_last_published_time', Date.now().toString());

            this.addLog('success', 'GITHUB_SYNC', `¡Éxito! Catálogo publicado en vivo en GitHub (${repo}). Todos los visitantes verán los cambios.`, {
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
window.axxesStore = new DataStore();
