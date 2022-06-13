const isWhite = (x: string) => x === x.toUpperCase();
const isBlack = (x: string) => x === x.toLowerCase();
const flat2board = (coord: number) => [coord % 8, Math.floor(coord / 8)];
const board2flat = (coord: [x: number, y: number]) => coord[0] * 8 + coord[1];

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
        whiteToMove: toMove === 'w',
    };
};
export {isBlack, isWhite, flat2board, board2flat, parseFEN};
