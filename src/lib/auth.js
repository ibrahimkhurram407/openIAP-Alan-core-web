// import { UserManager, WebStorageStateStore } from "oidc-client";
import pkg from 'oidc-client';
const {UserManager, WebStorageStateStore} = pkg;
import { getStoreValue, isAuthenticated, user, config, baseurl, wsurl } from "$lib/stores";
import { base } from "$app/paths";

import { env } from '$env/dynamic/public'
import { browser } from "$app/environment";

export const load = async ({ url }) => {
    console.log("url", url)
}
export let userManager = null;
if(browser) {
    console.log("origin", window.location.origin)
    const settings = {
        authority: getStoreValue(baseurl) + "/oidc",
        client_id: "webapp",
        redirect_uri: window.location.origin + base + "/",
        response_type: "code",
        scope: "openid profile email",
        post_logout_redirect_uri: window.location.origin + base + "/",
        userStore: new WebStorageStateStore({ store: window.localStorage })
    };
    userManager = new UserManager(settings)
}
export const signIn = () => {
    isAuthenticated.set(false);
    return userManager.signinRedirect();
};
export const signOut = () => {
    isAuthenticated.set(false);
    return userManager.signoutRedirect();
};
/**
 * 
 * @returns {Promise<any>}
 */
export async function loadLocalJWTUser() {
    try {
        let url = getStoreValue(baseurl) + "/jwt"
        const request = await fetch(url);
        if (request.status >= 400) return console.error("Failed to load config", request.status);
        const result = await request.json();
        return result;
    } catch (error) {
    }
}
export async function loadConfig() {
    try {
        const conf = getStoreValue(config);
        if(conf != null && conf.version != null) return;
        let url = getStoreValue(baseurl) + "/config"
        const request = await fetch(url);
        if (request.status >= 400) return console.error("Failed to load config", request.status);
        const result = await request.json();
        result.majorversion = result.version;
        const dotCount = result.version.split(".").length - 1;
        if(dotCount == 3){
            result.majorversion = result.version.substring(0, result.version.lastIndexOf("."));
        }
        console.debug("openiap version", result.version)
        config.set(result);
    } catch (error) {
    }
}
let isAuthenticatedtimer = true;
export const getUser = async () => {
    try {
        const result = await userManager.getUser();
        if(result != null) {
            if(isAuthenticatedtimer) {
                isAuthenticatedtimer = false;
            }                
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

