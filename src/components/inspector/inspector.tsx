import React from 'react';
import Inspector from 'react-inspector';
import {useRecoilValue} from 'recoil';

import {boardAsFEN} from '@src/atoms/common';

import {useChessState} from '../../atoms/chessState';

const ChessStateInspector = () => {
    const [chessState, setChessState] = useChessState();
    const FEN = useRecoilValue(boardAsFEN);
    return (
        <div>
            <Inspector data={chessState} />
            {FEN}
        </div>
    );
};

export default ChessStateInspector;
