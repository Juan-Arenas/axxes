// app.js

let cart = [];
let slideIndex = 0;
let sliderInterval;

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initHeroSlider();
    initScrollReveal();
    initSearch();
    initProductModal();
    initCartUI();
    initAdminAccess();
    initLogoUpdater();
    initStepsCarousel();
    
    // Defer store filters so render.js can finish first
    setTimeout(initStoreFilters, 500);

    // Initial check for hash links
    if (window.location.hash === '#catalogo-seccion') {
        setTimeout(() => document.getElementById('catalogo-seccion').scrollIntoView(), 600);
    }
});

// 1. Header & Navigation
function initHeader() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });
}

function initMobileMenu() {
    const btnOpen = document.getElementById('mobile-menu-btn');
    const btnClose = document.getElementById('close-mobile-nav');
    const nav = document.getElementById('mobile-nav');
    const links = document.querySelectorAll('.mobile-links a');

    if(btnOpen && btnClose && nav) {
        btnOpen.addEventListener('click', () => nav.classList.add('active'));
        btnClose.addEventListener('click', () => nav.classList.remove('active'));
        links.forEach(l => l.addEventListener('click', () => nav.classList.remove('active')));
    }
}

// 2. Hero Slider — Banner2 first, 3 sec interval, with arrows
function initHeroSlider() {
    const track = document.getElementById('main-slider');
    const indicatorsContainer = document.getElementById('slider-indicators');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    if (!track || !indicatorsContainer) return;
    
    const slides = document.querySelectorAll('.slide');
    if(slides.length === 0) return;

    // Create indicators
    slides.forEach((_, i) => {
        const ind = document.createElement('div');
        ind.classList.add('indicator');
        if (i === 0) ind.classList.add('active');
        ind.addEventListener('click', () => goToSlide(i));
        indicatorsContainer.appendChild(ind);
    });

    const indicators = document.querySelectorAll('.indicator');

    function goToSlide(index) {
        slideIndex = index;
        if (slideIndex >= slides.length) slideIndex = 0;
        if (slideIndex < 0) slideIndex = slides.length - 1;
        
        track.style.transform = `translateX(-${slideIndex * 100}%)`;
        
        indicators.forEach(ind => ind.classList.remove('active'));
        indicators[slideIndex].classList.add('active');
    }

    function nextSlide() { goToSlide(slideIndex + 1); }
    function prevSlide() { goToSlide(slideIndex - 1); }

    // Start auto-slide every 3 seconds
    sliderInterval = setInterval(nextSlide, 3000);

    // Arrow buttons
    if(nextBtn) nextBtn.addEventListener('click', () => {
        clearInterval(sliderInterval);
        nextSlide();
        sliderInterval = setInterval(nextSlide, 3000);
    });
    if(prevBtn) prevBtn.addEventListener('click', () => {
        clearInterval(sliderInterval);
        prevSlide();
        sliderInterval = setInterval(nextSlide, 3000);
    });

    // Pause on hover/touch
    track.addEventListener('mouseenter', () => clearInterval(sliderInterval));
    track.addEventListener('mouseleave', () => sliderInterval = setInterval(nextSlide, 3000));
    track.addEventListener('touchstart', () => clearInterval(sliderInterval));
    track.addEventListener('touchend', () => sliderInterval = setInterval(nextSlide, 3000));
    
    // Swipe logic and click handling for slides
    let startX = 0;
    let hasMoved = false;
    track.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        hasMoved = false;
    });
    track.addEventListener('touchmove', e => {
        if (Math.abs(e.touches[0].clientX - startX) > 15) {
            hasMoved = true;
        }
    });
    track.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) nextSlide();
        else if (endX - startX > 50) prevSlide();
    });

    // Banner click action
    slides.forEach(slide => {
        slide.addEventListener('click', (e) => {
            if (hasMoved) return;
            if (e.target.closest('.slider-arrow')) return;
            const targetFilter = slide.getAttribute('data-banner-filter');
            if (targetFilter && typeof window.filterBySpecial === 'function') {
                window.filterBySpecial(targetFilter);
            }
        });
    });
}

// 3. Scroll Reveal + Counter Animation
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Number counter animation for trust section
                if (entry.target.classList.contains('trust-stats-row') || 
                    entry.target.closest('.trust-section-luzents')) {
                    animateCounters();
                }
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(r => observer.observe(r));
    
    // Also observe the trust section directly
    const trustSection = document.getElementById('trust-section');
    if (trustSection) {
        const trustObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    trustObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        trustObs.observe(trustSection);
    }
}

let countersAnimated = false;
function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;
    
    const counters = document.querySelectorAll('.counter-animated');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const suffix = counter.getAttribute('data-suffix') || '';
        let current = 0;
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = target / steps;
        const stepTime = duration / steps;
        
        const updateCount = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current) + suffix;
                setTimeout(updateCount, stepTime);
            } else {
                counter.textContent = target + suffix;
            }
        };
        updateCount();
    });
}

// 4. Mega Search & Product Quick View Modal
function getProductPricingSummary(p) {
    const soldOutSizes = Array.isArray(p.soldOutSizes) ? p.soldOutSizes : (Array.isArray(p.sold_out_sizes) ? p.sold_out_sizes : []);
    const isGlobalSoldOut = Boolean(p.outOfStock || p.out_of_stock);
    let sizes = [];

    if (Array.isArray(p.decants) && p.decants.length > 0) {
        p.decants.forEach(d => {
            const isSold = isGlobalSoldOut || Boolean(d.soldOut || d.sold_out || soldOutSizes.includes(d.size));
            sizes.push({ value: d.size, label: d.size, price: d.price, soldOut: isSold });
        });
    }
    if (p.sellBottle !== false && p.priceBottle > 0) {
        const isSold = isGlobalSoldOut || Boolean(p.bottleSoldOut || p.bottle_sold_out || soldOutSizes.includes('bottle'));
        sizes.push({ value: 'bottle', label: 'Botella Completa', price: p.priceBottle, soldOut: isSold });
    }
    if (sizes.length === 0) {
        const isSold = isGlobalSoldOut || Boolean(p.bottleSoldOut || p.bottle_sold_out || soldOutSizes.includes('bottle'));
        sizes.push({ value: 'bottle', label: 'Botella Completa', price: p.priceBottle || 0, soldOut: isSold });
    }

    const allSoldOut = isGlobalSoldOut || sizes.every(s => s.soldOut);
    const validPrices = sizes.map(s => s.price).filter(pr => pr > 0);
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
    const sizesSummary = sizes.map(s => s.label === 'bottle' ? 'Botella' : s.label).join(', ');

    return { sizes, allSoldOut, minPrice, sizesSummary };
}

