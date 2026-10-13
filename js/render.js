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
    
    // Automatic deduplication guarantee
    if (typeof window.axxesStore.deduplicateProducts === 'function') {
        window.axxesStore.deduplicateProducts(false);
    }
    
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
        
        // Logical order: 5ML, 10ML, 15ML, 30ML, bottle
        const sizeOrder = {'5ML': 1, '10ML': 2, '15ML': 3, '30ML': 4, 'bottle': 5};
        const sizeArr = Array.from(allSizes).sort((a, b) => {
            const orderA = sizeOrder[a] || 99;
            const orderB = sizeOrder[b] || 99;
            return orderA - orderB;
        });

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

// Create product card with dynamic size selector and per-size stock
function createProductCardWithSizes(p) {
    const soldOutSizes = Array.isArray(p.soldOutSizes) ? p.soldOutSizes : (Array.isArray(p.sold_out_sizes) ? p.sold_out_sizes : []);
    const isGlobalSoldOut = Boolean(p.outOfStock || p.out_of_stock);

    // Determine available sizes
    let sizes = [];
    
    if (Array.isArray(p.decants) && p.decants.length > 0) {
        p.decants.forEach(d => {
            const isSold = isGlobalSoldOut || Boolean(d.soldOut || d.sold_out || soldOutSizes.includes(d.size));
            sizes.push({ label: d.size, value: d.size, price: d.price, soldOut: isSold });
        });
    }
    
    if (p.sellBottle !== false && p.priceBottle > 0) {
        const isBottleSold = isGlobalSoldOut || Boolean(p.bottleSoldOut || p.bottle_sold_out || soldOutSizes.includes('bottle'));
        sizes.push({ label: 'Botella', value: 'bottle', price: p.priceBottle, soldOut: isBottleSold });
    }
    
    // If no sizes configured, show bottle price
    if (sizes.length === 0) {
        const isBottleSold = isGlobalSoldOut || Boolean(p.bottleSoldOut || p.bottle_sold_out || soldOutSizes.includes('bottle'));
        sizes.push({ label: 'Botella', value: 'bottle', price: p.priceBottle || 0, soldOut: isBottleSold });
    }

    // Sort sizes logically: 5ML, 10ML, etc., then bottle
    const sizeOrder = {'5ML': 1, '10ML': 2, '15ML': 3, '30ML': 4, 'bottle': 5};
    sizes.sort((a, b) => (sizeOrder[a.value] || 99) - (sizeOrder[b.value] || 99));

    const isAllSoldOut = isGlobalSoldOut || sizes.every(s => s.soldOut);
    const hasPartialSoldOut = !isAllSoldOut && sizes.some(s => s.soldOut);

    // Pick first available size as default if possible
    let defaultIndex = sizes.findIndex(s => !s.soldOut);
    if (defaultIndex === -1) defaultIndex = 0;
    const defaultSize = sizes[defaultIndex];

    // Priority Badges: 
    // 1. AGOTADO (if completely out of stock)
    // 2. COMBO DECANTS (if combo)
    // 3. EN PROMOCIÓN (if promo/offer)
    // 4. Category badge (Nicho, Árabes, Unisex, etc.)
    let badgeHtml = '';
    if (isAllSoldOut) {
        badgeHtml = `<div class="app-prod-badge badge-soldout"><i class="fa-solid fa-ban"></i> AGOTADO</div>`;
    } else if (p.isCombo || (p.categories && p.categories.some(c => String(c).toLowerCase().includes('combo')))) {
        badgeHtml = `<div class="app-prod-badge badge-combo"><i class="fa-solid fa-gift"></i> COMBO DECANTS</div>`;
    } else if (p.isPromo || p.offer) {
        badgeHtml = `<div class="app-prod-badge badge-promo"><i class="fa-solid fa-fire"></i> EN PROMOCIÓN</div>`;
    } else if (Array.isArray(p.categories) && p.categories.length > 0) {
        badgeHtml = `<div class="app-prod-badge">${p.categories[0]}</div>`;
    } else if (p.category) {
        badgeHtml = `<div class="app-prod-badge">${p.category}</div>`;
    }

    const partialStockTag = hasPartialSoldOut ? `<span class="app-partial-stock-tag"><i class="fa-solid fa-circle-exclamation"></i> Stock parcial</span>` : '';

    // Description (optional)
    const descHtml = p.description ? `<div class="app-prod-desc">${p.description}</div>` : '';
    
    // Size buttons & presentation block
    const sizeButtons = sizes.length > 1 ? `
        <div class="app-prod-sizes">
            <div class="app-size-caption-wrap">
                <span class="app-size-caption"><i class="fa-solid fa-flask"></i> PRESENTACIÓN:</span>
                ${partialStockTag}
            </div>
            <div class="app-size-pills">
                ${sizes.map((s, i) => {
                    const isActive = (i === defaultIndex);
                    const soldClass = s.soldOut ? 'size-soldout' : '';
                    const soldLabel = s.soldOut ? '<span class="pill-soldout-label">Agotado</span>' : '';
                    return `
                        <button type="button" class="app-size-btn ${isActive ? 'active' : ''} ${soldClass}" 
                            data-size="${s.value}" 
                            data-label="${s.label}"
                            data-price="${s.price}"
                            data-sold-out="${s.soldOut ? 'true' : 'false'}"
                            data-product-id="${p.id}">
                            ${s.label} ${soldLabel}
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    ` : `
        <div class="app-prod-sizes single">
            <span class="app-single-badge ${sizes[0].soldOut ? 'single-soldout' : ''}">
                <i class="fa-solid fa-flask"></i> ${sizes[0].label === 'bottle' ? 'Botella Completa' : sizes[0].label}
                ${sizes[0].soldOut ? ' (Agotado)' : ''}
            </span>
        </div>
    `;

    // Add button state
    const isDefaultSoldOut = defaultSize.soldOut;
    const addBtnHtml = isDefaultSoldOut ? `
        <button type="button" class="app-btn-add btn-add btn-disabled" disabled
            data-id="${p.id}" 
            data-name="${p.name}" 
            data-price="${defaultSize.price}" 
            data-img="${p.image}" 
            data-size="${defaultSize.value}">
            <i class="fa-solid fa-ban"></i> AGOTADO (${defaultSize.label === 'bottle' ? 'Botella' : defaultSize.label})
        </button>
    ` : `
        <button type="button" class="app-btn-add btn-add" 
            data-id="${p.id}" 
            data-name="${p.name}" 
            data-price="${defaultSize.price}" 
            data-img="${p.image}" 
            data-size="${defaultSize.value}">
            <i class="fa-solid fa-bag-shopping"></i> AGREGAR
        </button>
    `;
    
    return `
        <div class="app-prod-card reveal is-visible ${isAllSoldOut ? 'card-all-soldout' : ''}" data-product-id="${p.id}">
            ${badgeHtml}
            <img src="${p.image || 'logo.webp'}" alt="${p.name}" onerror="this.onerror=null;this.src='logo.webp';">
            <div class="app-prod-brand">${p.brand || ''}</div>
            <h4 class="app-prod-name">${p.name}</h4>
            ${descHtml}
            ${sizeButtons}
            <div class="app-prod-price-wrap">
                <span class="app-price-label">PRECIO:</span>
                <span class="app-prod-price" data-product-id="${p.id}">$${defaultSize.price.toLocaleString('es-CO')}</span>
            </div>
            ${addBtnHtml}
        </div>
    `;
}

// Bind size selector buttons
function bindSizeSelectors() {
    document.querySelectorAll('.app-size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pill = e.currentTarget;
            const productId = pill.dataset.productId;
            const price = parseFloat(pill.dataset.price);
            const size = pill.dataset.size;
            const sizeLabel = pill.dataset.label || size;
            const isSoldOut = pill.dataset.soldOut === 'true';
            
            // Update active state
            const card = pill.closest('.app-prod-card');
            if (!card) return;
            card.querySelectorAll('.app-size-btn').forEach(b => b.classList.remove('active'));
            pill.classList.add('active');
            
            // Update price display
            const priceEl = card.querySelector('.app-prod-price');
            if (priceEl) priceEl.textContent = '$' + price.toLocaleString('es-CO');
            
            // Update add button state
            const addBtn = card.querySelector('.btn-add');
            if (addBtn) {
                addBtn.dataset.price = price;
                addBtn.dataset.size = size;
                if (isSoldOut) {
                    addBtn.disabled = true;
                    addBtn.classList.add('btn-disabled');
                    const labelText = sizeLabel === 'bottle' ? 'Botella' : sizeLabel;
                    addBtn.innerHTML = `<i class="fa-solid fa-ban"></i> AGOTADO (${labelText})`;
                } else {
                    addBtn.disabled = false;
                    addBtn.classList.remove('btn-disabled');
                    addBtn.innerHTML = `<i class="fa-solid fa-bag-shopping"></i> AGREGAR`;
                }
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
