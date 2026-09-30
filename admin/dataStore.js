// dataStore.js — Robust Unified Storage with IndexedDB, LocalStorage, Image Compression & GitHub Cloud Sync

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
        
        // If it's already a small string URL (e.g. unsplash, http, etc.)
        if (typeof fileOrDataUrl === 'string' && !fileOrDataUrl.startsWith('data:image')) {
            resolve(fileOrDataUrl);
            return;
        }

        const processImage = (src) => {
            const img = new Image();
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
                
                // Solid white background for clean transparency handling
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
            reader.onerror = () => reject(new Error("Error leyendo el archivo"));
            reader.readAsDataURL(fileOrDataUrl);
        }
    });
};

// 3. DataStore Engine
class DataStore {
    constructor() {
        this.version = "v2";
        this.keys = {
            products: `axxes_products_${this.version}`,
            categories: `axxes_categories_${this.version}`,
            siteConfig: `axxes_site_config_${this.version}`,
            token: `axxes_github_token`,
            autoSync: `axxes_auto_sync_enabled`,
            hasUnsynced: `axxes_has_unsynced_changes`
        };
        this.idb = new AxxesIDB();
        this.products = [];
        this.categories = [];
        this.siteConfig = {};
        this.isLoadedFromIDB = false;

        // 1. Initial fast synchronous load (localStorage or initial bundle)
        this.loadSyncData();

        // 2. Asynchronous deep check against IndexedDB (recovers any data lost from localStorage quotas)
        this.loadFromIDB();

        // 3. Live cloud check (fetches newest catalog for all visitors)
        this.syncFromLiveCloud();
    }

    loadSyncData() {
        try {
            const p = localStorage.getItem(this.keys.products);
            const c = localStorage.getItem(this.keys.categories);
            const s = localStorage.getItem(this.keys.siteConfig);

            const initialProds = Array.isArray(window.INITIAL_PRODUCTS) ? window.INITIAL_PRODUCTS : [];
            const initialCats = Array.isArray(window.INITIAL_CATEGORIES) ? window.INITIAL_CATEGORIES : [];

            this.products = p ? JSON.parse(p) : this.migrateProducts(initialProds);
            this.categories = c ? JSON.parse(c) : initialCats;
            this.siteConfig = s ? JSON.parse(s) : (window.INITIAL_SITE_CONFIG || {});
            
            if (!p || !c || !s) {
                this.saveAll();
            }
        } catch (e) {
            console.warn("Aviso en carga inicial localStorage, usando valores por defecto", e);
            const initialProds = Array.isArray(window.INITIAL_PRODUCTS) ? window.INITIAL_PRODUCTS : [];
            this.products = this.migrateProducts(initialProds);
            this.categories = Array.isArray(window.INITIAL_CATEGORIES) ? window.INITIAL_CATEGORIES : [];
            this.siteConfig = window.INITIAL_SITE_CONFIG || {};
        }
    }

    async loadFromIDB() {
        try {
            const idbProducts = await this.idb.get('products');
            const idbCategories = await this.idb.get('categories');
            const idbSiteConfig = await this.idb.get('siteConfig');

            let updated = false;

            // If IndexedDB has more products or newer products than localStorage (or localStorage was quota-capped)
            if (Array.isArray(idbProducts) && idbProducts.length >= this.products.length && idbProducts.length > 0) {
                this.products = this.migrateProducts(idbProducts);
                updated = true;
            }

            if (Array.isArray(idbCategories) && idbCategories.length > 0) {
                this.categories = idbCategories;
                updated = true;
            }

            if (idbSiteConfig && Object.keys(idbSiteConfig).length > 0) {
                this.siteConfig = idbSiteConfig;
                updated = true;
            }

            this.isLoadedFromIDB = true;

            if (updated) {
                // Ensure localStorage is updated safely
                this.safeLocalStorageSave();
                document.dispatchEvent(new CustomEvent('axxesDataUpdated'));
            }
        } catch (e) {
            console.warn("Aviso en IndexedDB check", e);
        }
    }

