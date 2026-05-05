import { render, screen } from '@testing-library/react';
import React from 'react';

import { Skeleton as UserDetailSkeleton } from '../../../src/widget/UserDetail/skeleton';
import { Skeleton as UserListSkeleton } from '../../../src/widget/UserList/skeleton';

describe('UserList Skeleton', () => {
    it('renders skeleton', () => {
        render(<UserListSkeleton />);
        expect(screen.getByText('UserList')).toBeInTheDocument();
    });
});

describe('UserDetail Skeleton', () => {
    it('renders skeleton', () => {
        render(<UserDetailSkeleton />);
        expect(screen.getByText('UserDetail')).toBeInTheDocument();
    });
});
