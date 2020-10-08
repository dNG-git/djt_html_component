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

import { ComponentProps, ComponentState } from './component-interfaces';

/**
 * "LazyLoader" properties interface
 *
 * @since v2.0.0
 */
export interface LazyLoaderProps extends ComponentProps {
    componentDependencyNames?: string[],
    componentName: string,
    placeholderComponentName?: string,
    placeholderProps?: unknown
}

/**
 * "LazyLoader" state interface
 *
 * @since v2.0.0
 */
export interface LazyLoaderState extends ComponentState {
    componentDependencyNames?: string[],
    componentName: string,
    placeholderComponentName?: string,
    placeholderProps?: unknown
}
