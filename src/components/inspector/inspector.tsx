import Button from '@mui/material/Button';
import React, {useState} from 'react';
import Inspector from 'react-inspector';
import {useRecoilValue} from 'recoil';

import {boardAsFEN} from '@src/atoms/chessAtoms';
import {isBlack, isWhite} from '@src/util';

import {useChessState} from '../../atoms/chessState';
import QueeningModal from '../queeningModal/queeningModal';

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
