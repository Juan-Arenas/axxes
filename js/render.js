// Render functions to update UI dynamically without breaking existing styling

function renderCatalog() {
    const prods = window.axxesStore.products.filter(p => p.active);
    
    // 1. Featured Catalog (#catalog .product-grid)
    const catalogGrid = document.querySelector('#catalog .product-grid');
    if (catalogGrid) {
        const catalogProds = prods.filter(p => !p.featured); // Just taking first 3 for simplicity to match original
        catalogGrid.innerHTML = catalogProds.slice(0,3).map((p, idx) => `
            <div class="prod-card reveal is-visible delay-${idx}">
                ${p.discountBadge ? `<div class="prod-badge discount">${p.discountBadge}</div>` : ''}
                ${p.isNew ? `<div class="prod-badge new">NUEVO</div>` : ''}
                ${p.bestseller && !p.discountBadge && !p.isNew ? `<div class="prod-badge hot">MÁS VENDIDO</div>` : ''}
                <button class="prod-fav ${p.isFavorite ? 'active' : ''}"><i class="fa-${p.isFavorite ? 'solid' : 'regular'} fa-heart"></i></button>
                <div class="prod-img-wrapper">
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="prod-info">
                    <span class="prod-brand">${p.brand}</span>
                    <h4 class="prod-name">${p.name}</h4>
                    <div class="prod-prices">
                        ${p.priceOld ? `<span class="price-old">$${p.priceOld.toLocaleString('es-CO')}</span>` : ''}
                        <span class="price-current">$${p.priceBottle.toLocaleString('es-CO')}</span>
                    </div>
                    <button class="btn btn-full btn-add" data-id="${p.id}" data-name="${p.name}" data-price="${p.priceBottle}" data-img="${p.image}">AGREGAR AL CARRITO</button>
                </div>
            </div>
        `).join('');
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
    if (typeof initCart === 'function') {
        const addBtns = document.querySelectorAll(".btn-add");
        addBtns.forEach(btn => {
            // Need to remove old listeners or just rely on global event delegation.
            // A simple clone approach removes previous listeners
            const clone = btn.cloneNode(true);
            btn.parentNode.replaceChild(clone, btn);
            clone.addEventListener("click", (e) => {
                const data = clone.dataset;
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
