import { Router, Request, Response } from 'express';
import { DeviceType } from 'shared/utils/getDeviceType';

/**
 * @openapi
 * /device:
 *   get:
 *     tags: [Device]
 *     summary: Detect client device type
 *     responses:
 *       200:
 *         description: Device information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   enum: [mobile, desktop]
 *                 platform:
 *                   type: string
 *                 browser:
 *                   type: string
 *                 isMobile:
 *                   type: boolean
 *                 isTablet:
 *                   type: boolean
 *                 isDesktop:
 *                   type: boolean
 */

function getDeviceType(req: Request): DeviceType {
    if (req.useragent?.isMobile) return DeviceType.mobile;
    return DeviceType.desktop;
}

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
