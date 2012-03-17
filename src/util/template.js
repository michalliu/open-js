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
 *           common.Object
 *           common.Array
 */
(function () {

	var _ = QQWB,

	    _o = _.Object,

		_a = _.Array,

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
		 * Reset template
		 *
		 */
		reset: function (resetTpl, resetData) {

			if (!resetTpl && !resetData) {

                this.tmpl = [];

                this.datas = {};

			} else {

                resetTpl && (this.tmpl = []);

		    	resetData && (this.datas = {});

			}

			return this;

		},

		/**
		 * Add template data
		 *
		 * Example:
		 *
		 * data({a:2,b:3})
		 *
		 * data([a,2,b,3])
		 *
		 * data(a,2).data(b,3)
		 *
		 * has same effect
		 *
		 * @param inData {Object} template data
		 * @param inOverwrite {Boolean} whether override the existing data
		 * @return {Object} template instance
		 */
		data: function (inData,inOverwrite) {

			var dk,

		    	dv,

		    	arg = arguments;

			if ( _o.isObject(inData)) {

			    _.extend(this.datas, inData, inOverwrite);

			} else if (_a.isArray(inData)) {

				for (var i=0,l=inData.length; i < l; i+=2) {

					dk = inData[i];

					if ((i + 1) < l) {

					    dv = inData[i+1];

					}

					if (inOverwrite || !(dv in this.datas)) {

						this.datas[dk] = dv;

					}

				}

			} else {

				dk = arg[0];

				dv = arg[1];

				inOverwrite = arg[2];

				if (dk && (inOverwrite || !(dv in this.datas))) {

						this.datas[dk] = dv;
				}

			}

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

			    _.extend(this.datas, inData, inOverwrite);

			}

			return _.template.renderTemplate(this.tmpl.join(""), inData);
		},

		/**
		 * Render template
		 *
		 * @return {String} result
		 */
		render: function () {

			return this.renderWith(this.datas);

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

        var o =  _o.create(proto);

		o.tmpl = [];

		o.datas = {};

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
