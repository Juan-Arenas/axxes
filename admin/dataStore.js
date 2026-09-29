class DataStore {
    constructor() {
        this.version = "v2";
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

            this.products = p ? JSON.parse(p) : this.migrateProducts(window.INITIAL_PRODUCTS);
            this.categories = c ? JSON.parse(c) : window.INITIAL_CATEGORIES;
            this.siteConfig = s ? JSON.parse(s) : window.INITIAL_SITE_CONFIG;
            
            // Save to ensure initial state is persisted if empty
            if (!p || !c || !s) {
                this.saveAll();
            }
        } catch (e) {
            console.error("Error loading data", e);
            this.products = this.migrateProducts(window.INITIAL_PRODUCTS);
            this.categories = window.INITIAL_CATEGORIES;
            this.siteConfig = window.INITIAL_SITE_CONFIG;
        }
    }
    
    // Migrate old product format to new format
    migrateProducts(products) {
        return products.map(p => {
            // Convert old decants object to array format
            let decants = [];
            if (Array.isArray(p.decants)) {
                decants = p.decants;
            } else if (p.decants && typeof p.decants === 'object') {
                // Old format: { "5ml": 35000, "10ml": 55000, "30ml": 110000 }
                Object.entries(p.decants).forEach(([size, price]) => {
                    if (price > 0) {
                        decants.push({ size, price });
                    }
                });
            }
            
            // Convert single category to categories array
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
                gender: p.gender || 'Unisex'
            };
        });
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

    saveCategories() {
        localStorage.setItem(this.keys.categories, JSON.stringify(this.categories));
        document.dispatchEvent(new CustomEvent('axxesDataUpdated'));
    }
    
    saveSiteConfig() {
        localStorage.setItem(this.keys.siteConfig, JSON.stringify(this.siteConfig));
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

    // CRUD Categories
    addCategory(name) {
        if (!this.categories.some(c => c.name === name)) {
            this.categories.push({ id: 'cat-' + Date.now(), name: name });
            this.saveCategories();
        }
    }

    deleteCategory(name) {
        this.categories = this.categories.filter(c => c.name !== name);
        this.saveCategories();
    }
    
    updateCategory(oldName, newName) {
        const cat = this.categories.find(c => c.name === oldName);
        if (cat) {
            cat.name = newName;
            // Update all products that had the old category
            this.products.forEach(p => {
                if (Array.isArray(p.categories)) {
                    const idx = p.categories.indexOf(oldName);
                    if (idx !== -1) p.categories[idx] = newName;
                }
                if (p.category === oldName) p.category = newName;
            });
            this.saveAll();
        }
    }
    
    // Logo update
    updateLogo(base64) {
        this.siteConfig.logo = base64;
        this.saveSiteConfig();
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
