import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.resolve(rootDir, 'package.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const srcDir = path.resolve(rootDir, 'src');

function makeExport(basePath, isWildcard = false) {
    const ext = isWildcard ? '*' : 'index';
    return {
        types: {
            import: `./dist/client/${basePath}/${ext}.d.ts`,
            require: `./dist/server/${basePath}/${ext}.d.ts`,
        },
        import: `./dist/client/${basePath}/${ext}.js`,
        require: `./dist/server/${basePath}/${ext}.cjs`,
        default: `./dist/client/${basePath}/${ext}.js`,
    };
}

const exports = {
    '.': makeExport('', false),
};

const entries = fs.readdirSync(srcDir, { withFileTypes: true });

for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    if (entry.isDirectory()) {
        const hasIndex =
            fs.existsSync(path.join(srcDir, entry.name, 'index.ts')) ||
            fs.existsSync(path.join(srcDir, entry.name, 'index.tsx'));

        if (hasIndex) {
            exports[`./${entry.name}`] = makeExport(entry.name, false);

            const files = fs.readdirSync(path.join(srcDir, entry.name));
            const hasSubModules = files.some((f) => /^index\.(ts|tsx)$/.test(f) === false && /\.(ts|tsx)$/.test(f));

            if (hasSubModules) {
                exports[`./${entry.name}/*`] = makeExport(entry.name, true);
            }
        }
    }
}

pkg.exports = exports;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log('Generated exports:', Object.keys(exports));
