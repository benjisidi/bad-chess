import p5Type from 'p5';
import React, {useState} from 'react';
import Sketch from 'react-p5';

const DARK_COLOR = 0;
const LIGHT_COLOR = 196;
const Chessboard = () => {
    const [selectedX, setSelectedX] = useState<null | number>(null);
    const [selectedY, setSelectedY] = useState<null | number>(null);
    const setup = (p5: p5Type, parentCanvasRef: Element) => {
        p5.createCanvas(600, 600).parent(parentCanvasRef);
    };
    const draw = (p5: p5Type) => {
        p5.background(DARK_COLOR);
        p5.fill(LIGHT_COLOR);
        p5.noStroke();
        for (let row = 0; row < 8; row++) {
            for (let column = 0; column < 8; column += 2) {
                const real_column = column + (row % 2);
                p5.rect(real_column * 75, row * 75, 75, 75);
            }
        }
        if (selectedX !== null && selectedY !== null) {
            p5.noFill();
            p5.strokeWeight(4);
            p5.stroke(256);
            p5.rect(selectedX * 75, selectedY * 75, 75, 75);
        }
    };
    const mouseClicked = (e: p5Type) => {
        console.log(Math.floor(e.mouseX / 75), Math.floor(e.mouseY / 75));
        setSelectedX(Math.floor(e.mouseX / 75));
        setSelectedY(Math.floor(e.mouseY / 75));
    };
    return <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />;
};

export default Chessboard;
