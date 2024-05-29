const showVideoControls = () => {
	const { href } = window.location;
	if (!href.includes('reel') && !href.includes('stories')) return;

	const videoElements = document.querySelectorAll('video');
	if (!videoElements.length) return;

	for (const videoElement of videoElements) {
		videoElement.controls = true;
		const nextSibling = videoElement.nextSibling as HTMLDivElement;
		if (nextSibling && nextSibling.getAttributeNames().includes('data-instancekey')) {
			nextSibling.style.display = 'none';
		}

		if (href.includes('reel')) {
			const hiddenDiv = document.evaluate('.//ancestor::div[@data-video-id]/parent::div/following-sibling::div', videoElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLDivElement;
			if (hiddenDiv) {
				hiddenDiv.style.display = 'none';
			}
		}
	}
};

export default showVideoControls;