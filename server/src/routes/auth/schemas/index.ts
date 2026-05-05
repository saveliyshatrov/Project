import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const RegisterSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
});
