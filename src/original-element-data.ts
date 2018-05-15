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

/**
 * Interface representing the "OriginalElementData" object structure.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-xhtml5-riot-tag
 * @since     v1.0.0
 * @license   https://www.direct-netware.de/redirect?licenses;mpl2
 *            Mozilla Public License, v. 2.0
 */
export interface OriginalElementData {
    /**
     * Element node name
     */
    name: string;
    /**
     * Element node value
     */
    value: string;
    /**
     * Element child nodes
     */
    children: OriginalElementData[];

    /**
     * Element node attributes
     */
    // tslint:disable-next-line:no-any
    attributes: any;

    /**
     * Element width if calculated
     */
    width?: number;
    /**
     * Element height if calculated
     */
    height?: number;
}
