import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.resolve(rootDir, 'package.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const srcDir = path.resolve(rootDir, 'src');

const exports = {
    '.': {
        types: './dist/client/index.d.ts',
        import: './dist/client/index.js',
        require: './dist/server/index.cjs',
        default: './dist/client/index.js',
    },
};

// Scan for subdirectories and top-level files in src/
const entries = fs.readdirSync(srcDir, { withFileTypes: true });

for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    if (entry.isDirectory()) {
        // Check if directory has an index file
        const hasIndex = fs.existsSync(path.join(srcDir, entry.name, 'index.ts'))
            || fs.existsSync(path.join(srcDir, entry.name, 'index.tsx'));

        if (hasIndex) {
            exports[`./${entry.name}`] = {
                types: `./dist/client/${entry.name}/index.d.ts`,
                import: `./dist/client/${entry.name}/index.js`,
                require: `./dist/server/${entry.name}/index.cjs`,
                default: `./dist/client/${entry.name}/index.js`,
            };

            // Check if directory contains sub-modules (wildcard)
            const files = fs.readdirSync(path.join(srcDir, entry.name));
            const hasSubModules = files.some(f =>
                /^index\.(ts|tsx)$/.test(f) === false
                && /\.(ts|tsx)$/.test(f)
            );

            if (hasSubModules) {
                exports[`./${entry.name}/*`] = {
                    types: `./dist/client/${entry.name}/*.d.ts`,
                    import: `./dist/client/${entry.name}/*.js`,
                    require: `./dist/server/${entry.name}/*.cjs`,
                    default: `./dist/client/${entry.name}/*.js`,
                };
            }
        }
    }
}

pkg.exports = exports;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log('Generated exports:', Object.keys(exports));
