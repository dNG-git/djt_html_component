/**
 * direct JavaScript Toolbox
 * All-in-one toolbox to provide more reusable JavaScript features
 *
 * (C) direct Netware Group - All rights reserved
 * https://www.direct-netware.de/redirect?djt;html;riot_tag
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 *
 * https://www.direct-netware.de/redirect?licenses;mpl2
 *
 * @license Mozilla Public License, v. 2.0
 */

import PromisedRequire from 'djt-promised-require';
import { mount, tag, Tag, TagOpts, util } from 'riot';

import { DomUtilities } from './dom-utilities';
import { OriginalElementData } from './original-element-data';

/**
 * Abstract Riot.js tag class supporting tag registration.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-html-riot-tag
 * @since     v1.0.0
 * @license   https://www.direct-netware.de/redirect?licenses;mpl2
 *            Mozilla Public License, v. 2.0
 */
export abstract class RiotTag {
    /**
     * Milliseconds to wait after the UI DOM event occurred before callbacks are executed.
     */
    protected static readonly DOM_UI_CHANGE_DELAY_MS = 85;

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
    protected _isElementSizeRelevant = false;
    /**
     * Flag indicating that the instance is interested in window resize events.
     */
    protected _isWindowResizeRelevant = false;
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
        this.riotTagInstance = riotTagInstance;

        if (!opts) {
            opts = { };
        }

        if (opts.originalElementData) {
            this.originalElementData = opts.originalElementData;
        }

        this.id = this.instanceClass.getOptFromAttribute(opts, 'id', '');

        if (typeof this.id != 'string') {
            this.id = '';
        }

        if (this.id == '' && this.originalElementData) {
            this.id = this.instanceClass.getOptFromAttribute(this.originalElementData.attributes, 'id', '');
        }

        if (this.id == '') {
            this.id = this.instanceClass.getRandomDomId();
        }

        this.onAnyDomChanged = this.onAnyDomChanged.bind(this);
        this.onBeforeMount = this.onBeforeMount.bind(this);
        this.onBeforeUnmount = this.onBeforeUnmount.bind(this);
        this.onMounted = this.onMounted.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onUnmounted = this.onUnmounted.bind(this);
        this.onWindowResized = this.onWindowResized.bind(this);
        this.onWindowUnload = this.onWindowUnload.bind(this);
        this.updateTagSize = this.updateTagSize.bind(this);

        this.isWindowResizeRelevant = (
            'listenForWindowResize' in opts && opts.listenForWindowResize != false
        );

        this.on('before-mount', this.onBeforeMount);
        this.on('before-unmount', this.onBeforeUnmount);
        this.on('mount', this.onMounted);
        this.on('unmount', this.onUnmounted);
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
     * Returns true if that the instance is interested in the size of the
     * (X)HTML5 element.
     *
     * @return True if (X)HTML5 element size is relevant
     * @since  v1.0.0
     */
    public get isElementSizeRelevant() {
        return this._isElementSizeRelevant;
    }

    /**
     * Sets the flag indicating if that the instance is interested in the size of
     * the (X)HTML5 element.
     *
     * @param value True if (X)HTML5 element size is relevant
     *
     * @since v1.0.0
     */
    public set isElementSizeRelevant(value) {
        value = Boolean(value);

        if (this._isElementSizeRelevant !== value) {
            if (value) {
                this.on('resize', this.onResize);

                if (this.riotTagInstance.isMounted) {
                    DomUtilities.animateLater(this.updateTagSize);
                }
            } else {
                this.off('resize', this.onResize);
            }

            this._isElementSizeRelevant = value;
        }
    }

    /**
     * Returns true if that the instance is interested in window resize events.
     *
     * @return True if window resize events are relevant
     * @since  v1.0.0
     */
    public get isWindowResizeRelevant() {
        return this._isWindowResizeRelevant;
    }

