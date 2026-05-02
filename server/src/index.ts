import path from 'path';

import cors from 'cors';
import express, { Request, Response } from 'express';
import * as expressUseragent from 'express-useragent';
import { formatUser, User, VERSION } from 'shared';
import { RegisterRequest, AuthResponse } from 'shared/auth';
import { resolverRegistry } from 'shared/resolver';
import { NAME } from 'shared/resolver/examples';
import { DeviceType } from 'shared/utils/getDeviceType';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './swagger';

function getDeviceType(req: Request): DeviceType {
    if (req.useragent?.isMobile) return DeviceType.mobile;
    return DeviceType.desktop;
}

const app = express();
const PORT = process.env.PORT || 3001;

const whiteList = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: 'Content-Type,Authorization',
};

// Middleware
app.use(cors(whiteList));
app.use(express.json());
app.use(expressUseragent.express());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        version: VERSION,
        device: getDeviceType(req),
        platform: req.useragent.platform,
        browser: req.useragent.browser,
    });
});

/**
 * @openapi
 * /device:
 *   get:
 *     tags: [Device]
 *     summary: Detect client device type
 *     responses:
 *       200:
 *         description: Device information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   enum: [mobile, tablet, desktop]
 *                 platform:
 *                   type: string
 *                 browser:
 *                   type: string
 *                 isMobile:
 *                   type: boolean
 *                 isTablet:
 *                   type: boolean
 *                 isDesktop:
 *                   type: boolean
 */

// Device detection
app.get('/device', (req: Request, res: Response) => {
    res.json({
        type: getDeviceType(req),
        platform: req.useragent.platform,
        browser: req.useragent.browser,
        isMobile: req.useragent.isMobile,
        isTablet: req.useragent.isTablet,
        isDesktop: req.useragent.isDesktop,
        source: req.useragent.source,
    });
});

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: User management
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required: [id, name, email]
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *     RegisterRequest:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *           minLength: 6
 */

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

const users: User[] = [
    { id: '1', name: NAME, email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
];

// Get all users
app.get('/users', (req: Request, res: Response) => {
    res.json(users);
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

// Get single user
app.get('/users/:id', (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = users.find((user) => user.id === userId);

    if (user) {
        res.json({
            success: true,
            data: formatUser(user),
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'User not found',
        });
    }
});

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */

// Register
app.post('/auth/register', (req: Request, res: Response) => {
    const { name, email, password }: RegisterRequest = req.body;

    if (!name || !email || !password) {
        res.status(400).json({
            success: false,
            error: 'Name, email and password are required',
        } satisfies AuthResponse);
        return;
    }

    if (password.length < 6) {
        res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters',
        } satisfies AuthResponse);
        return;
    }

    const existing = users.find((u) => u.email === email);
    if (existing) {
        res.status(409).json({
            success: false,
            error: 'User with this email already exists',
        } satisfies AuthResponse);
        return;
    }

    const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
    };

    users.push(newUser);

    res.status(201).json({
        success: true,
        user: newUser,
    } satisfies AuthResponse);
});

/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: string
 */

// Create user
app.post('/users', (req: Request, res: Response) => {
    const { name, email } = req.body;
    const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
    };

    res.status(201).json({
        success: true,
        data: formatUser(newUser),
    });
});

// Resolver endpoint
app.get('/resolver', async (req: Request, res: Response) => {
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

// Serve static files from client dist
app.use('/dist/mobile', express.static(path.join(__dirname, '../../client/dist/mobile')));
app.use('/dist/desktop', express.static(path.join(__dirname, '../../client/dist/desktop')));

// Fallback to correct index.html based on device type
app.get('*', (req: Request, res: Response) => {
    const device = getDeviceType(req);
    const indexPath = path.join(__dirname, `../../client/dist/${device}/index.html`);
    res.sendFile(indexPath);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Version: ${VERSION}`);
});

export default app;
