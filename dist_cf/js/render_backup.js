// Render functions to update UI dynamically without breaking existing styling

function renderCatalog() {
    const prods = window.axxesStore.products.filter(p => p.active);
    
    // 1. Featured Catalog V2 (App-like layout)
    const catalogGrid = document.getElementById('main-catalog-grid');
    const pillsContainer = document.getElementById('catalog-pills');
    const searchInput = document.getElementById('catalog-search-input');
    
    if (catalogGrid && pillsContainer) {
        // Render Pills
        const allCats = window.axxesStore.categories || [];
        // Add "Todas" first
        let pillsHTML = `<button class="cat-pill active" data-cat="todas">✨ Todas</button>`;
        allCats.forEach(c => {
            pillsHTML += `<button class="cat-pill" data-cat="${c.name}">${c.name}</button>`;
        });
        pillsContainer.innerHTML = pillsHTML;

        // Active filter state
        let currentCat = 'todas';
        let currentSearch = '';

        const renderGrid = () => {
            let filtered = prods;
            if (currentCat !== 'todas') {
                filtered = filtered.filter(p => p.category === currentCat || (p.tags && p.tags.includes(currentCat)));
            }
            if (currentSearch) {
                const s = currentSearch.toLowerCase();
                filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s));
            }

            catalogGrid.innerHTML = filtered.map((p, idx) => `
                <div class="app-prod-card reveal is-visible delay-${idx % 4}">
                    <div class="app-prod-badge">${p.category || 'Destacado'}</div>
                    <img src="${p.image}" alt="${p.name}">
                    <h4 class="app-prod-name">${p.name}</h4>
                    <div class="app-prod-price">$${p.priceBottle.toLocaleString('es-CO')}</div>
                    <button class="app-btn-add btn-add" data-id="${p.id}" data-name="${p.name}" data-price="${p.priceBottle}" data-img="${p.image}">
                        <i class="fa-solid fa-bag-shopping"></i> Agregar al Carrito
                    </button>
                </div>
            `).join('');

            // Re-bind Add to Cart buttons inside this function so they work on filter change
            bindCartButtons();
        };

        // Attach events to pills
        pillsContainer.querySelectorAll('.cat-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                pillsContainer.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
                currentCat = e.target.dataset.cat;
                renderGrid();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.trim();
                renderGrid();
            });
        }

        renderGrid();
    }

    // 2. Featured Cinematic (#destacado)
    const featured = prods.find(p => p.featured);
    const adSection = document.querySelector('#destacado .ad-grid');
    if (adSection && featured) {
        adSection.innerHTML = `
            <div class="ad-image reveal is-visible">
                <img src="${featured.image}" alt="${featured.name}">
                <div class="ad-particles"></div>
            </div>
            <div class="ad-content reveal is-visible delay-1">
                <span class="ad-tag">FRAGANCIA DESTACADA</span>
                <h2 class="serif">${featured.name}</h2>
                <p class="ad-desc">${featured.description}</p>
                
                ${featured.notes ? `
                <div class="ad-notes">
                    <div class="note-item">
                        <span class="note-title">SALIDA</span>
                        <span class="note-desc">${featured.notes.top}</span>
                    </div>
                    <div class="note-item">
                        <span class="note-title">CORAZÓN</span>
                        <span class="note-desc">${featured.notes.heart}</span>
                    </div>
                    <div class="note-item">
                        <span class="note-title">FONDO</span>
                        <span class="note-desc">${featured.notes.base}</span>
                    </div>
                </div>` : ''}
                
                <div class="ad-price">$${featured.priceBottle.toLocaleString('es-CO')}</div>
                <button class="btn btn-primary-light btn-add" data-id="${featured.id}" data-name="${featured.name}" data-price="${featured.priceBottle}" data-img="${featured.image}">DESCUBRIR FRAGANCIA <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        `;
    }

    // 3. Offers Section (#ofertas)
    const offersGrid = document.querySelector('#ofertas .product-grid');
    if (offersGrid) {
        const offerProds = prods.filter(p => p.offer).slice(0,2);
        offersGrid.innerHTML = offerProds.map((p, idx) => `
            <div class="prod-card dark-card reveal is-visible delay-${idx}">
                <div class="prod-badge discount">${p.discountBadge}</div>
                <div class="prod-img-wrapper">
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="prod-info">
                    <span class="prod-brand">${p.brand}</span>
                    <h4 class="prod-name text-white">${p.name}</h4>
                    <div class="prod-prices">
                        <span class="price-old text-gray">$${p.priceOld.toLocaleString('es-CO')}</span>
                        <span class="price-current text-white">$${p.priceBottle.toLocaleString('es-CO')}</span>
                    </div>
                    <button class="btn btn-full btn-outline-light btn-add" data-id="${p.id}" data-name="${p.name}" data-price="${p.priceBottle}" data-img="${p.image}">COMPRAR AHORA</button>
                </div>
            </div>
        `).join('');
    }
    
    // Re-bind Add to Cart buttons
    bindCartButtons();
}

function bindCartButtons() {
    if (typeof initCart === 'function') {
        const addBtns = document.querySelectorAll(".btn-add");
        addBtns.forEach(btn => {
            const clone = btn.cloneNode(true);
            btn.parentNode.replaceChild(clone, btn);
            clone.addEventListener("click", (e) => {
                // If the icon or span was clicked, bubble up to button
                const targetBtn = e.target.closest('.btn-add');
                if (!targetBtn) return;
                const data = targetBtn.dataset;
                addToCart({
                    id: data.id,
                    name: data.name,
                    price: parseFloat(data.price),
                    img: data.img,
                    qty: 1
                });
                const cartDrawer = document.getElementById("cart-drawer");
                const cartOverlay = document.getElementById("cart-overlay");
                cartDrawer.classList.add("open");
                cartOverlay.classList.add("active");
                document.body.style.overflow = 'hidden';
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderCatalog();
});

document.addEventListener('axxesDataUpdated', () => {
    renderCatalog();
});
