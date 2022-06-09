import p5Type from 'p5';
import React, {useState} from 'react';
import Sketch from 'react-p5';

import {isLowerCase, isUpperCase} from '@src/util';

import {getAvailableSqs, isInCheck, movePiece} from '../../chess';
import {useChessState} from '../atoms/chessState';

const DARK_COLOR = 0;
const LIGHT_COLOR = 196;
const BOARD_SIZE = 75;
const CANVAS_SIZE = 600;
const AVAILABLE_SQ: [number, number, number, number] = [0, 200, 200, 200];
const FEN = 'rnbqkbnr/pp1ppppp/8/8/1rpPP2R/P4N2/PPP2PPP/RNBQKB1R b KQkq d3 1 2';

const colMap: Map<string, number> = new Map();
'abcdefgh'.split('').forEach((char, i) => colMap.set(char, i));
const FEN2Arr = (board: string): string[][] => {
    const out: string[][] = [];
    board.split('/').forEach((row) => {
        const rowArr: string[] = [];
        row.split('').forEach((piece) => {
            const spacing = parseInt(piece);
            if (isNaN(spacing)) {
                rowArr.push(piece);
            } else {
                rowArr.push(...Array(spacing).fill('_'));
            }
        });
        out.push(rowArr);
    });
    return out;
};
const renderPiece = (p5: p5Type, piece: string, row: number, col: number) => {
    const color: [number, number, number] =
        piece == piece.toUpperCase() ? [0, 102, 153] : [50, 50, 50];
    p5.fill(...color);
    p5.rectMode(p5.CORNERS);
    // p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(64);
    p5.text(
        piece,
        col * BOARD_SIZE,
        row * BOARD_SIZE,
        col * BOARD_SIZE + BOARD_SIZE,
        row * BOARD_SIZE + BOARD_SIZE,
    );
    p5.rectMode(p5.CORNER);
};

const parseFEN = (FEN: string): ChessState => {
    const [pieces, toMove, castling, enPassant, halfMoves, fullMoves] =
        FEN.split(' ');
    const enPassantParsed =
        enPassant === '-'
            ? null
            : [
                  colMap.get(enPassant[0]) as number,
                  7 - (parseInt(enPassant[1]) - 1),
              ];
    const boardArr = FEN2Arr(pieces);
    const castlingParsed = {
        k: castling.includes('k'),
        K: castling.includes('K'),
        q: castling.includes('q'),
        Q: castling.includes('Q'),
    };
    return {
        boardArray: boardArr,
        castling: castlingParsed,
        enPassant: enPassantParsed,
        selectedX: null,
        selectedY: null,
        halfMoveCounter: parseInt(halfMoves),
        moveCounter: parseInt(fullMoves),
    };
};

const Chessboard = () => {
    const [chessState, setChessState] = useChessState();
    const [availableSqs, setAvailableSqs] = useState<number[][]>([]);
    const [checkHighlight, setCheckHighlight] = useState<number[]>([]);
    const setup = (p5: p5Type, parentCanvasRef: Element) => {
        p5.createCanvas(CANVAS_SIZE, CANVAS_SIZE).parent(parentCanvasRef);
        setChessState(parseFEN(FEN));
    };
    const draw = (p5: p5Type) => {
        p5.background(DARK_COLOR);
        p5.fill(LIGHT_COLOR);
        p5.noStroke();
        for (let row = 0; row < 8; row++) {
            for (let column = 0; column < 8; column += 2) {
                const real_column = column + (row % 2);
                p5.rect(
                    real_column * BOARD_SIZE,
                    row * BOARD_SIZE,
                    BOARD_SIZE,
                    BOARD_SIZE,
                );
            }
        }
        if (
            !(chessState.selectedX === null) &&
            !(chessState.selectedY === null)
        ) {
            availableSqs.forEach((sq) => {
                const [x, y] = sq;
                p5.stroke(...AVAILABLE_SQ);
                p5.noFill();
                p5.rect(x * BOARD_SIZE, y * BOARD_SIZE, BOARD_SIZE, BOARD_SIZE);
                p5.noStroke();
            });
        }
        chessState.boardArray.forEach((row, i) => {
            row.forEach((piece: string, j) => {
                if (piece !== '_') {
                    renderPiece(p5, piece, i, j);
                }
            });
        });
        if (chessState.selectedX !== null && chessState.selectedY !== null) {
            p5.noFill();
            p5.strokeWeight(4);
            p5.stroke(256);
            p5.rect(
                chessState.selectedX * BOARD_SIZE,
                chessState.selectedY * BOARD_SIZE,
                BOARD_SIZE,
                BOARD_SIZE,
            );
        }
        if (checkHighlight.length > 0) {
            p5.noFill();
            p5.strokeWeight(4);
            p5.stroke(128, 0, 0);
            p5.rect(
                checkHighlight[0] * BOARD_SIZE,
                checkHighlight[1] * BOARD_SIZE,
                BOARD_SIZE,
                BOARD_SIZE,
            );
        }
    };
    const mouseClicked = (e: p5Type) => {
        const x = Math.floor(e.mouseX / BOARD_SIZE);
        const y = Math.floor(e.mouseY / BOARD_SIZE);
        console.log(chessState);
        console.log(isInCheck(chessState.boardArray, isUpperCase, isLowerCase));
        if (chessState.selectedX === null || chessState.selectedY === null) {
            const whiteToMove = chessState.moveCounter % 2 == 0;
            const selectedSq = chessState.boardArray[y][x];
            if (
                selectedSq !== '_' &&
                ((whiteToMove && isUpperCase(selectedSq)) ||
                    (!whiteToMove && isLowerCase(selectedSq)))
            ) {
                setChessState({selectedX: x, selectedY: y});
                setAvailableSqs(
                    getAvailableSqs(
                        chessState.boardArray,
                        x,
                        y,
                        chessState.enPassant,
                    ),
                );
            } else {
                setChessState({selectedX: null, selectedY: null});
            }
        } else {
            const availableSqIndex = availableSqs.map(([x, y]) => 8 * y + x);
            const clickedSqIndex = 8 * y + x;
            if (availableSqIndex.includes(clickedSqIndex)) {
                const newBoard = movePiece(
                    chessState.boardArray,
                    chessState.selectedX,
                    chessState.selectedY,
                    x,
                    y,
                );
                setChessState({
                    boardArray: newBoard,
                    selectedX: null,
                    selectedY: null,
                    moveCounter: chessState.moveCounter + 1,
                });
                const [whiteInCheck, whiteKing] = isInCheck(
                    newBoard,
                    isLowerCase,
                    isUpperCase,
                );
                const [blackInCheck, blackKing] = isInCheck(
                    newBoard,
                    isUpperCase,
                    isLowerCase,
                );
                if (whiteInCheck) {
                    setCheckHighlight(whiteKing as number[]);
                } else if (blackInCheck) {
                    setCheckHighlight(blackKing as number[]);
                } else {
                    setCheckHighlight([]);
                }
            } else {
                setChessState({selectedX: null, selectedY: null});
            }
        }
    };
    return <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />;
};

export default Chessboard;
