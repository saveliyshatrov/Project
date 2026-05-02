import React, { useState } from 'react';
import { AuthResponse, RegisterRequest } from 'shared/auth';

type RegisterFormProps = {
    onRegistered?: (user: AuthResponse['user']) => void;
};

export function RegisterForm({ onRegistered }: RegisterFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        const body: RegisterRequest = { name, email, password };

        try {
            const res = await fetch('http://localhost:3001/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data: AuthResponse = await res.json();

            if (!data.success) {
                setError(data.error ?? 'Registration failed');
                return;
            }

            setSuccess(true);
            setName('');
            setEmail('');
            setPassword('');
            onRegistered?.(data.user);
        } catch {
            setError('Network error');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3>Register</h3>

            {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
            {success && <p style={{ color: 'green', margin: 0 }}>Registered successfully!</p>}

            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password (min 6)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
            />

            <button type="submit">Register</button>
        </form>
    );
}
