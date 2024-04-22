import { UserManager, WebStorageStateStore } from 'oidc-client';
import { isAuthenticated, user, config } from '$lib/stores';
import { base } from '$app/paths';
const settings = {
    authority: 'https://home.openiap.io/oidc',
    client_id: 'webapp',
    redirect_uri: window.location.origin + base + '/',
    response_type: 'code',
    scope: 'openid profile email',
    post_logout_redirect_uri: window.location.origin + base + '/',
    userStore: new WebStorageStateStore({ store: window.localStorage })
};

export const userManager = new UserManager(settings);

userManager.events.addUserLoaded((user) => {
    // console.debug('User loaded', user);
});

userManager.events.addSilentRenewError((error) => {
    console.error('Silent renew error', error);
});

userManager.events.addAccessTokenExpired(() => {
    // console.debug('Token expired');
});

export const signIn = () => {
    isAuthenticated.set(false);
    return userManager.signinRedirect();
};

export const signOut = () => {
    isAuthenticated.set(false);
    return userManager.signoutRedirect();
};

async function loadConfig() {
    try {
        let url = "/config"
        if(window.location.origin.includes("5173")) {
            url = "https://home.openiap.io/config"
        }
        const request = await fetch(url);
        if (request.status >= 400) return console.error("Failed to load config", request.status);
        const result = await request.json();
        result.majorversion = result.version;
        const dotCount = result.version.split('.').length - 1;
        if(dotCount == 3){
            result.majorversion = result.version.substring(0, result.version.lastIndexOf('.'));
        }
        console.debug("openiap version", result.version)
        config.set(result);
    } catch (error) {
    }
}

export const getUser = async () => {
    try {
        const result = await userManager.getUser();
        if(result != null) {
            isAuthenticated.set(true);
            loadConfig();
            user.set(result);
        } else {
            isAuthenticated.set(false);
        }
        return result
    } catch (error) {
        isAuthenticated.set(false);
        throw error;
    }
};

