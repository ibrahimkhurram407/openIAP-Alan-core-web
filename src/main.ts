import { createApp } from 'vue'
import App from './App.vue'
import configureRouter from './router'
import store from './store'
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
import { vue3Debounce } from 'vue-debounce'
import { createOidcAuth, SignInType, LogLevel } from 'vue-oidc-client/vue3'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css' 
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
const vuetify = createVuetify({
    components,
    directives,
  })
  

const loco = window.location;
const appRootUrl = loco.protocol + '//' + loco.host + (process.env.NODE_ENV === 'production' ? '/ui/' : '/');
async function configureOidc() {
    var res = await fetch((process.env.NODE_ENV === 'production' ? '/ui/' : '/') + "config.json");
    const data = await res.json();
    return createOidcAuth(
        'main',
        SignInType.Window,
        appRootUrl,
        {
            authority: (process.env.NODE_ENV === 'production' ? '/oidc/' : data.VUE_APP_AUTHORITY) ,
            client_id: data.VUE_APP_CLIENT_ID,
            response_type: data.VUE_APP_RESPONSE_TYPE,
            scope: 'openid profile email',
            prompt: data.VUE_APP_PROMPT
        },
        console,
        // LogLevel.Debug
        LogLevel.Warn
    );
}
void (async function () {
    const idsrvAuth = await configureOidc()
    const router = await configureRouter(idsrvAuth)
    idsrvAuth.useRouter(router)

    var ok = await idsrvAuth.startup();
    if (!ok) {
        console.error('idsrvAuth startup was not ok')
    }
    const app = createApp(App).use(store).use(router)
    // a little something extra
    store.dispatch('loadStoredState')
    app.config.globalProperties.$oidc = idsrvAuth
    app.use(vuetify);
    app.component('EasyDataTable', Vue3EasyDataTable)
    app.directive('debounce', vue3Debounce({ lock: true }));
    app.use(require('@skadefro/vue-shortkey'))

    app.mount('#app')

    app.config.globalProperties.$filters = {
        str_limit(value, size) {
            if (!value) return '';
            value = value.toString();

            if (value.length <= size) {
                return value;
        }
            return value.substr(0, size) + '...';
        }
    }


})()
