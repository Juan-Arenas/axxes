// adminUI.js — Full Admin Panel for AXXES PARFUM

function initAdmin() {
    const adminBtn = document.getElementById('admin-login-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showPinModal();
        });
    }

    injectAdminCSS();
    injectAdminHTML();
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initAdmin);
} else {
    initAdmin();
}

function injectAdminCSS() {
    if (document.getElementById('axxes-admin-css')) return;
    const style = document.createElement('style');
    style.id = 'axxes-admin-css';
    style.innerHTML = `
        :root {
            --admin-bg: #050505;
            --admin-card: #111111;
            --admin-border: #2a2a2a;
            --admin-accent: #605afe;
            --admin-accent-hover: #7c78ff;
            --admin-text: #ffffff;
            --admin-muted: #8e8e8e;
            --admin-danger: #ff4444;
            --admin-success: #22c55e;
            --admin-radius: 12px;
        }

        .modal.admin-fullscreen-modal {
            padding: 16px;
            z-index: 99999;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.88);
            backdrop-filter: blur(12px);
            display: none;
            align-items: center;
            justify-content: center;
        }

        .modal-content.admin-panel-content {
            max-width: 1400px !important;
            width: 96vw !important;
            height: 94vh !important;
            margin: auto !important;
            display: flex !important;
            flex-direction: column !important;
            padding: 0 !important;
            background: var(--admin-bg) !important;
            border: 1px solid var(--admin-border) !important;
            border-radius: var(--admin-radius) !important;
            box-shadow: 0 30px 100px rgba(0, 0, 0, 0.9) !important;
            color: var(--admin-text);
            overflow: hidden;
        }

        /* Admin Header */
        .admin-panel-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 18px 24px; border-bottom: 1px solid var(--admin-border);
            background: var(--admin-card); flex-shrink: 0;
        }
        .admin-panel-header h2 { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; font-weight: 400; letter-spacing: 1px; }
        .admin-subtitle { font-size: 0.78rem; color: var(--admin-muted); }
        .admin-header-stats { display: flex; gap: 8px; }
        .admin-stat-pill { background: var(--admin-bg); border: 1px solid var(--admin-border); padding: 5px 14px; border-radius: 50px; font-size: 0.78rem; font-weight: 600; color: var(--admin-accent); }

        /* Tabs */
        .admin-tabs {
            display: flex; gap: 0; border-bottom: 1px solid var(--admin-border);
            background: var(--admin-card); flex-shrink: 0; overflow-x: auto;
        }
        .admin-tab {
            padding: 12px 24px; font-size: 0.85rem; font-weight: 600;
            color: var(--admin-muted); cursor: pointer; border: none; background: transparent;
            border-bottom: 2px solid transparent; transition: all 0.2s ease;
            white-space: nowrap; font-family: 'Poppins', sans-serif;
        }
        .admin-tab:hover { color: var(--admin-text); }
        .admin-tab.active { color: var(--admin-accent); border-bottom-color: var(--admin-accent); }

        /* Tab Content */
        .admin-tab-content { display: none; flex: 1; overflow-y: auto; padding: 20px 24px; }
        .admin-tab-content.active { display: block; }

        /* Admin Cards */
        .admin-card {
            background: var(--admin-card); border: 1px solid var(--admin-border);
            border-radius: var(--admin-radius); padding: 20px; margin-bottom: 16px;
        }
        .admin-card-header {
            margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--admin-border);
            display: flex; justify-content: space-between; align-items: center;
        }
        .admin-card-header h3 { font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; font-weight: 400; letter-spacing: 1px; }

        /* Forms */
        .admin-form .form-group { margin-bottom: 14px; }
        .admin-form label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 5px; color: var(--admin-muted); }
        .admin-form input[type="text"], .admin-form input[type="number"], .admin-form select, .admin-form textarea {
            width: 100%; padding: 10px 14px; background: var(--admin-bg); border: 1px solid var(--admin-border);
            border-radius: 8px; color: var(--admin-text); font-size: 0.88rem; outline: none;
            font-family: 'Poppins', sans-serif; transition: border-color 0.2s;
        }
        .admin-form textarea { resize: vertical; min-height: 80px; }
        .admin-form input:focus, .admin-form select:focus, .admin-form textarea:focus { border-color: var(--admin-accent); }
        .admin-form small { display: block; font-size: 0.72rem; color: var(--admin-muted); margin-top: 3px; }
        .admin-form .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* Buttons */
        .admin-btn-primary { background: var(--admin-accent); color: white; border: none; padding: 10px 20px; border-radius: 50px; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; font-family: 'Poppins', sans-serif; }
        .admin-btn-primary:hover { background: var(--admin-accent-hover); }
        .admin-btn-secondary { background: transparent; color: var(--admin-text); border: 1px solid var(--admin-border); padding: 10px 20px; border-radius: 50px; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; font-family: 'Poppins', sans-serif; }
        .admin-btn-secondary:hover { border-color: var(--admin-accent); color: var(--admin-accent); }
        .admin-btn-danger { background: var(--admin-danger); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-family: 'Poppins', sans-serif; }
        .admin-btn-sm { padding: 6px 12px; font-size: 0.75rem; border-radius: 6px; }

        /* Products Grid */
        .admin-prods-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 12px; max-height: 65vh; overflow-y: auto; padding-right: 4px;
        }
        .admin-prod-card {
            background: var(--admin-bg); border: 1px solid var(--admin-border);
            border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px;
            transition: border-color 0.2s;
        }
        .admin-prod-card:hover { border-color: var(--admin-accent); }
        .admin-prod-card-main { display: flex; gap: 12px; align-items: center; }
        .admin-prod-thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
        .admin-prod-info { flex: 1; min-width: 0; }
        .admin-prod-info .name { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .admin-prod-info .meta { color: var(--admin-muted); font-size: 0.78rem; }
        .admin-prod-info .cats { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
        .admin-prod-info .cat-tag { background: rgba(96,90,254,0.15); color: var(--admin-accent); padding: 2px 8px; border-radius: 10px; font-size: 0.68rem; font-weight: 600; }
        .admin-prod-actions { display: flex; gap: 6px; justify-content: flex-end; }
        .admin-action-btn { padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; border: none; font-weight: 600; transition: all 0.2s; font-family: 'Poppins', sans-serif; }

        /* Decants management */
        .decants-section-admin { background: var(--admin-bg); padding: 16px; border-radius: 10px; border: 1px solid var(--admin-border); }
        .decant-row { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
        .decant-row input { flex: 1; }

        /* Categories */
        .admin-categories-list { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
        .admin-cat-pill {
            background: rgba(96,90,254,0.1); border: 1px solid rgba(96,90,254,0.3);
            padding: 6px 14px; border-radius: 25px; font-size: 0.82rem; display: flex;
            align-items: center; gap: 8px; color: var(--admin-text);
        }
        .admin-cat-pill button { background: transparent; border: none; color: var(--admin-danger); cursor: pointer; font-weight: bold; font-size: 1rem; }

        /* Multi-select categories for products */
        .admin-cats-checkboxes { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
        .admin-cats-checkboxes label {
            display: flex; align-items: center; gap: 5px; padding: 5px 12px;
            border: 1px solid var(--admin-border); border-radius: 20px; font-size: 0.8rem;
            cursor: pointer; transition: all 0.2s;
        }
        .admin-cats-checkboxes label:has(input:checked) {
            background: rgba(96,90,254,0.2); border-color: var(--admin-accent);
        }
        .admin-cats-checkboxes input[type="checkbox"] { accent-color: var(--admin-accent); }

        /* Logo Upload */
        .logo-preview-wrap {
            display: flex; align-items: center; gap: 16px; margin-top: 12px;
            padding: 16px; background: var(--admin-bg); border-radius: 10px; border: 1px solid var(--admin-border);
        }
        .logo-preview-img { max-height: 60px; max-width: 200px; object-fit: contain; }

        /* PIN Modal */
        .pin-input-group { display: flex; gap: 10px; justify-content: center; margin: 16px 0; }
        .pin-digit {
            width: 50px; height: 56px; text-align: center; font-size: 1.5rem; font-weight: 900;
            background: var(--admin-bg); border: 2px solid var(--admin-border); border-radius: 10px;
            color: var(--admin-text); outline: none; transition: border-color 0.2s;
        }
        .pin-digit:focus { border-color: var(--admin-accent); }

        /* Toggle switch */
        .admin-toggle-wrap { display: flex; align-items: center; gap: 10px; }
        .admin-toggle { position: relative; width: 44px; height: 24px; }
        .admin-toggle input { opacity: 0; width: 0; height: 0; }
        .admin-toggle .slider-toggle {
            position: absolute; inset: 0; background: var(--admin-border); border-radius: 24px;
            cursor: pointer; transition: 0.3s;
        }
        .admin-toggle .slider-toggle::before {
            content: ''; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px;
            background: white; border-radius: 50%; transition: 0.3s;
        }
        .admin-toggle input:checked + .slider-toggle { background: var(--admin-accent); }
        .admin-toggle input:checked + .slider-toggle::before { transform: translateX(20px); }

        /* Scrollbar */
        .admin-tab-content::-webkit-scrollbar, .admin-prods-grid::-webkit-scrollbar { width: 6px; }
        .admin-tab-content::-webkit-scrollbar-track, .admin-prods-grid::-webkit-scrollbar-track { background: transparent; }
        .admin-tab-content::-webkit-scrollbar-thumb, .admin-prods-grid::-webkit-scrollbar-thumb { background: var(--admin-border); border-radius: 3px; }

        /* Search */
        .admin-search-input {
            padding: 10px 16px; background: var(--admin-bg); border: 1px solid var(--admin-border);
            color: var(--admin-text); border-radius: 8px; font-size: 0.88rem; outline: none;
            width: 250px; transition: border-color 0.2s; font-family: 'Poppins', sans-serif;
        }
        .admin-search-input:focus { border-color: var(--admin-accent); }

        @media (max-width: 768px) {
            .admin-form .form-row { grid-template-columns: 1fr; }
            .admin-prods-grid { grid-template-columns: 1fr; }
            .admin-tabs { overflow-x: auto; }
        }
    `;
    document.head.appendChild(style);
}

