// extension/background.js
console.log("AMD Sentry Background Worker: Loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyze") {
    // Show a loading badge
    chrome.action.setBadgeText({ text: "..." });
    chrome.action.setBadgeBackgroundColor({ color: "#aaaaaa" });

    // Send URL to Python Server
    fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: request.url, id: request.id }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!data.error) {
          // Save result for popup warning display
          chrome.storage.local.set({ lastResult: data });

          // Update extension badge based on verdict
          if (data.result === "fake") {
            chrome.action.setBadgeText({ text: "FAKE" });
            chrome.action.setBadgeBackgroundColor({ color: "#ff0000" });
          } else {
            chrome.action.setBadgeText({ text: "REAL" });
            chrome.action.setBadgeBackgroundColor({ color: "#00ff00" });

            // Clear the "REAL" badge after 3 seconds so it isn't distracting
            setTimeout(() => {
              chrome.action.setBadgeText({ text: "" });
            }, 3000);
          }

          // Send result back to the specific tab to draw the border
          if (sender.tab && sender.tab.id) {
            chrome.tabs
              .sendMessage(sender.tab.id, {
                action: "markImage",
                url: request.url,
                id: data.id,
                result: data.result,
                confidence: data.confidence,
              })
              .catch((err) => {
                console.log(
                  "AMD Sentry: Tab closed before result could be delivered.",
                  err,
                );
              });
          }
        }
      })
      .catch((error) => {
        console.error("AMD Sentry API Error:", error);
        // Show an error badge if the local Python server is unreachable
        chrome.action.setBadgeText({ text: "ERR" });
        chrome.action.setBadgeBackgroundColor({ color: "#000000" });
      });

    return true; // Keep message channel open for the asynchronous fetch response
  }
});
