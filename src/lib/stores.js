import { writable } from 'svelte/store';
import { openiap, config as jsconfig } from '@openiap/jsapi';
jsconfig.settings.DoPing = false;
jsconfig.settings.DoDumpToConsole = false;
jsconfig.settings.doDumpMesssages = false;

/** @type {import('svelte/store').Writable<any>} */
export const config = writable({});
export const isAuthenticated = writable(false);
export const isSignedin = writable(false);
/** @type {import('svelte/store').Writable<any>} */
export const user = writable({});
/** @type {import('svelte/store').Writable<openiap>} */
export const client = writable(new openiap("wss://home.openiap.io/ws/v2", ""));

// export const searchItems = writable([]);
// export const filteredsearchItems = writable([]);
// export const searchFields = writable(["title"]);
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