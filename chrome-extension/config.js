// Config class encapsulates account data and the encryption state.
class Config {
    constructor(onchange) {
        this.onchange = onchange;
        this.accounts = new Accounts();
        this.loaded = false;
        this.locked = false;
        this.key = null;
        this.raw = "";
    }

    // Serialized data are either hex-encoded (with encryption)
    // or JSON-encoded (unencrypted).
    async load() {
        chrome.storage.sync.get("config", data => {
            const raw = data.config;
            this.locked = isHexEncoded(raw);
            this.key = null;
            this.loaded = true;
            if (this.locked) {
                this.raw = raw;
            } else {
                try {
                    this.parse(raw);
                } catch (_) {
                }
            }
            this.onchange();
        });
    }

    async save() {
        this.onchange();
        const raw = JSON.stringify({accounts: this.accounts.data});
        if (this.key) {
            try {
                this.raw = await encrypt(raw, this.key);
                chrome.storage.sync.set({config: this.raw});
            } catch (_) {
            }
        } else {
            this.raw = raw;
            chrome.storage.sync.set({config: raw});
        }
    }

    // Remove API secrets before sharing non-sensitive data
    // with the host page.
    getCensored() {
        var accounts = this.accounts.data.map(account => ({
            name: account.name,
            type: account.type,
            key: account.key
        }));
        return {accounts, locked: this.locked};
    }

    parse(raw) {
        try {
            this.accounts = Accounts.parse(JSON.parse(raw).accounts);
            this.raw = raw;
            this.onchange();
        } catch (_) {
            throw Error("Corrupted data");
        }
    }

    exportData() {
        return this.raw;
    }

    async importData(raw, password) {
        raw = raw.trim();
        if (isHexEncoded(raw)) {
            await this.unlock(raw, password);
        } else {
            this.parse(raw);
            this.key = null;
        }
        this.save();
    }

    async setPassword(password) {
        this.key = password ? await importKeyForDerivation(password) : null;
        await this.save();
    }

    async unlock(raw, password) {
        const decrypted = await decrypt(raw, password);
        try {
            const obj = JSON.parse(decrypted[0]);
            this.accounts = Accounts.parse(obj.accounts);
            this.raw = raw;
            this.key = decrypted[1];
            this.locked = false;
            this.onchange();
        } catch (_) {
            throw Error("Corrupted data");
        }
    }

    lock() {
        this.accounts.reset();
        this.key = null;
        this.locked = true;
        this.onchange();
    }
}