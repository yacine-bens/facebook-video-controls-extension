import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function RadioButtonsGroup(props: any) {
	const { label, radioButtons, value, onChange } = props;

	return (
		<FormControl>
			<FormLabel>{label}</FormLabel>
			<RadioGroup
				value={value}
				name="radio-buttons-group"
				onChange={onChange}
			>
				{radioButtons.map((radioButton: any) => (
					<FormControlLabel key={radioButton.value} value={radioButton.value} control={<Radio />} label={radioButton.label} />
				))}
			</RadioGroup>
		</FormControl>
	);
}