function initSearch() {
    const modal = document.getElementById('search-modal');
    const btnOpen = document.getElementById('open-search');
    const btnClose = document.getElementById('close-search');
    const input = document.getElementById('mega-search');
    const resultsContainer = document.getElementById('search-results-instant');

    if (!modal || !btnOpen) return;

    btnOpen.addEventListener('click', () => {
        modal.classList.add('active');
        setTimeout(() => input.focus(), 300);
    });

    btnClose.addEventListener('click', () => {
        modal.classList.remove('active');
        input.value = '';
        resultsContainer.innerHTML = '';
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        if (!window.axxesStore || !window.axxesStore.products) return;
        const prods = window.axxesStore.products.filter(p => p.active);
        const matches = prods.filter(p => {
            const name = (p.name || '').toLowerCase();
            const brand = (p.brand || '').toLowerCase();
            const desc = (p.description || '').toLowerCase();
            const gender = (p.gender || '').toLowerCase();
            const cats = Array.isArray(p.categories) ? p.categories.map(c => String(c).toLowerCase()) : [];
            const cat = (p.category || '').toLowerCase();
            return name.includes(query) || brand.includes(query) || desc.includes(query) || gender.includes(query) || cats.some(c => c.includes(query)) || cat.includes(query);
        });

        if (matches.length === 0) {
            resultsContainer.innerHTML = `
                <div style="text-align:center; padding:2.5rem 1rem; color:#94a3b8;">
                    <i class="fa-solid fa-magnifying-glass" style="font-size:2rem; margin-bottom:10px; color:#475569; display:block;"></i>
                    <p style="font-size:1.1rem; color:#fff;">No se encontraron perfumes para "<strong>${query}</strong>".</p>
                    <p style="font-size:0.9rem; margin-top:4px;">Intenta buscar por nombre, marca o presentación (ej: "Sauvage", "Khamrah", "Decant", "Árabes").</p>
                </div>
            `;
            return;
        }

        const visibleMatches = matches.slice(0, 12);

        let html = `
            <div class="search-results-header">
                <span>Encontrados <strong>${matches.length}</strong> perfumes para "${query}"</span>
                <span style="font-size:11px; color:#a78bfa;"><i class="fa-solid fa-hand-pointer"></i> Toca para ver fotos, notas y precios</span>
            </div>
        `;

        html += visibleMatches.map(p => {
            const summary = getProductPricingSummary(p);
            let badgeHtml = '';
            if (summary.allSoldOut) {
                badgeHtml = `<span class="search-meta-pill soldout"><i class="fa-solid fa-ban"></i> Agotado</span>`;
            } else if (p.isCombo) {
                badgeHtml = `<span class="search-meta-pill" style="color:#c084fc;"><i class="fa-solid fa-gift"></i> Combo</span>`;
            } else if (p.isPromo || p.offer) {
                badgeHtml = `<span class="search-meta-pill" style="color:#fb923c;"><i class="fa-solid fa-fire"></i> Promo</span>`;
            }

            const priceDisplay = summary.minPrice > 0 ? `$${summary.minPrice.toLocaleString('es-CO')}` : '';

            return `
                <div class="search-result-item" onclick="window.selectProductFromSearch('${p.id}')" title="Ver perfume: ${p.name}">
                    <div class="search-thumb-wrap">
                        <img src="${p.image || 'logo.webp'}" alt="${p.name}" class="search-result-img" onerror="this.onerror=null;this.src='logo.webp';">
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-brand">${p.brand || 'Capital Perfumes'}</div>
                        <div class="search-result-title">${p.name}</div>
                        <div class="search-result-meta">
                            <span class="search-meta-pill"><i class="fa-solid fa-flask"></i> ${summary.sizesSummary}</span>
                            ${badgeHtml}
                        </div>
                    </div>
                    <div class="search-result-action">
                        <div class="search-result-price">${priceDisplay}</div>
                        <span class="search-result-btn">Ver perfume <i class="fa-solid fa-arrow-right"></i></span>
                    </div>
                </div>
            `;
        }).join('');

        if (matches.length > visibleMatches.length) {
            html += `
                <div class="search-all-results-btn" onclick="window.filterCatalogBySearch('${query.replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-border-all"></i> Ver los ${matches.length} perfumes en el catálogo <i class="fa-solid fa-arrow-down"></i>
                </div>
            `;
        }

        resultsContainer.innerHTML = html;
    });

    // Enter key handler
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = input.value.toLowerCase().trim();
            if (!query) return;
            if (!window.axxesStore || !window.axxesStore.products) return;
            const prods = window.axxesStore.products.filter(p => p.active);
            const matches = prods.filter(p => {
                const name = (p.name || '').toLowerCase();
                const brand = (p.brand || '').toLowerCase();
                const desc = (p.description || '').toLowerCase();
                const gender = (p.gender || '').toLowerCase();
                const cats = Array.isArray(p.categories) ? p.categories.map(c => String(c).toLowerCase()) : [];
                return name.includes(query) || brand.includes(query) || desc.includes(query) || gender.includes(query) || cats.some(c => c.includes(query));
            });

            if (matches.length === 1) {
                window.selectProductFromSearch(matches[0].id);
            } else if (matches.length > 1) {
                window.filterCatalogBySearch(query);
            }
        }
    });
}

