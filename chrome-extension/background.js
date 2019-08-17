// Background script.

// Global config instance.
var config = new Config(() => notifyAllPorts(config.getCensored()));
config.load();

// Enable pop-up on *.bitwise.cc hosts.
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

// Allow host pages to establish a message channel.
chrome.runtime.onConnectExternal.addListener(port => {
    addPort(port);
    port.onDisconnect.addListener(_ => removePort(port));
    port.onMessage.addListener(processMessage.bind(port));
    notifyPort(port, config.getCensored());
});
