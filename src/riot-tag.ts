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

import ObjectTreeLookup from 'djt-object-tree-lookup';
import PromisedRequire from 'djt-promised-require';
import { mount, tag, Tag, TagOpts, util } from 'riot';

import { OriginalElementData } from './original-element-data';

/**
 * Abstract Riot.js tag class supporting tag registration.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-xhtml5-riot-tag
 * @since     v1.0.0
 * @license   https://www.direct-netware.de/redirect?licenses;mpl2
 *            Mozilla Public License, v. 2.0
 */
export abstract class RiotTag {
    /**
     * Milliseconds to wait before calling a requested animation callback if
     * "requestAnimationFrame()" is not available.
     */
    protected static animationTimeoutValue = 25;
    /**
     * Flag indicating that a DOM manipulation library is available
     */
    public static isDomManipulationAvailable: boolean = undefined;
    /**
     * Flag indicating that the client supports "requestAnimationFrame()"
     */
    protected static _isRequestAnimationFrameAvailable: boolean = undefined;
    /**
     * Flag indicating that the tag name has been registered
     */
    protected static isRegistered = false;

    /**
     * Tag ID (usually of the Riot.js Tag child node)
     */
    protected id: string;
    /**
     * Flag indicating that the instance is interested in the size of the
     * (X)HTML5 element.
     */
    protected isElementSizeRelevant = false;
    /**
     * Flag indicating that the instance is interested in window resize events.
     */
    protected isWindowResizeRelevant = true;
    /**
     * Original DOM element and child data like attributes and values.
     */
    protected originalElementData: OriginalElementData;
    /**
     * Underlying Riot.js tag instance.
     */
    // tslint:disable-next-line:no-any
    protected riotTagInstance: any;

    /**
     * Constructor (RiotTag)
     *
     * @param riotTagInstance Riot.js tag instance if mounted internally
     * @param opts Riot.js tag options
     *
     * @since v1.0.0
     */
    constructor(riotTagInstance: Tag, opts?: TagOpts) {
        if (this.instanceClass.isDomManipulationAvailable === undefined) {
            this.instanceClass.validateDomManipulationSupport();
        }

        this.riotTagInstance = riotTagInstance;

        if (!opts) {
            opts = { };
        }

        if (opts.originalElementData) {
            this.originalElementData = opts.originalElementData;
        }

        this.id = (ObjectTreeLookup.exists(opts, 'id') ? opts.id : undefined);

        if (this.id === undefined && ObjectTreeLookup.exists(this.originalElementData, 'attributes.data-id')) {
            this.id = this.originalElementData.attributes['data-id'];
        }

        if (this.id === undefined) {
            this.id = this.instanceClass.getRandomDomId();
        }

        this.isWindowResizeRelevant = (opts.listenForWindowResize != false);

        this.onBeforeMount = this.onBeforeMount.bind(this);
        this.onMounted = this.onMounted.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onUnmounted = this.onUnmounted.bind(this);
        this.onWindowResized = this.onWindowResized.bind(this);
        this.onWindowUnload = this.onWindowUnload.bind(this);

        this.one('before-mount', this.onBeforeMount);
        this.one('mount', this.onMounted);
        this.one('unmount', this.onUnmounted);
    }

    /**
     * riotjs.com: Mount the current tag instance
     *
     * @since v1.0.0
     */
    public mount() {
        if (!this.riotTagInstance.isMounted) {
            this.riotTagInstance.mount();
        }
    }

    /**
     * riotjs.com: Removes the given 'event' listeners.
     *
     * @param event Event ID
     * @param fn Callback
     *
     * @since v1.0.0
     */
    // tslint:disable-next-line:no-any
    public off(event: string, fn?: any) {
        this.riotTagInstance.off(event, fn);
    }

    /**
     * riotjs.com: Listen to the given `event` ands execute the `callback` each time
     * an event is triggered.
     *
     * @param event Event ID
     * @param fn Callback
     *
     * @since v1.0.0
     */
    // tslint:disable-next-line:no-any
    public on(event: string, fn: any) {
        this.riotTagInstance.on(event, fn);
    }

