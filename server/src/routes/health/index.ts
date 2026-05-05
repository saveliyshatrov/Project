import { Router, Request, Response } from 'express';
import { VERSION } from 'shared';
import { DeviceType } from 'shared/utils/getDeviceType';

function getDeviceType(req: Request): DeviceType {
    if (req.useragent?.isMobile) return DeviceType.mobile;
    return DeviceType.desktop;
}

const router = Router();

router.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        version: VERSION,
        device: getDeviceType(req),
        platform: req.useragent?.platform,
        browser: req.useragent?.browser,
    });
});

export default router;
