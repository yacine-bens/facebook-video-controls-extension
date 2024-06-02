import { storage } from "wxt/storage";
import showVideoControls from "@/assets/showVideoControls";

export default defineContentScript({
	matches: ['*://*.facebook.com/*'],
	runAt: 'document_end',
	main: () => {
		const runScript = async () => {
			let observer = new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					showVideoControls();
				}
			});

			const showControlsStorage = storage.defineItem<string>('local:showControls', { defaultValue: 'automatic' });
			const showControlsStorageValue = await showControlsStorage.getValue();

			const unwatch = showControlsStorage.watch((newValue) => {
				if (newValue === 'context-menu') {
					observer.disconnect();
				}
				else if (newValue === 'automatic') {
					showVideoControls();
					observer.observe(document.body, {
						childList: true,
						subtree: true,
					});
				}
			});

			if (showControlsStorageValue === 'automatic') {
				showVideoControls();

				observer.observe(document.body, {
					childList: true,
					subtree: true,
				});
			}
		};

		runScript();
	}
});