// Calculator Module - Core Business Logic
export class Calculator {
    constructor(modules = {}) {
        this.modules = modules;
        this.data = {
            usaha: {
                type: 'perdagangan',
                mode: 'project',
                profit: 5000000,
                period: 'per_proyek',
                projectCount: 12,
                holidays: {
                    perWeek: 1,
                    perMonth: 0,
                    national: 14
                },
                expenses: {
                    percentages: {
                        production: 35,
                        operational: 25,
                        marketing: 15,
                        transport: 15,
                        nonOperational: 10
                    }
                },
                income: {
                    percentages: {
                        sales: 90,
                        other: 10
                    }
                }
            }
        };
        this.listeners = [];
    }

    setData(data) {
        if (data) {
            this.data = { ...this.data, ...data };
        }
    }

    getData() {
        return this.data;
    }

    calculateWorkingDays(holidays) {
        const { perWeek, perMonth, national } = holidays;
        const totalHoliday = (Number(perWeek || 0) * 52) + (Number(perMonth || 0) * 12) + Number(national || 0);
        const workingDays = Math.max(0, 365 - totalHoliday);
        return { totalHoliday, workingDays };
    }

    calculateAnnualProfit(profit, period, projectCount, workingDays) {
        let annual = 0;

        if (period === 'per_proyek') {
            annual = Number(profit || 0) * Number(projectCount || 1);
        } else if (period === 'harian') {
            annual = Number(profit || 0) * workingDays;
        } else if (period === 'mingguan') {
            annual = Number(profit || 0) * (workingDays / 7);
        } else if (period === 'bulanan') {
            annual = Number(profit || 0) * (workingDays / 30.4);
        } else if (period === 'tahunan') {
            annual = Number(profit || 0) * (workingDays / 365);
        }

        return Math.round(annual);
    }

    calculateExpenses(annualProfit, percentages) {
        const entries = Object.entries(percentages || {});
        const totalP = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0);
        if (totalP === 0 || annualProfit <= 0) return { items: {}, total: 0 };

        const totalExpense = annualProfit * (totalP / 100);
        const items = {};

        entries.forEach(([key, value]) => {
            items[key] = Math.round(totalExpense * (Number(value || 0) / totalP));
        });

