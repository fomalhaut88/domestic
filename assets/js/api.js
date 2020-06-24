import axios from 'axios';


const API_BASE_URL = 'https://hashstorage.fomalhaut.su/api/v1/';


export default class Api {
    constructor() {
        this._auth = null;

        this._http = axios.create({
            baseURL: API_BASE_URL,
        });
    }

    init(auth) {
        this._auth = auth;
    }

    list(callback) {
        this._http.post("list", {
            public_key: this._auth.publicKey,
            data_group: "",
        }).then(response => {
            var data = response.data.map(item => this._extractData(item));
            callback(data);
        });
    }

    get(key, callback, callbackError) {
        this._http.post("get", {
            public_key: this._auth.publicKey,
            data_group: "",
            data_key: key,
        }).then(response => {
            var data = this._extractData(response.data);
            callback(data);
        }, response => {
            if (callbackError) {
                callbackError(response);
            } else {
                throw new Error("Failed to get block.");
            }
        });
    }

    save(key, data, callback, callbackError) {
        var handler = (secret, callback, callbackError) => {
            var block = this._auth.encrypt(data);
            var signature = this._auth.buildSignature(key, block);
            var secretSignature = secret ? this._auth.buildSecretSignature(secret) : "";

            this._http.post("save", {
                public_key: this._auth.publicKey,
                data_group: "",
                data_key: key,
                data_block: block,
                data_version: "",
                signature: signature,
                secret_signature: secretSignature,
            }).then(response => {
                if (callback) {
                    callback();
                }
            }, response => {
                if (callbackError) {
                    callbackError(response);
                } else {
                    throw new Error("Failed to save block.");
                }
            });
        };

        this._http.post("get", {
            public_key: this._auth.publicKey,
            data_group: "",
            data_key: key,
        }).then(response => {
            handler(response.data.secret, callback, callbackError);
        }, response => {
            handler("", callback, callbackError);
        });
    }

    delete(key, callback, callbackError) {
        this._http.post("get", {
            public_key: this._auth.publicKey,
            data_group: "",
            data_key: key,
        }).then(response => {
            var secret = response.data.secret;
            var secretSignature = this._auth.buildSecretSignature(secret);

            this._http.post("delete", {
                public_key: this._auth.publicKey,
                data_group: "",
                data_key: key,
                secret_signature: secretSignature,
            }).then(response => {
                if (response.data.success) {
                    if (callback) {
                        callback();
                    }
                } else {
                    if (callbackError) {
                        callbackError(response);
                    } else {
                        throw new Error("Failed to delete block.");
                    }
                }
            }, response => {
                if (callbackError) {
                    callbackError(response);
                } else {
                    throw new Error("Failed to delete block.");
                }
            });
        }, response => {
            if (callbackError) {
                callbackError(response);
            } else {
                throw new Error("Failed to delete block.");
            }
        });
    }

    _extractData(item) {
        var block = item.data_block;
        if (this._auth.checkSignature(item.data_key, block, item.signature)) {
            var data = this._auth.decrypt(block);
            return { key: item.data_key, data: data };
        } else {
            throw new Error("Invalid signature.");
        }
    }
}
