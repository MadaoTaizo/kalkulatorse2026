// Family Module - Family Finance Management
export class Family {
    constructor(modules) {
        this.modules = modules;
        this.data = {
            members: 4,
            income: 5000000,
            targetSavings: 0.02,
            expenses: {
                electricity: 0,
                internet: 0,
                food: 0,
                nonFoodMonthly: 0,
                nonFoodYearly: 0
            }
        };
    }

    setData(data) {
        if (data) {
            this.data = { ...this.data, ...data };
        }
    }

    getData() {
        return this.data;
    }

    calculateExpenses(totalIncome, members, targetPercentage) {
        const targetSavings = Number(totalIncome || 0) * (Number(targetPercentage || 0) / 100);
        const totalExpense = Math.max(0, Number(totalIncome || 0) - targetSavings);
        const perPerson = members > 0 ? totalExpense / members : 0;

        const electricity = Math.round(perPerson * 0.12);
        const internet = Math.round(perPerson * 0.08);
        const food = Math.round(perPerson * 0.45);
        const nonFoodMonthly = Math.round(perPerson * 0.25);
        const nonFoodYearly = Math.round(perPerson * 0.10 * 12);
        const totalMonthly = electricity + internet + food + nonFoodMonthly;
        const totalYearly = totalMonthly * 12 + nonFoodYearly;

        return {
            electricity,
            internet,
            food,
            nonFoodMonthly,
            nonFoodYearly,
            totalMonthly,
            totalYearly,
            perPerson,
            targetSavings,
            totalExpense
        };
    }

    bindPageEvents() {
        const button = document.getElementById('calculateFamilyBtn');
        if (!button) return;

        button.onclick = () => {
            const incomeInput = document.getElementById('familyIncome');
            const membersInput = document.getElementById('familyMembers');
            const targetInput = document.getElementById('targetSavings');

            this.data.income = Number(String(incomeInput?.value || '').replace(/[^\d]/g, '')) || 0;
            this.data.members = Number(membersInput?.value || 1);
            this.data.targetSavings = Number(targetInput?.value || 0) / 100;

            const result = this.calculateExpenses(this.data.income, this.data.members, this.data.targetSavings * 100);
            this.data.expenses = result;

            const resultEl = document.getElementById('familyResult');
            if (resultEl) {
                resultEl.innerHTML = `
                    <div class="alert alert-success">
                        <strong>Alokasi siap:</strong> tabungan ${this.modules?.formatter?.formatCurrency?.(result.targetSavings) || 'Rp ' + result.targetSavings}
                    </div>
                `;
            }

            const rec = {
                electricity: result.electricity,
                internet: result.internet,
                food: result.food,
                nonFoodMonthly: result.nonFoodMonthly,
                nonFoodYearly: result.nonFoodYearly,
                totalMonthly: result.totalMonthly,
                totalYearly: result.totalYearly
            };

            const renderValue = (value) => this.modules?.formatter?.formatCurrency?.(value) || 'Rp ' + value;
            document.getElementById('recElectricity').textContent = renderValue(rec.electricity);
            document.getElementById('recInternet').textContent = renderValue(rec.internet);
            document.getElementById('recFood').textContent = renderValue(rec.food);
            document.getElementById('recNonFood').textContent = renderValue(rec.nonFoodMonthly);
            document.getElementById('recNonFoodYearly').textContent = renderValue(rec.nonFoodYearly);
            document.getElementById('recTotalMonthly').textContent = renderValue(rec.totalMonthly);
            document.getElementById('recTotalYearly').textContent = renderValue(rec.totalYearly);

            this.modules?.finance?.syncWithModules?.();
            this.modules?.storage?.save?.('app_data', {
                finance: this.modules?.finance?.getData?.(),
                family: this.modules?.family?.getData?.(),
                calculator: this.modules?.calculator?.getData?.(),
                timestamp: Date.now()
            });
            this.modules?.ui?.showToast?.('Alokasi keluarga dihitung', 'success');
        };
    }

    render() {
        const data = this.data;
        return `
            <h3 class="page-section-title">👨‍👩‍👧‍👦 Keuangan Keluarga</h3>

            <div class="grid grid-2">
                <div>
                    <div class="form-group">
                        <label class="form-label">Total Pendapatan Keluarga (Bulanan)</label>
                        <div class="input-group">
                            <span class="input-prefix">Rp</span>
                            <input type="text" class="form-control" id="familyIncome" value="${this.modules.formatter.formatNumber(data.income)}">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Jumlah Anggota Keluarga</label>
                        <input type="number" class="form-control" id="familyMembers" value="${data.members}" min="1">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Target Selisih</label>
                        <div class="input-group">
                            <input type="number" class="form-control" id="targetSavings" value="${data.targetSavings * 100}" min="0" max="20" step="0.5">
                            <span class="input-suffix">%</span>
                        </div>
                        <small class="form-help">Rekomendasi: 1-5% untuk selisih tipis</small>
                    </div>
                </div>

                <div>
                    <div class="form-group">
                        <label class="form-label">Rekomendasi Pengeluaran</label>
                        <div id="familyRecommendation" class="mt-2">
                            <div class="item"><span>Listrik Bulanan</span> <span id="recElectricity">-</span></div>
                            <div class="item"><span>Pulsa & Internet</span> <span id="recInternet">-</span></div>
                            <div class="item"><span>Makan Mingguan</span> <span id="recFood">-</span></div>
                            <div class="item"><span>Non-Makanan Bulanan</span> <span id="recNonFood">-</span></div>
                            <div class="item"><span>Non-Makanan Tahunan</span> <span id="recNonFoodYearly">-</span></div>
                            <div class="total mt-2">
                                <span>Total Pengeluaran / Bulan</span>
                                <span id="recTotalMonthly">-</span>
                            </div>
                            <div class="total mt-2" style="background:#e6f7ec;">
                                <span>Total Pengeluaran / Tahun</span>
                                <span id="recTotalYearly">-</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-2">
                <div>
                    <button class="btn btn-primary" id="calculateFamilyBtn">👨‍👩‍👧‍👦 Hitung Alokasi</button>
                </div>
                <div id="familyResult" class="mt-3"></div>
            </div>

            <div id="familyDetail" class="mt-4"></div>
        `;
    }
}