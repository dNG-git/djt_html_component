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

import { Tag, TagOpts, util } from 'riot';

import { RiotTag } from './riot-tag';

/**
 * Dynamic HTML content can be used to set the inner HTML content dynamically.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-xhtml5-riot-tag
 * @since     v1.3.0
 * @license   https://www.direct-netware.de/redirect?licenses;mpl2
 *            Mozilla Public License, v. 2.0
 */
export class DynamicHtmlContent extends RiotTag {
    protected content: string;

    /**
     * Constructor (DynamicHtmlContent)
     *
     * @param riotTagInstance Riot.js tag instance if mounted internally
     * @param opts Riot.js tag options
     *
     * @since v1.3.0
     */
    constructor(riotTagInstance: Tag, opts?: TagOpts) {
        super(riotTagInstance, opts);

        if (!opts) {
            opts = { };
        }

        this.onUpdated = this.onUpdated.bind(this);

        this.on('updated', this.onUpdated);

        this.update({ content: (opts.content ? opts.content : '') });
    }

    /**
     * riotjs.com: Right after the tag is updated.
     *
     * @since v1.3.0
     */
    public onUpdated() {
        const content = (
            typeof this.riotTagInstance.content == 'string'
            ? this.riotTagInstance.content : String(this.riotTagInstance.content)
        );

        if (this.content !== content) {
            this.content = content;
            util.dom.setInnerHTML(this.riotTagInstance.root, content);

            $(this.riotTagInstance.root).trigger('xdomchanged');
        }
    }

    /**
     * riotjs.com: The tag name
     *
     * @return Riot.js custom tag name
     * @since  v1.3.0
     */
    public static get tagName() {
        return 'djt-dynamic-html-content';
    }

    /**
     * riotjs.com: The layout with expressions
     *
     * @return Layout template
     * @since  v1.3.0
     */
    protected static get tmpl() {
        return '';
    }
}
