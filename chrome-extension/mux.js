// Message router which currently exposes only one interface
// that signs and submits a BitMEX API request.

// Using Symbol as a key to cache encryption key in memory
// to bypass JSON serialization.
const signingKey = Symbol();

var mux = {
    // The "req" action handler signs and relays a BitMEX API request.
    // A valid message is expected to have the following properties:
    // "acc" - account name
    // "method" - http verb (optional, default "GET")
    // "path" - request path after "/api/v1"
    //          By design, the base path and the hostname cannot be customized.
    // "data" - additional data for POST requests (optional)
    //          Non-string values will be JSON-serialized.
    // "headers" - additional headers (optional)
    "req": async msg => {
        // Look up account by name.
        const acc = config.accounts.findByName(msg.acc);
        if (!acc) {
            throw Error("Account not found");
        }

        // Prepare parameters for fetch().
        const method = msg.method || "GET";
        const path = "/api/v1" + msg.path;
        const expires = Math.round(Date.now() / 1000) + 60; // 1 min in the future

        // Prepare request body.
        let data = msg.data || "";
        if (data && !isStr(data)) {
            data = JSON.stringify(data);
        }

        // Prepare request headers.
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

        // Submit request and parse errors.
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

// Process messages from host pages.
// A valid message is expected to be an object with at least
// a string-typed "action" property.
// The only accepted "action" value is "req" at the moment.
// Messages are always processed asynchronously.
// The return value for the host page is a JSON object with either
// an "error" property or a "result" property. It may also
// contain a "status" property for HTTP status code.
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
