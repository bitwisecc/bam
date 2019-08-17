// Pass extension id and version string to host page on *.bitwise.cc
// by injecting a script tag into <head>.
// This facilitates the testing of alternative implementations which will
// get assigned a random extension id by Chrome.
const id = chrome.runtime.id;
const ver = chrome.runtime.getManifest().version;
const el = document.createElement("script");
el.appendChild(document.createTextNode("BAM=" + JSON.stringify({id, ver})));
document.head.appendChild(el);