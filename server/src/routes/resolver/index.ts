import { Router, Request, Response } from 'express';
import { resolverRegistry } from 'shared/resolver';

import { validate } from '../../middleware/validate';

import { ResolverParamsBodySchema, ResolverQuerySchema } from './schemas';

const router = Router();

router.post(
    '/resolver',
    validate(ResolverQuerySchema, 'query'),
    validate(ResolverParamsBodySchema, 'body'),
    async (req: Request, res: Response) => {
        const { resolver } = (req as unknown as Record<string, unknown>).validatedQuery as { resolver: string };
        const { params } = req.body as { params?: Record<string, unknown> };

        const entry = resolverRegistry.get(resolver);
        if (!entry) {
            res.status(404).json({ error: `Resolver "${resolver}" not found` });
            return;
        }

        try {
            const result = await entry.func({ isServer: true }, params ?? {});
            res.json(result);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
);

router.post('/resolver/batch', async (req: Request, res: Response) => {
    const { batch } = req.body as { batch?: Array<{ resolver: string; params?: Record<string, unknown> }> };

    if (!Array.isArray(batch)) {
        res.status(400).json({ error: 'batch must be an array' });
        return;
    }

    const results = await Promise.all(
        batch.map(async ({ resolver, params }) => {
            const entry = resolverRegistry.get(resolver);
            if (!entry) {
                return { error: `Resolver "${resolver}" not found` };
            }

            try {
                return await entry.func({ isServer: true }, params ?? {});
            } catch (error) {
                return {
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
            }
        })
    );

    res.json(results);
});

export default router;
