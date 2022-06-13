import {SetterOrUpdater, useRecoilState} from 'recoil';

import {
    boardArrayAtom,
    castlingAtom,
    enPassantAtom,
    halfmoveCounterAtom,
    moveCounterAtom,
    selectedXAtom,
    selectedYAtom,
    whiteToMoveAtom,
} from './chessAtoms';

const useChessState = (): [
    ChessState,
    (update: Partial<ChessStateUpdate>) => void,
] => {
    const [boardArray, setBoardArray] = useRecoilState(boardArrayAtom);
    const [castling, setCastling] = useRecoilState(castlingAtom);
    const [enPassant, setEnPassant] = useRecoilState(enPassantAtom);
    const [halfMoveCounter, setHalfMoveCounter] =
        useRecoilState(halfmoveCounterAtom);
    const [moveCounter, setMoveCounter] = useRecoilState(moveCounterAtom);
    const [selectedX, setSelectedX] = useRecoilState(selectedXAtom);
    const [selectedY, setSelectedY] = useRecoilState(selectedYAtom);
    const [whiteToMove, setWhiteToMove] = useRecoilState(whiteToMoveAtom);

    const setFns: {[key: string]: SetterOrUpdater<unknown>} = {
        boardArray: setBoardArray,
        castling: (update: {[key: string]: boolean}) =>
            setCastling({...castling, ...update}),
        enPassant: setEnPassant,
        halfMoveCounter: setHalfMoveCounter,
        moveCounter: setMoveCounter,
        selectedX: setSelectedX,
        selectedY: setSelectedY,
        whiteToMove: setWhiteToMove,
    };

    const chessState: ChessState = {
        boardArray,
        castling,
        enPassant,
        halfMoveCounter,
        moveCounter,
        selectedX,
        selectedY,
        whiteToMove,
    };
    const setChessState = (update: Partial<ChessStateUpdate>): void => {
        Object.entries(update).forEach(([key, val]) => {
            if (key in setFns) {
                setFns[key](val);
            }
        });
    };
    return [chessState, setChessState];
};
export {useChessState};
