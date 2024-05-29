import showVideoControls from "@/assets/showVideoControls";

export default defineBackground(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "facebook-video-controls",
      title: "Facebook Video Controls",
      contexts: ["all"],
      documentUrlPatterns: ["*://*.facebook.com/*"],
    });
  });

  chrome.contextMenus.onClicked.addListener(async (clickData, tab) => {
    if (clickData.menuItemId !== "facebook-video-controls") return;

    chrome.scripting.executeScript({
      target: { tabId: tab?.id! },
      func: showVideoControls,
    });
  });
});