function injectAdminHTML() {
    if (document.getElementById('axxes-admin-wrapper')) return;
    const html = `
    <div id="axxes-admin-wrapper">
        <!-- Admin Authentication Modal -->
        <div id="admin-password-modal" class="modal admin-fullscreen-modal">
            <div class="modal-content" style="max-width: 420px; text-align: center; background:var(--admin-bg); padding:35px; border-radius:16px; border:1px solid var(--admin-border);">
                <img src="logo.webp" alt="AXXES" style="height:50px;margin-bottom:1.2rem;">
                <h3 style="margin-bottom: 0.5rem; font-family:'Bebas Neue', sans-serif; font-size:1.5rem; letter-spacing:1px;">Acceso Administrativo</h3>
                <p style="color: var(--admin-muted); font-size: 0.85rem; margin-bottom: 16px;">Ingresa el PIN de 4 dígitos para gestionar el catálogo:</p>
                
                <form id="admin-login-form" class="admin-form">
                    <div class="pin-input-group" id="admin-pin-group">
                        <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" id="admin-pin-input-1" class="pin-digit" autocomplete="off">
                        <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" id="admin-pin-input-2" class="pin-digit" autocomplete="off">
                        <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" id="admin-pin-input-3" class="pin-digit" autocomplete="off">
                        <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" id="admin-pin-input-4" class="pin-digit" autocomplete="off">
                    </div>
                    <button class="admin-btn-primary" type="submit" style="width: 100%; margin-top: 10px; padding: 12px;">
                        <i class="fas fa-key"></i> Entrar al Panel
                    </button>
                    <button class="admin-btn-secondary" type="button" onclick="document.getElementById('admin-password-modal').style.display='none'" style="width: 100%; margin-top: 10px;">Cerrar</button>
                    <p class="admin-message" id="admin-login-message" style="color: #ff4444; font-size: 0.85rem; margin-top: 10px; font-weight: 600;"></p>
                </form>
            </div>
        </div>

        <!-- Admin Management Panel -->
        <div id="admin-panel" class="modal admin-fullscreen-modal">
            <div class="modal-content admin-panel-content">
                <!-- Header -->
                <div class="admin-panel-header">
                    <div>
                        <h2>Panel Administrativo AXXES</h2>
                        <p class="admin-subtitle">Gestión completa del catálogo y configuración.</p>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div class="admin-header-stats">
                            <span class="admin-stat-pill" id="admin-header-product-stat">0 Productos</span>
                            <span class="admin-stat-pill" id="admin-header-category-stat">0 Categorías</span>
                        </div>
                        <button class="admin-btn-secondary" id="admin-panel-close" title="Cerrar panel">✕ Cerrar</button>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="tab-products"><i class="fas fa-box"></i> Productos</button>
                    <button class="admin-tab" data-tab="tab-add"><i class="fas fa-plus-circle"></i> Agregar / Editar</button>
                    <button class="admin-tab" data-tab="tab-categories"><i class="fas fa-tags"></i> Categorías</button>
                    <button class="admin-tab" data-tab="tab-config"><i class="fas fa-cog"></i> Configuración</button>
                    <button class="admin-tab" data-tab="tab-backup"><i class="fas fa-database"></i> Backup</button>
                </div>

                <!-- Tab: Products (Inventory) -->
                <div class="admin-tab-content active" id="tab-products">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="font-family:'Bebas Neue',sans-serif; font-size:1.3rem; letter-spacing:1px;">Inventario de Productos</h3>
                        <input type="text" id="admin-product-search" placeholder="🔍 Buscar producto..." class="admin-search-input">
                    </div>
                    <div class="admin-prods-grid" id="admin-product-list"></div>
                </div>

                <!-- Tab: Add/Edit Product -->
                <div class="admin-tab-content" id="tab-add">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3 id="admin-form-heading">Agregar Nuevo Producto</h3>
                            <button class="admin-btn-secondary admin-btn-sm" onclick="resetAdminForm()">Limpiar Formulario</button>
                        </div>
                        
                        <form id="admin-product-form" class="admin-form">
                            <input type="hidden" id="admin-product-id">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nombre del Producto *</label>
                                    <input type="text" id="admin-product-name" required placeholder="Ej: Sauvage Elixir">
                                </div>
                                <div class="form-group">
                                    <label>Marca *</label>
                                    <input type="text" id="admin-product-brand" required placeholder="Ej: DIOR">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Descripción (opcional)</label>
                                <textarea id="admin-product-description" placeholder="Descripción del perfume..."></textarea>
                            </div>

                            <div class="form-group">
                                <label>Género *</label>
                                <select id="admin-product-gender">
                                    <option value="Hombre">Hombre</option>
                                    <option value="Mujer">Mujer</option>
                                    <option value="Unisex">Unisex</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Imagen del Producto * (subir desde galería)</label>
                                <input type="file" id="admin-product-image-file" accept="image/*" style="padding: 8px; background: var(--admin-bg); border: 1px solid var(--admin-border); border-radius: 8px; color: var(--admin-text); width: 100%;">
                                <input type="hidden" id="admin-product-image-url">
                                <div id="admin-image-preview-wrap" style="display:none; margin-top:10px; border:1px dashed var(--admin-border); padding:8px; border-radius:10px; width:fit-content;">
                                    <img id="admin-image-preview-img" src="" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">
                                </div>
                            </div>

                            <!-- Botella completa -->
                            <div class="form-row">
                                <div class="form-group">
                                    <label>¿Vender Botella Completa?</label>
                                    <div class="admin-toggle-wrap">
                                        <label class="admin-toggle">
                                            <input type="checkbox" id="admin-product-sell-bottle" checked>
                                            <span class="slider-toggle"></span>
                                        </label>
                                        <span style="font-size:0.85rem;">Sí, vender botella</span>
                                    </div>
                                </div>
                                <div class="form-group" id="admin-bottle-price-group">
                                    <label>Precio Botella ($ COP)</label>
                                    <input type="number" id="admin-product-price" placeholder="Ej: 637500">
                                </div>
                            </div>

                            <!-- Decants Dinámicos -->
                            <div class="decants-section-admin">
                                <label style="margin-bottom:10px; color:var(--admin-text); font-weight:600; display:block;">
                                    <i class="fas fa-vial"></i> Gestión de Decants
                                </label>
                                <small style="color:var(--admin-muted); display:block; margin-bottom:12px;">Agrega las presentaciones disponibles (5ml, 10ml, 30ml, 100ml, etc.)</small>
                                
                                <div id="admin-decants-list"></div>
                                <button type="button" onclick="addDecantRow()" class="admin-btn-secondary" style="width:100%; margin-top:8px;">
                                    <i class="fas fa-plus"></i> Añadir Tamaño de Decant
                                </button>
                            </div>

                            <!-- Categorías (multi-select) -->
                            <div class="form-group" style="margin-top:16px;">
                                <label>Categorías (puede pertenecer a varias)</label>
                                <div class="admin-cats-checkboxes" id="admin-product-categories-checkboxes"></div>
                            </div>

                            <div class="form-group" style="display: flex; gap:20px; margin-top:16px; flex-wrap:wrap;">
                                <div class="admin-toggle-wrap">
                                    <label class="admin-toggle"><input type="checkbox" id="admin-product-active" checked><span class="slider-toggle"></span></label>
                                    <span style="font-size:0.85rem;">Activo</span>
                                </div>
                                <div class="admin-toggle-wrap">
                                    <label class="admin-toggle"><input type="checkbox" id="admin-product-featured"><span class="slider-toggle"></span></label>
                                    <span style="font-size:0.85rem;">Destacado</span>
                                </div>
                                <div class="admin-toggle-wrap">
                                    <label class="admin-toggle"><input type="checkbox" id="admin-product-bestseller"><span class="slider-toggle"></span></label>
                                    <span style="font-size:0.85rem;">Más Vendido</span>
                                </div>
                                <div class="admin-toggle-wrap">
                                    <label class="admin-toggle"><input type="checkbox" id="admin-product-offer"><span class="slider-toggle"></span></label>
                                    <span style="font-size:0.85rem;">En Oferta</span>
                                </div>
                                <div class="admin-toggle-wrap">
                                    <label class="admin-toggle"><input type="checkbox" id="admin-product-new"><span class="slider-toggle"></span></label>
                                    <span style="font-size:0.85rem;">Nuevo</span>
                                </div>
                            </div>

                            <div style="display:flex; gap:12px; margin-top:20px;">
                                <button class="admin-btn-primary" type="submit" id="admin-product-submit-btn" style="flex:1;">
                                    <i class="fas fa-save"></i> Guardar Producto
                                </button>
                                <button class="admin-btn-secondary" type="button" onclick="resetAdminForm()">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Tab: Categories -->
                <div class="admin-tab-content" id="tab-categories">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3>Gestión de Categorías</h3>
                        </div>
                        <form id="admin-category-form" class="admin-form">
                            <div class="form-group">
                                <label>Nueva Categoría</label>
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" id="admin-new-category" placeholder="Nombre de la categoría" required style="flex:1;">
                                    <button class="admin-btn-primary" type="submit"><i class="fas fa-plus"></i> Agregar</button>
                                </div>
                            </div>
                        </form>
                        <div class="admin-categories-list" id="admin-category-list"></div>
                        <small style="color:var(--admin-muted); margin-top:12px; display:block;">
                            <i class="fas fa-info-circle"></i> Los perfumes pueden pertenecer a múltiples categorías. Ejemplo: un perfume puede ser "Cítrico" y "Amaderado" a la vez.
                        </small>
                    </div>
                </div>

                <!-- Tab: Config -->
                <div class="admin-tab-content" id="tab-config">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3><i class="fas fa-image"></i> Logotipo de la Tienda</h3>
                        </div>
                        <div class="admin-form">
                            <div class="form-group">
                                <label>Subir nuevo logotipo (desde galería)</label>
                                <input type="file" id="admin-logo-file" accept="image/*" style="padding: 8px; background: var(--admin-bg); border: 1px solid var(--admin-border); border-radius: 8px; color: var(--admin-text); width: 100%;">
                            </div>
                            <div class="logo-preview-wrap" id="admin-logo-preview-wrap">
                                <img id="admin-logo-preview-img" src="logo.webp" class="logo-preview-img" alt="Logo actual">
                                <div>
                                    <p style="font-size:0.85rem; font-weight:600;">Logo actual</p>
                                    <p style="font-size:0.75rem; color:var(--admin-muted);">Se mostrará en el header y footer</p>
                                </div>
                            </div>
                            <button class="admin-btn-primary" style="margin-top:12px;" onclick="saveLogo()">
                                <i class="fas fa-save"></i> Guardar Logo
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tab: Backup -->
                <div class="admin-tab-content" id="tab-backup">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3><i class="fas fa-database"></i> Base de Datos / Backup</h3>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div>
                                <h4 style="margin-bottom:10px; font-size:0.95rem;">Exportar</h4>
                                <p style="color:var(--admin-muted); font-size:0.82rem; margin-bottom:12px;">Descarga un backup completo del catálogo, categorías y configuración.</p>
                                <button class="admin-btn-primary" style="width:100%;" onclick="window.axxesStore.exportBackup()">
                                    <i class="fas fa-download"></i> Exportar Catálogo (.json)
                                </button>
                            </div>
                            <div>
                                <h4 style="margin-bottom:10px; font-size:0.95rem;">Importar</h4>
                                <p style="color:var(--admin-muted); font-size:0.82rem; margin-bottom:12px;">Restaura un backup previo. Esto reemplazará todos los datos actuales.</p>
                                <input type="file" id="admin-import-file" accept=".json" style="padding:8px; background:var(--admin-bg); border:1px solid var(--admin-border); border-radius:8px; color:var(--admin-text); width:100%; margin-bottom:10px;">
                                <button class="admin-btn-secondary" style="width:100%;" onclick="importBackupFile()">
                                    <i class="fas fa-upload"></i> Importar Backup
                                </button>
                            </div>
                        </div>
                        <hr style="border:0; border-top:1px solid var(--admin-border); margin:20px 0;">
                        <div>
                            <h4 style="margin-bottom:10px; font-size:0.95rem; color:var(--admin-danger);">Zona de Peligro</h4>
                            <button class="admin-btn-danger" style="padding:10px 20px;" onclick="resetAllData()">
                                <i class="fas fa-trash"></i> Resetear Todo a Datos Iniciales
                            </button>
                        </div>
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

    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Image upload logic to Base64
    document.getElementById('admin-product-image-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64 = event.target.result;
                document.getElementById('admin-product-image-url').value = base64;
                document.getElementById('admin-image-preview-img').src = base64;
                document.getElementById('admin-image-preview-wrap').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Logo upload preview
    document.getElementById('admin-logo-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('admin-logo-preview-img').src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Sell bottle toggle
    document.getElementById('admin-product-sell-bottle').addEventListener('change', function() {
        const priceGroup = document.getElementById('admin-bottle-price-group');
        priceGroup.style.opacity = this.checked ? '1' : '0.4';
    });

    document.getElementById('admin-panel-close').addEventListener('click', () => {
        document.getElementById('admin-panel').style.display = 'none';
    });

    // Product form logic
    document.getElementById('admin-product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('admin-product-id').value;
        
        // Gather dynamic decants
        const decantRows = document.querySelectorAll('.decant-row');
        const decants = [];
        decantRows.forEach(row => {
            const size = row.querySelector('.decant-size').value.trim();
            const price = parseFloat(row.querySelector('.decant-price').value) || 0;
            if (size && price > 0) {
                decants.push({ size, price });
            }
        });

        // Gather selected categories
        const selectedCats = [];
        document.querySelectorAll('#admin-product-categories-checkboxes input:checked').forEach(cb => {
            selectedCats.push(cb.value);
        });

        // Use base64 if uploaded, else fallback
        let finalImage = document.getElementById('admin-product-image-url').value;
        if (!finalImage && id) {
            const existing = window.axxesStore.products.find(x => x.id === id);
            finalImage = existing ? existing.image : '';
        }

        const sellBottle = document.getElementById('admin-product-sell-bottle').checked;

        const prod = {
            id: id || 'axx-' + Date.now(),
            name: document.getElementById('admin-product-name').value,
            brand: document.getElementById('admin-product-brand').value.toUpperCase(),
            description: document.getElementById('admin-product-description').value,
            gender: document.getElementById('admin-product-gender').value,
            categories: selectedCats,
            category: selectedCats[0] || '',
            image: finalImage,
            priceBottle: parseFloat(document.getElementById('admin-product-price').value) || 0,
            sellBottle: sellBottle,
            decants: decants,
            active: document.getElementById('admin-product-active').checked,
            featured: document.getElementById('admin-product-featured').checked,
            bestseller: document.getElementById('admin-product-bestseller').checked,
            offer: document.getElementById('admin-product-offer').checked,
            isNew: document.getElementById('admin-product-new').checked
        };

        if (id) {
            window.axxesStore.updateProduct(id, prod);
        } else {
            window.axxesStore.addProduct(prod);
        }
        
        resetAdminForm();
        renderAdminDashboard();
        
        // Switch to products tab
        document.querySelector('[data-tab="tab-products"]').click();
    });

    // Category form logic
    document.getElementById('admin-category-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const catName = document.getElementById('admin-new-category').value.trim();
        if (catName) {
            window.axxesStore.addCategory(catName);
            document.getElementById('admin-category-form').reset();
            renderAdminDashboard();
        }
    });

    // Product search
    const searchInput = document.getElementById('admin-product-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderAdminProductList(searchInput.value.toLowerCase().trim());
        });
    }
}

function resetAdminForm() {
    document.getElementById('admin-product-form').reset();
    document.getElementById('admin-product-id').value = '';
    document.getElementById('admin-product-image-url').value = '';
    document.getElementById('admin-image-preview-wrap').style.display = 'none';
    document.getElementById('admin-image-preview-img').src = '';
    document.getElementById('admin-decants-list').innerHTML = '';
    document.getElementById('admin-form-heading').textContent = 'Agregar Nuevo Producto';
    document.getElementById('admin-product-sell-bottle').checked = true;
    document.getElementById('admin-bottle-price-group').style.opacity = '1';
    
    // Re-render category checkboxes
    renderCategoryCheckboxes();
}

function renderCategoryCheckboxes(selectedCats = []) {
    const container = document.getElementById('admin-product-categories-checkboxes');
    if (!container) return;
    const cats = window.axxesStore.categories || [];
    container.innerHTML = cats.map(c => `
        <label>
            <input type="checkbox" value="${c.name}" ${selectedCats.includes(c.name) ? 'checked' : ''}>
            ${c.name}
        </label>
    `).join('');
}

window.addDecantRow = function(size = '', price = '') {
    const list = document.getElementById('admin-decants-list');
    const rowId = 'decant-' + Date.now() + Math.random().toString(36).substr(2, 5);
    const rowHtml = `
        <div id="${rowId}" class="decant-row">
            <input type="text" class="decant-size" placeholder="Tamaño (Ej: 5ml, 10ml, 100ml)" value="${size}" style="flex:1;">
            <input type="number" class="decant-price" placeholder="Precio ($)" value="${price}" style="flex:1;">
            <button type="button" onclick="document.getElementById('${rowId}').remove()" style="background:var(--admin-danger); color:white; border:none; border-radius:6px; padding:8px 12px; cursor:pointer;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    list.insertAdjacentHTML('beforeend', rowHtml);
};

