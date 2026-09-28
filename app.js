// AXXES PARFUM - Premium Logic

document.addEventListener("DOMContentLoaded", () => {
    // Remove loading state
    setTimeout(() => {
        document.body.classList.remove('loading-state');
        document.querySelectorAll('.hero-content .fade-up').forEach(el => el.classList.add('is-visible'));
    }, 100);

    initScrollFeatures();
    initModalsAndDrawers();
    initCart();
    initCarousels();
});

// Scroll Effects (Header, Reveals, Parallax)
function initScrollFeatures() {
    const header = document.getElementById("header");
    const parallaxImgs = document.querySelectorAll('.parallax-img');
    
    // Intersection Observer for reveals
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Scroll listener for header & parallax
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        // Header
        if (scrollY > 50) header.classList.add("scrolled");
        else header.classList.remove("scrolled");

        // Parallax
        parallaxImgs.forEach(img => {
            const speed = 0.3;
            img.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });
}

// Modals, Drawers, Mobile Nav, Quiz
function initModalsAndDrawers() {
    // Mobile Nav
    const burger = document.getElementById("mobile-menu-btn");
    const mobileNav = document.getElementById("mobile-nav");
    const mobileLinks = mobileNav.querySelectorAll('a');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        mobileNav.classList.toggle('open');
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            mobileNav.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Search
    const btnSearch = document.getElementById("open-search");
    const modalSearch = document.getElementById("search-modal");
    const closeSearch = document.getElementById("close-search");
    const inputSearch = document.getElementById("mega-search");

    btnSearch.addEventListener('click', () => {
        modalSearch.classList.add('active');
        setTimeout(() => inputSearch.focus(), 100);
        document.body.style.overflow = 'hidden';
    });

    closeSearch.addEventListener('click', () => {
        modalSearch.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Quiz
    const btnStartQuiz = document.getElementById("start-quiz");
    const modalQuiz = document.getElementById("quiz-modal");
    const btnCloseQuiz = document.getElementById("close-quiz");

    btnStartQuiz.addEventListener('click', () => {
        modalQuiz.classList.add('active');
        resetQuiz();
        document.body.style.overflow = 'hidden';
    });

    btnCloseQuiz.addEventListener('click', () => closeQuiz());
}

// Quiz Logic
function nextQuizStep(step) {
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`q-step-${step}`).classList.add('active');
}

function resetQuiz() {
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`q-step-1`).classList.add('active');
}

function closeQuiz() {
    document.getElementById("quiz-modal").classList.remove('active');
    document.body.style.overflow = '';
}

// Cart Logic
let cart = [];

function initCart() {
    const openCartBtn = document.getElementById("open-cart");
    const closeCartBtn = document.getElementById("close-cart");
    const cartDrawer = document.getElementById("cart-drawer");
    const cartOverlay = document.getElementById("cart-overlay");
    const addBtns = document.querySelectorAll(".btn-add");

    const openCart = () => {
        cartDrawer.classList.add("open");
        cartOverlay.classList.add("active");
        document.body.style.overflow = 'hidden';
    };

    const closeCart = () => {
        cartDrawer.classList.remove("open");
        cartOverlay.classList.remove("active");
        document.body.style.overflow = '';
    };

    openCartBtn.addEventListener("click", openCart);
    closeCartBtn.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);

    addBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const data = e.target.dataset;
            addToCart({
                id: data.id,
                name: data.name,
                price: parseFloat(data.price),
                img: data.img,
                qty: 1
            });
            openCart();
        });
    });

    updateCartUI(); // init empty
}

function addToCart(product) {
    const existing = cart.find(item => item.id == product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push(product);
    }
    updateCartUI();
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id == id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(i => i.id != id);
        updateCartUI();
    }
}

function formatPrice(num) {
    return "$" + num.toLocaleString('es-CO');
}

function updateCartUI() {
    const container = document.getElementById("cart-items");
    const subtotalEl = document.getElementById("cart-subtotal");
    const countEl = document.querySelector(".cart-count");
    
    let subtotal = 0;
    let itemsCount = 0;
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío.</div>';
    } else {
        cart.forEach(item => {
            subtotal += item.price * item.qty;
            itemsCount += item.qty;
            
            container.innerHTML += `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${formatPrice(item.price)}</div>
                        <div class="qty-ctrl">
                            <button onclick="updateQty(${item.id}, -1)"><i class="fa-solid fa-minus"></i></button>
                            <span>${item.qty}</span>
                            <button onclick="updateQty(${item.id}, 1)"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    countEl.textContent = itemsCount;
    subtotalEl.textContent = formatPrice(subtotal);

    // Se eliminó la lógica de envío gratis
}

// Attach globals for inline onclicks
window.updateQty = updateQty;
window.nextQuizStep = nextQuizStep;
window.closeQuiz = closeQuiz;

// Simple Carousel Logic
function initCarousels() {
    const blocks = document.querySelectorAll('.carousel-block');
    blocks.forEach(block => {
        const track = block.querySelector('.carousel-track');
        const prev = block.querySelector('.prev-btn') || block.querySelector('.prev-btn-2');
        const next = block.querySelector('.next-btn') || block.querySelector('.next-btn-2');
        
        let scrollPos = 0;
        const step = 320; // approx card width + gap

        if (prev && next) {
            next.addEventListener('click', () => {
                const maxScroll = track.scrollWidth - track.clientWidth;
                scrollPos += step;
                if (scrollPos > maxScroll) scrollPos = maxScroll;
                track.style.transform = `translateX(-${scrollPos}px)`;
            });

            prev.addEventListener('click', () => {
                scrollPos -= step;
                if (scrollPos < 0) scrollPos = 0;
                track.style.transform = `translateX(-${scrollPos}px)`;
            });
        }
    });
}
