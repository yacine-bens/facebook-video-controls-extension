import showVideoControls from "@/assets/showVideoControls";

export default defineContentScript({
	matches: ['*://*.facebook.com/*'],
	runAt: 'document_end',
	main: () => {
		showVideoControls();

		let observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				showVideoControls();
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}
});