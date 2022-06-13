import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import React, {SyntheticEvent} from 'react';
const flexContainer = {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
};

const QueeningModal = (props: {
    onClose: (value: string) => void;
    open: boolean;
    colorSelector: (piece: string) => boolean;
}) => {
    const {onClose, open, colorSelector} = props;

    const handleClose = (value: string, reason: string) => {
        if (reason && reason == 'backdropClick') return;
        onClose(value);
    };

    const handleListItemClick = (value: string) => {
        onClose(value);
    };

    const pieces = ['n', 'N', 'b', 'B', 'r', 'R', 'q', 'Q'];

    return (
        <Dialog onClose={handleClose} open={open}>
            <List sx={flexContainer}>
                {pieces.filter(colorSelector).map((piece) => (
                    <ListItem
                        button
                        onClick={(e) => {
                            console.log(e);
                            e.stopPropagation();
                            handleListItemClick(piece);
                        }}
                        key={piece}
                    >
                        <ListItemAvatar>
                            <Avatar
                                src={`../../assets/png/${
                                    colorSelector('W') ? 'white' : 'black'
                                }/${piece}.png`}
                                sx={{width: 56, height: 56}}
                            />
                        </ListItemAvatar>
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
};
export default QueeningModal;
