import { writable } from 'svelte/store';

// Cache object to hold the instances of the stores
const storeCache = {};

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

    const storedValue = localStorage.getItem(fullKey);
    const initialData = storedValue ? JSON.parse(storedValue) : defaultValue;

    // Create a new writable store
    const store = writable(initialData);

    store.subscribe(value => {
        localStorage.setItem(fullKey, JSON.stringify(value));
    });

    // Cache the store instance for future use
    storeCache[fullKey] = store;

    return store;
}
