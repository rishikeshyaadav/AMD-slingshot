// extension/popup.js

const display = document.getElementById("status-display");

async function checkServerStatus() {
  try {
    const response = await fetch("http://127.0.0.1:5000/status", {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000), // 3-second timeout for quick UI feedback
    });

    const data = await response.json();

    if (data.status === "online") {
      display.innerText = "SYSTEM ONLINE 🟢";
      display.className = "status-box online";
    } else {
      throw new Error("Unexpected server response");
    }
  } catch (error) {
    display.innerText = "SYSTEM OFFLINE 🔴";
    display.className = "status-box offline";
    console.error("AMD Sentry Server Connection Failed:", error);
  }
}

document.addEventListener("DOMContentLoaded", checkServerStatus);
