import { storage } from "wxt/storage";
import showVideoControls from "@/assets/showVideoControls";

export default defineBackground(() => {
  (async () => {
    const showControlsStorage = storage.defineItem<string>("local:showControls", { defaultValue: "automatic" });
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
});