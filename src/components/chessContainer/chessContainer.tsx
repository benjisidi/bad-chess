import React from 'react';
import {useRecoilState, useSetRecoilState} from 'recoil';

import {checkHighlightAtom} from '@src/atoms/chessAtoms';
import {useChessState} from '@src/atoms/chessState';
import {queeningModalStateAtom} from '@src/atoms/modals';
import {isInCheck} from '@src/chess';
import {isBlack, isWhite} from '@src/util';

import Chessboard from '../chessboard/chessboard';
import QueeningModal from '../queeningModal/queeningModal';

const ChessContainer = () => {
    const [queeningModalState, setQueeningModalState] = useRecoilState(
        queeningModalStateAtom,
    );
    const setCheckHighlight = useSetRecoilState(checkHighlightAtom);
    const [chessState, setChessState] = useChessState();
    const {open, selector} = queeningModalState;
    const handleModalClose = (newPiece: string) => {
        setQueeningModalState({
            open: false,
            selector: isWhite,
            loc: queeningModalState.loc,
        });
        const newBoard = JSON.parse(JSON.stringify(chessState.boardArray));
        newBoard[queeningModalState.loc[1]][queeningModalState.loc[0]] =
            newPiece;
        const [whiteInCheck, whiteKing] = isInCheck(newBoard, isBlack, isWhite);
        const [blackInCheck, blackKing] = isInCheck(newBoard, isWhite, isBlack);
        if (whiteInCheck) {
            setCheckHighlight(whiteKing as number[]);
        } else if (blackInCheck) {
            setCheckHighlight(blackKing as number[]);
        } else {
            setCheckHighlight([]);
        }
        setChessState({boardArray: newBoard});
    };
    return (
        <div>
            <QueeningModal
                open={open}
                colorSelector={selector}
                onClose={handleModalClose}
            />
            <Chessboard />
        </div>
    );
};

export default ChessContainer;
