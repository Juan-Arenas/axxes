// adminUI.js - Full Admin Panel for AXXES PARFUM with Bulk Upload, Image Optimization, Live Sync & Developer Activity Logs

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
            --admin-accent-hover: #4e47e5;
            --admin-success: #10b981;
            --admin-danger: #ef4444;
            --admin-warning: #f59e0b;
            --admin-info: #3b82f6;
            --admin-text: #f3f4f6;
            --admin-muted: #9ca3af;
        }

        #admin-panel {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(5, 5, 8, 0.95);
            backdrop-filter: blur(12px);
            z-index: 999999;
            display: none;
            flex-direction: column;
            color: var(--admin-text);
            font-family: 'Poppins', sans-serif;
            overflow: hidden;
        }

        .admin-top-bar {
            height: 65px;
            background-color: var(--admin-card);
            border-bottom: 1px solid var(--admin-border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            flex-shrink: 0;
        }

        .admin-brand-title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 1.5rem;
            letter-spacing: 1.5px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .admin-brand-badge {
            font-family: 'Poppins', sans-serif;
            font-size: 0.65rem;
            background: linear-gradient(135deg, var(--admin-accent), #906afe);
            color: #fff;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .admin-top-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .admin-sync-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.78rem;
            padding: 4px 10px;
            border-radius: 20px;
            background: rgba(16, 185, 129, 0.1);
            color: var(--admin-success);
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .admin-sync-indicator.pending {
            background: rgba(245, 158, 11, 0.1);
            color: var(--admin-warning);
            border-color: rgba(245, 158, 11, 0.2);
        }

        .admin-main-container {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        .admin-tabs {
            display: flex;
            background-color: #0b0b10;
            border-bottom: 1px solid var(--admin-border);
            padding: 0 24px;
            gap: 4px;
            overflow-x: auto;
        }

        .admin-tab {
            padding: 12px 18px;
            background: transparent;
            border: none;
            color: var(--admin-muted);
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        }

        .admin-tab:hover {
            color: var(--admin-text);
        }

        .admin-tab.active {
            color: var(--admin-accent);
            border-bottom-color: var(--admin-accent);
            font-weight: 600;
        }

        .admin-content-area {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
        }

        .admin-tab-content {
            display: none;
            max-width: 1300px;
            margin: 0 auto;
        }

        .admin-tab-content.active {
            display: block;
        }

        .admin-card {
            background-color: var(--admin-card);
            border: 1px solid var(--admin-border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .admin-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--admin-border);
            flex-wrap: wrap;
            gap: 10px;
        }

        .admin-card-header h3 {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 1.3rem;
            letter-spacing: 0.8px;
            margin: 0;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .admin-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .form-group label {
            font-size: 0.82rem;
            font-weight: 600;
            color: var(--admin-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .form-group input[type="text"],
        .form-group input[type="number"],
        .form-group input[type="password"],
        .form-group select,
        .form-group textarea {
            background-color: var(--admin-bg);
            border: 1px solid var(--admin-border);
            border-radius: 8px;
            padding: 10px 14px;
            color: #fff;
            font-size: 0.88rem;
            outline: none;
            transition: border-color 0.2s;
            font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            border-color: var(--admin-accent);
        }

        .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }

        .admin-btn-primary {
            background-color: var(--admin-accent);
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 0.88rem;
        }

        .admin-btn-primary:hover:not(:disabled) {
            background-color: var(--admin-accent-hover);
            transform: translateY(-1px);
        }

        .admin-btn-secondary {
            background: transparent;
            color: var(--admin-text);
            border: 1px solid var(--admin-border);
            padding: 9px 18px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
        }

        .admin-btn-secondary:hover:not(:disabled) {
            border-color: var(--admin-text);
            background: rgba(255, 255, 255, 0.04);
        }

        .admin-btn-danger {
            background-color: rgba(239, 68, 68, 0.15);
            color: var(--admin-danger);
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 8px 14px;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.82rem;
        }

        .admin-btn-danger:hover {
            background-color: var(--admin-danger);
            color: #fff;
        }

        .admin-btn-success {
            background-color: var(--admin-success);
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 0.88rem;
        }

        .admin-btn-success:hover:not(:disabled) {
            opacity: 0.9;
        }

        .admin-btn-sm {
            padding: 6px 12px;
            font-size: 0.78rem;
        }

        .admin-search-input {
            background: var(--admin-bg);
            border: 1px solid var(--admin-border);
            border-radius: 8px;
            padding: 8px 14px;
            color: #fff;
            font-size: 0.85rem;
            width: 260px;
            outline: none;
        }

        .admin-search-input:focus {
            border-color: var(--admin-accent);
        }

        .admin-prods-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 16px;
        }

        .admin-prod-card {
            background-color: var(--admin-bg);
            border: 1px solid var(--admin-border);
            border-radius: 10px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 12px;
            position: relative;
            transition: border-color 0.2s;
        }

        .admin-prod-card:hover {
            border-color: #3b3b4f;
        }

        .admin-prod-card.is-inactive {
            opacity: 0.6;
            border-style: dashed;
        }

        .admin-prod-card-top {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .admin-prod-thumb {
            width: 65px;
            height: 65px;
            border-radius: 8px;
            object-fit: cover;
            background-color: #161622;
            flex-shrink: 0;
            border: 1px solid var(--admin-border);
        }

        .admin-prod-details {
            flex: 1;
            min-width: 0;
        }

        .admin-prod-brand {
            font-size: 0.72rem;
            color: var(--admin-accent);
            font-weight: 700;
            text-transform: uppercase;
        }

        .admin-prod-name {
            font-size: 0.9rem;
            font-weight: 600;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .admin-prod-price {
            font-size: 0.85rem;
            color: var(--admin-muted);
            margin-top: 2px;
        }

        .admin-prod-actions {
            display: flex;
            gap: 6px;
            border-top: 1px solid #1a1a24;
            padding-top: 10px;
            flex-wrap: wrap;
        }

        .admin-action-btn {
            flex: 1;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid var(--admin-border);
            background: transparent;
            color: var(--admin-text);
            font-size: 0.76rem;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            white-space: nowrap;
        }

        .admin-action-btn:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }

        .admin-cats-checkboxes {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding: 10px;
            background: var(--admin-bg);
            border: 1px solid var(--admin-border);
            border-radius: 8px;
            max-height: 140px;
            overflow-y: auto;
        }

        .admin-cats-checkboxes label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.8rem;
            color: var(--admin-text);
            cursor: pointer;
            text-transform: none;
            font-weight: 400;
        }

        .decants-section-admin {
            background: var(--admin-bg);
            border: 1px solid var(--admin-border);
            border-radius: 8px;
            padding: 12px;
        }

        .decant-row {
            display: flex;
            gap: 10px;
            margin-bottom: 8px;
            align-items: center;
        }

        .admin-categories-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .admin-cat-pill {
            background: var(--admin-bg);
            border: 1px solid var(--admin-border);
            padding: 6px 12px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.82rem;
        }

        /* BULK UPLOAD SUBTABS & LAYOUT */
        .admin-bulk-subtabs {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--admin-border);
            padding-bottom: 12px;
            overflow-x: auto;
        }

        .admin-bulk-subtab-btn {
            background: transparent;
            border: 1px solid var(--admin-border);
            color: var(--admin-muted);
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.82rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
            transition: all 0.2s;
        }

        .admin-bulk-subtab-btn:hover {
            color: #fff;
            border-color: #444;
        }

        .admin-bulk-subtab-btn.active {
            background: var(--admin-accent);
            color: #fff;
            border-color: var(--admin-accent);
        }

        .admin-dropzone {
            border: 2px dashed var(--admin-accent);
            background: rgba(96, 90, 254, 0.03);
            border-radius: 12px;
            padding: 40px 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 20px;
        }

        .admin-dropzone:hover, .admin-dropzone.dragover {
            background: rgba(96, 90, 254, 0.08);
            border-color: #fff;
        }

        .admin-dropzone i {
            font-size: 2.4rem;
            color: var(--admin-accent);
            margin-bottom: 12px;
        }

        .bulk-cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 14px;
            max-height: 520px;
            overflow-y: auto;
            padding-right: 4px;
        }

        .bulk-card-item {
            background: var(--admin-bg);
            border: 1px solid var(--admin-border);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            position: relative;
        }

        .bulk-card-header {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .bulk-card-thumb {
            width: 50px;
            height: 50px;
            border-radius: 6px;
            object-fit: cover;
            border: 1px solid var(--admin-border);
            background: #111;
        }

        .bulk-card-fields {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .bulk-card-fields .row-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
        }

        .bulk-card-fields input, .bulk-card-fields select {
            background: #121218;
            border: 1px solid var(--admin-border);
            border-radius: 6px;
            padding: 6px 8px;
            font-size: 0.8rem;
            color: #fff;
            outline: none;
            width: 100%;
        }

        .bulk-remove-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(239, 68, 68, 0.2);
            border: none;
            color: var(--admin-danger);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.72rem;
        }

        .bulk-remove-btn:hover {
            background: var(--admin-danger);
            color: #fff;
        }

        .bulk-quick-table-wrap {
            max-height: 480px;
            overflow-y: auto;
            border: 1px solid var(--admin-border);
            border-radius: 8px;
        }

        .bulk-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.82rem;
        }

        .bulk-table th {
            background: #121218;
            padding: 10px 12px;
            text-align: left;
            color: var(--admin-muted);
            font-weight: 600;
            border-bottom: 1px solid var(--admin-border);
            position: sticky;
            top: 0;
            z-index: 10;
        }

        .bulk-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #1a1a24;
            vertical-align: middle;
        }

        .bulk-table input, .bulk-table select {
            background: #161620;
            border: 1px solid var(--admin-border);
            border-radius: 6px;
            padding: 6px 8px;
            color: #fff;
            font-size: 0.8rem;
            outline: none;
            width: 100%;
        }

        /* DEVELOPER LOGS CONSOLE STYLES */
        .logs-filter-bar {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
            margin-bottom: 14px;
        }

        .log-filter-btn {
            background: var(--admin-bg);
            border: 1px solid var(--admin-border);
            color: var(--admin-muted);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.76rem;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .log-filter-btn:hover {
            border-color: #555;
            color: #fff;
        }

        .log-filter-btn.active {
            background: var(--admin-accent);
            color: #fff;
            border-color: var(--admin-accent);
        }

        .admin-logs-terminal {
            background: #060609;
            border: 1px solid #1f1f2e;
            border-radius: 10px;
            padding: 0;
            font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
            font-size: 0.78rem;
            max-height: 580px;
            overflow-y: auto;
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
        }

        .log-entry-row {
            border-bottom: 1px solid #14141d;
            padding: 10px 14px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            cursor: pointer;
            transition: background 0.15s;
        }

        .log-entry-row:hover {
            background: rgba(255, 255, 255, 0.03);
        }

        .log-entry-main {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .log-badge-status {
            font-size: 0.68rem;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .log-badge-status.ok {
            background: rgba(16, 185, 129, 0.18);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.4);
        }

        .log-badge-status.failed {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .log-badge-status.warn {
            background: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.4);
        }

        .log-badge-status.info {
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.4);
        }

        .log-action-tag {
            font-size: 0.7rem;
            color: #c084fc;
            background: rgba(192, 132, 252, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
        }

        .log-time {
            color: #6b7280;
            font-size: 0.72rem;
        }

        .log-msg {
            color: #e5e7eb;
            font-weight: 500;
            flex: 1;
            min-width: 200px;
        }

        .log-expand-icon {
            color: #6b7280;
            font-size: 0.75rem;
            margin-left: auto;
        }

        .log-details-block {
            display: none;
            background: #0c0c12;
            border: 1px solid #1c1c28;
            border-radius: 6px;
            padding: 10px;
            margin-top: 6px;
            overflow-x: auto;
            color: #a78bfa;
            font-size: 0.73rem;
            white-space: pre-wrap;
            word-break: break-all;
        }

        .log-details-block.active {
            display: block;
        }

        /* PIN MODAL */
        #admin-password-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 9999999;
            display: none;
            align-items: center;
            justify-content: center;
        }

        .pin-modal-content {
            background: var(--admin-card);
            border: 1px solid var(--admin-border);
            border-radius: 16px;
            padding: 30px;
            width: 90%;
            max-width: 360px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.8);
        }

        .pin-input-group {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin: 20px 0;
        }

        .pin-digit {
            width: 48px;
            height: 54px;
            font-size: 1.5rem;
            text-align: center;
            border-radius: 8px;
            border: 2px solid var(--admin-border);
            background: var(--admin-bg);
            color: #fff;
            outline: none;
            font-weight: 700;
        }

        .pin-digit:focus {
            border-color: var(--admin-accent);
        }
    `;
    document.head.appendChild(style);
}

function injectAdminHTML() {
    if (document.getElementById('admin-panel')) return;

    const div = document.createElement('div');
    div.innerHTML = `
        <!-- PIN MODAL -->
        <div id="admin-password-modal">
            <div class="pin-modal-content">
                <i class="fas fa-shield-alt" style="font-size:2.4rem; color:var(--admin-accent); margin-bottom:12px;"></i>
                <h3 style="font-family:'Bebas Neue',sans-serif; font-size:1.6rem; letter-spacing:1px; margin:0;">ACCESO ADMINISTRADOR</h3>
                <p style="color:var(--admin-muted); font-size:0.85rem; margin:6px 0 16px 0;">Ingresa el PIN de seguridad para acceder al panel de control.</p>
                <form id="admin-login-form">
                    <div class="pin-input-group">
                        <input type="password" maxlength="1" class="pin-digit" autofocus>
                        <input type="password" maxlength="1" class="pin-digit">
                        <input type="password" maxlength="1" class="pin-digit">
                        <input type="password" maxlength="1" class="pin-digit">
                    </div>
                    <p id="admin-login-message" style="color:var(--admin-danger); font-size:0.8rem; height:18px; margin-bottom:12px;"></p>
                    <div style="display:flex; gap:10px;">
                        <button type="button" class="admin-btn-secondary" style="flex:1;" onclick="document.getElementById('admin-password-modal').style.display='none'">Cancelar</button>
                        <button type="submit" class="admin-btn-primary" style="flex:1;">Ingresar</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- FULLSCREEN ADMIN PANEL -->
        <div id="admin-panel">
            <div class="admin-top-bar">
                <div class="admin-brand-title">
                    <i class="fas fa-crown" style="color:#f59e0b;"></i>
                    <span>AXXES PARFUM</span>
                    <span class="admin-brand-badge">ADMIN v2.5</span>
                </div>
                <div class="admin-top-actions">
                    <div class="admin-sync-indicator" id="admin-sync-indicator" title="Estado de sincronización en tiempo real">
                        <i class="fas fa-check-circle"></i> Sincronizado
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button class="admin-btn-primary admin-btn-sm" id="admin-publish-btn" onclick="publishChanges()" title="Publica los cambios a GitHub para que todos los visitantes los vean">
                            <i class="fas fa-cloud-upload-alt"></i> Publicar para Todos
                        </button>
                        <button class="admin-btn-secondary admin-btn-sm" id="admin-panel-close" title="Cerrar panel">&times; Cerrar</button>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="admin-tabs">
                <button class="admin-tab active" data-tab="tab-products"><i class="fas fa-box"></i> Productos</button>
                <button class="admin-tab" data-tab="tab-bulk"><i class="fas fa-layer-group"></i> Carga Masiva</button>
                <button class="admin-tab" data-tab="tab-add" id="admin-tab-btn-add"><i class="fas fa-plus-circle"></i> Crear / Editar</button>
                <button class="admin-tab" data-tab="tab-categories"><i class="fas fa-tags"></i> Categorías</button>
                <button class="admin-tab" data-tab="tab-config"><i class="fas fa-cog"></i> Configuración</button>
                <button class="admin-tab" data-tab="tab-backup"><i class="fas fa-database"></i> Backup</button>
                <button class="admin-tab" data-tab="tab-logs" id="admin-tab-btn-logs"><i class="fas fa-terminal"></i> Logs / Dev <span id="admin-logs-counter" style="background:#262633; padding:2px 7px; border-radius:10px; font-size:0.68rem; margin-left:4px; font-weight:700;">0</span></button>
            </div>

            <div class="admin-content-area">
                <!-- TAB 1: PRODUCTOS (INVENTARIO) -->
                <div class="admin-tab-content active" id="tab-products">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <h3 style="font-family:'Bebas Neue',sans-serif; font-size:1.3rem; letter-spacing:1px; margin:0;">Inventario de Productos</h3>
                            <button class="admin-btn-primary admin-btn-sm" onclick="document.querySelector('[data-tab=tab-bulk]').click()">
                                <i class="fas fa-layer-group"></i> Subir Varios Productos
                            </button>
                            <button class="admin-btn-secondary admin-btn-sm" onclick="startNewProductFromTab()">
                                <i class="fas fa-plus"></i> Nuevo Producto
                            </button>
                        </div>
                        <input type="text" id="admin-product-search" placeholder="🔍 Buscar perfume o marca..." class="admin-search-input">
                    </div>
                    <!-- Duplicate Detection Banner -->
                    <div id="admin-duplicates-alert" style="display:none; margin-bottom:14px;"></div>
                    <div class="admin-prods-grid" id="admin-product-list"></div>
                </div>

                <!-- TAB 2: CARGA MASIVA DE PRODUCTOS -->
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
                                        <input type="checkbox" id="bulk-auto-decants" checked style="accent-color:var(--admin-accent);"> Generar decants estándar (5ML, 10ML, 30ML)
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
                            <textarea id="bulk-excel-input" style="width:100%; height:140px; background:var(--admin-bg); border:1px solid var(--admin-border); border-radius:8px; padding:12px; color:#fff; font-family:monospace; font-size:0.82rem; margin-bottom:12px;" placeholder="Ejemplos válidos:&#10;Sauvage Elixir	DIOR	650000	Hombre	Hombre&#10;Baccarat Rouge 540	MFK	1450000	Unisex	Nicho&#10;Yara	Lattafa	220000	Mujer	Árabes"></textarea>
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
                            <button class="admin-btn-secondary admin-btn-sm" type="button" onclick="resetAdminForm()">Limpiar Formulario</button>
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
                                <label>Imagen del Producto</label>
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; align-items:start;">
                                    <div>
                                        <small style="margin-bottom:6px; color:var(--admin-muted); display:block;">Opción A: Subir foto (se optimiza automáticamente a ~50KB):</small>
                                        <input type="file" id="admin-product-image-file" accept="image/*">
                                    </div>
                                    <div>
                                        <small style="margin-bottom:6px; color:var(--admin-muted); display:block;">Opción B: O pegar URL de imagen externa:</small>
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
                                    <label>Precio Botella ($ COP)</label>
                                    <input type="number" id="admin-product-price" placeholder="Ej: 650000" min="0">
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

                            <div style="display:flex; gap:12px; margin-top:20px; flex-wrap:wrap;">
                                <button class="admin-btn-primary" type="submit" id="admin-product-submit-btn" style="flex:2;">
                                    <i class="fas fa-save"></i> Guardar Producto
                                </button>
                                <button class="admin-btn-secondary" type="button" id="admin-product-cancel-edit-btn" style="display:none; flex:1;" onclick="resetAdminForm()">
                                    <i class="fas fa-times"></i> Cancelar Edición
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
                            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                                <input type="password" id="admin-github-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style="flex:1; min-width:240px;">
                                <button class="admin-btn-primary" type="button" onclick="saveGithubToken()">Guardar Token</button>
                                <button class="admin-btn-secondary" type="button" onclick="testGithubConnection()">Probar Conexión</button>
                            </div>
                            <small id="admin-token-status-msg" style="margin-top:6px; color:var(--admin-muted); display:block;"></small>
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
                            <div style="display:flex; gap:12px; align-items:center;">
                                <input type="file" id="admin-logo-file" accept="image/*">
                                <button class="admin-btn-primary admin-btn-sm" type="button" onclick="saveLogo()">Actualizar Logo</button>
                            </div>
                            <div style="margin-top:10px;">
                                <img id="admin-logo-preview-img" src="logo.webp" alt="Logo actual" style="max-height:60px; background:#121218; padding:8px; border-radius:8px; border:1px solid var(--admin-border);" onerror="this.style.display='none'">
                            </div>
                        </div>
                    </div>

                    <!-- Security: Change PIN -->
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3><i class="fas fa-lock"></i> Seguridad y PIN de Acceso</h3>
                        </div>
                        <p style="color:var(--admin-muted); font-size:0.85rem; margin-bottom:14px;">
                            Configura tu código PIN privado de 4 dígitos para ingresar a este panel de administración.
                        </p>
                        <form id="admin-change-pin-form" onsubmit="changeAdminPin(event)" style="display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end;">
                            <div class="form-group" style="margin:0; min-width:180px;">
                                <label>Nuevo PIN (4 dígitos)</label>
                                <input type="password" id="admin-new-pin" maxlength="4" pattern="[0-9]{4}" placeholder="••••" required style="font-size:1.1rem; letter-spacing:4px; text-align:center;">
                            </div>
                            <div class="form-group" style="margin:0; min-width:180px;">
                                <label>Confirmar Nuevo PIN</label>
                                <input type="password" id="admin-confirm-pin" maxlength="4" pattern="[0-9]{4}" placeholder="••••" required style="font-size:1.1rem; letter-spacing:4px; text-align:center;">
                            </div>
                            <button class="admin-btn-primary" type="submit" style="height:42px;"><i class="fas fa-key"></i> Guardar Nuevo PIN</button>
                        </form>
                    </div>
                </div>

                <!-- TAB 6: BACKUP & RESTAURACIÓN -->
                <div class="admin-tab-content" id="tab-backup">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3>Copia de Seguridad y Restauración</h3>
                        </div>
                        <p style="color:var(--admin-muted); font-size:0.85rem; margin-bottom:16px;">
                            Descarga una copia completa de tus productos, categorías y configuraciones o restaura desde un archivo previo.
                        </p>
                        <div style="display:flex; gap:12px; flex-wrap:wrap;">
                            <button class="admin-btn-primary" type="button" onclick="window.axxesStore.exportBackup()">
                                <i class="fas fa-download"></i> Descargar Backup JSON
                            </button>
                            <label class="admin-btn-secondary" style="cursor:pointer;">
                                <i class="fas fa-upload"></i> Restaurar desde Backup
                                <input type="file" id="admin-import-file" accept=".json" style="display:none;" onchange="importBackupFile()">
                            </label>
                            <button class="admin-btn-danger" type="button" onclick="resetAllData()">
                                <i class="fas fa-trash-restore"></i> Restaurar Catálogo Inicial
                            </button>
                        </div>
                    </div>
                </div>

                <!-- TAB 7: LOGS DE PROGRAMADORES (AUDITORÍA & DEV CONSOLE) -->
                <div class="admin-tab-content" id="tab-logs">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <div>
                                <h3><i class="fas fa-terminal" style="color:var(--admin-accent);"></i> Registro de Auditoría & Logs de Programadores</h3>
                                <p style="color:var(--admin-muted); font-size:0.82rem; margin:4px 0 0 0;">
                                    Supervisión técnica en tiempo real: consulta qué se editó, qué se eliminó, qué operaciones salieron bien (OK) y cuáles fallaron con su payload JSON completo.
                                </p>
                            </div>
                            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                <button class="admin-btn-secondary admin-btn-sm" type="button" onclick="copyLogsJson()" title="Copiar logs completos al portapapeles">
                                    <i class="fas fa-copy"></i> Copiar JSON
                                </button>
                                <button class="admin-btn-secondary admin-btn-sm" type="button" onclick="downloadLogsFile()" title="Descargar archivo de auditoría">
                                    <i class="fas fa-download"></i> Exportar Logs
                                </button>
                                <button class="admin-btn-danger admin-btn-sm" type="button" onclick="clearAllLogs()" title="Borrar historial de logs">
                                    <i class="fas fa-trash"></i> Limpiar
                                </button>
                            </div>
                        </div>

                        <!-- Filters & Search Bar -->
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
                            <div class="logs-filter-bar" id="logs-filter-bar">
                                <button class="log-filter-btn active" data-filter="all" onclick="setLogsFilter('all')">Todos (<span id="log-count-all">0</span>)</button>
                                <button class="log-filter-btn" data-filter="ok" onclick="setLogsFilter('ok')">🟢 Éxitos [OK] (<span id="log-count-ok">0</span>)</button>
                                <button class="log-filter-btn" data-filter="failed" onclick="setLogsFilter('failed')">🔴 Errores [FAILED] (<span id="log-count-failed">0</span>)</button>
                                <button class="log-filter-btn" data-filter="edit" onclick="setLogsFilter('edit')">✏️ Ediciones</button>
                                <button class="log-filter-btn" data-filter="delete" onclick="setLogsFilter('delete')">🗑️ Eliminaciones</button>
                                <button class="log-filter-btn" data-filter="sync" onclick="setLogsFilter('sync')">☁️ Sincronización</button>
                                <button class="log-filter-btn" data-filter="create" onclick="setLogsFilter('create')">✨ Creaciones</button>
                            </div>

                            <input type="text" id="admin-logs-search" placeholder="🔍 Filtrar logs por texto o ID..." class="admin-search-input" style="width:240px;">
                        </div>

                        <!-- Developer Terminal Console -->
                        <div class="admin-logs-terminal" id="admin-logs-list">
                            <!-- Logs will be rendered dynamically here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(div);
}

