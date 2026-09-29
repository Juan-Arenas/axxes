// render.js
// Handles populating all the UI sections dynamically from dataStore.js

document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderAll();
    
    // Listen for data updates from the admin panel
    document.addEventListener('axxesDataUpdated', () => {
        renderAll();
    });
});

function renderAll() {
    if (!window.axxesStore) return;
    
    const prods = window.axxesStore.products.filter(p => p.active);

    // Update dynamic products count
    const countEl = document.getElementById('dynamic-products-count');
    if (countEl) {
        countEl.setAttribute('data-target', prods.length);
        if (countEl.innerText !== '0' && countEl.innerText !== '') {
            countEl.innerText = prods.length;
        }
    }
    
    // 1. Render Brands in sidebar filter
    const filterBrandsList = document.getElementById('filter-brands-list');
    if (filterBrandsList) {
        const uniqueBrands = [...new Set(prods.map(p => p.brand).filter(b => b))].sort();
        filterBrandsList.innerHTML = uniqueBrands.map(b => `
            <label><input type="checkbox" value="${b}" class="filter-brand"> ${b}</label>
        `).join('');
        
        // Re-bind filter events
        filterBrandsList.querySelectorAll('.filter-brand').forEach(cb => {
            cb.addEventListener('change', () => { if(window.applyFilters) window.applyFilters(); });
        });
    }
    
    // 2. Render Categories in sidebar filter (from admin-managed categories)
    const filterCategoriesList = document.getElementById('filter-categories-list');
    if (filterCategoriesList) {
        const cats = window.axxesStore.categories || [];
        filterCategoriesList.innerHTML = cats.map(c => `
            <label><input type="checkbox" value="${c.name}" class="filter-category"> ${c.name}</label>
        `).join('');
        
        filterCategoriesList.querySelectorAll('.filter-category').forEach(cb => {
            cb.addEventListener('change', () => { if(window.applyFilters) window.applyFilters(); });
        });
    }
    
    // 3. Render Size filter (collect all unique sizes from products)
    const filterSizesList = document.getElementById('filter-sizes-list');
    if (filterSizesList) {
        const allSizes = new Set();
        prods.forEach(p => {
            if (p.sellBottle) allSizes.add('bottle');
            if (Array.isArray(p.decants)) {
                p.decants.forEach(d => allSizes.add(d.size));
            }
        });
        
        const sizeArr = Array.from(allSizes);
        filterSizesList.innerHTML = sizeArr.map(s => {
            const label = s === 'bottle' ? 'Botella Completa' : s;
            return `<label><input type="checkbox" value="${s}" class="filter-size"> ${label}</label>`;
        }).join('');
        
        filterSizesList.querySelectorAll('.filter-size').forEach(cb => {
            cb.addEventListener('change', () => { if(window.applyFilters) window.applyFilters(); });
        });
    }
    
    // 4. Render Brands grid
    const brandsContainer = document.getElementById('brands-container');
    if (brandsContainer) {
        const uniqueBrands = [...new Set(prods.map(p => p.brand).filter(b => b))].sort();
        brandsContainer.innerHTML = uniqueBrands.map((b, i) => `
            <div class="brand-item reveal delay-${i % 3}" onclick="filterByBrand('${b}')">${b}</div>
        `).join('');
    }

    // Main Store Render (Initial)
    renderStoreGrid(prods);

    // Re-bind Add to Cart buttons
    bindCartButtons();
}

function filterByBrand(brand) {
    // Navigate to store section
    window.location.hash = 'catalogo-seccion';
    
    // Check the brand filter checkbox
    const checkboxes = document.querySelectorAll('.filter-brand');
    checkboxes.forEach(cb => {
        if (cb.value === brand) cb.checked = true;
        else cb.checked = false;
    });

    // Trigger filter update logic
    if (window.applyFilters) window.applyFilters();
}

function renderStoreGrid(productsToRender) {
    const storeGrid = document.getElementById('main-store-grid');
    if (!storeGrid) return;

    if (productsToRender.length === 0) {
        storeGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">No se encontraron resultados.</p>`;
        return;
    }

    storeGrid.innerHTML = productsToRender.map(p => createProductCardWithSizes(p)).join('');
    
    // Bind buttons newly added to DOM
    bindCartButtons();
    bindSizeSelectors();
}

