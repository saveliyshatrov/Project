import { Router, Request, Response } from 'express';
import { DeviceType } from 'shared/utils/getDeviceType';

export const getDeviceType = (req: Request): DeviceType => {
    if (req.useragent?.isMobile) return DeviceType.mobile;
    return DeviceType.desktop;
};

const router = Router();

router.get('/device', (req: Request, res: Response) => {
    res.json({
        type: getDeviceType(req),
        platform: req.useragent?.platform,
        browser: req.useragent?.browser,
        isMobile: req.useragent?.isMobile,
        isTablet: req.useragent?.isTablet,
        isDesktop: req.useragent?.isDesktop,
        source: req.useragent?.source,
    });
});

export default router;
