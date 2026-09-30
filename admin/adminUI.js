// adminUI.js — Full Admin Panel for AXXES PARFUM with Bulk Upload, Image Optimization, Live Sync & Bug Fixes

function initAdmin() {
    const adminBtn = document.getElementById('admin-login-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showPinModal();
        });
    }

    const floatingBtn = document.getElementById('floating-admin-btn');
    if (floatingBtn) {
        floatingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showPinModal();
        });
    }

    injectAdminCSS();
    injectAdminHTML();
    setupAdminEventListeners();
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
            --admin-bg: #07070a;
            --admin-card: #111116;
            --admin-border: #262633;
            --admin-accent: #605afe;
            --admin-accent-hover: #7c78ff;
            --admin-text: #ffffff;
            --admin-muted: #9494a8;
            --admin-danger: #ef4444;
            --admin-success: #22c55e;
            --admin-warning: #f59e0b;
            --admin-radius: 14px;
        }

        .modal.admin-fullscreen-modal {
            padding: 12px;
            z-index: 99999;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.92);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            display: none;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
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
            box-shadow: 0 30px 100px rgba(0, 0, 0, 0.95) !important;
            color: var(--admin-text);
            overflow: hidden;
        }

        /* Header */
        .admin-panel-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 22px; border-bottom: 1px solid var(--admin-border);
            background: var(--admin-card); flex-shrink: 0; gap: 12px; flex-wrap: wrap;
        }
        .admin-panel-header h2 { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; font-weight: 400; letter-spacing: 1px; margin: 0; }
        .admin-subtitle { font-size: 0.8rem; color: var(--admin-muted); margin: 2px 0 0 0; }
        .admin-header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .admin-header-stats { display: flex; gap: 8px; }
        .admin-stat-pill { background: var(--admin-bg); border: 1px solid var(--admin-border); padding: 5px 12px; border-radius: 50px; font-size: 0.78rem; font-weight: 600; color: var(--admin-accent); }

        /* Sync Status Badge */
        .admin-sync-badge {
            display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
            border-radius: 50px; font-size: 0.78rem; font-weight: 600; cursor: pointer;
            transition: all 0.2s;
        }
        .admin-sync-badge.synced { background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); color: #4ade80; }
        .admin-sync-badge.pending { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; animation: pulsePending 2s infinite; }
        .admin-sync-badge.not-configured { background: rgba(148, 148, 168, 0.12); border: 1px solid var(--admin-border); color: var(--admin-muted); }
        @keyframes pulsePending {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        /* Tabs */
        .admin-tabs {
            display: flex; gap: 0; border-bottom: 1px solid var(--admin-border);
            background: #0d0d12; flex-shrink: 0; overflow-x: auto;
            scrollbar-width: none;
        }
        .admin-tabs::-webkit-scrollbar { display: none; }
        .admin-tab {
            padding: 13px 20px; font-size: 0.85rem; font-weight: 600;
            color: var(--admin-muted); cursor: pointer; border: none; background: transparent;
            border-bottom: 2px solid transparent; transition: all 0.2s ease;
            white-space: nowrap; font-family: 'Poppins', sans-serif; display: flex; align-items: center; gap: 8px;
        }
        .admin-tab:hover { color: var(--admin-text); background: rgba(255,255,255,0.02); }
        .admin-tab.active { color: var(--admin-accent); border-bottom-color: var(--admin-accent); background: rgba(96,90,254,0.06); }

        /* Tab Content */
        .admin-tab-content { display: none; flex: 1; overflow-y: auto; padding: 22px; }
        .admin-tab-content.active { display: block; }

        /* Cards */
        .admin-card {
            background: var(--admin-card); border: 1px solid var(--admin-border);
            border-radius: var(--admin-radius); padding: 22px; margin-bottom: 18px;
        }
        .admin-card-header {
            margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--admin-border);
            display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
        }
        .admin-card-header h3 { font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; font-weight: 400; letter-spacing: 1px; margin: 0; }

        /* Forms */
        .admin-form .form-group { margin-bottom: 15px; }
        .admin-form label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 6px; color: var(--admin-muted); }
        .admin-form input[type="text"], .admin-form input[type="number"], .admin-form input[type="password"], .admin-form select, .admin-form textarea {
            width: 100%; padding: 10px 14px; background: var(--admin-bg); border: 1px solid var(--admin-border);
            border-radius: 8px; color: var(--admin-text); font-size: 0.88rem; outline: none;
            font-family: 'Poppins', sans-serif; transition: border-color 0.2s; box-sizing: border-box;
        }
        .admin-form textarea { resize: vertical; min-height: 80px; }
        .admin-form input:focus, .admin-form select:focus, .admin-form textarea:focus { border-color: var(--admin-accent); box-shadow: 0 0 10px rgba(96,90,254,0.25); }
        .admin-form small { display: block; font-size: 0.74rem; color: var(--admin-muted); margin-top: 4px; }
        .admin-form .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* Buttons */
        .admin-btn-primary { background: var(--admin-accent); color: white; border: none; padding: 10px 20px; border-radius: 50px; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; font-family: 'Poppins', sans-serif; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .admin-btn-primary:hover { background: var(--admin-accent-hover); transform: translateY(-1px); }
        .admin-btn-secondary { background: transparent; color: var(--admin-text); border: 1px solid var(--admin-border); padding: 10px 18px; border-radius: 50px; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; font-family: 'Poppins', sans-serif; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .admin-btn-secondary:hover { border-color: var(--admin-accent); color: var(--admin-accent); }
        .admin-btn-success { background: var(--admin-success); color: white; border: none; padding: 10px 20px; border-radius: 50px; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; font-family: 'Poppins', sans-serif; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .admin-btn-success:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .admin-btn-danger { background: var(--admin-danger); color: white; border: none; padding: 7px 14px; border-radius: 8px; font-size: 0.78rem; cursor: pointer; font-family: 'Poppins', sans-serif; display: inline-flex; align-items: center; gap: 6px; }
        .admin-btn-sm { padding: 6px 12px; font-size: 0.75rem; border-radius: 8px; }

        /* Products Grid */
        .admin-prods-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
            gap: 14px; max-height: 68vh; overflow-y: auto; padding-right: 4px;
        }
        .admin-prod-card {
            background: var(--admin-bg); border: 1px solid var(--admin-border);
            border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px;
            transition: all 0.2s;
        }
        .admin-prod-card:hover { border-color: var(--admin-accent); box-shadow: 0 8px 25px rgba(0,0,0,0.4); }
        .admin-prod-card-main { display: flex; gap: 12px; align-items: center; }
        .admin-prod-thumb { width: 56px; height: 56px; object-fit: contain; background: #161622; border-radius: 8px; flex-shrink: 0; padding: 2px; }
        .admin-prod-info { flex: 1; min-width: 0; }
        .admin-prod-info .name { font-weight: 600; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
        .admin-prod-info .meta { color: var(--admin-muted); font-size: 0.78rem; margin-top: 2px; }
        .admin-prod-info .cats { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
        .admin-prod-info .cat-tag { background: rgba(96,90,254,0.15); color: var(--admin-accent); padding: 2px 8px; border-radius: 8px; font-size: 0.68rem; font-weight: 600; }
        .admin-prod-actions { display: flex; gap: 6px; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; }
        .admin-action-btn { padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; border: none; font-weight: 600; transition: all 0.2s; font-family: 'Poppins', sans-serif; }

        /* Decants */
        .decants-section-admin { background: var(--admin-bg); padding: 16px; border-radius: 10px; border: 1px solid var(--admin-border); }
        .decant-row { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
        .decant-row input { flex: 1; }

        /* Multi-select categories */
        .admin-cats-checkboxes { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
        .admin-cats-checkboxes label {
            display: flex; align-items: center; gap: 6px; padding: 6px 14px;
            border: 1px solid var(--admin-border); border-radius: 20px; font-size: 0.8rem;
            cursor: pointer; transition: all 0.2s; background: var(--admin-bg);
        }
        .admin-cats-checkboxes label:has(input:checked) {
            background: rgba(96,90,254,0.2); border-color: var(--admin-accent); color: #fff;
        }
        .admin-cats-checkboxes input[type="checkbox"] { accent-color: var(--admin-accent); }

        /* Categories Management */
        .admin-categories-list { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
        .admin-cat-pill {
            background: rgba(96,90,254,0.1); border: 1px solid rgba(96,90,254,0.3);
            padding: 6px 14px; border-radius: 25px; font-size: 0.82rem; display: flex;
            align-items: center; gap: 8px; color: var(--admin-text);
        }
        .admin-cat-pill button { background: transparent; border: none; color: var(--admin-danger); cursor: pointer; font-weight: bold; font-size: 1rem; }

        /* ================= BULK UPLOAD STYLES ================= */
        .admin-bulk-subtabs {
            display: flex; gap: 10px; margin-bottom: 18px; border-bottom: 1px solid var(--admin-border);
            padding-bottom: 12px; flex-wrap: wrap;
        }
        .admin-bulk-subtab-btn {
            background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-muted);
            padding: 8px 16px; border-radius: 30px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
            transition: all 0.2s; font-family: 'Poppins', sans-serif;
        }
        .admin-bulk-subtab-btn.active {
            background: var(--admin-accent); color: white; border-color: var(--admin-accent);
        }

        .admin-dropzone {
            border: 2px dashed rgba(96, 90, 254, 0.4); border-radius: 16px;
            padding: 35px 20px; text-align: center; background: rgba(96, 90, 254, 0.04);
            cursor: pointer; transition: all 0.25s; margin-bottom: 20px;
        }
        .admin-dropzone:hover, .admin-dropzone.dragover {
            border-color: var(--admin-accent); background: rgba(96, 90, 254, 0.1); transform: scale(1.005);
        }
        .admin-dropzone i { font-size: 42px; color: var(--admin-accent); margin-bottom: 12px; }
        .admin-dropzone h4 { font-size: 1.1rem; margin: 0 0 6px 0; color: #fff; }
        .admin-dropzone p { font-size: 0.82rem; color: var(--admin-muted); margin: 0; }

        .bulk-cards-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 14px; max-height: 55vh; overflow-y: auto; padding-right: 4px; margin-bottom: 20px;
        }
        .bulk-card-item {
            background: var(--admin-bg); border: 1px solid var(--admin-border);
            border-radius: 12px; padding: 14px; position: relative;
        }
        .bulk-card-header { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
        .bulk-card-thumb { width: 60px; height: 60px; border-radius: 8px; object-fit: contain; background: #161622; }
        .bulk-card-fields { display: flex; flex-direction: column; gap: 8px; }
        .bulk-card-fields .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .bulk-card-fields input, .bulk-card-fields select {
            padding: 7px 10px; font-size: 0.82rem; border-radius: 6px; background: #111116;
            border: 1px solid var(--admin-border); color: #fff;
        }
        .bulk-remove-btn {
            position: absolute; top: 10px; right: 10px; background: transparent;
            border: none; color: var(--admin-danger); cursor: pointer; font-size: 14px;
        }

        .bulk-quick-table-wrap { overflow-x: auto; max-height: 55vh; margin-bottom: 20px; }
        .bulk-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .bulk-table th { background: #111116; padding: 10px; text-align: left; border: 1px solid var(--admin-border); color: var(--admin-muted); }
        .bulk-table td { padding: 8px; border: 1px solid var(--admin-border); vertical-align: middle; }
        .bulk-table input, .bulk-table select {
            width: 100%; padding: 6px 8px; font-size: 0.8rem; background: var(--admin-bg);
            border: 1px solid var(--admin-border); border-radius: 4px; color: #fff; box-sizing: border-box;
        }

        /* PIN Modal */
        .pin-input-group { display: flex; gap: 10px; justify-content: center; margin: 20px 0; }
        .pin-digit {
            width: 52px; height: 60px; text-align: center; font-size: 1.6rem; font-weight: 800;
            background: var(--admin-bg); border: 2px solid var(--admin-border); border-radius: 12px;
            color: var(--admin-text); outline: none; transition: border-color 0.2s;
        }
        .pin-digit:focus { border-color: var(--admin-accent); }

        /* Search input */
        .admin-search-input {
            padding: 9px 16px; background: var(--admin-bg); border: 1px solid var(--admin-border);
            color: var(--admin-text); border-radius: 50px; font-size: 0.85rem; outline: none;
            width: 240px; transition: border-color 0.2s; font-family: 'Poppins', sans-serif;
        }
        .admin-search-input:focus { border-color: var(--admin-accent); }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
            .modal-content.admin-panel-content {
                width: 100vw !important; height: 100vh !important; border-radius: 0 !important;
            }
            .admin-form .form-row { grid-template-columns: 1fr; }
            .admin-prods-grid { grid-template-columns: 1fr; }
            .admin-panel-header { padding: 14px 16px; }
            .admin-panel-header h2 { font-size: 1.3rem; }
            .admin-header-actions { width: 100%; justify-content: space-between; }
            .admin-tab { padding: 10px 14px; font-size: 0.8rem; }
            .admin-tab-content { padding: 14px; }
            .bulk-cards-grid { grid-template-columns: 1fr; }
        }
    `;
    document.head.appendChild(style);
}

function injectAdminHTML() {
    if (document.getElementById('axxes-admin-wrapper')) return;
    const div = document.createElement('div');
    div.id = 'axxes-admin-wrapper';
    div.innerHTML = `
        <!-- Admin PIN Modal -->
        <div id="admin-password-modal" class="modal admin-fullscreen-modal">
            <div class="modal-content" style="max-width: 420px; text-align: center; background:var(--admin-bg); padding:35px 25px; border-radius:18px; border:1px solid var(--admin-border);">
                <img src="logo.webp" alt="AXXES" style="height:48px; margin-bottom:1rem; object-fit:contain;">
                <h3 style="margin-bottom: 0.4rem; font-family:'Bebas Neue', sans-serif; font-size:1.6rem; letter-spacing:1px;">Acceso Administrativo</h3>
                <p style="color: var(--admin-muted); font-size: 0.82rem; margin-bottom: 16px;">Ingresa el PIN de 4 dígitos para gestionar tu tienda:</p>
                
                <form id="admin-login-form" class="admin-form">
                    <div class="pin-input-group">
                        <input type="password" maxlength="1" class="pin-digit" autofocus>
                        <input type="password" maxlength="1" class="pin-digit">
                        <input type="password" maxlength="1" class="pin-digit">
                        <input type="password" maxlength="1" class="pin-digit">
                    </div>
                    <p id="admin-login-message" style="color:var(--admin-danger); font-size:0.85rem; height:20px; margin-bottom:12px;"></p>
                    <button class="admin-btn-primary" type="submit" style="width: 100%; padding: 12px;">
                        <i class="fas fa-lock-open"></i> Entrar al Panel
                    </button>
                    <button type="button" class="admin-btn-secondary" onclick="document.getElementById('admin-password-modal').style.display='none'" style="width:100%; margin-top:8px; padding:10px;">
                        Cancelar
                    </button>
                </form>
            </div>
        </div>

        <!-- Full Admin Dashboard Panel -->
        <div id="admin-panel" class="modal admin-fullscreen-modal">
            <div class="modal-content admin-panel-content">
                <!-- Header -->
                <div class="admin-panel-header">
                    <div>
                        <h2>Panel Administrativo AXXES</h2>
                        <p class="admin-subtitle">Gestión de catálogo, productos y sincronización en vivo.</p>
                    </div>
                    <div class="admin-header-actions">
                        <span id="admin-sync-indicator" class="admin-sync-badge not-configured" onclick="document.querySelector('[data-tab=tab-config]').click()">
                            <i class="fas fa-circle"></i> Verificando conexión...
                        </span>
                        <button class="admin-btn-success" onclick="publishChanges()" id="admin-publish-btn" title="Publicar cambios en internet para todos los visitantes">
                            <i class="fas fa-cloud-upload-alt"></i> Publicar para Todos
                        </button>
                        <div class="admin-header-stats">
                            <span class="admin-stat-pill" id="admin-header-product-stat">0 Productos</span>
                            <span class="admin-stat-pill" id="admin-header-category-stat">0 Categorías</span>
                        </div>
                        <button class="admin-btn-secondary admin-btn-sm" id="admin-panel-close" title="Cerrar panel">✕ Cerrar</button>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="tab-products"><i class="fas fa-box"></i> Productos</button>
                    <button class="admin-tab" data-tab="tab-bulk"><i class="fas fa-layer-group"></i> Carga Masiva</button>
                    <button class="admin-tab" data-tab="tab-add"><i class="fas fa-plus-circle"></i> Crear / Editar</button>
                    <button class="admin-tab" data-tab="tab-categories"><i class="fas fa-tags"></i> Categorías</button>
                    <button class="admin-tab" data-tab="tab-config"><i class="fas fa-cog"></i> Configuración</button>
                    <button class="admin-tab" data-tab="tab-backup"><i class="fas fa-database"></i> Backup</button>
                </div>

                <!-- TAB 1: PRODUCTOS (INVENTARIO) -->
                <div class="admin-tab-content active" id="tab-products">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <h3 style="font-family:'Bebas Neue',sans-serif; font-size:1.3rem; letter-spacing:1px; margin:0;">Inventario de Productos</h3>
                            <button class="admin-btn-primary admin-btn-sm" onclick="document.querySelector('[data-tab=tab-bulk]').click()">
                                <i class="fas fa-layer-group"></i> Subir Varios Productos
                            </button>
                        </div>
                        <input type="text" id="admin-product-search" placeholder="🔍 Buscar perfume o marca..." class="admin-search-input">
                    </div>
                    <div class="admin-prods-grid" id="admin-product-list"></div>
                </div>

                <!-- TAB 2: CARGA MASIVA DE PRODUCTOS (NUEVO) -->
                <div class="admin-tab-content" id="tab-bulk">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <div>
                                <h3><i class="fas fa-layer-group"></i> Carga Masiva de Productos</h3>
                                <p style="color:var(--admin-muted); font-size:0.8rem; margin:2px 0 0 0;">Agrega decenas de perfumes en segundos sin repetir pasos.</p>
                            </div>
                        </div>

                        <!-- Subtabs -->
                        <div class="admin-bulk-subtabs">
                            <button class="admin-bulk-subtab-btn active" data-submode="images" onclick="switchBulkSubmode('images')">
                                <i class="fas fa-images"></i> 1. Subir Múltiples Fotos
                            </button>
                            <button class="admin-bulk-subtab-btn" data-submode="table" onclick="switchBulkSubmode('table')">
                                <i class="fas fa-table"></i> 2. Tabla Rápida en Lote
                            </button>
                            <button class="admin-bulk-subtab-btn" data-submode="excel" onclick="switchBulkSubmode('excel')">
                                <i class="fas fa-file-excel"></i> 3. Pegar desde Excel / Texto
                            </button>
                        </div>

                        <!-- SUBMODE 1: MULTIPLE IMAGES -->
                        <div id="bulk-submode-images" class="bulk-submode-panel">
                            <div class="admin-dropzone" id="bulk-image-dropzone" onclick="document.getElementById('bulk-images-input').click()">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <h4>Selecciona Varias Fotos de Perfumes a la Vez</h4>
                                <p>Toca aquí o arrastra imágenes desde tu celular o computadora. Se optimizarán automáticamente.</p>
                                <input type="file" id="bulk-images-input" multiple accept="image/*" style="display:none;">
                            </div>

                            <div id="bulk-images-progress" style="display:none; text-align:center; padding:15px; color:var(--admin-accent);">
                                <i class="fas fa-spinner fa-spin fa-2x"></i>
                                <p style="margin-top:8px;" id="bulk-progress-text">Optimizando imágenes...</p>
                            </div>

                            <div id="bulk-images-controls" style="display:none; margin-bottom:15px; background:var(--admin-bg); padding:12px 16px; border-radius:10px; border:1px solid var(--admin-border); justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                    <span style="font-weight:600; font-size:0.88rem;" id="bulk-selected-count">0 productos listos</span>
                                    <label style="font-size:0.8rem; color:var(--admin-muted); display:inline-flex; align-items:center; gap:5px; cursor:pointer;">
                                        <input type="checkbox" id="bulk-auto-decants" checked style="accent-color:var(--admin-accent);"> Generar decants estándar (5ml, 10ml, 30ml)
                                    </label>
                                </div>
                                <div style="display:flex; gap:8px;">
                                    <button class="admin-btn-secondary admin-btn-sm" onclick="clearBulkImages()">Limpiar Todo</button>
                                    <button class="admin-btn-success" onclick="saveBulkImagesProducts()" id="btn-save-bulk-images">
                                        <i class="fas fa-save"></i> Guardar Todos los Productos
                                    </button>
                                </div>
                            </div>

                            <div class="bulk-cards-grid" id="bulk-images-container"></div>
                        </div>

                        <!-- SUBMODE 2: QUICK TABLE -->
                        <div id="bulk-submode-table" class="bulk-submode-panel" style="display:none;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
                                <div style="display:flex; gap:8px;">
                                    <button class="admin-btn-secondary admin-btn-sm" onclick="addBulkTableRow()"><i class="fas fa-plus"></i> + 1 Fila</button>
                                    <button class="admin-btn-secondary admin-btn-sm" onclick="addBulkMultipleRows(5)"><i class="fas fa-plus-circle"></i> + 5 Filas</button>
                                </div>
                                <button class="admin-btn-success" onclick="saveBulkTableProducts()">
                                    <i class="fas fa-save"></i> Guardar Productos de la Tabla
                                </button>
                            </div>
                            <div class="bulk-quick-table-wrap">
                                <table class="bulk-table" id="bulk-quick-table">
                                    <thead>
                                        <tr>
                                            <th style="width:40px;">#</th>
                                            <th>Nombre del Perfume *</th>
                                            <th>Marca *</th>
                                            <th>Precio Botella ($) *</th>
                                            <th>Género</th>
                                            <th>Categoría</th>
                                            <th>Imagen (URL o Foto)</th>
                                            <th style="width:50px;"></th>
                                        </tr>
                                    </thead>
                                    <tbody id="bulk-table-tbody"></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- SUBMODE 3: EXCEL / TEXT -->
                        <div id="bulk-submode-excel" class="bulk-submode-panel" style="display:none;">
                            <p style="font-size:0.84rem; color:var(--admin-muted); margin-bottom:8px;">
                                Pega aquí filas copiadas de Excel, Google Sheets o texto plano (separadas por tabulación, coma o barra vertical):
                            </p>
                            <textarea id="bulk-excel-input" style="width:100%; height:140px; background:var(--admin-bg); border:1px solid var(--admin-border); border-radius:8px; padding:12px; color:#fff; font-family:monospace; font-size:0.82rem; margin-bottom:12px;" placeholder="Ejemplo:&#10;Sauvage Elixir	DIOR	650000	Hombre	Hombre&#10;Baccarat Rouge 540	MFK	1450000	Unisex	Nicho&#10;Yara	Lattafa	220000	Mujer	Árabes"></textarea>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <button class="admin-btn-primary" onclick="parseExcelText()">
                                    <i class="fas fa-search"></i> Procesar y Previsualizar
                                </button>
                                <button class="admin-btn-success" id="bulk-excel-save-btn" onclick="saveParsedExcelProducts()" style="display:none;">
                                    <i class="fas fa-save"></i> Guardar Todos
                                </button>
                            </div>
                            <div id="bulk-excel-preview" style="margin-top:16px;"></div>
                        </div>
                    </div>
                </div>

                <!-- TAB 3: CREAR / EDITAR PRODUCTO INDIVIDUAL -->
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
                                <textarea id="admin-product-description" placeholder="Notas olfativas, ocasión de uso, duración..."></textarea>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Género *</label>
                                    <select id="admin-product-gender">
                                        <option value="Hombre">Hombre</option>
                                        <option value="Mujer">Mujer</option>
                                        <option value="Unisex">Unisex</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Categorías del Producto</label>
                                    <div class="admin-cats-checkboxes" id="admin-product-categories-checkboxes"></div>
                                </div>
                            </div>

                            <!-- Image with Auto-Compressor -->
                            <div class="form-group">
                                <label>Imagen del Producto *</label>
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; align-items:start;">
                                    <div>
                                        <small style="margin-bottom:6px; color:var(--admin-muted);">Opción A: Subir foto (se comprime automáticamente a ~50KB):</small>
                                        <input type="file" id="admin-product-image-file" accept="image/*">
                                    </div>
                                    <div>
                                        <small style="margin-bottom:6px; color:var(--admin-muted);">Opción B: O pegar URL de imagen externa:</small>
                                        <input type="text" id="admin-product-image-url" placeholder="https://ejemplo.com/perfume.jpg">
                                    </div>
                                </div>
                                <div id="admin-image-preview-wrap" style="display:none; margin-top:10px;">
                                    <img id="admin-image-preview-img" src="" alt="Preview" style="max-height:100px; border-radius:8px; border:1px solid var(--admin-border); background:#161622; padding:4px;">
                                </div>
                            </div>

                            <!-- Pricing & Decants -->
                            <div class="form-row">
                                <div class="form-group">
                                    <label>¿Vender Botella Completa?</label>
                                    <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
                                        <input type="checkbox" id="admin-product-sell-bottle" checked style="width:20px; height:20px; accent-color:var(--admin-accent);">
                                        <span style="font-size:0.85rem;">Sí, vender presentación completa</span>
                                    </div>
                                </div>
                                <div class="form-group" id="admin-bottle-price-group">
                                    <label>Precio Botella ($ COP) *</label>
                                    <input type="number" id="admin-product-price" placeholder="Ej: 650000">
                                </div>
                            </div>

                            <!-- Decants -->
                            <div class="form-group">
                                <label>Decants / Muestras (Opcional)</label>
                                <div class="decants-section-admin">
                                    <div id="admin-decants-list"></div>
                                    <button type="button" class="admin-btn-secondary admin-btn-sm" style="margin-top:8px;" onclick="addDecantRow()">
                                        <i class="fas fa-plus"></i> + Agregar Tamaño de Decant
                                    </button>
                                </div>
                            </div>

                            <!-- Badges -->
                            <div class="form-group">
                                <label>Etiquetas Especiales</label>
                                <div style="display:flex; gap:16px; flex-wrap:wrap; margin-top:6px;">
                                    <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
                                        <input type="checkbox" id="admin-product-featured" style="accent-color:var(--admin-accent);"> Destacado
                                    </label>
                                    <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
                                        <input type="checkbox" id="admin-product-bestseller" style="accent-color:var(--admin-accent);"> Más Vendido
                                    </label>
                                    <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
                                        <input type="checkbox" id="admin-product-offer" style="accent-color:var(--admin-accent);"> Oferta
                                    </label>
                                    <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
                                        <input type="checkbox" id="admin-product-new" style="accent-color:var(--admin-accent);"> Nuevo
                                    </label>
                                    <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
                                        <input type="checkbox" id="admin-product-active" checked style="accent-color:var(--admin-accent);"> Activo (Visible en tienda)
                                    </label>
                                </div>
                            </div>

                            <div style="display:flex; gap:12px; margin-top:20px;">
                                <button class="admin-btn-primary" type="submit" id="admin-product-submit-btn" style="flex:1;">
                                    <i class="fas fa-save"></i> Guardar Producto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- TAB 4: CATEGORÍAS -->
                <div class="admin-tab-content" id="tab-categories">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3>Gestión de Categorías</h3>
                        </div>
                        <form id="admin-category-form" class="admin-form" style="margin-bottom:20px;">
                            <div style="display:flex; gap:10px;">
                                <input type="text" id="admin-new-category" required placeholder="Nombre de la nueva categoría (Ej: Árabes, Gourmand...)">
                                <button class="admin-btn-primary" type="submit"><i class="fas fa-plus"></i> Agregar</button>
                            </div>
                        </form>
                        <div class="admin-categories-list" id="admin-categories-tags"></div>
                    </div>
                </div>

                <!-- TAB 5: CONFIGURACIÓN & GITHUB SYNC -->
                <div class="admin-tab-content" id="tab-config">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3><i class="fab fa-github"></i> Sincronización en Vivo para Todos los Visitantes</h3>
                        </div>
                        <div style="background:rgba(96,90,254,0.06); border:1px solid rgba(96,90,254,0.25); border-radius:10px; padding:16px; margin-bottom:18px;">
                            <p style="font-size:0.86rem; color:#fff; margin:0 0 6px 0; font-weight:600;">
                                ¿Cómo funciona para que todos los que entren a la web vean los cambios?
                            </p>
                            <p style="font-size:0.8rem; color:var(--admin-muted); margin:0;">
                                Al configurar tu Token de GitHub, cada vez que agregas, editas o borras productos, se sincronizan directamente con tu repositorio <strong>Juan-Arenas/axxes</strong>. Así, cualquier cliente en cualquier celular del mundo ve los cambios al instante.
                            </p>
                        </div>

                        <div class="form-group">
                            <label>GitHub Personal Access Token (PAT)</label>
                            <div style="display:flex; gap:10px;">
                                <input type="password" id="admin-github-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx">
                                <button class="admin-btn-primary" onclick="saveGithubToken()">Guardar Token</button>
                                <button class="admin-btn-secondary" onclick="testGithubConnection()">Probar Conexión</button>
                            </div>
                            <small id="admin-token-status-msg" style="margin-top:6px; color:var(--admin-muted);"></small>
                        </div>

                        <div class="form-group" style="margin-top:16px;">
                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                                <input type="checkbox" id="admin-auto-sync-checkbox" checked style="accent-color:var(--admin-accent); width:18px; height:18px;">
                                <span><strong>Sincronizar automáticamente al guardar</strong> (Guarda y publica en vivo sin clics extra)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Logo config -->
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3>Logo de la Tienda</h3>
                        </div>
                        <div class="form-group">
                            <label>Subir Nuevo Logo</label>
                            <input type="file" id="admin-logo-file" accept="image/*">
                            <div class="logo-preview-wrap" style="margin-top:10px;">
                                <img id="admin-logo-preview-img" src="logo.webp" alt="Logo Actual" style="max-height:50px; object-fit:contain;">
                            </div>
                            <button class="admin-btn-primary" style="margin-top:12px;" onclick="saveLogo()">
                                <i class="fas fa-save"></i> Guardar Logo
                            </button>
                        </div>
                    </div>
                </div>

                <!-- TAB 6: BACKUP -->
                <div class="admin-tab-content" id="tab-backup">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3><i class="fas fa-database"></i> Copia de Seguridad y Restauración</h3>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div>
                                <h4 style="margin-bottom:8px; font-size:0.95rem;">Exportar Catálogo</h4>
                                <p style="color:var(--admin-muted); font-size:0.8rem; margin-bottom:12px;">Descarga un archivo JSON con todos los productos y configuraciones.</p>
                                <button class="admin-btn-primary" style="width:100%;" onclick="window.axxesStore.exportBackup()">
                                    <i class="fas fa-download"></i> Descargar Backup (.json)
                                </button>
                            </div>
                            <div>
                                <h4 style="margin-bottom:8px; font-size:0.95rem;">Restaurar Catálogo</h4>
                                <p style="color:var(--admin-muted); font-size:0.8rem; margin-bottom:12px;">Sube un archivo de backup previamente descargado.</p>
                                <input type="file" id="admin-import-file" accept=".json" style="margin-bottom:10px;">
                                <button class="admin-btn-secondary" style="width:100%;" onclick="importBackupFile()">
                                    <i class="fas fa-upload"></i> Restaurar Backup
                                </button>
                            </div>
                        </div>
                        <div style="border-top:1px solid var(--admin-border); margin-top:20px; padding-top:16px; text-align:right;">
                            <button class="admin-btn-danger" onclick="resetAllData()">
                                <i class="fas fa-exclamation-triangle"></i> Restaurar Valores Iniciales de Fábrica
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.appendChild(div);
}

// Global list for holding pending bulk image items
let pendingBulkImages = [];

function setupAdminEventListeners() {
    // 1. PIN Modal digits auto-advance
    const inputs = Array.from(document.querySelectorAll('.pin-digit'));
    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value && index < inputs.length - 1) inputs[index + 1].focus();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) inputs[index - 1].focus();
        });
    });

    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pin = inputs.map(i => i.value).join('');
            if (pin === '1710') {
                document.getElementById('admin-password-modal').style.display = 'none';
                document.getElementById('admin-panel').style.display = 'flex';
                renderAdminDashboard();
            } else {
                document.getElementById('admin-login-message').textContent = 'PIN Incorrecto (Intenta 1710)';
                inputs.forEach(i => i.value = '');
                inputs[0].focus();
            }
        });
    }

    // 2. Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetContent = document.getElementById(tab.dataset.tab);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // 3. Single image file compression on selection
    const singleImageFile = document.getElementById('admin-product-image-file');
    if (singleImageFile) {
        singleImageFile.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                const previewWrap = document.getElementById('admin-image-preview-wrap');
                const previewImg = document.getElementById('admin-image-preview-img');
                previewWrap.style.display = 'block';
                previewImg.style.opacity = '0.5';

                try {
                    const compressed = await window.compressProductImage(file, 800, 800, 0.78);
                    document.getElementById('admin-product-image-url').value = compressed;
                    previewImg.src = compressed;
                    previewImg.style.opacity = '1';

                    const origKb = Math.round(file.size / 1024);
                    const newKb = Math.round(compressed.length * 0.75 / 1024);
                    let infoEl = document.getElementById('admin-single-img-info');
                    if (!infoEl) {
                        infoEl = document.createElement('small');
                        infoEl.id = 'admin-single-img-info';
                        infoEl.style.color = '#22c55e';
                        previewWrap.appendChild(infoEl);
                    }
                    infoEl.innerHTML = `✓ Optimizada: <strong>${newKb} KB</strong> (original: ${origKb} KB)`;
                } catch (err) {
                    console.error("Error optimizando imagen", err);
                    previewImg.style.opacity = '1';
                }
            }
        });
    }

    // Single image manual URL change
    const singleImageUrl = document.getElementById('admin-product-image-url');
    if (singleImageUrl) {
        singleImageUrl.addEventListener('input', function() {
            const previewWrap = document.getElementById('admin-image-preview-wrap');
            const previewImg = document.getElementById('admin-image-preview-img');
            if (this.value) {
                previewImg.src = this.value;
                previewWrap.style.display = 'block';
            } else {
                previewWrap.style.display = 'none';
            }
        });
    }

    // 4. Bottle toggle
    const sellBottleCb = document.getElementById('admin-product-sell-bottle');
    if (sellBottleCb) {
        sellBottleCb.addEventListener('change', function() {
            const priceGroup = document.getElementById('admin-bottle-price-group');
            if (priceGroup) priceGroup.style.opacity = this.checked ? '1' : '0.4';
        });
    }

    // 5. Panel Close
    const closeBtn = document.getElementById('admin-panel-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('admin-panel').style.display = 'none';
        });
    }

    // 6. Single product form submit
    const prodForm = document.getElementById('admin-product-form');
    if (prodForm) {
        prodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('admin-product-submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            const id = document.getElementById('admin-product-id').value;
            
            // Gather decants
            const decants = [];
            document.querySelectorAll('.decant-row').forEach(row => {
                const size = row.querySelector('.decant-size').value.trim();
                const price = parseFloat(row.querySelector('.decant-price').value) || 0;
                if (size && price > 0) {
                    decants.push({ size, price });
                }
            });

            // Gather categories
            const selectedCats = [];
            document.querySelectorAll('#admin-product-categories-checkboxes input:checked').forEach(cb => {
                selectedCats.push(cb.value);
            });

            // Image
            let finalImage = document.getElementById('admin-product-image-url').value;
            if (!finalImage && id) {
                const existing = window.axxesStore.products.find(x => x.id === id);
                finalImage = existing ? existing.image : '';
            }

            const sellBottle = document.getElementById('admin-product-sell-bottle').checked;

            const prod = {
                id: id || 'axx-' + Date.now(),
                name: document.getElementById('admin-product-name').value.trim(),
                brand: document.getElementById('admin-product-brand').value.trim().toUpperCase(),
                description: document.getElementById('admin-product-description').value.trim(),
                gender: document.getElementById('admin-product-gender').value,
                categories: selectedCats.length > 0 ? selectedCats : ['Unisex'],
                category: selectedCats[0] || 'Unisex',
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
                await window.axxesStore.updateProduct(id, prod);
            } else {
                await window.axxesStore.addProduct(prod);
            }
            
            resetAdminForm();
            renderAdminDashboard();
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
            
            window.showToast(id ? '✓ Producto actualizado y protegido contra reinicio.' : '✓ Producto guardado y protegido contra reinicio.');
            
            // Switch to inventory
            document.querySelector('[data-tab="tab-products"]').click();
        });
    }

    // 7. Category form
    const catForm = document.getElementById('admin-category-form');
    if (catForm) {
        catForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const catName = document.getElementById('admin-new-category').value.trim();
            if (catName) {
                await window.axxesStore.addCategory(catName);
                document.getElementById('admin-category-form').reset();
                renderAdminDashboard();
                window.showToast(`✓ Categoría "${catName}" agregada.`);
            }
        });
    }

    // 8. Product Search
    const searchInput = document.getElementById('admin-product-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderAdminProductList(searchInput.value.toLowerCase().trim());
        });
    }

    // 9. Bulk images input listener
    const bulkImagesInput = document.getElementById('bulk-images-input');
    if (bulkImagesInput) {
        bulkImagesInput.addEventListener('change', handleBulkImagesSelected);
    }

    // Drag and drop for bulk images
    const dropzone = document.getElementById('bulk-image-dropzone');
    if (dropzone) {
        ['dragenter', 'dragover'].forEach(name => {
            dropzone.addEventListener(name, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        });
        ['dragleave', 'drop'].forEach(name => {
            dropzone.addEventListener(name, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); });
        });
        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            if (dt && dt.files && dt.files.length > 0) {
                handleBulkImagesFiles(dt.files);
            }
        });
    }

    // Auto-sync setting change
    const autoSyncCb = document.getElementById('admin-auto-sync-checkbox');
    if (autoSyncCb) {
        const stored = localStorage.getItem('axxes_auto_sync_enabled');
        autoSyncCb.checked = stored !== 'false';
        autoSyncCb.addEventListener('change', () => {
            localStorage.setItem('axxes_auto_sync_enabled', autoSyncCb.checked ? 'true' : 'false');
            window.showToast(autoSyncCb.checked ? '✓ Sincronización automática activada.' : 'Sincronización automática desactivada.');
        });
    }

    // Listen to data updates from other sources
    document.addEventListener('axxesDataUpdated', () => {
        if (document.getElementById('admin-panel').style.display === 'flex') {
            renderAdminDashboard();
        }
    });

    document.addEventListener('axxesGithubSynced', () => {
        updateSyncBadge();
    });
}

