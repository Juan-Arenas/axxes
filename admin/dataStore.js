class DataStore {
    constructor() {
        this.version = "v1";
        this.keys = {
            products: `axxes_products_${this.version}`,
            categories: `axxes_categories_${this.version}`,
            siteConfig: `axxes_site_config_${this.version}`
        };
        this.products = [];
        this.categories = [];
        this.siteConfig = {};
        this.loadData();
    }

    loadData() {
        try {
            const p = localStorage.getItem(this.keys.products);
            const c = localStorage.getItem(this.keys.categories);
            const s = localStorage.getItem(this.keys.siteConfig);

            this.products = p ? JSON.parse(p) : window.INITIAL_PRODUCTS;
            this.categories = c ? JSON.parse(c) : window.INITIAL_CATEGORIES;
            this.siteConfig = s ? JSON.parse(s) : window.INITIAL_SITE_CONFIG;
            
            // Save to ensure initial state is persisted if empty
            if (!p || !c || !s) {
                this.saveAll();
            }
        } catch (e) {
            console.error("Error loading data", e);
            this.products = window.INITIAL_PRODUCTS;
            this.categories = window.INITIAL_CATEGORIES;
            this.siteConfig = window.INITIAL_SITE_CONFIG;
        }
    }

    saveAll() {
        localStorage.setItem(this.keys.products, JSON.stringify(this.products));
        localStorage.setItem(this.keys.categories, JSON.stringify(this.categories));
        localStorage.setItem(this.keys.siteConfig, JSON.stringify(this.siteConfig));
        
        // Dispatch custom event to re-render frontend
        document.dispatchEvent(new CustomEvent('axxesDataUpdated'));
    }
    
    saveProducts() {
        localStorage.setItem(this.keys.products, JSON.stringify(this.products));
        document.dispatchEvent(new CustomEvent('axxesDataUpdated'));
    }

    // CRUD Products
    addProduct(product) {
        this.products.push(product);
        this.saveProducts();
    }

    updateProduct(id, updatedData) {
        const idx = this.products.findIndex(p => p.id === id);
        if (idx !== -1) {
            this.products[idx] = { ...this.products[idx], ...updatedData };
            this.saveProducts();
        }
    }

    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveProducts();
    }

    // Backup
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
    
    importBackup(jsonString) {
        try {
            const backup = JSON.parse(jsonString);
            if (backup.products && backup.categories && backup.siteConfig) {
                // local snapshot before overriding
                localStorage.setItem(`axxes_backup_local_${Date.now()}`, JSON.stringify({
                    products: this.products,
                    categories: this.categories,
                    siteConfig: this.siteConfig
                }));

                this.products = backup.products;
                this.categories = backup.categories;
                this.siteConfig = backup.siteConfig;
                this.saveAll();
                return { success: true, pCount: this.products.length, cCount: this.categories.length, date: backup.timestamp };
            }
            return { success: false, error: "Formato inválido" };
        } catch(e) {
            return { success: false, error: e.message };
        }
    }
}

window.axxesStore = new DataStore();
