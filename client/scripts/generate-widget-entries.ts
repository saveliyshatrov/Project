import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const widgetsDir = path.resolve(__dirname, '..', 'src', 'widget');

const EXCLUDED_DIRS = new Set(['__tests__']);

function dirToWidgetName(dir: string): string {
    return dir.charAt(0).toUpperCase() + dir.slice(1) + 'Widget';
}

export function generateWidgetEntries(): { generated: number; skipped: number } {
    const dirs = fs
        .readdirSync(widgetsDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && !EXCLUDED_DIRS.has(dirent.name))
        .map((dirent) => dirent.name);

    let generated = 0;
    let skipped = 0;

    for (const dir of dirs) {
        const dirPath = path.join(widgetsDir, dir);
        const widgetPath = path.join(dirPath, 'widget.tsx');

        if (!fs.existsSync(widgetPath)) {
            console.log(`[widget-gen] Skipping "${dir}": no widget.tsx found`);
            skipped++;
            continue;
        }

        const name = dirToWidgetName(dir);
        const indexPath = path.join(dirPath, 'index.tsx');
        const content = `import { createWidget } from '@widget';

export const ${name} = createWidget({
    name: '${name}',
    loader: () => import(/* webpackChunkName: "${name}" */ './widget'),
});
`;

        const existing = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf-8') : null;
        if (existing !== content) {
            fs.writeFileSync(indexPath, content);
            console.log(`[widget-gen] Generated ${dir}/index.tsx (name: "${name}")`);
            generated++;
        }
    }

    console.log(`[widget-gen] Done. Generated/updated ${generated}, skipped ${skipped}.`);
    return { generated, skipped };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    generateWidgetEntries();
}
