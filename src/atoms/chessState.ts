import {SetterOrUpdater, useRecoilState} from 'recoil';

import {
    boardArrayAtom,
    castlingAtom,
    enPassantAtom,
    halfmoveCounterAtom,
    moveCounterAtom,
    selectedXAtom,
    selectedYAtom,
} from './common';

const useChessState = (): [
    ChessState,
    (update: Partial<ChessState>) => void,
] => {
    const [boardArray, setBoardArray] = useRecoilState(boardArrayAtom);
    const [castling, setCastling] = useRecoilState(castlingAtom);
    const [enPassant, setEnPassant] = useRecoilState(enPassantAtom);
    const [halfMoveCounter, setHalfMoveCounter] =
        useRecoilState(halfmoveCounterAtom);
    const [moveCounter, setMoveCounter] = useRecoilState(moveCounterAtom);
    const [selectedX, setSelectedX] = useRecoilState(selectedXAtom);
    const [selectedY, setSelectedY] = useRecoilState(selectedYAtom);

    const setFns: {[key: string]: SetterOrUpdater<unknown>} = {
        boardArray: setBoardArray,
        castling: setCastling,
        enPassant: setEnPassant,
        halfMoveCounter: setHalfMoveCounter,
        moveCounter: setMoveCounter,
        selectedX: setSelectedX,
        selectedY: setSelectedY,
    };

    const chessState: ChessState = {
        boardArray,
        castling,
        enPassant,
        halfMoveCounter,
        moveCounter,
        selectedX,
        selectedY,
    };
    const setChessState = (update: Partial<ChessState>): void => {
        Object.entries(update).forEach(([key, val]) => {
            if (key in setFns) {
                setFns[key](val);
            }
        });
    };
    return [chessState, setChessState];
};
export {useChessState};
