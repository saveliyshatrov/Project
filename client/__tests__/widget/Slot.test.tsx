import { render, screen } from '@testing-library/react';
import React from 'react';

import { registerWidget } from '../../src/widget/registry';
import { Slot } from '../../src/widget/Slot';

describe('Slot', () => {
    beforeEach(() => {
        registerWidget('test-slot', {
            component: () => <div data-testid="test-slot">Test Widget</div>,
            displayName: 'widget-test-slot',
        });
    });

    it('renders the registered widget', () => {
        render(<Slot name="test-slot" />);
        expect(screen.getByTestId('test-slot')).toBeInTheDocument();
    });

    it('renders fallback when widget is not registered', () => {
        render(<Slot name="nonexistent" fallback={<div data-testid="fallback">Fallback</div>} />);
        expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('renders null when widget is not registered and no fallback', () => {
        const { container } = render(<Slot name="nonexistent" />);
        expect(container.firstChild).toBeNull();
    });

    it('passes props to the widget', () => {
        registerWidget('props-slot', {
            component: ({ label }) => <div data-testid="props-slot">{label as string}</div>,
            displayName: 'widget-props-slot',
        });
        render(<Slot name="props-slot" props={{ label: 'Hello' }} />);
        expect(screen.getByTestId('props-slot')).toHaveTextContent('Hello');
    });
});
