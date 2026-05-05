import { render, screen } from '@testing-library/react';
import React from 'react';

import { UserDetail } from '../../../src/components/UserDetail';

describe('UserDetail component', () => {
    it('renders loading state', () => {
        render(<UserDetail />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
