import { Router, Request, Response } from 'express';
import { resolverRegistry } from 'shared/resolver';

/**
 * @openapi
 * /resolver:
 *   get:
 *     tags: [Resolver]
 *     summary: Execute a shared resolver
 *     parameters:
 *       - in: query
 *         name: resolver
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: params
 *         schema:
 *           type: string
 *           description: JSON-encoded params
 *     responses:
 *       200:
 *         description: Resolver result
 *       400:
 *         description: Missing resolver name
 *       404:
 *         description: Resolver not found
 *       500:
 *         description: Resolver execution error
 */

const router = Router();

router.get('/resolver', async (req: Request, res: Response) => {
    const { resolver, params } = req.query;

    if (!resolver || typeof resolver !== 'string') {
        res.status(400).json({ success: false, error: 'Missing resolver name' });
        return;
    }

    const entry = resolverRegistry.get(resolver);
    if (!entry) {
        res.status(404).json({ success: false, error: `Resolver "${resolver}" not found` });
        return;
    }

    try {
        const parsedParams = params ? JSON.parse(params as string) : {};
        const result = await entry.func({ isServer: true }, parsedParams);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
