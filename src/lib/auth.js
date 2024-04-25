import { UserManager, WebStorageStateStore } from "oidc-client";
import { getStoreValue, isAuthenticated, user, config, baseurl, wsurl } from "$lib/stores";
import { base } from "$app/paths";

const settings = {
    authority: getStoreValue(baseurl) + "/oidc",
    client_id: "webapp",
    redirect_uri: window.location.origin + base + "/",
    response_type: "code",
    scope: "openid profile email",
    post_logout_redirect_uri: window.location.origin + base + "/",
    userStore: new WebStorageStateStore({ store: window.localStorage })
};
// console.debug("baseurl", getStoreValue(baseurl));
// console.debug("wsurl", getStoreValue(wsurl));
// console.debug("settings", settings);

export const userManager = new UserManager(settings);
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
// console.time("isAuthenticated");
export const getUser = async () => {
    try {
        const result = await userManager.getUser();
        if(result != null) {
            if(isAuthenticatedtimer) {
                isAuthenticatedtimer = false;
                // console.timeEnd("isAuthenticated");
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

