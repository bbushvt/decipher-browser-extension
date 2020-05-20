var console = chrome.extension.getBackgroundPage().console;

var app = {
    init: function () {
        chrome.runtime.sendMessage({ fn: "getKeys" }, function (response) {
            for (var i = 0; i < response.length; i++) {
                AddListItem(response[i]);
            }
        });

    }
}

var descriptionList = []

function AddSshKey() {
    var private_ssh_key = document.getElementById('priv_ssh_key').value;
    var description = document.getElementById('ssh_description').value;


    if (description == "") {
        alert("Must put a description");
    } else if (descriptionList.includes(description)) {
        alert("Please enter a unique description")
    } else {
        // send message to background to add element
        chrome.runtime.sendMessage({ fn: "addKey", description: description, key: private_ssh_key });
        AddListItem(description);
    }
}

function AddListItem(description) {

    var li = document.createElement('li');

    var textElement = document.createTextNode(description);
    li.appendChild(textElement);

    // Add the element to the UL
    document.getElementById('private_key_list').appendChild(li);

    // Clear the inputs
    document.getElementById('priv_ssh_key').value = "";
    document.getElementById('ssh_description').value = "";

    // Add the delete option to the list element
    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);

    span.onclick = function () {
        parent = this.parentElement;
        description = parent.childNodes[0].nodeValue;
        descriptionList = descriptionList.filter(e => e !== description);
        grandparent = parent.parentElement;
        grandparent.removeChild(parent);
        // send message to background to delete this key
        chrome.runtime.sendMessage({ fn: "deleteKey", description: description });
    }

    // add the description to descriptionList
    descriptionList.push(description);
}


document.addEventListener("DOMContentLoaded", function () {
    app.init();
    var add_button = document.getElementById('add_ssh_key_button');
    add_button.addEventListener('click', AddSshKey);
})