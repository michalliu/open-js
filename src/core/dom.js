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
 *           common.String
 *           common.Array
 */

QQWB.extend("dom", {
    /**
     * Create an element
     * 
     * @access public
     * @param tagName {String} the element's tagName
     * @param optAttrs {Object} attrs on that element
     * @return {DOMElement} an element
     */
    create: function (tagName,optAttrs) {
        var element = document.createElement(tagName + "");
        if (optAttrs && element) {
            for (attr in optAttrs) {
                if (optAttrs.hasOwnProperty(attr)) {
					if(!QQWB.String.startsWith(attr,"data-")) {
                        element[attr] = optAttrs[attr];
					} else {
						element.setAttribute(attr,optAttrs[attr]);
					}
                }
            }
        }
        return element;
     }
    /**
     * Create and return a hiddened element
     *
     * @access public
     * @param optTagName {String} tagName
     * @param optAttrs {Object} element's attrs
	 * @param optFake {Boolean} use visibility:hidden insteadof display:none
     * @return {DOMElement} a hiddened element
     */
   ,createHidden: function (optTagName, optAttrs, optFake) {
        optTagName = optTagName || "div";
        var el = this.create(optTagName,optAttrs);
		if (optFake) {
            // we can't use the flash object in IE if flash container's style of visibility 
            // is hidden or display is none;
            // we can't use the flash object in chrome if flash container's style of display
            // is none, and visibility is hidden no problem
            // for convience we hidden the flash by giving it a large offset of top
			// el.style.visibility = "hidden";
            el.width = el.height = 0;
            el.style.width = el.style.height = 0;
            el.style.position = "absolute";
            el.style.top = "-9999px";
		} else {
            el.style.display = "none";
		}
        return el;
    }
    /**
     * Append child to parent
     *
     * Note:
     * if parent is not valid then append to dom body 
     *
     * @access public
     * @param child {DOMElement} childNode
     * @param parent {DOMElement} parentNode
	 * @return {Object} QQWB.dom
     */
   ,append: function (child, parent) {
       parent = parent || document.body;
       if (child && child.nodeType) {
           parent.appendChild(child);
       }
       return this;
    }
    /**
     * Set element's innerHTML
     *
     * @access public
	 * @param node {Node} node
	 * @param html {String} the html text for the node
	 * @return {Object} QQWB.dom
     */
   ,html: function (node, html) {
       node && node.nodeType && html && (node.innerHTML = html);
       return this;
   }
    /**
     * Append html to DOM and make it hidden
     *
     * @access public
     * @param html {DOMElement|String}
     * @param optAttrs {Object} element's attrs
	 * @param optFake {Boolean} use visibility:hidden insteadof display:none
	 * @return {Object} QQWB.dom
     */
   ,appendHidden: function (html, optAttrs ,optFake) {
       var hidden = this.createHidden(null, optAttrs, optFake);
       this.html(hidden, html);
       return this.append(hidden);
    }
	/**
	 * Remove node from DOM
	 *
     * @access public
	 * @param node {Node} the DOM node
	 * @return {Object} QQWB.dom
	 */
   ,remove: function (node) {
	   node && node.nodeType /* is node */ && node.parentNode /* parentNode exists */ && node.parentNode.removeChild(node)/* remove it */;
	   return this;
    }
	/**
	 * Determine whether node has the class name
	 *
     * @access public
	 * @param node {Node} the DOM node
	 * @param classname {Node} classname
	 * @return {Boolean}
	 */
   ,hasClass: function (node, classname) {
	   return (" " + node.className + " ").indexOf(" " + classname + " ") >= 0;
    }
	/**
	 * Add classname to node
	 *
     * @access public
	 * @param nodes {Node|Array} the DOM node(s)
	 * @param classname {Node} classname
	 * @return {Object} QQWB.dom
	 */
   ,addClass: function (nodes, classname) {
	   classname = QQWB.String.trim(classname);
	   if (QQWB.Array.isArray(nodes)) {
		   QQWB.Array.each(nodes, function (i, node) {
			   QQWB.dom.addClass(node, classname);
		   });
		   return this;
	   }
	   if (!QQWB.dom.hasClass(nodes,classname)) {
		  nodes.className = nodes.className + " " + classname;
	   }
	   return this;
    }

	/**
	 * remove classname of node
	 *
     * @access public
	 * @param nodes {Node|Array} the DOM node(s)
	 * @param classname {Node} classname
	 * @return {Object} QQWB.dom
	 */
   ,removeClass: function (nodes, classname) {
	   classname = QQWB.String.trim(classname);
	   if (QQWB.Array.isArray(nodes)) {
		   QQWB.Array.each(nodes, function (i, node) {
			   QQWB.dom.removeClass(node, classname);
		   });
		   return this;
	   }
	   if (QQWB.dom.hasClass(nodes, classname)) {
		   nodes.className = nodes.className.replace(classname, "");
		   QQWB.dom.removeClass(nodes, classname);
	   }
	   return this;
    }
});

