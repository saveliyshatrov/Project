import React from 'react';
import { User, formatUser, VERSION } from 'shared';

const users: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
];

function UserList() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Module Federation App v{VERSION}</h1>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{formatUser(user)}</li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return <UserList />;
}
