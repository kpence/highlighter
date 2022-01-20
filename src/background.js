/* eslint-disable no-unused-vars */

"use strict";

// Add option when right-clicking
browser.contextMenus.create({ title: "Highlight", onclick: highlightTextFromContext, contexts: ["selection"] });
browser.contextMenus.create({ title: "Toggle Cursor", onclick: toggleHighlighterCursorFromContext });
browser.contextMenus.create({ title: "Highlighter color", id: "highlight-colors" });
browser.contextMenus.create({ title: "Yellow", id: "yellow", parentId: "highlight-colors", type:"radio", onclick: changeColorFromContext });
browser.contextMenus.create({ title: "Cyan", id: "cyan", parentId: "highlight-colors", type:"radio", onclick: changeColorFromContext });
browser.contextMenus.create({ title: "Lime", id: "lime", parentId: "highlight-colors", type:"radio", onclick: changeColorFromContext });
browser.contextMenus.create({ title: "Magenta", id: "magenta", parentId: "highlight-colors", type:"radio", onclick: changeColorFromContext });

// Get the initial color value
browser.storage.sync.get('color', (values) => {
    const color = values.color ? values.color : "yellow";
    browser.contextMenus.update(color, { checked: true });
});

// Add Keyboard shortcut
browser.commands.onCommand.addListener((command) => {
    switch(command) {
        case 'execute-highlight':
            trackEvent('highlight-source', 'keyboard-shortcut');
            highlightText();
            break;
        case 'toggle-highlighter-cursor':
            trackEvent('toggle-cursor-source', 'keyboard-shortcut');
            toggleHighlighterCursor();
            break;
        case 'change-color-to-yellow':
            trackEvent('color-change-source', 'keyboard-shortcut');
            changeColor('yellow');
            break;
        case 'change-color-to-cyan':
            trackEvent('color-change-source', 'keyboard-shortcut');
            changeColor('cyan');
            break;
        case 'change-color-to-lime':
            trackEvent('color-change-source', 'keyboard-shortcut');
            changeColor('lime');
            break;
        case 'change-color-to-magenta':
            trackEvent('color-change-source', 'keyboard-shortcut');
            changeColor('magenta');
            break;
    }
});

// Listen to messages from content scripts
browser.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (request.action && request.action == 'highlight') {
        trackEvent('highlight-source', 'highlighter-cursor');
        highlightText();
    } else if (request.action && request.action == 'track-event') {
        if (request.trackCategory && request.trackAction) {
            trackEvent(request.trackCategory, request.trackAction);
        }
    }
});

function highlightTextFromContext() {
    trackEvent('highlight-source', 'context-menu');
    highlightText();
}

function highlightText() {
    trackEvent('highlight-action', 'highlight');
    browser.tabs.executeScript({file: 'src/contentScripts/highlight.js'});
}

function toggleHighlighterCursorFromContext() {
    trackEvent('toggle-cursor-source', 'context-menu');
    toggleHighlighterCursor();
}

function toggleHighlighterCursor() {
    trackEvent('highlight-action', 'toggle-cursor');
    browser.tabs.executeScript({file: 'src/contentScripts/toggleHighlighterCursor.js'});
}

function removeHighlights() {
    trackEvent('highlight-action', 'clear-all');
    browser.tabs.executeScript({file: 'src/contentScripts/removeHighlights.js'});
}

function showHighlight(highlightId) {
    trackEvent('highlight-action', 'show-highlight');

    browser.tabs.executeScript({
        code: `const highlightId = ${highlightId};`,
    }, () => {
        browser.tabs.executeScript({file: 'src/contentScripts/showHighlight.js'});
    });
}

function changeColorFromContext(info) {
    trackEvent('color-change-source', 'context-menu');
    changeColor(info.menuItemId);
}

function changeColor(color) {
    trackEvent('color-changed-to', color);
    browser.storage.sync.set({ color: color });

    // Also update the context menu
    browser.contextMenus.update(color, { checked: true });
}

function trackEvent(category, action) {
    _gaq.push(['_trackEvent', category, action]);
}
