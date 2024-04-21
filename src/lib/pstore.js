import { writable } from 'svelte/store';

// Cache object to hold the instances of the stores
const storeCache = {};


export function deleteSetting(page, key) {
    const fullKey = `${page}-${key}`;
    localStorage.removeItem("store_" + fullKey);
    storeCache[fullKey] = null;
}
export function deleteSettings(page) {
    for(let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if(key.startsWith("store_" + page)) {
            localStorage.removeItem(key);
        }
    }
}
export function deleteAllSettings() {
    console.log("Deleting all settings");
    for(let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if(key.startsWith("store_")) {
            console.log("Deleting " + key);
            localStorage.removeItem(key);
        }
    }
}

/**
 * 
 * @param {string} page Page this setting belongs to
 * @param {string} key Settings key
 * @param {any} defaultValue Default value if not set
 * @returns {import('svelte/store').Writable<any>}Writeable store
 */
export function setting(page, key, defaultValue) {
    const fullKey = `${page}-${key}`; // Unique key for each part of the app

    // Return the existing store if it has already been created
    if (storeCache[fullKey]) {
        return storeCache[fullKey];
    }

    const storedValue = localStorage.getItem("store_" + fullKey);
    const initialData = storedValue ? JSON.parse(storedValue) : defaultValue;

    // Create a new writable store
    const store = writable(initialData);

    store.subscribe(value => {
        if(value == null || value == "") {
            deleteSetting(page, key);
        } else {
            if(value instanceof Object) {
                var keys = Object.keys(value);
                if(keys.length == 0) {
                    deleteSetting(page, key);
                    return;
                }
            }
            localStorage.setItem("store_" + fullKey, JSON.stringify(value));
        }
    });

    // Cache the store instance for future use
    storeCache[fullKey] = store;
    return store;
}
