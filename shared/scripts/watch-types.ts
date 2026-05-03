import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const typesDir = path.resolve(rootDir, 'dist/_types');
const distClient = path.resolve(rootDir, 'dist/client');
const distServer = path.resolve(rootDir, 'dist/server');

// Ensure typesDir exists
if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
    console.log('Created types directory');
}

function distributeFiles() {
    if (!fs.existsSync(typesDir)) return;

    const files = getAllFiles(typesDir);

    for (const fullPath of files) {
        const relativePath = path.relative(typesDir, fullPath);
        const entryName = path.basename(fullPath);

        if (!/\.d\.ts(\.map)?$/.test(entryName)) continue;

        const isClientFile = /\.client\.d\.ts(\.map)?$/.test(entryName);
        const isServerFile = /\.server\.d\.ts(\.map)?$/.test(entryName);

        if (!isClientFile && !isServerFile) {
            copyTo(path.join(distClient, relativePath), fullPath);
            copyTo(path.join(distServer, relativePath), fullPath);
        }

        if (isClientFile) {
            const targetName = entryName
                .replace(/\.client\.d\.ts/, '.d.ts')
                .replace(/\.client\.d\.ts\.map/, '.d.ts.map');
            const targetPath = path.join(distClient, path.dirname(relativePath), targetName);
            copyTo(targetPath, fullPath);
        }

        if (isServerFile) {
            const targetName = entryName
                .replace(/\.server\.d\.ts/, '.d.ts')
                .replace(/\.server\.d\.ts\.map/, '.d.ts.map');
            const targetPath = path.join(distServer, path.dirname(relativePath), targetName);
            copyTo(targetPath, fullPath);
        }
    }
}

function getAllFiles(dir: string): string[] {
    const result: string[] = [];
    if (!fs.existsSync(dir)) return result;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            result.push(...getAllFiles(fullPath));
        } else {
            result.push(fullPath);
        }
    }
    return result;
}

function copyTo(targetPath: string, sourcePath: string) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
}

// Initial distribution
distributeFiles();
console.log('Types distributed (initial)');

// Watch for changes
let timeout: NodeJS.Timeout | null = null;

fs.watch(typesDir, { recursive: true }, (event, filename) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
        distributeFiles();
        console.log(`Types redistributed (${event}: ${filename})`);
    }, 300);
});

console.log('Watching for type declaration changes...');
