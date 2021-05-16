chrome.tabs.onUpdated.addListener( async function () {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['app-listener.js'],
  });
})