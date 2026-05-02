export const enum DeviceType {
    mobile = 'mobile',
    desktop = 'desktop',
}

export const getDeviceType = (arg: string): DeviceType => {
    if (arg === DeviceType.mobile) {
        return DeviceType.mobile;
    }

    return DeviceType.desktop;
};
