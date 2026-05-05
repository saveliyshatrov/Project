import { Router, Request, Response } from 'express';
import { resolverRegistry } from 'shared/resolver';

import { validate } from '../../middleware/validate';

import { ResolverQuerySchema } from './schemas';

const router = Router();

router.get('/resolver', validate(ResolverQuerySchema, 'query'), async (req: Request, res: Response) => {
    const { resolver, params } = (req as unknown as Record<string, unknown>).validatedQuery as {
        resolver: string;
        params?: string;
    };

    const entry = resolverRegistry.get(resolver);
    if (!entry) {
        res.status(404).json({ success: false, error: `Resolver "${resolver}" not found` });
        return;
    }

    try {
        const parsedParams = params ? JSON.parse(params) : {};
        const result = await entry.func({ isServer: true }, parsedParams);
        console.log({
            result__: result,
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
