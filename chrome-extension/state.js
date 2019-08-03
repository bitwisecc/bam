let config;
let state = {};

const View = {
    Loading: 0,
    UnlockData: 1,
    Main: 2,
    AddAccount: 3,
    EncryptData: 4,
    ExportData: 5,
    ImportData: 6,
};

const State = {
    View: "view",
    AddType: "addType",
    AddName: "addName",
    AddKey: "addKey",
    AddSecret: "addSecret",
    ImportData: "importData",

    Password: Symbol(),
    NewPassword: Symbol(),
    RepPassword: Symbol(),    
    ImportPassword: Symbol(),
    CopiedToClipboard: Symbol(),
    ErrorAddAccount: Symbol(),
    ErrorSetPassword: Symbol(),
    ErrorUnlockData: Symbol(),
    ErrorImportData: Symbol(),
};

const Defaults = {
    [State.View]: View.Loading,
    [State.AddType]: Accounts.types[0],
};

function getState(key) {
    return state[key] || Defaults[key] || "";
}

function setState(key, value) {
    state[key] = value;
    saveState();
    m.redraw();
}

function clearState(key) {
    if (Array.isArray(key)) {
        key.forEach(k => delete state[k]);
    } else {
        delete state[key];
    }
    saveState();
    m.redraw();
}

let lastState;

function saveState() {
    const payload = JSON.stringify(state);
    if (payload !== lastState) {
        lastState = payload;
        chrome.storage.sync.set({state: payload});
    }
}

function loadState() {
    chrome.storage.sync.get("state", data => {
        try {
            const obj = JSON.parse(data.state);
            if (isObj(obj)) {
                state = obj;
                m.redraw();
            }
        } catch (_) {
            setState(State.View, View.Main);
        }
    });
}

function loadConfig() {
    chrome.runtime.getBackgroundPage(bg => {
        config = bg.config;
        if (config.locked) {
            setState(State.View, View.UnlockData);
        } else {
            loadState();
        }
    });
}

loadConfig();
