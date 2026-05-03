import { Slot } from '@widget/Slot';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import '@widget/UserDetail';
import '@widget/UserList';

export default function App() {
    return (
        <div style={{ padding: '20px' }}>
            <Routes>
                <Route path="/" element={<Slot name="UserListWidget" />} />
                <Route path="/users/:userId" element={<Slot name="UserDetailWidget" />} />
                <Route path="*" element={<div>Wow, you found 404</div>} />
            </Routes>
        </div>
    );
}
