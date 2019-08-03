class Accounts {
    static types = ["bitmex", "bitmex-testnet"];

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

    static validateName(name) {
        assert(isStr(name) && /^\S{1,32}$/.test(name),
            Error("Invalid account name"));
    }

    static validateKey(key) {
        assert(isStr(key) && /^\w{24}$/.test(key),
            Error("Invalid API key"));
    }

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