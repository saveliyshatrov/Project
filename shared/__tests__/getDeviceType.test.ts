import { DeviceType, getDeviceType } from '../src/utils/getDeviceType';

describe('getDeviceType', () => {
    it('returns mobile for "mobile" input', () => {
        expect(getDeviceType('mobile')).toBe(DeviceType.mobile);
    });

    it('returns desktop for "desktop" input', () => {
        expect(getDeviceType('desktop')).toBe(DeviceType.desktop);
    });

    it('returns desktop for any other input', () => {
        expect(getDeviceType('tablet')).toBe(DeviceType.desktop);
        expect(getDeviceType('')).toBe(DeviceType.desktop);
        expect(getDeviceType('unknown')).toBe(DeviceType.desktop);
    });
});

describe('DeviceType enum', () => {
    it('has correct values', () => {
        expect(DeviceType.mobile).toBe('mobile');
        expect(DeviceType.desktop).toBe('desktop');
    });
});
