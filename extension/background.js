// extension/background.js
console.log("AMD Sentry Background Worker: Loaded");

chrome.runtime.onMessage.addListener((request, sender, senderTab) => {
    if (request.action === "analyze") {

        // Send URL to Python Server
        fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: request.url })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.error) {
                // Send result back to the tab to draw the border
                chrome.tabs.sendMessage(senderTab.tab.id, {
                    action: "markImage",
                    url: request.url,
                    result: data.result,
                    confidence: data.confidence
                });
            }
        })
        .catch(error => console.log("Server error:", error));
    }
});