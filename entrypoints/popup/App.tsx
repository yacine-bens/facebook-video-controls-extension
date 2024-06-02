import { storage } from "wxt/storage";
import RadioButtonsGroup from "@/assets/components/RadioButtonsGroup";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";

function App() {
	const [showControlsState, setShowControlsState] = useState<string>('');

	const radioButtons = [
		{ value: 'automatic', label: 'Automatically' },
		{ value: 'context-menu', label: 'Using Context-menu (Right Click)' },
	];

	const showControlsStorage = storage.defineItem<string>('local:showControls', { defaultValue: 'automatic' });

	const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		await showControlsStorage.setValue(event.target.value);
		setShowControlsState(event.target.value);

		chrome.contextMenus.removeAll(() => {
			if (event.target.value === 'context-menu') {
				chrome.contextMenus.create({
					id: 'facebook-video-controls',
					title: 'Facebook Video Controls',
					contexts: ['all'],
					documentUrlPatterns: ['*://*.facebook.com/*'],
				});
			}
		});
	};

	useEffect(() => {
		(async () => {
			const showControlsStorageValue = await showControlsStorage.getValue();
			setShowControlsState(showControlsStorageValue);
		})();
	}, []);

	return (
		<Box
			sx={{ border: '2px solid #ccc', borderRadius: '15px', padding: '10px' }}
		>
			<RadioButtonsGroup label="Show controls" radioButtons={radioButtons} value={showControlsState} onChange={handleChange} />
		</Box>
	);
};

export default App;