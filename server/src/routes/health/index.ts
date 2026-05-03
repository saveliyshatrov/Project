import { Router, Request, Response } from 'express';
import { VERSION } from 'shared';
import { DeviceType } from 'shared/utils/getDeviceType';

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 device:
 *                   type: string
 *                   enum: [mobile, desktop]
 *                 platform:
 *                   type: string
 *                 browser:
 *                   type: string
 */

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