    async syncFromLiveCloud() {
        // Fetch raw GitHub file with cache busting to guarantee all visitors see new products
        try {
            const url = `https://raw.githubusercontent.com/Juan-Arenas/axxes/master/data/products.js?_t=${Date.now()}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                const text = await res.text();
                const match = text.match(/window\.INITIAL_PRODUCTS\s*=\s*(\[[\s\S]*?\])\s*;/);
                if (match && match[1]) {
                    const cloudProducts = JSON.parse(match[1]);
                    const hasUnsavedEdits = localStorage.getItem(this.keys.hasUnsynced);
                    
                    // If user is visitor or has no pending local admin edits, or cloud has more items
                    if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
                        if (!hasUnsavedEdits || cloudProducts.length > this.products.length) {
                            this.products = this.migrateProducts(cloudProducts);
                            await this.saveAll(false); // Don't trigger cloud commit loop
                            document.dispatchEvent(new CustomEvent('axxesDataUpdated'));
                        }
                    }
                }
            }

            // Sync categories as well
            const catUrl = `https://raw.githubusercontent.com/Juan-Arenas/axxes/master/data/categories.js?_t=${Date.now()}`;
            const catRes = await fetch(catUrl, { cache: 'no-store' });
            if (catRes.ok) {
                const catText = await catRes.text();
                const catMatch = catText.match(/window\.INITIAL_CATEGORIES\s*=\s*(\[[\s\S]*?\])\s*;/);
                if (catMatch && catMatch[1]) {
                    const cloudCats = JSON.parse(catMatch[1]);
                    if (Array.isArray(cloudCats) && cloudCats.length > 0) {
                        this.categories = cloudCats;
                        await this.saveCategories(false);
                        document.dispatchEvent(new CustomEvent('axxesDataUpdated'));
                    }
                }
            }
        } catch (e) {
            // Offline or rate-limited; gracefully keep current data
        }
    }

    migrateProducts(products) {
        if (!Array.isArray(products)) return [];
        return products.map(p => {
            let decants = [];
            if (Array.isArray(p.decants)) {
                decants = p.decants;
            } else if (p.decants && typeof p.decants === 'object') {
                Object.entries(p.decants).forEach(([size, price]) => {
                    const numPrice = parseFloat(price);
                    if (numPrice > 0) {
                        decants.push({ size, price: numPrice });
                    }
                });
            }
            
            let categories = [];
            if (Array.isArray(p.categories)) {
                categories = p.categories;
            } else if (p.category) {
                categories = [p.category];
            }
            
            return {
                ...p,
                decants: decants,
                categories: categories,
                category: categories[0] || p.category || '',
                sellBottle: p.sellBottle !== undefined ? p.sellBottle : true,
                description: p.description || '',
                gender: p.gender || 'Unisex',
                active: p.active !== undefined ? p.active : true,
                featured: Boolean(p.featured),
                bestseller: Boolean(p.bestseller),
                offer: Boolean(p.offer),
                isNew: Boolean(p.isNew),
                priceBottle: parseFloat(p.priceBottle) || 0
            };
        });
    }

    // Save with dual protection: localStorage (synchronous, instant) + IndexedDB (unlimited background)
    async saveAll(markUnsynced = true) {
        // 1. Immediately save to localStorage synchronously so no refresh can lose data
        this.safeLocalStorageSave();

        if (markUnsynced) {
            try { localStorage.setItem(this.keys.hasUnsynced, 'true'); } catch(e) {}
            this.handleAutoSync();
        }

        document.dispatchEvent(new CustomEvent('axxesDataUpdated'));

        // 2. Persist full copy to IndexedDB in background
        if (this.idb) {
            try {
                await this.idb.set('products', this.products);
                await this.idb.set('categories', this.categories);
                await this.idb.set('siteConfig', this.siteConfig);
            } catch(e) {}
        }
    }

