import webpack from 'webpack';

import { createClientConfig } from './webpack.client.base.config.ts';

const configs: webpack.Configuration[] = [
    createClientConfig('mobile', 'production'),
    createClientConfig('desktop', 'production'),
];

export default configs;
