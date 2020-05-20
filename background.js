var background = {
    init: function () {
        // TODO Load data from storage
        chrome.storage.local.get(['keys'], function (result) {
            if ("keys" in result) {
                background.private_keys = result.keys;
            }
        })
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.fn in background) {
                background[request.fn](request, sender, sendResponse);
            }
        });
        chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
            chrome.tabs.executeScript(null, { file: "content.js" }, () => chrome.runtime.lastError);
        });
        console.log("background running");
    },
    addKey: function (request, sender, sendResponse) {
        this.private_keys[request.description] = request.key;
        // save data to storage
        chrome.storage.local.set({ keys: this.private_keys });

    },
    deleteKey: function (request, sender, sendResponse) {
        delete this.private_keys[request.description];
        // save data to storage
        chrome.storage.local.set({ keys: this.private_keys });
    },
    getKeys: function (request, sender, sendResponse) {
        var keys = [];
        for (var k in this.private_keys) keys.push(k);
        sendResponse(keys);
    },
    decrypt: function (request, sender, sendResponse) {
        var encrypted_password = request.encrypted_password;
        var decrypted;
        var crypt = new JSEncrypt();
        // go through the keys to see if any will decrypt the password
        for (var k in this.private_keys) {
            crypt.setKey(this.private_keys[k]);
            decrypted_password = crypt.decrypt(encrypted_password);
            if (decrypted_password) {
                sendResponse({ decrypted: true, decrypted_password: decrypted_password });
                break;
            }
        }

        if (!decrypted) {
            // we weren't able to decrypt this password
            sendResponse({ decrypted: false, decrypted_password: "Unable to decrypt with available keys" })
        }
    },
    private_keys: {}
}

background.init();



