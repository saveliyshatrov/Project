import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const ResolverQuerySchema = z.object({
    resolver: z.string().min(1),
    params: z.string().optional(),
});
