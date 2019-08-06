export class User {
    constructor(
        public userId: number,
        public username: string,
        public firstName: string,
        public lastName: string,
        public email: string,
        private _token: string,
        private _tokenExpirationDate: number
    ) {}

    get token() {
        if (!this._tokenExpirationDate || new Date(this._tokenExpirationDate).getTime() < new Date().getTime()) {
            return null;
        }
        return this._token;
    }

    set token(token: string) {
        this._token = token;
    }

    set tokenExpiration(expirationDate: number) {
        this._tokenExpirationDate = expirationDate;
    }

    get tokenExpiration() {
        if (!this.token) {
            return 0;
        }
        return new Date(this._tokenExpirationDate).getTime() - new Date().getTime();
    }
}
