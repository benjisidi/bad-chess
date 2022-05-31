import p5Type from 'p5';
import React, {useState} from 'react';
import Sketch from 'react-p5';

const DARK_COLOR = 0;
const LIGHT_COLOR = 196;
const BOARD_SIZE = 75;
const CANVAS_SIZE = 600;
const FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const renderPiece = (p5: p5Type, piece: string, row: number, col: number) => {
    const color: [number, number, number] =
        piece == piece.toLowerCase() ? [0, 102, 153] : [50, 50, 50];
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
    const boardRows = pieces.split('/');
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
        boardRows.forEach((row, i) => {
            const cols = row.split('');
            let cur_col = 0;
            cols.forEach((piece, j) => {
                const spacing = parseInt(piece);
                if (!isNaN(spacing)) {
                    cur_col += spacing;
                } else {
                    renderPiece(p5, piece, 7 - i, cur_col);
                    cur_col += 1;
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
        console.log(
            Math.floor(e.mouseX / BOARD_SIZE),
            Math.floor(e.mouseY / BOARD_SIZE),
        );
        setSelectedX(Math.floor(e.mouseX / BOARD_SIZE));
        setSelectedY(Math.floor(e.mouseY / BOARD_SIZE));
    };
    return <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />;
};

export default Chessboard;
