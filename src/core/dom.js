/**
 * Tencent weibo javascript library
 *
 * DOM operations
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module dom
 * @requires base
 *           sizzle
 *           common.Object
 * @includes common.String
 */

(function () {
	var _ = QQWB,

	    sizzle = window.Sizzle,

        directElementAttrs = {
             'cellpadding': 'cellPadding',
             'cellspacing': 'cellSpacing',
             'colspan': 'colSpan',
             'rowspan': 'rowSpan',
             'valign': 'vAlign',
             'height': 'height',
             'width': 'width',
             'usemap': 'useMap',
             'frameborder': 'frameBorder',
             //'allowtransparency': 'allowTransparency',
             'maxlength': 'maxLength',
             'type': 'type'
        },
    
		proto;

	proto = {

		find: function (selector, context, result) {
			return sizzle(selector, context, result);
		},

		createElement: function (tagName, properties) {

			var node = document.createElement(tagName);

			this.setProperties(node,properties);

			return node;
		},

		setProperties: function (element, properties) {

			var _ = QQWB,

			    _o = _.Object;

		    _o.forEach(properties, function (val, key) {

                if (key == 'style') {

                  element.style.cssText = val;

                } else if (key == 'class') {

                  element.className = val;

                } else if (key == 'for') {

                  element.htmlFor = val;

                } else if (key in directElementAttrs) {

                  element.setAttribute(directElementAttrs[key], val);

                } else if (_.String.startsWith(key, 'aria-')) {

                  element.setAttribute(key, val);

                } else if (_.String.startsWith(key, 'data-')) {

                  element.setAttribute(key, val);

                } else {

                  element[key] = val;

                }
			});
		} //end set property
	}

	sizzle.noConflict();

	QQWB.provide("dom",_.Object.create(proto));

} ());

QQWB.extend("dom", {
    /**
     * Add handlers when document is ready
     *
     * @access public
     * @param handler {Function} handler
     * @return {Object} QQWB
     */
   ready: function (handler) {

	   var _ = QQWB,

	       _b = _.bigtable,

	       ready = _b.get("document", "ready"),

           try_trigger_doc_ready;

       if (ready) {

           handler && handler();

       } else {

           _.bind(_b.get("nativeevent","documentready"),handler);

           try_trigger_doc_ready = _b.get("document", "tryready");

           try_trigger_doc_ready && try_trigger_doc_ready();
       }

	   return _;
    }

});

// compat for older version
QQWB.documentReady = QQWB.dom.ready;

QQWB.find = QQWB.dom.find;
