import { Router, Request, Response } from 'express';
import { User } from 'shared';

import { users } from '../../data/users';
import { validate } from '../../middleware/validate';

import { RegisterSchema } from './schemas';

const router = Router();

router.post('/auth/register', validate(RegisterSchema, 'body'), (req: Request, res: Response) => {
    const { name, email } = req.body;

    const existing = users.find((u) => u.email === email);
    if (existing) {
        res.status(409).json({
            success: false,
            error: 'User with this email already exists',
        });
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
    });
});

export default router;
