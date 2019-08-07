const id = chrome.runtime.id;
const ver = chrome.runtime.getManifest().version;
const el = document.createElement("script");
el.appendChild(document.createTextNode("BAM=" + JSON.stringify({id, ver})));
document.head.appendChild(el);