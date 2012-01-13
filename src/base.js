/**
 * Tencent weibo javascript library
 *
 * Provide the namespace with some core methods
 *
 * @author michalliu
 * @version 2.0
 * @module base
 */

// base file
(function () {

    var 
        twb, // the internal namespace object
        originalT = window.T; // get a reference of window's T

    // Core base object
    twb = {

        /**
         * Human readable name for this sdk
         *
         * Used for debug propose
         *
         * @access public
         */
        name: "Open-JS"

		/**
		 * SDK version
		 */
	   ,version: "2.0"

        /**
         * Debug mode
         *
         * Speak pointless babble
         *
         * @access public
         */
       ,debug: true

	   /**
		* Wether send pingback to our server, help us to improve this SDK
		*/
	   ,pingback: true

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
        * Alias names
        *
        * @access private
        * @param alias {String|Array} aliased name(s)
        * @param origin {Object} the object to alias
        * @return {Void}
        */
       ,_alias: function (alias, origin) {
           origin = origin || twb;
           if(typeof alias === 'string') {
			   if (!this[alias]) {
                   this[alias] = origin;
			   } else {
                   QQWB.debug && window.console && window.console.log(QQWB.name + ": [WARNING] refused to alias \"" + alias + "\",name conflict");
			   }
           } else if (Object.prototype.toString.call(alias) === "[object Array]") {
               for (var i=0,l=alias.length;i<l;i++) {
                   this[alias[i]] = origin;
               }
           }
       }

       /**
        * Alias names for twb
        *
        * @deprecated not recommended
        * @access public
		* @param alias {String|Array} aliased name(s)
		* @param origin {String} things under QQWB
        * @return {Void}
        */
       ,alias: function (alias, origin) {
           twb._alias(alias, twb.create(origin));
		   return twb;
       }

        /**
         * Generate a random id
         *
         * @access public
         * @return {String} The ramdom ID
         */
       ,uid: function (optLength) {
		   var rand = Math.random().toString(16).substr(2);
		   if (optLength) {
			   if (rand.length > optLength) {
				   rand = rand.substr(0,optLength);
			   } else if (rand.length < optLength) {
				   for (var i=0,l=optLength-rand.length;i<l;i++) {
					   rand += Math.random().toString(16).substr(2,1);
				   }
			   }
		   }
		   return rand;
       }


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
		* Platforms defination
		*/
	   ,platforms: {
		   WEIBO: 0
		  ,QZONE: 1
	    }
    };

	twb.extend("_const", {
		HTTP_PROTOCOL: "http://"
	   ,HTTPS_PROTOCOL: "https://"
	   ,API_HOST_WEIBO: "open.t.qq.com"
	   ,API_HOST_QZONE: "graph.qq.com"
	   ,AUTH_HOST_WEIBO: "open.t.qq.com"
	   ,AUTH_HOST_QZONE: "openapi.qzone.qq.com"
	});

	twb.extend("platforms.data." + twb.platforms.WEIBO, {
	  	 domain: {
			  api: twb._const.HTTP_PROTOCOL + twb._const.AUTH_HOST_WEIBO + "/api"
			 ,auth: twb._const.HTTP_PROTOCOL + twb._const.AUTH_HOST_WEIBO + "/oauth2_html/login.php"
			 ,iframeProxy: twb._const.HTTP_PROTOCOL + twb._const.AUTH_HOST_WEIBO + "/open-js/proxy.html"
			 ,flashProxy: twb._const.HTTP_PROTOCOL + twb._const.AUTH_HOST_WEIBO + "/open-js/proxy.swf"
			 ,exchangeToken: twb._const.HTTP_PROTOCOL + twb._const.AUTH_HOST_WEIBO + "/cgi-bin/exchange_token"
			 ,autoToken: twb._const.HTTP_PROTOCOL + twb._const.AUTH_HOST_WEIBO + "/cgi-bin/auto_token"
	  	 }
		,authWindow: {
			name: "openjsAuthWindow" + twb.platforms.WEIBO + twb.uid()
		   ,dimension: {
				pc: {
		            width: 575
		           ,height: 465
				}
			   ,mobile: {
				   width: 0
				  ,height: 0
				}
			}
		   ,popup: true
		   ,autoclose: true
		 }
		,cookie: {
			names: {
				accessToken: "QQWBAccessToken"/* + twb.platforms.WEIBO */
			   ,refreshToken: "QQWBRefreshToken"/* + twb.platforms.WEIBO */
			}
		   ,path: "/"
		   ,domain: ""
		 }
	});
	twb.extend("platforms.data." + twb.platforms.QZONE, {
	  	 domain: {
			  api: twb._const.HTTPS_PROTOCOL + twb._const.API_HOST_QZONE + "/"
			 ,auth: twb._const.HTTP_PROTOCOL + twb._const.AUTH_HOST_QZONE + "/oauth/show"
			 ,openid: twb._const.HTTPS_PROTOCOL + twb._const.API_HOST_QZONE + "/oauth2.0/me"
			 ,iframeProxy: twb._const.HTTPS_PROTOCOL + twb._const.API_HOST_QZONE + "/proxy/proxy.html"
			 ,flashProxy: twb._const.HTTPS_PROTOCOL + twb._const.API_HOST_QZONE + "/proxy/proxy_v15.swf"
	  	 }
		,authWindow: {
			name: "openjsAuthWindow" + twb.platforms.QZONE + twb.uid()
		   ,dimension: {
				pc: {
		            width: 569
		           ,height: 468
				}
			   ,mobile: {
				   width: 0
				  ,height: 0
				}
			}
		   ,popup: true
		   ,autoclose: true
		 }
		,cookie: {
			names: {
				accessToken: "QQWBAccessToken" + twb.platforms.QZONE
			   ,openId: "QQWBOpenId" + twb.platforms.QZONE
			   ,clientId: "QQWBClientId" + twb.platforms.QZONE
			}
		   ,path: "/"
		   ,domain: ""
		 }
	});
	/**
	 * getPlatform data if platform not passed
	 * return current platform's data
	 */
	twb.create('getPlatform', function (platform) {
		platform = platform == null ? QQWB.platform : platform;
		return QQWB.platforms.data[platform];
	});
	/**
	 * getPlatform appkey if platform not passed
	 * return current platform's appkey
	 */
	twb.create("getAppkey", function (platform) {
		return QQWB.getPlatform(platform).client.appkey || 0;
	});
    // alternative names for interal function
    twb.alias('provide','create'); // provide a specific function
    // expose variable
    twb._alias.call(window,["QQWB","T"],twb);
}());
