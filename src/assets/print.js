(function () {
    function trackDocumentChanges(cb) {
        var MutationObserver = window.MutationObserver;
        var eventListener = window.addEventListener;

        if (MutationObserver) {
            var observer = new MutationObserver(function (mutations) {
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
    trackDocumentChanges(function () {
        lastChange = getEpoch();
    });

    document.body.style.cursor = 'wait';
    var interval = setInterval(function () {
        var isLoading = Array.prototype.indexOf.call(document.body.classList, 'loadingInProgress') !== -1;
        var current = getEpoch();
        if (!isLoading
            && ((current - lastChange) > 2500 || (current - init) > 20000)
        ) {
            clearInterval(interval);
            document.body.style.cursor = 'default';
            document.body.classList.add('loaded');
            window.print();
            closeAfterPrint();
        }
    }, 1000);

    function closeAfterPrint() {
        var lastActive = getEpoch();
        var interval = setInterval(function () {
            var current = getEpoch();
            // Close window if user cancels print (DOM stops changing)
            // or becomes inactive (which happens after opening the printing dialog)
            if ((current - lastChange) > 750 || (current - lastActive) > 750) {
                clearInterval(interval);
                window.close();
            }
            lastActive = current;
        }, 250);
    }
})();
