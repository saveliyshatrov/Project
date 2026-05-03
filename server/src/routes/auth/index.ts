import { Router, Request, Response } from 'express';
import { User } from 'shared';
import { RegisterRequest, AuthResponse } from 'shared/auth';

import { users } from '../../data/users';

/**
 * @openapi
 * components:
 *   schemas:
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

const router = Router();

router.post('/auth/register', (req: Request, res: Response) => {
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

export default router;
