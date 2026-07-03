// Dashboard Module
export class Dashboard {
    constructor(modules) {
        this.modules = modules;
        this.charts = {};
    }

    async render() {
        const container = document.getElementById('page-container');
        if (!container) return;

        const data = this.prepareData();

        container.innerHTML = `
            <div class="dashboard-stats">
                ${this.renderStats(data)}
            </div>

            <div class="grid grid-2">
                <div class="chart-container">
                    <h4 class="chart-title">📊 Pengeluaran vs Pemasukan</h4>
                    <div class="chart-wrapper">
                        <canvas id="incomeExpenseChart"></canvas>
                    </div>
                </div>
                <div class="chart-container">
                    <h4 class="chart-title">🎯 Alokasi Pengeluaran</h4>
                    <div class="chart-wrapper">
                        <canvas id="expenseChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="financial-score mt-4">
                <div class="score-circle ${data.scoreClass}">
                    ${data.score}
                </div>
                <div class="score-details">
                    <div class="score-label">Financial Health Score</div>
                    <div class="score-status">${data.scoreLabel}</div>
                    <div class="score-metrics">
                        ${this.renderMetrics(data)}
                    </div>
                </div>
            </div>

            <div class="page-section mt-4">
                <div class="section-header">
                    <h3 class="page-section-title">⚡ Quick Actions</h3>
                </div>
                <div class="quick-actions">
                    <button class="quick-action-btn" onclick="window.navigate('pengeluaran')">➕ Tambah Pengeluaran</button>
                    <button class="quick-action-btn" onclick="window.navigate('pemasukan')">💰 Tambah Pemasukan</button>
                    <button class="quick-action-btn" onclick="window.modules.export.showExportModal()">📤 Export Data</button>
                    <button class="quick-action-btn" onclick="window.modules.ui.showToast('Data berhasil diperbarui', 'success')">🔄 Refresh Data</button>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.initCharts(data);
        }, 100);
    }

    prepareData() {
        const finance = this.modules.finance.syncWithModules();
        const family = this.modules.family.getData();

        const totalIncome = finance.totalIncome || 0;
        const totalExpense = finance.totalExpense || 0;
        const netProfit = finance.netProfit || 0;
        const savings = finance.savings || 0;
        const emergencyFund = finance.emergencyFund || 0;

        const score = this.modules.finance.calculateHealthScore({
            netProfit,
            totalIncome,
            totalExpense,
            savings,
            emergencyFund
        });

        const status = this.modules.finance.getFinancialStatus(score);

        return {
            totalIncome,
            totalExpense,
            netProfit,
            savings,
            emergencyFund,
            score,
            scoreLabel: status.label,
            scoreEmoji: status.emoji,
            scoreClass: status.class,
            familyIncome: family.income || 0,
            familyExpense: finance.familyExpense || 0
        };
    }

    renderStats(data) {
        return `
            <div class="stat-card success">
                <div class="stat-label">💰 Total Pemasukan</div>
                <div class="stat-value">${this.modules.formatter.formatCurrency(data.totalIncome)}</div>
                <div class="stat-change positive">▲ dihitung otomatis</div>
            </div>
            <div class="stat-card danger">
                <div class="stat-label">📉 Total Pengeluaran</div>
                <div class="stat-value">${this.modules.formatter.formatCurrency(data.totalExpense)}</div>
                <div class="stat-change negative">▼ dihitung otomatis</div>
            </div>
            <div class="stat-card primary">
                <div class="stat-label">📈 Laba Bersih</div>
                <div class="stat-value">${this.modules.formatter.formatCurrency(data.netProfit)}</div>
                <div class="stat-change positive">▲ berdasarkan proyeksi</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-label">🏦 Tabungan</div>
                <div class="stat-value">${this.modules.formatter.formatCurrency(data.savings)}</div>
                <div class="stat-change neutral">Stabil</div>
            </div>
        `;
    }

    renderMetrics(data) {
        return `
            <div class="metric-item">
                <span class="metric-label">Profit Margin</span>
                <span class="metric-value">${data.totalIncome > 0 ? this.modules.formatter.formatPercentage((data.netProfit / data.totalIncome) * 100) : '0%'}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Cash Flow</span>
                <span class="metric-value" style="color: ${data.totalIncome >= data.totalExpense ? 'var(--success)' : 'var(--danger)'}">
                    ${data.totalIncome >= data.totalExpense ? '✅ Positif' : '❌ Negatif'}
                </span>
            </div>
            <div class="metric-item">
                <span class="metric-label">ROI</span>
                <span class="metric-value">-</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Saving Ratio</span>
                <span class="metric-value">${data.totalIncome > 0 ? this.modules.formatter.formatPercentage((data.savings / data.totalIncome) * 100) : '0%'}</span>
            </div>
        `;
    }

    initCharts(data) {
        const ctx1 = document.getElementById('incomeExpenseChart');
        if (ctx1 && window.Chart) {
            this.charts.incomeExpense = new window.Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
                    datasets: [
                        {
                            label: 'Pemasukan',
                            data: [Math.round(data.totalIncome / 6), Math.round(data.totalIncome / 5), Math.round(data.totalIncome / 4), Math.round(data.totalIncome / 3), Math.round(data.totalIncome / 2), data.totalIncome],
                            backgroundColor: 'rgba(16, 185, 129, 0.6)',
                            borderColor: 'rgb(16, 185, 129)',
                            borderWidth: 2
                        },
                        {
                            label: 'Pengeluaran',
                            data: [Math.round(data.totalExpense / 6), Math.round(data.totalExpense / 5), Math.round(data.totalExpense / 4), Math.round(data.totalExpense / 3), Math.round(data.totalExpense / 2), data.totalExpense],
                            backgroundColor: 'rgba(239, 68, 68, 0.6)',
                            borderColor: 'rgb(239, 68, 68)',
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => this.modules.formatter.formatCurrency(value)
                            }
                        }
                    }
                }
            });
        }

        const ctx2 = document.getElementById('expenseChart');
        if (ctx2 && window.Chart) {
            this.charts.expense = new window.Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['Produksi', 'Operasional', 'Marketing', 'Transport', 'Non-Operasional'],
                    datasets: [{
                        data: [35, 25, 15, 15, 10],
                        backgroundColor: [
                            'rgba(37, 99, 235, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(99, 102, 241, 0.8)',
                            'rgba(239, 68, 68, 0.8)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }
    }
}