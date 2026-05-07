import { Router, Request, Response } from 'express';
import { formatUser, User } from 'shared';
import { z } from 'zod';

import { users } from '../../data/users';
import { validate } from '../../middleware/validate';

import { CreateUserSchema, UserIdParamSchema } from './schemas';

const router = Router();

router.get('/users', (req: Request, res: Response) => {
    res.json(users);
});

router.get('/users/:id', validate(UserIdParamSchema, 'params'), (req: Request, res: Response) => {
    const { id } = req.params as z.infer<typeof UserIdParamSchema>;
    const user = users.find((user) => user.id === id);

    if (user) {
        res.json({ user });
    } else {
        res.status(404).json({
            success: false,
            error: 'User not found',
        });
    }
});

router.post('/users', validate(CreateUserSchema, 'body'), (req: Request, res: Response) => {
    const { name, email } = req.body as z.infer<typeof CreateUserSchema>;
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
