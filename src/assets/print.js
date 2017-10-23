(function() {
    function tryCloseWindowAfterPrint() {
        setTimeout(function() {
            var overlay = document.getElementById('overlayContainer');
            if (overlay
                && Array.prototype.indexOf.call(overlay.classList, 'hidden') === -1) {
                var interval = setInterval(function() {
                    if (Array.prototype.indexOf.call(overlay.classList, 'hidden') !== -1) {
                        window.close();
                        clearInterval(interval);
                        setTimeout(function() {
                            window.location = 'about:blank';
                        }, 500);
                    }
                }, 1000);
            } else console.log('No #overlayContainer element');
        }, 750);
    }

    function trackDocumentChanges(cb) {
        var MutationObserver = window.MutationObserver;
        var eventListener = window.addEventListener;

        if (MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                if (mutations[0].addedNodes.length
                    || mutations[0].removedNodes.length) {
                    cb();
                }
            });
            observer.observe(document, { childList: true, subtree: true });
        } else if (eventListener) {
            document.addEventListener('DOMNodeInserted', cb, false);
            document.addEventListener('DOMNodeRemoved', cb, false);
        }
    };

    function getEpoch() { return (new Date()).getTime(); }
    var init = getEpoch();
    var lastChange = init;
    trackDocumentChanges(function() {
        lastChange = getEpoch();
    });

    document.body.style.cursor = 'wait';
    var interval = setInterval(function() {
        var isLoading = Array.prototype.indexOf.call(document.body.classList, 'loadingInProgress') !== -1;
        var current = getEpoch();
        if (!isLoading
            && (current > (lastChange + 2000) || current > (init + 10000))
        ) {
            document.body.style.cursor = 'default';
            window.print();
            clearInterval(interval);
            tryCloseWindowAfterPrint();
        }
    }, 1500);
})();
