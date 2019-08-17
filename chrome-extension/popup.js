// Pop-up UI for account management.

let maskedKey = s => s.replace(/./g, (c, i) => i < 12 ? c : "*");
let noWhitespace = s => s.replace(/\s/g, "");

// App is a Mithril UI component to be mounted to document.body.
let App = {
    view() {
        return m(".main",
            m(".header",
                m(".title", "Bitwise Account Manager"),
                m("svg.sep[viewBox='0 0 8 8'][xmlns='http://www.w3.org/2000/svg']",
                    m("path[fill='#1e1e1e'][d='M7,-2L9,-2L9,10,L1,10Z']")
                ),
                m(".content", chrome.runtime.getManifest().version),
                m("svg.shl[viewBox='0 0 16 8'][xmlns='http://www.w3.org/2000/svg']",
                    m("path[fill='#1e1e1e'][d='M-1,-2L6,-2L3,4L6,10L8,10L5,4L8,-2L10,-2L7,4L10,10L12,10L9,4L12,-2L14,-2L11,4L14,10L-1,10Z']")
                )
            ),
            this.accountsVisible() ? this.renderAccounts() : null,
            this.renderForm()
        );
    },

    renderChoices(choices, chosen, onchange) {
        return choices.map(choice => choice === chosen ?
            m(".chosen", "[•] " + choice) :
            m(".link", {onclick: _ => onchange(choice)}, "[ ] " + choice));
    },

    accountsVisible() {
        const v = getState(State.View);
        return v === View.Main || v === View.AddAccount;
    },

    renderAccounts() {
        return m(".section",
            m(".p", "Accounts: " + config.accounts.data.length, config.key ? " (encrypted)" : " (not encrypted)"),
            config.accounts.data.map(account =>
                m(".p",
                    m(".name",
                        m("span.link", {onclick: () => renameAccount(account)}, "[ " + account.name + " ]"), " ",
                        m("span.type", account.type)
                    ),
                    m(".key",
                        maskedKey(account.key), " ",
                        m("span.link.risky", {onclick: () => deleteAccount(account)}, "[×]")
                    )
                )
            )
        );
    },

    renderForm() {
        switch (getState(State.View)) {
            case View.Main:
                return this.renderMainForm();
            case View.AddAccount:
                return this.renderAddAccountForm();
            case View.EncryptData:
                return this.renderEncryptDataForm();
            case View.UnlockData:
                return this.renderUnlockDataForm();
            case View.ExportData:
                return this.renderExportDataForm();
            case View.ImportData:
                return this.renderImportDataForm();
        }
    },

    links: [
        ["ADD ACCOUNT", View.AddAccount],
        ["ENCRYPT DATA", View.EncryptData],
        ["EXPORT DATA", View.ExportData],
        ["IMPORT DATA", View.ImportData],
    ],

    renderMainForm() {
        return m(".section",
            App.links.map(link => m(".p",
                m("span.link", {onclick: () => setState(State.View, link[1])}, "[ " + link[0] + " ]"))),
            m(".p", m("span.link", {onclick: lockData}, "[ LOCK DATA ]"))
        );
    },

    renderAddAccountForm() {
        return m(".section",
            this.renderFormHeader("Add a new account:", [State.AddType, State.AddName, State.AddKey, State.AddSecret, State.ErrorAddAccount]),
            m(".p", this.renderChoices(Accounts.types, getState(State.AddType),
                v => setState(State.AddType, v))),
            m(".p",
                m("input.text", {
                    placeholder: "Enter account name (no whitespace)",
                    spellcheck: false,
                    maxlength: 32,
                    value: getState(State.AddName),
                    oninput: ev => setState(State.AddName, noWhitespace(ev.target.value))
                })
            ),
            m(".p",
                m("input.text", {
                    placeholder: "Enter API key",
                    spellcheck: false,
                    value: getState(State.AddKey),
                    oninput: ev => setState(State.AddKey, noWhitespace(ev.target.value))
                })
            ),
            m(".p",
                m("input.text", {
                    placeholder: "Enter API secret",
                    type: "password",
                    value: getState(State.AddSecret),
                    oninput: ev => setState(State.AddSecret, noWhitespace(ev.target.value))
                })
            ),
            m(".p",
                m("span.link", {onclick: () => setState(State.ErrorAddAccount, addAccount())}, "[ OK ]"), " ",
                this.renderError(State.ErrorAddAccount)
            )
        );
    },

    renderEncryptDataForm() {
        return m(".section",
            this.renderFormHeader("Encrypt data:", [State.NewPassword, State.RepPassword, State.ErrorSetPassword]),
            m(".p",
                m("input.text", {
                    placeholder: "Enter new password",
                    type: "password",
                    value: getState(State.NewPassword),
                    oninput: ev => setState(State.NewPassword, ev.target.value)
                })
            ),
            m(".p",
                m("input.text", {
                    placeholder: "Repeat new password",
                    type: "password",
                    value: getState(State.RepPassword),
                    oninput: ev => setState(State.RepPassword, ev.target.value)
                })
            ),
            m(".p",
                m("span.link", {onclick: setPassword}, "[ OK ]"),
                this.renderError(State.ErrorSetPassword)
            )
        );
    },

    renderUnlockDataForm() {
        return m(".section",
            this.renderFormHeader("Unlock data:"),
            m(".p",
                m("input.text", {
                    placeholder: "Enter password",
                    type: "password",
                    autofocus: true,
                    value: getState(State.Password),
                    oninput: ev => setState(State.Password, ev.target.value),
                    onkeydown: ev => {
                        if (ev.keyCode === 13) {
                            ev.preventDefault();
                            unlockData();
                        }
                    }
                })
            ),
            m(".p",
                m("span.link", {onclick: unlockData}, "[ OK ]"),
                this.renderError(State.ErrorUnlockData)
            )
        );
    },

    renderExportDataForm() {
        return m(".section",
            this.renderFormHeader("Export data:" + (config.key ? " (encrypted)" : " (not encrypted)"), [State.CopiedToClipboard]),
            m(".p",
                m("textarea.export", {
                    readonly: true,
                    value: config.exportData(),
                    onclick: ev => {
                        ev.target.select();
                        document.execCommand("copy");
                        setState(State.CopiedToClipboard, true);
                    }
                })
            ),
            m(".p",
                m("span.link", {onclick: () => (clearState(State.CopiedToClipboard), setState(State.View, View.Main))}, "[ OK ]"),
                getState(State.CopiedToClipboard) ?
                m("span", " Copied to clipboard") : null
            )
        );
    },

    renderImportDataForm() {
        return m(".section",
            this.renderFormHeader("Import data:", [State.ImportData, State.ImportPassword, State.ErrorImportData]),
            m(".p",
                m("textarea.import", {
                    placeholder: "Enter encoded data",
                    spellcheck: false,
                    value: getState(State.ImportData),
                    oninput: ev => setState(State.ImportData, ev.target.value)
                })
            ),
            m(".p",
                m("input.text", {
                    placeholder: "Enter password",
                    type: "password",
                    value: getState(State.ImportPassword),
                    oninput: ev => setState(State.ImportPassword, ev.target.value)
                })
            ),
            m(".p",
                m("span.link", {onclick: importData}, "[ OK ]"),
                this.renderError(State.ErrorImportData)
            )
        );
    },

    renderFormHeader(text, fields) {
        return fields ? m(".p", text, " ",
            m("span.link", {onclick: () => (clearState(fields), setState(State.View, View.Main))}, "[×]")) :
            m(".p", text);
    },

    renderError(k) {
        const e = getState(k);
        return e ? m("span.error", " " + e) : null;
    }
};

m.mount(document.body, App);