// Router Module
export class Router {
    constructor(modules) {
        this.modules = modules;
        this.routes = {};
        this.currentPage = 'dashboard';
        this.pages = {
            dashboard: this.renderDashboard.bind(this),
            usaha: this.renderUsaha.bind(this),
            pengeluaran: this.renderPengeluaran.bind(this),
            pemasukan: this.renderPemasukan.bind(this),
            keluarga: this.renderKeluarga.bind(this),
            analisa: this.renderAnalisa.bind(this),
            laporan: this.renderLaporan.bind(this),
            pengaturan: this.renderPengaturan.bind(this)
        };
    }

    init() {
        window.modules = this.modules;
        window.navigate = (page) => this.loadPage(page);
        this.setupNavigation();
        this.loadPage('dashboard');
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    this.loadPage(page);
                }
            });
        });
    }

    async loadPage(page) {
        if (!this.pages[page]) {
            console.warn(`Page "${page}" not found`);
            return;
        }

        this.currentPage = page;
        this.modules.finance?.syncWithModules?.();

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        const titles = {
            dashboard: 'Dashboard',
            usaha: 'Data Usaha',
            pengeluaran: 'Pengeluaran Usaha',
            pemasukan: 'Pemasukan Usaha',
            keluarga: 'Keuangan Keluarga',
            analisa: 'Analisa Keuangan',
            laporan: 'Laporan',
            pengaturan: 'Pengaturan'
        };

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[page] || page;
        }

        const container = document.getElementById('page-container');
        if (container) {
            container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

            try {
                await this.pages[page]();
                this.modules.ui?.showToast?.(`Halaman ${titles[page] || page} terbuka`, 'info', 1200);
                container.classList.add('fade-in');
            } catch (error) {
                console.error(`Error loading page "${page}":`, error);
                container.innerHTML = `
                    <div class="alert alert-danger">
                        <strong>Error:</strong> Gagal memuat halaman. Silakan coba lagi.
                    </div>
                `;
            }
        }
    }

    renderDashboard() {
        return this.modules.dashboard.render();
    }

    renderUsaha() {
        return this.renderPage('usaha', this.modules.calculator.renderUsaha());
    }

    renderPengeluaran() {
        return this.renderPage('pengeluaran', this.modules.calculator.renderPengeluaran());
    }

    renderPemasukan() {
        return this.renderPage('pemasukan', this.modules.calculator.renderPemasukan());
    }

    renderKeluarga() {
        return this.renderPage('keluarga', this.modules.family.render());
    }

    renderAnalisa() {
        return this.renderPage('analisa', `
            <div class="page-section">
                <h3 class="page-section-title">Analisa Keuangan</h3>
                <p class="text-secondary">Fitur analisa keuangan akan segera hadir.</p>
            </div>
        `);
    }

    renderLaporan() {
        return this.renderPage('laporan', `
            <div class="page-section">
                <h3 class="page-section-title">Laporan Keuangan</h3>
                <div class="section-header">
                    <p class="text-secondary">Lihat dan ekspor laporan keuangan Anda.</p>
                    <div class="actions">
                        <button class="btn btn-primary btn-sm" onclick="window.modules.export.exportPDF()">📄 Export PDF</button>
                        <button class="btn btn-success btn-sm" onclick="window.modules.export.exportExcel()">📊 Export Excel</button>
                    </div>
                </div>
            </div>
        `);
    }

    renderPengaturan() {
        return this.renderPage('pengaturan', `
            <div class="page-section">
                <h3 class="page-section-title">Pengaturan</h3>
                <div class="grid grid-2">
                    <div class="setting-group">
                        <h4>General</h4>
                        <div class="form-group">
                            <label class="form-label">Mata Uang</label>
                            <select class="form-control" id="currencySetting">
                                <option value="IDR">Rp (Rupiah)</option>
                                <option value="USD">$ (Dollar)</option>
                                <option value="EUR">€ (Euro)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Bahasa</label>
                            <select class="form-control" id="languageSetting">
                                <option value="id">Indonesia</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                    <div class="setting-group">
                        <h4>Data</h4>
                        <button class="btn btn-danger btn-block" id="resetDataBtn">🔄 Reset Semua Data</button>
                        <button class="btn btn-outline btn-block" id="backupDataBtn">💾 Backup Data</button>
                        <button class="btn btn-outline btn-block" id="restoreDataBtn">📂 Restore Data</button>
                    </div>
                </div>
            </div>
        `);
    }

    renderPage(page, content) {
        const container = document.getElementById('page-container');
        if (container) {
            container.innerHTML = `
                <div class="page-section">
                    ${content}
                </div>
            `;
        }

        if (page === 'usaha' || page === 'pengeluaran' || page === 'pemasukan') {
            this.modules.calculator.bindPageEvents(page);
            setTimeout(() => {
                this.modules.formatter.applyCurrencyFormattingOnInput(document.getElementById('profitValue'));
            }, 0);
        }

        if (page === 'keluarga') {
            this.modules.family.bindPageEvents();
            setTimeout(() => {
                this.modules.formatter.applyCurrencyFormattingOnInput(document.getElementById('familyIncome'));
            }, 0);
        }

        if (page === 'pengaturan') {
            setTimeout(() => {
                const resetBtn = document.getElementById('resetDataBtn');
                const backupBtn = document.getElementById('backupDataBtn');
                const restoreBtn = document.getElementById('restoreDataBtn');

                resetBtn?.addEventListener('click', () => {
                    this.modules.storage.clear();
                    this.modules.ui?.showToast?.('Data berhasil direset', 'warning');
                });

                backupBtn?.addEventListener('click', () => {
                    const data = this.modules.storage.exportData();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'backup-finbiz.json';
                    link.click();
                    URL.revokeObjectURL(url);
                    this.modules.ui?.showToast?.('Backup data dibuat', 'success');
                });

                restoreBtn?.addEventListener('click', () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'application/json';
                    input.onchange = (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                            try {
                                const parsed = JSON.parse(reader.result);
                                this.modules.storage.importData(parsed);
                                this.modules.ui?.showToast?.('Data berhasil dipulihkan', 'success');
                            } catch (error) {
                                this.modules.ui?.showToast?.('File tidak valid', 'error');
                            }
                        };
                        reader.readAsText(file);
                    };
                    input.click();
                });
            }, 0);
        }

        return Promise.resolve();
    }
}