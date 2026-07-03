// Export Module
export class Export {
    constructor(modules) {
        this.modules = modules;
    }
    
    showExportModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">📤 Export Data</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Pilih format export:</p>
                    <div style="display:flex; gap:12px; margin-top:16px; flex-wrap:wrap;">
                        <button class="btn btn-primary" data-action="pdf">📄 PDF</button>
                        <button class="btn btn-success" data-action="excel">📊 Excel</button>
                        <button class="btn btn-warning" data-action="csv">📋 CSV</button>
                        <button class="btn btn-secondary" data-action="json">💾 JSON</button>
                        <button class="btn btn-outline" data-action="print">🖨️ Print</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        modal.querySelectorAll('[data-action]').forEach((button) => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                if (action === 'pdf') this.exportPDF();
                if (action === 'excel') this.exportExcel();
                if (action === 'csv') this.exportCSV();
                if (action === 'json') this.exportJSON();
                if (action === 'print') this.printReport();
                modal.remove();
            });
        });
    }
    
    exportPDF() {
        window.print();
    }
    
    exportExcel() {
        const data = this.prepareData();
        const csv = this.convertToCSV(data);
        this.downloadFile(csv, 'laporan_keuangan.csv', 'text/csv');
    }
    
    exportCSV() {
        const data = this.prepareData();
        const csv = this.convertToCSV(data);
        this.downloadFile(csv, 'laporan_keuangan.csv', 'text/csv');
    }
    
    exportJSON() {
        const data = this.prepareData();
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, 'laporan_keuangan.json', 'application/json');
    }
    
    printReport() {
        window.print();
    }
    
    prepareData() {
        const finance = this.modules.finance.getData();
        const family = this.modules.family.getData();
        const calculator = this.modules.calculator.getData();
        
        return {
            timestamp: new Date().toISOString(),
            finance,
            family,
            calculator,
            summary: {
                totalIncome: finance.totalIncome || 0,
                totalExpense: finance.totalExpense || 0,
                netProfit: finance.netProfit || 0,
                familyIncome: family.income || 0,
                familyExpense: family.totalExpense || 0
            }
        };
    }
    
    convertToCSV(data) {
        const flatten = (obj, prefix = '') => {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'object' && value !== null) {
                    Object.assign(result, flatten(value, newKey));
                } else {
                    result[newKey] = value;
                }
            }
            return result;
        };
        
        const flat = flatten(data);
        const headers = Object.keys(flat);
        const values = Object.values(flat);
        
        return [
            headers.join(','),
            values.join(',')
        ].join('\n');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
}