    /**
     * Called once for tag event "before-mount".
     *
     * @param _ Event object
     *
     * @since v1.0.0
     */
    public onBeforeMount(_: Event) {
        this.on('resize', this.onResize);

        let $self;

        if (this.isElementSizeRelevant) {
            if (this.originalElementData) {
                this.updateOriginalElementSizeData();
            }

            if (this.instanceClass.isDomManipulationAvailable && this.isWindowResizeRelevant) {
                if ($self === undefined) {
                    $self = $(self);
                }

                // Hack around event listener registration with deprecated boolean return value
                // tslint:disable-next-line:no-any
                ($self as any).on(`resize.djt-event-listener-${this.id}`, this.onWindowResized);
            }
        }

        if (this.instanceClass.isDomManipulationAvailable) {
            if ($self === undefined) {
                $self = $(self);
            }

            $self.one(`beforeunload.djt-event-listener-${this.id}`, this.onWindowUnload);
        }
    }

    /**
     * riotjs.com: Listen to the given `event` and execute the `callback` at most
     * once.
     *
     * @param event Event ID
     * @param fn Callback
     *
     * @since v1.0.0
     */
    // tslint:disable-next-line:no-any
    public one(event: string, fn: any) {
        this.riotTagInstance.one(event, fn);
    }

    /**
     * Called once for tag event "mount".
     *
     * @param _ Event object
     *
     * @since v1.0.0
     */
    public onMounted(_: Event) {
        if (this.isElementSizeRelevant
            && (!this.originalElementData)
           ) {
            this.updateOriginalElementSizeData();
        }
    }

    /**
     * Called for tag event "resize".
     *
     * @param _ Event object
     *
     * @since v1.0.0
     */
    public onResize(_: Event) {
        this.updateOriginalElementSizeData();
    }

    /**
     * Called once for tag event "unmount".
     *
     * @param _ Event object
     *
     * @since v1.0.0
     */
    public onUnmounted(_: Event) {
        $(this.riotTagInstance.root).off(`.djt-event-listener-${this.id}`);
        $(self).off(`.djt-event-listener-${this.id}`);
    }

    /**
     * Called on DOM event "resize".
     *
     * @param event Event object
     *
     * @since v1.0.0
     */
    // tslint:disable-next-line:no-any
    public onWindowResized(event: any) {
        event.preventUpdate = true;

        if (this.isElementSizeRelevant) {
            this.updateOriginalElementSizeData();
        }
    }

    /**
     * Called once for tag event "beforeunload".
     *
     * @param _ Event object
     *
     * @since v1.0.0
     */
    public onWindowUnload(_: Event) {
        this.unmount();
    }

    /**
     * riotjs.com: Execute all callback functions that listen to the given 'event'.
     *
     * @param event Event ID
     *
     * @since v1.0.0
     */
    // tslint:disable-next-line:no-any
    public trigger(event: string, ...args: any[]) {
        this.riotTagInstance.trigger(event, ...args);
    }

    /**
     * riotjs.com: Unmount the tag instance
     *
     * @param mustKeepRoot If it's true the root node will not be removed
     *
     * @return The current tag instance
     * @since  v1.0.0
     */
    public unmount(mustKeepRoot = false) {
        if (this.riotTagInstance.isMounted) {
            return this.riotTagInstance.unmount(mustKeepRoot);
        } else {
            return null;
        }
    }

    /**
     * riotjs.com: Update the tag expressions and options
     *
     * @param data Data to be changed
     *
     * @return The current tag instance
     * @since  v1.0.0
     */
    public update(data?: object) {
        return this.riotTagInstance.update(data);
    }

    /**
     * Updates the original element size.
     *
     * @since v1.0.0
     */
    protected updateOriginalElementSizeData() {
        const instanceClass = this.instanceClass;

        if (instanceClass.isDomManipulationAvailable) {
            if (!this.originalElementData) {
                this.originalElementData = {
                    name: instanceClass.tagName,
                    value: '',
                    attributes: { },
                    children: [ ]
                };
            }

            const $element = $(this.riotTagInstance.root);

            let width = this.originalElementData.width;
            let height = this.originalElementData.height;

            if (width === undefined) {
                width = $element.width();
            }

            if (height === undefined) {
                height = $element.height();
            }

            this.update({
                width: width,
                height: height
            });
        }
    }

    /**
     * Returns the corresponding class of the calling instance.
     *
     * @return Class object
     * @since  v1.0.0
     */
    protected get instanceClass() {
        return Object.getPrototypeOf(this).constructor;
    }

    /**
     * riotjs.com: String of attributes for the tag
     *
     * @return Node attributes
     * @since  v1.0.0
     */
    protected static get attrs() {
        return '';
    }

    /**
     * riotjs.com: The style for the tag
     *
     * @return CSS style rules
     * @since  v1.0.0
     */
    protected static get css() {
        return '';
    }

