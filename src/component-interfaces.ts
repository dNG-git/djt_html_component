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

import {
    Component as _Component,
    Props as _Props,
    IComponent,
    VNode
} from 'inferno';

import { OriginalElementData } from './original-element-data';

/**
 * "Component" class interface.
 *
 * @since v2.0.0
 */
export interface ComponentClassInterface<P = ComponentProps, S = ComponentState> {
    new: (props?: P) => ComponentInterface<P, S>,

    componentName: string,
    attachAndMount: (element?: Element | Window | string, cssClasses?: string, cssStyle?: string, props?: P) => VNode,
    mount: (element?: Element | Window | string, clearElement?: boolean, props?: P) => VNode,
    replaceAndMount: (element?: Element | Window | string, cssClasses?: string, cssStyle?: string, props?: P) => VNode
}

/**
 * "Component" context interface
 *
 * @since v2.0.0
 */
export interface ComponentContext {
    rootComponent?: _Component
}

/**
 * "Component" interface
 *
 * @since v2.0.0
 */
export interface ComponentInterface<P, S> extends IComponent<P, S> {
    onStateChanged: (oldProps: P, oldState: ComponentState & S) => void,
    onDomResized: (uiSettled?: boolean) => void,
    onResize: (event: Event) => void,
    onWindowResized: (event: Event) => void
}

/**
 * Additional "Component" properties extending default "Props"
 *
 * @since v2.0.0
 */
interface _ComponentProps {
    id?: string,
    listenForWindowResize?: string | boolean,
    originalElement?: Element,
    originalElementData?: OriginalElementData
}

/**
 * "Component" properties interface
 *
 * @since v2.0.0
 */
export interface ComponentProps extends _ComponentProps, _Props<_ComponentProps, Element> { }

/**
 * "Component" state interface
 *
 * @since v2.0.0
 */
export interface ComponentState {
    id: string,

    isElementSizeRelevant: boolean,
    isWindowResizeRelevant: boolean,

    width?: number,
    height?: number
}
