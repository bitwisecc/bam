function isObj(v) {
    return Object.prototype.toString.call(v) === "[object Object]";
}

function isStr(v) {
    return typeof v === "string";
}

function isErr(v) {
    return v instanceof Error;
}

function assert(p, e) {
    if (!p) {
        throw e;
    }
}

function assertObj(v, e) {
    if (!isObj(v)) {
        throw e;
    }
}

function assertArr(v, e) {
    if (!Array.isArray(v)) {
        throw e;
    }
}
