// A drop-in replacement for MithrilJS with minimum features for pop-up page rendering.

// This is not intended to reimplement MithrilJS or to be reused in other context.
// Its sole purpose is to remove the dependency on MithrilJS prior to v1.2.0
// while making minimum changes to the existing code base.

// To keep the code simple and short, virtual DOM isn't implemented. The DOM tree is
// rebuilt whenever the underlying state changes. No performance hit is perceptible on
// the simple pop-up page.
let m = function(selector) {
    // Parse tag name, class names etc.
    const match = selector.match(/^([a-z]*)((\.[-_a-zA-Z0-9]+)*)(.*)$/);
    const tag = match[1] || "div";
    let cls = (match[2] || "").replace(/\./g, " ");

    // Simple way to detect namespace and create a DOM element accordingly.
    const ns = (tag === "svg" || tag === "path") ? "http://www.w3.org/2000/svg" : "";
    const el = ns ? document.createElementNS(ns, tag) : document.createElement(tag);

    // Parse attributes if found.
    let args = Array.from(arguments).slice(1);
    if (args.length && isObj(args[0])) {
        const attr = args[0];
        for (let k in attr) {
            if (k === "className") {
                cls += attr[k].replace(/\./g, " ");
            } else if (k.startsWith("on")) {
                el.addEventListener(k.substr(2), attr[k]);
            } else if (k === "value") {
                el[k] = attr[k];
            } else {
                el.setAttribute(k, attr[k]);
            }
        }
        args = args.slice(1);
    }
    cls = cls.trim();
    if (cls) {
        el.setAttribute("class", cls);
    }

    // Process additional attributes declared in the selector.
    if (match[4]) {
        match[4].match(/\[[^\]]+\]/g).forEach(s => {
            const kv = s.match(/\[([^=]+)=.(.+).\]/);
            el.setAttribute(kv[1], kv[2]);
        });
    }

    // Recursively add child elements.
    addChildren(el, args);

    return el;
};

function addChildren(el, args) {
    args.forEach(arg => {
        if (arg === null || arg === undefined) {
        } else if (typeof arg === "string") {
            el.appendChild(document.createTextNode(arg));
        } else if (Array.isArray(arg)) {
            addChildren(el, arg);
        } else {
            el.appendChild(arg);
        }
    });
}

m.mount = function(root, component) {
    m._root = root;
    m._component = component;
    m.redraw();
};

m.redraw = function() {
    if (m._component) {
        let node = m._component.view();
        if (m._old) {
            m._root.removeChild(m._old);
        }
        m._root.appendChild(node);
        m._old = node;    
    }
};
