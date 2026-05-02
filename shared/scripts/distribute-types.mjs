import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const typesDir = path.resolve(rootDir, 'dist/_types');

// Step 1: Generate declarations with tsc
console.log('Generating type declarations...');
execSync('npx tsc --emitDeclarationOnly --declaration --declarationMap --outDir dist/_types', {
    cwd: rootDir,
    stdio: 'inherit',
});

// Step 2: Distribute .d.ts files to dist/client and dist/server
console.log('Distributing type declarations...');

const distClient = path.resolve(rootDir, 'dist/client');
const distServer = path.resolve(rootDir, 'dist/server');

function distributeFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            distributeFiles(fullPath);
            continue;
        }

        const relativePath = path.relative(typesDir, fullPath);

        // Only process .d.ts and .d.ts.map files
        if (!/\.d\.ts(\.map)?$/.test(entry.name)) continue;

        const isClientFile = /\.client\.d\.ts(\.map)?$/.test(entry.name);
        const isServerFile = /\.server\.d\.ts(\.map)?$/.test(entry.name);

        if (!isClientFile && !isServerFile) {
            // Common file — copy to both
            copyTo(path.join(distClient, relativePath), fullPath);
            copyTo(path.join(distServer, relativePath), fullPath);
        }

        if (isClientFile) {
            const targetName = entry.name.replace(/\.client\.d\.ts/, '.d.ts');
            const targetPath = path.join(distClient, path.dirname(relativePath), targetName);
            copyTo(targetPath, fullPath);
        }

        if (isServerFile) {
            const targetName = entry.name.replace(/\.server\.d\.ts/, '.d.ts');
            const targetPath = path.join(distServer, path.dirname(relativePath), targetName);
            copyTo(targetPath, fullPath);
        }
    }
}

function copyTo(targetPath, sourcePath) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
}

distributeFiles(typesDir);

// Clean up temp directory
fs.rmSync(typesDir, { recursive: true, force: true });

console.log('Type declarations distributed successfully.');