// Select product from search: closes search modal, scrolls to product, pulses highlight, and opens detail modal
window.selectProductFromSearch = function(productId) {
    const searchModal = document.getElementById('search-modal');
    if (searchModal) searchModal.classList.remove('active');

    // Reset restricting active search query
    if (window.activeSearchQuery) {
        window.activeSearchQuery = null;
    }

    // Open detail modal immediately
    window.openProductModal(productId);

    // Also scroll the background catalog to this product
    setTimeout(() => {
        let card = document.querySelector(`.app-prod-card[data-product-id="${productId}"]`);
        if (!card) {
            // Uncheck any active filters or reset to 'all' so card is rendered
            const allPill = document.querySelector('.quick-pill[data-filter-quick="all"]');
            if (allPill) allPill.click();
            else if (window.applyFilters) window.applyFilters();
            
            setTimeout(() => {
                card = document.querySelector(`.app-prod-card[data-product-id="${productId}"]`);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.classList.remove('product-card-highlight');
                    void card.offsetWidth;
                    card.classList.add('product-card-highlight');
                    setTimeout(() => card.classList.remove('product-card-highlight'), 5000);
                }
            }, 300);
        } else {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.remove('product-card-highlight');
            void card.offsetWidth;
            card.classList.add('product-card-highlight');
            setTimeout(() => card.classList.remove('product-card-highlight'), 5000);
        }
    }, 250);
};

// Filter catalog by search term
window.filterCatalogBySearch = function(query) {
    const searchModal = document.getElementById('search-modal');
    if (searchModal) searchModal.classList.remove('active');
    window.activeSearchQuery = query;
    if (window.applyFilters) window.applyFilters();
    const catSec = document.getElementById('catalogo-seccion');
    if (catSec) catSec.scrollIntoView({ behavior: 'smooth' });
};

// Clear active search filter
window.clearSearchFilter = function() {
    window.activeSearchQuery = null;
    const input = document.getElementById('mega-search');
    if (input) input.value = '';
    if (window.applyFilters) window.applyFilters();
};

// Product Detail Modal Logic
let currentModalProductId = null;
let currentModalSelectedSize = null;
let currentModalSelectedPrice = 0;
let currentModalQty = 1;

function initProductModal() {
    const backdrop = document.getElementById('product-modal-backdrop');
    const closeBtn = document.getElementById('close-product-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', window.closeProductModal);
    }
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) window.closeProductModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeProductModal();
        }
    });
}

