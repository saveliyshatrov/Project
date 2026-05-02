import { CLIENT } from '@config';
import { ViewExample } from '@widget/example';
import { RegisterForm } from '@widget/RegisterForm';
import React from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';
import { User, formatUser, VERSION } from 'shared/constants';
import { NAME } from 'shared/resolver/examples';

const users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
];

function UserList() {
    return (
        <div>
            <h1>
                Module Federation App v{VERSION} | CLIENT:{JSON.stringify(CLIENT)} | NAME:{NAME}
            </h1>
            <ViewExample example={777} />
            <RegisterForm
                onRegistered={(user) => {
                    if (user) {
                        users.push(user);
                    }
                }}
            />
            <h2>Users</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        <Link to={`/users/${user.id}`}>{formatUser(user)}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function UserDetail() {
    const { userId } = useParams<{ userId: string }>();
    const user = users.find((u) => u.id === userId);

    return (
        <div>
            <Link to="/">← Back to users</Link>
            <h2>User Detail</h2>
            {user ? (
                <p>{formatUser(user)}</p>
            ) : (
                <p>
                    User with ID <strong>{userId}</strong> not found
                </p>
            )}
        </div>
    );
}

export default function App() {
    return (
        <div style={{ padding: '20px' }}>
            <Routes>
                <Route path="/" element={<UserList />} />
                <Route path="/users/:userId" element={<UserDetail />} />
            </Routes>
        </div>
    );
}
