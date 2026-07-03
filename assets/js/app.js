// Main Application Module
import { Router } from './router.js';
import { Calculator } from './calculator.js';
import { Finance } from './finance.js';
import { Family } from './family.js';
import { Dashboard } from './dashboard.js';
import { Validator } from './validator.js';
import { Formatter } from './formatter.js';
import { Storage } from './storage.js';
import { Export } from './export.js';
import { UI } from './ui.js';

export class App {
    constructor() {
        this.modules = {};
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            this.modules.storage = new Storage();
            this.modules.formatter = new Formatter();
            this.modules.validator = new Validator();
            this.modules.ui = new UI();
            this.modules.calculator = new Calculator(this.modules);
            this.modules.finance = new Finance(this.modules);
            this.modules.family = new Family(this.modules);
            this.modules.dashboard = new Dashboard(this.modules);
            this.modules.export = new Export(this.modules);
            this.modules.router = new Router(this.modules);

            await this.loadData();
            this.modules.finance.syncWithModules();
            this.modules.ui.init();
            this.setupUI();
            this.modules.router.init();

            window.modules = this.modules;
            window.navigate = (page) => this.modules.router.loadPage(page);

            this.initialized = true;
            console.log('✅ Financial Business Management System initialized');
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showError('Gagal memuat aplikasi. Silakan refresh halaman.');
        }
    }

    async loadData() {
        try {
            const data = this.modules.storage.load('app_data');
            if (data) {
                this.modules.finance.setData(data.finance || {});
                this.modules.family.setData(data.family || {});
                this.modules.calculator.setData(data.calculator || {});
            }
        } catch (error) {
            console.warn('Failed to load data:', error);
        }
    }

    setupUI() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                if (overlay) overlay.classList.toggle('active');
            });

            if (overlay) {
                overlay.addEventListener('click', () => {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                });
            }
        }

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.modules.ui.toggleTheme();
            });
        }

        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.modules.export.showExportModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveData();
            }

            if (e.key === 'Escape') {
                this.modules.ui.closeAllModals();
            }
        });

        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }

    saveData() {
        try {
            const data = {
                finance: this.modules.finance.getData(),
                family: this.modules.family.getData(),
                calculator: this.modules.calculator.getData(),
                timestamp: Date.now()
            };
            this.modules.storage.save('app_data', data);
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }

    showError(message) {
        const container = document.getElementById('page-container');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error:</strong> ${message}
                </div>
            `;
        }
    }
}