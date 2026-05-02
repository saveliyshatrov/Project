import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Platform = 'mobile' | 'desktop';

export function createConfig(
    platform: Platform,
    mode: 'development' | 'production',
    overrides: Partial<webpack.Configuration> = {}
): webpack.Configuration {
    const isProd = mode === 'production';
    const platformSuffix = `.${platform}`;

    return {
        context: __dirname,
        mode,
        target: 'web',
        name: platform,
        entry: './src/index.tsx',
        output: {
            path: path.resolve(__dirname, `dist/${platform}`),
            filename: isProd ? '[name].[contenthash].js' : 'js/[name].js',
            clean: isProd,
            publicPath: `/dist/${platform}/`,
        },
        optimization: isProd
            ? {
                  runtimeChunk: 'single',
                  splitChunks: {
                      chunks: 'all',
                  },
              }
            : undefined,
        resolve: {
            extensions: [`${platformSuffix}.tsx`, `${platformSuffix}.ts`, '.tsx', '.ts', '.js', '.jsx', '.json'],
            plugins: [new TsconfigPathsPlugin()],
            symlinks: false,
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
            new webpack.NormalModuleReplacementPlugin(/^(.*\/)?([^/]+?)(\.tsx?|\.jsx?)$/, (resource) => {
                const dir = path.dirname(resource.request);
                const basename = path.basename(resource.request);
                const ext = path.extname(resource.request);
                const nameWithoutExt = basename.slice(0, -ext.length);

                const platformFile = path.join(dir, `${nameWithoutExt}${platformSuffix}${ext}`);

                if (fs.existsSync(platformFile)) {
                    resource.request = platformFile;
                }
            }),
            new HtmlWebpackPlugin({
                title: `Project - ${platform}`,
                template: './public/index.html',
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    CLIENT: JSON.stringify(true),
                    PLATFORM: JSON.stringify(platform),
                },
            }),
        ],
        ...overrides,
    };
}
