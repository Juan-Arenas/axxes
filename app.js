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
    initCartUI();
    initQuiz();
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
    
    // Swipe logic
    let startX = 0;
    track.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    track.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) nextSlide();
        else if (endX - startX > 50) prevSlide();
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

// 4. Mega Search
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

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        const prods = window.axxesStore.products.filter(p => p.active);
        const matches = prods.filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.brand && p.brand.toLowerCase().includes(query)) ||
            (p.categories && p.categories.some(c => c.toLowerCase().includes(query)))
        ).slice(0, 5);

        if (matches.length === 0) {
            resultsContainer.innerHTML = '<p>No se encontraron resultados.</p>';
            return;
        }

        resultsContainer.innerHTML = matches.map(p => `
            <div style="display:flex; gap:15px; align-items:center; cursor:pointer;" onclick="window.location.hash='catalogo-seccion'; document.getElementById('close-search').click();">
                <img src="${p.image || 'logo.webp'}" alt="${p.name}" onerror="this.onerror=null;this.src='logo.webp';" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">
                <div>
                    <h4 style="font-family:var(--font-heading); font-size:1.1rem; margin-bottom:0;">${p.name}</h4>
                    <span style="font-size:0.8rem; color:#888; text-transform:uppercase;">${p.brand}</span>
                </div>
            </div>
        `).join('');
    });
}

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

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; margin-top:2rem; color:#888;">Tu carrito está vacío.</p>';
        subtotalEl.innerText = '$0';
        countEls.forEach(el => el.innerText = '0');
        return;
    }

    let totalQty = 0;
    let subtotal = 0;

    container.innerHTML = cart.map(item => {
        totalQty += item.qty;
        subtotal += item.price * item.qty;
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

    // Attach listeners
    const checkboxes = document.querySelectorAll('.filter-gender, .filter-category, .filter-brand, .filter-size');
    checkboxes.forEach(cb => cb.addEventListener('change', window.applyFilters));

    const priceSlider = document.getElementById('filter-price-slider');
    const priceVal = document.getElementById('filter-price-val');
    if(priceSlider) {
        priceSlider.addEventListener('input', (e) => {
            priceVal.innerText = '$' + parseInt(e.target.value).toLocaleString('es-CO');
            window.applyFilters();
        });
    }

    const sortSelect = document.getElementById('sort-select');
    if(sortSelect) sortSelect.addEventListener('change', window.applyFilters);

    // Initial nav links intercept to set filter and scroll
    document.querySelectorAll('a[data-filter-gender], a[data-filter-category]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const g = link.getAttribute('data-filter-gender');
            const c = link.getAttribute('data-filter-category');
            
            // reset all checkboxes
            document.querySelectorAll('#store-filters input[type="checkbox"]').forEach(cb => cb.checked = false);
            
            if(g) {
                const cb = document.querySelector(`.filter-gender[value="${g}"]`);
                if(cb) cb.checked = true;
            }
            if(c) {
                const cb = document.querySelector(`.filter-category[value="${c}"]`);
                if(cb) cb.checked = true;
            }
            window.applyFilters();
            document.getElementById('catalogo-seccion').scrollIntoView({behavior: 'smooth'});
        });
    });
}

window.applyFilters = function() {
    if(!window.axxesStore) return;
    let prods = window.axxesStore.products.filter(p => p.active);

    // Get active filters
    const selectedGenders = Array.from(document.querySelectorAll('.filter-gender:checked')).map(cb => cb.value);
    const selectedCategories = Array.from(document.querySelectorAll('.filter-category:checked')).map(cb => cb.value);
    const selectedBrands = Array.from(document.querySelectorAll('.filter-brand:checked')).map(cb => cb.value);
    const selectedSizes = Array.from(document.querySelectorAll('.filter-size:checked')).map(cb => cb.value);
    const maxPrice = document.getElementById('filter-price-slider') ? parseInt(document.getElementById('filter-price-slider').value) : 9999999;

    if (selectedGenders.length > 0) {
        prods = prods.filter(p => selectedGenders.includes(p.gender));
    }
    if (selectedCategories.length > 0) {
        prods = prods.filter(p => {
            if (Array.isArray(p.categories)) {
                return p.categories.some(c => selectedCategories.includes(c));
            }
            return selectedCategories.includes(p.category);
        });
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
                if (d.price < lowestPrice) lowestPrice = d.price;
            });
        }
        return lowestPrice <= maxPrice;
    });

    // Sort
    const sortVal = document.getElementById('sort-select') ? document.getElementById('sort-select').value : 'relevance';
    if (sortVal === 'price-asc') prods.sort((a,b) => a.priceBottle - b.priceBottle);
    if (sortVal === 'price-desc') prods.sort((a,b) => b.priceBottle - a.priceBottle);
    if (sortVal === 'bestseller') prods.sort((a,b) => (b.bestseller?1:0) - (a.bestseller?1:0));
    if (sortVal === 'recent') prods.sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0));

    if(window.renderStoreGrid) window.renderStoreGrid(prods);
};


// 7. Quiz Logic
let quizAnswers = {};

function initQuiz() {
    const btn = document.getElementById('start-quiz');
    const modal = document.getElementById('quiz-modal');
    if(!btn || !modal) return;
    btn.addEventListener('click', () => modal.classList.add('active'));
}

window.nextQuizStep = function(nextStep, key, val) {
    quizAnswers[key] = val;
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.remove('active'));
    document.getElementById('q-step-' + nextStep).classList.add('active');
};

window.finishQuiz = function(key, val) {
    quizAnswers[key] = val;
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.remove('active'));
    
    // Calculate recommendation based on gender and aroma
    const prods = window.axxesStore.products.filter(p => p.active);
    let recom = prods.filter(p => p.gender === quizAnswers.gender || p.gender === 'Unisex');
    recom = recom.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const resGrid = document.getElementById('quiz-results-grid');
    resGrid.innerHTML = recom.map(p => `
        <div style="background:#f5f5f5; padding:15px; border-radius:8px;">
            <img src="${p.image || 'logo.webp'}" onerror="this.onerror=null;this.src='logo.webp';" style="width:100%; aspect-ratio:1; object-fit:contain; margin-bottom:10px;">
            <h5 style="font-family:var(--font-heading); font-size:1.1rem; margin-bottom:5px;">${p.name}</h5>
            <p style="font-weight:bold;">$${p.priceBottle.toLocaleString('es-CO')}</p>
        </div>
    `).join('');
    
    document.getElementById('q-result').classList.add('active');
};

window.closeQuiz = function() {
    document.getElementById('quiz-modal').classList.remove('active');
    setTimeout(() => {
        document.querySelectorAll('.quiz-step').forEach(el => el.classList.remove('active'));
        document.getElementById('q-step-1').classList.add('active');
        quizAnswers = {};
    }, 300);
};

// 8. Admin Access (User Icon + Logo 3-clicks + Floating Btn)
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
