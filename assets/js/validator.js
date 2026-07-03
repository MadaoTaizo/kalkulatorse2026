// Validator Module
export class Validator {
    constructor() {
        this.rules = {
            required: (value) => value !== null && value !== undefined && value !== '',
            number: (value) => !isNaN(parseFloat(value)) && isFinite(value),
            min: (value, min) => parseFloat(value) >= min,
            max: (value, max) => parseFloat(value) <= max,
            minLength: (value, length) => String(value).length >= length,
            maxLength: (value, length) => String(value).length <= length,
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
            url: (value) => /^https?:\/\/[^\s]+$/.test(String(value)),
            pattern: (value, pattern) => pattern.test(String(value))
        };
        
        this.messages = {
            required: 'Field ini wajib diisi',
            number: 'Harus berupa angka',
            min: 'Nilai minimal {min}',
            max: 'Nilai maksimal {max}',
            minLength: 'Minimal {length} karakter',
            maxLength: 'Maksimal {length} karakter',
            email: 'Format email tidak valid',
            url: 'Format URL tidak valid',
            pattern: 'Format tidak valid'
        };
    }
    
    validate(value, rules) {
        const errors = [];
        
        for (const rule of rules) {
            const [name, param] = rule.split(':');
            const validator = this.rules[name];
            
            if (!validator) continue;
            
            let isValid = true;
            if (param) {
                isValid = validator(value, parseFloat(param) || param);
            } else {
                isValid = validator(value);
            }
            
            if (!isValid) {
                let message = this.messages[name] || 'Invalid value';
                if (param) {
                    message = message.replace(`{${name}}`, param);
                    message = message.replace(`{${name === 'min' ? 'min' : 'max'}}`, param);
                    message = message.replace(`{length}`, param);
                }
                errors.push(message);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    validateNumber(value, min, max) {
        const rules = ['number'];
        if (min !== undefined) rules.push(`min:${min}`);
        if (max !== undefined) rules.push(`max:${max}`);
        return this.validate(value, rules);
    }
    
    validateForm(formElement) {
        const fields = formElement.querySelectorAll('[data-validate]');
        const results = {};
        let isValid = true;
        
        fields.forEach(field => {
            const rules = field.dataset.validate.split('|');
            const value = field.value;
            const result = this.validate(value, rules);
            results[field.name || field.id] = result;
            
            if (!result.valid) {
                isValid = false;
                this.showError(field, result.errors[0]);
            } else {
                this.clearError(field);
            }
        });
        
        return { valid: isValid, results };
    }
    
    showError(field, message) {
        field.classList.add('error');
        const errorEl = field.parentElement.querySelector('.form-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        } else {
            const error = document.createElement('div');
            error.className = 'form-error';
            error.textContent = message;
            field.parentElement.appendChild(error);
        }
    }
    
    clearError(field) {
        field.classList.remove('error');
        const errorEl = field.parentElement.querySelector('.form-error');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }
}