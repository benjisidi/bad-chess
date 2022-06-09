const isUpperCase = (x: string) => x === x.toUpperCase();
const isLowerCase = (x: string) => x === x.toLowerCase();
const flat2board = (coord: number) => [coord % 8, Math.floor(coord / 8)];
const board2flat = (coord: [x: number, y: number]) => coord[0] * 8 + coord[1];
export {isLowerCase, isUpperCase, flat2board, board2flat};
