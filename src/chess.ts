import {flatten, set} from 'lodash';

import {board2flat, flat2board, getAllPieces, isBlack, isWhite} from './util';

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
): [string[][], ChessStateUpdate] => {
    const piece = boardArr[y][x];
    // This is insane but the official doc's suggestion of how to deep copy
    const newBoard = JSON.parse(JSON.stringify(boardArr));
    const pawnDirection = isBlack(piece) ? 1 : -1;
    const stateUpdate: ChessStateUpdate = {castling: {}, enPassant: null};
    const originFlat = board2flat([x, y]);
    const rookLocations = [0, 7, 56, 63];
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
    } else if (
        piece.toLowerCase() === 'r' &&
        rookLocations.includes(originFlat)
    ) {
        // We've moved a rook from its initial position
        const pieceToUpdate = {
            0: 'q',
            7: 'k',
            56: 'Q',
            63: 'K',
        };
        set(
            stateUpdate,
            [
                'castling',
                pieceToUpdate[originFlat as keyof typeof pieceToUpdate],
            ],
            false,
        );
    } else if (piece.toLowerCase() === 'k') {
        set(stateUpdate, ['castling', isWhite(piece) ? 'K' : 'k'], false);
        set(stateUpdate, ['castling', isWhite(piece) ? 'Q' : 'q'], false);
    }
    stateUpdate['enPassant'] = enPassant;
    return [newBoard, stateUpdate];
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

const getPieceSelectors = (boardArr: string[][], x: number, y: number) => {
    const pieceIsWhite = isWhite(boardArr[y][x]);
    const friendlySelector = pieceIsWhite ? isWhite : isBlack;
    const enemySelector = pieceIsWhite ? isBlack : isWhite;
    return [friendlySelector, enemySelector];
};

const getCastling = (
    boardArr: string[][],
    x: number,
    y: number,
    castling: {k: boolean; K: boolean; q: boolean; Q: boolean},
): number[][] => {
    const castlableSqs: number[][] = [];
    const [friendlySelector, enemySelector] = getPieceSelectors(boardArr, x, y);
    // If we're in check, we can't castle
    const [inCheck, king] = getCheck(boardArr, friendlySelector, enemySelector);
    if (inCheck) {
        return castlableSqs;
    }
    // For the directions we have the right to castle, if we are going through check
    // or into check, we also can't castle
    const sqsToCheck = {
        q: [
            [3, 0],
            [1, 0],
            [2, 0],
        ],
        Q: [
            [3, 7],
            [1, 7],
            [2, 7],
        ],
        k: [
            [5, 0],
            [6, 0],
        ],
        K: [
            [5, 7],
            [6, 7],
        ],
    };
    Object.keys(castling)
        .filter((i) => friendlySelector(i))
        .forEach((key: 'k' | 'K' | 'q' | 'Q') => {
            if (castling[key]) {
                let canCastle = true;
                sqsToCheck[key].every((sq) => {
                    const [dummyBoard, dummyEnPassant] = movePiece(
                        boardArr,
                        x,
                        y,
                        sq[0],
                        sq[1],
                    );
                    const [dummyInCheck, dummyKing] = getCheck(
                        dummyBoard,
                        friendlySelector,
                        enemySelector,
                    );
                    if (dummyInCheck) {
                        canCastle = false;
                        return false;
                    } else {
                        return true;
                    }
                });
                if (canCastle) {
                    castlableSqs.push(sqsToCheck[key].at(-1) as number[]);
                }
            }
        });
    return castlableSqs;
};

const getAvailableSqs = (
    boardArr: string[][],
    x: number,
    y: number,
    enPassant: null | number[] = null,
    castling: {k: boolean; K: boolean; q: boolean; Q: boolean},
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
            // Regular moves
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
            // Castling
            output.push(...getCastling(boardArr, x, y, castling));
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

const getCheck = (
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
    const [resultingBoard, enPassant] = movePiece(boardArr, x, y, X, Y);
    const friendlySelector = isWhite(boardArr[y][x]) ? isWhite : isBlack;
    const enemySelector = isWhite(boardArr[y][x]) ? isBlack : isWhite;
    const [check, king] = getCheck(
        resultingBoard,
        friendlySelector,
        enemySelector,
    );
    return !check;
};

const hasNoMoves = (
    boardArr: string[][],
    whiteToMove: boolean,
    enPassant: number[] | null,
    castling: {k: boolean; K: boolean; q: boolean; Q: boolean},
): boolean => {
    const colorSelector = whiteToMove ? isWhite : isBlack;
    const allPieces = getAllPieces(boardArr, colorSelector);
    let noMoves = true;
    Object.entries(allPieces).every(
        ([piece, squares]: [string, number[][]]) => {
            squares.every((pieceSq) => {
                if (
                    getAvailableSqs(
                        boardArr,
                        pieceSq[0],
                        pieceSq[1],
                        enPassant,
                        castling,
                    ).filter((candidateSq) =>
                        isValidMove(
                            boardArr,
                            pieceSq[0],
                            pieceSq[1],
                            candidateSq[0],
                            candidateSq[1],
                        ),
                    ).length > 0
                ) {
                    noMoves = false;
                }
                return noMoves;
            });
            // Every will break as soon as checkmate is false, otherwise we
            // will check every piece before returning true
            return noMoves;
        },
    );
    return noMoves;
};

export {
    getAvailableSqs,
    movePiece,
    getCheck as isInCheck,
    isValidMove,
    hasNoMoves,
};
