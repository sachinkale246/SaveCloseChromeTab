// popup.js

document.getElementById('check-tabs').addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({});
    alert(`There are currently ${tabs.length} open tabs.`);
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const md = new Blob([message.mdText], { type: "text/mhtml" });
    const url = URL.createObjectURL(md);
    sendResponse({ url: url });
    return true;
  });