window.closeProductModal = function() {
    const backdrop = document.getElementById('product-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
};

window.openProductModal = function(productId) {
    if (!window.axxesStore || !window.axxesStore.products) return;
    const p = window.axxesStore.products.find(item => String(item.id) === String(productId));
    if (!p) {
        console.warn('Producto no encontrado:', productId);
        return;
    }

    currentModalProductId = p.id;
    currentModalQty = 1;

    const soldOutSizes = Array.isArray(p.soldOutSizes) ? p.soldOutSizes : (Array.isArray(p.sold_out_sizes) ? p.sold_out_sizes : []);
    const isGlobalSoldOut = Boolean(p.outOfStock || p.out_of_stock);

    let sizes = [];
    if (Array.isArray(p.decants) && p.decants.length > 0) {
        p.decants.forEach(d => {
            const isSold = isGlobalSoldOut || Boolean(d.soldOut || d.sold_out || soldOutSizes.includes(d.size));
            sizes.push({ value: d.size, label: d.size, price: d.price, soldOut: isSold });
        });
    }
    if (p.sellBottle !== false && p.priceBottle > 0) {
        const isSold = isGlobalSoldOut || Boolean(p.bottleSoldOut || p.bottle_sold_out || soldOutSizes.includes('bottle'));
        sizes.push({ value: 'bottle', label: 'Botella Completa', price: p.priceBottle, soldOut: isSold });
    }
    if (sizes.length === 0) {
        const isSold = isGlobalSoldOut || Boolean(p.bottleSoldOut || p.bottle_sold_out || soldOutSizes.includes('bottle'));
        sizes.push({ value: 'bottle', label: 'Botella Completa', price: p.priceBottle || 0, soldOut: isSold });
    }

    const sizeOrder = {'5ML': 1, '10ML': 2, '15ML': 3, '30ML': 4, 'bottle': 5, 'Botella Completa': 5};
    sizes.sort((a, b) => (sizeOrder[a.value] || 99) - (sizeOrder[b.value] || 99));

    const isAllSoldOut = isGlobalSoldOut || sizes.every(s => s.soldOut);
    let defaultIndex = sizes.findIndex(s => !s.soldOut);
    if (defaultIndex === -1) defaultIndex = 0;
    const defaultSize = sizes[defaultIndex];

    currentModalSelectedSize = defaultSize.value;
    currentModalSelectedPrice = defaultSize.price;

    // Badges
    let badgesHtml = '<span class="modal-badge-item original"><i class="fa-solid fa-certificate"></i> 100% ORIGINAL</span>';
    if (isAllSoldOut) {
        badgesHtml += '<span class="modal-badge-item soldout"><i class="fa-solid fa-ban"></i> AGOTADO</span>';
    } else if (p.isCombo) {
        badgesHtml += '<span class="modal-badge-item combo"><i class="fa-solid fa-gift"></i> COMBO DECANTS</span>';
    } else if (p.isPromo || p.offer) {
        badgesHtml += '<span class="modal-badge-item promo"><i class="fa-solid fa-fire"></i> EN PROMOCIÓN</span>';
    }

    // Tags
    const tags = [];
    if (p.gender) tags.push(`<span class="modal-tag-pill"><i class="fa-solid fa-venus-mars"></i> ${p.gender}</span>`);
    if (Array.isArray(p.categories)) {
        p.categories.forEach(c => {
            if (c !== p.gender) tags.push(`<span class="modal-tag-pill">${c}</span>`);
        });
    } else if (p.category && p.category !== p.gender) {
        tags.push(`<span class="modal-tag-pill">${p.category}</span>`);
    }

    // Description text
    const descText = p.description || `Fragancia 100% original y exclusiva de la casa ${p.brand || 'Capital Perfumes'}. Presentación disponible en decants premium y botella completa con envíos express a toda Colombia.`;

    const contentEl = document.getElementById('product-modal-content');
    if (!contentEl) return;

    contentEl.innerHTML = `
        <div class="modal-product-grid">
            <!-- Left Column: Image -->
            <div class="modal-img-col">
                <div class="modal-img-wrap">
                    <div class="modal-badges-wrap">
                        ${badgesHtml}
                    </div>
                    <img src="${p.image || 'logo.webp'}" alt="${p.name}" class="modal-main-img" onerror="this.onerror=null;this.src='logo.webp';">
                </div>
                <div class="modal-authenticity-card">
                    <i class="fa-solid fa-shield-halved"></i>
                    <div>
                        <strong style="display:block; color:#fff;">Garantía de Originalidad</strong>
                        <span>Perfumería 100% original garantizada en decants y botellas selladas.</span>
                    </div>
                </div>
            </div>

            <!-- Right Column: Info & Actions -->
            <div class="modal-info-col">
                <div class="modal-brand-tag">${p.brand || 'Capital Perfumes'}</div>
                <h2 class="modal-title">${p.name}</h2>
                <div class="modal-tags-row">
                    ${tags.join('')}
                </div>

                <!-- Price Box -->
                <div class="modal-price-box">
                    <span class="modal-price-val" id="modal-price-display">$${defaultSize.price.toLocaleString('es-CO')}</span>
                    <span class="modal-price-size-label" id="modal-price-size-label">(${defaultSize.label})</span>
                    <div class="modal-stock-status ${defaultSize.soldOut ? 'soldout' : 'available'}" id="modal-stock-indicator">
                        <i class="fa-solid ${defaultSize.soldOut ? 'fa-ban' : 'fa-circle-check'}"></i>
                        <span>${defaultSize.soldOut ? 'Agotado en esta presentación' : 'Disponible para entrega inmediata'}</span>
                    </div>
                </div>

                <!-- Sizes Selector -->
                <div class="modal-sizes-block">
                    <span class="modal-sizes-label"><i class="fa-solid fa-flask"></i> SELECCIONA LA PRESENTACIÓN:</span>
                    <div class="modal-sizes-pills" id="modal-sizes-container">
                        ${sizes.map((s, i) => `
                            <button type="button" class="modal-size-btn ${i === defaultIndex ? 'active' : ''} ${s.soldOut ? 'soldout' : ''}" 
                                data-size="${s.value}" 
                                data-label="${s.label}" 
                                data-price="${s.price}" 
                                data-soldout="${s.soldOut ? 'true' : 'false'}">
                                <span>${s.label}</span>
                                <span class="modal-size-btn-price">$${s.price.toLocaleString('es-CO')}</span>
                                ${s.soldOut ? '<span class="modal-size-btn-sold">Agotado</span>' : ''}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Description Block -->
                <div class="modal-desc-block">
                    <div class="modal-desc-heading"><i class="fa-solid fa-align-left"></i> DESCRIPCIÓN & NOTAS</div>
                    <div class="modal-desc-body">${descText}</div>
                </div>

                <!-- Qty & CTA Buttons -->
                <div class="modal-cta-row">
                    <div class="modal-qty-control">
                        <button type="button" class="modal-qty-btn" id="modal-qty-minus"><i class="fa-solid fa-minus"></i></button>
                        <input type="text" readonly value="1" class="modal-qty-input" id="modal-qty-val">
                        <button type="button" class="modal-qty-btn" id="modal-qty-plus"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <button type="button" class="modal-btn-add" id="modal-btn-add" ${defaultSize.soldOut ? 'disabled' : ''}>
                        <i class="fa-solid fa-bag-shopping"></i> 
                        <span id="modal-btn-add-text">${defaultSize.soldOut ? `AGOTADO (${defaultSize.label})` : 'AGREGAR AL CARRITO'}</span>
                    </button>
                    <button type="button" class="modal-btn-wpp" id="modal-btn-wpp">
                        <i class="fa-brands fa-whatsapp"></i> PEDIR POR WHATSAPP
                    </button>
                </div>

                <!-- Perks footer -->
                <div class="modal-perks-row">
                    <div class="modal-perk-item">
                        <i class="fa-solid fa-truck-fast"></i>
                        <span>Envíos Colombia 1 a 3 días hábiles</span>
                    </div>
                    <div class="modal-perk-item">
                        <i class="fa-solid fa-credit-card"></i>
                        <span>Addi, Tarjetas, Contra Entrega Medellín</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Size Selection Handler
    const sizeButtons = contentEl.querySelectorAll('.modal-size-btn');
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const val = btn.dataset.size;
            const label = btn.dataset.label;
            const price = parseFloat(btn.dataset.price);
            const isSold = btn.dataset.soldout === 'true';

            currentModalSelectedSize = val;
            currentModalSelectedPrice = price;

            // Update price display
            const priceDisp = document.getElementById('modal-price-display');
            const priceLabel = document.getElementById('modal-price-size-label');
            if (priceDisp) priceDisp.textContent = '$' + price.toLocaleString('es-CO');
            if (priceLabel) priceLabel.textContent = `(${label})`;

            // Update stock indicator
            const stockInd = document.getElementById('modal-stock-indicator');
            if (stockInd) {
                if (isSold) {
                    stockInd.className = 'modal-stock-status soldout';
                    stockInd.innerHTML = '<i class="fa-solid fa-ban"></i> <span>Agotado en esta presentación</span>';
                } else {
                    stockInd.className = 'modal-stock-status available';
                    stockInd.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Disponible para entrega inmediata</span>';
                }
            }

            // Update add button
            const addBtn = document.getElementById('modal-btn-add');
            const addText = document.getElementById('modal-btn-add-text');
            if (addBtn && addText) {
                if (isSold) {
                    addBtn.disabled = true;
                    addText.textContent = `AGOTADO (${label})`;
                } else {
                    addBtn.disabled = false;
                    addText.textContent = 'AGREGAR AL CARRITO';
                }
            }
        });
    });

    // Qty controls
    const minusBtn = document.getElementById('modal-qty-minus');
    const plusBtn = document.getElementById('modal-qty-plus');
    const qtyInput = document.getElementById('modal-qty-val');
    if (minusBtn && plusBtn && qtyInput) {
        minusBtn.addEventListener('click', () => {
            if (currentModalQty > 1) {
                currentModalQty--;
                qtyInput.value = currentModalQty;
            }
        });
        plusBtn.addEventListener('click', () => {
            currentModalQty++;
            qtyInput.value = currentModalQty;
        });
    }

    // Add to cart handler
    const addBtn = document.getElementById('modal-btn-add');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (window.addToCart) {
                window.addToCart({
                    id: p.id,
                    name: p.name,
                    price: currentModalSelectedPrice,
                    img: p.image,
                    qty: currentModalQty,
                    size: currentModalSelectedSize || 'bottle'
                });
                window.closeProductModal();
                // Open cart drawer
                const drawer = document.getElementById('cart-drawer');
                const overlay = document.getElementById('cart-overlay');
                if (drawer && overlay) {
                    drawer.classList.add('open');
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    }

    // Direct WhatsApp handler
    const wppBtn = document.getElementById('modal-btn-wpp');
    if (wppBtn) {
        wppBtn.addEventListener('click', () => {
            const sizeLabel = currentModalSelectedSize === 'bottle' ? 'Botella Completa' : currentModalSelectedSize;
            let msg = `*¡Hola Capital Perfumes!* 💎✨\n\n`;
            msg += `Deseo consultar / pedir el siguiente perfume:\n`;
            msg += `• *Perfume:* ${p.name}\n`;
            msg += `• *Casa / Marca:* ${p.brand || 'Exclusiva'}\n`;
            msg += `• *Presentación:* ${sizeLabel}\n`;
            msg += `• *Cantidad:* ${currentModalQty}\n`;
            msg += `• *Precio:* $${(currentModalSelectedPrice * currentModalQty).toLocaleString('es-CO')} COP\n\n`;
            msg += `¿Tienen disponibilidad inmediata para envío a mi ciudad? ¡Muchas gracias!`;
            const encoded = encodeURIComponent(msg);
            window.open(`https://wa.me/573005130634?text=${encoded}`, '_blank');
        });
    }

    // Show modal
    const backdrop = document.getElementById('product-modal-backdrop');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// 5. Cart UI & Logic
function initCartUI() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    const btnOpen = document.getElementById('open-cart');
    const btnClose = document.getElementById('close-cart');
    const btnContinue = document.getElementById('continue-shopping');

    const closeCart = () => {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if(btnOpen) btnOpen.addEventListener('click', () => {
        drawer.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    if(btnClose) btnClose.addEventListener('click', closeCart);
    if(overlay) overlay.addEventListener('click', closeCart);
    if(btnContinue) btnContinue.addEventListener('click', closeCart);

    const btnCheckout = document.getElementById('checkout-btn');
    if(btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            if (!cart || cart.length === 0) {
                alert('Tu carrito está vacío. Agrega una presentación para ordenar.');
                return;
            }

            let total = 0;
            let bottlesCount = 0;
            let message = `*¡HOLA! DESEO REALIZAR UN PEDIDO EN CAPITAL PERFUMES* 💎✨\n`;
            message += `_PERFUMERÍA 100% ORIGINAL Y EXCLUSIVA_\n\n`;
            message += `*Detalle de mi pedido:*\n`;
            
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.qty;
                total += itemTotal;
                if (item.size === 'bottle') bottlesCount += item.qty;
                const sizeLabel = item.size === 'bottle' ? 'Botella Completa' : item.size;
                message += `${index + 1}. *${item.name}*\n`;
                message += `   • Presentación: ${sizeLabel}\n`;
                message += `   • Cantidad: ${item.qty}\n`;
                message += `   • Valor: $${itemTotal.toLocaleString('es-CO')} COP\n\n`;
            });
            
            message += `*TOTAL A PAGAR: $${total.toLocaleString('es-CO')} COP*\n\n`;

            if (bottlesCount >= 2) {
                message += `🚚 *¡Aplica a ENVÍO GRATIS por compra de 2 perfumes completos!* 💨\n\n`;
            } else {
                message += `🇨🇴 *Envíos a todo Colombia (1 a 3 días hábiles)*\n\n`;
            }

            message += `*Mis datos para el pedido:*\n`;
            message += `• Nombre:\n`;
            message += `• Ciudad y Dirección de entrega:\n`;
            message += `• Método de pago elegido: (Addi / Tarjeta de Crédito / Transferencia Bancaria / Contra Entrega Medellín)\n\n`;
            message += `Por favor envíenme el link de pago seguro o coordinemos la entrega. ¡Muchas gracias!`;

            const encodedMsg = encodeURIComponent(message);
            window.open(`https://wa.me/573005130634?text=${encodedMsg}`, '_blank');
        });
    }

    loadCart();
}

