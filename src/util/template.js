/**
 * Tencent weibo javascript library
 *
 * tiny template engine
 *
 * @see http://ejohn.org/blog/javascript-micro-templating/
 * @author michalliu
 * @version 1.0
 * @package util
 * @module template
 * @requires base
 */
(function () {

	var _ = QQWB,

	    cache = {},

	    proto;

	// instance method
	proto = {

		/**
		 * Add template string
		 *
		 * @param inStr {String} template str
		 * @return {Object} template instance
		 */
        add: function (inStr) {

			this.tmpl.push(inStr);

			return this;
		},

		/**
		 * Add template data
		 *
		 * @param inData {Object} template data
		 * @param inOverwrite {Boolean} whether override the existing data
		 * @return {Object} template instance
		 */
		data: function (inData,inOverwrite) {

			_.extend(this.data, inData, inOverwrite);

			return this;

		},

		/**
		 * Render template with data
		 *
		 * @param inData {Object} template data
		 * @param inOverwrite {Boolean} whether override the existing data aslo indicate use previous data or not
		 * @return {String} result
		 */
		renderWith: function (inData, inOverwrite) {

			if (inOverwrite) {

			    _.extend(this.data, inData, inOverwrite);

			}

			return _.template.renderTemplate(this.tmpl.join(""), inData);
		},

		/**
		 * Render template
		 *
		 * @return {String} result
		 */
		render: function () {

			return this.renderWith(this.data);

		},

		toString: function () {

			try {

				return this.render();

			} catch(ex) {

			    return "";

			}

		}
	}

	// create a template instance
    _.provide("template", function (name) {

        var o =  _.Object.create(proto);

		o.tmpl = [];

		o.data = {};

        /*
		o.toString = function () {

			return ["[openjs template]" , name ? name : "anonymous"].join(" ");

		}*/

    	return o;

    });
    
    _.extend("template", {
		// static method
    	renderTemplate: function (inStr, inData) {
            function tmpl(str, data){
                // Figure out if we're getting a template, or if we need to
                // load the template - and be sure to cache the result.
                var fn = !/\W/.test(str) ?
                  cache[str] = cache[str] ||
                    tmpl(document.getElementById(str).innerHTML) :
                  
                  // Generate a reusable function that will serve as a template
                  // generator (and which will be cached).
                  new Function("obj",
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +
                    
                    // Introduce the data as local variables using with(){}
                    "with(obj){p.push('" +
                    
                    // Convert the template into pure JavaScript
                    str
                      .replace(/[\r\t\n]/g, " ")
                      .split("<%").join("\t")
                      .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                      .replace(/\t=(.*?)%>/g, "',$1,'")
                      .split("\t").join("');")
                      .split("%>").join("p.push('")
                      .split("\r").join("\\'")
                  + "');}return p.join('');");
                
                // Provide some basic currying to the user
                return data ? fn( data ) : fn;
              };
    
    		return tmpl (inStr, inData);
    	}
    });
    
}());
