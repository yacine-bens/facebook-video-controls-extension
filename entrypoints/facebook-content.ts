import { storage } from "#imports";
import showVideoControls from "@/assets/showVideoControls";

export default defineContentScript({
	matches: ['*://*.facebook.com/*'],
	runAt: 'document_end',
	main: () => {
		const runScript = async () => {
			const volumeStorage = storage.defineItem<number>('local:volume', { defaultValue: 0.1 });

			let observer = new MutationObserver(async (mutations) => {
				for (const mutation of mutations) {
					showVideoControls(await volumeStorage.getValue());
				}
			});

			const showControlsStorage = storage.defineItem<string>('local:showControls', { defaultValue: 'automatic' });
			const showControlsStorageValue = await showControlsStorage.getValue();

			const unwatch = showControlsStorage.watch(async (newValue) => {
				if (newValue === 'context-menu') {
					observer.disconnect();
				}
				else if (newValue === 'automatic') {
					showVideoControls(await volumeStorage.getValue());
					observer.observe(document.body, {
						childList: true,
						subtree: true,
					});
				}
			});

			if (showControlsStorageValue === 'automatic') {
				showVideoControls(await volumeStorage.getValue());

				observer.observe(document.body, {
					childList: true,
					subtree: true,
				});
			}
		};

		runScript();
	}
});