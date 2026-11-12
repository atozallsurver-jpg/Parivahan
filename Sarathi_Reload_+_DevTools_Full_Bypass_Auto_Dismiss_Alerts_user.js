// ==UserScript==
// @name         Sarathi Reload + DevTools Full Bypass (Auto-Dismiss Alerts)
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Block reload alerts, DevTools alerts, debugger traps, and auto-dismiss popups on Sarathi portal
// @match        https://sarathi.parivahan.gov.in/sarathiservice/instruction.do*
// @match        https://p4points.me/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- 1️⃣ Fake fresh navigation ---
    Object.defineProperty(performance, "getEntriesByType", {
        value: function(type) {
            if (type === "navigation") {
                return [{ type: "navigate" }];
            }
            return [];
        },
        configurable: false,
        writable: false
    });

    // --- 2️⃣ Replace alert() with safe handler ---
    const originalAlert = window.alert;
    window.alert = function(msg) {
        if (!msg) return;

        const text = msg.toString().toLowerCase();

        if (text.includes("reload detected") ||
            text.includes("all operations will be terminated") ||
            text.includes("debugger") ||
            text.includes("inspection detected") ||
            text.includes("developer tools") ||
            text.includes("refresh") ||
            text.includes("reload")) {
            console.log("⚠ Blocked security alert:", msg);
            return;
        }

        // Auto-dismiss everything else silently
        console.log("ℹ Auto-dismissed alert:", msg);
        return; // No popup shown
    };

    // --- 3️⃣ Block confirm dialogs ---
    window.confirm = function(msg) {
        console.log("⚠ Blocked confirm dialog:", msg);
        return true; // Always return true to prevent blocking
    };

    // --- 4️⃣ Block beforeunload events (prevents reload/exit warnings) ---
    window.onbeforeunload = null;
    window.addEventListener('beforeunload', function(e) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        return null;
    }, true);

    // --- 5️⃣ Prevent forced tab/window close ---
    window.close = function() {
        console.log("⚠ Prevented window.close()");
        return null;
    };

    // --- 6️⃣ Kill debugger traps ---
    const handler = {
        apply: function(target, thisArg, args) {
            if (args && args[0] && args[0].toString().includes("debugger")) {
                console.log("⚠ Blocked debugger eval");
                return null;
            }
            return Reflect.apply(target, thisArg, args);
        }
    };
    window.eval = new Proxy(window.eval, handler);

    // Stop infinite debugger loops
    const originalSetInterval = window.setInterval;
    const originalSetTimeout = window.setTimeout;

    window.setInterval = function(callback, delay) {
        if (typeof callback === 'string' && callback.includes('debugger')) {
            console.log("⚠ Blocked debugger setInterval");
            return 0;
        }
        return originalSetInterval(callback, delay);
    };

    window.setTimeout = function(callback, delay) {
        if (typeof callback === 'string' && callback.includes('debugger')) {
            console.log("⚠ Blocked debugger setTimeout");
            return 0;
        }
        return originalSetTimeout(callback, delay);
    };

    // --- 7️⃣ Block page unload/reload attempts ---
    document.addEventListener('keydown', function(e) {
        // Block F5, Ctrl+R, Ctrl+F5
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.ctrlKey && e.key === 'R')) {
            e.stopImmediatePropagation();
            e.preventDefault();
            console.log("⚠ Blocked reload attempt");
        }
    }, true);

    // --- 8️⃣ Neutralize console anti-debug checks ---
    const noop = function(){};
    const originalConsole = {
        log: console.log,
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error
    };

    // Keep console.log for debugging but neutralize others
    console.debug = noop;
    console.info = noop;
    console.warn = noop;
    console.error = noop;

    // --- 9️⃣ Block all unload events ---
    window.addEventListener('unload', function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }, true);

    // --- 🔟 Override EventTarget to catch hidden event listeners ---
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'beforeunload' || type === 'unload' ||
            (typeof listener === 'string' && listener.includes('beforeunload'))) {
            console.log("⚠ Blocked beforeunload/unload event listener");
            return;
        }
        return originalAddEventListener.call(this, type, listener, options);
    };

    console.log("✅ Sarathi full bypass + auto-dismiss alerts active");
})();