import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import * as expressUseragent from 'express-useragent';
import webpack from 'webpack';

import { createClientConfig } from './webpack.client.base.config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use('/resolver', async (req, res) => {
    try {
        const query = new URLSearchParams(req.query as Record<string, string>);
        const response = await fetch(`${API_URL}/resolver?${query.toString()}`);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch {
        res.status(502).json({ error: 'Failed to reach API server' });
    }
});

app.use('/dist/mobile', express.static(path.join(__dirname, 'client/dist/mobile')));
app.use('/dist/desktop', express.static(path.join(__dirname, 'client/dist/desktop')));

app.get('*', (req, res) => {
    const device = getDeviceType(req);
    res.sendFile(path.join(__dirname, `client/dist/${device}/index.html`));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Dev server running on http://localhost:${PORT}`);
    console.log(`  Mobile: use mobile User-Agent`);
    console.log(`  Desktop: use desktop User-Agent`);
});