window.renderAdminDashboard = function() {
    const products = window.axxesStore.products;
    const categories = window.axxesStore.categories;

    document.getElementById('admin-header-product-stat').textContent = products.length + ' Productos';
    document.getElementById('admin-header-category-stat').textContent = categories.length + ' Categorías';

    // Render Category checkboxes on form
    renderCategoryCheckboxes();

    // Populate Category List
    const catList = document.getElementById('admin-category-list');
    catList.innerHTML = categories.map(c => `
        <div class="admin-cat-pill">
            <span>${c.name}</span>
            <button onclick="deleteCategory('${c.name}')" title="Eliminar">✕</button>
        </div>
    `).join('');

    // Render product list
    renderAdminProductList('');
    
    // Update logo preview
    if (window.axxesStore.siteConfig && window.axxesStore.siteConfig.logo) {
        document.getElementById('admin-logo-preview-img').src = window.axxesStore.siteConfig.logo;
    }
};

function renderAdminProductList(searchQuery) {
    let products = window.axxesStore.products;
    
    if (searchQuery) {
        products = products.filter(p => 
            p.name.toLowerCase().includes(searchQuery) ||
            (p.brand && p.brand.toLowerCase().includes(searchQuery)) ||
            (p.categories && p.categories.some(c => c.toLowerCase().includes(searchQuery)))
        );
    }
    
    const prodList = document.getElementById('admin-product-list');
    if (!prodList) return;
    
    prodList.innerHTML = products.map(p => {
        const catsHtml = (p.categories || []).map(c => `<span class="cat-tag">${c}</span>`).join('');
        const decantInfo = Array.isArray(p.decants) && p.decants.length > 0 
            ? p.decants.map(d => d.size).join(', ')
            : 'Sin decants';
        const statusDot = p.active 
            ? '<span style="color:#22c55e;">●</span>' 
            : '<span style="color:#ff4444;">●</span>';
        
        return `
        <div class="admin-prod-card">
            <div class="admin-prod-card-main">
                <img src="${p.image}" class="admin-prod-thumb" alt="${p.name}">
                <div class="admin-prod-info">
                    <div class="name">${statusDot} ${p.name}</div>
                    <div class="meta">${p.brand || ''} — $${(p.priceBottle || 0).toLocaleString('es-CO')} ${p.sellBottle === false ? '(Solo decants)' : ''}</div>
                    <div class="meta" style="font-size:0.72rem;">Decants: ${decantInfo}</div>
                    <div class="cats">${catsHtml}</div>
                </div>
            </div>
            <div class="admin-prod-actions">
                <button class="admin-action-btn" style="background:var(--admin-accent); color:white;" onclick="editProduct('${p.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="admin-action-btn admin-btn-danger" onclick="deleteProduct('${p.id}')">
                    <i class="fas fa-trash"></i> Borrar
                </button>
            </div>
        </div>
        `;
    }).join('');
}

