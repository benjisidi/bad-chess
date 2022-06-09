/**
 * Created by: Andrey Polyakov (andrey@polyakov.im)
 */

import React, {lazy} from 'react';
import {RecoilRoot} from 'recoil';

import {stylesContainer} from './app.module.less';
import {stylesHeader} from './app.module.scss';
import Chessboard from './p5-canvas';

// const LazyStrawberryIcon = lazy(() => import('./strawberry'));
export const App = (): React.ReactElement => (
    <RecoilRoot>
        <div className={stylesContainer}>
            <div className={stylesHeader}>Bad Chess</div>
            {/* <Suspense fallback={'loading...'}>
            <LazyStrawberryIcon className={stylesImage} />
        </Suspense>
        <div>
            <a
                className={cn(stylesLink)}
                href="https://github.com/glook/webpack-typescript-react"
                target="_blank"
            >
                @glook/webpack-typescript-react ({packageJson.version})
            </a>
        </div> */}
            <Chessboard />
        </div>
    </RecoilRoot>
);
