import { storage } from "wxt/storage";
import showVideoControls from "@/assets/showVideoControls";
import Mellowtel from "mellowtel";
const CONFIGURATION_KEY = "YzQ3ODQ0Yjg=";

export default defineBackground(() => {
  const mellowtel = new Mellowtel(atob(CONFIGURATION_KEY), {
    MAX_DAILY_RATE: 500,
  });

  const showControlsStorage = storage.defineItem<string>("local:showControls", { defaultValue: "context-menu" });

  const onInstalled = async () => {
    const currentVersionStorage = storage.defineItem<string>("local:currentVersion");
    const updateShownStorage = storage.defineItem<boolean>("local:updateShown", { defaultValue: false });

    const newVersion = chrome.runtime.getManifest().version;
    const currentVersion = await currentVersionStorage.getValue();

    if (newVersion !== currentVersion) {
      await currentVersionStorage.setValue(newVersion);

      const updateShownValue = await updateShownStorage.getValue();
      if (!updateShownValue) {
        await chrome.runtime.openOptionsPage();
        await updateShownStorage.setValue(true);
      }
    }

    // Dynamic content script gets cleared on update
    // https://groups.google.com/a/chromium.org/g/chromium-extensions/c/ZM0Vzb_vuIs
    chrome.scripting.unregisterContentScripts(async () => {
      const permissions = await chrome.permissions.getAll();

      if (permissions.origins?.includes("*://*.facebook.com/*")) {
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
      }
      if (permissions.origins?.includes("https://*/*")) {
        chrome.scripting.registerContentScripts([{
          id: "mellowtel",
          js: ["mellowtel-content.js"],
          matches: ["<all_urls>"],
          runAt: "document_start",
          allFrames: true,
        }]);
        const hasOptedIn = await mellowtel.getOptInStatus();
        if (hasOptedIn) {
          await mellowtel.start();
        }
      }
    });

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
  };
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_VOLUME') {
      chrome.storage.local.get('volume', (result) => {
        sendResponse(result.volume || 0.1);
      });
      return true; 
    } else if (request.type === 'SET_VOLUME') {
      chrome.storage.local.set({ volume: request.volume }, () => {
        sendResponse({ success: true });
      });
      return true; 
    }
  });
  chrome.runtime.onInstalled.addListener(onInstalled);
  chrome.runtime.onStartup.addListener(onInstalled);

  (async () => {
    await mellowtel.initBackground();
    const hasOptedIn = await mellowtel.getOptInStatus();

    if (hasOptedIn) {
      await mellowtel.start();
    }
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
    const mellowtelScript = scripts.find((script) => script.id === "mellowtel");

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
    if (permissions.origins?.includes("https://*/*")) {
      if (!mellowtelScript) {
        chrome.scripting.registerContentScripts([{
          id: "mellowtel",
          js: ["mellowtel-content.js"],
          matches: ["<all_urls>"],
          runAt: "document_start",
          allFrames: true,
        }]);
      }
      const hasOptedIn = await mellowtel.getOptInStatus();
      if (hasOptedIn) {
        await mellowtel.start();
      }
    }
  });
});