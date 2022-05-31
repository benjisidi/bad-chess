import p5Type from 'p5';
import React, {useState} from 'react';
import Sketch from 'react-p5';

import {getAvailableSqs} from '../../chess';

const DARK_COLOR = 0;
const LIGHT_COLOR = 196;
const BOARD_SIZE = 75;
const CANVAS_SIZE = 600;
const AVAILABLE_SQ: [number, number, number, number] = [200, 0, 200, 200];
const FEN = 'rnbqkbnr/pp1ppppp/8/8/1rp1P2R/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';
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
const Chessboard = () => {
    const [selectedX, setSelectedX] = useState<null | number>(null);
    const [selectedY, setSelectedY] = useState<null | number>(null);
    const setup = (p5: p5Type, parentCanvasRef: Element) => {
        p5.createCanvas(CANVAS_SIZE, CANVAS_SIZE).parent(parentCanvasRef);
    };
    const [pieces, toMove, castling, enPassant, halfmove, fullmove] =
        FEN.split(' ');
    const boardArr = FEN2Arr(pieces);
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
        if (!(selectedX === null) && !(selectedY === null)) {
            // Fixme: This should happen once on click not every frame
            const availableSqs = getAvailableSqs(
                boardArr,
                selectedX,
                selectedY,
            );
            availableSqs.forEach((sq) => {
                const [x, y] = sq;
                p5.stroke(...AVAILABLE_SQ);
                p5.noFill();
                p5.rect(x * BOARD_SIZE, y * BOARD_SIZE, BOARD_SIZE, BOARD_SIZE);
                p5.noStroke();
            });
        }
        boardArr.forEach((row, i) => {
            row.forEach((piece, j) => {
                if (piece !== '_') {
                    renderPiece(p5, piece, i, j);
                }
            });
        });
        if (selectedX !== null && selectedY !== null) {
            p5.noFill();
            p5.strokeWeight(4);
            p5.stroke(256);
            p5.rect(
                selectedX * BOARD_SIZE,
                selectedY * BOARD_SIZE,
                BOARD_SIZE,
                BOARD_SIZE,
            );
        }
    };
    const mouseClicked = (e: p5Type) => {
        const x = Math.floor(e.mouseX / BOARD_SIZE);
        const y = Math.floor(e.mouseY / BOARD_SIZE);
        console.log(x, y);
        console.log(boardArr[y][x]);
        setSelectedX(x);
        setSelectedY(y);
    };
    return <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />;
};

export default Chessboard;
