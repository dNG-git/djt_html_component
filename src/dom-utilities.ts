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

import { ScheduledAnimationIdType } from './types';

/**
 * DOM related utility functions.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-xhtml5-riot-tag
 * @since     v3.0.0
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
     * Flag indicating that a DOM manipulation library is available
     */
    protected static _isDomManipulationAvailable: boolean = undefined;
    /**
     * Flag indicating that the client supports "requestAnimationFrame()"
     */
    protected static _isRequestAnimationFrameAvailable: boolean = undefined;

    /**
     * Returns if a DOM manipulation library is available.
     *
     * @return True if a DOM manipulation library is available
     * @since  v3.0.0
     */
    public static get isDomManipulationAvailable() {
        if (this._isDomManipulationAvailable === undefined) {
            this.validateDomManipulationSupport();
        }

        return this._isDomManipulationAvailable;
    }

    /**
     * Returns if the client supports the "requestAnimationFrame()" method.
     *
     * @return True if the client supports "requestAnimationFrame()"
     * @since  v3.0.0
     */
    public static get isRequestAnimationFrameAvailable() {
        if (this._isRequestAnimationFrameAvailable === undefined) {
            this.validateRequestAnimationFrameSupport();
        }

        return this._isRequestAnimationFrameAvailable;
    }

    /**
     * Schedule an given animation callback.
     *
     * @param callback Animation callback
     * @param timeout Additional time to wait in milliseconds
     *
     * @return Scheduled animation ID
     * @since  v3.0.0
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
     * @since v3.0.0
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
     * Returns the given hexadecimal value as a number if possible.
     *
     * @param value hexadecimal value
     *
     * @return Value as number; undefined otherwise
     * @since  v3.0.0
     */
    public static getHexValueAsNumber(value: string) {
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
     * Returns the given value as a float number if possible.
     *
     * @param value Float value
     *
     * @return Float value as number; undefined otherwise
     * @since  v3.0.0
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
     * @since  v3.0.0
     */
    public static getValueAsNumber(value: string) {
        let numberValue: number;

        numberValue = parseInt(value, 10);
        if (isNaN(numberValue)) { numberValue = undefined; }

        return numberValue;
    }

    /**
     * Validates if a DOM manipulation library is available.
     *
     * @since v1.0.0
     */
    protected static validateDomManipulationSupport() {
        this._isDomManipulationAvailable = (typeof $ != 'undefined');
    }

    /**
     * Validates if the client supports the "requestAnimationFrame()" method.
     *
     * @since v3.0.0
     */
    protected static validateRequestAnimationFrameSupport() {
        this._isRequestAnimationFrameAvailable = ('requestAnimationFrame' in self);
    }
}
