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

const movePiece = (
    boardArr: string[][],
    x: number,
    y: number,
    X: number,
    Y: number,
) => {
    const piece = boardArr[y][x];
    // This is insane but the official doc's suggestion of how to deep copy
    const newBoard = JSON.parse(JSON.stringify(boardArr));
    newBoard[Y][X] = piece;
    newBoard[y][x] = '_';
    return newBoard;
};

const beamSearch = (
    x: number,
    y: number,
    vectors: number[][],
    l: number,
    board: string[][],
    colorFn: (p: string) => boolean,
    canTake = true,
    takeOnly = false,
): number[][] => {
    const out: number[][] = [];
    vectors.forEach((vec) => {
        const [X, Y] = vec;
        let blocked = false;
        let i = 1;
        let curX = x + X;
        let curY = y + Y;
        while (
            !blocked &&
            i <= l &&
            curX <= 7 &&
            curY <= 7 &&
            curX >= 0 &&
            curY >= 0
        ) {
            const curPiece = board[curY][curX];
            if (curPiece === '_' && !takeOnly) {
                out.push([curX, curY]);
            } else if (colorFn(curPiece)) {
                blocked = true;
            } else {
                canTake && out.push([curX, curY]);
                blocked = true;
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
    enPassant: null | number[] = null,
): number[][] => {
    const piece = boardArr[y][x];
    const output = [];
    let l;
    switch (piece) {
        case 'p':
            // Regular/1st movement
            l = y == 1 ? 2 : 1;
            output.push(
                ...beamSearch(x, y, [[0, 1]], l, boardArr, isLowerCase, false),
            );
            // Taking
            output.push(
                ...beamSearch(
                    x,
                    y,
                    [
                        [1, 1],
                        [-1, 1],
                    ],
                    1,
                    boardArr,
                    isLowerCase,
                    true,
                    true,
                ),
            );
            // En Passant
            if (
                enPassant !== null &&
                (enPassant[0] == x - 1 || enPassant[0] == x + 1) &&
                enPassant[1] == y + 1
            ) {
                output.push(enPassant);
            }
            break;
        case 'P':
            l = y == 6 ? 2 : 1;
            output.push(
                ...beamSearch(x, y, [[0, -1]], l, boardArr, isUpperCase, false),
            );
            output.push(
                ...beamSearch(
                    x,
                    y,
                    [
                        [1, -1],
                        [-1, -1],
                    ],
                    1,
                    boardArr,
                    isUpperCase,
                    true,
                    true,
                ),
            );
            // En Passant
            if (
                enPassant !== null &&
                (enPassant[0] == x - 1 || enPassant[0] == x + 1) &&
                enPassant[1] == y - 1
            ) {
                output.push(enPassant);
            }
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
        case 'K':
        case 'k':
            output.push(
                ...beamSearch(
                    x,
                    y,
                    [
                        [1, 1],
                        [-1, -1],
                        [1, -1],
                        [-1, 1],
                        [0, 1],
                        [1, 0],
                        [0, -1],
                        [-1, 0],
                    ],
                    1,
                    boardArr,
                    piece === 'k' ? isLowerCase : isUpperCase,
                ),
            );
            break;
        case 'Q':
        case 'q':
            output.push(
                ...beamSearch(
                    x,
                    y,
                    [
                        [1, 1],
                        [-1, -1],
                        [1, -1],
                        [-1, 1],
                        [0, 1],
                        [1, 0],
                        [0, -1],
                        [-1, 0],
                    ],
                    8,
                    boardArr,
                    piece === 'q' ? isLowerCase : isUpperCase,
                ),
            );
            break;
        case 'B':
        case 'b':
            output.push(
                ...beamSearch(
                    x,
                    y,
                    [
                        [1, 1],
                        [-1, -1],
                        [1, -1],
                        [-1, 1],
                    ],
                    8,
                    boardArr,
                    piece === 'b' ? isLowerCase : isUpperCase,
                ),
            );
            break;
    }
    return output;
};

export {getAvailableSqs, movePiece};
