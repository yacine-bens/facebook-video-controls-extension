import { storage } from "#imports";
import showVideoControls from "@/assets/showVideoControls";

export default defineBackground(() => {
  const showControlsStorage = storage.defineItem<string>("local:showControls", { defaultValue: "context-menu" });
  const volumeStorage = storage.defineItem<number>("local:volume", { defaultValue: 1 });

  const onInstalled = async () => {
    // const currentVersionStorage = storage.defineItem<string>("local:currentVersion");
    // const updateShownStorage = storage.defineItem<boolean>("local:updateShown", { defaultValue: false });

    // const newVersion = browser.runtime.getManifest().version;
    // const currentVersion = await currentVersionStorage.getValue();

    // if (newVersion !== currentVersion) {
    //   await currentVersionStorage.setValue(newVersion);

    //   const updateShownValue = await updateShownStorage.getValue();
    //   if (!updateShownValue) {
    //     await browser.runtime.openOptionsPage();
    //     await updateShownStorage.setValue(true);
    //   }
    // }

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
  });
});