import { Router, Request, Response } from 'express';
import { formatUser, User } from 'shared';

import { users } from '../../data/users';

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
 *                 user:
 *                   $ref: '#/components/schemas/User'
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

const router = Router();

router.get('/users', (req: Request, res: Response) => {
    res.json(users);
});

router.get('/users/:id', (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = users.find((user) => user.id === userId);

    if (user) {
        res.json({ user });
    } else {
        res.status(404).json({
            success: false,
            error: 'User not found',
        });
    }
});

router.post('/users', (req: Request, res: Response) => {
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

export default router;
