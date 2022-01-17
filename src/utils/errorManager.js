"use strict";

const MAX_RETRY_TIME = 10000; // Stop trying to highlight after this time (in ms)
const RETRY_INTERVAL = 500;

// Keep track of highlights that can't be loaded so that we can show
// them in the popup UI
window.highlighter_lostHighlights ||= {};

function addHighlightError(highlight, highlightIndex) { /* eslint-disable-line no-redeclare, no-unused-vars */
    const highlightError = {
        highlight,
        highlightIndex,
        errorTime: Date.now(),
    };
    window.highlighter_lostHighlights[highlightIndex] = highlight;
    setTimeout(retryHighlightError, RETRY_INTERVAL, highlightError);
}

function retryHighlightError(highlightError) {
    const success = load(highlightError.highlight, highlightError.highlightIndex, true);

    if (success) {
        delete window.highlighter_lostHighlights[highlightIndex];
        return;
    }

    if (Date.now() - highlightError.errorTime < MAX_RETRY_TIME) {
        setTimeout(retryHighlightError, RETRY_INTERVAL, highlightError);
    }
}
