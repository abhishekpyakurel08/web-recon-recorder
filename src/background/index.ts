// Background Service Worker for Web Recon Recorder (Chrome, Edge & Firefox cross-browser)

const extAPI: any = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

if (extAPI && extAPI.runtime && extAPI.runtime.onInstalled) {
  extAPI.runtime.onInstalled.addListener(() => {
    console.log('[Web Recon Recorder] Extension service worker installed successfully.');
  });
}

if (extAPI && extAPI.runtime && extAPI.runtime.onMessage) {
  extAPI.runtime.onMessage.addListener((request: any, _sender: any, sendResponse: (res: any) => void) => {
    if (request.action === 'CAPTURE_SCREENSHOT') {
      if (!extAPI.tabs || !extAPI.tabs.query) {
        sendResponse({ success: false, error: 'Tabs API unavailable' });
        return true;
      }

      extAPI.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        if (!tabs || tabs.length === 0 || !tabs[0].id) {
          sendResponse({ success: false, error: 'No active tab found' });
          return;
        }

        const activeTab = tabs[0];
        const tabUrl = activeTab.url || '';

        // Internal browser page check
        if (tabUrl.startsWith('chrome://') || tabUrl.startsWith('edge://') || tabUrl.startsWith('about:') || tabUrl.startsWith('moz-extension://')) {
          sendResponse({ success: false, error: 'Cannot capture internal browser pages' });
          return;
        }

        try {
          // captureVisibleTab works in both Firefox & Chrome
          if (typeof extAPI.tabs.captureVisibleTab === 'function') {
            const windowId = activeTab.windowId || null;
            const res = extAPI.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl: string) => {
              if (extAPI.runtime && extAPI.runtime.lastError) {
                sendResponse({ success: false, error: extAPI.runtime.lastError.message });
              } else if (dataUrl) {
                sendResponse({ success: true, screenshot: dataUrl });
              } else {
                sendResponse({ success: false, error: 'Failed to capture tab screenshot' });
              }
            });

            // Handle Firefox promise return if callback wasn't invoked
            if (res && typeof res.then === 'function') {
              res.then((dataUrl: string) => {
                sendResponse({ success: true, screenshot: dataUrl });
              }).catch((err: any) => {
                sendResponse({ success: false, error: String(err) });
              });
            }
          } else {
            sendResponse({ success: false, error: 'captureVisibleTab API not supported' });
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      });
      return true; // Keep message channel open for async response
    }
  });
}
