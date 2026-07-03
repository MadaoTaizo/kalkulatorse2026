// Formatter Module
export class Formatter {
    constructor() {
        this.currency = 'IDR';
        this.locale = 'id-ID';
    }

    formatNumber(value, decimals = 0) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0';
        }
        return new Intl.NumberFormat(this.locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }

    formatCurrency(value, currency = this.currency) {
        if (value === null || value === undefined || isNaN(value)) {
            return 'Rp 0';
        }

        const symbol = currency === 'IDR' ? 'Rp' :
                      currency === 'USD' ? '$' :
                      currency === 'EUR' ? '€' : 'Rp';

        return `${symbol} ${this.formatNumber(value)}`;
    }

    parseCurrency(value) {
        if (value === null || value === undefined || value === '') return 0;
        const cleaned = String(value).replace(/[^\d]/g, '');
        return Number(cleaned || 0);
    }

    formatCurrencyInput(value) {
        const numericValue = this.parseCurrency(value);
        return this.formatCurrency(numericValue, 'IDR');
    }

    applyCurrencyFormatting(input) {
        if (!input) return;

        const rawValue = this.parseCurrency(input.value);
        const formatted = this.formatCurrency(rawValue, 'IDR');
        input.value = formatted;
        input.dataset.rawValue = String(rawValue);
    }

    applyCurrencyFormattingOnInput(input) {
        if (!input) return;

        input.addEventListener('input', () => {
            const cursorPosition = input.selectionStart;
            const rawValue = String(input.value).replace(/[^\d]/g, '');
            const numericValue = Number(rawValue || 0);
            const formatted = this.formatCurrency(numericValue, 'IDR');
            input.value = formatted;
            input.dataset.rawValue = String(numericValue);

            const newCursor = Math.min(formatted.length, cursorPosition + (formatted.length - input.value.length + 1));
            input.setSelectionRange(newCursor, newCursor);
        });
    }
    
    formatPercentage(value, decimals = 1) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0%';
        }
        return `${this.formatNumber(value, decimals)}%`;
    }
    
    formatDate(date, format = 'short') {
        if (!date) return '-';
        const d = new Date(date);
        
        if (format === 'short') {
            return d.toLocaleDateString(this.locale, { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            });
        }
        
        if (format === 'long') {
            return d.toLocaleDateString(this.locale, { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        }
        
        if (format === 'time') {
            return d.toLocaleTimeString(this.locale, { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
        return d.toLocaleDateString(this.locale);
    }
    
    formatDateTime(date) {
        return `${this.formatDate(date, 'short')} ${this.formatDate(date, 'time')}`;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${this.formatNumber(bytes / Math.pow(k, i), 1)} ${sizes[i]}`;
    }
    
    formatDuration(ms) {
        if (ms < 0) return '-';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} hari`;
        if (hours > 0) return `${hours} jam`;
        if (minutes > 0) return `${minutes} menit`;
        return `${seconds} detik`;
    }
    
    truncate(text, length = 50, suffix = '...') {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + suffix;
    }
    
    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
}