// Switch between bulk upload submodes
window.switchBulkSubmode = function(mode) {
    document.querySelectorAll('.admin-bulk-subtab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.submode === mode);
    });
    document.getElementById('bulk-submode-images').style.display = mode === 'images' ? 'block' : 'none';
    document.getElementById('bulk-submode-table').style.display = mode === 'table' ? 'block' : 'none';
    document.getElementById('bulk-submode-excel').style.display = mode === 'excel' ? 'block' : 'none';

    if (mode === 'table' && document.getElementById('bulk-table-tbody').children.length === 0) {
        addBulkMultipleRows(3);
    }
};

// ================== BULK MODE 1: MULTIPLE IMAGES ==================
async function handleBulkImagesSelected(e) {
    if (e.target.files && e.target.files.length > 0) {
        await handleBulkImagesFiles(e.target.files);
    }
}

async function handleBulkImagesFiles(fileList) {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) {
        alert('Por favor selecciona archivos de imagen válidos.');
        return;
    }

    const progressWrap = document.getElementById('bulk-images-progress');
    const progressText = document.getElementById('bulk-progress-text');
    progressWrap.style.display = 'block';

    const categories = window.axxesStore.categories;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progressText.textContent = `Optimizando imagen ${i + 1} de ${files.length}: ${file.name}`;
        
        try {
            // Compress each image down to ~50KB WebP
            const compressed = await window.compressProductImage(file, 800, 800, 0.78);
            
            // Infer clean product name & brand from filename (e.g. "Sauvage Dior.jpg" -> Name: Sauvage, Brand: DIOR)
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
            const parts = cleanName.split(/\s+/);
            let brand = 'AXXES';
            let name = cleanName;
            if (parts.length > 1) {
                // If last word is likely brand or first word
                brand = parts[0].toUpperCase();
                name = cleanName;
            }

            pendingBulkImages.push({
                id: 'bulk-' + Date.now() + '-' + i,
                name: name,
                brand: brand,
                price: 0,
                gender: 'Unisex',
                category: categories[0] ? categories[0].name : 'Unisex',
                image: compressed
            });
        } catch (err) {
            console.error("Error comprimiendo", file.name, err);
        }
    }

    progressWrap.style.display = 'none';
    renderBulkCards();
}

