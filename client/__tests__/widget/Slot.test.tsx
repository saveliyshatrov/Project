import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';

import { clearWidgetRegistry, registerWidget, registerWidgetLazy } from '../../src/widget/registry';
import { Slot } from '../../src/widget/Slot';

describe('Slot', () => {
    beforeEach(() => {
        clearWidgetRegistry();
    });

    describe('sync widgets', () => {
        it('renders the registered widget', () => {
            registerWidget('test-slot', {
                component: () => <div data-testid="test-slot">Test Widget</div>,
            });
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
            });
            render(<Slot name="props-slot" props={{ label: 'Hello' }} />);
            expect(screen.getByTestId('props-slot')).toHaveTextContent('Hello');
        });
    });

    describe('lazy widgets', () => {
        it('renders the lazy widget after loading', async () => {
            registerWidgetLazy('lazy-slot', () =>
                Promise.resolve({ default: () => <div data-testid="lazy-slot">Lazy Widget</div> })
            );
            render(<Slot name="lazy-slot" fallback={<div data-testid="loading">Loading...</div>} />);
            await waitFor(() => {
                expect(screen.getByTestId('lazy-slot')).toBeInTheDocument();
            });
        });

        it('shows fallback while lazy widget is loading', async () => {
            let resolvePromise: (value: { default: React.ComponentType }) => void;
            const loader = () =>
                new Promise<{ default: React.ComponentType }>((resolve) => {
                    resolvePromise = resolve;
                });
            registerWidgetLazy('slow-lazy-slot', loader);

            render(<Slot name="slow-lazy-slot" fallback={<div data-testid="loading">Loading...</div>} />);
            expect(screen.getByTestId('loading')).toBeInTheDocument();

            await act(async () => {
                resolvePromise!({ default: () => <div data-testid="slow-lazy">Done</div> });
            });

            expect(screen.getByTestId('slow-lazy')).toBeInTheDocument();
        });
    });
});
