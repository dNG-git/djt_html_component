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
    IComponentConstructor as ComponentConstructor,
    InfernoNode,
    render
} from 'inferno';

import { ComponentContext, ComponentInterface, ComponentProps, ComponentState } from './component-interfaces';
import { OriginalElementData, OriginalElementWalker } from './original-element-data';

import { ContextMap } from './context-map';
import { createElement } from 'inferno-create-element';
import { DomUtilities } from './dom-utilities';
import { findDOMNode } from 'inferno-extras';

/**
 * Abstract React component class supporting enhanced mounting options.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-html-component
 * @since     v2.0.0
 * @license   https://www.direct-netware.de/redirect?licenses;mpl2
 *            Mozilla Public License, v. 2.0
 */
export abstract class Component<
    P extends ComponentProps = ComponentProps,
    S extends ComponentState = ComponentState,
    C extends ComponentContext = ComponentContext
> extends _Component<P, S> implements ComponentInterface<P, S> {
    /**
     * Milliseconds to wait after the UI DOM event occurred before callbacks are executed.
     */
    protected static readonly DOM_UI_CHANGE_DELAY_MS = 85;

    /**
     * Underlying original element node
     */
    protected originalElement: Element = undefined;

    /**
     * Constructor (Component)
     *
     * @param props Component props
     * @param args Additional arguments given
     *
     * @since v2.0.0
     */
    constructor(props?: P, ...args: unknown[]) {
        super(props, ...args);

        // Implement some "magic" to catch the Inferno.js supported context
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        if (!('_djt_map' in this.context && this.context['_djt_map'] instanceof ContextMap)) {
            this.context['_djt_map'] = new ContextMap<C>(this.context);
        }
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */

        if (!props) {
            props = { } as P;
        }

        if ((!this.originalElement) && 'originalElement' in props) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.originalElement = props.originalElement;
        }

        if (!this.contextMap.has('rootComponent')) {
            this.contextMap.set('rootComponent', this);
        }

        this.onResize = this.onResize.bind(this);
        this.onWindowResized = this.onWindowResized.bind(this);
        this.updateDomSize = this.updateDomSize.bind(this);
    }

    /**
     * Returns the corresponding class of the calling instance.
     *
     * @return Class object
     * @since  v2.0.0
     */
    protected get contextMap() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return this.context['_djt_map'] as ContextMap<C>;
    }

    /**
     * Returns the corresponding class of the calling instance.
     *
     * @return Class object
     * @since  v2.0.0
     */
    protected get instanceClass() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        return Object.getPrototypeOf(this).constructor;
    }

    /**
     * reactjs.org: It is invoked immediately after a component is mounted
     * (inserted into the tree).
     *
     * @since v2.0.0
     */
    public componentDidMount() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        Component.getDomElement(this)._x_component = this;

        this.onStateChanged(this.props, { } as S & ComponentState);
    }

    /**
     * reactjs.org: It is invoked immediately after updating occurs.

     * @param oldProps Old props
     * @param oldState Old state
     * @param _ Snapshot data defined in "getSnapshotBeforeUpdate()"
     *
     * @since v2.2.0
     */
    public componentDidUpdate(oldProps: P, oldState: S, _?: unknown) {
        this.onStateChanged(oldProps, oldState);
    }

    /**
     * Fires a DOM event for the DOM root node of this instance.
     *
     * @param event Event name to fire
     *
     * @since v2.0.0
     */
    protected fireDomElementEvent(event: string) {
        const eventInstance = DomUtilities.createEvent(event);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        Component.getDomElement(this).dispatchEvent(eventInstance);
    }

    /**
     * Fires DOM event "x-element-resize".
     *
     * @since v2.0.0
     */
    protected fireXElementResizeEvent() {
        this.fireDomElementEvent('x-element-resize');
    }

    /**
     * This method is called after the instance state changed.

     * @param _ Old props
     * @param oldState Old state
     *
     * @since v2.0.0
     */
    public onStateChanged(_: P, oldState: S) {
        /* eslint-disable @typescript-eslint/unbound-method */
        if (this.state.isElementSizeRelevant !== oldState.isElementSizeRelevant) {
            if (this.state.isElementSizeRelevant) {
                DomUtilities.addEventListener(Component.getDomElement(this), 'x-element-resize', this.onResize);
                DomUtilities.animateLater(this.updateDomSize);
            } else {
                DomUtilities.removeEventListener(Component.getDomElement(this), 'x-element-resize', this.onResize);
            }
        }

        if (this.state.isWindowResizeRelevant !== oldState.isWindowResizeRelevant) {
            if (this.state.isWindowResizeRelevant) {
                DomUtilities.addEventListener(self, 'resize', this.onWindowResized);
                DomUtilities.animateLater(this.updateDomSize);
            } else {
                DomUtilities.removeEventListener(self, 'resize', this.onWindowResized);
            }
        }
        /* eslint-enable @typescript-eslint/unbound-method */
    }

    /**
     * Called after the underlying DOM element has been resized.
     *
     * @param uiSettled True if the DOM based UI is known to already have changed
     *
     * @since v2.0.0
     */
    public onDomResized(uiSettled = false) {
        if (this.state.isElementSizeRelevant) {
            DomUtilities.animateLater(
                // eslint-disable-next-line @typescript-eslint/unbound-method
                this.updateDomSize,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (uiSettled ? undefined : this.instanceClass.DOM_UI_CHANGE_DELAY_MS)
            );
        }
    }

    /**
     * Called for DOM event "x-element-resize".
     *
     * @param _ Event object
     *
     * @since v2.0.0
     */
    public onResize(_: Event) {
        this.onDomResized();
    }

    /**
     * Called on DOM event "resize".
     *
     * @param _ Event object
     *
     * @since v2.0.0
     */
    public onWindowResized(_: Event) {
        if (this.state.isWindowResizeRelevant) {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            DomUtilities.animateLater(this.updateDomSize);
        }
    }

    /**
     * Updates the underlying component DOM size.
     *
     * @since v2.0.0
     */
    protected updateDomSize() {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        const originalElementData = (
            this.props.originalElementData
            ? this.props.originalElementData
            : {
                attributes: { },
                children: [ ],
                name: this.instanceClass.componentName,
                value: ''
            } as OriginalElementData
        );

        let width = originalElementData.width;
        let height = originalElementData.height;

        if (width === undefined || height === undefined) {
            const element = Component.getDomElement(this);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const metrics = ((element && element.getBoundingClientRect) ? element.getBoundingClientRect() : { });

            if (width === undefined) {
                width = metrics.width;
            }

            if (height === undefined) {
                height = metrics.height;
            }
        }

        if (
            width !== undefined && height !== undefined
            && (width !== this.state.width || height !== this.state.height)
        ) {
            this.setState({
                height: (height ? height : undefined),
                width: (width ? width : undefined)
            } as unknown);
        }
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }

    /**
     * Returns the tag name used when "attachAndMount()" is used.
     *
     * @return Tag name to attach to DOM
     * @since  v2.0.0
     */
    protected static get attachingTagName() {
        return 'div';
    }

    /**
     * Returns the static component name.
     *
     * @return Static component name
     * @since  v2.0.0
     */
    public static get componentName() {
        return this.name;
    }

    /**
     * Returns a list of node names "originalElementData" should provide the
     * inner HTML content instead of being parsed.
     *
     * @return List of node names
     * @since  v2.0.0
     */
    protected static get originalElementNodeNamesWithHtml(): string[] {
        return [ ];
    }

    /**
     * Attach the React component to the given (X)HTML element and mount it.
     *
     * @param element (X)HTML5 element or DOM selector
     * @param cssClasses CSS classes to be applied to the attached child
     * @param cssStyle CSS style to be applied to the attached child
     * @param props Component props
     *
     * @return React component
     * @since  v2.0.0
     */
    public static attachAndMount(element?: Element | Window | string, cssClasses?: string, cssStyle?: string, props?: ComponentProps) {
        if (element instanceof Window) {
            element = document.body;
        } else if (!(element instanceof Element)) {
            element = DomUtilities.$(element) as Element;
        }

        const childElement = document.createElement(this.attachingTagName);

        if (cssClasses) {
            childElement.className = cssClasses;
        }

        if (cssStyle) {
            childElement.style.cssText = cssStyle;
        }

        element.appendChild(childElement);

        return this.mount(childElement, false, props);
    }

    /**
     * Returns the React component instance under the DOM element given.
     *
     * @param element (X)HTML5 element
     *
     * @return React component
     * @since  v2.0.0
     */
    protected static getComponent(element: Element) {
        let _return = null;

        /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        if (element && (element as any)._x_component) {
            _return = (element as any)._x_component;
        }
        /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return _return;
    }

    /**
     * reactjs.org: It is invoked right before calling the render method, both on
     * the initial mount and on subsequent updates.
     *
     * @param props Current props
     * @param state Current state
     *
     * @return Updated state values object; null otherwise
     * @since  v2.0.0
     */
    public static getDerivedStateFromProps(props: ComponentProps, state: ComponentState) {
        let _return = null;

        if (state === null) {
            _return = {
                isElementSizeRelevant: false,
                isWindowResizeRelevant: false,
                ...props
            };

            if (!_return.id) {
                _return.id = this.getRandomDomId();
            }

            if (_return['listenForWindowResize'] !== undefined) {
                _return.isWindowResizeRelevant = !([ '0', false, undefined ].includes(props.listenForWindowResize));
                delete _return.listenForWindowResize;
            }

            if (_return['originalElementData'] !== undefined) {
                delete _return.originalElementData;
            }
        }

        return _return as ComponentState;
    }

    /**
     * Returns the DOM element for the React component instance given.
     *
     * @param element (X)HTML5 element
     *
     * @return DOM element
     * @since  v2.0.0
     */
    protected static getDomElement(component: Component) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return findDOMNode(component);
    }

    /**
     * Returns the requested React component props based on the DOM attributes.
     *
     * @param data Original element data captured before mounting
     *
     * @return Component props
     * @since  v2.0.0
     */
    protected static getPropsFromOriginalElementData(data: OriginalElementData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _return: any = { };

        let propName;

        for (const name in data.attributes) {
            propName = name;

            if (propName.startsWith('data-') && propName.length > 5) {
                propName = propName.slice(5);

                const parts = propName.split(/\W+/);

                if (parts.length > 1) {
                    propName = parts.shift();

                    for (const part of parts) {
                        propName += part.charAt(0).toUpperCase() + part.slice(1);
                    }
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            _return[propName] = data.attributes[name];
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return _return;
    }

    /**
     * Returns a random value usable as a DOM ID.
     *
     * @return Random value usable as DOM ID
     * @since  v2.0.0
     */
    protected static getRandomDomId() {
        return 'djt-' + Math.random().toString().replace('.', '');
    }

    /**
     * Mounts the React component instance under the DOM element given.
     *
     * @param element (X)HTML5 element or DOM selector
     * @param clearElement Clear existing children before mounting
     * @param props Component props
     *
     * @return React component instance mounted
     * @since  v2.0.0
     */
    public static mount(element?: Element | Window | string, clearElement = false, props?: ComponentProps) {
        if (element === undefined) {
            element = this.componentName;
        }

        if (element instanceof Window) {
            element = document.body;
        } else if (!(element instanceof Element)) {
            element = DomUtilities.$(element) as Element;
        }

        const originalElementData = OriginalElementWalker.parse(element, this.originalElementNodeNamesWithHtml);

        if (!props) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            props = this.getPropsFromOriginalElementData(originalElementData);
        }

        props['originalElement'] = element;
        props['originalElementData'] = originalElementData;

        if (clearElement) {
            let node;

            for (let i = element.childNodes.length - 1; i >= 0; i--) {
                node = element.childNodes[i];

                if ([ Node.CDATA_SECTION_NODE, Node.ELEMENT_NODE, Node.TEXT_NODE ].includes(node.nodeType)) {
                    element.removeChild(node);
                }
            }
        }

        const vNode = createElement(this.prototype.constructor as ComponentConstructor<unknown>, props);
        render(vNode, element);

        return vNode.children;
    }

    /**
     * Mounts all React component instances matching DOM selector given.
     *
     * @param selector DOM selector
     * @param clearElement Clear existing children before mounting
     * @param props Component props
     *
     * @return Array of React component instances mounted
     * @since  v2.2.0
     */
    public static mountAll(selector?: string, clearElement = false, props?: ComponentProps) {
        const _return = [ ] as InfernoNode[];

        if (selector === undefined) {
            selector = this.componentName;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const elements = DomUtilities.$$(selector);

        elements.forEach((element) => {
            _return.push(this.mount(element, clearElement, props));
        });

        return _return;
    }

    /**
     * Replaces all children of the given (X)HTML element and mounts the React
     * component instead.
     *
     * @param element (X)HTML5 element or DOM selector
     * @param cssClasses CSS classes to be applied to the attached child
     * @param cssStyle CSS style to be applied to the attached child
     * @param props Component props
     *
     * @return React component
     * @since  v2.0.0
     */
    public static replaceAndMount(element?: Element | Window | string, cssClasses?: string, cssStyle?: string, props?: ComponentProps) {
        if (!(element instanceof Element)) {
            element = DomUtilities.$(element);
        }

        if (element instanceof HTMLElement) {
            if (cssClasses) {
                element.className = cssClasses;
            }

            if (cssStyle) {
                element.style.cssText = cssStyle;
            }
        }

        return this.mount(element, true, props);
    }
}
