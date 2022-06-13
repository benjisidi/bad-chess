/**
 * Boilerplate by: Andrey Polyakov (andrey@polyakov.im)
 */

import React from 'react';
import {RecoilRoot} from 'recoil';

import Chessboard from '../chessboard/chessboard';
import ChessStateInspector from '../inspector/inspector';
import {
    stylesContainer,
    stylesHorizContainer,
    stylesVertContainer,
} from './app.module.less';
import {stylesHeader} from './app.module.scss';

export const App = (): React.ReactElement => (
    <RecoilRoot>
        <div className={stylesContainer}>
            <div className={stylesHorizContainer}>
                <ChessStateInspector />
                <div className={stylesVertContainer}>
                    <div className={stylesHeader}>Bad Chess</div>
                    <Chessboard />
                </div>
            </div>
        </div>
    </RecoilRoot>
);