window.addToCart = function(product) {
    // product: {id, name, price, img, qty, size}
    const existing = cart.find(i => i.id === product.id && i.size === product.size);
    if (existing) {
        existing.qty += product.qty;
    } else {
        cart.push(product);
    }
    saveCart();
    updateCartUI();
};

function removeFromCart(id, size) {
    cart = cart.filter(i => !(i.id === id && i.size === size));
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    const countEls = document.querySelectorAll('.cart-count');

    if (!container) return;

    const promoEl = document.getElementById('cart-promo-container');

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; margin-top:2rem; color:#888;">Tu carrito está vacío.</p>';
        subtotalEl.innerText = '$0';
        countEls.forEach(el => el.innerText = '0');
        if (promoEl) promoEl.innerHTML = '<div class="cart-promo-banner"><i class="fa-solid fa-truck"></i> Envío GRATIS por 2 perfumes completos (Envíos 1-3 días)</div>';
        return;
    }

    let totalQty = 0;
    let subtotal = 0;
    let bottlesCount = 0;

    container.innerHTML = cart.map(item => {
        totalQty += item.qty;
        subtotal += item.price * item.qty;
        if (item.size === 'bottle') bottlesCount += item.qty;
        let sizeDisplay = item.size === 'bottle' ? 'Botella Completa' : item.size;
        return `
            <div class="cart-item">
                <img src="${item.img || 'logo.webp'}" alt="${item.name}" onerror="this.onerror=null;this.src='logo.webp';">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="size">Presentación: ${sizeDisplay}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                        <strong>$${item.price.toLocaleString('es-CO')} x ${item.qty}</strong>
                        <button onclick="removeFromCart('${item.id}', '${item.size}')" style="color:#d9534f; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    subtotalEl.innerText = '$' + subtotal.toLocaleString('es-CO');
    countEls.forEach(el => el.innerText = totalQty);

    if (promoEl) {
        if (bottlesCount >= 2) {
            promoEl.innerHTML = '<div class="cart-promo-banner" style="background:#059669;"><i class="fa-solid fa-truck-fast"></i> ¡ENVÍO GRATIS APLICADO! (2+ Perfumes completos)</div>';
        } else {
            promoEl.innerHTML = '<div class="cart-promo-banner"><i class="fa-solid fa-truck"></i> Envío GRATIS por 2 perfumes completos (Envíos 1-3 días a todo Colombia)</div>';
        }
    }
}

function saveCart() {
    localStorage.setItem('axxesCart', JSON.stringify(cart));
}
function loadCart() {
    const stored = localStorage.getItem('axxesCart');
    if (stored) {
        cart = JSON.parse(stored);
        updateCartUI();
    }
}

// Global helper for setting active catalog filter (Pills, Nav, Banners, Footer)
window.setCatalogFilter = function(type = 'all', value = 'all') {
    const norm = (str) => String(str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    window.activeCatalogFilter = { type: type, value: value };
    window.activeCatalogCategory = (type === 'category' || type === 'gender') ? value : null;
    window.activeSearchQuery = null;

    // 1. Update visual active state on quick pills
    const quickPills = document.getElementById('store-quick-pills');
    if (quickPills) {
        quickPills.querySelectorAll('.quick-pill').forEach(pill => {
            const pType = pill.dataset.filterType || pill.getAttribute('data-filter-quick') || (pill.dataset.filterCategory ? 'category' : 'all');
            const pVal = pill.dataset.filterValue || pill.dataset.filterCategory || pill.getAttribute('data-filter-quick') || 'all';
            let isMatch = false;
            if (pType === type) {
                if (type === 'all' || type === 'promo' || type === 'combos' || type === 'decants' || type === 'completos') {
                    isMatch = true;
                } else if (norm(pVal) === norm(value)) {
                    isMatch = true;
                }
            }
            pill.classList.toggle('active', isMatch);
        });
    }

    // 2. Clear all sidebar checkboxes to prevent conflicting stale states
    document.querySelectorAll('#store-filters input[type="checkbox"]').forEach(cb => cb.checked = false);

    // 3. Sync with sort select or sidebar checkbox if applicable
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        if (type === 'promo') sortSelect.value = 'promo';
        else if (type === 'combos') sortSelect.value = 'combos';
        else if (sortSelect.value === 'promo' || sortSelect.value === 'combos') {
            sortSelect.value = 'relevance';
        }
    }

    if (type === 'gender') {
        const cb = document.querySelector(`.filter-gender[value="${value}"]`);
        if (cb) cb.checked = true;
    } else if (type === 'category') {
        const cb = Array.from(document.querySelectorAll('.filter-category')).find(c => norm(c.value) === norm(value));
        if (cb) cb.checked = true;
    } else if (type === 'completos') {
        const cb = document.querySelector('.filter-size[value="bottle"]');
        if (cb) cb.checked = true;
    }

    if (type === 'all') {
        const priceSlider = document.getElementById('filter-price-slider');
        const priceVal = document.getElementById('filter-price-val');
        if (priceSlider) priceSlider.value = priceSlider.max;
        if (priceVal && priceSlider) priceVal.innerText = '$' + parseInt(priceSlider.max).toLocaleString('es-CO');
    }

    // 4. Apply filters immediately
    if (typeof window.applyFilters === 'function') {
        window.applyFilters();
    }
};

// Global helper for special filters (Combos / Promos / Todo)
window.filterBySpecial = function(key) {
    if (key === 'promo' || key === 'combos') {
        window.setCatalogFilter(key, key);
    } else {
        window.setCatalogFilter('all', 'all');
    }

    // Smooth scroll to catalog
    const catSec = document.getElementById('catalogo-seccion');
    if (catSec) {
        catSec.scrollIntoView({ behavior: 'smooth' });
    }
};

// 6. Store Logic (Filters & Sort)
function initStoreFilters() {
    const btnOpenFilters = document.getElementById('open-filters-mobile');
    const btnCloseFilters = document.getElementById('close-filters-mobile');
    const filterPanel = document.getElementById('store-filters');
    
    if (btnOpenFilters && filterPanel) {
        btnOpenFilters.addEventListener('click', () => filterPanel.classList.add('active'));
    }
    if (btnCloseFilters && filterPanel) {
        btnCloseFilters.addEventListener('click', () => filterPanel.classList.remove('active'));
    }

    // Attach listeners for sidebar checkboxes
    const checkboxes = document.querySelectorAll('.filter-gender, .filter-category, .filter-brand, .filter-size');
    checkboxes.forEach(cb => cb.addEventListener('change', () => {
        if (window.applyFilters) window.applyFilters();
    }));

    const priceSlider = document.getElementById('filter-price-slider');
    const priceVal = document.getElementById('filter-price-val');
    if(priceSlider) {
        priceSlider.addEventListener('input', (e) => {
            priceVal.innerText = '$' + parseInt(e.target.value).toLocaleString('es-CO');
            if (window.applyFilters) window.applyFilters();
        });
    }

    const sortSelect = document.getElementById('sort-select');
    if(sortSelect) {
        sortSelect.addEventListener('change', () => {
            const val = sortSelect.value;
            if (val === 'promo' || val === 'combos') {
                window.setCatalogFilter(val, val);
            } else {
                if (window.applyFilters) window.applyFilters();
            }
        });
    }

    // Nav links intercept to set filter and scroll
    document.querySelectorAll('a[data-filter-all], a[data-filter-gender], a[data-filter-category], a[data-filter-size], a[data-filter-special]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const special = link.getAttribute('data-filter-special');
            if (special === 'promo' || special === 'combos') {
                window.setCatalogFilter(special, special);
            } else if (link.hasAttribute('data-filter-all')) {
                window.setCatalogFilter('all', 'all');
            } else if (link.getAttribute('data-filter-gender')) {
                window.setCatalogFilter('gender', link.getAttribute('data-filter-gender'));
            } else if (link.getAttribute('data-filter-category')) {
                const cat = link.getAttribute('data-filter-category');
                if (cat === 'Decants') window.setCatalogFilter('decants', 'decants');
                else window.setCatalogFilter('category', cat);
            } else if (link.getAttribute('data-filter-size') === 'bottle') {
                window.setCatalogFilter('completos', 'completos');
            }

            const catSec = document.getElementById('catalogo-seccion');
            if (catSec) catSec.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Quick filter pills listener (delegated)
    const quickPills = document.getElementById('store-quick-pills');
    if (quickPills) {
        quickPills.addEventListener('click', (event) => {
            const pill = event.target.closest('.quick-pill');
            if (!pill || !quickPills.contains(pill)) return;

            const filterType = pill.dataset.filterType || pill.getAttribute('data-filter-quick') || (pill.dataset.filterCategory ? 'category' : 'all');
            const filterValue = pill.dataset.filterValue || pill.dataset.filterCategory || pill.getAttribute('data-filter-quick') || 'all';

            window.setCatalogFilter(filterType, filterValue);
        });
    }
}

window.applyFilters = function() {
    if(!window.axxesStore) return;
    let prods = window.axxesStore.products.filter(p => p.active);

    const norm = (str) => String(str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    // 0. Active Search Query filter
    if (window.activeSearchQuery) {
        const q = norm(window.activeSearchQuery);
        prods = prods.filter(p => {
            const name = norm(p.name);
            const brand = norm(p.brand);
            const desc = norm(p.description);
            const gender = norm(p.gender);
            const cats = Array.isArray(p.categories) ? p.categories.map(norm) : [];
            const cat = norm(p.category);
            return name.includes(q) || brand.includes(q) || desc.includes(q) || gender.includes(q) || cats.some(c => c.includes(q)) || cat.includes(q);
        });
    }

    // 1. Determine active quick pill filter
    const activePill = document.querySelector('#store-quick-pills .quick-pill.active');
    let filterType = 'all';
    let filterVal = 'all';

    if (activePill) {
        filterType = activePill.dataset.filterType || activePill.getAttribute('data-filter-quick') || (activePill.dataset.filterCategory ? 'category' : 'all');
        filterVal = activePill.dataset.filterValue || activePill.dataset.filterCategory || activePill.getAttribute('data-filter-quick') || 'all';
    } else if (window.activeCatalogFilter) {
        filterType = window.activeCatalogFilter.type || 'all';
        filterVal = window.activeCatalogFilter.value || 'all';
    }

    const sortVal = document.getElementById('sort-select') ? document.getElementById('sort-select').value : 'relevance';

    // 2. Quick Pill Filtering
    if (filterType === 'promo' || sortVal === 'promo') {
        prods = prods.filter(p => Boolean(p.isPromo || p.offer || (p.badge && norm(p.badge).includes('promo'))));
    } else if (filterType === 'combos' || sortVal === 'combos') {
        prods = prods.filter(p => Boolean(
            p.isCombo || 
            (Array.isArray(p.categories) && p.categories.some(c => norm(c).includes('combo'))) ||
            (p.category && norm(p.category).includes('combo')) ||
            (p.name && norm(p.name).includes('combo'))
        ));
    } else if (filterType === 'decants') {
        prods = prods.filter(p => Array.isArray(p.decants) && p.decants.length > 0);
    } else if (filterType === 'completos') {
        prods = prods.filter(p => Boolean(p.sellBottle));
    } else if (filterType === 'gender') {
        const targetGender = norm(filterVal);
        prods = prods.filter(p => {
            const g = norm(p.gender);
            const cats = Array.isArray(p.categories) ? p.categories.map(norm) : [];
            const cat = norm(p.category);
            return g === targetGender || cats.includes(targetGender) || cat === targetGender;
        });
    } else if (filterType === 'category') {
        const targetCat = norm(filterVal);
        prods = prods.filter(p => {
            const cats = Array.isArray(p.categories) ? p.categories.map(norm) : [];
            const cat = norm(p.category);
            const g = norm(p.gender);

            // Matches category in array or category field
            if (cats.includes(targetCat) || cat === targetCat) return true;

            // Matches gender if category name is a gender
            if (g === targetCat) return true;

            // Decants
            if (targetCat === 'decants' && Array.isArray(p.decants) && p.decants.length > 0) return true;

            // Perfumes completos
            if ((targetCat === 'perfumes completos' || targetCat === 'completos') && p.sellBottle) return true;

            // Brand match
            if (norm(p.brand) === targetCat) return true;

            return false;
        });
    }

    // 3. Sidebar checkbox filters (when in 'all' or in combination)
    const selectedGenders = Array.from(document.querySelectorAll('.filter-gender:checked')).map(cb => norm(cb.value));
    const selectedCategories = Array.from(document.querySelectorAll('.filter-category:checked')).map(cb => norm(cb.value));
    const selectedBrands = Array.from(document.querySelectorAll('.filter-brand:checked')).map(cb => cb.value);
    const selectedSizes = Array.from(document.querySelectorAll('.filter-size:checked')).map(cb => cb.value);
    const maxPrice = document.getElementById('filter-price-slider') ? parseInt(document.getElementById('filter-price-slider').value) : 9999999;

    if (filterType === 'all') {
        if (selectedGenders.length > 0) {
            prods = prods.filter(p => selectedGenders.includes(norm(p.gender)));
        }
        if (selectedCategories.length > 0) {
            prods = prods.filter(p => {
                const cats = Array.isArray(p.categories) ? p.categories.map(norm) : [];
                const cat = norm(p.category);
                return cats.some(c => selectedCategories.includes(c)) || selectedCategories.includes(cat);
            });
        }
    }

    if (selectedBrands.length > 0) {
        prods = prods.filter(p => selectedBrands.includes(p.brand));
    }
    
    // Size filter: show only products that have the selected size available
    if (selectedSizes.length > 0) {
        prods = prods.filter(p => {
            if (selectedSizes.includes('bottle') && p.sellBottle) return true;
            if (Array.isArray(p.decants)) {
                return p.decants.some(d => selectedSizes.includes(d.size));
            }
            return false;
        });
    }
    
    // Price filter on lowest available price
    prods = prods.filter(p => {
        let lowestPrice = p.sellBottle ? p.priceBottle : Infinity;
        if (Array.isArray(p.decants)) {
            p.decants.forEach(d => {
                if (d.price && d.price < lowestPrice) lowestPrice = d.price;
            });
        }
        return lowestPrice <= maxPrice;
    });

    // 4. Sorting
    const getProductTime = (p) => {
        if (p.createdAt) return new Date(p.createdAt).getTime();
        if (p.created_at) return new Date(p.created_at).getTime();
        return 0;
    };

    if (sortVal === 'price-asc') {
        prods.sort((a,b) => {
            const pa = a.priceBottle || (a.decants && a.decants[0] ? a.decants[0].price : 0);
            const pb = b.priceBottle || (b.decants && b.decants[0] ? b.decants[0].price : 0);
            return pa - pb;
        });
    } else if (sortVal === 'price-desc') {
        prods.sort((a,b) => {
            const pa = a.priceBottle || (a.decants && a.decants[0] ? a.decants[0].price : 0);
            const pb = b.priceBottle || (b.decants && b.decants[0] ? b.decants[0].price : 0);
            return pb - pa;
        });
    } else if (sortVal === 'bestseller') {
        prods.sort((a,b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
    } else if (sortVal === 'recent') {
        prods.sort((a,b) => {
            const tb = getProductTime(b);
            const ta = getProductTime(a);
            return (tb - ta) || ((b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        });
    } else {
        // 'relevance', 'promo', 'combos': New products first
        prods.sort((a,b) => {
            const tb = getProductTime(b);
            const ta = getProductTime(a);
            if (tb !== ta) return tb - ta;
            const idB = parseInt(b.id) || 0;
            const idA = parseInt(a.id) || 0;
            return idB - idA;
        });
    }

    if (typeof window.renderStoreGrid === 'function') {
        window.renderStoreGrid(prods);
    }
};


// 7. Admin Access (User Icon + Logo 3-clicks + Floating Btn)
function initAdminAccess() {
    // Access 1: User Icon
    const userBtn = document.getElementById('admin-login-btn');
    if(userBtn) {
        userBtn.addEventListener('click', () => {
            if (typeof showPinModal === 'function') showPinModal();
        });
    }

    // Access 2: Floating Admin Button
    const floatAdminBtn = document.getElementById('floating-admin-btn');
    if(floatAdminBtn) {
        floatAdminBtn.addEventListener('click', () => {
            if (typeof showPinModal === 'function') showPinModal();
        });
    }

    // Access 3: Logo 3 Clicks
    const logos = document.querySelectorAll('.logo-img');
    let clickCount = 0;
    let clickTimer;
    logos.forEach(logo => {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            clickCount++;
            clearTimeout(clickTimer);
            if (clickCount >= 3) {
                if (typeof showPinModal === 'function') showPinModal();
                clickCount = 0;
            } else {
                clickTimer = setTimeout(() => clickCount = 0, 500);
            }
        });
    });
}

// 9. Logo updater — listen for logo changes from admin
function initLogoUpdater() {
    document.addEventListener('axxesDataUpdated', () => {
        if (window.axxesStore && window.axxesStore.siteConfig && window.axxesStore.siteConfig.logo) {
            const logoSrc = window.axxesStore.siteConfig.logo;
            const siteLogo = document.getElementById('site-logo');
            const footerLogo = document.getElementById('footer-logo');
            if (siteLogo) siteLogo.src = logoSrc;
            if (footerLogo) footerLogo.src = logoSrc;
        }
    });
    
    // Apply on load too
    if (window.axxesStore && window.axxesStore.siteConfig && window.axxesStore.siteConfig.logo) {
        const logoSrc = window.axxesStore.siteConfig.logo;
        const siteLogo = document.getElementById('site-logo');
        const footerLogo = document.getElementById('footer-logo');
        if (siteLogo) siteLogo.src = logoSrc;
        if (footerLogo) footerLogo.src = logoSrc;
    }
}

// 10. Horizontal Steps Carousel on Mobile
function initStepsCarousel() {
    const track = document.getElementById('steps-enhanced-track');
    const dotsContainer = document.getElementById('steps-nav-dots');
    if (!track || !dotsContainer) return;
    
    const dots = dotsContainer.querySelectorAll('.step-dot');
    const items = track.querySelectorAll('.step-enhanced-item');
    if (!dots.length || !items.length) return;

    // Click dot to scroll to card
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (items[index]) {
                items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        });
    });

    // Update active dot on scroll
    let scrollTimer;
    track.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            const trackRect = track.getBoundingClientRect();
            const trackCenter = trackRect.left + trackRect.width / 2;
            let closestIndex = 0;
            let minDistance = Infinity;

            items.forEach((item, index) => {
                const itemRect = item.getBoundingClientRect();
                const itemCenter = itemRect.left + itemRect.width / 2;
                const distance = Math.abs(trackCenter - itemCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });

            dots.forEach((d, idx) => {
                d.classList.toggle('active', idx === closestIndex);
            });
        }, 50);
    }, { passive: true });
}
