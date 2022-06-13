import React from 'react';
import Inspector from 'react-inspector';

import {useChessState} from '../atoms/chessState';

const ChessStateInspector = () => {
    const [chessState, setChessState] = useChessState();
    return <Inspector data={chessState} />;
};

export default ChessStateInspector;
