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

export default router;
