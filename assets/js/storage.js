// Storage Module - LocalStorage Management
export class Storage {
    constructor() {
        this.prefix = 'finbiz_';
        this.encryption = false;
    }
    
    getKey(key) {
        return this.prefix + key;
    }
    
    save(key, data) {
        try {
            const json = JSON.stringify(data);
            localStorage.setItem(this.getKey(key), json);
            return true;
        } catch (error) {
            console.error(`Failed to save "${key}":`, error);
            return false;
        }
    }
    
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.getKey(key));
            if (!data) return defaultValue;
            return JSON.parse(data);
        } catch (error) {
            console.error(`Failed to load "${key}":`, error);
            return defaultValue;
        }
    }
    
    remove(key) {
        try {
            localStorage.removeItem(this.getKey(key));
            return true;
        } catch (error) {
            console.error(`Failed to remove "${key}":`, error);
            return false;
        }
    }
    
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }
    
    getAll() {
        const result = {};
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    const realKey = key.replace(this.prefix, '');
                    result[realKey] = JSON.parse(localStorage.getItem(key));
                }
            });
        } catch (error) {
            console.error('Failed to get all data:', error);
        }
        return result;
    }
    
    getSize() {
        let size = 0;
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    size += localStorage.getItem(key).length;
                }
            });
        } catch (error) {
            console.error('Failed to get size:', error);
        }
        return size;
    }
    
    exportData() {
        return {
            data: this.getAll(),
            timestamp: Date.now(),
            version: '2.0',
            exportedBy: 'Financial Business Management System'
        };
    }
    
    importData(data) {
        try {
            if (!data || !data.data) return false;
            
            for (const [key, value] of Object.entries(data.data)) {
                this.save(key, value);
            }
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}