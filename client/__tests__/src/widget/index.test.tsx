import { hasWidget, clearWidgetRegistry } from '../../../src/utils/global/widget/registry';

jest.mock('../../../src/utils/global/routes/registry', () => ({
    routeRegistry: [],
}));

describe('UserList widget', () => {
    beforeEach(() => {
        clearWidgetRegistry();
    });

    it('registers UserListWidget', async () => {
        await import('../../../src/widget/UserList');
        expect(hasWidget('UserListWidget')).toBe(true);
    });
});

describe('UserDetail widget', () => {
    beforeEach(() => {
        clearWidgetRegistry();
    });

    it('registers UserDetailWidget', async () => {
        await import('../../../src/widget/UserDetail');
        expect(hasWidget('UserDetailWidget')).toBe(true);
    });
});