function renderBulkCards() {
    const container = document.getElementById('bulk-images-container');
    const controls = document.getElementById('bulk-images-controls');
    const countLabel = document.getElementById('bulk-selected-count');

    if (pendingBulkImages.length === 0) {
        container.innerHTML = '';
        controls.style.display = 'none';
        return;
    }

    controls.style.display = 'flex';
    countLabel.textContent = `${pendingBulkImages.length} productos seleccionados`;

    const categories = window.axxesStore.categories;
    const catOptions = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    container.innerHTML = pendingBulkImages.map((p, idx) => `
        <div class="bulk-card-item" id="bulk-card-${p.id}">
            <button class="bulk-remove-btn" onclick="removeBulkImageItem('${p.id}')" title="Eliminar"><i class="fas fa-times"></i></button>
            <div class="bulk-card-header">
                <img src="${p.image}" class="bulk-card-thumb" alt="Preview">
                <div style="flex:1; min-width:0;">
                    <input type="text" class="bulk-item-name" data-id="${p.id}" value="${p.name}" placeholder="Nombre del perfume *" style="font-weight:600; width:100%;">
                </div>
            </div>
            <div class="bulk-card-fields">
                <div class="row-2">
                    <input type="text" class="bulk-item-brand" data-id="${p.id}" value="${p.brand}" placeholder="Marca (Ej: DIOR)">
                    <input type="number" class="bulk-item-price" data-id="${p.id}" value="${p.price || ''}" placeholder="Precio Botella ($) *">
                </div>
                <div class="row-2">
                    <select class="bulk-item-gender" data-id="${p.id}">
                        <option value="Hombre" ${p.gender === 'Hombre' ? 'selected' : ''}>Hombre</option>
                        <option value="Mujer" ${p.gender === 'Mujer' ? 'selected' : ''}>Mujer</option>
                        <option value="Unisex" ${p.gender === 'Unisex' ? 'selected' : ''}>Unisex</option>
                    </select>
                    <select class="bulk-item-cat" data-id="${p.id}">
                        ${catOptions}
                    </select>
                </div>
            </div>
        </div>
    `).join('');
}

