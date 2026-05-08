import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import * as expressUseragent from 'express-useragent';
import webpack from 'webpack';

import { createClientConfig } from './webpack.client.base.config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const widgetsDir = path.join(__dirname, 'client/src/widget');

function runWidgetGen() {
    execSync('pnpm exec tsx client/scripts/generate-widget-entries.ts', { cwd: __dirname, stdio: 'inherit' });
}

runWidgetGen();

fs.watch(widgetsDir, { recursive: true }, (eventType, filename) => {
    if (
        filename &&
        (filename.endsWith('widget.tsx') || filename.endsWith('controller.ts') || filename.endsWith('skeleton.tsx'))
    ) {
        console.log('[widget-gen] Detected change, regenerating...');
        runWidgetGen();
    }
});

const app = express();

const enum DeviceType {
    mobile = 'mobile',
    desktop = 'desktop',
}

app.use(expressUseragent.express());

function getDeviceType(req: express.Request): DeviceType {
    if (req.useragent?.isMobile) return DeviceType.mobile;
    return DeviceType.desktop;
}

const mobileConfig = createClientConfig('mobile', 'development');
const desktopConfig = createClientConfig('desktop', 'development');

const mobileCompiler = webpack(mobileConfig);
const desktopCompiler = webpack(desktopConfig);

mobileCompiler.watch({}, () => {});
desktopCompiler.watch({}, () => {});

const API_URL = process.env.API_URL || 'http://localhost:3001';

app.use(express.json());

app.use('/resolver', async (req, res) => {
    try {
        const response = await fetch(`${API_URL}${req.originalUrl}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch {
        res.status(502).json({ error: 'Failed to reach API server' });
    }
});

app.use('/dist/mobile', express.static(path.join(__dirname, 'client/dist/mobile')));
app.use('/dist/desktop', express.static(path.join(__dirname, 'client/dist/desktop')));

const ssrBundlePath = path.join(__dirname, 'client/dist/server/serverEntry.cjs');

app.get('{*splat}', async (req, res) => {
    const device = getDeviceType(req);

    try {
        const _require = createRequire(import.meta.url);

        const serverEntry: { render: (url: string) => { html: string; state: Record<string, unknown> } } =
            _require(ssrBundlePath);

        const { html: bodyHtml, state } = serverEntry.render(req.originalUrl);

        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Project - SSR</title>
</head>
<body>
    <div id="root">${bodyHtml}</div>
    <script>window.__INITIAL_STATE__ = ${JSON.stringify(state)};</script>
    <script src="/dist/${device}/js/main.js"></script>
</body>
</html>`;

        res.send(fullHtml);
    } catch {
        res.sendFile(path.join(__dirname, `client/dist/${device}/index.html`));
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Dev server running on http://localhost:${PORT}`);
    console.log(`  Mobile: use mobile User-Agent`);
    console.log(`  Desktop: use desktop User-Agent`);
});
