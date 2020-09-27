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

import { DomUtilities } from './dom-utilities';

/**
 * Interface representing the "OriginalElementData" object structure.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-html-component
 * @since     v2.0.0
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
     * Element node inner HTML
     */
    html?: string;
    /**
     * Element child nodes
     */
    children: OriginalElementData[];

    /**
     * Element node attributes
     */
    attributes: { [key: string]: string };

    /**
     * Element width if calculated
     */
    width?: number;
    /**
     * Element height if calculated
     */
    height?: number;
}

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
export class OriginalElementWalker {
    /**
     * Milliseconds to wait after the UI DOM event occurred before callbacks are executed.
     */
    public static parse(element: Element, nodeNamesWithInnerHtml?: string[]) {
        if (!nodeNamesWithInnerHtml) {
            nodeNamesWithInnerHtml = [ ];
        }

        const _return: OriginalElementData = {
            attributes: { },
            children: [ ],
            name: element.nodeName.toLowerCase(),
            value: ''
        };

        let isInnerHtmlAdded = false;

        if (_return.value !== null
            && (nodeNamesWithInnerHtml.includes(_return.name) || nodeNamesWithInnerHtml.includes('*'))
        ) {
            isInnerHtmlAdded = true;
            _return['html'] = element.innerHTML;
        }

        const attributes = element.attributes;
        let attributesNodeType;

        if (attributes) {
            for (let i = 0; i < attributes.length; i++) {
                _return.attributes[attributes[i].name.toLowerCase()] = attributes[i].value;
            }
        } else if (typeof Node.ATTRIBUTE_NODE != 'undefined') {
            attributesNodeType = Node.ATTRIBUTE_NODE;
        }

        let node;
        const nodes = element.childNodes;

        for (let i = 0; i < nodes.length; i++) {
            node = nodes[i];

            switch (node.nodeType) {
                case Node.CDATA_SECTION_NODE:
                    if (_return.value.length > 0) {
                        _return.value += ' ';
                    }

                    _return.value += node.nodeValue.trim();

                    break;
                case Node.ELEMENT_NODE:
                    if (!isInnerHtmlAdded) {
                        _return.children.push(this.parse(node as Element, nodeNamesWithInnerHtml));
                    }

                    break;
                case Node.TEXT_NODE:
                    if (_return.value.length > 0) {
                        _return.value += ' ';
                    }

                    _return.value += node.nodeValue.trim();

                    break;
                default:
                    if (attributesNodeType && node.nodeType === attributesNodeType) {
                        _return.attributes[node.nodeName.toLowerCase()] = node.nodeValue;
                    }
            }
        }

        if (!('class' in _return.attributes) && element.className) {
            _return.attributes['class'] = element.className;
        }

        if (element instanceof HTMLElement) {
            const cssStyle = element.style;

            _return.width = DomUtilities.getValueAsFloatNumber(cssStyle.width);
            _return.height = DomUtilities.getValueAsFloatNumber(cssStyle.height);
        }

        if (_return.width === undefined && 'width' in _return.attributes) {
            _return.width = DomUtilities.getValueAsNumber(_return.attributes.width);
        }

        if (_return.height === undefined && 'height' in _return.attributes) {
            _return.height = DomUtilities.getValueAsNumber(_return.attributes.height);
        }

        return _return;
    }
}
