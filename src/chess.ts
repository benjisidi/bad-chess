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

import {flatten} from 'lodash';

import {board2flat, flat2board, isBlack, isWhite} from './util';

const movePiece = (
    boardArr: string[][],
    x: number,
    y: number,
    X: number,
    Y: number,
): [string[][], null | number[]] => {
    const piece = boardArr[y][x];
    // This is insane but the official doc's suggestion of how to deep copy
    const newBoard = JSON.parse(JSON.stringify(boardArr));
    const pawnDirection = isBlack(piece) ? 1 : -1;
    let enPassant = null;
    // Basic case: simply move piece to chosen square
    newBoard[Y][X] = piece;
    newBoard[y][x] = '_';
    if (piece.toLowerCase() === 'p' && (y - Y) ** 2 === 4) {
        // Move is an initial pawn move, set en passant
        enPassant = [x, y + pawnDirection];
    } else if (
        piece.toLowerCase() === 'p' &&
        boardArr[Y][X] === '_' &&
        x !== X
    ) {
        // We've just taken en passant, have to destroy the taken piece
        newBoard[Y - pawnDirection][X] = '_';
    }
    return [newBoard, enPassant];
};

const beamSearch = (
    x: number,
    y: number,
    vectors: number[][],
    l: number,
    board: string[][],
    friendlySelector: (p: string) => boolean,
    canTake = true,
    takeOnly = false,
    search: string[] = [],
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
            // ToDo: Refactor this to branch on curPiece === "_", will be neater
            const curPiece = board[curY][curX];
            // Empty square, can continue
            if (curPiece === '_' && !takeOnly && search.length == 0) {
                out.push([curX, curY]);
                // Friendly piece, are blocked
            } else if (friendlySelector(curPiece)) {
                blocked = true;
                // "Reverse" search while checking for check
            } else if (search.length > 0 && search.includes(curPiece)) {
                out.push([curX, curY]);
                blocked = true;
                // Enemy piece, can take/are blocked
            } else if (curPiece !== '_') {
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
                ...beamSearch(x, y, [[0, 1]], l, boardArr, isBlack, false),
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
                    isBlack,
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
                ...beamSearch(x, y, [[0, -1]], l, boardArr, isWhite, false),
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
                    isWhite,
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
                    piece === 'r' ? isBlack : isWhite,
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
                    piece === 'n' ? isBlack : isWhite,
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
                    piece === 'k' ? isBlack : isWhite,
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
                    piece === 'q' ? isBlack : isWhite,
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
                    piece === 'b' ? isBlack : isWhite,
                ),
            );
            break;
    }
    return output;
};

const isInCheck = (
    boardArr: string[][],
    friendlySelector: (piece: string) => boolean,
    enemySelector: (piece: string) => boolean,
): [true, number[]] | [false, null] => {
    const boardArrFlat = flatten(boardArr);
    const kingLocFlat = boardArrFlat.findIndex(
        (x) => x.toLowerCase() === 'k' && friendlySelector(x),
    );
    const [kingX, kingY] = flat2board(kingLocFlat);
    const friendlyPieceSelector = (x: string) =>
        x !== '_' && friendlySelector(x);
    // Check all sqs a knight's move away from king for enemy knights
    const attackingKnights = beamSearch(
        kingX,
        kingY,
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
        friendlyPieceSelector,
        false,
        false,
        [enemySelector('n') ? 'n' : 'N'],
    );
    // Check all sqs diagonal moves away from king for pawns, bishops and queens
    const attackingBishops = beamSearch(
        kingX,
        kingY,
        [
            [1, 1],
            [-1, -1],
            [1, -1],
            [-1, 1],
        ],
        8,
        boardArr,
        friendlyPieceSelector,
        false,
        false,
        enemySelector('b') ? ['b', 'q'] : ['B', 'Q'],
    );
    // Check all sqs straight moves away from king for rooks and queens
    const attackingRooks = beamSearch(
        kingX,
        kingY,
        [
            [0, 1],
            [1, 0],
            [-1, 0],
            [0, -1],
        ],
        8,
        boardArr,
        friendlyPieceSelector,
        false,
        false,
        enemySelector('r') ? ['r', 'q'] : ['R', 'Q'],
    );
    const attackingPawnDirections = enemySelector('p')
        ? [
              [1, 1],
              [-1, 1],
          ]
        : [
              [1, -1],
              [-1, -1],
          ];
    const attackingPawns = beamSearch(
        kingX,
        kingY,
        attackingPawnDirections,
        1,
        boardArr,
        friendlyPieceSelector,
        false,
        false,
        enemySelector('p') ? ['p'] : ['P'],
    );
    if (
        attackingKnights.length +
            attackingBishops.length +
            attackingPawns.length +
            attackingRooks.length >
        0
    ) {
        return [true, [kingX, kingY]];
    } else {
        return [false, null];
    }
};

const isValidMove = (
    boardArr: string[][],
    x: number,
    y: number,
    X: number,
    Y: number,
): boolean => {
    const [resultingBoard, _] = movePiece(boardArr, x, y, X, Y);
    const friendlySelector = boardArr[y][x];
    // return isInCheck(resultingBoard, )
    return false;
};

export {getAvailableSqs, movePiece, isInCheck};