window.removeBulkImageItem = function(id) {
    pendingBulkImages = pendingBulkImages.filter(x => x.id !== id);
    renderBulkCards();
};

window.clearBulkImages = function() {
    pendingBulkImages = [];
    renderBulkCards();
    document.getElementById('bulk-images-input').value = '';
};

window.saveBulkImagesProducts = async function() {
    if (pendingBulkImages.length === 0) return;

    const btn = document.getElementById('btn-save-bulk-images');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    const autoDecants = document.getElementById('bulk-auto-decants').checked;
    const newProducts = [];

    pendingBulkImages.forEach(item => {
        const card = document.getElementById('bulk-card-' + item.id);
        if (!card) return;

        const name = card.querySelector('.bulk-item-name').value.trim() || item.name;
        const brand = card.querySelector('.bulk-item-brand').value.trim().toUpperCase() || 'AXXES';
        const price = parseFloat(card.querySelector('.bulk-item-price').value) || 0;
        const gender = card.querySelector('.bulk-item-gender').value;
        const category = card.querySelector('.bulk-item-cat').value;

        // Auto decants calculation based on bottle price if enabled
        const decants = [];
        if (autoDecants && price > 0) {
            decants.push({ size: '5ml', price: Math.round(price * 0.08 / 1000) * 1000 || 35000 });
            decants.push({ size: '10ml', price: Math.round(price * 0.14 / 1000) * 1000 || 55000 });
            decants.push({ size: '30ml', price: Math.round(price * 0.32 / 1000) * 1000 || 110000 });
        }

        newProducts.push({
            id: 'axx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            name: name,
            brand: brand,
            description: '',
            gender: gender,
            categories: [category],
            category: category,
            image: item.image,
            priceBottle: price,
            sellBottle: price > 0,
            decants: decants,
            active: true,
            featured: false,
            bestseller: false,
            offer: false,
            isNew: true
        });
    });

    await window.axxesStore.addProductsBulk(newProducts);
    
    pendingBulkImages = [];
    renderBulkCards();
    document.getElementById('bulk-images-input').value = '';
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Guardar Todos los Productos';

    renderAdminDashboard();
    window.showToast(`✓ ¡Éxito! Se agregaron ${newProducts.length} productos y están protegidos contra reinicio.`);
    
    // Switch to products inventory
    document.querySelector('[data-tab="tab-products"]').click();
};

