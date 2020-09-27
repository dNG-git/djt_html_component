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

import { ScheduledAnimationIdType } from './types';

type DomEventElementTypes = Element | Window | string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DomEventListener = (this: Element, ev: Event) => any;

/**
 * DOM related utility functions.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-html-component
 * @since     v2.0.0
 * @license   https://www.direct-netware.de/redirect?licenses;mpl2
 *            Mozilla Public License, v. 2.0
 */
export class DomUtilities {
    /**
     * Milliseconds to wait before calling a requested animation callback if
     * "requestAnimationFrame()" is not available.
     */
    protected static readonly ANIMATION_DELAY_MS = 25;

    /**
     * Flag indicating that the client supports "requestAnimationFrame()"
     */
    protected static _isRequestAnimationFrameAvailable: boolean = undefined;

    /**
     * Returns if the client supports the "requestAnimationFrame()" method.
     *
     * @return True if the client supports "requestAnimationFrame()"
     * @since  v2.0.0
     */
    public static get isRequestAnimationFrameAvailable() {
        if (this._isRequestAnimationFrameAvailable === undefined) {
            this.validateRequestAnimationFrameSupport();
        }

        return this._isRequestAnimationFrameAvailable;
    }

    /**
     * Short hand method for "document.querySelector()"
     *
     * @param selector DOM selectors
     *
     * @return DOM element matched first
     * @since  v2.0.0
     */
    public static $(selector: DomEventElementTypes) {
        const _return = (typeof selector == 'string' ? document.querySelector(selector) : selector);

        if (_return === null) {
            throw new Error('Selector has not matched any DOM element');
        }

        return _return;
    }

    /**
     * Short hand method for "document.querySelector()"
     *
     * @param selector DOM selectors
     *
     * @return DOM element matched first
     * @since  v2.0.0
     */
    public static $$(selector: string) {
        const _return = document.querySelectorAll(selector);

        if (_return.length < 1) {
            throw new Error('Selector has not matched any DOM element');
        }

        return _return;
    }

    /**
     * Short hand method for "element.addEventListener()"
     *
     * @param selector DOM selectors
     *
     * @return DOM element matched first
     * @since  v2.0.0
     */
    public static addEventListener(element: DomEventElementTypes, event: string, listener: DomEventListener, options?: unknown) {
        if (!(element instanceof Element)) {
            element = this.$(element);
        }

        element.addEventListener(event, listener, options);
    }

    /**
     * Short hand method for "element.addEventListener()"
     *
     * @param selector DOM selectors
     *
     * @return DOM element matched first
     * @since  v2.0.0
     */
    public static addEventOneTimeListener(element: DomEventElementTypes, event: string, listener: DomEventListener, options?: unknown) {
        const wrappedListener = function (this: Element, ev: Event) {
            DomUtilities.removeEventListener(element, event, wrappedListener, options);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return listener.call(this, ev);
        };

        this.addEventListener(element, event, wrappedListener, options);
    }

    /**
     * Schedule an given animation callback.
     *
     * @param callback Animation callback
     * @param timeout Additional time to wait in milliseconds
     *
     * @return Scheduled animation ID
     * @since  v2.0.0
     */
    public static animateLater(callback: (timestamp?: number) => void, timeout?: number) {
        let animationId;

        if (this.isRequestAnimationFrameAvailable) {
            if (timeout === undefined) {
                animationId = self.requestAnimationFrame(callback);
            } else {
                const originalCallback = callback;
                callback = () => { self.requestAnimationFrame(originalCallback); };
            }
        }

        if (animationId === undefined) {
            animationId = {
                timeoutId: self.setTimeout(callback, (timeout === undefined ? this.ANIMATION_DELAY_MS : timeout))
            };
        }

        return animationId;
    }

