import { storage } from "#imports";
import showVideoControls from "@/assets/showVideoControls";
import Mellowtel from "mellowtel";
import { CONFIGURATION_KEY, MAX_DAILY_RATE, DISABLE_LOGS } from "@/constants";

export default defineBackground(() => {
  const mellowtel = new Mellowtel(CONFIGURATION_KEY, {
    MAX_DAILY_RATE,
    disableLogs: DISABLE_LOGS,
  });

  const showControlsStorage = storage.defineItem<string>("local:showControls", { defaultValue: "context-menu" });
  const volumeStorage = storage.defineItem<number>("local:volume", { defaultValue: 0.1 });

  const onInstalled = async () => {
    const currentVersionStorage = storage.defineItem<string>("local:currentVersion");
    const updateShownStorage = storage.defineItem<boolean>("local:updateShown", { defaultValue: false });

    const newVersion = browser.runtime.getManifest().version;
    const currentVersion = await currentVersionStorage.getValue();

    if (newVersion !== currentVersion) {
      await currentVersionStorage.setValue(newVersion);

      const updateShownValue = await updateShownStorage.getValue();
      if (!updateShownValue) {
        await browser.runtime.openOptionsPage();
        await updateShownStorage.setValue(true);
      }
    }

    // Dynamic content script gets cleared on update
    // https://groups.google.com/a/chromium.org/g/chromium-extensions/c/ZM0Vzb_vuIs
    await browser.scripting.unregisterContentScripts();
    const permissions = await browser.permissions.getAll();

    if (permissions.origins?.includes("*://*.facebook.com/*")) {
      browser.scripting.registerContentScripts([{
        id: "facebook-video-controls",
        js: ["facebook-content.js"],
        matches: ["*://*.facebook.com/*"],
        runAt: "document_end",
      }]);

      // run the script on the current tab without refreshing
      const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (currentTab.url?.includes('facebook.com')) {
        browser.scripting.executeScript({
          target: { tabId: currentTab.id! },
          files: ['facebook-content.js'],
        });
      }
    }
    if (permissions.origins?.includes("https://*/*")) {
      browser.scripting.registerContentScripts([{
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

    const showControlsStorageValue = await showControlsStorage.getValue();

    await browser.contextMenus.removeAll();
    if (showControlsStorageValue === "context-menu") {
      browser.contextMenus.create({
        id: "facebook-video-controls",
        title: "Facebook Video Controls",
        contexts: ["all"],
        documentUrlPatterns: ["*://*.facebook.com/*"],
      });
    }
  };

  browser.runtime.onInstalled.addListener(onInstalled);
  browser.runtime.onStartup.addListener(onInstalled);

  (async () => {
    await mellowtel.initBackground();
    const hasOptedIn = await mellowtel.getOptInStatus();

    if (hasOptedIn) {
      await mellowtel.start();
    }
  })();

  browser.contextMenus.onClicked.addListener(async (clickData, tab) => {
    if (clickData.menuItemId !== "facebook-video-controls") return;

    const volume = await volumeStorage.getValue();

    browser.scripting.executeScript({
      target: { tabId: tab?.id! },
      func: showVideoControls,
      args: [volume],
    });
  });

  browser.permissions.onAdded.addListener(async (permissions) => {
    const scripts = await browser.scripting.getRegisteredContentScripts();
    const facebookScript = scripts.find((script) => script.id === "facebook-video-controls");
    const mellowtelScript = scripts.find((script) => script.id === "mellowtel");

    if (permissions.origins?.includes("*://*.facebook.com/*") && !facebookScript) {
      browser.scripting.registerContentScripts([{
        id: "facebook-video-controls",
        js: ["facebook-content.js"],
        matches: ["*://*.facebook.com/*"],
        runAt: "document_end",
      }]);

      // run the script on the current tab without refreshing
      const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (currentTab.url?.includes('facebook.com')) {
        browser.scripting.executeScript({
          target: { tabId: currentTab.id! },
          files: ['facebook-content.js'],
        });
      }

      showControlsStorage.setValue("automatic");
      browser.contextMenus.removeAll();
    }
    if (permissions.origins?.includes("https://*/*")) {
      if (!mellowtelScript) {
        browser.scripting.registerContentScripts([{
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