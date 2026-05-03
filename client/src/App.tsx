import { UserDetailWidget } from '@widget/UserDetail';
import { UserListWidget } from '@widget/UserList';
import React from 'react';
import { Routes, Route } from 'react-router-dom';

export default function App() {
    return (
        <div style={{ padding: '20px' }}>
            <Routes>
                <Route path="/" element={<UserListWidget />} />
                <Route path="/users/:userId" element={<UserDetailWidget />} />
                <Route path="*" element={<div>Wow, you found 404</div>} />
            </Routes>
        </div>
    );
}
