/**
 * Service Worker for LearnMyWay Chrome Extension
 * Handles side panel behavior and message routing
 */

// Enable side panel on extension icon click
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('Failed to set panel behavior:', error));

  console.log('LearnMyWay extension installed');
});

// Enable side panel for all tabs when page loads
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Only enable for http/https URLs (not chrome:// or other internal pages)
    if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
      await chrome.sidePanel.setOptions({
        tabId,
        path: 'sidepanel.html',
        enabled: true,
      });
    }
  }
});

// Handle messages from content script and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractContent') {
    // Forward extraction request to content script
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, message).then(sendResponse).catch(console.error);
      return true; // Keep channel open for async response
    }
  }

  if (message.action === 'contentExtracted') {
    // Forward extracted content to side panel
    chrome.runtime.sendMessage(message).catch(console.error);
  }

  return false;
});

// Handle side panel opening (if available)
if (chrome.sidePanel) {
  try {
    chrome.sidePanel.setOptions({ path: 'sidepanel.html' });
  } catch (error) {
    // Side panel API might not be available in all Chrome versions
    console.log('Side panel configuration completed');
  }
}

export {};

