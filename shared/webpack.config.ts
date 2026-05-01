import path from 'path';
import fs from 'fs';
import { glob } from 'glob';
import type { Configuration } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import { fileURLToPath } from 'node:url';

interface Env {
    target?: 'client' | 'server';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getEntries(target: 'client' | 'server'): Record<string, string> {
    const srcDir = path.resolve(__dirname, 'src');
    const entries: Record<string, string> = {};

    console.log(`\n🔍 Scanning for ${target} files...`);

    // Shared files (no .client or .server suffix)
    const shared = glob.sync('**/*.{ts,tsx}', {
        cwd: srcDir,
        ignore: ['**/*.d.ts', '**/node_modules/**', '**/*.client.{ts,tsx}', '**/*.server.{ts,tsx}'],
    });

    // Platform specific files
    const specificPattern = target === 'client' ? '**/*.client.{ts,tsx}' : '**/*.server.{ts,tsx}';

    const specific = glob.sync(specificPattern, {
        cwd: srcDir,
        ignore: ['**/*.d.ts', '**/node_modules/**'],
    });

    const allFiles = [...shared, ...specific];

    console.log(`   Found ${allFiles.length} total files`);

    allFiles.forEach((file) => {
        let name = file
            .replace(/\.client\.(ts|tsx)$/, '')
            .replace(/\.server\.(ts|tsx)$/, '')
            .replace(/\.ts$/, '')
            .replace(/\.tsx$/, '');

        entries[name] = `./src/${file}`;
        console.log(`   ✓ ${file}  →  ${name}`);
    });

    if (Object.keys(entries).length === 0) {
        console.warn(`⚠️  WARNING: No entries found for ${target}!`);
    }

    return entries;
}

const createConfig = (target: 'client' | 'server'): Configuration => {
    const entries = getEntries(target);
    const isClient = target === 'client';

    console.log(`\n🚀 Building ${target.toUpperCase()} with ${Object.keys(entries).length} entries`);

    return {
        name: target,
        mode: 'development',
        context: __dirname,

        entry: entries,

        target: isClient ? 'web' : 'node',

        output: {
            path: path.resolve(__dirname, `dist/${target}`),
            filename: '[name].js',
            clean: true,
        },

        optimization: {
            minimize: false,
        },

        devtool: false,

        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
        },

        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },

        plugins: [
            ,
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'src', target === 'client' ? 'client' : 'server'),
                        to: '.',
                        noErrorOnMissing: true,
                    },
                    // Generate package.json in dist/client and dist/server
                    {
                        from: path.resolve(__dirname, 'package.json'),
                        to: 'package.json',
                        transform(content) {
                            const pkg = JSON.parse(content.toString());

                            return JSON.stringify(
                                {
                                    name: `${pkg.name}`,
                                    version: pkg.version,
                                    main: 'index.js',
                                    types: '../index.d.ts',
                                    type: 'commonjs',
                                    private: true,
                                },
                                null,
                                2
                            );
                        },
                    },
                ],
            }),
        ],

        ...(!isClient && {
            externals: [
                ({ request }: any, callback: any) => {
                    if (/^[^./]/.test(request)) {
                        return callback(null, 'commonjs ' + request);
                    }
                    callback();
                },
            ],
        }),
    };
};

export default (env: Env = {}): Configuration | Configuration[] => {
    console.log('Webpack started with env:', env);

    if (env.target === 'client') return createConfig('client');
    if (env.target === 'server') return createConfig('server');

    return [createConfig('client'), createConfig('server')];
};