    /**
     * Sets the flag indicating that the instance is interested in window resize
     * events.
     *
     * @param value True if window resize events are relevant
     *
     * @since v1.0.0
     */
    public set isWindowResizeRelevant(value) {
        value = Boolean(value);

        if (DomUtilities.isDomManipulationAvailable && this._isWindowResizeRelevant !== value) {
            const $self = $(self);

            if (value) {
                $self.on(`resize.djt-riot-tag-${this.id}`, this.onWindowResized);
            } else {
                $self.off(`resize.djt-riot-tag-${this.id}`, this.onWindowResized);
            }

            this._isWindowResizeRelevant = value;
        }
    }

    /**
     * riot.js.org: Mount the current tag instance
     *
     * @since v1.0.0
     */
    public mount() {
        if (!this.riotTagInstance.isMounted) {
            this.riotTagInstance.mount();
        }
    }

    /**
     * riot.js.org: Removes the given 'event' listeners.
     *
     * @param event Event ID
     * @param fn Callback
     *
     * @since v1.0.0
     */
    public off(event: string, fn?: unknown) {
        this.riotTagInstance.off(event, fn);
    }

    /**
     * riot.js.org: Listen to the given `event` ands execute the `callback` each
     * time an event is triggered.
     *
     * @param event Event ID
     * @param fn Callback
     *
     * @since v1.0.0
     */
    public on(event: string, fn: unknown) {
        this.riotTagInstance.on(event, fn);
    }

    /**
     * Called on custom DOM event "xdomchanged" including own triggered ones.
     *
     * @param event Event object
     *
     * @since v1.0.0
     */
    public onAnyDomChanged(event: Event) {
        if (event.target !== this.riotTagInstance.root) {
            this.onDomChanged(event);
        }
    }

    /**
     * Called for tag event "before-mount".
     *
     * @since v1.0.0
     */
    public onBeforeMount() {
        let $self;

        if (DomUtilities.isDomManipulationAvailable) {
            if ($self === undefined) {
                $self = $(self);
            }

            $self.one(`beforeunload.djt-riot-tag-${this.id}`, this.onWindowUnload);
        }
    }

    /**
     * Called for tag event "before-unmount".
     *
     * @since v1.0.0
     */
    public onBeforeUnmount() {
        this.isElementSizeRelevant = false;
        this.isWindowResizeRelevant = false;

        $(this.riotTagInstance.root).off(`.djt-riot-tag-${this.id}`);
        $(self).off(`.djt-riot-tag-${this.id}`);
    }

    /**
     * Called on custom DOM event "xdomchanged".
     *
     * @param _ Event object
     *
     * @since v1.0.0
     */
    protected onDomChanged(_: Event) {
        if (this.isElementSizeRelevant && this.riotTagInstance.isMounted) {
            DomUtilities.animateLater(this.updateTagSize);
        }
    }

    /**
     * riot.js.org: Listen to the given `event` and execute the `callback` at most
     * once.
     *
     * @param event Event ID
     * @param fn Callback
     *
     * @since v1.0.0
     */
    public one(event: string, fn: unknown) {
        this.riotTagInstance.one(event, fn);
    }

    /**
     * Called for tag event "mount".
     *
     * @since v1.0.0
     */
    public onMounted() {
        if (this.isElementSizeRelevant) {
            this.updateTagSize();
        }

        if (DomUtilities.isDomManipulationAvailable) {
            if ((!this.riotTagInstance.parent) || this.riotTagInstance.parent.isMounted) {
                $(this.riotTagInstance.root).trigger('xdomchanged');
            }

            $(self).on(`xdomchanged.djt-riot-tag-${this.id}`, this.onAnyDomChanged);
        }
    }

    /**
     * Called for tag event "resize".
     *
     * @param uiSettled True if the DOM based UI is known to already have changed
     *
     * @since v1.0.0
     */
    public onResize(uiSettled = false) {
        if (this.isElementSizeRelevant && this.riotTagInstance.isMounted) {
            DomUtilities.animateLater(
                this.updateTagSize,
                (uiSettled ? undefined : this.instanceClass.DOM_UI_CHANGE_DELAY_MS)
            );
        }
    }