    /**
     * riotjs.com: The tag name
     *
     * @return Riot.js custom tag name
     * @since  v1.0.0
     */
    public static get tagName() {
        return this.name;
    }

    /**
     * riotjs.com: The layout with expressions
     *
     * @return Layout template
     * @since  v1.0.0
     */
    protected static get tmpl() {
        return '';
    }

    /**
     * Schedule an given animation callback.
     *
     * @param callback Animation callback
     * @param timeout Additional time to wait in milliseconds
     *
     * @since v1.0.0
     */
    public static animateLater(callback: (timestamp?: number) => void, timeout?: number) {
        let animationId;

        if (this.isRequestAnimationFrameAvailable && timeout === undefined) {
            animationId =  self.requestAnimationFrame(callback);
        } else {
            if (this.isRequestAnimationFrameAvailable) {
                const originalCallback = callback;
                callback = () => { self.requestAnimationFrame(originalCallback); };
            }

            animationId = { timeoutId: self.setTimeout(callback, timeout) };
        }

        return animationId;
    }

    /**
     * Attach the tag to the given (X)HTML element and mount it.
     *
     * @param element (X)HTML5 element or DOM selector
     * @param opts Riot.js tag options
     *
     * @since v1.0.0
     */
    public static attachAndMount(element?: Element | string, opts?: TagOpts) {
        if (!this.isRegistered) {
            this.register();
        }

        return this.attachTagNameAndMount(element, this.tagName, opts);
    }

    /**
     * Attach the tag name to the given (X)HTML element and mount it.
     *
     * @param element (X)HTML5 element or DOM selector
     * @param tagName Riot.js tag name to attach and mount
     * @param opts Riot.js tag options
     *
     * @since v1.2.0
     */
    public static attachTagNameAndMount(element: Element | string | undefined, tagName: string, opts?: TagOpts) {
        if (!element) {
            element = 'body';
        }

        if (typeof element == "string") {
            element = util.dom.$(element);
        }

        if (!element) {
            throw new Error('Parent DOM element not found');
        }

        return util.tags.mountTo(element, tagName, opts);
    }

    /**
     * Cancel an scheduled animation callback.
     *
     * @param animationId Animation ID given by "animateLater()"
     *
     * @since v1.0.0
     */
    public static cancelAnimateLater(animationId: number | { timeoutId: number }) {
        if (this.isRequestAnimationFrameAvailable && typeof animationId == 'number') {
            self.cancelAnimationFrame(animationId);
        } else {
            if (typeof animationId != 'number') {
                animationId = animationId.timeoutId;
            }

            self.clearTimeout(animationId);
        }
    }

    /**
     * Returns the given hexadecimal value as a number if possible.
     *
     * @param value hexadecimal value
     *
     * @return Value as number; undefined otherwise
     * @since  v1.0.0
     */
    protected static getHexValueAsNumber(value: string) {
        let numberValue: number;

        if (typeof value == 'string') {
            if (value[0] == '#') {
                value = value.substr(1);
            } else if (value.substr(0, 2) == '0x') {
                value = value.substr(2);
            }
        }

        numberValue = parseInt(value, 16);
        if (isNaN(numberValue)) { numberValue = undefined; }

        return numberValue;
    }

    /**
     * Returns the given value as a number if possible.
     *
     * @param value Decimal value
     *
     * @return Value as number; undefined otherwise
     * @since  v1.0.0
     */
    protected static getValueAsNumber(value: string) {
        let numberValue: number;

        numberValue = parseInt(value, 10);
        if (isNaN(numberValue)) { numberValue = undefined; }

        return numberValue;
    }

    /**
     * Returns if the client supports the "requestAnimationFrame()" method.
     *
     * @return True if the client supports "requestAnimationFrame()"
     * @since  v1.0.0
     */
    public static get isRequestAnimationFrameAvailable() {
        if (this._isRequestAnimationFrameAvailable === undefined) {
            this.validateRequestAnimationFrameSupport();
        }

        return this._isRequestAnimationFrameAvailable;
    }

    /**
     * Returns an properties object for the given $DOM element and its children.
     *
     * @param $element $DOM element
     *
     * @return Properties object
     * @since  v1.0.0
     */
    // tslint:disable-next-line:no-any
    protected static elementToDataWalker($element: any) {
        const element = $element.get(0);

        const _return: OriginalElementData = {
            name: element.nodeName.toLowerCase(),
            value: $element.text(),
            attributes: { },
            children: [ ]
        };

        for (const attribute of element.attributes) {
            _return.attributes[attribute.name] = attribute.value;
        }

        const _class = this;
        const $elementNodes = $element.children();

        if ($elementNodes.length > 0) {
            $elementNodes.each(function() {
                _return.children.push(_class.elementToDataWalker($(this)));
            });
        }

        return _return;
    }

