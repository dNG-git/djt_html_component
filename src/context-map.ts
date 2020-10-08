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

/**
 * The "ContextMap" provides an "Map" class based API to access context
 * variables.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-html-component
 * @since     v2.2.0
 * @license   https://www.direct-netware.de/redirect?licenses;mpl2
 *            Mozilla Public License, v. 2.0
 */
export class ContextMap<C> {
    /**
     * Underlying context object
     */
    protected context: C;

    /**
     * Constructor (ContextMap)
     *
     * @param context Underlying context object
     *
     * @since v2.2.0
     */
    constructor(context?: C) {
        if (!context) {
            context = { } as C;
        }

        this.context = { ...context };
    }

    /**
     * developer.mozilla.org: The size accessor property returns the number of
     * elements in a Map object.
     *
     * @return Number of elements
     * @since  v2.2.0
     */
    public get size() {
        return this.keys().length;
    }

    /**
     * developer.mozilla.org: The clear() method removes all elements from a Map
     * object.
     *
     * @since v2.2.0
     */
    public clear() {
        this.context = { } as C;
    }

    /**
     * developer.mozilla.org: The delete() method removes the specified element
     * from a Map object by key.
     *
     * @param key The key of the element to remove from the Map object.
     *
     * @return True if found and removed
     * @since  v2.2.0
     */
    public delete<K extends keyof C>(key: K & string) {
        let _return = false;

        if (key in this.context) {
            delete this.context[key];
            _return = true;
        }

        return _return;
    }

    /**
     * developer.mozilla.org: The get() method returns a specified element from a
     * Map object.
     *
     * @param key The key of the element to return from the Map object.
     *
     * @return Element specified; undefined otherwise
     * @since  v2.2.0
     */
    public get<K extends keyof C>(key: K | string) {
        return (key as K in this.context ? this.context[key as K] : undefined);
    }

    /**
     * developer.mozilla.org: The has() method returns a boolean indicating
     * whether an element with the specified key exists or not.
     *
     * @param key The key of the element to test for presence in the Map object.
     *
     * @return True if it exists
     * @since  v2.2.0
     */
    public has<K extends keyof C>(key: K | string) {
        return (key as K in this.context);
    }

    /**
     * developer.mozilla.org: The Object.keys() method returns an array of a
     * given object's own enumerable property names.
     *
     * @return Array of keys
     * @since  v2.2.0
     */
    public keys() {
        return Object.getOwnPropertyNames(this.context);
    }

    /**
     * developer.mozilla.org: The set() method adds or updates an element with a
     * specified key and a value to a Map object.
     *
     * @param key The key of the element to add to the Map object.
     * @param value The value of the element to add to the Map object.
     *
     * @return The Map object
     * @since  v2.2.0
     */
    public set<K extends keyof C>(key: K | string, value: C[K]) {
        this.context[key as K] = value;
        return this;
    }
}
