// Accounts represents a list of API accounts.
class Accounts {
    // BitMEX and its testnet are the only account types currently supported.
    static types = ["bitmex", "bitmex-testnet"];

    // API host names.
    static hosts = {
        "bitmex": "https://www.bitmex.com",
        "bitmex-testnet": "https://testnet.bitmex.com"
    };

    constructor(data) {
        this.data = data || [];
    }

    reset() {
        this.data = [];
    }

    add(account) {
        this.validateNewAccount(account);
        this.data.push(account);
    }

    rename(from, to) {
        Accounts.validateName(to);
        let account;
        this.data.forEach(x => {
            if (x.name === from) {
                account = x;
            } else if (x.name === to) {
                throw Error("Account name already in use");
            }
        });
        if (!account) {
            throw Error("Account not found");
        }
        account.name = to;
    }

    remove(account) {
        const i = this.data.indexOf(account);
        if (i < 0) {
            throw Error("Account not found");
        }
        this.data.splice(i, 1);
    }

    findByName(name) {
        return this.data.find(a => a.name === name);
    }

    // A new account is valid if all four properties are valid:
    // account type, name, API key, and API secret.
    validateNewAccount(account) {
        assertObj(account, Error("Invalid account format"));
        assert(Accounts.types.indexOf(account.type) >= 0,
            Error("Invalid account type"));
        Accounts.validateName(account.name);
        assert(!this.data.find(x => x.name === account.name),
            Error("Account name already in use"));
        Accounts.validateKey(account.key);
        assert(!this.data.find(x => x.key === account.key),
            Error("API key already in use"));
        Accounts.validateSecret(account.secret);
    }

    static getHost(account) {
        return Accounts.hosts[account.type];
    }

    // A name must contain 1 to 32 non-whitespace characters.
    static validateName(name) {
        assert(isStr(name) && /^\S{1,32}$/.test(name),
            Error("Invalid account name"));
    }

    // A BitMEX API key must contain 24 valid characters.
    static validateKey(key) {
        assert(isStr(key) && /^[-_0-9A-Za-z]{24}$/.test(key),
            Error("Invalid API key"));
    }

    // A BitMEX API secret must contain 48 valid characters.
    static validateSecret(secret) {
        assert(isStr(secret) && /^[-_0-9A-Za-z]{48}$/.test(secret),
            Error("Invalid API secret"));
    }

    static parse(accounts) {
        assertArr(accounts, Error("Invalid format"));
        let res = new Accounts();
        accounts.forEach(account => res.add(account));
        return res;
    }
}