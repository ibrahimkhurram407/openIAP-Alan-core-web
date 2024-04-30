import { writable } from "svelte/store";
import { openiap, config as jsconfig } from "@openiap/jsapi";
jsconfig.settings.DoPing = false;
jsconfig.settings.DoDumpToConsole = false;
jsconfig.settings.doDumpMesssages = false;

export const baseurl = writable("");
baseurl.set(window.location.origin);
if(window.location.origin.includes(":517")) {
    baseurl.set("https://home.openiap.io");
}
export const wsurl = writable("");
wsurl.set(window.location.origin.replace("https://", "wss://").replace("http://", "ws://") + "/ws/v2");
if(window.location.origin.includes(":517")) {
    wsurl.set("wss://home.openiap.io/ws/v2")
}


/** @type {import("svelte/store").Writable<any>} */
export const config = writable({});
export const isAuthenticated = writable(false);
export const isSignedin = writable(false);
/** @type {import("svelte/store").Writable<any>} */
export const user = writable({});
/** @type {import("svelte/store").Writable<openiap>} */
export const client = writable(new openiap(getStoreValue(wsurl), ""));

export const searchQuery = writable("");
export const collections = writable([]);

function createEventStore() {
    const { subscribe, set, update } = writable([]);
  
    return {
      subscribe,
      dispatch: (event) => update(listeners => {
        listeners.forEach(listener => listener(event));
        return listeners;
      }),
      addListener: (listener) => update(listeners => [...listeners, listener]),
      removeListener: (listenerToRemove) => update(listeners => listeners.filter(listener => listener !== listenerToRemove))
    };
  }
  
  export const eventStore = createEventStore();
/**
 * 
 * @returns {any}
 */
  export function getStoreValue(store) {
    let value;
    const unsubscribe = store.subscribe(currentValue => {
      value = currentValue;
    });
    unsubscribe();
    return value;
  }
  