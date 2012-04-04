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

       ,debug: false

        /**
         * Rollback window's T to its original value
         *
         * @access public
         * @return {Object} The internal twb object
         */
       ,noConflict: function () {
           window.T = originalT;
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

    	var i,l, s, sr, r, h, q, u, k, v, o, envk, envv, envc, // iter, length, script, scriptSrc, remainStr, hash, query, undefined, key, value, one, envkey, envval, envconfig
    
		    ie = !-[1,],

			tpBol = 'boolean',

			tpNum = 'number',

			tpStr = 'string',

			ropenjs = /openjs\.js(.*)$/,

			ropenjsproxy = /openjs\.proxy\.js(.*)$/,

			matched,

			env = {},

			knownEnvs = {
				'autoboot': {'type':tpBol, 'default':true},
				'loglevel': {'type':tpNum, 'default':0},
				'cookiedomain': {'type':tpStr, 'default':''},
				'cookiepath': {'type':tpStr, 'default':'/'},
				'crossdomainmethod': {'type':tpStr, 'default':'auto'},
				'debug': {'type':tpBol, 'default':false}
			},

			str2Bool,

			str2Num,

			strTrim,

    	    scripts = document.getElementsByTagName('script');
    
		str2Bool = function str2Bool(str) {
			str = strTrim(str).toLowerCase();
			switch(str){
				//case 'yes':
				//case 'on':
				//case 'true':
				//return true;
				case 'no':
				case 'off':
				case 'false':
				return false;
			}
			return !!str;
		};

		str2Num = function str2Num (str,n) {

			return parseInt(strTrim(str),n) || 0;

		};

		strTrim = String.prototype.trim ? function (str) {

			return str == null ? "" : String.prototype.trim.call(str);

		} : function (str) {

			return str == null ? "" : str.toString().replace(/^\s+/,"").replace(/\s+$/,"");

		};

    	for (i=0, l=scripts.length; i<l && (s=scripts[i]); i++) {
    
			sr = ie ? s.getAttribute('src',4) : s.src;

			if (sr) {

				matched = sr.match(ropenjs) || sr.match(ropenjsproxy);

				if (matched) {

					r = matched[1];

					// @see firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=483304
					// SRC attribute is safe to read of script tag in firefox by real browser test
			    	h = r.split('#').pop();

			    	q = r.indexOf('?') == 0 ? r.slice(1, r.indexOf('#') == -1 ? u : r.indexOf('#')) : '';

    		    	break;

				}

			}

    	}

		if (h) {

			h = h.split('&');

			for (i=0,l=h.length; i<l && (o=h[i]); i++) {

				o = o.split('=');

				envk = o[0].toLowerCase();
				envv = o.length > 1 ? o[1] : u;

				if (knownEnvs.hasOwnProperty(envk)) {

					envc = knownEnvs[envk];

					switch (envc.type) {
						case tpBol:
						envv = str2Bool(envv);
						break;
						case tpNum:
						envv = str2Num(envv,10);
						break;
						case tpStr:
						default:
						envv = strTrim(envv);
					}

					env[envk] = envv;
				}

			}

		}

		// fill unsetted envs
		for (var k in knownEnvs) {
			if (knownEnvs.hasOwnProperty(k) && !env.hasOwnProperty(k)) {
				env[k] = knownEnvs[k]['default'];
			}
		}

		// fill with envs
	    twb.extend('envs',env);

	}());

	twb.debug = twb.envs.debug;

	twb.provide = twb.create;
    
	window.QQWB = window.T = twb;

}());
