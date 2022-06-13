import {atom, selector} from 'recoil';

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
const whiteToMoveAtom = atom({
    key: 'whiteToMove',
    default: true,
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
const boardAsFEN = selector({
    key: 'boardAsFEN',
    get: ({get}) => {
        const board: string[][] = get(boardArrayAtom);
        let FEN = '';
        board.forEach((row) => {
            let gapCounter = 0;
            row.forEach((sq) => {
                if (sq === '_') {
                    gapCounter += 1;
                } else {
                    if (gapCounter > 0) {
                        FEN += `${gapCounter}`;
                        gapCounter = 0;
                    }
                    FEN += sq;
                }
            });
            if (gapCounter > 0) {
                FEN += `${gapCounter}`;
                gapCounter = 0;
            }
            FEN += '/';
        });
        return FEN;
    },
});

const checkHighlightAtom = atom<number[]>({
    key: 'checkHighlight',
    default: [],
});

export {
    boardArrayAtom,
    enPassantAtom,
    moveCounterAtom,
    halfmoveCounterAtom,
    castlingAtom,
    selectedXAtom,
    selectedYAtom,
    whiteToMoveAtom,
    boardAsFEN,
    checkHighlightAtom,
};
