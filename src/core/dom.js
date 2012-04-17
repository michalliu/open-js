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
 *           util.bigtable
 *           core.log
 *           core.event
 *           core.init
 *           core.browser
 *
 * @includes common.String
 */

(function (undefined) {

	var _ = QQWB,

	    _b = _.bigtable,

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
             'innerhtml': 'innerHTML',
             //'allowtransparency': 'allowTransparency',
             'maxlength': 'maxLength',
             'type': 'type'
        },
    
		proto;

	sizzle.noConflict();

	proto = {

	};


	QQWB.provide("dom.$", function (selector, context) {

		var o,

		    elements;

		if (selector && selector.nodeType == 1) {

			elements = [selector];

		} else if (_.String.isString(selector)) {

		    elements = this.find(selector, context);

		}

		o = _.Object.create(proto);

		o.all = elements;

		return o;

	});

    QQWB.extend("dom", {
         /**
          * Add handlers when document is ready
          *
          * @access public
          * @param handler {Function} handler
          * @return {Object} QQWB
          */
        ready: function (handler) {
    
            var ready = _b.get("document", "ready"),
    
                try_trigger_doc_ready;
    
            if (ready) {
    
                handler && handler();
    
            } else {
    
                _.bind(_b.get("nativeevent","documentready"),handler);
    
                try_trigger_doc_ready = _b.get("document", "tryready");
    
                try_trigger_doc_ready && try_trigger_doc_ready();
            }
    
            return _;
        },
    
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
    
                  element[directElementAttrs[key]] = val;
    
                } else if (_.String.startsWith(key, 'aria-')) {
    
                  element.setAttribute(key, val);
    
                } else if (_.String.startsWith(key, 'data-')) {
    
                  element.setAttribute(key, val);
    
                } else {
    
                  element[key] = val;
    
                }
    		});
		},

		getProperties: function (element, inPropertyKeys, inOptResult) {

			var props = inPropertyKeys;

			inOptResult = inOptResult || {};

			if (_.String.isString(props)) {

				props = [props];

			}

			_.Array.forEach(props, function (propName, i) {

                if (propName == 'style') {
    
				  inOptResult[propName] = element.style.cssText;
    
                } else if (propName == 'class') {
    
				  inOptResult[propName] = element.className;
    
                } else if (propName == 'for') {
    
				  inOptResult[propName] = element.htmlFor;
					
                } else if (propName in directElementAttrs) {
    
                  inOptResult[propName] = element[directElementAttrs[propName]];
    
                } else if (_.String.startsWith(propName, 'aria-')) {

				  inOptResult[propName] = element.getAttribute(propName);
    
                } else if (_.String.startsWith(propName, 'data-')) {

				  inOptResult[propName] = element.getAttribute(propName);
    
                } else {
    
				  inOptResult[propName] = element[propName];

                }
			});

		    return _.String.isString(inPropertyKeys) ? inOptResult[inPropertyKeys] : inOptResult;
		}
    
    });
    
    // compat for older version
    QQWB.documentReady = QQWB.dom.ready;
    
    QQWB.find = QQWB.dom.find;

} ());

// dom ready events
(function () {

	var _ = QQWB,

	    _b = _.bigtable,

	    try_trigger_doc_ready;

    try_trigger_doc_ready = function () {

	   var _ = QQWB,

	       _b = _.bigtable,

		   _l = _.log,

	       ready = _b.get("document", "ready"),

		   everythingReadyDoor = _b.get("boot", "everythingready"),

		   tokenReadyDoor = _b.get("boot", "tokenready"),

           tokenIsReady,

		   inited,

		   body,

		   el;

       if (ready) {
           return;
       }

	   body = document.getElementsByTagName("body")[0];

	   if (!body) {

		   return;

	   }

       try {

           el = body.appendChild(document.createElement("span"));

           el.parentNode.removeChild(el);

       } catch (ex) { // document isn't ready

           return;

       }

	   _b.put("document", "ready", true);

       _l.info ("document is ready");

	   if (everythingReadyDoor) {

           everythingReadyDoor.unlock("document is ready");

	   }

	   tokenIsReady = tokenReadyDoor && tokenReadyDoor.isOpen();

	   inited = _b.get("base","inited");

       // dom is ready but token not ready and not inited
	   // prompt to init
	   if (!tokenIsReady && !inited ) { 

		   _l.info("waiting init signal ...");

	   }

       _.trigger(_b.get("nativeevent","documentready"));

   };

   _b.put("document", "tryready", try_trigger_doc_ready);



    if (window.addEventListener) {

        document.addEventListener("DOMContentLoaded", function () {

            try_trigger_doc_ready();

        }, false);

    }

    if (window.attachEvent) {

        document.attachEvent("onreadystatechange", function () {

            if (/complete/.test(document.readyState)) {

                document.detachEvent("onreadystatechange", arguments.callee);

                try_trigger_doc_ready();

            }

        });

        if (window === window.top) { // not inside a frame

            (function (){

				var _ = QQWB,

				    _b = _.bigtable,

				    doc_ready = _b.get("document","ready");

				if (doc_ready) {
					return;
				}

                try {

                    document.documentElement.doScroll("left");

                } catch (ex) {

                    setTimeout(arguments.callee, 0);

                    return;
                }

                try_trigger_doc_ready();

            }());
        }
    }

    if (_.browser.webkit) {

        (function () {

			var _ = QQWB,

			    _b = _.bigtable,

				doc_ready = _b.get("document","ready");

			if (doc_ready) {
				return;
			}

            if (!(/load|complete/.test(document.readyState))) {

                setTimeout(arguments.callee, 0);

                return;

            }

            try_trigger_doc_ready();

        }());
    }

}());