    /**
     * Called for tag event "unmount".
     *
     * @since v1.0.0
     */
    public onUnmounted() {
        if (!this.riotTagInstance.parent) {
            $(self).trigger('xdomchanged');
        }
    }

    /**
     * Called on DOM event "resize".
     *
     * @param _ Event object
     *
     * @since v1.0.0
     */
    public onWindowResized(_: Event) {
        if (this.isElementSizeRelevant && this.riotTagInstance.isMounted) {
            DomUtilities.animateLater(this.updateTagSize);
        }
    }

    /**
     * Called on DOM event "beforeunload".
     *
     * @param _ Event object
     *
     * @since v1.0.0
     */
    public onWindowUnload(_: Event) {
        this.unmount();
    }

    /**
     * riot.js.org: Execute all callback functions that listen to the given
     * 'event'.
     *
     * @param event Event ID
     *
     * @since v1.0.0
     */
    public trigger(event: string, ...args: Array<unknown>) {
        this.riotTagInstance.trigger(event, ...args);
    }

    /**
     * riot.js.org: Unmount the tag instance
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
     * riot.js.org: Update the tag expressions and options
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
     * Updates the underlying tag element size.
     *
     * @since v1.0.0
     */
    protected updateTagSize() {
        if (!this.originalElementData) {
            this.originalElementData = {
                name: this.instanceClass.tagName,
                value: '',
                attributes: { },
                children: [ ]
            };
        }

        let width = this.originalElementData.width;
        let height = this.originalElementData.height;

        if (width === undefined || height === undefined) {
            const metrics = (
                this.riotTagInstance.root.getBoundingClientRect
                ? this.riotTagInstance.root.getBoundingClientRect() : { }
            );

            if ((!metrics.width) && DomUtilities.isDomManipulationAvailable) {
                const $element = $(this.riotTagInstance.root);

                if (width === undefined) {
                    width = $element.width();
                }

                if (height === undefined) {
                    height = $element.height();
                }
            }

            if (width === undefined) {
                width = metrics.width;
            }

            if (height === undefined) {
                height = metrics.height;
            }
        }

        if (width !== undefined && height !== undefined) {
            this.update({
                width: (width ? width : undefined),
                height: (height ? height : undefined)
            });
        }
    }

    /**
     * riot.js.org: String of attributes for the tag
     *
     * @return Node attributes
     * @since  v1.0.0
     */
    protected static get attrs() {
        return '';
    }

    /**
     * riot.js.org: The style for the tag
     *
     * @return CSS style rules
     * @since  v1.0.0
     */
    protected static get css() {
        return '';
    }

    /**
     * Returns a list of node names "originalElementData" should provide the
     * inner HTML content instead of being parsed.
     *
     * @return List of node names
     * @since  v1.0.0
     */
    protected static get originalElementNodeNamesWithHtml(): string[] {
        return [ ];
    }

    /**
     * riot.js.org: The tag name
     *
     * @return Riot.js custom tag name
     * @since  v1.0.0
     */
    public static get tagName() {
        return this.name;
    }

    /**
     * riot.js.org: The layout with expressions
     *
     * @return Layout template
     * @since  v1.0.0
     */
    protected static get tmpl() {
        return '';
    }

