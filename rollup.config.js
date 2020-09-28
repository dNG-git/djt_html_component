/**
 * direct JavaScript Toolbox
 * All-in-one toolbox to provide more reusable JavaScript features
 *
 * (C) direct Netware Group - All rights reserved
 * https://www.direct-netware.de/redirect?djt;html;component
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 *
 * https://www.direct-netware.de/redirect?licenses;mpl2
 *
 * @license Mozilla Public License, v. 2.0
 */

import { applyDefaultConfig } from './rollup.default';
import pkg from './package.json'

export default applyDefaultConfig({
    inputTsConfig: 'tsconfig.browser-module-rollup.json',

    output: [
        {
            file: `./dist/${pkg.name}.js`,
            format: 'esm',
            compact: true,
            interop: false,
            sourcemap: true
        }
    ]
});