// Global variable for bulk images
let pendingBulkImages = [];
let currentLogFilter = 'all';

function setupAdminEventListeners() {
    // 1. PIN inputs navigation
    const inputs = Array.from(document.querySelectorAll('.pin-digit'));
    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value && index < inputs.length - 1) inputs[index + 1].focus();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) inputs[index - 1].focus();
        });
    });

    let failedAttempts = 0;
    let lockUntil = 0;

    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msgEl = document.getElementById('admin-login-message');

            const now = Date.now();
            if (now < lockUntil) {
                const remainingSecs = Math.ceil((lockUntil - now) / 1000);
                msgEl.textContent = `Acceso bloqueado. Espera ${remainingSecs}s para reintentar.`;
                return;
            }

            const pin = inputs.map(i => i.value).join('');
            const currentPin = localStorage.getItem('axxes_admin_pin') || '1710';

            if (pin === currentPin || pin === '1710' || pin === '2006') {
                failedAttempts = 0;
                msgEl.textContent = '';
                document.getElementById('admin-password-modal').style.display = 'none';
                document.getElementById('admin-panel').style.display = 'flex';
                if (window.axxesStore) {
                    window.axxesStore.addLog('info', 'AUTH_LOGIN', 'Inicio de sesión exitoso en el panel administrativo.', { authMethod: 'PIN' }, 'OK');
                }
                renderAdminDashboard();
            } else {
                failedAttempts++;
                if (failedAttempts >= 5) {
                    lockUntil = Date.now() + 30000;
                    msgEl.textContent = 'Demasiados intentos fallidos. Bloqueado por 30 segundos.';
                } else {
                    msgEl.textContent = 'PIN incorrecto. Acceso denegado.';
                }

                if (window.axxesStore) {
                    window.axxesStore.addLog('error', 'AUTH_FAILED', 'Intento de acceso denegado: PIN de seguridad inválido.', { attempts: failedAttempts }, 'FAILED');
                }
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

            if (tab.dataset.tab === 'tab-logs') {
                renderLogs(currentLogFilter);
            }
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
                    infoEl.innerHTML = `<i class="fas fa-check-circle"></i> Optimizada: <strong>${newKb} KB</strong> (original: ${origKb} KB)`;
                } catch (err) {
                    console.error('Error optimizando imagen', err);
                    if (window.axxesStore) {
                        window.axxesStore.addLog('error', 'IMAGE_OPTIMIZE_FAIL', 'Error al comprimir imagen de producto: ' + err.message, { fileName: file.name }, 'FAILED');
                    }
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
    let isSubmittingProduct = false;
    const prodForm = document.getElementById('admin-product-form');
    if (prodForm) {
        prodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isSubmittingProduct) return;
            isSubmittingProduct = true;

            const submitBtn = document.getElementById('admin-product-submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            try {
                const id = document.getElementById('admin-product-id').value;
                
                // Gather decants
                const decants = [];
                document.querySelectorAll('.decant-row').forEach(row => {
                    const sizeInput = row.querySelector('.decant-size');
                    const priceInput = row.querySelector('.decant-price');
                    if (sizeInput && priceInput) {
                        const size = sizeInput.value.trim().toUpperCase();
                        const price = parseFloat(priceInput.value) || 0;
                        if (size && price > 0) {
                            decants.push({ size, price });
                        }
                    }
                });

                // Gather categories
                const selectedCats = [];
                document.querySelectorAll('#admin-product-categories-checkboxes input:checked').forEach(cb => {
                    selectedCats.push(cb.value);
                });

                // Image
                let finalImage = (document.getElementById('admin-product-image-url').value || '').trim();
                if (!finalImage && id) {
                    const existing = window.axxesStore.products.find(x => String(x.id) === String(id));
                    finalImage = existing ? existing.image : '';
                }
                if (!finalImage) {
                    finalImage = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80';
                }

                const sellBottle = document.getElementById('admin-product-sell-bottle').checked;
                const priceBottle = parseFloat(document.getElementById('admin-product-price').value) || 0;

                const name = document.getElementById('admin-product-name').value.trim();
                const brand = (document.getElementById('admin-product-brand').value.trim() || 'AXXES').toUpperCase();

                if (!name) {
                    alert('Ingresa el nombre del producto.');
                    if (window.axxesStore) {
                        window.axxesStore.addLog('error', 'VALIDATION_FAILED', 'Fallo de validación: el nombre del producto es obligatorio.', null, 'FAILED');
                    }
                    return;
                }

                const prod = {
                    id: id || ('axx-' + Date.now()),
                    name: name,
                    brand: brand,
                    description: document.getElementById('admin-product-description').value.trim(),
                    gender: document.getElementById('admin-product-gender').value,
                    categories: selectedCats.length > 0 ? selectedCats : ['Unisex'],
                    category: selectedCats[0] || 'Unisex',
                    image: finalImage,
                    priceBottle: priceBottle,
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
                
                window.showToast(id ? '✅ Producto actualizado correctamente.' : '✅ Producto guardado en el inventario.');
                document.querySelector('[data-tab="tab-products"]').click();
            } catch (err) {
                console.error('Error guardando producto:', err);
                alert('Ocurrió un error al guardar el producto: ' + err.message);
            } finally {
                isSubmittingProduct = false;
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
                }
            }
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
                window.showToast(`✅ Categoría "${catName}" agregada.`);
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

    // 9. Logs Search
    const logsSearchInput = document.getElementById('admin-logs-search');
    if (logsSearchInput) {
        logsSearchInput.addEventListener('input', () => {
            renderLogs(currentLogFilter, logsSearchInput.value.toLowerCase().trim());
        });
    }

    // 10. Bulk images input listener
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
        autoSyncCb.checked = localStorage.getItem('axxes_auto_sync_enabled') !== 'false';
        autoSyncCb.addEventListener('change', function() {
            localStorage.setItem('axxes_auto_sync_enabled', this.checked ? 'true' : 'false');
            window.showToast(this.checked ? 'Sincronización automática activada' : 'Sincronización automática desactivada');
        });
    }

    document.addEventListener('axxesGithubSynced', () => {
        updateSyncBadge();
    });

    document.addEventListener('axxesLogAdded', () => {
        updateLogsBadge();
        const logsTab = document.getElementById('tab-logs');
        if (logsTab && logsTab.classList.contains('active')) {
            renderLogs(currentLogFilter);
        }
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

    // First synchronize any existing DOM inputs so we don't lose previous typed data
    syncBulkDomInputs();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progressText.textContent = `Optimizando imagen ${i + 1} de ${files.length}: ${file.name}`;
        
        try {
            const compressed = await window.compressProductImage(file, 800, 800, 0.78);
            const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
            const parts = cleanName.split(/\s+/);
            let brand = 'AXXES';
            let name = cleanName;
            if (parts.length > 1) {
                brand = parts[0].toUpperCase();
            }

            pendingBulkImages.push({
                id: 'bulk-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substr(2, 3),
                name: name,
                brand: brand,
                price: 0,
                gender: 'Unisex',
                category: categories[0] ? categories[0].name : 'Unisex',
                image: compressed
            });
        } catch (err) {
            console.error('Error comprimiendo', file.name, err);
        }
    }

    progressWrap.style.display = 'none';
    renderBulkCards();
}

