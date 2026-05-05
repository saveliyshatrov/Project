import { hasWidget, clearWidgetRegistry } from '../../../src/utils/global/registry';

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
