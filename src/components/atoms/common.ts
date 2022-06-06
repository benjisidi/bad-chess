import {atom} from 'recoil';

const boardArrayAtom = atom({
    key: 'boardArray',
    default: Array(8).fill(Array(8).fill('_')),
});

const selectedXAtom = atom({
    key: 'selectedX',
    default: null,
});
const selectedYAtom = atom({
    key: 'selectedY',
    default: null,
});
const enPassantAtom = atom({
    key: 'enPassant',
    default: null,
});
const moveCounterAtom = atom({
    key: 'moveCounter',
    default: 0,
});
const halfmoveCounterAtom = atom({
    key: 'halfmoveCounter',
    default: 0,
});
const castlingAtom = atom({
    key: 'castling',
    default: {
        k: true,
        K: true,
        q: true,
        Q: true,
    },
});

export {
    boardArrayAtom,
    enPassantAtom,
    moveCounterAtom,
    halfmoveCounterAtom,
    castlingAtom,
    selectedXAtom,
    selectedYAtom,
};
