import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientRoot = path.resolve(__dirname, 'client');

const config: webpack.Configuration = {
    context: clientRoot,
    mode: 'production',
    target: 'node',
    name: 'server',
    entry: './src/serverEntry.tsx',
    output: {
        path: path.resolve(clientRoot, 'dist/server'),
        filename: 'serverEntry.cjs',
        library: {
            type: 'commonjs2',
        },
        clean: true,
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        plugins: [new TsconfigPathsPlugin({ configFile: path.resolve(clientRoot, 'tsconfig.json') })],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    transpileOnly: true,
                },
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.SSR': JSON.stringify(true),
            'process.env.CLIENT': JSON.stringify(false),
            'process.env.PLATFORM': JSON.stringify('server'),
        }),
    ],
    externals: [
        {
            react: 'commonjs react',
            'react-dom': 'commonjs react-dom',
            'react-dom/server': 'commonjs react-dom/server',
            'react-redux': 'commonjs react-redux',
            'react-router': 'commonjs react-router',
            'react-router-dom': 'commonjs react-router-dom',
            '@reduxjs/toolkit': 'commonjs @reduxjs/toolkit',
            redux: 'commonjs redux',
            immer: 'commonjs immer',
        },
        ({ request }, callback) => {
            if (/^shared(\/.*)?$/.test(request)) {
                return callback(null, 'commonjs ' + request);
            }
            callback();
        },
    ],
    externalsPresets: { node: true },
    optimization: {
        minimize: false,
    },
};

export default config;
