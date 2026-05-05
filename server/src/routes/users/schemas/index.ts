import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const CreateUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
});

export const UserIdParamSchema = z.object({
    id: z.string().min(1),
});