// Create product card with dynamic size selector
function createProductCardWithSizes(p) {
    // Determine available sizes
    let sizes = [];
    
    if (Array.isArray(p.decants) && p.decants.length > 0) {
        p.decants.forEach(d => {
            sizes.push({ label: d.size, value: d.size, price: d.price });
        });
    }
    
    if (p.sellBottle !== false && p.priceBottle > 0) {
        sizes.push({ label: 'Completo', value: 'bottle', price: p.priceBottle });
    }
    
    // If no sizes configured, show bottle price
    if (sizes.length === 0) {
        sizes.push({ label: 'Completo', value: 'bottle', price: p.priceBottle || 0 });
    }
    
    // Default to first size
    const defaultSize = sizes[0];
    
    // Categories badges
    let badgeText = '';
    if (Array.isArray(p.categories) && p.categories.length > 0) {
        badgeText = p.categories[0];
    } else if (p.category) {
        badgeText = p.category;
    }
    
    // Description (optional)
    const descHtml = p.description ? `<div class="app-prod-desc">${p.description}</div>` : '';
    
    // Size buttons
    const sizeButtons = sizes.length > 1 ? `
        <div class="app-prod-sizes">
            ${sizes.map((s, i) => `
                <button class="app-size-btn ${i === 0 ? 'active' : ''}" 
                    data-size="${s.value}" 
                    data-price="${s.price}"
                    data-product-id="${p.id}">${s.label}</button>
            `).join('')}
        </div>
    ` : '';
    
    return `
        <div class="app-prod-card reveal is-visible" data-product-id="${p.id}">
            ${badgeText ? `<div class="app-prod-badge">${badgeText}</div>` : ''}
            <img src="${p.image}" alt="${p.name}">
            <div class="app-prod-brand">${p.brand || ''}</div>
            <h4 class="app-prod-name">${p.name}</h4>
            ${descHtml}
            ${sizeButtons}
            <div class="app-prod-price" data-product-id="${p.id}">$${defaultSize.price.toLocaleString('es-CO')}</div>
            <button class="app-btn-add btn-add" 
                data-id="${p.id}" 
                data-name="${p.name}" 
                data-price="${defaultSize.price}" 
                data-img="${p.image}" 
                data-size="${defaultSize.value}">
                <i class="fa-solid fa-bag-shopping"></i> AGREGAR
            </button>
        </div>
    `;
}

// Bind size selector buttons
function bindSizeSelectors() {
    document.querySelectorAll('.app-size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            const price = parseFloat(e.target.dataset.price);
            const size = e.target.dataset.size;
            
            // Update active state
            const card = e.target.closest('.app-prod-card');
            card.querySelectorAll('.app-size-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Update price display
            const priceEl = card.querySelector('.app-prod-price');
            if (priceEl) priceEl.textContent = '$' + price.toLocaleString('es-CO');
            
            // Update add button data
            const addBtn = card.querySelector('.btn-add');
            if (addBtn) {
                addBtn.dataset.price = price;
                addBtn.dataset.size = size;
            }
        });
    });
}

// Global cart binding
function bindCartButtons() {
    const addBtns = document.querySelectorAll(".btn-add");
    addBtns.forEach(btn => {
        // Prevent duplicate listeners
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        
        clone.addEventListener("click", (e) => {
            const targetBtn = e.target.closest('.btn-add');
            if (!targetBtn) return;
            const data = targetBtn.dataset;
            
            if (window.addToCart) {
                window.addToCart({
                    id: data.id,
                    name: data.name,
                    price: parseFloat(data.price),
                    img: data.img,
                    qty: 1,
                    size: data.size || 'bottle'
                });
                
                // Open cart
                const cartDrawer = document.getElementById("cart-drawer");
                const cartOverlay = document.getElementById("cart-overlay");
                if (cartDrawer && cartOverlay) {
                    cartDrawer.classList.add("open");
                    cartOverlay.classList.add("active");
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });
}

// Make functions globally available
window.renderStoreGrid = renderStoreGrid;
window.filterByBrand = filterByBrand;
