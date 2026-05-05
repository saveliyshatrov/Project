import { DeviceType } from '../src/utils/getDeviceType';
import * as utils from '../src/utils/index';

describe('utils index exports', () => {
    it('exports DeviceType', () => {
        expect(utils.DeviceType).toBe(DeviceType);
    });
});
