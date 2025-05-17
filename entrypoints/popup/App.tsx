import { storage } from "#imports";
import RadioButtonsGroup from "@/assets/components/RadioButtonsGroup";
import { Box, FormControlLabel, Switch, Slider, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Mellowtel from "mellowtel";
import { CONFIGURATION_KEY, MAX_DAILY_RATE, DISABLE_LOGS } from "@/constants";

function App() {
	const [showControlsState, setShowControlsState] = useState<string>('');
	const [isSupportDev, setIsSupportDev] = useState<boolean>(false);
	const [volumeValue, setVolumeValue] = useState<number>(0.1);

	const mellowtel = new Mellowtel(CONFIGURATION_KEY, {
		MAX_DAILY_RATE,
		disableLogs: DISABLE_LOGS,
	});

	const radioButtons = [
		{ value: 'automatic', label: 'Automatically' },
		{ value: 'context-menu', label: 'Using Context-menu (Right Click)' },
	];

	const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			const permissions = await browser.permissions.getAll();
			if (!permissions.origins?.includes('https://*/*')) {
				const disclaimerShown = storage.defineItem<boolean>("local:disclaimerShown", { defaultValue: false });
				disclaimerShown.setValue(false);
				await browser.runtime.openOptionsPage();
				window.close();
			}
			else {
				await mellowtel.optIn();
				setIsSupportDev(true);
				await mellowtel.start();
			}
		}
		else {
			await mellowtel.optOut();
			setIsSupportDev(false);
		}
	};

	const showControlsStorage = storage.defineItem<string>('local:showControls', { defaultValue: 'context-menu' });
	const volumeStorage = storage.defineItem<number>('local:volume', { defaultValue: 0.1 });

	const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.value === 'automatic') {
			const granted = browser.permissions.request({
				origins: ['*://*.facebook.com/*']
			});

			if (import.meta.env.FIREFOX) {
				window.close();
			}
			await granted;

			if (!granted) {
				return;
			}
		};

		browser.contextMenus.removeAll(() => {
			if (event.target.value === 'context-menu') {
				browser.contextMenus.create({
					id: 'facebook-video-controls',
					title: 'Facebook Video Controls',
					contexts: ['all'],
					documentUrlPatterns: ['*://*.facebook.com/*'],
				});
			}
		});

		await showControlsStorage.setValue(event.target.value);
		setShowControlsState(event.target.value);
	};

	const handleVolumeChange = async (_event: Event, newValue: number | number[]) => {
		const value = Array.isArray(newValue) ? newValue[0] : newValue;
		setVolumeValue(value);
		await volumeStorage.setValue(value);
	};

	useEffect(() => {
		(async () => {
			const showControlsStorageValue = await showControlsStorage.getValue();
			setShowControlsState(showControlsStorageValue);
			
			const volumeValue = await volumeStorage.getValue();
			setVolumeValue(volumeValue);
			
			const permissions = await browser.permissions.getAll();
			if (!permissions.origins?.includes('https://*/*')) {
				return;
			}
			const hasOptedIn = await mellowtel.getOptInStatus();
			setIsSupportDev(hasOptedIn);
		})();
	}, []);

	return (
		<>
			<Box
				sx={{ border: '2px solid #ccc', borderRadius: '15px', padding: '10px' }}
			>
				<RadioButtonsGroup label="Show controls" radioButtons={radioButtons} value={showControlsState} onChange={handleChange} />
			</Box>
			<Box
				sx={{ border: '2px solid #ccc', borderRadius: '15px', padding: '10px', mt: 2 }}
			>
				<Typography gutterBottom>Volume</Typography>
				<Slider
					value={volumeValue}
					onChange={handleVolumeChange}
					step={0.01}
					min={0}
					max={1}
					valueLabelDisplay="auto"
					valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
				/>
			</Box>
			<FormControlLabel sx={{ m: 1 }} control={<Switch checked={isSupportDev} onChange={handleSwitchChange} />} label="Support Developer ☕" />
		</>
	);
};

export default App;