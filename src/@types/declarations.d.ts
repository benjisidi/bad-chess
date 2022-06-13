declare module '*.scss' {
    const content: {[className: string]: string};
    export = content;
}

declare module '*.less' {
    const content: {[className: string]: string};
    export = content;
}

declare module '*.svg' {
    import React = require('react');
    const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement>
    >;
    export default ReactComponent;
}

declare module '*.json' {
    const content: Record<string, string>;
    export default content;
}

declare const IS_PROD: boolean;
declare const IS_DEV: boolean;
declare const IS_DEV_SERVER: boolean;

declare interface ChessState {
    boardArray: string[][];
    castling: {k: boolean; K: boolean; q: boolean; Q: boolean};
    enPassant: number[] | null;
    halfMoveCounter: number;
    moveCounter: number;
    selectedX: number | null;
    selectedY: number | null;
    whiteToMove: boolean;
}

declare type Modify<T, R> = Omit<T, keyof R> & R;

declare interface ChessStateUpdateOverrides {
    castling: {k?: boolean; K?: boolean; q?: boolean; Q?: boolean};
    enPassant: number[] | null;
}

type ChessStateUpdate = Modify<Partial<ChessState>, ChessStateUpdateOverrides>;