    async saveProducts(markUnsynced = true) {
        // 1. Immediately save to localStorage synchronously
        this.safeLocalStorageSave();

        if (markUnsynced) {
            try { localStorage.setItem(this.keys.hasUnsynced, 'true'); } catch(e) {}
            this.handleAutoSync();
        }

        document.dispatchEvent(new CustomEvent('axxesDataUpdated'));

        // 2. Persist full copy to IndexedDB in background
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
            try { localStorage.setItem(this.keys.hasUnsynced, 'true'); } catch(e) {}
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
            try { localStorage.setItem(this.keys.hasUnsynced, 'true'); } catch(e) {}
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
            console.warn("LocalStorage quota alcanzada, datos asegurados en IndexedDB", e);
            // If quota is exceeded, strip giant strings for localStorage fallback while IndexedDB keeps everything
            try {
                const lightweightProducts = this.products.map(p => ({
                    ...p,
                    // If image is huge base64, truncate for localStorage fallback only
                    image: (p.image && p.image.length > 500000) ? '' : p.image
                }));
                localStorage.setItem(this.keys.products, JSON.stringify(lightweightProducts));
            } catch (innerErr) {
                // IndexedDB remains intact and safe!
            }
        }
    }

    // CRUD Products
    async addProduct(product) {
        this.products.push(product);
        await this.saveProducts();
    }

    async addProductsBulk(productsArray) {
        if (!Array.isArray(productsArray) || productsArray.length === 0) return 0;
        this.products.push(...productsArray);
        await this.saveProducts();
        return productsArray.length;
    }

    async updateProduct(id, updatedData) {
        const idx = this.products.findIndex(p => p.id === id);
        if (idx !== -1) {
            this.products[idx] = { ...this.products[idx], ...updatedData };
            await this.saveProducts();
        }
    }

    async deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        await this.saveProducts();
    }

    // CRUD Categories
    async addCategory(name) {
        if (!this.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            this.categories.push({ id: 'cat-' + Date.now(), name: name });
            await this.saveCategories();
        }
    }

    async deleteCategory(name) {
        this.categories = this.categories.filter(c => c.name !== name);
        await this.saveCategories();
    }
    
    async updateCategory(oldName, newName) {
        const cat = this.categories.find(c => c.name === oldName);
        if (cat) {
            cat.name = newName;
            this.products.forEach(p => {
                if (Array.isArray(p.categories)) {
                    const idx = p.categories.indexOf(oldName);
                    if (idx !== -1) p.categories[idx] = newName;
                }
                if (p.category === oldName) p.category = newName;
            });
            await this.saveAll();
        }
    }
    
    // Logo update
    async updateLogo(base64) {
        this.siteConfig.logo = base64;
        await this.saveSiteConfig();
    }

    // Automatic GitHub background sync if token exists and auto-sync is on
    async handleAutoSync() {
        const token = localStorage.getItem(this.keys.token);
        const autoSync = localStorage.getItem(this.keys.autoSync) !== 'false'; // default true
        if (token && autoSync) {
            // Debounce sync slightly to avoid rapid fire when saving
            clearTimeout(this._syncDebounce);
            this._syncDebounce = setTimeout(async () => {
                try {
                    const res = await this.publishToGithub(token);
                    if (res.success) {
                        localStorage.removeItem(this.keys.hasUnsynced);
                        document.dispatchEvent(new CustomEvent('axxesGithubSynced', { detail: { success: true } }));
                    }
                } catch(e) {
                    console.warn("Auto-sync error", e);
                }
            }, 1200);
        }
    }

    // Export / Import
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
                return { success: true, pCount: this.products.length, cCount: this.categories.length, date: backup.timestamp };
            }
            return { success: false, error: "El archivo no contiene un formato de catálogo válido" };
        } catch(e) {
            return { success: false, error: e.message };
        }
    }

    // --- GITHUB SYNC (PUBLISH TO PRODUCTION) ---
    async publishToGithub(token) {
        const repo = "Juan-Arenas/axxes";
        try {
            if (!token) throw new Error("Token de GitHub no configurado");

            // 1. Update data/products.js
            const productsContent = `window.INITIAL_PRODUCTS = ${JSON.stringify(this.products, null, 2)};\n`;
            await this.commitFile(token, repo, 'data/products.js', productsContent, 'Admin: Update products');
            
            // 2. Update data/categories.js
            const catsContent = `window.INITIAL_CATEGORIES = ${JSON.stringify(this.categories, null, 2)};\n`;
            await this.commitFile(token, repo, 'data/categories.js', catsContent, 'Admin: Update categories');

            localStorage.removeItem(this.keys.hasUnsynced);
            return { success: true };
        } catch (e) {
            console.error("Error al sincronizar con GitHub", e);
            return { success: false, error: e.message };
        }
    }

    async commitFile(token, repo, path, content, message) {
        const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=master&_t=${Date.now()}`;
        const authHeader = (token.startsWith('ghp_') || token.startsWith('github_pat_')) ? `Bearer ${token}` : `token ${token}`;

        // 1. Get current file SHA
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

        // 2. Encode UTF-8 content to Base64 safely
        const base64Content = window.btoa(unescape(encodeURIComponent(content)));

        // 3. Put new content
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
