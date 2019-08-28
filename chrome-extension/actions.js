// UI event handlers.

function addAccount() {
    try {
        config.accounts.add({
            type: getState(State.AddType),
            name: getState(State.AddName),
            key: getState(State.AddKey),
            secret: getState(State.AddSecret)
        });
        config.save();
        clearState([State.AddName, State.AddKey, State.AddSecret]);
        setState(State.View, View.Main);
        return null;
    } catch (e) {
        return e;
    }
}

function renameAccount(account) {
    const name = prompt("Rename account [" + account.name + "] (no whitespace)", account.name);
    if (name && name.trim() !== account.name) {
        try {
            config.accounts.rename(account.name, name.trim());
            config.save();
            setState(State.View, View.Main);
        } catch (e) {
            alert(e);
        }
    }
}

function deleteAccount(account) {
    if (confirm("Do you really want to delete the account [" + account.name + "] ?")) {
        try {
            config.accounts.remove(account);
            config.save();
            setState(State.View, View.Main);
        } catch (e) {
            alert(e);
        }
    }
}

async function setPassword() {
    if (!getState(State.NewPassword)) {
        setState(State.ErrorSetPassword, "Empty new password");
        return;
    }
    if (getState(State.NewPassword) !== getState(State.RepPassword)) {
        setState(State.ErrorSetPassword, "Password mismatch");
        return;
    }

    try {
        await config.setPassword(getState(State.NewPassword));
        await config.save();
        clearState([State.NewPassword, State.RepPassword]);
        setState(State.View, View.Main);
        alert("A new password has been set successfully.");
    } catch (e) {
        alert(e);
    }
}

async function unlockData() {
    if (!getState(State.Password)) {
        setState(State.ErrorUnlockData, "Empty password");
        return;
    }
    clearState(State.ErrorUnlockData);
    try {
        await config.unlock(config.raw, getState(State.Password));
        clearState(State.Password);
        setState(State.View, View.Main);
    } catch (e) {
        setState(State.ErrorUnlockData, e);
    }
}

async function lockData() {
    if (!config.key) {
        alert("Please set a password to encrypt data first.");
        setState(State.View, View.EncryptData);
        return;
    }
    await config.lock();
    setState(State.View, View.UnlockData);
}

async function importData() {
    if (!getState(State.ImportData)) {
        setState(State.ErrorImportData, "Empty data");
        return;
    }
    clearState(State.ErrorImportData);
    try {
        await config.importData(getState(State.ImportData), getState(State.ImportPassword));
        clearState([State.ImportData, State.ImportPassword]);
        setState(State.View, View.Main);
    } catch (e) {
        setState(State.ErrorImportData, e);
    }
}
