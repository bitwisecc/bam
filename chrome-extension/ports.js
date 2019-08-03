var ports = [];

function addPort(port) {
    if (ports.indexOf(port) < 0) {
        ports.push(port);
    }
}

function removePort(port) {
    const i = ports.indexOf(port);
    if (i >= 0) {
        ports.splice(i, 1);
    }
}

function notifyAllPorts(msg, ctx) {
    ports.forEach(port => notifyPort(port, msg, ctx));
}

function notifyPort(port, msg, ctx) {
    if (ctx) {
        msg.context = ctx;
    }
    try {
        port.postMessage(msg);
    } catch (_) {
    }
}
