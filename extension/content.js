// extension/content.js
console.log("AMD Watchman: Ready to analyze. (Phase 3 Active)");

function scanImages() {
    let images = document.getElementsByTagName('img');

    for (let img of images) {
        // FILTER 1: Skip small images
        if (img.width < 100 || img.height < 100 || img.dataset.scanned) continue;
        
        // FILTER 2: Skip "data:" URLs (Base64)
        if (img.src.startsWith("data:")) continue;

        // FILTER 3: Skip SVGs (Icons/Logos) -> NEW!
        if (img.src.includes(".svg")) continue;

        img.dataset.scanned = "true";
        
        console.log("Sending valid link to server:", img.src);

        chrome.runtime.sendMessage({
            action: "analyze",
            url: img.src
        });
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "markImage") {
        let images = document.getElementsByTagName('img');
        for (let img of images) {
            if (img.src === request.url) {
                if (request.result === "fake") {
                    img.style.border = "5px solid red";
                    img.style.filter = "grayscale(100%)";
                    img.title = `FAKE (${Math.round(request.confidence * 100)}%)`;
                } else {
                    img.style.border = "3px solid #00ff00"; 
                }
            }
        }
    }
});

setInterval(scanImages, 2000);