import { UserDetailWidget } from '@widget/UserDetail';
import { UserListWidget } from '@widget/UserList';
import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';

function UserList() {
    return <UserListWidget />;
}

function UserDetail() {
    const { userId } = useParams<{ userId: string }>();

    return <UserDetailWidget id={userId} />;
}

export default function App() {
    return (
        <div style={{ padding: '20px' }}>
            <Routes>
                <Route path="/" element={<UserList />} />
                <Route path="/users/:userId" element={<UserDetail />} />
                <Route path="*" element={<div>Wow, you found 404</div>} />
            </Routes>
        </div>
    );
}
