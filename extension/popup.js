// extension/popup.js

const display = document.getElementById('status-display');

// Attempt to talk to the local Python server
fetch('http://127.0.0.1:5000/status')
    .then(response => response.json())
    .then(data => {
        // If successful:
        if (data.status === "online") {
            display.innerText = "SYSTEM ONLINE 🟢";
            display.className = "status-box online";
        }
    })
    .catch(error => {
        // If failed (server is not running):
        display.innerText = "SYSTEM OFFLINE 🔴";
        display.className = "status-box offline";
        console.error("Error:", error);
    });