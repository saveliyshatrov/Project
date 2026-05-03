import { registerWidget, getWidget, hasWidget } from '../../src/widget/registry';

describe('registerWidget', () => {
    it('registers a widget with the given name', () => {
        const Dummy = () => null;
        registerWidget('test-widget', { component: Dummy, displayName: 'widget-test-widget' });
        expect(hasWidget('test-widget')).toBe(true);
    });

    it('warns when overwriting an existing widget', () => {
        const spy = jest.spyOn(console, 'warn').mockImplementation();
        const Dummy1 = () => null;
        const Dummy2 = () => null;
        registerWidget('overwrite-widget', { component: Dummy1, displayName: 'widget-1' });
        registerWidget('overwrite-widget', { component: Dummy2, displayName: 'widget-2' });
        expect(spy).toHaveBeenCalledWith(
            '[WidgetRegistry] Widget "overwrite-widget" is already registered, overwriting.'
        );
        spy.mockRestore();
    });
});

describe('getWidget', () => {
    it('returns the registered component', () => {
        const Dummy = () => null;
        registerWidget('get-test', { component: Dummy, displayName: 'widget-get-test' });
        const Widget = getWidget('get-test');
        expect(Widget).toBe(Dummy);
    });

    it('returns null for unregistered widget', () => {
        expect(getWidget('nonexistent-widget')).toBeNull();
    });
});

describe('hasWidget', () => {
    it('returns true for registered widget', () => {
        const Dummy = () => null;
        registerWidget('has-test', { component: Dummy, displayName: 'widget-has-test' });
        expect(hasWidget('has-test')).toBe(true);
    });

    it('returns false for unregistered widget', () => {
        expect(hasWidget('nonexistent')).toBe(false);
    });
});
