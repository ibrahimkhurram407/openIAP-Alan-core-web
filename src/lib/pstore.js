export const ssr = false;
import { writable } from "svelte/store";
import { browser } from "$app/environment";

// Cache object to hold the instances of the stores
const storeCache = {};

export function deleteSetting(page, key) {
  const fullKey = `${page}-${key}`;
  if (storeCache[fullKey]) {
    storeCache[fullKey].set(null);
  }
  if(browser) localStorage.removeItem("store_" + fullKey);
}
export function deleteSettings(page) {
  if(!browser) return;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key.startsWith("store_" + page)) {
      if (storeCache[key.substring(6)]) {
        storeCache[key.substring(6)].set(null);
      }
      localStorage.removeItem(key);
    }
  }
}
export function deleteAllSettings() {
  if(!browser) return;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key.startsWith("store_")) {
      if (storeCache[key.substring(6)]) {
        storeCache[key.substring(6)].set(null);
      }
      localStorage.removeItem(key);
    }
  }
}
function getStoreValue(store) {
  let value;
  const unsubscribe = store.subscribe(currentValue => {
    value = currentValue;
  });
  unsubscribe();
  return value;
}

export function setSetting(page, key, value) {
  const _setting = setting(page, key, value);
  // @ts-ignore
  const id = _setting.id;
  _setting.set(value);
}

/**
 * 
 * @param {string} page Page this setting belongs to
 * @param {string} key Settings key
 * @param {any} defaultValue Default value if not set
 * @returns {import("svelte/store").Writable<any>}Writeable store
 */
export function setting(page, key, defaultValue) {
  const fullKey = `${page}-${key}`; // Unique key for each part of the app

  let json2 = null;
  try {
    json2 = JSON.stringify(defaultValue);
  } catch (error) {
  }


  // Return the existing store if it has already been created
  if (storeCache[fullKey]) {
    return storeCache[fullKey];
  }

  const unique = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  let initialData = defaultValue;
  if(browser) {
    const storedValue = localStorage.getItem("store_" + fullKey);
    initialData = storedValue ? JSON.parse(storedValue) : defaultValue;
  }

  // Create a new writable store
  const store = writable(initialData);
  // @ts-ignore
  store.id = unique;

  store.subscribe(value => {
    let json1, jsonsuccess;
    try {
      json1 = JSON.stringify(value);
      jsonsuccess = true;
    } catch (error) {
      jsonsuccess = false;
    }
    if (value == null || value == "") {
      if(browser) localStorage.removeItem("store_" + fullKey);
    } else if (jsonsuccess && json1 == json2) {
      if(browser) localStorage.removeItem("store_" + fullKey);
    } else {
      if (value instanceof Object) {
        var keys = Object.keys(value);
        if (keys.length == 0) {
          if(browser) localStorage.removeItem("store_" + fullKey);
          return;
        }
      }
      if(browser) localStorage.setItem("store_" + fullKey, JSON.stringify(value));
    }
  });

  // Cache the store instance for future use
  storeCache[fullKey] = store;
  return store;
}
