import { UserManager, WebStorageStateStore } from 'oidc-client';
import { isAuthenticated, user } from '$lib/stores';

const settings = {
    authority: 'https://home.openiap.io/oidc',
    client_id: 'agent',
    redirect_uri: window.location.origin + '/ui/',
    response_type: 'code',
    scope: 'openid profile email',
    post_logout_redirect_uri: window.location.origin + '/ui/',
    userStore: new WebStorageStateStore({ store: window.localStorage })
};

export const userManager = new UserManager(settings);

userManager.events.addUserLoaded((user) => {
    console.log('User loaded', user);
    // Handle user loading
});

userManager.events.addSilentRenewError((error) => {
    console.error('Silent renew error', error);
});

userManager.events.addAccessTokenExpired(() => {
    console.log('Token expired');
    // Handle token expiration
});


export const signIn = () => {
    isAuthenticated.set(false);
    return userManager.signinRedirect();
};

export const signOut = () => {
    isAuthenticated.set(false);
    return userManager.signoutRedirect();
};

export const getUser = async () => {
    try {
        const result = await userManager.getUser();
        if(result != null) {
            isAuthenticated.set(true);
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

