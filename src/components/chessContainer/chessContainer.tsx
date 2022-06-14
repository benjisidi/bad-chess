import React from 'react';
import {useRecoilState, useSetRecoilState} from 'recoil';

import {checkHighlightAtom} from '@src/atoms/chessAtoms';
import {useChessState} from '@src/atoms/chessState';
import {queeningModalStateAtom} from '@src/atoms/modals';
import {hasNoMoves, isInCheck} from '@src/chess';
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

    const handleStateChange = (stateUpdate: {
        boardArray: string[][];
        whiteToMove: boolean;
        castling: Castling;
        enPassant: number[] | null;
    }) =>
        /**
         * Sets the check highlight square and checks for checkmate
         */
        {
            const {boardArray, whiteToMove, castling} = stateUpdate;
            const [whiteInCheck, whiteKing] = isInCheck(
                boardArray,
                isBlack,
                isWhite,
            );
            const [blackInCheck, blackKing] = isInCheck(
                boardArray,
                isWhite,
                isBlack,
            );
            if (whiteInCheck) {
                setCheckHighlight(whiteKing as number[]);
            } else if (blackInCheck) {
                setCheckHighlight(blackKing as number[]);
            } else {
                setCheckHighlight([]);
            }
            // Checkmate check
            if (
                hasNoMoves(
                    boardArray,
                    !whiteToMove,
                    stateUpdate['enPassant'],
                    castling,
                )
            ) {
                if (
                    isInCheck(
                        boardArray,
                        whiteToMove ? isWhite : isBlack,
                        whiteToMove ? isBlack : isWhite,
                    )
                ) {
                    alert('CHECKMATE');
                } else {
                    alert('STALEMATE');
                }
            }
        };

    const handleModalClose = (newPiece: string) => {
        setQueeningModalState({
            open: false,
            selector: isWhite,
            loc: queeningModalState.loc,
        });
        const newBoard = JSON.parse(JSON.stringify(chessState.boardArray));
        newBoard[queeningModalState.loc[1]][queeningModalState.loc[0]] =
            newPiece;
        setChessState({boardArray: newBoard});
        handleStateChange({
            boardArray: newBoard,
            castling: chessState.castling,
            enPassant: chessState.enPassant,
            whiteToMove: chessState.whiteToMove,
        });
    };
    return (
        <div>
            <QueeningModal
                open={open}
                colorSelector={selector}
                onClose={handleModalClose}
            />
            <Chessboard handleStateChange={handleStateChange} />
        </div>
    );
};

export default ChessContainer;