// ================== BULK MODE 2: QUICK TABLE ==================
window.addBulkTableRow = function(data = {}) {
    const tbody = document.getElementById('bulk-table-tbody');
    const rowId = 'row-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const rowNum = tbody.children.length + 1;

    const categories = window.axxesStore.categories;
    const catOptions = categories.map(c => `<option value="${c.name}" ${data.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('');

    const tr = document.createElement('tr');
    tr.id = rowId;
    tr.innerHTML = `
        <td style="text-align:center; color:var(--admin-muted);">${rowNum}</td>
        <td><input type="text" class="tbl-name" value="${data.name || ''}" placeholder="Ej: Sauvage" required></td>
        <td><input type="text" class="tbl-brand" value="${data.brand || ''}" placeholder="DIOR"></td>
        <td><input type="number" class="tbl-price" value="${data.price || ''}" placeholder="650000"></td>
        <td>
            <select class="tbl-gender">
                <option value="Hombre" ${data.gender === 'Hombre' ? 'selected' : ''}>Hombre</option>
                <option value="Mujer" ${data.gender === 'Mujer' ? 'selected' : ''}>Mujer</option>
                <option value="Unisex" ${data.gender === 'Unisex' ? 'selected' : ''}>Unisex</option>
            </select>
        </td>
        <td>
            <select class="tbl-cat">
                ${catOptions}
            </select>
        </td>
        <td>
            <div style="display:flex; gap:6px; align-items:center;">
                <input type="text" class="tbl-img-url" value="${data.image || ''}" placeholder="URL o subir foto">
                <label style="cursor:pointer; background:#222; padding:6px 10px; border-radius:4px; border:1px solid #444;" title="Subir foto">
                    📷
                    <input type="file" accept="image/*" style="display:none;" onchange="handleTableRowImage(event, '${rowId}')">
                </label>
            </div>
        </td>
        <td style="text-align:center;">
            <button onclick="document.getElementById('${rowId}').remove()" style="background:transparent; border:none; color:var(--admin-danger); cursor:pointer;">✕</button>
        </td>
    `;
    tbody.appendChild(tr);
};

window.addBulkMultipleRows = function(count = 5) {
    for (let i = 0; i < count; i++) {
        addBulkTableRow();
    }
};

window.handleTableRowImage = async function(event, rowId) {
    const file = event.target.files[0];
    if (file) {
        try {
            const compressed = await window.compressProductImage(file, 800, 800, 0.78);
            const row = document.getElementById(rowId);
            if (row) {
                row.querySelector('.tbl-img-url').value = compressed;
                window.showToast('✓ Imagen cargada para la fila.');
            }
        } catch (err) {
            console.error(err);
        }
    }
};

window.saveBulkTableProducts = async function() {
    const rows = document.querySelectorAll('#bulk-table-tbody tr');
    const newProducts = [];

    rows.forEach(row => {
        const name = row.querySelector('.tbl-name').value.trim();
        const brand = row.querySelector('.tbl-brand').value.trim().toUpperCase() || 'AXXES';
        const price = parseFloat(row.querySelector('.tbl-price').value) || 0;
        const gender = row.querySelector('.tbl-gender').value;
        const category = row.querySelector('.tbl-cat').value;
        const image = row.querySelector('.tbl-img-url').value.trim();

        if (name) {
            newProducts.push({
                id: 'axx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                name: name,
                brand: brand,
                description: '',
                gender: gender,
                categories: [category],
                category: category,
                image: image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
                priceBottle: price,
                sellBottle: price > 0,
                decants: price > 0 ? [
                    { size: '5ml', price: Math.round(price * 0.08 / 1000) * 1000 || 35000 },
                    { size: '10ml', price: Math.round(price * 0.14 / 1000) * 1000 || 55000 }
                ] : [],
                active: true,
                featured: false,
                bestseller: false,
                offer: false,
                isNew: true
            });
        }
    });

    if (newProducts.length === 0) {
        alert('Por favor ingresa al menos un nombre de perfume en la tabla.');
        return;
    }

    await window.axxesStore.addProductsBulk(newProducts);
    document.getElementById('bulk-table-tbody').innerHTML = '';
    addBulkMultipleRows(3);
    renderAdminDashboard();
    window.showToast(`✓ ¡Éxito! ${newProducts.length} productos guardados en el inventario.`);
    document.querySelector('[data-tab="tab-products"]').click();
};

// ================== BULK MODE 3: EXCEL / TEXT PARSER ==================
let parsedExcelItems = [];

window.parseExcelText = function() {
    const text = document.getElementById('bulk-excel-input').value.trim();
    if (!text) {
        alert('Pega primero el texto o tabla de Excel.');
        return;
    }

    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    parsedExcelItems = [];

    const categories = window.axxesStore.categories;
    const defaultCat = categories[0] ? categories[0].name : 'Unisex';

    lines.forEach((line, index) => {
        // Skip header if line contains "nombre" or "precio"
        if (index === 0 && (line.toLowerCase().includes('nombre') || line.toLowerCase().includes('precio'))) {
            return;
        }

        // Split by tabs, commas, or pipe
        let cols = [];
        if (line.includes('\t')) cols = line.split('\t');
        else if (line.includes('|')) cols = line.split('|');
        else cols = line.split(',');

        cols = cols.map(c => c.trim().replace(/^["']|["']$/g, ''));

        if (cols[0]) {
            const name = cols[0];
            const brand = (cols[1] || 'AXXES').toUpperCase();
            // Extract numeric price
            const rawPrice = cols[2] ? cols[2].replace(/[^0-9]/g, '') : '0';
            const price = parseFloat(rawPrice) || 0;
            const gender = cols[3] && ['Hombre','Mujer','Unisex'].includes(cols[3]) ? cols[3] : 'Unisex';
            const category = cols[4] || defaultCat;
            const image = cols[5] || '';

            parsedExcelItems.push({ name, brand, price, gender, category, image });
        }
    });

    const previewDiv = document.getElementById('bulk-excel-preview');
    const saveBtn = document.getElementById('bulk-excel-save-btn');

    if (parsedExcelItems.length === 0) {
        previewDiv.innerHTML = '<p style="color:var(--admin-danger);">No se detectaron productos válidos. Revisa el formato.</p>';
        saveBtn.style.display = 'none';
        return;
    }

    saveBtn.style.display = 'inline-flex';
    saveBtn.innerHTML = `<i class="fas fa-save"></i> Guardar ${parsedExcelItems.length} Productos`;

    previewDiv.innerHTML = `
        <h4 style="font-size:0.95rem; margin-bottom:8px; color:var(--admin-success);">✓ Se detectaron ${parsedExcelItems.length} productos listos para importar:</h4>
        <div style="max-height:260px; overflow-y:auto; border:1px solid var(--admin-border); border-radius:8px;">
            <table class="bulk-table">
                <thead><tr><th>#</th><th>Nombre</th><th>Marca</th><th>Precio</th><th>Género</th><th>Categoría</th></tr></thead>
                <tbody>
                    ${parsedExcelItems.map((p, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td><strong>${p.name}</strong></td>
                            <td>${p.brand}</td>
                            <td>$${p.price.toLocaleString()}</td>
                            <td>${p.gender}</td>
                            <td>${p.category}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

window.saveParsedExcelProducts = async function() {
    if (parsedExcelItems.length === 0) return;

    const newProducts = parsedExcelItems.map(p => ({
        id: 'axx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: p.name,
        brand: p.brand,
        description: '',
        gender: p.gender,
        categories: [p.category],
        category: p.category,
        image: p.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        priceBottle: p.price,
        sellBottle: p.price > 0,
        decants: p.price > 0 ? [
            { size: '5ml', price: Math.round(p.price * 0.08 / 1000) * 1000 || 35000 },
            { size: '10ml', price: Math.round(p.price * 0.14 / 1000) * 1000 || 55000 }
        ] : [],
        active: true,
        featured: false,
        bestseller: false,
        offer: false,
        isNew: true
    }));

    await window.axxesStore.addProductsBulk(newProducts);
    
    document.getElementById('bulk-excel-input').value = '';
    document.getElementById('bulk-excel-preview').innerHTML = '';
    document.getElementById('bulk-excel-save-btn').style.display = 'none';
    parsedExcelItems = [];

    renderAdminDashboard();
    window.showToast(`✓ ¡Éxito! ${newProducts.length} productos importados correctamente.`);
    document.querySelector('[data-tab="tab-products"]').click();
};

// ================== DASHBOARD RENDERING & HELPERS ==================
window.showPinModal = function() {
    const modal = document.getElementById('admin-password-modal');
    if (modal) {
        modal.style.display = 'flex';
        const first = modal.querySelector('.pin-digit');
        if (first) setTimeout(() => first.focus(), 100);
    }
};

window.renderAdminDashboard = function() {
    renderCategoryCheckboxes();
    renderCategoriesManagement();
    renderAdminProductList('');
    updateSyncBadge();

    // Stats
    const pCount = window.axxesStore.products.length;
    const cCount = window.axxesStore.categories.length;
    const pStat = document.getElementById('admin-header-product-stat');
    const cStat = document.getElementById('admin-header-category-stat');
    if (pStat) pStat.textContent = `${pCount} Productos`;
    if (cStat) cStat.textContent = `${cCount} Categorías`;

    // Logo
    if (window.axxesStore.siteConfig && window.axxesStore.siteConfig.logo) {
        const logoPreview = document.getElementById('admin-logo-preview-img');
        if (logoPreview) logoPreview.src = window.axxesStore.siteConfig.logo;
    }
};

function updateSyncBadge() {
    const badge = document.getElementById('admin-sync-indicator');
    if (!badge) return;

    const token = localStorage.getItem('axxes_github_token');
    const hasPending = localStorage.getItem('axxes_has_unsynced_changes');

    if (!token) {
        badge.className = 'admin-sync-badge not-configured';
        badge.innerHTML = '<i class="fas fa-exclamation-circle"></i> Configurar GitHub Token';
        badge.title = 'Haz clic para configurar tu token y que tus clientes vean los cambios';
    } else if (hasPending) {
        badge.className = 'admin-sync-badge pending';
        badge.innerHTML = '<i class="fas fa-clock"></i> Cambios Pendientes (Clic en Publicar)';
        badge.title = 'Tienes cambios locales. Haz clic en "Publicar para Todos"';
    } else {
        badge.className = 'admin-sync-badge synced';
        badge.innerHTML = '<i class="fas fa-check-circle"></i> Sincronizado en Vivo';
        badge.title = 'Todos los clientes en internet ven la versión actual';
    }
}

function renderAdminProductList(searchQuery = '') {
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

    if (products.length === 0) {
        prodList.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:40px; color:var(--admin-muted);">
                <i class="fas fa-box-open fa-3x" style="margin-bottom:12px; opacity:0.4;"></i>
                <p>No se encontraron productos.</p>
                <button class="admin-btn-primary admin-btn-sm" onclick="document.querySelector('[data-tab=tab-bulk]').click()">
                    + Cargar Productos Ahora
                </button>
            </div>
        `;
        return;
    }
    
    prodList.innerHTML = products.map(p => {
        const catsHtml = (p.categories || []).map(c => `<span class="cat-tag">${c}</span>`).join('');
        const decantInfo = Array.isArray(p.decants) && p.decants.length > 0 
            ? p.decants.map(d => d.size).join(', ')
            : 'Sin decants';
        const statusDot = p.active 
            ? '<span style="color:#22c55e;">● Activo</span>' 
            : '<span style="color:#ef4444;">○ Inactivo</span>';
        const priceDisplay = p.priceBottle > 0 ? `$${p.priceBottle.toLocaleString()}` : 'Solo decants';
        const imgSrc = p.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80';

        return `
        <div class="admin-prod-card">
            <div class="admin-prod-card-main">
                <img src="${imgSrc}" class="admin-prod-thumb" alt="${p.name}">
                <div class="admin-prod-info">
                    <div class="name">${p.name}</div>
                    <div class="meta"><strong>${p.brand || 'AXXES'}</strong> · ${priceDisplay}</div>
                    <div class="meta" style="font-size:0.72rem;">${statusDot} · Decants: ${decantInfo}</div>
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

window.resetAdminForm = function() {
    const form = document.getElementById('admin-product-form');
    if (form) form.reset();

    document.getElementById('admin-product-id').value = '';
    document.getElementById('admin-product-image-url').value = '';
    document.getElementById('admin-image-preview-wrap').style.display = 'none';
    document.getElementById('admin-image-preview-img').src = '';
    document.getElementById('admin-decants-list').innerHTML = '';
    document.getElementById('admin-form-heading').textContent = 'Agregar Nuevo Producto';
    document.getElementById('admin-product-sell-bottle').checked = true;
    document.getElementById('admin-bottle-price-group').style.opacity = '1';
    
    renderCategoryCheckboxes();
};

function renderCategoryCheckboxes(selectedCats = []) {
    const container = document.getElementById('admin-product-categories-checkboxes');
    if (!container) return;
    
    const categories = window.axxesStore.categories;
    container.innerHTML = categories.map(cat => {
        const isChecked = selectedCats.includes(cat.name) ? 'checked' : '';
        return `
            <label>
                <input type="checkbox" value="${cat.name}" ${isChecked}> ${cat.name}
            </label>
        `;
    }).join('');
}

function renderCategoriesManagement() {
    const list = document.getElementById('admin-categories-tags');
    if (!list) return;

    list.innerHTML = window.axxesStore.categories.map(cat => `
        <div class="admin-cat-pill">
            <span>${cat.name}</span>
            <button onclick="deleteCategory('${cat.name}')" title="Eliminar categoría">✕</button>
        </div>
    `).join('');
}

window.addDecantRow = function(size = '', price = '') {
    const container = document.getElementById('admin-decants-list');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'decant-row';
    row.innerHTML = `
        <input type="text" placeholder="Tamaño (Ej: 5ml)" value="${size}" class="decant-size" style="max-width:120px;">
        <input type="number" placeholder="Precio ($)" value="${price}" class="decant-price">
        <button type="button" class="admin-btn-danger admin-btn-sm" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(row);
};

window.editProduct = function(id) {
    resetAdminForm();
    const p = window.axxesStore.products.find(x => x.id === id);
    if (!p) return;
    
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
    
    document.getElementById('admin-product-image-url').value = p.image || '';
    if (p.image) {
        document.getElementById('admin-image-preview-img').src = p.image;
        document.getElementById('admin-image-preview-wrap').style.display = 'block';
    }
    
    document.getElementById('admin-product-featured').checked = Boolean(p.featured);
    document.getElementById('admin-product-bestseller').checked = Boolean(p.bestseller);
    document.getElementById('admin-product-offer').checked = Boolean(p.offer);
    document.getElementById('admin-product-new').checked = Boolean(p.isNew);
    document.getElementById('admin-product-active').checked = p.active !== false;

    renderCategoryCheckboxes(p.categories || [p.category]);
    
    const decantsList = document.getElementById('admin-decants-list');
    decantsList.innerHTML = '';
    if (Array.isArray(p.decants)) {
        p.decants.forEach(d => addDecantRow(d.size, d.price));
    }
};

window.deleteProduct = async function(id) {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
        await window.axxesStore.deleteProduct(id);
        renderAdminDashboard();
        window.showToast('✓ Producto eliminado.');
    }
};

window.deleteCategory = async function(name) {
    if (confirm(`¿Seguro que deseas eliminar la categoría "${name}"?`)) {
        await window.axxesStore.deleteCategory(name);
        renderAdminDashboard();
        window.showToast(`✓ Categoría "${name}" eliminada.`);
    }
};

window.saveLogo = async function() {
    const fileInput = document.getElementById('admin-logo-file');
    if (!fileInput || fileInput.files.length === 0) {
        alert('Por favor selecciona una imagen primero.');
        return;
    }
    try {
        const compressed = await window.compressProductImage(fileInput.files[0], 600, 300, 0.85);
        await window.axxesStore.updateLogo(compressed);
        window.showToast('✓ Logo actualizado correctamente.');
    } catch(err) {
        alert('Error al procesar el logo: ' + err.message);
    }
};

window.importBackupFile = function() {
    const fileInput = document.getElementById('admin-import-file');
    if (!fileInput || fileInput.files.length === 0) {
        alert('Selecciona un archivo .json primero.');
        return;
    }
    const reader = new FileReader();
    reader.onload = async function(event) {
        const result = await window.axxesStore.importBackup(event.target.result);
        if (result.success) {
            alert(`Backup importado exitosamente: ${result.pCount} productos, ${result.cCount} categorías.`);
            renderAdminDashboard();
        } else {
            alert('Error al importar: ' + result.error);
        }
    };
    reader.readAsText(fileInput.files[0]);
};

window.resetAllData = function() {
    if (confirm('⚠️ Esto restaurará el catálogo original inicial. ¿Estás seguro?')) {
        if (confirm('Esta acción eliminará cambios locales. ¿Continuar?')) {
            localStorage.clear();
            location.reload();
        }
    }
};

// ================== GITHUB LIVE SYNC & TOKEN ==================
window.saveGithubToken = function() {
    const token = document.getElementById('admin-github-token').value.trim();
    if (token) {
        localStorage.setItem('axxes_github_token', token);
        window.showToast('✓ Token de GitHub guardado correctamente.');
        updateSyncBadge();
        testGithubConnection();
    } else {
        window.showToast('Ingresa un token válido.', 'error');
    }
};

window.testGithubConnection = async function() {
    const token = localStorage.getItem('axxes_github_token');
    const statusMsg = document.getElementById('admin-token-status-msg');
    if (!token) {
        if (statusMsg) statusMsg.innerHTML = '<span style="color:var(--admin-danger);">❌ No hay token guardado.</span>';
        return;
    }

    if (statusMsg) statusMsg.innerHTML = '<span style="color:var(--admin-accent);"><i class="fas fa-spinner fa-spin"></i> Probando conexión con Juan-Arenas/axxes...</span>';

    try {
        const authHeader = (token.startsWith('ghp_') || token.startsWith('github_pat_')) ? `Bearer ${token}` : `token ${token}`;
        const res = await fetch(`https://api.github.com/repos/Juan-Arenas/axxes?_t=${Date.now()}`, {
            headers: { 'Authorization': authHeader, 'Accept': 'application/vnd.github.v3+json' }
        });

        if (res.ok) {
            const data = await res.json();
            if (statusMsg) statusMsg.innerHTML = `<span style="color:var(--admin-success);">✓ Conexión exitosa con <strong>${data.full_name}</strong>. Permisos activos.</span>`;
            updateSyncBadge();
        } else {
            if (statusMsg) statusMsg.innerHTML = `<span style="color:var(--admin-danger);">❌ Error de autenticación (${res.status}): Verifica que el token tenga permisos 'repo'.</span>`;
        }
    } catch (e) {
        if (statusMsg) statusMsg.innerHTML = `<span style="color:var(--admin-danger);">Error de conexión: ${e.message}</span>`;
    }
};

window.publishChanges = async function() {
    const token = localStorage.getItem('axxes_github_token');
    if (!token) {
        window.showToast('Falta el Token de GitHub. Ve a la pestaña Configuración para ingresarlo.', 'error');
        document.querySelector('[data-tab="tab-config"]').click();
        return;
    }

    const btn = document.getElementById('admin-publish-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando en vivo...';

    const result = await window.axxesStore.publishToGithub(token);
    
    if (result.success) {
        window.showToast('🚀 ¡Éxito! Catálogo publicado en GitHub. Todos los visitantes verán los cambios.');
        updateSyncBadge();
    } else {
        window.showToast('Error al publicar: ' + result.error, 'error');
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Publicar para Todos';
};

// Toast Notifications
window.showToast = function(msg, type = 'success') {
    const t = document.createElement('div');
    t.style.position = 'fixed';
    t.style.bottom = '24px';
    t.style.right = '24px';
    t.style.backgroundColor = type === 'success' ? '#16a34a' : '#dc2626';
    t.style.color = '#ffffff';
    t.style.padding = '14px 24px';
    t.style.borderRadius = '10px';
    t.style.zIndex = '9999999';
    t.style.fontFamily = "'Poppins', sans-serif";
    t.style.fontSize = '0.88rem';
    t.style.fontWeight = '500';
    t.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    t.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    t.style.transform = 'translateY(20px)';
    t.style.opacity = '0';
    t.innerText = msg;
    document.body.appendChild(t);

    requestAnimationFrame(() => {
        t.style.transform = 'translateY(0)';
        t.style.opacity = '1';
    });

    setTimeout(() => {
        t.style.transform = 'translateY(20px)';
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 350);
    }, 4000);
};

// Auto-fill token field on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const storedToken = localStorage.getItem('axxes_github_token');
        if (storedToken) {
            const input = document.getElementById('admin-github-token');
            if (input) input.value = storedToken;
        }
        updateSyncBadge();
    }, 800);
});