window.editProduct = function(id) {
    resetAdminForm();
    const p = window.axxesStore.products.find(x => x.id === id);
    if (!p) return;
    
    // Switch to add/edit tab
    document.querySelector('[data-tab="tab-add"]').click();
    
    document.getElementById('admin-form-heading').textContent = 'Editando: ' + p.name;
    document.getElementById('admin-product-id').value = p.id;
    document.getElementById('admin-product-name').value = p.name;
    document.getElementById('admin-product-brand').value = p.brand;
    document.getElementById('admin-product-description').value = p.description || '';
    document.getElementById('admin-product-gender').value = p.gender || 'Unisex';
    document.getElementById('admin-product-price').value = p.priceBottle || '';
    document.getElementById('admin-product-sell-bottle').checked = p.sellBottle !== false;
    document.getElementById('admin-bottle-price-group').style.opacity = p.sellBottle !== false ? '1' : '0.4';
    
    // Image
    document.getElementById('admin-product-image-url').value = p.image || '';
    if (p.image) {
        document.getElementById('admin-image-preview-img').src = p.image;
        document.getElementById('admin-image-preview-wrap').style.display = 'block';
    }
    
    // Render category checkboxes with selections
    renderCategoryCheckboxes(p.categories || [p.category].filter(Boolean));
    
    // Render dynamic decants
    if (Array.isArray(p.decants) && p.decants.length > 0) {
        p.decants.forEach(d => addDecantRow(d.size, d.price));
    }

    document.getElementById('admin-product-active').checked = p.active !== false;
    document.getElementById('admin-product-featured').checked = !!p.featured;
    document.getElementById('admin-product-bestseller').checked = !!p.bestseller;
    document.getElementById('admin-product-offer').checked = !!p.offer;
    document.getElementById('admin-product-new').checked = !!p.isNew;
};

