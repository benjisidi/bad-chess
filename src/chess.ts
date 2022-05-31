/*
  find_moves(loc, type):
    in check?
    KING
      - basic moves - blocked - checked
      - castling
    PAWN
      - can we move forward
        - have we moved yet (if no x2)
      - can we take
        - can we take en passant
    KNIGHT
      - basic moves - blocked
    ROOK/BISHOP/QUEEN
      - beam search basic moves until blocked
*/

class Vector {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    add(other: Vector) {
        return new Vector(this.x + other.x, this.y + other.y);
    }
}

const getRelativeSq = (x: number, y: number, X: number, Y: number) => {
    return [x + X, y + Y];
};

// FIXME: a file not working
// Fixme pawns don't take forwards
const beamSearch = (
    x: number,
    y: number,
    vectors: number[][],
    l: number,
    board: string[][],
    colorFn: (p: string) => boolean,
    canTake = true,
): number[][] => {
    const out: number[][] = [];
    vectors.forEach((vec) => {
        // debugger;
        const [X, Y] = vec;
        let done = false;
        let i = 1;
        let curX = x + X;
        let curY = y + Y;
        while (
            !done &&
            i <= l &&
            curX <= 7 &&
            curY <= 7 &&
            curX >= 0 &&
            curY >= 0
        ) {
            const curPiece = board[curY][curX];
            if (curPiece === '_') {
                out.push([curX, curY]);
            } else if (colorFn(curPiece)) {
                done = true;
            } else {
                canTake && out.push([curX, curY]);
                done = true;
            }
            i++;
            curX += X;
            curY += Y;
        }
    });
    return out;
};

const isUpperCase = (x: string) => x === x.toUpperCase();
const isLowerCase = (x: string) => x === x.toLowerCase();

const getAvailableSqs = (
    boardArr: string[][],
    x: number,
    y: number,
): number[][] => {
    // debugger;
    const piece = boardArr[y][x];
    const output = [];
    let l;
    switch (piece) {
        case 'p':
            l = y == 1 ? 2 : 1;
            output.push(
                ...beamSearch(x, y, [[0, 1]], l, boardArr, isLowerCase, false),
            );
            break;
        case 'P':
            l = y == 6 ? 2 : 1;
            output.push(
                ...beamSearch(x, y, [[0, -1]], l, boardArr, isUpperCase, false),
            );
            break;
        case 'R':
        case 'r':
            output.push(
                ...beamSearch(
                    x,
                    y,
                    [
                        [0, 1],
                        [1, 0],
                        [-1, 0],
                        [0, -1],
                    ],
                    8,
                    boardArr,
                    piece === 'r' ? isLowerCase : isUpperCase,
                ),
            );
            break;
        case 'N':
        case 'n':
            // debugger;
            output.push(
                ...beamSearch(
                    x,
                    y,
                    [
                        [1, 2],
                        [-1, 2],
                        [1, -2],
                        [-1, -2],
                        [2, 1],
                        [2, -1],
                        [-2, 1],
                        [-2, -1],
                    ],
                    1,
                    boardArr,
                    piece === 'n' ? isLowerCase : isUpperCase,
                ),
            );
            break;
    }
    return output;
};

export {getAvailableSqs};
