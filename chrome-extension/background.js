var config = new Config(() => notifyAllPorts(config.getCensored()));
config.load();

chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostSuffix: ".bitwise.cc"},
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
});

chrome.runtime.onConnectExternal.addListener(port => {
    addPort(port);
    port.onDisconnect.addListener(_ => removePort(port));
    port.onMessage.addListener(processMessage.bind(port));
    notifyPort(port, config.getCensored());
});
