(function (window, undefined) {
"use strict";

var muroShortcodes = [],
    muroModal      = null,
    muroComment    = null;

function openMuro(ourMuro) {
    ourMuro.loading.style.visibility = 'visible';
    ourMuro.saving.style.visibility  = 'hidden';
    ourMuro.muro.style.visibility    = 'hidden';
    ourMuro.muro.src = muroModal.muro.getAttribute('data-src');
}

function closeMuro(ourMuro) {
    ourMuro.muro.src = '';
}

function openMuroModal() {
    openMuro(muroModal);
    muroModal.modal.style.display = '';
}

function closeMuroModal() {
    muroModal.modal.style.display = 'none';
    closeMuro(muroModal);
}

(function (window, undefined) {
var i, sz, elements;

// Build list of shortcode muro instances
elements = window.document.getElementsByClassName("muro-shortcode");
for (i = 0, sz = elements.length; i < sz; i++) {
    muroShortcodes.push({
        type:    'shortcode',
        // Oh, the horrors involved in keeping dependency-free... #FirstWorldProblems
        loading: elements[i].getElementsByClassName("muro-loading")[0],
        saving:  elements[i].getElementsByClassName("muro-saving")[0],
        muro:    elements[i].getElementsByClassName("muro")[0]
        });
}

// Find comment form muro instance
elements = window.document.getElementsByClassName("muro-comment");
if (elements.length) {
    muroModal = {
        type:    'modal',
        loading: elements[0].getElementsByClassName("muro-loading")[0],
        saving:  elements[0].getElementsByClassName("muro-saving")[0],
        muro:    elements[0].getElementsByClassName("muro")[0],
        modal:   elements[0].getElementsByClassName("muro-modal-container")[0]
        };
    muroComment = {
        imageStore:   window.document.getElementsByClassName("muro-comment-store")[0],
        preview:      window.document.getElementsByClassName("muro-comment-preview")[0],
        previewImage: window.document.getElementsByClassName("muro-comment-preview-image")[0],
        button:       window.document.getElementsByClassName("muro-comment-add")[0]
        };
    // Start loading for shortcode iframes if comment form is found
    for (i = 0, sz = muroShortcodes.length; i < sz; i++) {
        openMuro(muroShortcodes[i]);
    }
} else {
    // TODO: display "deviantART muro comments are not enabled" splashes if comment form not found
}

})(window);

function receiveMessage(message) {
    var i, sz, ourMuro;

    ourMuro = false;
    if (message.source === muroModal.muro.contentWindow) {
        ourMuro = muroModal;
    } else {
        for (i = 0, sz = muroShortcodes.length; i < sz; i++) {
            if (message.source === muroShortcodes[i].muro.contentWindow) {
                ourMuro = muroShortcodes[i];
                break;
            }
        }
    }
    if (!ourMuro) {
        return; // Not from one of our iframes, ignore it.
    }

    switch (message.data.type) {
    case 'ready':
        ourMuro.muro.style.visibility    = 'visible';
        ourMuro.loading.style.visibility = 'hidden';
        return;
    case 'error':
        // TODO: handle errors
        window.alert(message.data.error);
// TODO: only if modal muro
        closeMuroModal();
        return;
    case 'cancel':
// TODO: only if modal muro
        closeMuroModal();
        return;
    case 'done':
        var image = message.data.image;

        ourMuro.saving.style.visibility   = 'visible';
        ourMuro.muro.style.visibility     = 'hidden';
        muroComment.imageStore.value      = image.replace(/^data:image\/png;base64,/, '');
        muroComment.previewImage.src      = image;
        muroComment.preview.style.display = '';
        if (ourMuro.type === 'modal') {
            closeMuroModal();
        } else {
            closeMuro(ourMuro);
        }
        // Timeout hack because FF positioning is broken until reflow from preview reveal completes
        window.setTimeout(function () {
                window.document.getElementById('comment').focus();
            }, 50);
        return;
    }
}

if (muroComment) {
    muroComment.button.addEventListener('click', openMuroModal, false);
}
window.addEventListener("message", receiveMessage, false);

})(window);