    /**
     * Returns a random value usable as a DOM ID.
     *
     * @return Random value usable as DOM ID
     * @since  v1.0.0
     */
    protected static getRandomDomId() {
        return 'djt-' + Math.random().toString().replace('.', '');
    }

    /**
     * riotjs.com: Mount the tag instance under the DOM element given
     *
     * @param element (X)HTML5 element or DOM selector
     * @param opts Riot.js tag options
     *
     * @since v1.0.0
     */
    // tslint:disable-next-line:no-any
    public static mount(element?: Element | string, opts?: TagOpts): any {
        let _return;

        if (!this.isRegistered) {
            this.register();
        }

        if (!opts) {
            opts = { };
        }

        if (element === undefined) {
            element = this.tagName;
        }

        const isDomElement = Element.prototype.isPrototypeOf(element);

        if (isDomElement && '_tag' in Object.keys(element)) {
            // tslint:disable-next-line:no-any
            _return = (element as any)._tag;

            if (!_return.isMounted()) {
                _return.mount();
            }

            if (opts.length > 0) {
                _return.update(opts);
            }
        } else {
            if (isDomElement && this.isDomManipulationAvailable && (!opts.originalElementData)) {
                const $element = $(element);

                if ($element.length == 1) {
                    const data = this.elementToDataWalker($element);
                    data['width'] = this.getValueAsNumber(data.attributes['data-width']);
                    data['height'] = this.getValueAsNumber(data.attributes['data-height']);

                    opts.originalElementData = data;
                }
            }

            const tags = mount(element, this.tagName, opts);
            _return = (tags.length > 1 ? tags : tags[0]);
        }

        return _return;
    }

    /**
     * Registers this Riot.js tag class for later use.
     *
     * @since v1.0.0
     */
    public static register() {
        if (this.isDomManipulationAvailable === undefined) {
            this.validateDomManipulationSupport();
        }

        if (!this.isRegistered) {
            this.isRegistered = true;

            const instanceConstructor = this.prototype.constructor;

            tag(
                this.tagName,
                this.tmpl,
                this.css,
                this.attrs,
                function(opts?: TagOpts) {
                    if (!opts) {
                        opts = { };
                    }

                    const riotTagInstance = this as Tag;

                    // tslint:disable-next-line
                    new (instanceConstructor as any)(riotTagInstance, opts);
                }
            );

            util.styleManager.inject();
        }
    }

    /**
     * Replaces all children of the given (X)HTML element and mount the tag
     * name instead.
     *
     * @param element (X)HTML5 element or DOM selector
     * @param tagName Riot.js tag name to attach and mount
     * @param opts Riot.js tag options
     *
     * @since v1.2.0
     */
    public static replaceWithTagNameAndMount(element: Element | string, tagName: string, opts?: TagOpts) {
        if (typeof element == "string") {
            element = util.dom.$(element);
        }

        if (!element) {
            throw new Error('Parent DOM element not found');
        }

        if (element.firstChild) {
            util.dom.setInnerHTML(element, '');
        }

        return this.attachTagNameAndMount(element, tagName, opts);
    }

    /**
     * Requires the given Riot.js tags.
     *
     * @param modules JavaScript module
     *
     * @return Promise
     * @since  v1.1.0
     */
    public static async require(...modules: string[]) {
        const promise = PromisedRequire.require(...modules);

        // tslint:disable-next-line:no-any
        return promise.then((modulesLoaded: any) => {
            let moduleLoaded;

            for (const key of Object.keys(modulesLoaded)) {
                moduleLoaded = modulesLoaded[key];

                if (RiotTag.prototype.isPrototypeOf(moduleLoaded)) {
                    // tslint:disable-next-line:no-any
                    (moduleLoaded as any).register();
                }
            }

            return modulesLoaded;
        });
    }

    /**
     * Validates if a DOM manipulation library is available.
     *
     * @since v1.0.0
     */
    protected static validateDomManipulationSupport() {
        this.isDomManipulationAvailable = (typeof $ != 'undefined');
    }

    /**
     * Validates if the client supports the "requestAnimationFrame()" method.
     *
     * @since v1.0.0
     */
    protected static validateRequestAnimationFrameSupport() {
        this._isRequestAnimationFrameAvailable = ('requestAnimationFrame' in self);
    }
}