        return { items, total: Math.round(totalExpense) };
    }

    calculateIncome(annualProfit, totalExpense, percentages) {
        const entries = Object.entries(percentages || {});
        const totalP = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0);
        if (totalP === 0 || annualProfit <= 0) return { items: {}, total: 0 };

        const totalIncome = annualProfit + totalExpense;
        const items = {};

        entries.forEach(([key, value]) => {
            items[key] = Math.round(totalIncome * (Number(value || 0) / totalP));
        });

        return { items, total: Math.round(totalIncome) };
    }

    calculateAll(data) {
        const { profit, period, projectCount, holidays, expenses, income } = data;

        const { totalHoliday, workingDays } = this.calculateWorkingDays(holidays || {});
        const annualProfit = this.calculateAnnualProfit(profit, period, projectCount, workingDays);
        const expenseResult = this.calculateExpenses(annualProfit, expenses?.percentages || {});
        const incomeResult = this.calculateIncome(annualProfit, expenseResult.total, income?.percentages || {});
        const netProfit = incomeResult.total - expenseResult.total;
        const grossMargin = annualProfit > 0 ? (annualProfit / Math.max(1, incomeResult.total)) * 100 : 0;
        const netMargin = incomeResult.total > 0 ? (netProfit / incomeResult.total) * 100 : 0;

        return {
            workingDays,
            totalHoliday,
            annualProfit,
            monthlyIncome: Math.round(annualProfit / 12),
            expenses: expenseResult,
            income: incomeResult,
            netProfit,
            grossMargin,
            netMargin,
            totalExpense: expenseResult.total,
            totalIncome: incomeResult.total
        };
    }

    updateUsahaFromForm() {
        const usaha = this.data.usaha;
        const profitInput = document.getElementById('profitValue');
        const periodInput = document.getElementById('profitPeriod');
        const projectInput = document.getElementById('projectCount');
        const holidayWeekInput = document.getElementById('holidayWeek');
        const holidayMonthInput = document.getElementById('holidayMonth');
        const holidayNationalInput = document.getElementById('holidayNational');

        usaha.profit = Number(String(profitInput?.value || '').replace(/[^\d]/g, '')) || 0;
        usaha.period = periodInput?.value || usaha.period;
        usaha.projectCount = Number(projectInput?.value || 1);
        usaha.holidays = {
            ...usaha.holidays,
            perWeek: Number(holidayWeekInput?.value || 0),
            perMonth: Number(holidayMonthInput?.value || 0),
            national: Number(holidayNationalInput?.value || 0)
        };

        this.data.usaha = usaha;
        return usaha;
    }

    bindPageEvents(page) {
        if (page === 'usaha') {
            const button = document.getElementById('calculateBtn');
            if (!button) return;

            button.onclick = () => {
                const usaha = this.updateUsahaFromForm();
                const result = this.calculateAll({
                    profit: usaha.profit,
                    period: usaha.period,
                    projectCount: usaha.projectCount,
                    holidays: usaha.holidays,
                    expenses: usaha.expenses,
                    income: usaha.income
                });

                const container = document.getElementById('calculationResults');
                if (container) {
                    container.innerHTML = `
                        <div class="card">
                            <h4>Hasil Proyeksi</h4>
                            <div class="grid grid-2">
                                <div><strong>Hari Kerja:</strong> ${result.workingDays}</div>
                                <div><strong>Proyeksi Tahunan:</strong> ${this.modules?.formatter?.formatCurrency?.(result.annualProfit) || 'Rp ' + result.annualProfit}</div>
                                <div><strong>Pengeluaran Bulanan:</strong> ${this.modules?.formatter?.formatCurrency?.(Math.round(result.totalExpense / 12)) || 'Rp ' + Math.round(result.totalExpense / 12)}</div>
                                <div><strong>Pemasukan Bulanan:</strong> ${this.modules?.formatter?.formatCurrency?.(Math.round(result.totalIncome / 12)) || 'Rp ' + Math.round(result.totalIncome / 12)}</div>
                                <div><strong>Laba Bersih:</strong> ${this.modules?.formatter?.formatCurrency?.(result.netProfit) || 'Rp ' + result.netProfit}</div>
                                <div><strong>Net Margin:</strong> ${result.netMargin.toFixed(1)}%</div>
                            </div>
                        </div>
                    `;
                }

                this.modules?.finance?.syncWithModules?.();
                this.modules?.storage?.save?.('app_data', {
                    finance: this.modules?.finance?.getData?.(),
                    family: this.modules?.family?.getData?.(),
                    calculator: this.modules?.calculator?.getData?.(),
                    timestamp: Date.now()
                });
                this.modules?.ui?.showToast?.('Perhitungan usaha diperbarui', 'success');
            };
        }

        if (page === 'pengeluaran') {
            const button = document.getElementById('updateExpenseBtn');
            const totalEl = document.getElementById('expenseTotalPercent');
            const warningEl = document.getElementById('expenseWarning');
            const updateTotal = () => {
                const total = [
                    document.getElementById('expenseProduction')?.value || 0,
                    document.getElementById('expenseOperational')?.value || 0,
                    document.getElementById('expenseMarketing')?.value || 0,
                    document.getElementById('expenseTransport')?.value || 0,
                    document.getElementById('expenseNonOperational')?.value || 0
                ].reduce((sum, value) => sum + Number(value || 0), 0);
                if (totalEl) totalEl.textContent = `${total}%`;
                if (warningEl) warningEl.style.display = total === 100 ? 'none' : 'block';
            };

            ['expenseProduction', 'expenseOperational', 'expenseMarketing', 'expenseTransport', 'expenseNonOperational'].forEach((id) => {
                document.getElementById(id)?.addEventListener('input', updateTotal);
            });
            updateTotal();

            button.onclick = () => {
                this.data.usaha.expenses.percentages = {
                    production: Number(document.getElementById('expenseProduction')?.value || 0),
                    operational: Number(document.getElementById('expenseOperational')?.value || 0),
                    marketing: Number(document.getElementById('expenseMarketing')?.value || 0),
                    transport: Number(document.getElementById('expenseTransport')?.value || 0),
                    nonOperational: Number(document.getElementById('expenseNonOperational')?.value || 0)
                };
                this.modules?.finance?.syncWithModules?.();
                this.modules?.ui?.showToast?.('Persentase pengeluaran diperbarui', 'success');
            };
        }

        if (page === 'pemasukan') {
            const button = document.getElementById('updateIncomeBtn');
            const totalEl = document.getElementById('incomeTotalPercent');
            const warningEl = document.getElementById('incomeWarning');
            const updateTotal = () => {
                const total = [
                    document.getElementById('incomeSales')?.value || 0,
                    document.getElementById('incomeOther')?.value || 0
                ].reduce((sum, value) => sum + Number(value || 0), 0);
                if (totalEl) totalEl.textContent = `${total}%`;
                if (warningEl) warningEl.style.display = total === 100 ? 'none' : 'block';
            };

            ['incomeSales', 'incomeOther'].forEach((id) => {
                document.getElementById(id)?.addEventListener('input', updateTotal);
            });
            updateTotal();

            button.onclick = () => {
                this.data.usaha.income.percentages = {
                    sales: Number(document.getElementById('incomeSales')?.value || 0),
                    other: Number(document.getElementById('incomeOther')?.value || 0)
                };
                this.modules?.finance?.syncWithModules?.();
                this.modules?.ui?.showToast?.('Persentase pemasukan diperbarui', 'success');
            };
        }
    }

    renderUsaha() {
        const data = this.data.usaha;
        return `
            <h3 class="page-section-title">📈 Data Usaha</h3>

            <div class="grid grid-2">
                <div>
                    <div class="form-group">
                        <label class="form-label">Jenis Usaha</label>
                        <select class="form-control" id="usahaType">
                            <option value="pertanian" ${data.type === 'pertanian' ? 'selected' : ''}>Pertanian, Kehutanan & Perikanan</option>
                            <option value="pertambangan" ${data.type === 'pertambangan' ? 'selected' : ''}>Pertambangan & Penggalian</option>
                            <option value="industri" ${data.type === 'industri' ? 'selected' : ''}>Industri Pengolahan</option>
                            <option value="perdagangan" ${data.type === 'perdagangan' ? 'selected' : ''}>Perdagangan Besar & Eceran</option>
                            <option value="transportasi" ${data.type === 'transportasi' ? 'selected' : ''}>Transportasi & Pergudangan</option>
                            <option value="akomodasi" ${data.type === 'akomodasi' ? 'selected' : ''}>Akomodasi & Makan Minum</option>
                            <option value="informasi" ${data.type === 'informasi' ? 'selected' : ''}>Informasi & Komunikasi</option>
                            <option value="profesional" ${data.type === 'profesional' ? 'selected' : ''}>Jasa Profesional</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Mode Usaha</label>
                        <div class="toggle-group">
                            <label class="form-check">
                                <input type="radio" name="usahaMode" value="regular" ${data.mode === 'regular' ? 'checked' : ''}>
                                Reguler
                            </label>
                            <label class="form-check">
                                <input type="radio" name="usahaMode" value="project" ${data.mode === 'project' ? 'checked' : ''}>
                                Proyek
                            </label>
                            <label class="form-check">
                                <input type="radio" name="usahaMode" value="solo" ${data.mode === 'solo' ? 'checked' : ''}>
                                Mandiri ⭐
                            </label>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="form-group">
                        <label class="form-label">Keuntungan</label>
                        <div class="input-group">
                            <span class="input-prefix">Rp</span>
                            <input type="text" class="form-control" id="profitValue" value="${this.formatNumber(data.profit)}">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Periode</label>
                        <select class="form-control" id="profitPeriod">
                            <option value="harian" ${data.period === 'harian' ? 'selected' : ''}>Harian</option>
                            <option value="mingguan" ${data.period === 'mingguan' ? 'selected' : ''}>Mingguan</option>
                            <option value="bulanan" ${data.period === 'bulanan' ? 'selected' : ''}>Bulanan</option>
                            <option value="tahunan" ${data.period === 'tahunan' ? 'selected' : ''}>Tahunan</option>
                            <option value="per_proyek" ${data.period === 'per_proyek' ? 'selected' : ''}>Per Proyek</option>
                        </select>
                    </div>

                    <div class="form-group" id="projectCountGroup">
                        <label class="form-label">Jumlah Proyek/Tahun</label>
                        <input type="number" class="form-control" id="projectCount" value="${data.projectCount}" min="1">
                    </div>
                </div>
            </div>

            <div class="grid grid-3">
                <div class="form-group">
                    <label class="form-label">Libur per Minggu</label>
                    <input type="number" class="form-control" id="holidayWeek" value="${data.holidays.perWeek}" min="0" max="7">
                </div>
                <div class="form-group">
                    <label class="form-label">Libur per Bulan</label>
                    <input type="number" class="form-control" id="holidayMonth" value="${data.holidays.perMonth}" min="0" max="31">
                </div>
                <div class="form-group">
                    <label class="form-label">Libur Nasional</label>
                    <input type="number" class="form-control" id="holidayNational" value="${data.holidays.national}" min="0" max="365">
                </div>
            </div>

            <button class="btn btn-primary" id="calculateBtn">📊 Hitung Proyeksi</button>

            <div id="calculationResults" class="mt-4"></div>
        `;
    }

    renderPengeluaran() {
        const data = this.data.usaha;
        const p = data.expenses.percentages;
        return `
            <h3 class="page-section-title">📉 Pengeluaran Usaha</h3>

            <div class="grid grid-2">
                <div>
                    <div class="form-group">
                        <label class="form-label">Biaya Produksi / Bahan Baku</label>
                        <div class="input-group">
                            <input type="number" class="form-control" id="expenseProduction" value="${p.production}" min="0" max="100">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Biaya Operasional</label>
                        <div class="input-group">
                            <input type="number" class="form-control" id="expenseOperational" value="${p.operational}" min="0" max="100">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Biaya Pemasaran</label>
                        <div class="input-group">
                            <input type="number" class="form-control" id="expenseMarketing" value="${p.marketing}" min="0" max="100">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label class="form-label">Biaya Transportasi</label>
                        <div class="input-group">
                            <input type="number" class="form-control" id="expenseTransport" value="${p.transport}" min="0" max="100">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Biaya Non-Operasional</label>
                        <div class="input-group">
                            <input type="number" class="form-control" id="expenseNonOperational" value="${p.nonOperational}" min="0" max="100">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                    <div class="alert alert-info">
                        <strong>Total:</strong> <span id="expenseTotalPercent">${Object.values(p).reduce((a, b) => a + b, 0)}%</span>
                        <div id="expenseWarning" style="display:none; color: var(--danger);">
                            ⚠️ Total persentase harus 100%
                        </div>
                    </div>
                </div>
            </div>

            <button class="btn btn-success" id="updateExpenseBtn">🔄 Update Pengeluaran</button>
        `;
    }

    renderPemasukan() {
        const data = this.data.usaha;
        const p = data.income.percentages;
        return `
            <h3 class="page-section-title">📈 Pemasukan Usaha</h3>

            <div class="grid grid-2">
                <div>
                    <div class="form-group">
                        <label class="form-label">Penjualan Jasa/Proyek</label>
                        <div class="input-group">
                            <input type="number" class="form-control" id="incomeSales" value="${p.sales}" min="0" max="100">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label class="form-label">Pendapatan Lainnya</label>
                        <div class="input-group">
                            <input type="number" class="form-control" id="incomeOther" value="${p.other}" min="0" max="100">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                    <div class="alert alert-info">
                        <strong>Total:</strong> <span id="incomeTotalPercent">${Object.values(p).reduce((a, b) => a + b, 0)}%</span>
                        <div id="incomeWarning" style="display:none; color: var(--danger);">
                            ⚠️ Total persentase harus 100%
                        </div>
                    </div>
                </div>
            </div>

            <button class="btn btn-success" id="updateIncomeBtn">🔄 Update Pemasukan</button>
        `;
    }

    formatNumber(value) {
        return new Intl.NumberFormat('id-ID').format(value);
    }
}