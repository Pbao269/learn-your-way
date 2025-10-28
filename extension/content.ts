/**
 * Content script for LearnMyWay
 * Extracts page content and sends it to the side panel
 */

import { extractPage } from './extract/extractor';

// Listen for extraction requests from side panel
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'extractContent') {
    try {
      // Clone the document to avoid modifying the live DOM
      const docClone = document.cloneNode(true) as Document;
      
      // Extract and structure the content
      const extraction = extractPage(docClone);
      
      // Send back to side panel
      sendResponse({ success: true, data: extraction });
    } catch (error) {
      console.error('Content extraction failed:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
    return true; // Keep message channel open for async response
  }
  
  return false;
});

// Signal that content script is ready
console.log('LearnMyWay content script loaded');

export {};