window.deleteProduct = function(id) {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
        window.axxesStore.deleteProduct(id);
        renderAdminDashboard();
    }
};

window.deleteCategory = function(name) {
    if (confirm(`¿Seguro que deseas eliminar la categoría "${name}"?`)) {
        window.axxesStore.deleteCategory(name);
        renderAdminDashboard();
    }
};

window.saveLogo = function() {
    const fileInput = document.getElementById('admin-logo-file');
    if (fileInput.files.length === 0) {
        alert('Selecciona una imagen primero');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        window.axxesStore.updateLogo(event.target.result);
        alert('Logo actualizado correctamente');
    };
    reader.readAsDataURL(fileInput.files[0]);
};

window.importBackupFile = function() {
    const fileInput = document.getElementById('admin-import-file');
    if (fileInput.files.length === 0) {
        alert('Selecciona un archivo .json primero');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        const result = window.axxesStore.importBackup(event.target.result);
        if (result.success) {
            alert(`Backup importado: ${result.pCount} productos, ${result.cCount} categorías`);
            renderAdminDashboard();
        } else {
            alert('Error al importar: ' + result.error);
        }
    };
    reader.readAsText(fileInput.files[0]);
};

window.resetAllData = function() {
    if (confirm('⚠️ Esto eliminará TODOS los datos y restaurará los valores iniciales. ¿Estás seguro?')) {
        if (confirm('Esta acción NO se puede deshacer. ¿Continuar?')) {
            localStorage.removeItem(window.axxesStore.keys.products);
            localStorage.removeItem(window.axxesStore.keys.categories);
            localStorage.removeItem(window.axxesStore.keys.siteConfig);
            location.reload();
        }
    }
};
