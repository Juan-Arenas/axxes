document.addEventListener("DOMContentLoaded", () => {
    let logoClicks = 0;
    let logoClickTimer;

    const logo = document.querySelector('.logo-img');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            logoClicks++;
            
            clearTimeout(logoClickTimer);
            logoClickTimer = setTimeout(() => {
                logoClicks = 0;
            }, 1000);

            if (logoClicks === 3) {
                logoClicks = 0;
                showPinModal();
            }
        });
    }

    injectAdminCSS();
    injectAdminHTML();
});

function injectAdminCSS() {
    if (document.getElementById('axxes-admin-css')) return;
    const style = document.createElement('style');
    style.id = 'axxes-admin-css';
    style.innerHTML = `
        :root {
            --axxes-light: #ffffff;
            --axxes-dark: #050505;
            --axxes-gray: #1a1a1a;
            --border-axxes: #333333;
            --border-subtle: #222222;
            --bg-main: #111111;
            --text-main: #ffffff;
            --text-muted: #8e8e8e;
            --radius-full: 50px;
            --radius-sm: 6px;
            --radius-md: 12px;
            --radius-lg: 20px;
        }

        .modal.admin-fullscreen-modal {
            padding: 16px;
            z-index: 99999;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(10px);
            display: none;
            align-items: center;
            justify-content: center;
        }

        .modal-content.admin-panel-content {
            max-width: 1360px !important;
            width: 96vw !important;
            height: 94vh !important;
            margin: auto !important;
            display: flex !important;
            flex-direction: column !important;
            padding: 24px 28px !important;
            background: var(--axxes-dark) !important;
            border: 1px solid var(--border-axxes) !important;
            border-radius: var(--radius-lg) !important;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.8) !important;
            color: var(--text-main);
        }

        .admin-panel-header {
            display: flex; align-items: center; justify-content: space-between;
            padding-bottom: 14px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 16px;
        }
        .admin-panel-header h2 { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 900; }
        .admin-subtitle { font-size: 0.8rem; color: var(--text-muted); }
        .admin-header-stats { display: flex; gap: 8px; }
        .admin-stat-pill { background: var(--axxes-gray); border: 1px solid var(--border-axxes); padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 700; color: var(--axxes-light); }
        .admin-panel-body { flex-grow: 1; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; gap: 18px; }
        .admin-grid-two { display: grid; grid-template-columns: 1.35fr 0.95fr; gap: 16px; }
        .admin-card { background: var(--bg-main); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; }
        .admin-card-header { margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle); }
        
        .admin-form .form-group { margin-bottom: 12px; }
        .admin-form label { display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; }
        .admin-form input[type="text"], .admin-form input[type="number"], .admin-form select {
            width: 100%; padding: 9px 12px; background: var(--axxes-dark); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); color: var(--text-main); font-size: 0.88rem; outline: none;
        }
        .admin-form input:focus, .admin-form select:focus { border-color: var(--axxes-light); }
        .admin-form small { display: block; font-size: 0.72rem; color: var(--text-muted); margin-top: 3px; }
        
        .btn-primary { background: var(--axxes-light); color: var(--axxes-dark); border: none; padding: 10px 18px; border-radius: var(--radius-full); font-weight: 700; cursor: pointer; }
        .btn-secondary { background: transparent; color: var(--axxes-light); border: 1px solid var(--border-axxes); padding: 10px 18px; border-radius: var(--radius-full); font-weight: 700; cursor: pointer; }
        
        .admin-prods-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; max-height: 540px; overflow-y: auto; }
        .admin-prod-card { background: var(--axxes-dark); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; display: flex; flex-direction: column; gap: 8px; }
        .admin-prod-card-main { display: flex; gap: 10px; align-items: center; }
        .admin-prod-thumb { width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-sm); }
        .admin-prod-actions { display: flex; gap: 4px; justify-content: flex-end; }
        .admin-action-btn { padding: 4px 8px; border-radius: var(--radius-sm); font-size: 0.72rem; cursor: pointer; border: none; }
        
        .pin-input-group { display: flex; gap: 8px; justify-content: center; margin: 12px 0; }
        .pin-digit { width: 46px; height: 50px; text-align: center; font-size: 1.4rem; font-weight: 900; background: var(--axxes-dark); border: 2px solid var(--border-axxes); border-radius: var(--radius-sm); color: var(--text-main); outline: none; }
    `;
    document.head.appendChild(style);
}

