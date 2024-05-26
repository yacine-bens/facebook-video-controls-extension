const showVideoControls = () => {
  // Reels
  if (window.location.href.includes('reel')) {
    const videoElement = document.evaluate('//div[@data-video-id]//video', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLVideoElement;
    if (!videoElement) {
      console.log('No video element found');
      return;
    }
    videoElement.controls = true;
    const nextSibling = videoElement.nextSibling as HTMLDivElement;
    if (nextSibling) {
      nextSibling.style.display = 'none';
    }

    const hiddenDiv = document.evaluate('//div[preceding-sibling::div[div[@data-video-id]]]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLDivElement;
    if (!hiddenDiv) {
      console.log('No hidden div found');
      return;
    }
    hiddenDiv.style.display = 'none';
  }
  // Stories
  else if (window.location.href.includes('stories')) {
    const videoElement = document.evaluate('//video[following-sibling::div[@data-instancekey]]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLVideoElement;
    if (!videoElement) {
      console.log('No video element found');
      return;
    }
    videoElement.controls = true;
    const nextSibling = videoElement.nextSibling as HTMLDivElement;
    if (nextSibling) {
      nextSibling.style.display = 'none';
    }
  }
}

export default defineBackground(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "facebook-video-controls",
      title: "Facebook Video Controls",
      contexts: ["all"],
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
