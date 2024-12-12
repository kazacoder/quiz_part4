export class Auth {

    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';

    static setTokens(accessToken, refreshToken) {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
}