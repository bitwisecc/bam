const signingKey = Symbol();

var mux = {
    "req": async msg => {
        const acc = config.accounts.findByName(msg.acc);
        if (!acc) {
            throw Error("Account not found");
        }
        const method = msg.method || "GET";
        const path = "/api/v1" + msg.path;
        const expires = Math.round(Date.now() / 1000) + 60; // 1 min in the future
        let data = msg.data || "";
        if (data && !isStr(data)) {
            data = JSON.stringify(data);
        }
        if (!acc[signingKey]) {
            acc[signingKey] = await importKeyForSigning(acc.secret);
        }
        const sig = await signHMAC(acc[signingKey], method + path + expires + data);
        const headers = new Headers();
        if (msg.headers) {
            for (let k in msg.headers) {
                headers.set(k, msg.headers[k]);
            }
        }
        headers.set("content-type", "application/json");
        headers.set("accept", "application/json");
        headers.set("api-expires", expires);
        headers.set("api-key", acc.key);
        headers.set("api-signature", sig);
        let opt = {method, headers, cache: "no-store"};
        if (data) {
            opt.body = data;
        }
        const url = Accounts.getHost(acc) + path;

        let r;
        try {
            r = await fetch(url, opt);
            const j = await r.json();
            if (isObj(j) && j.error) {
                throw Error(isObj(j.error) ? j.error.message : j.error);
            }
            return {result: j, status: r.status};
        } catch (e) {
            if (isErr(e) && r && r.status) {
                e.status = r.status;
            }
            throw e;
        }
    }
};

async function processMessage(msg) {
    let res, err;
    if (!isObj(msg)) {
        err = "invalid message";
    } else {
        const fn = mux[msg.action];
        if (typeof fn === "function") {
            try {
                res = await fn(msg);
            } catch (e) {
                err = e;
            }
        } else {
            err = "invalid action";
        }
    }

    if (err) {
        res = {error: isErr(err) ? err.message : (err + "")};
        if (isErr(err) && err.status) {
            res.status = err.status;
        }
    }
    if (res) {
        notifyPort(this, res, msg);
    }
}
