// Finance Module - Financial Calculations
export class Finance {
    constructor(modules) {
        this.modules = modules;
        this.data = {
            transactions: [],
            savings: 0,
            emergencyFund: 0,
            investments: 0,
            totalIncome: 0,
            totalExpense: 0,
            netProfit: 0,
            annualIncome: 0,
            annualExpense: 0,
            netAnnualProfit: 0
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

    syncWithModules() {
        const calculator = this.modules?.calculator;
        const family = this.modules?.family;

        if (calculator?.getData) {
            const usaha = calculator.getData().usaha || {};
            const result = calculator.calculateAll({
                profit: Number(usaha.profit || 0),
                period: usaha.period || 'per_proyek',
                projectCount: Number(usaha.projectCount || 1),
                holidays: usaha.holidays || {},
                expenses: usaha.expenses || { percentages: {} },
                income: usaha.income || { percentages: {} }
            });

            const monthlyIncome = Math.max(0, Math.round((result.totalIncome || 0) / 12));
            const monthlyExpense = Math.max(0, Math.round((result.totalExpense || 0) / 12));
            const netProfit = Math.max(0, monthlyIncome - monthlyExpense);

            this.data = {
                ...this.data,
                totalIncome: monthlyIncome,
                totalExpense: monthlyExpense,
                netProfit,
                savings: Math.round(netProfit * 0.2),
                emergencyFund: Math.round(netProfit * 0.1),
                annualIncome: Math.round(result.totalIncome || 0),
                annualExpense: Math.round(result.totalExpense || 0),
                netAnnualProfit: Math.round(result.netProfit || 0),
                grossMargin: result.grossMargin || 0,
                netMargin: result.netMargin || 0,
                lastUpdated: Date.now()
            };
        }

        if (family?.getData) {
            const familyData = family.getData();
            const familyIncome = Number(familyData.income || 0);
            const targetSavings = Number(familyData.targetSavings || 0) / 100;
            const availableBudget = Math.max(0, familyIncome - (familyIncome * targetSavings));

            this.data.familyIncome = familyIncome;
            this.data.familyExpense = Math.round(availableBudget);
        }

        return this.data;
    }

    calculateROI(initialCapital, netProfit) {
        if (initialCapital === 0) return 0;
        return (netProfit / initialCapital) * 100;
    }

    calculateBEP(fixedCost, variableCost, sellingPrice) {
        if (sellingPrice - variableCost === 0) return Infinity;
        return fixedCost / (sellingPrice - variableCost);
    }

    calculateCashFlow(income, expenses) {
        const cashIn = income.reduce((a, b) => a + b, 0);
        const cashOut = expenses.reduce((a, b) => a + b, 0);
        return {
            cashIn,
            cashOut,
            balance: cashIn - cashOut,
            status: cashIn >= cashOut ? 'positif' : 'negatif'
        };
    }

    calculateHealthScore(financialData) {
        const { netProfit, totalIncome, totalExpense, savings, emergencyFund } = financialData;

        let score = 0;
        const safeIncome = Number(totalIncome || 0);
        const safeExpense = Number(totalExpense || 0);
        const margin = safeIncome > 0 ? (Number(netProfit || 0) / safeIncome) * 100 : 0;
        const cashFlow = safeIncome - safeExpense;
        const savingsRatio = safeIncome > 0 ? (Number(savings || 0) / safeIncome) * 100 : 0;
        const emergencyRatio = safeIncome > 0 ? (Number(emergencyFund || 0) / safeIncome) * 100 : 0;

        if (margin >= 20) score += 30;
        else if (margin >= 10) score += 20;
        else if (margin >= 5) score += 10;
        else score += 5;

        if (cashFlow > 0) score += 25;
        else if (cashFlow === 0) score += 15;
        else score += 5;

        if (savingsRatio >= 20) score += 20;
        else if (savingsRatio >= 10) score += 15;
        else if (savingsRatio >= 5) score += 10;
        else score += 5;

        if (emergencyRatio >= 15) score += 15;
        else if (emergencyRatio >= 8) score += 10;
        else if (emergencyRatio >= 3) score += 5;

        return Math.min(100, score);
    }

    getFinancialStatus(score) {
        if (score >= 80) return { label: 'Sangat Sehat', emoji: '🌟', class: 'excellent' };
        if (score >= 60) return { label: 'Sehat', emoji: '✅', class: 'good' };
        if (score >= 40) return { label: 'Cukup', emoji: '⚠️', class: 'fair' };
        return { label: 'Perlu Perhatian', emoji: '🔴', class: 'poor' };
    }
}