import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import * as expressUseragent from 'express-useragent';
import { DeviceType } from 'shared/utils/getDeviceType';
import webpack from 'webpack';

import { createConfig } from './webpack.base.config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(expressUseragent.express());

function getDeviceType(req) {
    if (req.useragent?.isMobile) return DeviceType.mobile;
    return DeviceType.desktop;
}

const mobileConfig = createConfig('mobile', 'development');
const desktopConfig = createConfig('desktop', 'development');

const mobileCompiler = webpack(mobileConfig);
const desktopCompiler = webpack(desktopConfig);

mobileCompiler.watch({}, () => {});
desktopCompiler.watch({}, () => {});

app.use('/dist/mobile', express.static(path.join(__dirname, 'dist/mobile')));
app.use('/dist/desktop', express.static(path.join(__dirname, 'dist/desktop')));

app.get('*', (req, res) => {
    const device = getDeviceType(req);
    res.sendFile(path.join(__dirname, `dist/${device}/index.html`));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Dev server running on http://localhost:${PORT}`);
    console.log(`  Mobile: use mobile User-Agent`);
    console.log(`  Desktop: use desktop User-Agent`);
});