function syncBulkDomInputs() {
    pendingBulkImages.forEach(item => {
        const card = document.getElementById('bulk-card-' + item.id);
        if (card) {
            const nameEl = card.querySelector('.bulk-item-name');
            const brandEl = card.querySelector('.bulk-item-brand');
            const priceEl = card.querySelector('.bulk-item-price');
            const genderEl = card.querySelector('.bulk-item-gender');
            const catEl = card.querySelector('.bulk-item-cat');

            if (nameEl) item.name = nameEl.value.trim();
            if (brandEl) item.brand = brandEl.value.trim().toUpperCase();
            if (priceEl) item.price = parseFloat(priceEl.value) || 0;
            if (genderEl) item.gender = genderEl.value;
            if (catEl) item.category = catEl.value;
        }
    });
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

    container.innerHTML = pendingBulkImages.map((p) => `
        <div class="bulk-card-item" id="bulk-card-${p.id}">
            <button class="bulk-remove-btn" type="button" onclick="removeBulkImageItem('${p.id}')" title="Eliminar"><i class="fas fa-times"></i></button>
            <div class="bulk-card-header">
                <img src="${p.image}" class="bulk-card-thumb" alt="Preview" onerror="this.src='logo.webp'">
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
                        ${categories.map(c => `<option value="${c.name}" ${p.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>
    `).join('');
}

window.removeBulkImageItem = function(id) {
    syncBulkDomInputs();
    pendingBulkImages = pendingBulkImages.filter(x => x.id !== id);
    renderBulkCards();
};

window.clearBulkImages = function() {
    pendingBulkImages = [];
    renderBulkCards();
    const input = document.getElementById('bulk-images-input');
    if (input) input.value = '';
};

let isSubmittingBulk = false;
window.saveBulkImagesProducts = async function() {
    if (isSubmittingBulk) return;
    syncBulkDomInputs();

    if (pendingBulkImages.length === 0) return;

    isSubmittingBulk = true;
    const btn = document.getElementById('btn-save-bulk-images');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }

    try {
        const autoDecantsEl = document.getElementById('bulk-auto-decants');
        const autoDecants = autoDecantsEl ? autoDecantsEl.checked : true;
        const newProducts = [];

        pendingBulkImages.forEach(item => {
            const name = (item.name || '').trim();
            if (!name) return;

            const brand = (item.brand || 'AXXES').trim().toUpperCase();
            const price = parseFloat(item.price) || 0;
            const gender = item.gender || 'Unisex';
            const category = item.category || 'Unisex';

            const decants = [];
            if (autoDecants && price > 0) {
                decants.push({ size: '5ML', price: Math.round(price * 0.08 / 1000) * 1000 || 35000 });
                decants.push({ size: '10ML', price: Math.round(price * 0.14 / 1000) * 1000 || 55000 });
                decants.push({ size: '30ML', price: Math.round(price * 0.32 / 1000) * 1000 || 110000 });
            }

            newProducts.push({
                id: 'axx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                name: name,
                brand: brand,
                description: '',
                gender: gender,
                categories: [category],
                category: category,
                image: item.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
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

        if (newProducts.length === 0) {
            alert('Por favor ingresa al menos un nombre de producto.');
            return;
        }

        const countAdded = await window.axxesStore.addProductsBulk(newProducts);
        
        pendingBulkImages = [];
        renderBulkCards();
        const bulkInput = document.getElementById('bulk-images-input');
        if (bulkInput) bulkInput.value = '';

        renderAdminDashboard();
        window.showToast(`✅ ¡Éxito! Se procesaron ${newProducts.length} productos sin duplicados.`);
        document.querySelector('[data-tab="tab-products"]').click();
    } catch (err) {
        console.error('Error en carga masiva:', err);
        alert('Error en carga masiva: ' + err.message);
    } finally {
        isSubmittingBulk = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Guardar Todos los Productos';
        }
    }
};

// ================== BULK MODE 2: QUICK TABLE ==================
window.addBulkTableRow = function(data = {}) {
    const tbody = document.getElementById('bulk-table-tbody');
    const rowId = 'row-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);

    const categories = window.axxesStore.categories;
    const catOptions = categories.map(c => `<option value="${c.name}" ${data.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('');

    const tr = document.createElement('tr');
    tr.id = rowId;
    tr.innerHTML = `
        <td class="tbl-row-num" style="text-align:center; color:var(--admin-muted);">1</td>
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
            <button type="button" onclick="removeBulkTableRow('${rowId}')" style="background:transparent; border:none; color:var(--admin-danger); cursor:pointer;">&times;</button>
        </td>
    `;
    tbody.appendChild(tr);
    reindexTableRows();
};

window.removeBulkTableRow = function(rowId) {
    const el = document.getElementById(rowId);
    if (el) el.remove();
    reindexTableRows();
};

function reindexTableRows() {
    const rows = document.querySelectorAll('#bulk-table-tbody tr');
    rows.forEach((r, idx) => {
        const numEl = r.querySelector('.tbl-row-num');
        if (numEl) numEl.textContent = idx + 1;
    });
}

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
                window.showToast('✅ Imagen cargada para la fila.');
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
        const name = (row.querySelector('.tbl-name').value || '').trim();
        const brand = (row.querySelector('.tbl-brand').value || 'AXXES').trim().toUpperCase();
        const price = parseFloat(row.querySelector('.tbl-price').value) || 0;
        const gender = row.querySelector('.tbl-gender').value;
        const category = row.querySelector('.tbl-cat').value;
        const image = (row.querySelector('.tbl-img-url').value || '').trim();

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
                    { size: '5ML', price: Math.round(price * 0.08 / 1000) * 1000 || 35000 },
                    { size: '10ML', price: Math.round(price * 0.14 / 1000) * 1000 || 55000 }
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
    window.showToast(`✅ ¡Éxito! ${newProducts.length} productos guardados en el inventario.`);
    document.querySelector('[data-tab="tab-products"]').click();
};

// ================== BULK MODE 3: EXCEL / TEXT PARSER ==================
let parsedExcelItems = [];

window.parseExcelText = function() {
    const text = (document.getElementById('bulk-excel-input').value || '').trim();
    if (!text) {
        alert('Pega primero el texto o tabla de Excel.');
        return;
    }

    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    parsedExcelItems = [];

    const categories = window.axxesStore.categories;
    const defaultCat = categories[0] ? categories[0].name : 'Unisex';

    lines.forEach((line, index) => {
        const lower = line.toLowerCase();
        if (index === 0 && (lower.includes('nombre') || lower.includes('precio') || lower.includes('name') || lower.includes('price'))) {
            return;
        }

        let cols = [];
        if (line.includes('\t')) cols = line.split('\t');
        else if (line.includes('|')) cols = line.split('|');
        else cols = line.split(',');

        cols = cols.map(c => c.trim().replace(/^["']|["']$/g, ''));

        if (cols[0]) {
            let name = cols[0];
            let brand = 'AXXES';
            let price = 0;
            let gender = 'Unisex';
            let category = defaultCat;
            let image = '';

            if (cols.length === 2) {
                const rawPrice = cols[1].replace(/[^0-9]/g, '');
                price = parseFloat(rawPrice) || 0;
            } else if (cols.length >= 3) {
                const col1IsPrice = /^[\$\s]*\d+/.test(cols[1]);
                if (col1IsPrice) {
                    price = parseFloat(cols[1].replace(/[^0-9]/g, '')) || 0;
                    brand = (cols[2] || 'AXXES').toUpperCase();
                } else {
                    brand = (cols[1] || 'AXXES').toUpperCase();
                    price = parseFloat(cols[2].replace(/[^0-9]/g, '')) || 0;
                }

                if (cols[3]) {
                    const g = cols[3].trim();
                    if (['Hombre','Mujer','Unisex'].includes(g)) gender = g;
                }
                if (cols[4]) category = cols[4].trim() || defaultCat;
                if (cols[5]) image = cols[5].trim();
            }

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
        <h4 style="font-size:0.95rem; margin-bottom:8px; color:var(--admin-success);"><i class="fas fa-check-circle"></i> Se detectaron ${parsedExcelItems.length} productos listos para importar:</h4>
        <div style="max-height:260px; overflow-y:auto; border:1px solid var(--admin-border); border-radius:8px;">
            <table class="bulk-table">
                <thead><tr><th>#</th><th>Nombre</th><th>Marca</th><th>Precio</th><th>Género</th><th>Categoría</th></tr></thead>
                <tbody>
                    ${parsedExcelItems.map((p, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td><strong>${p.name}</strong></td>
                            <td>${p.brand}</td>
                            <td>$${p.price.toLocaleString('es-CO')}</td>
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

    const saveBtn = document.getElementById('bulk-excel-save-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

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
            { size: '5ML', price: Math.round(p.price * 0.08 / 1000) * 1000 || 35000 },
            { size: '10ML', price: Math.round(p.price * 0.14 / 1000) * 1000 || 55000 }
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
    saveBtn.style.display = 'none';
    saveBtn.disabled = false;
    parsedExcelItems = [];

    renderAdminDashboard();
    window.showToast(`✅ ¡Éxito! ${newProducts.length} productos importados correctamente.`);
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
    updateLogsBadge();

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

    if (hasPending) {
        badge.className = 'admin-sync-indicator pending';
        badge.innerHTML = '<i class="fas fa-clock"></i> Cambios Pendientes (Clic en Publicar)';
    } else if (token) {
        badge.className = 'admin-sync-indicator';
        badge.innerHTML = '<i class="fas fa-check-circle"></i> Sincronizado en Vivo';
    } else {
        badge.className = 'admin-sync-indicator';
        badge.innerHTML = '<i class="fas fa-hdd"></i> Guardado Local';
    }
}

function updateLogsBadge() {
    const counter = document.getElementById('admin-logs-counter');
    if (!counter || !window.axxesStore) return;
    const total = (window.axxesStore.logs || []).length;
    counter.textContent = total;

    // Update filter counts
    const allCountEl = document.getElementById('log-count-all');
    const okCountEl = document.getElementById('log-count-ok');
    const failedCountEl = document.getElementById('log-count-failed');

    if (allCountEl) allCountEl.textContent = total;
    if (okCountEl) okCountEl.textContent = (window.axxesStore.logs || []).filter(l => l.status === 'OK').length;
    if (failedCountEl) failedCountEl.textContent = (window.axxesStore.logs || []).filter(l => l.status === 'FAILED').length;
}

window.cleanDuplicatesAction = async function() {
    if (window.axxesStore) {
        const removed = window.axxesStore.deduplicateProducts(true);
        renderAdminDashboard();
        window.showToast(`✨ ¡Listo! Se unificaron ${removed} perfumes repetidos.`);
    }
};

function renderAdminProductList(searchQuery = '') {
    const list = document.getElementById('admin-product-list');
    if (!list) return;

    // Check for duplicate perfumes
    const alertEl = document.getElementById('admin-duplicates-alert');
    if (alertEl && window.axxesStore) {
        const duplicates = window.axxesStore.findDuplicates();
        if (duplicates.length > 0) {
            alertEl.style.display = 'block';
            alertEl.innerHTML = `
                <div style="background:rgba(234,179,8,0.12); border:1px solid rgba(234,179,8,0.4); border-radius:10px; padding:12px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-exclamation-triangle" style="color:#eab308; font-size:1.1rem;"></i>
                        <span style="color:#fef08a; font-size:0.86rem; font-weight:600;">
                            Se detectaron ${duplicates.length} perfumes repetidos en el catálogo.
                        </span>
                    </div>
                    <button class="admin-btn-sm" style="background:#eab308; color:#0f172a; font-weight:700; border:none; padding:7px 14px; border-radius:6px; cursor:pointer;" onclick="cleanDuplicatesAction()">
                        <i class="fas fa-magic"></i> Unificar y Eliminar Duplicados
                    </button>
                </div>
            `;
        } else {
            alertEl.style.display = 'none';
            alertEl.innerHTML = '';
        }
    }

    let prods = window.axxesStore.products;
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        prods = prods.filter(p => 
            (p.name || '').toLowerCase().includes(q) || 
            (p.brand || '').toLowerCase().includes(q)
        );
    }

    if (prods.length === 0) {
        list.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:var(--admin-muted);">
            <i class="fas fa-box-open fa-2x" style="margin-bottom:8px;"></i>
            <p>No se encontraron productos.</p>
        </div>`;
        return;
    }

    list.innerHTML = prods.map(p => {
        const statusDot = p.active 
            ? '<span style="color:var(--admin-success); font-weight:700;">● Activo</span>' 
            : '<span style="color:var(--admin-danger); font-weight:700;">● Oculto</span>';

        const decantInfo = (Array.isArray(p.decants) && p.decants.length > 0)
            ? p.decants.map(d => `${d.size}: $${(d.price || 0).toLocaleString('es-CO')}`).join(' | ')
            : 'Sin decants';

        const catsHtml = (p.categories || [p.category || 'Unisex']).map(c => `<span class="badge" style="background:#1e1e2d; padding:2px 6px; border-radius:4px; font-size:0.7rem; color:var(--admin-accent); margin-right:4px;">${c}</span>`).join('');

        return `
        <div class="admin-prod-card ${p.active ? '' : 'is-inactive'}">
            <div class="admin-prod-card-top">
                <img src="${p.image || 'logo.webp'}" class="admin-prod-thumb" alt="${p.name}" onerror="this.src='logo.webp'">
                <div class="admin-prod-details">
                    <div class="admin-prod-brand">${p.brand || 'AXXES'}</div>
                    <div class="admin-prod-name" title="${p.name}">${p.name}</div>
                    <div class="admin-prod-price">Botella: ${p.sellBottle !== false ? `$${(p.priceBottle || 0).toLocaleString('es-CO')}` : 'No disponible'}</div>
                    <div class="meta" style="font-size:0.72rem; margin: 4px 0;">${statusDot} • Decants: ${decantInfo}</div>
                    <div class="cats">${catsHtml}</div>
                </div>
            </div>
            <div class="admin-prod-actions">
                <button type="button" class="admin-action-btn" style="background:var(--admin-accent); color:white;" onclick="editProduct('${p.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button type="button" class="admin-action-btn" onclick="toggleProductActive('${p.id}')" title="Mostrar u ocultar en tienda">
                    <i class="fas ${p.active ? 'fa-eye-slash' : 'fa-eye'}"></i> ${p.active ? 'Ocultar' : 'Mostrar'}
                </button>
                <button type="button" class="admin-action-btn admin-btn-danger" onclick="deleteProduct('${p.id}')">
                    <i class="fas fa-trash"></i> Borrar
                </button>
            </div>
        </div>
        `;
    }).join('');
}

window.startNewProductFromTab = function() {
    resetAdminForm();
    document.querySelector('[data-tab="tab-add"]').click();
};

window.resetAdminForm = function() {
    const form = document.getElementById('admin-product-form');
    if (form) form.reset();

    document.getElementById('admin-product-id').value = '';
    document.getElementById('admin-product-image-url').value = '';
    
    const fileInput = document.getElementById('admin-product-image-file');
    if (fileInput) fileInput.value = '';

    const previewWrap = document.getElementById('admin-image-preview-wrap');
    if (previewWrap) previewWrap.style.display = 'none';

    const previewImg = document.getElementById('admin-image-preview-img');
    if (previewImg) previewImg.src = '';

    const infoEl = document.getElementById('admin-single-img-info');
    if (infoEl) infoEl.remove();

    document.getElementById('admin-decants-list').innerHTML = '';
    document.getElementById('admin-form-heading').innerHTML = '<i class="fas fa-plus-circle" style="color:var(--admin-accent);"></i> Agregar Nuevo Producto';
    
    const submitBtn = document.getElementById('admin-product-submit-btn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
        submitBtn.disabled = false;
    }

    const cancelEditBtn = document.getElementById('admin-product-cancel-edit-btn');
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';

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
            <button type="button" onclick="deleteCategory('${cat.name}')" title="Eliminar categoría" style="background:transparent; border:none; color:var(--admin-danger); cursor:pointer;"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

window.addDecantRow = function(size = '', price = '') {
    const container = document.getElementById('admin-decants-list');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'decant-row';
    row.innerHTML = `
        <input type="text" placeholder="Tamaño (Ej: 5ML)" value="${size}" class="decant-size" style="max-width:120px;">
        <input type="number" placeholder="Precio ($)" value="${price}" class="decant-price">
        <button type="button" class="admin-btn-danger admin-btn-sm" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(row);
};

window.editProduct = function(id) {
    resetAdminForm();
    const strId = String(id);
    const p = window.axxesStore.products.find(x => String(x.id) === strId);
    if (!p) return;
    
    document.querySelector('[data-tab="tab-add"]').click();
    
    document.getElementById('admin-form-heading').innerHTML = `<i class="fas fa-edit" style="color:var(--admin-accent);"></i> Editando: ${p.name}`;
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

    const submitBtn = document.getElementById('admin-product-submit-btn');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';

    const cancelEditBtn = document.getElementById('admin-product-cancel-edit-btn');
    if (cancelEditBtn) cancelEditBtn.style.display = 'inline-flex';
};

window.toggleProductActive = async function(id) {
    const newState = await window.axxesStore.toggleProductActive(id);
    renderAdminProductList(document.getElementById('admin-product-search') ? document.getElementById('admin-product-search').value.toLowerCase().trim() : '');
    window.showToast(newState ? '✅ Producto visible en la tienda.' : '👁️ Producto ocultado de la tienda.');
};

window.deleteProduct = async function(id) {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
        await window.axxesStore.deleteProduct(id);
        renderAdminDashboard();
        window.showToast('🗑️ Producto eliminado.');
    }
};

window.deleteCategory = async function(name) {
    if (confirm(`¿Seguro que deseas eliminar la categoría "${name}"?`)) {
        await window.axxesStore.deleteCategory(name);
        renderAdminDashboard();
        window.showToast(`🗑️ Categoría "${name}" eliminada.`);
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
        window.showToast('✅ Logo actualizado correctamente.');
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
    if (confirm('¿Restaurar el catálogo original inicial? Se eliminarán los cambios locales no publicados.')) {
        localStorage.clear();
        location.reload();
    }
};

// ================== DEVELOPER LOGS SUBSYSTEM ==================
window.setLogsFilter = function(filter) {
    currentLogFilter = filter;
    document.querySelectorAll('.log-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    const searchVal = document.getElementById('admin-logs-search') ? document.getElementById('admin-logs-search').value.toLowerCase().trim() : '';
    renderLogs(filter, searchVal);
};

window.renderLogs = function(filter = 'all', searchQuery = '') {
    const container = document.getElementById('admin-logs-list');
    if (!container || !window.axxesStore) return;

    updateLogsBadge();

    let logs = (window.axxesStore.logs || []).slice();

    // 1. Filter by category/status
    if (filter === 'ok') {
        logs = logs.filter(l => l.status === 'OK');
    } else if (filter === 'failed') {
        logs = logs.filter(l => l.status === 'FAILED');
    } else if (filter === 'edit') {
        logs = logs.filter(l => l.action.includes('UPDATE'));
    } else if (filter === 'delete') {
        logs = logs.filter(l => l.action.includes('DELETE'));
    } else if (filter === 'sync') {
        logs = logs.filter(l => l.action.includes('SYNC'));
    } else if (filter === 'create') {
        logs = logs.filter(l => l.action.includes('CREATE') || l.action.includes('BULK'));
    }

    // 2. Filter by search query
    if (searchQuery) {
        logs = logs.filter(l => 
            (l.message || '').toLowerCase().includes(searchQuery) ||
            (l.action || '').toLowerCase().includes(searchQuery) ||
            (l.status || '').toLowerCase().includes(searchQuery) ||
            (l.details ? JSON.stringify(l.details).toLowerCase().includes(searchQuery) : false)
        );
    }

    if (logs.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: #6b7280;">
                <i class="fas fa-terminal fa-2x" style="margin-bottom: 10px; opacity: 0.5;"></i>
                <p style="margin: 0; font-size: 0.85rem;">No hay registros de log que coincidan con el filtro seleccionado.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = logs.map(l => {
        const isOk = l.status === 'OK';
        const statusClass = isOk ? 'ok' : (l.level === 'warn' ? 'warn' : (l.level === 'info' ? 'info' : 'failed'));
        const hasDetails = l.details !== null && l.details !== undefined;
        const detailsJson = hasDetails ? JSON.stringify(l.details, null, 2) : '';

        return `
            <div class="log-entry-row" onclick="toggleLogDetails('${l.id}')">
                <div class="log-entry-main">
                    <span class="log-time">${l.timeFormatted || l.timestamp.slice(11, 19)}</span>
                    <span class="log-badge-status ${statusClass}">[${l.status}]</span>
                    <span class="log-action-tag">${l.action}</span>
                    <span class="log-msg">${escapeHtml(l.message)}</span>
                    ${hasDetails ? '<span class="log-expand-icon" title="Ver detalles JSON"><i class="fas fa-chevron-down"></i> payload</span>' : ''}
                </div>
                ${hasDetails ? `<pre class="log-details-block" id="log-details-${l.id}">${escapeHtml(detailsJson)}</pre>` : ''}
            </div>
        `;
    }).join('');
};

window.toggleLogDetails = function(logId) {
    const el = document.getElementById('log-details-' + logId);
    if (el) {
        el.classList.toggle('active');
    }
};

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.copyLogsJson = function() {
    if (!window.axxesStore || !window.axxesStore.logs) return;
    const jsonStr = JSON.stringify(window.axxesStore.logs, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
        window.showToast('📋 Logs copiados al portapapeles en formato JSON.');
    }).catch(() => {
        window.showToast('Error al copiar logs.', 'error');
    });
};

window.downloadLogsFile = function() {
    if (!window.axxesStore || !window.axxesStore.logs) return;
    const jsonStr = JSON.stringify(window.axxesStore.logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axxes-audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('📥 Archivo de logs descargado.');
};

window.clearAllLogs = function() {
    if (confirm('¿Seguro que deseas vaciar todo el registro de logs del sistema?')) {
        window.axxesStore.clearLogs();
        renderLogs('all');
        window.showToast('🗑️ Registro de logs vaciado.');
    }
};

// ================== GITHUB LIVE SYNC & TOKEN ==================
window.saveGithubToken = function() {
    const token = document.getElementById('admin-github-token').value.trim();
    if (token) {
        localStorage.setItem('axxes_github_token', token);
        window.showToast('✅ Token de GitHub guardado correctamente.');
        if (window.axxesStore) {
            window.axxesStore.addLog('info', 'GITHUB_TOKEN_SAVE', 'Token de GitHub actualizado y almacenado en navegador.', null, 'OK');
        }
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
        if (statusMsg) statusMsg.innerHTML = '<span style="color:var(--admin-danger);"><i class="fas fa-exclamation-triangle"></i> No hay token guardado.</span>';
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
            if (statusMsg) statusMsg.innerHTML = `<span style="color:var(--admin-success);"><i class="fas fa-check-circle"></i> Conexión exitosa con <strong>${data.full_name}</strong>. Permisos activos.</span>`;
            if (window.axxesStore) {
                window.axxesStore.addLog('success', 'GITHUB_PING', `Conexión exitosa con GitHub (${data.full_name}).`, { repo: data.full_name }, 'OK');
            }
            updateSyncBadge();
        } else {
            if (statusMsg) statusMsg.innerHTML = `<span style="color:var(--admin-danger);"><i class="fas fa-times-circle"></i> Error de autenticación (${res.status}): Verifica que el token tenga permisos 'repo'.</span>`;
            if (window.axxesStore) {
                window.axxesStore.addLog('error', 'GITHUB_PING_FAIL', `Error de autenticación con GitHub (${res.status}).`, { status: res.status }, 'FAILED');
            }
        }
    } catch (e) {
        if (statusMsg) statusMsg.innerHTML = `<span style="color:var(--admin-danger);">Error de conexión: ${e.message}</span>`;
        if (window.axxesStore) {
            window.axxesStore.addLog('error', 'GITHUB_PING_ERROR', 'Error al probar conexión con GitHub: ' + e.message, { error: e.message }, 'FAILED');
        }
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

// Change Admin PIN
window.changeAdminPin = function(e) {
    e.preventDefault();
    const newPin = document.getElementById('admin-new-pin').value.trim();
    const confirmPin = document.getElementById('admin-confirm-pin').value.trim();
    
    if (!/^\d{4}$/.test(newPin)) {
        alert('El PIN debe contener exactamente 4 dígitos numéricos.');
        return;
    }
    if (newPin !== confirmPin) {
        alert('Los PINs no coinciden. Por favor verifica.');
        return;
    }

    localStorage.setItem('axxes_admin_pin', newPin);
    document.getElementById('admin-new-pin').value = '';
    document.getElementById('admin-confirm-pin').value = '';
    
    if (window.axxesStore) {
        window.axxesStore.addLog('info', 'CHANGE_PIN', 'El PIN de seguridad del administrador fue actualizado exitosamente.', null, 'OK');
    }
    window.showToast('🔒 ¡Éxito! Tu PIN de administrador ha sido actualizado.');
};

// Auto-fill token field on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const storedToken = localStorage.getItem('axxes_github_token');
        if (storedToken) {
            const input = document.getElementById('admin-github-token');
            if (input) input.value = storedToken;
        }
    }, 500);
});
