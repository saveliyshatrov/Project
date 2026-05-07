import { routeRegistry } from '@utils/global/routes';
import { Slot } from '@utils/global/widget/Slot';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

export default function App() {
    return (
        <div style={{ padding: '20px' }}>
            <Routes>
                {routeRegistry.map(({ path, widgetName }) => (
                    <Route key={path} path={path} element={<Slot name={widgetName} />} />
                ))}
            </Routes>
        </div>
    );
}
