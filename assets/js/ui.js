// UI Module - User Interface Utilities
export class UI {
    constructor() {
        this.theme = localStorage.getItem('finbiz_theme') || 'light';
        this.modals = [];
        this.toasts = [];
    }
    
    init() {
        this.applyTheme(this.theme);
        this.setupThemeToggle();
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('finbiz_theme', theme);
        this.theme = theme;
        
        // Update toggle button
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        }
    }
    
    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
    
    setupThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    // Toast notifications
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: var(--radius-md);
            background: var(--bg-card);
            color: var(--text-primary);
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border);
            z-index: 9999;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
            border-left: 4px solid ${type === 'success' ? 'var(--success)' : 
                                 type === 'error' ? 'var(--danger)' : 
                                 type === 'warning' ? 'var(--warning)' : 'var(--primary)'};
        `;
        
        document.body.appendChild(toast);
        this.toasts.push(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => {
                toast.remove();
                this.toasts = this.toasts.filter(t => t !== toast);
            }, 300);
        }, duration);
    }
    
    showSuccess(message) {
        this.showToast(message, 'success');
    }
    
    showError(message) {
        this.showToast(message, 'error');
    }
    
    showWarning(message) {
        this.showToast(message, 'warning');
    }
    
    showInfo(message) {
        this.showToast(message, 'info');
    }
    
    // Modal
    openModal(content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal" style="max-width: ${options.width || '600px'}">
                ${options.title ? `
                    <div class="modal-header">
                        <h3 class="modal-title">${options.title}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                ` : ''}
                <div class="modal-body">
                    ${content}
                </div>
                ${options.actions ? `
                    <div class="modal-footer">
                        ${options.actions}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modals.push(modal);
        
        // Close handlers
        modal.querySelector('.modal-close')?.addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
        
        return modal;
    }
    
    closeModal(modal) {
        modal.remove();
        this.modals = this.modals.filter(m => m !== modal);
    }
    
    closeAllModals() {
        this.modals.forEach(modal => modal.remove());
        this.modals = [];
    }
    
    // Loading
    showLoading(container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (!container) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="spinner"></div>
            <p class="mt-2">Memuat...</p>
        `;
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.8);
            border-radius: var(--radius-lg);
            z-index: 100;
        `;
        
        container.style.position = 'relative';
        container.appendChild(overlay);
        
        return overlay;
    }
    
    hideLoading(overlay) {
        if (overlay) {
            overlay.remove();
        }
    }
    
    // Confirm Dialog
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const modal = this.openModal(`
                <p>${message}</p>
                <div class="flex gap-2 mt-4">
                    <button class="btn btn-danger" id="confirmYes">${options.yesText || 'Ya'}</button>
                    <button class="btn btn-outline" id="confirmNo">${options.noText || 'Batal'}</button>
                </div>
            `, { title: options.title || 'Konfirmasi' });
            
            modal.querySelector('#confirmYes').addEventListener('click', () => {
                this.closeModal(modal);
                resolve(true);
            });
            
            modal.querySelector('#confirmNo').addEventListener('click', () => {
                this.closeModal(modal);
                resolve(false);
            });
        });
    }
}