// background.js
browser.runtime.onInstalled.addListener(() => {
  console.log("ChatGPT Scrubber installed");
});

// Listen for messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message);
  return true;
});