import path from 'node:path';

import { Router } from 'express';

import { getDeviceType } from './device';

const router = Router();

router.get('{*splat}', async (req, res) => {
    try {
        const bundlePath = path.resolve(__dirname, '../../../client/dist/server/serverEntry.cjs');

        let serverEntry: { render: (url: string) => { html: string; state: Record<string, unknown> } };
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            serverEntry = require(bundlePath);
        } catch {
            res.status(500).json({ error: 'SSR bundle not found. Run `pnpm build:ssr` first.' });
            return;
        }

        const { html: bodyHtml, state } = serverEntry.render(req.originalUrl);

        const device = getDeviceType(req);

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
    <script src="http://localhost:3000/dist/${device}/js/main.js"></script>
</body>
</html>`;

        res.send(fullHtml);
    } catch (error) {
        console.error('[SSR] Error:', error);
        res.status(500).json({ error: 'SSR failed', message: (error as Error).message });
    }
});

export default router;
