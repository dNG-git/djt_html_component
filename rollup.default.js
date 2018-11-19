/**
 * direct JavaScript Toolbox
 * All-in-one toolbox to provide more reusable JavaScript features
 *
 * (C) direct Netware Group - All rights reserved
 * https://www.direct-netware.de/redirect?djt;xhtml5;riot_tag
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 *
 * https://www.direct-netware.de/redirect?licenses;mpl2
 *
 * @license Mozilla Public License, v. 2.0
 */

import CommonJs from 'rollup-plugin-commonjs';
import Resolve from 'rollup-plugin-node-resolve';
import { terser as Terser } from 'rollup-plugin-terser';
import TypeScript from 'rollup-plugin-typescript2';

export function applyDefaultConfig(customConfig) {
    const resolveConfig = (
        customConfig.inputResolveConfig ?
        customConfig.inputResolveConfig :
        {
            browser: true,
            main: true,
            jsnext: true,
            module: true,
            extensions: [ '.js', '.json', '.ts' ],
            moduleOnly: true,
            preferBuiltins: true
        }
    );

    if (!customConfig.inputTsConfig) {
        throw new Error('Rollup input TypeScript config missing');
    }

    if (!Array.isArray(customConfig.output)) {
        throw new Error('Rollup output config missing');
    }

    return {
        input: 'src/module.ts',
        output: customConfig.output,

        plugins: [
            Resolve(resolveConfig),

            TypeScript({ tsconfig: customConfig.inputTsConfig }),

            CommonJs({
                ignore: [ 'require' ],
                namedExports: {
                    'riot/riot.js': [ 'mount', 'tag', 'util' ],
                    'tslib': [ '__awaiter', '__extends', '__generator' ]
                }
            }),

            Terser()
        ]
    };
};
