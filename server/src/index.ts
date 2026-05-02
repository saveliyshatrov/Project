import express, { Request, Response } from 'express';
import cors from 'cors';
import { formatUser, User, VERSION } from 'shared';
import { NAME } from 'shared/resolver/examples';
import { RegisterRequest, AuthResponse } from 'shared/auth';
import path from 'path';

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

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', version: VERSION });
});

const users: User[] = [
    { id: '1', name: NAME, email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
];

// Get all users
app.get('/users', (req: Request, res: Response) => {
    res.json(users);
});

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

// Serve static files from client dist
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Prod chunks sending
app.get('/dist/*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, `../../client${req.url}`));
});

// Fallback to index.html for React Router
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Version: ${VERSION}`);
});

export default app;
