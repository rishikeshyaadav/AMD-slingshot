// extension/content.js
console.log("AMD Sentry: Automatic Surveillance Active");

// 1. Highly Efficient Intersection Observer
// Uses a 500px rootMargin to scan images just before they scroll into view
const intersectionObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;

        // Stop tracking once it enters the viewport
        observer.unobserve(img);

        // If the image is already fully loaded, process it immediately
        if (img.complete) {
          processImage(img);
        } else {
          // Otherwise, wait for it to finish loading so we can check its true dimensions
          img.addEventListener("load", () => processImage(img), { once: true });

          // Failsafe: if the load event fails or gets stuck, clean up
          img.addEventListener(
            "error",
            () => {
              img.dataset.sentryProcessed = "error";
            },
            { once: true },
          );
        }
      }
    });
  },
  { rootMargin: "500px" },
);

// 2. Performant Mutation Observer
// Only looks for newly injected IMG tags (avoids scanning entire DOM repeatedly)
const mutationObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // If the added node is an image
        if (node.tagName === "IMG" && !node.dataset.sentryProcessed) {
          intersectionObserver.observe(node);
        }
        // If the added node is a container, find images inside it
        else if (node.getElementsByTagName) {
          const imgs = node.getElementsByTagName("img");
          for (let i = 0; i < imgs.length; i++) {
            if (!imgs[i].dataset.sentryProcessed) {
              intersectionObserver.observe(imgs[i]);
            }
          }
        }
      }
    }
  }
});

// Start listening for DOM changes immediately
mutationObserver.observe(document.body, { childList: true, subtree: true });

// Queue up any images that were already on the page before the script loaded
document.querySelectorAll("img").forEach((img) => {
  if (!img.dataset.sentryProcessed) {
    intersectionObserver.observe(img);
  }
});

// 3. Image Processing Logic
function processImage(img) {
  // Prevent duplicate processing
  if (img.dataset.sentryProcessed) return;
  img.dataset.sentryProcessed = "true";

  // Filter 1: Ignore tiny icons/tracking pixels using true dimensions
  if (img.naturalWidth < 50 || img.naturalHeight < 50) return;

  // Filter 2: Ignore Base64 data strings and SVGs
  const src = img.src || img.currentSrc;
  if (!src || src.startsWith("data:") || src.includes(".svg")) return;

  // Generate a unique ID to track this specific DOM element
  const uniqueId = "sentry-" + Math.random().toString(36).substr(2, 9);
  img.dataset.sentryId = uniqueId;

  // Send to background worker
  chrome.runtime.sendMessage({
    action: "analyze",
    url: src,
    id: uniqueId,
  });
}

// 4. Handle Results from the Background Worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "markImage") {
    // Gather all matching images (find by exact ID first, then fallback to matching URLs)
    const targetImages = new Set();

    if (request.id) {
      const exactImg = document.querySelector(
        `img[data-sentry-id="${request.id}"]`,
      );
      if (exactImg) targetImages.add(exactImg);
    }

    if (request.url) {
      // Catch any duplicate images on the page that share the same URL
      const duplicateImgs = document.querySelectorAll(
        `img[src="${request.url}"]`,
      );
      duplicateImgs.forEach((img) => targetImages.add(img));
    }

    // Apply the visual borders
    targetImages.forEach((img) => {
      // Prevent applying borders to the same image multiple times
      if (img.dataset.sentryMarked) return;
      img.dataset.sentryMarked = "true";

      if (request.result === "fake") {
        // Fake Image Styling
        img.style.outline = "5px solid #ff0000";
        img.style.outlineOffset = "-5px"; // Keeps outline inside image bounds
        img.style.boxShadow = "0 0 15px #ff0000";
        img.style.filter = "grayscale(100%) contrast(120%)";
        img.title = `⚠️ AI DETECTED (${Math.round(request.confidence * 100)}%)`;
        img.style.transition = "all 0.3s ease";
      } else {
        // Real Image Styling
        img.style.outline = "3px solid #00ff00";
        img.style.outlineOffset = "-3px";
        img.style.boxShadow = "0 0 10px #00ff00";
        img.title = "✅ Verified Real";

        // Fade out the green border after 3 seconds so it's not distracting
        setTimeout(() => {
          img.style.outline = "none";
          img.style.boxShadow = "none";
        }, 3000);
      }
    });
  }
});
