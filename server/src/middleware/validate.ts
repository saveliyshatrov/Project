import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export function validate<T extends ZodType>(schema: T, source: 'body' | 'query' | 'params' = 'body') {
    return (req: Request, res: Response, next: NextFunction) => {
        const data = source === 'query' ? { ...req.query } : source === 'params' ? { ...req.params } : req.body;
        const result = schema.safeParse(data);

        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
            });
            return;
        }

        if (source === 'body') {
            req.body = result.data;
        } else if (source === 'params') {
            req.params = result.data as typeof req.params;
        } else {
            (req as unknown as Record<string, unknown>).validatedQuery = result.data;
        }

        next();
    };
}
