import webpack from 'webpack';

import { createConfig } from './webpack.base.config.ts';

const configs: webpack.Configuration[] = [createConfig('mobile', 'production'), createConfig('desktop', 'production')];

export default configs;
