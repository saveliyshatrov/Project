import { fileURLToPath } from 'node:url';
import path from 'path';

import { glob } from 'glob';
import type { Configuration } from 'webpack';

interface Env {
    target?: 'client' | 'server';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getEntries(target: 'client' | 'server'): Record<string, string> {
    const srcDir = path.resolve(__dirname, 'src');
    const entries: Record<string, string> = {};

    const allFiles = glob.sync('**/*.{ts,tsx}', {
        cwd: srcDir,
        ignore: ['**/*.d.ts', '**/node_modules/**'],
    });

    for (const file of allFiles) {
        const isClientFile = /\.client\.(ts|tsx)$/.test(file);
        const isServerFile = /\.server\.(ts|tsx)$/.test(file);

        if (target === 'client' && isServerFile) continue;
        if (target === 'server' && isClientFile) continue;

        const name = file
            .replace(/\.client\.(ts|tsx)$/, '')
            .replace(/\.server\.(ts|tsx)$/, '')
            .replace(/\.tsx?$/, '');

        entries[name] = `./src/${file}`;
    }

    return entries;
}

const createConfig = (target: 'client' | 'server'): Configuration => {
    const entries = getEntries(target);
    const isClient = target === 'client';

    return {
        name: target,
        mode: 'development',
        context: __dirname,

        entry: entries,

        target: isClient ? 'web' : 'node',

        output: {
            path: path.resolve(__dirname, `dist/${target}`),
            filename: isClient ? '[name].js' : '[name].cjs',
            library: {
                type: isClient ? 'module' : 'commonjs2',
            },
            clean: true,
        },

        experiments: {
            outputModule: true,
        },

        optimization: {
            minimize: false,
        },

        devtool: false,

        watchOptions: {
            ignored: /node_modules/,
        },

        resolve: {
            extensions: isClient
                ? ['.client.ts', '.client.tsx', '.ts', '.tsx', '.js']
                : ['.server.ts', '.server.tsx', '.ts', '.tsx', '.js'],
        },

        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    },
                    exclude: /node_modules/,
                },
            ],
        },

        externalsPresets: isClient ? {} : { node: true },

        ...(!isClient && {
            externals: [
                ({ request }, callback) => {
                    if (/^[^./]/.test(request)) {
                        return callback(null, 'commonjs ' + request);
                    }
                    callback();
                },
            ] as Configuration['externals'],
        }),
    };
};

export default (env: Env = {}): Configuration | Configuration[] => {
    if (env.target === 'client') return createConfig('client');
    if (env.target === 'server') return createConfig('server');

    return [createConfig('client'), createConfig('server')];
};
