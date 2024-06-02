import { storage } from "wxt/storage";
import showVideoControls from "@/assets/showVideoControls";

export default defineBackground(() => {
  const showControlsStorage = storage.defineItem<string>("local:showControls", { defaultValue: "context-menu" });

  (async () => {
    const showControlsStorageValue = await showControlsStorage.getValue();

    chrome.contextMenus.removeAll(() => {
      if (showControlsStorageValue === "context-menu") {
        chrome.contextMenus.create({
          id: "facebook-video-controls",
          title: "Facebook Video Controls",
          contexts: ["all"],
          documentUrlPatterns: ["*://*.facebook.com/*"],
        });
      }
    });
  })();

  chrome.contextMenus.onClicked.addListener((clickData, tab) => {
    if (clickData.menuItemId !== "facebook-video-controls") return;

    chrome.scripting.executeScript({
      target: { tabId: tab?.id! },
      func: showVideoControls,
    });
  });

  chrome.permissions.onAdded.addListener(async (permissions) => {
    const scripts = await chrome.scripting.getRegisteredContentScripts();
    const facebookScript = scripts.find((script) => script.id === "facebook-video-controls");
    
    if (permissions.origins?.includes("*://*.facebook.com/*") && !facebookScript) {
      chrome.scripting.registerContentScripts([{
        id: "facebook-video-controls",
        js: ["facebook-content.js"],
        matches: ["*://*.facebook.com/*"],
        runAt: "document_end",
      }]);

      // run the script on the current tab without refreshing
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (currentTab.url?.includes('facebook.com')) {
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id! },
          files: ['facebook-content.js'],
        });
      }

      showControlsStorage.setValue("automatic");
      chrome.contextMenus.removeAll();
    }
  });
});