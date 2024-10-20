import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
    test: [/\.css$/, /\.s[ac]ss$/i],
    use: [
        { loader: 'style-loader' }, 
        { loader: 'css-loader' },
        { loader: 'sass-loader' }
    ]
});

rules.push({
    test: /\.png$/i,
    use: [
        { loader: 'url-loader' }
    ]
});


export const rendererConfig: Configuration = {
    module: {
        rules,
    },
    plugins,
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.json'],
    }
};
