// render.js
// Handles populating all the UI sections dynamically from dataStore.js

document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderAll();
    
    // Listen for data updates from the admin panel
    window.addEventListener('axxesDataUpdated', () => {
        renderAll();
    });
});

function renderAll() {
    if (!window.axxesStore) return;
    
    const prods = window.axxesStore.products.filter(p => p.active);
    
    // 1. Render Brands
    const brandsContainer = document.getElementById('brands-container');
    const filterBrandsList = document.getElementById('filter-brands-list');
    if (brandsContainer) {
        // Extract unique brands
        const uniqueBrands = [...new Set(prods.map(p => p.brand).filter(b => b))].sort();
        
        brandsContainer.innerHTML = uniqueBrands.map((b, i) => `
            <div class="brand-item reveal delay-${i % 3}" onclick="filterByBrand('${b}')">${b}</div>
        `).join('');

        if (filterBrandsList) {
            filterBrandsList.innerHTML = uniqueBrands.map(b => `
                <label><input type="checkbox" value="${b}" class="filter-brand"> ${b}</label>
            `).join('');
        }
    }

    // Product Card Template
    const createProductCardHTML = (p, size = 'bottle') => {
        let price = p.priceBottle;
        let displayName = p.name;
        if (size === '5ml') { price = p.decants['5ml']; displayName = p.name + ' (5ml)'; }
        if (size === '10ml') { price = p.decants['10ml']; displayName = p.name + ' (10ml)'; }
        if (size === '30ml') { price = p.decants['30ml']; displayName = p.name + ' (30ml)'; }

        return `
            <div class="app-prod-card">
                <div class="app-prod-badge">${p.category || 'Destacado'}</div>
                <img src="${p.image}" alt="${p.name}">
                <div class="app-prod-brand">${p.brand || ''}</div>
                <h4 class="app-prod-name">${displayName}</h4>
                <div class="app-prod-price">$${price.toLocaleString('es-CO')}</div>
                <button class="app-btn-add btn-add" data-id="${p.id}" data-name="${p.name}" data-price="${price}" data-img="${p.image}" data-size="${size}">
                    <i class="fa-solid fa-bag-shopping"></i> AGREGAR
                </button>
            </div>
        `;
    };

    // 2. New Arrivals (Just newest products or random for now, reverse order)
    const trackNew = document.getElementById('track-new-arrivals');
    if (trackNew) {
        const newProds = [...prods].reverse().slice(0, 8);
        trackNew.innerHTML = newProds.map(p => createProductCardHTML(p)).join('');
    }

    // 3. Best Sellers (bestseller: true)
    const trackBest = document.getElementById('track-bestsellers');
    if (trackBest) {
        const bestProds = prods.filter(p => p.bestseller).slice(0, 8);
        trackBest.innerHTML = bestProds.map(p => createProductCardHTML(p)).join('');
    }

    // 4. Decants (Products that have decants configured)
    const trackDecants = document.getElementById('track-decants');
    if (trackDecants) {
        const decantProds = prods.filter(p => p.decants && p.decants['5ml'] > 0).slice(0, 8);
        // For decants track, we can show the 5ml by default or regular bottle but highlight decant
        trackDecants.innerHTML = decantProds.map(p => createProductCardHTML(p, '5ml')).join('');
    }

    // 5. Restocked (restocked: true)
    const trackRestock = document.getElementById('track-restocked');
    const sectRestock = document.getElementById('nuevamente-stock');
    if (trackRestock && sectRestock) {
        const restockProds = prods.filter(p => p.restocked);
        if (restockProds.length > 0) {
            sectRestock.style.display = 'block';
            trackRestock.innerHTML = restockProds.map(p => createProductCardHTML(p)).join('');
        } else {
            sectRestock.style.display = 'none';
        }
    }

    // 6. Featured (featured: true)
    const trackFeatured = document.getElementById('track-featured');
    if (trackFeatured) {
        const featuredProds = prods.filter(p => p.featured).slice(0, 8);
        trackFeatured.innerHTML = featuredProds.map(p => createProductCardHTML(p)).join('');
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

    const createProductCardHTML = (p) => `
        <div class="app-prod-card reveal is-visible">
            <div class="app-prod-badge">${p.category || 'N/A'}</div>
            <img src="${p.image}" alt="${p.name}">
            <div class="app-prod-brand">${p.brand || ''}</div>
            <h4 class="app-prod-name">${p.name}</h4>
            <div class="app-prod-price">$${p.priceBottle.toLocaleString('es-CO')}</div>
            <button class="app-btn-add btn-add" data-id="${p.id}" data-name="${p.name}" data-price="${p.priceBottle}" data-img="${p.image}" data-size="bottle">
                <i class="fa-solid fa-bag-shopping"></i> AGREGAR
            </button>
        </div>
    `;

    storeGrid.innerHTML = productsToRender.map(p => createProductCardHTML(p)).join('');
    
    // Bind buttons newly added to DOM
    bindCartButtons();
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
