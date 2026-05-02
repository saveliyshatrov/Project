import path from 'node:path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';

const __dirname = path.dirname(import.meta.url);

console.log({
    path: path.resolve(__dirname),
    path_2: path.resolve(__dirname, './../shared/dist/client'),
    dist: path.resolve(__dirname, 'dist'),
});

export default {
    mode: 'development',
    target: 'web',
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].js[contenthash].js',
        clean: true,
        publicPath: 'auto',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
        plugins: [new TsconfigPathsPlugin()],
        // tsconfig: true,
        symlinks: false,
        // modules: [path.resolve(__dirname, '../shared/dist/client'), 'node_modules'],
        // alias: {
        //     shared: path.resolve(__dirname, 'node_modules/shared'),
        //     'shared/*': path.resolve(__dirname, 'node_modules/shared/*'),
        // },
    },
    devServer: {
        port: 3000,
        hot: true,
        liveReload: true,
        historyApiFallback: true,
        static: './public',
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
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
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
        new webpack.DefinePlugin({
            'process.env': {
                CLIENT: JSON.stringify(true),
            },
        }),
    ],
};
