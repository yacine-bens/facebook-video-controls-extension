import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Link } from '@mui/material';

export default function AlertDialog(props: any) {
	const { open, optIn, optOut } = props;

	return (
		<React.Fragment>
			<Dialog
				open={open}
			>
				<DialogTitle>Update Disclaimer</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ textAlign: 'justify'}}>
						✨ We are excited to announce the automatic injection feature, as well as a new feature that will help us keep the service free and available. ✨
						<br />
						<br />
						If you choose "Support Developer", <Link href='https://www.mellowtel.com/mellowtel-user-guide/' target='_blank'>Mellowtel</Link> will let you share your unused internet with trusted AI labs & statups who use it to train their models. A portion of the revenue is shared with this extension to keep it free and available.
						<br />
						If you choose "No, thanks", we will not use the additional purposes indicated.
						Mellowtel shares internet bandwidth only. Security, privacy and speed of browsing are 100% guaranteed. You can choose not participate at any time from the extension settings.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={optOut} variant='outlined' color='error' >No, thanks</Button>
					<Button onClick={optIn} variant='contained' color='success' >Support Developer</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
}