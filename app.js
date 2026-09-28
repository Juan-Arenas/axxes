// Axxes Parfum - Logic

const products = [
    {
        id: 1,
        name: "Noir Absolu",
        brand: "Axxes Exclusive",
        family: "amaderada",
        gender: "hombre",
        price: 245.00,
        img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        available: true
    },
    {
        id: 2,
        name: "Blanc Éternel",
        brand: "Maison Blanc",
        family: "floral",
        gender: "mujer",
        price: 180.00,
        img: "https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        available: true
    },
    {
        id: 3,
        name: "Citrus Vibe",
        brand: "Axxes",
        family: "citrica",
        gender: "unisex",
        price: 150.00,
        img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        available: true
    },
    {
        id: 4,
        name: "Oud Mystère",
        brand: "Orient Collection",
        family: "oriental",
        gender: "unisex",
        price: 320.00,
        img: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        available: true
    },
    {
        id: 5,
        name: "Rose Intense",
        brand: "Maison Blanc",
        family: "floral",
        gender: "mujer",
        price: 195.00,
        img: "https://images.unsplash.com/photo-1557170334-a9632e77c6e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        available: true
    },
    {
        id: 6,
        name: "Vetiver Prive",
        brand: "Axxes Exclusive",
        family: "amaderada",
        gender: "hombre",
        price: 210.00,
        img: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        available: true
    }
];

let cart = [];

document.addEventListener("DOMContentLoaded", () => {
    initHeaderScroll();
    initMobileMenu();
    initScrollAnimations();
    renderProducts(products);
    initFilters();
    initCart();
});

// Header scroll effect
function initHeaderScroll() {
    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}

// Mobile Menu
function initMobileMenu() {
    const openBtn = document.getElementById("mobile-menu-btn");
    const closeBtn = document.getElementById("close-menu");
    const nav = document.getElementById("mobile-nav");
    const links = nav.querySelectorAll("a");

    openBtn.addEventListener("click", () => nav.classList.add("open"));
    closeBtn.addEventListener("click", () => nav.classList.remove("open"));
    
    links.forEach(link => {
        link.addEventListener("click", () => nav.classList.remove("open"));
    });
}

// Render Products in Catalog
function renderProducts(productsToRender) {
    const grid = document.getElementById("products-grid");
    grid.innerHTML = "";

    if (productsToRender.length === 0) {
        grid.innerHTML = "<p style='text-align:center; width:100%; grid-column: 1/-1;'>No se encontraron perfumes con esos filtros.</p>";
        return;
    }

    productsToRender.forEach((product, index) => {
        const delay = (index % 3) * 0.2;
        const card = document.createElement("div");
        card.className = "product-card fade-in-up";
        card.style.animationDelay = `${delay}s`;
        
        card.innerHTML = `
            <img src="${product.img}" alt="${product.name}" class="product-image">
            <span class="product-brand">${product.brand}</span>
            <h3 class="product-name">${product.name}</h3>
            <span class="product-family">${capitalize(product.family)} | ${capitalize(product.gender)}</span>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-img="${product.img}">Comprar</button>
                <button class="btn-fav" aria-label="Añadir a favoritos"><i class="fa-regular fa-heart"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });

    attachCartEvents();
    attachFavEvents();
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Filters & Search
function initFilters() {
    const filterBtn = document.getElementById("filter-btn");
    const filtersPanel = document.getElementById("filters-panel");
    const searchInput = document.getElementById("search-input");
    const filterGender = document.getElementById("filter-gender");
    const filterFamily = document.getElementById("filter-family");

    filterBtn.addEventListener("click", () => {
        filtersPanel.classList.toggle("active");
    });

    const applyFilters = () => {
        const term = searchInput.value.toLowerCase();
        const gender = filterGender.value;
        const family = filterFamily.value;

        const filtered = products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term);
            const matchesGender = gender === "all" || p.gender === gender;
            const matchesFamily = family === "all" || p.family === family;
            return matchesSearch && matchesGender && matchesFamily;
        });

        renderProducts(filtered);
    };

    searchInput.addEventListener("input", applyFilters);
    filterGender.addEventListener("change", applyFilters);
    filterFamily.addEventListener("change", applyFilters);
}

// Cart Logic
function initCart() {
    const openCartBtn = document.getElementById("open-cart");
    const closeCartBtn = document.getElementById("close-cart");
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");
    const continueShopping = document.getElementById("continue-shopping");
    const checkoutBtn = document.getElementById("checkout-btn");

    const openCart = () => {
        cartSidebar.classList.add("open");
        cartOverlay.classList.add("active");
    };

    const closeCart = () => {
        cartSidebar.classList.remove("open");
        cartOverlay.classList.remove("active");
    };

    openCartBtn.addEventListener("click", openCart);
    closeCartBtn.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);
    continueShopping.addEventListener("click", closeCart);

    checkoutBtn.addEventListener("click", () => {
        if(cart.length > 0) {
            alert("Redirigiendo a pasarela de pago segura...");
        } else {
            alert("Tu carrito está vacío.");
        }
    });

    attachCartEvents(); // from featured product
}

function attachCartEvents() {
    const btns = document.querySelectorAll(".add-to-cart-btn");
    btns.forEach(btn => {
        // Remove old listeners to prevent duplicates
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener("click", (e) => {
            const dataset = e.target.closest("button").dataset;
            addToCart({
                id: dataset.id,
                name: dataset.name,
                price: parseFloat(dataset.price),
                img: dataset.img,
                qty: 1
            });
            document.getElementById("cart-sidebar").classList.add("open");
            document.getElementById("cart-overlay").classList.add("active");
        });
    });
}

function attachFavEvents() {
    const favBtns = document.querySelectorAll(".btn-fav");
    favBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            this.classList.toggle("active");
            const icon = this.querySelector("i");
            if(this.classList.contains("active")) {
                icon.classList.remove("fa-regular");
                icon.classList.add("fa-solid");
            } else {
                icon.classList.remove("fa-solid");
                icon.classList.add("fa-regular");
            }
        });
    });
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

function removeFromCart(id) {
    cart = cart.filter(item => item.id != id);
    updateCartUI();
}

function changeQty(id, delta) {
    const item = cart.find(item => item.id == id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    }
}

function updateCartUI() {
    const itemsContainer = document.getElementById("cart-items");
    const countBadge = document.querySelector(".cart-count");
    const subtotalEl = document.getElementById("cart-subtotal");

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío.</div>';
        countBadge.textContent = "0";
        subtotalEl.textContent = "$0.00";
        return;
    }

    let subtotal = 0;
    let totalItems = 0;
    itemsContainer.innerHTML = "";

    cart.forEach(item => {
        subtotal += item.price * item.qty;
        totalItems += item.qty;

        const el = document.createElement("div");
        el.className = "cart-item";
        el.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <div class="qty-control">
                        <button class="qty-btn" onclick="changeQty(${item.id}, -1)"><i class="fa-solid fa-minus"></i></button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${item.id}, 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})"><i class="fa-regular fa-trash-can"></i></button>
                </div>
            </div>
        `;
        itemsContainer.appendChild(el);
    });

    countBadge.textContent = totalItems;
    subtotalEl.textContent = "$" + subtotal.toFixed(2);
}

// Expose functions to global scope for inline onclicks in generated HTML
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;

// Intersection Observer for scroll animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-on-scroll, section:not(.hero)').forEach(el => {
        el.classList.add('fade-on-scroll');
        observer.observe(el);
    });
}
