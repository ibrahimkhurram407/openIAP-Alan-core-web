<script context="module">
    import { UserManager, WebStorageStateStore } from "oidc-client";
    import { getStoreValue, isAuthenticated, user, config, baseurl } from "$lib/stores";
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
     * @returns {Promise<any>}
     */
    export async function loadLocalJWTUser() {
      try {
        const url = getStoreValue(baseurl) + "/jwt";
        const request = await fetch(url);
        if (request.status >= 400) {
          console.error("Failed to load JWT user", request.status);
          return;
        }
        const result = await request.json();
        return result;
      } catch (error) {
        console.error("Error loading JWT user", error);
      }
    }
  
    export async function loadConfig() {
      try {
        const conf = getStoreValue(config);
        if (conf != null && conf.version != null) return;
        
        const url = getStoreValue(baseurl) + "/config";
        const request = await fetch(url);
        if (request.status >= 400) {
          console.error("Failed to load config", request.status);
          return;
        }
        const result = await request.json();
        result.majorversion = result.version;
        const dotCount = result.version.split(".").length - 1;
        if (dotCount == 3) {
          result.majorversion = result.version.substring(0, result.version.lastIndexOf("."));
        }
        console.debug("openiap version", result.version);
        config.set(result);
      } catch (error) {
        console.error("Error loading config", error);
      }
    }
  
    let isAuthenticatedTimer = true;
  
    export const getUser = async () => {
      try {
        const result = await userManager.getUser();
        if (result != null) {
          if (isAuthenticatedTimer) {
            isAuthenticatedTimer = false;
          }
          isAuthenticated.set(true);
          loadConfig();
          user.set(result);
        } else {
          isAuthenticated.set(false);
        }
        return result;
      } catch (error) {
        isAuthenticated.set(false);
        console.error("Error getting user", error);
        throw error;
      }
    };
  </script>
  