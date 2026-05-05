import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { OpenAPIObject } from 'openapi3-ts/oas30';
import { z } from 'zod';

extendZodWithOpenApi(z);

import { RegisterSchema } from './routes/auth/schemas';
import { ResolverQuerySchema } from './routes/resolver/schemas';
import { CreateUserSchema, UserIdParamSchema } from './routes/users/schemas';

const registry = new OpenAPIRegistry();

// Shared schemas
const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
});

// Components
registry.register('User', UserSchema);

// Health
registry.registerPath({
    method: 'get',
    path: '/health',
    tags: ['Health'],
    summary: 'Health check',
    responses: {
        200: {
            description: 'Server is running',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.string(),
                        version: z.string(),
                        device: z.enum(['mobile', 'desktop']),
                        platform: z.string().nullable().optional(),
                        browser: z.string().nullable().optional(),
                    }),
                },
            },
        },
    },
});

// Device
registry.registerPath({
    method: 'get',
    path: '/device',
    tags: ['Device'],
    summary: 'Detect client device type',
    responses: {
        200: {
            description: 'Device information',
            content: {
                'application/json': {
                    schema: z.object({
                        type: z.enum(['mobile', 'desktop']),
                        platform: z.string().nullable().optional(),
                        browser: z.string().nullable().optional(),
                        isMobile: z.boolean().optional(),
                        isTablet: z.boolean().optional(),
                        isDesktop: z.boolean().optional(),
                        source: z.string().nullable().optional(),
                    }),
                },
            },
        },
    },
});

// Users
registry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['Users'],
    summary: 'Get all users',
    responses: {
        200: {
            description: 'List of users',
            content: {
                'application/json': {
                    schema: z.array(UserSchema),
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/users/{id}',
    tags: ['Users'],
    summary: 'Get user by ID',
    request: {
        params: UserIdParamSchema,
    },
    responses: {
        200: {
            description: 'User found',
            content: {
                'application/json': {
                    schema: z.object({ user: UserSchema }),
                },
            },
        },
        404: {
            description: 'User not found',
            content: {
                'application/json': {
                    schema: z.object({ success: z.literal(false), error: z.string() }),
                },
            },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/users',
    tags: ['Users'],
    summary: 'Create a new user',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateUserSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'User created',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.literal(true),
                        data: z.string(),
                    }),
                },
            },
        },
    },
});

// Auth
registry.registerPath({
    method: 'post',
    path: '/auth/register',
    tags: ['Auth'],
    summary: 'Register a new user',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: RegisterSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'User registered successfully',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.literal(true),
                        user: UserSchema,
                    }),
                },
            },
        },
        400: {
            description: 'Validation error',
            content: {
                'application/json': {
                    schema: z.object({ success: z.literal(false), error: z.string() }),
                },
            },
        },
        409: {
            description: 'User already exists',
            content: {
                'application/json': {
                    schema: z.object({ success: z.literal(false), error: z.string() }),
                },
            },
        },
    },
});

// Resolver
registry.registerPath({
    method: 'get',
    path: '/resolver',
    tags: ['Resolver'],
    summary: 'Execute a shared resolver',
    request: {
        query: ResolverQuerySchema,
    },
    responses: {
        200: {
            description: 'Resolver result',
        },
        404: {
            description: 'Resolver not found',
            content: {
                'application/json': {
                    schema: z.object({ success: z.literal(false), error: z.string() }),
                },
            },
        },
        500: {
            description: 'Resolver execution error',
            content: {
                'application/json': {
                    schema: z.object({ success: z.literal(false), error: z.string() }),
                },
            },
        },
    },
});

export const swaggerSpec: OpenAPIObject = new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.0',
    info: {
        title: 'Project API',
        version: '1.0.0',
        description: 'REST API documentation',
    },
    servers: [
        {
            url: 'http://localhost:3001',
            description: 'Development server',
        },
    ],
});
