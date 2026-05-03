import path from 'path';

import express, { Router, Request, Response } from 'express';
import { DeviceType } from 'shared/utils/getDeviceType';

function getDeviceType(req: Request): DeviceType {
    if (req.useragent?.isMobile) return DeviceType.mobile;
    return DeviceType.desktop;
}

const router = Router();

router.use('/dist/mobile', express.static(path.join(__dirname, '../../../client/dist/mobile')));
router.use('/dist/desktop', express.static(path.join(__dirname, '../../../client/dist/desktop')));

router.get('{*splat}', (req: Request, res: Response) => {
    const device = getDeviceType(req);
    const indexPath = path.join(__dirname, `../../../client/dist/${device}/index.html`);
    res.sendFile(indexPath);
});

export default router;