    /**
     * Cancel an scheduled animation callback.
     *
     * @param animationId Animation ID given by "animateLater()"
     *
     * @since v2.0.0
     */
    public static cancelAnimateLater(animationId: ScheduledAnimationIdType) {
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
     * Creates a cross-browser compatible event.
     *
     * @param selector DOM selectors
     *
     * @return DOM element matched first
     * @since  v2.0.0
     */
    public static createEvent(event: string, bubbles = true, cancelable = true) {
        const _return = (
            typeof CustomEvent != 'undefined'
            ? document.createEvent('CustomEvent') : document.createEvent('Event')
        );

        _return.initEvent(event, bubbles, cancelable);

        return _return;
    }

    /**
     * Returns a string separated by the given separator and without values to be
     * filtered.
     *
     * @param value Initial string
     * @param filteredValues String values to be filtered out
     * @param separator Value separator
     *
     * @return Filtered string
     * @since  v2.1.0
     */
    private static _getFilteredString(value: string, filteredValues: string[], additionalValues: string | string[], prepend: boolean, separator = ' ') {
        const valueList = value.split(separator).filter((value) => {
            return (!filteredValues.includes(value));
        });

        if (additionalValues !== undefined) {
            if (typeof additionalValues == 'string') {
                additionalValues = additionalValues.split(separator);
            }

            // eslint-disable-next-line @typescript-eslint/unbound-method
            const valueListCallable = (prepend ? valueList.unshift : valueList.push);

            for (const additionalValue of additionalValues) {
                valueListCallable.call(valueList, additionalValue);
            }
        }

        return valueList.join(separator);
    }

    /**
     * Returns a string separated by the given separator and without values to be
     * filtered.
     *
     * @param value Initial string
     * @param filteredValues String values to be filtered out
     * @param separator Value separator
     *
     * @return Filtered string
     * @since  v2.1.0
     */
    public static getFilteredString(value: string, filteredValues: string[], separator = ' ') {
        return this._getFilteredString(value, filteredValues, undefined, false, separator);
    }

    /**
     * Returns a string separated by the given separator, without values to be
     * filtered and with additional values appended.
     *
     * @param value Initial string
     * @param filteredValues String values to be filtered out
     * @param additionalValues String values to be appended
     * @param separator Value separator
     *
     * @return Filtered string
     * @since  v2.1.0
     */
    public static getFilteredAndAppendedString(value: string, filteredValues: string[], additionalValues: string | string[], separator = ' ') {
        return this._getFilteredString(value, filteredValues, additionalValues, false, separator);
    }

    /**
     * Returns a string separated by the given separator, without values to be
     * filtered and with additional values prepended.
     *
     * @param value Initial string
     * @param filteredValues String values to be filtered out
     * @param additionalValues String values to be prepended
     * @param separator Value separator
     *
     * @return Filtered string
     * @since  v2.1.0
     */
    public static getFilteredAndPrependedString(value: string, filteredValues: string[], additionalValues: string | string[], separator = ' ') {
        return this._getFilteredString(value, filteredValues, additionalValues, true, separator);
    }

    /**
     * Returns the given hexadecimal value as a number if possible.
     *
     * @param value hexadecimal value
     *
     * @return Value as number; undefined otherwise
     * @since  v2.0.0
     */
    public static getHexValueAsNumber(value: string) {
        let numberValue: number;

        if (typeof value == 'string') {
            if (value[0] === '#') {
                value = value.substr(1);
            } else if (value.substr(0, 2) === '0x') {
                value = value.substr(2);
            }
        }

        numberValue = parseInt(value, 16);
        if (isNaN(numberValue)) { numberValue = undefined; }

        return numberValue;
    }

    /**
     * Returns the given value as a float number if possible.
     *
     * @param value Float value
     *
     * @return Float value as number; undefined otherwise
     * @since  v2.0.0
     */
    public static getValueAsFloatNumber(value: string) {
        let numberValue: number;

        numberValue = parseFloat(value);
        if (isNaN(numberValue)) { numberValue = undefined; }

        return numberValue;
    }

    /**
     * Returns the given value as a number if possible.
     *
     * @param value Decimal value
     *
     * @return Value as number; undefined otherwise
     * @since  v2.0.0
     */
    public static getValueAsNumber(value: string) {
        let numberValue: number;

        numberValue = parseInt(value, 10);
        if (isNaN(numberValue)) { numberValue = undefined; }

        return numberValue;
    }

    /**
     * Short hand method for "element.removeEventListener()"
     *
     * @param selector DOM selectors
     *
     * @return DOM element matched first
     * @since  v2.0.0
     */
    public static removeEventListener(element: DomEventElementTypes, event: string, listener: DomEventListener, options?: unknown) {
        if (!(element instanceof Element)) {
            element = this.$(element);
        }

        element.removeEventListener(event, listener, options);
    }

    /**
     * Validates if the client supports the "requestAnimationFrame()" method.
     *
     * @since v2.0.0
     */
    protected static validateRequestAnimationFrameSupport() {
        this._isRequestAnimationFrameAvailable = ('requestAnimationFrame' in self);
    }
}