    /**
     * Attach the tag to the given (X)HTML element and mount it.
     *
     * @param element (X)HTML5 element or DOM selector
     * @param opts Riot.js tag options
     *
     * @return Tag mounted
     * @since  v1.0.0
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
     * @return Tag mounted
     * @since  v1.0.0
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

        const tagElement = util.dom.mkEl(tagName);
        element.appendChild(tagElement);

        return util.tags.mountTo(tagElement, tagName, opts);
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
    protected static elementToDataWalker($element: any, nodeNamesWithInnerHtml?: string[]) {
        if (!nodeNamesWithInnerHtml) {
            nodeNamesWithInnerHtml = this.originalElementNodeNamesWithHtml;
        }

        const element = $element.get(0);

        const _return: OriginalElementData = {
            name: element.nodeName.toLowerCase(),
            value: $element.text(),
            attributes: { },
            children: [ ]
        };

        if (_return.value !== null && nodeNamesWithInnerHtml.includes(_return.name)) {
            _return['html'] = $element.html();
        }

        const attributes = element.attributes;

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < attributes.length; i++) {
            _return.attributes[attributes[i].name] = attributes[i].value;
        }

        if (!('class' in _return.attributes) && element.className) {
            _return.attributes['class'] = element.className;
        }

        if (!('html' in _return)) {
            const _class = this;
            const $elementNodes = $element.children();

            if ($elementNodes.length > 0) {
                $elementNodes.each(function() {
                    _return.children.push(_class.elementToDataWalker($(this), nodeNamesWithInnerHtml));
                });
            }
        }

        return _return;
    }

    /**
     * Returns the requested Riot.js option from the attribute name or it's "data"
     * attribute if applicable.
     *
     * @param opts Riot.js tag options
     * @param name Option name
     * @param defaultValue Default value returned if option is not found
     *
     * @return Option value
     * @since  v1.0.0
     */
    // tslint:disable-next-line:no-any
    protected static getOptFromAttribute(opts: TagOpts, name: string, defaultValue?: any) {
        let _return;

        if (opts) {
            if (name in opts) {
                _return = opts[name];
            } else {
                name = 'data' + name.charAt(0).toUpperCase() + name.slice(1);
            }

            if (_return === undefined && name in opts) {
                _return = opts[name];
            }
        }

        if (_return === undefined) {
            _return = defaultValue;
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
     * Returns the Riot.js tag instance under the DOM element given.
     *
     * @param element (X)HTML5 element
     *
     * @return Riot.js tag
     * @since  v1.0.0
     */
    protected static getTag(element: Element) {
        let _return;

        // tslint:disable-next-line:no-any
        if (element && (element as any)._tag) {
            // tslint:disable-next-line:no-any
            _return = (element as any)._tag;
        }

        return _return;
    }

    /**
     * riot.js.org: Mount the tag instance under the DOM element given
     *
     * @param element (X)HTML5 element or DOM selector
     * @param opts Riot.js tag options
     *
     * @return Tag or array of tags mounted
     * @since  v1.0.0
     */
    public static mount(element?: Element | string, opts?: TagOpts) {
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

        let $element;
        let isDomElement = (element instanceof Element);

        if (!isDomElement) {
            $element = $(element);

            if ($element.length === 1) {
                element = $element.get(0);
                isDomElement = (element instanceof Element);
            }
        }

        // tslint:disable-next-line:no-any
        if (isDomElement && (element as any)._tag) {
            // tslint:disable-next-line:no-any
            _return = (element as any)._tag;

            if (!_return.isMounted()) {
                _return.mount();
            }

            if (opts.length > 0) {
                _return.update(opts);
            }
        } else {
            if (isDomElement && DomUtilities.isDomManipulationAvailable && (!opts.originalElementData)) {
                if (!$element) {
                    $element = $(element);
                }

                if ($element.length == 1) {
                    const data = this.elementToDataWalker($element);
                    data['width'] = DomUtilities.getValueAsNumber(data.attributes['data-width']);
                    data['height'] = DomUtilities.getValueAsNumber(data.attributes['data-height']);

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

                    // tslint:disable-next-line
                    new (instanceConstructor as any)(this, opts);
                }
            );

            util.styleManager.inject();
        }
    }

    /**
     * Replaces all children of the given (X)HTML element and mounts the tag
     * instead.
     *
     * @param element (X)HTML5 element or DOM selector
     * @param tagName Riot.js tag name to attach and mount
     * @param opts Riot.js tag options
     *
     * @return Tag mounted
     * @since  v1.0.0
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

                if (RiotTag.prototype.isPrototypeOf(moduleLoaded.prototype)) {
                    // tslint:disable-next-line:no-any
                    (moduleLoaded as any).register();
                }
            }

            return modulesLoaded;
        });
    }
}
