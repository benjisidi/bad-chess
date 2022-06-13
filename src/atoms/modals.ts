import {atom} from 'recoil';

import {isWhite} from '@src/util';

const queeningModalStateAtom = atom({
    key: 'queeningModalState',
    default: {
        open: false,
        selector: isWhite,
        loc: [-1, -1],
    },
});

export {queeningModalStateAtom};
