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

import { ComponentClassInterface, ComponentContext } from './component-interfaces';
import { LazyLoaderProps, LazyLoaderState } from './lazy-loader-interfaces';

import { Component } from './component';
import { createElement } from 'inferno-create-element';

import PromisedRequire from 'djt-promised-require';

/**
 * Abstract Riot.js tag class supporting tag registration.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-html-component
 * @since     v2.0.0
 * @license   https://www.direct-netware.de/redirect?licenses;mpl2
 *            Mozilla Public License, v. 2.0
 */
export class LazyLoader<
    P extends LazyLoaderProps = LazyLoaderProps,
    S extends LazyLoaderState = LazyLoaderState,
    C = ComponentContext
> extends Component<P, S, C> {
    /**
     * Constructor (LazyLoader)
     *
     * @param props LazyLoader props
     * @param context LazyLoader context
     *
     * @since v2.0.0
     */
    constructor(props?: P, context?: C) {
        super(props, context);

        this.onComponentLoaded = this.onComponentLoaded.bind(this);
        this.onComponentLoadingFailed = this.onComponentLoadingFailed.bind(this);
    }

    /**
     * reactjs.org: It is invoked immediately after a component is mounted
     * (inserted into the tree).
     *
     * @since v2.0.0
     */
    public componentDidMount() {
        this.loadComponent().then(
            // eslint-disable-next-line @typescript-eslint/unbound-method
            this.onComponentLoaded,
            // eslint-disable-next-line @typescript-eslint/unbound-method
            this.onComponentLoadingFailed
        );

        super.componentDidMount();
    }

    /**
     * Requires the given React components.
     *
     * @param modules JavaScript module
     *
     * @return Promise
     * @since  v2.0.0
     */
    protected async loadComponent() {
        if (this.state.componentName === undefined) {
            throw new Error('No React component defined to be loaded.');
        }

        const modules = [ this.state.componentName ];

        if (this.state.componentDependencyNames !== undefined) {
            modules.push(...this.state.componentDependencyNames);
        }

        const promise = PromisedRequire.require(...modules);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return promise.then((modulesLoaded: any) => {
            let moduleLoaded;

            for (const key of Object.keys(modulesLoaded)) {
                // eslint-disable-next-line no-prototype-builtins, @typescript-eslint/no-unsafe-member-access
                if (Component.prototype.isPrototypeOf(modulesLoaded[key].prototype)) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    moduleLoaded = modulesLoaded[key];
                    break;
                }
            }

            if (moduleLoaded === undefined) {
                throw new Error('Failed to load React component or dependencies required.');
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return moduleLoaded;
        });
    }

    /**
     * Called when the React component has been loaded.
     *
     * @param _ Exception
     *
     * @since v2.0.0
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onComponentLoaded(componentClass: ComponentClassInterface) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        componentClass.replaceAndMount(this.instanceClass.getDomElement(this), undefined, undefined, this.props);
    }

    /**
     * Called when the React component can not be loaded.
     *
     * @param _ Exception
     *
     * @since v2.0.0
     */
    public onComponentLoadingFailed(_: Error) { /* no-op */ }

    /**
     * Returns the React component content to be rendered.

     * @return React component content to be rendered
     * @since  v2.0.0
     */
    public render() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const TagName = (this.state.placeholderComponentName === undefined
                         // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                         ? this.instanceClass.attachingTagName : this.state.placeholderComponentName
                        );

        return <TagName { ...this.state.placeholderProps } />;
    }
}