function injectAdminHTML() {
    if (document.getElementById('axxes-admin-wrapper')) return;
    const html = `
    <div id="axxes-admin-wrapper">
        <!-- Admin Authentication Modal -->
        <div id="admin-password-modal" class="modal admin-fullscreen-modal">
            <div class="modal-content" style="max-width: 420px; text-align: center; background:var(--axxes-dark); padding:30px; border-radius:12px; border:1px solid #333;">
                <img src="logo.jpeg" alt="AXXES" style="height:40px;margin-bottom:1rem;filter:invert(1);">
                <h3 style="margin-bottom: 0.5rem; font-family:'Playfair Display', serif;">Acceso Administrativo</h3>
                <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 12px;">Ingresa el PIN de 4 dígitos para gestionar el catálogo:</p>
                
                <form id="admin-login-form" class="admin-form">
                    <div class="pin-input-group" id="admin-pin-group">
                        <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" id="admin-pin-input-1" class="pin-digit" autocomplete="off">
                        <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" id="admin-pin-input-2" class="pin-digit" autocomplete="off">
                        <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" id="admin-pin-input-3" class="pin-digit" autocomplete="off">
                        <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" id="admin-pin-input-4" class="pin-digit" autocomplete="off">
                    </div>
                    <button class="btn-primary" type="submit" style="width: 100%; margin-top: 10px;">
                        <i class="fas fa-key"></i> Entrar al Panel
                    </button>
                    <button class="btn-secondary" type="button" onclick="document.getElementById('admin-password-modal').style.display='none'" style="width: 100%; margin-top: 10px;">Cerrar</button>
                    <p class="admin-message" id="admin-login-message" style="color: #ff4444; font-size: 0.85rem; margin-top: 8px; font-weight: 700;"></p>
                </form>
            </div>
        </div>

        <!-- Admin Management Panel -->
        <div id="admin-panel" class="modal admin-fullscreen-modal">
            <div class="modal-content admin-panel-content">
                <div class="admin-panel-header">
                    <div class="admin-header-title-wrap">
                        <h2>Panel Administrativo AXXES</h2>
                        <p class="admin-subtitle">Gestión de catálogo, categorías y sincronización.</p>
                    </div>
                    <div class="admin-header-stats">
                        <span class="admin-stat-pill" id="admin-header-product-stat">0 Productos</span>
                        <span class="admin-stat-pill" id="admin-header-category-stat">0 Categorías</span>
                    </div>
                    <button class="btn-secondary" id="admin-panel-close" title="Cerrar panel">&times; Cerrar</button>
                </div>

                <div class="admin-panel-body">
                    <div class="admin-grid-two">
                        <!-- Add / Edit Product Card -->
                        <div class="admin-card" id="admin-product-card-form">
                            <div class="admin-card-header">
                                <h3 id="admin-form-heading">Agregar Producto</h3>
                            </div>
                            
                            <form id="admin-product-form" class="admin-form">
                                <input type="hidden" id="admin-product-id">
                                <div class="form-group">
                                    <label>Nombre del Producto *</label>
                                    <input type="text" id="admin-product-name" required>
                                </div>
                                <div class="form-group">
                                    <label>Marca *</label>
                                    <input type="text" id="admin-product-brand" required>
                                </div>

                                <div class="form-group">
                                    <label>Precio Botella ($ COP) *</label>
                                    <input type="number" id="admin-product-price" required>
                                </div>

                                <div class="form-group">
                                    <label>URL de Imagen *</label>
                                    <input type="text" id="admin-product-image" required>
                                </div>

                                <!-- DECANTS INSTEAD OF SKIN TONES -->
                                <div class="form-group" style="background:#1a1a1a; padding:10px; border-radius:6px; border:1px solid #333;">
                                    <label style="margin-bottom:10px;">Gestión de Decants</label>
                                    
                                    <div style="display:flex; gap:20px; margin-bottom:10px;">
                                        <label style="display:flex; align-items:center; gap:5px;"><input type="checkbox" id="admin-decant-5ml"> Habilitar 5 ml</label>
                                        <label style="display:flex; align-items:center; gap:5px;"><input type="checkbox" id="admin-decant-10ml"> Habilitar 10 ml</label>
                                        <label style="display:flex; align-items:center; gap:5px;"><input type="checkbox" id="admin-decant-30ml"> Habilitar 30 ml</label>
                                    </div>

                                    <div style="display:flex; gap:10px;">
                                        <input type="number" id="admin-price-5ml" placeholder="Precio 5 ml">
                                        <input type="number" id="admin-price-10ml" placeholder="Precio 10 ml">
                                        <input type="number" id="admin-price-30ml" placeholder="Precio 30 ml">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Categoría</label>
                                    <select id="admin-product-category"></select>
                                </div>

                                <div class="form-group" style="display: flex; gap:15px; margin-top:15px;">
                                    <label style="display:flex; align-items:center; gap:5px;"><input type="checkbox" id="admin-product-active" checked> Activo</label>
                                    <label style="display:flex; align-items:center; gap:5px;"><input type="checkbox" id="admin-product-featured"> Destacado</label>
                                    <label style="display:flex; align-items:center; gap:5px;"><input type="checkbox" id="admin-product-offer"> Oferta</label>
                                </div>

                                <div class="admin-form-actions">
                                    <button class="btn-primary" type="submit" id="admin-product-submit-btn">Guardar</button>
                                    <button class="btn-secondary" type="button" onclick="document.getElementById('admin-product-form').reset();document.getElementById('admin-product-id').value='';">Limpiar</button>
                                </div>
                            </form>
                        </div>

                        <div class="admin-card">
                            <div class="admin-card-header"><h3>Categorías</h3></div>
                            <form id="admin-category-form" class="admin-form">
                                <div class="form-group">
                                    <div style="display: flex; gap: 8px;">
                                        <input type="text" id="admin-new-category" placeholder="Nueva categoría" required>
                                        <button class="btn-primary" type="submit">+</button>
                                    </div>
                                </div>
                            </form>
                            <div id="admin-category-list" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;"></div>
                            
                            <hr style="border:0; border-top:1px solid #333; margin:20px 0;">
                            
                            <div class="admin-card-header"><h3>Base de Datos / Backup</h3></div>
                            <button class="btn-secondary" style="width:100%; margin-bottom:10px;" onclick="window.axxesStore.exportBackup()">Exportar Catálogo (.json)</button>
                        </div>
                    </div>

                    <div class="admin-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h3>Inventario</h3>
                            <input type="text" id="admin-product-search" placeholder="Buscar..." style="padding:8px; background:#050505; border:1px solid #333; color:white; border-radius:4px;">
                        </div>
                        <div class="admin-prods-grid" id="admin-product-list"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    setupAdminEvents();
}

function showPinModal() {
    document.getElementById('admin-password-modal').style.display = 'flex';
    document.getElementById('admin-pin-input-1').focus();
}

function setupAdminEvents() {
    // PIN Logic
    const inputs = [
        document.getElementById('admin-pin-input-1'),
        document.getElementById('admin-pin-input-2'),
        document.getElementById('admin-pin-input-3'),
        document.getElementById('admin-pin-input-4')
    ];

    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < 3) {
                inputs[index + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    document.getElementById('admin-login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = inputs.map(i => i.value).join('');
        if (pin === '2006') {
            document.getElementById('admin-password-modal').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'flex';
            renderAdminDashboard();
        } else {
            document.getElementById('admin-login-message').textContent = 'PIN Incorrecto';
            inputs.forEach(i => i.value = '');
            inputs[0].focus();
        }
    });

    document.getElementById('admin-panel-close').addEventListener('click', () => {
        document.getElementById('admin-panel').style.display = 'none';
        renderCatalog(); // From render.js
    });

    // Form logic
    document.getElementById('admin-product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('admin-product-id').value;
        const prod = {
            id: id || 'axx-' + Date.now(),
            name: document.getElementById('admin-product-name').value,
            brand: document.getElementById('admin-product-brand').value,
            category: document.getElementById('admin-product-category').value,
            image: document.getElementById('admin-product-image').value,
            priceBottle: parseFloat(document.getElementById('admin-product-price').value),
            price5ml: parseFloat(document.getElementById('admin-price-5ml').value) || 0,
            price10ml: parseFloat(document.getElementById('admin-price-10ml').value) || 0,
            price30ml: parseFloat(document.getElementById('admin-price-30ml').value) || 0,
            has5ml: document.getElementById('admin-decant-5ml').checked,
            has10ml: document.getElementById('admin-decant-10ml').checked,
            has30ml: document.getElementById('admin-decant-30ml').checked,
            active: document.getElementById('admin-product-active').checked,
            featured: document.getElementById('admin-product-featured').checked,
            offer: document.getElementById('admin-product-offer').checked
        };

        if (id) {
            window.axxesStore.updateProduct(id, prod);
        } else {
            window.axxesStore.addProduct(prod);
        }
        document.getElementById('admin-product-form').reset();
        document.getElementById('admin-product-id').value = '';
        renderAdminDashboard();
    });
}

window.renderAdminDashboard = function() {
    const products = window.axxesStore.products;
    const categories = window.axxesStore.categories;

    document.getElementById('admin-header-product-stat').textContent = products.length + ' Productos';
    document.getElementById('admin-header-category-stat').textContent = categories.length + ' Categorías';

    // Populate Category Select
    const catSelect = document.getElementById('admin-product-category');
    catSelect.innerHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    // Populate Category List
    const catList = document.getElementById('admin-category-list');
    catList.innerHTML = categories.map(c => `<span style="background:#333; padding:4px 10px; border-radius:20px; font-size:0.8rem;">${c.name}</span>`).join('');

    // Populate Products
    const prodList = document.getElementById('admin-product-list');
    prodList.innerHTML = products.map(p => `
        <div class="admin-prod-card">
            <div class="admin-prod-card-main">
                <img src="${p.image}" class="admin-prod-thumb">
                <div>
                    <div style="font-weight:bold; font-size:0.9rem;">${p.name}</div>
                    <div style="color:#8e8e8e; font-size:0.8rem;">${p.brand} - $${p.priceBottle.toLocaleString('es-CO')}</div>
                    ${!p.active ? '<span style="color:#ff4444; font-size:0.7rem;">Inactivo</span>' : ''}
                </div>
            </div>
            <div class="admin-prod-actions">
                <button class="admin-action-btn" style="background:#333; color:white;" onclick="editProduct('${p.id}')">Editar</button>
                <button class="admin-action-btn" style="background:#ff4444; color:white;" onclick="deleteProduct('${p.id}')">Borrar</button>
            </div>
        </div>
    `).join('');
};

window.editProduct = function(id) {
    const p = window.axxesStore.products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('admin-product-id').value = p.id;
    document.getElementById('admin-product-name').value = p.name;
    document.getElementById('admin-product-brand').value = p.brand;
    document.getElementById('admin-product-category').value = p.category;
    document.getElementById('admin-product-price').value = p.priceBottle;
    document.getElementById('admin-product-image').value = p.image;
    
    document.getElementById('admin-decant-5ml').checked = p.has5ml || (p.price5ml > 0);
    document.getElementById('admin-price-5ml').value = p.price5ml || '';
    
    document.getElementById('admin-decant-10ml').checked = p.has10ml || (p.price10ml > 0);
    document.getElementById('admin-price-10ml').value = p.price10ml || '';

    document.getElementById('admin-decant-30ml').checked = p.has30ml || (p.price30ml > 0);
    document.getElementById('admin-price-30ml').value = p.price30ml || '';

    document.getElementById('admin-product-active').checked = p.active;
    document.getElementById('admin-product-featured').checked = p.featured;
    document.getElementById('admin-product-offer').checked = p.offer;
};

window.deleteProduct = function(id) {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
        window.axxesStore.deleteProduct(id);
        renderAdminDashboard();
    }
};
