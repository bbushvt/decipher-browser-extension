console.log("Decipher Addon Loaded");

// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {

    for (let mutation of mutationsList) {
        if (mutation.addedNodes.length && mutation.addedNodes[0].className == "genesis--Details-row_data") {
            if (mutation.target && mutation.target.parentElement && mutation.target.parentElement.id) {
                if (mutation.target.parentElement.id == "virtualServerView.details.password") {
                    let tokens = (mutation.target.childNodes[0].innerText.split(/\r?\n/));
                    chrome.runtime.sendMessage({ fn: "decrypt", encrypted_password: tokens[0] }, function (response) {
                        var span = document.createElement("SPAN");
                        if (response.decrypted) {
                            var txt = document.createTextNode("decrypted password: " + response.decrypted_password + "  -- click to copy");
                            span.appendChild(txt);
                            span.onclick = function () {
                                CopyToClipboard(response.decrypted_password);
                            }
                        } else {
                            var txt = document.createTextNode(response.decrypted_password);
                            span.appendChild(txt);
                        }
                        mutation.target.childNodes[0].appendChild(span);
                    });
                }
            }
        }

    }
}

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

document.addEventListener("DOMContentLoaded", function () {
    // Start observing the target node for configured mutations
    observer.observe(document.body, config);

});

function CopyToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.error('Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}







