import { render, screen } from '@testing-library/react';
import React from 'react';

import { UserList } from '../../../src/components/UserList';

describe('UserList component', () => {
    it('renders loading state', () => {
        render(<UserList users={[]} />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
