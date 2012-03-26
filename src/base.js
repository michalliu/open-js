/**
 * Tencent weibo javascript library
 *
 * Provide the namespace with some core methods
 *
 * @author michalliu
 * @version 1.0
 * @module base
 */

(function () {

    var 
        twb, // the internal namespace object
        originalT = window.T; // get a reference of window's T

    // Core base object
    twb = {

        name: "OpenJS"

	   ,version: "2.0"

	   ,abspath: "http://open.t.qq.com/openjs/path/to/openjs.js"

       ,debug: false

        /**
         * Rollback window's T to its original value
         *
         * @access public
         * @return {Object} The internal twb object
         */
       ,noConflict: function () {
           originalT && (window.T = originalT);
           return twb;
       }

        /**
         * Copy things from source into target
         *
         * @access public
         * @return {Object} The *modified* target object
         */
       ,copy: function (target, source, overwrite, transform) {
           for (var key in source) {
               if (overwrite || typeof target[key] === "undefined") {
                   target[key] = transform ? transform(source[key]) : source[key];
               }
           }
           return target;
       }

        /**
         * Create sub namespace
         *
         * @access public
         * @return {Object} The created object 
         */
       ,create: function (name, value) {
           var 
               node = this, // this is our root namespace
               nameParts = name ? name.split(".") : [],
               c = nameParts.length;
           for (var i=0; i<c; i++) {
               var
                   part = nameParts[i],
                   nso = node[part];
               if (!nso) {
                   nso = (value && i + 1 === c) ? value : {};
                   node[part] = nso;
               }
               node = nso;
           }
           return node;
       }

        /**
         * Extends root namespace and create sub namespace if needs
         *
         * @access public
         * @return {Object} The *modified* target
         */
       ,extend: function (target, source, overwrite) {
           return twb.copy(
               typeof target === 'string' ? twb.create.call(this, target) : target
              ,source
              ,overwrite
           );
       }

        /**
         * Generate a random id
         *
         * @access public
		 * @param inOptLength {Number} optional uid length
         * @return {String} The ramdom ID
         */
       ,uid: function (inOptLength) {
		   var rand;
		   inOptLength = inOptLength || 6;
           rand = Math.random().toString(16).substr(2);
           if (rand.length > inOptLength) {
               rand = rand.substr(0,inOptLength);
           } else if (rand.length < inOptLength) {
               for (var i=0,l=inOptLength-rand.length;i<l;i++) {
            	   rand += Math.random().toString(16).substr(2,1);
               }
           }
		   return rand;
       }

    };

	(function detectEnvs () {

    	var i,l, s, sr, r, h, q, u, k, v, o // iter, length, script, scriptSrc, remainStr, hash, query, undefined, key, value, one
    
		    ie = !-[1,],

			env = {},

    	    scripts = document.getElementsByTagName('script');
    
    	for (i=0, l=scripts.length; i<l && (s=scripts[i]); i++) {
    
			sr = ie ? s.getAttribute('src',4) : s.src;

    		if (sr && sr.indexOf(twb.abspath) == 0) {
    
    			r = sr.slice(twb.abspath.length);

				h = r.split('#').pop();

				q = r.indexOf('?') == 0 ? r.slice(1, r.indexOf('#') == -1 ? u : r.indexOf('#')) : '';

    			break;
    
    		}
    
    	}

		if (h) {

			h = h.split('&');

			for (i=0,l=h.length; i<l && (o=h[i]); i++) {

				o = o.split('=');

				env[o[0]] = o.length > 1 ? o[1] : u;
			}

		}

	    twb.extend('envs',env);

	}());

	if (typeof twb.envs.debug != 'undefined') {

		twb.debug = !!twb.envs.debug;

	}

	twb.provide = twb.create;
    
	window.QQWB = window.T = twb;

}());
