import express, { Request, Response } from 'express';
import cors from 'cors';
import { formatUser, User, VERSION } from 'shared';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', version: VERSION });
});

// Get all users
app.get('/users', (req: Request, res: Response) => {
  const users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
  ];
  res.json({
    success: true,
    data: users.map(formatUser),
  });
});

// Get single user
app.get('/users/:id', (req: Request, res: Response) => {
  const userId = req.params.id;
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  if (userId === user.id) {
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
