const showVideoControls = () => {
  // Reels
  if (window.location.href.includes('reel')) {
    let xpathResult = document.evaluate('//div[@data-video-id]//video', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const videoElements = Array.from({ length: xpathResult.snapshotLength }, (_, i) => xpathResult.snapshotItem(i)) as HTMLVideoElement[];

    if (!videoElements.length) {
      console.log('No video element found');
      return;
    }
    videoElements.forEach(video =>{ 
      video.controls = true
      
      const nextSibling = video.nextSibling as HTMLDivElement;
      if (nextSibling) {
        nextSibling.style.display = 'none';
      }
  
      xpathResult = document.evaluate('//div[preceding-sibling::div[div[@data-video-id]]]', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      const hiddenDivElements = Array.from({ length: xpathResult.snapshotLength }, (_, i) => xpathResult.snapshotItem(i)) as HTMLDivElement[];
      if (!hiddenDivElements.length) {
        console.log('No hidden div found');
        return;
      }
      hiddenDivElements.forEach(hiddenDiv => {
        hiddenDiv.style.display = 'none';
      });
    });
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
