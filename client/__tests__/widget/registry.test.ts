import {
    clearWidgetRegistry,
    getWidget,
    hasWidget,
    registerWidget,
    registerWidgetLazy,
} from '../../src/widget/registry';

describe('registerWidget', () => {
    beforeEach(() => {
        clearWidgetRegistry();
    });

    it('registers a widget with the given name', () => {
        const Dummy = () => null;
        registerWidget('test-widget', { component: Dummy });
        expect(hasWidget('test-widget')).toBe(true);
    });

    it('warns when overwriting an existing widget', () => {
        const spy = jest.spyOn(console, 'warn').mockImplementation();
        const Dummy1 = () => null;
        const Dummy2 = () => null;
        registerWidget('overwrite-widget', { component: Dummy1 });
        registerWidget('overwrite-widget', { component: Dummy2 });
        expect(spy).toHaveBeenCalledWith(
            '[WidgetRegistry] Widget "overwrite-widget" is already registered, overwriting.'
        );
        spy.mockRestore();
    });
});

describe('registerWidgetLazy', () => {
    beforeEach(() => {
        clearWidgetRegistry();
    });

    it('registers a widget loader with the given name', () => {
        const loader = jest.fn().mockResolvedValue({ default: () => null });
        registerWidgetLazy('lazy-widget', loader);
        expect(hasWidget('lazy-widget')).toBe(true);
    });
});

describe('getWidget', () => {
    beforeEach(() => {
        clearWidgetRegistry();
    });

    it('returns the registered component for sync widgets', () => {
        const Dummy = () => null;
        registerWidget('get-test-sync', { component: Dummy });
        const Widget = getWidget('get-test-sync');
        expect(Widget).toBe(Dummy);
    });

    it('returns a LazyExoticComponent for lazy widgets', () => {
        const loader = jest.fn().mockResolvedValue({ default: () => null });
        registerWidgetLazy('get-test-lazy', loader);
        const Widget = getWidget('get-test-lazy');
        expect(Widget).not.toBeNull();
        expect(typeof Widget).toBe('object');
        expect('$$typeof' in Widget!).toBe(true);
    });

    it('returns null for unregistered widget', () => {
        expect(getWidget('nonexistent-widget')).toBeNull();
    });
});

describe('hasWidget', () => {
    beforeEach(() => {
        clearWidgetRegistry();
    });

    it('returns true for registered widget', () => {
        const Dummy = () => null;
        registerWidget('has-test', { component: Dummy });
        expect(hasWidget('has-test')).toBe(true);
    });

    it('returns false for unregistered widget', () => {
        expect(hasWidget('nonexistent')).toBe(false);
    });
});
