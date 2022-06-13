import p5Type from 'p5';
import React, {useState} from 'react';
import Sketch from 'react-p5';

import {isBlack, isWhite, parseFEN} from '@src/util';

import {useChessState} from '../../atoms/chessState';
import {getAvailableSqs, isInCheck, movePiece} from '../../chess';

const Chessboard = () => {
    const [chessState, setChessState] = useChessState();
    const [availableSqs, setAvailableSqs] = useState<number[][]>([]);
    const [checkHighlight, setCheckHighlight] = useState<number[]>([]);
    const [pieceImages, _] = useState<Map<string, p5Type.Image>>(
        new Map<string, p5Type.Image>(),
    );

    const BOARD_SIZE = 75;
    const CANVAS_SIZE = 600;
    const DARK_COLOR = [118, 69, 50];
    const LIGHT_COLOR = [226, 213, 188];
    const CHECK_COLOR: [number, number, number] = [200, 0, 0];
    const AVAILABLE_SQ_COLOR: [number, number, number, number] = [
        31, 127, 31, 255,
    ];
    const FEN =
        'rnbqkbnr/pp1ppppp/8/8/1rp1P2R/P4N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';

    const renderPiece = (
        p5: p5Type,
        piece: string,
        row: number,
        col: number,
        pieceImages: Map<string, p5Type.Image>,
    ) => {
        if (pieceImages.has(piece)) {
            p5.image(
                pieceImages.get(piece) as p5Type.Image,
                col * BOARD_SIZE,
                row * BOARD_SIZE,
                BOARD_SIZE,
                BOARD_SIZE,
            );
        }
    };

    const setup = (p5: p5Type, parentCanvasRef: Element) => {
        p5.createCanvas(CANVAS_SIZE, CANVAS_SIZE).parent(parentCanvasRef);
        parentCanvasRef.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            setChessState({selectedX: null, selectedY: null});
        });
        setChessState(parseFEN(FEN));
    };

    const preload = (p5: p5Type) => {
        const pieces = [
            'k',
            'K',
            'q',
            'Q',
            'b',
            'B',
            'n',
            'N',
            'r',
            'R',
            'p',
            'P',
        ];
        pieces.forEach((piece) => {
            if (isBlack(piece)) {
                pieceImages.set(
                    piece,
                    p5.loadImage(`../../assets/png/black/${piece}.png`),
                );
            } else {
                pieceImages.set(
                    piece,
                    p5.loadImage(`../../assets/png/white/${piece}.png`),
                );
            }
        });
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
                // p5.noFill();
                if (chessState.boardArray[y][x] !== '_') {
                    p5.strokeWeight(4);
                    p5.stroke(...AVAILABLE_SQ_COLOR);
                    p5.noFill();
                    p5.rect(
                        x * BOARD_SIZE,
                        y * BOARD_SIZE,
                        BOARD_SIZE,
                        BOARD_SIZE,
                    );
                } else {
                    p5.strokeWeight(2);
                    p5.stroke(0);
                    p5.fill(...AVAILABLE_SQ_COLOR);
                    p5.circle(
                        x * BOARD_SIZE + BOARD_SIZE / 2,
                        y * BOARD_SIZE + BOARD_SIZE / 2,
                        BOARD_SIZE / 4,
                    );
                }
            });
        }
        if (checkHighlight.length > 0) {
            p5.noFill();
            p5.strokeWeight(4);
            p5.stroke(CHECK_COLOR);
            p5.fill(...CHECK_COLOR, 100);
            p5.rect(
                checkHighlight[0] * BOARD_SIZE,
                checkHighlight[1] * BOARD_SIZE,
                BOARD_SIZE,
                BOARD_SIZE,
            );
        }
        chessState.boardArray.forEach((row, i) => {
            row.forEach((piece: string, j) => {
                if (piece !== '_') {
                    renderPiece(p5, piece, i, j, pieceImages);
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
    };

    const mouseClicked = (e: p5Type) => {
        const x = Math.floor(e.mouseX / BOARD_SIZE);
        const y = Math.floor(e.mouseY / BOARD_SIZE);
        // Check click is on chessboard
        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
            const whiteToMove = chessState.moveCounter % 2 == 0;
            const selectedSq = chessState.boardArray[y][x];
            const friendlyOrEmptySq =
                (whiteToMove && isWhite(selectedSq)) ||
                (!whiteToMove && isBlack(selectedSq));
            // If we don't have anything selected...
            if (
                chessState.selectedX === null ||
                chessState.selectedY === null
            ) {
                // ...and we clicked a friendly piece, select it
                if (selectedSq !== '_' && friendlyOrEmptySq) {
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
                    // ...and we clicked a non-friendly piece/empty square, deselect
                    // anything we have selected
                    setChessState({selectedX: null, selectedY: null});
                }
            } else {
                // If we have something selected already...
                const availableSqIndex = availableSqs.map(
                    ([x, y]) => 8 * y + x,
                );
                const clickedSqIndex = 8 * y + x;
                // ...and we selected somewhere it can move, move it there
                if (availableSqIndex.includes(clickedSqIndex)) {
                    const [newBoard, enPassant] = movePiece(
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
                        enPassant,
                    });
                    const [whiteInCheck, whiteKing] = isInCheck(
                        newBoard,
                        isBlack,
                        isWhite,
                    );
                    const [blackInCheck, blackKing] = isInCheck(
                        newBoard,
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
                    // ...And we selected another friendly piece, select that instead
                } else if (selectedSq !== '_' && friendlyOrEmptySq) {
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
            }
        }
    };
    return (
        <Sketch
            setup={setup}
            draw={draw}
            mouseClicked={mouseClicked}
            preload={preload}
        />
    );
};

export default Chessboard;
