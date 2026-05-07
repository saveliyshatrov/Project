import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const ResolverQuerySchema = z.object({
    resolver: z.string().min(1),
});

export const ResolverParamsBodySchema = z.object({
    params: z.record(z.string(), z.unknown()).optional(),
});
