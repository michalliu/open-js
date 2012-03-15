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

        /**
         * Human readable name for this sdk
         *
         * Used for debug propose
         *
         * @access public
         */
        name: "OpenJS"

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

	twb.provide = twb.create;
    
	// allow cutomize configration before everything
	if (window["QQWBENVS"] && typeof QQWBENVS.Debug != "undefined") {

		twb.debug = QQWBENVS.Debug;

	}

	window.QQWB = window.T = twb;

}());
/**
 * Tencent weibo javascript library
 *
 * Log messages
 *
 * Example:
 * 
 * T.log.info("your message")
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module log
 * @requires base
 */

QQWB.extend("log", {
	
	 // critical level
     CRITICAL: 50

	 // error level
    ,ERROR: 40

	 // warning level
    ,WARNING: 30

	 // infomation level
    ,INFO: 20

	 // debug level
    ,DEBUG: 10

	 // notset level, will log out all the messages
    ,NOTSET: 0

	// log level messages less than this level will be ingored
	// default level set to QQWB.log.NOTSET
    ,_level: 0 

	/**
	 * Set log message level
	 * 
	 * @access public
	 * @param level {Number} log level
	 * @return {Object} log object
	 */
    ,setLevel: function (level) {
        this._level = level;
        return this;
     }

	/**
	 * Log a debug message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,debug: function (message) {
        this.DEBUG >= this._level && this._out("DEBUG",message);
        return this;
     }

	/**
	 * Log a info message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,info: function (message) {
        this.INFO >= this._level && this._out("INFO",message);
        return this;
     }

	/**
	 * Log a warning message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,warning: function (message) {
        this.WARNING >= this._level && this._out("WARNING",message);
        return this;
     }

	/**
	 * Log a error message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,error: function (message) {
        this.ERROR >= this._level && this._out("ERROR",message);
        return this;
     }

	/**
	 * Log a critical message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,critical: function (message) {
        this.CRITICAL >= this._level && this._out("CRITICAL",message);
        return this;
     }

	/**
	 * Log out message
	 *
	 * @access private
	 * @param level {String} message level
	 *        message {String} message to log out
	 * @return {Void}
	 */
    ,_out: function (level,message) {

		var logbox;

		output = [
			window.name ? window.name : "",
            (window.opener || window.name === QQWB.bigtable.get("authwindow","name")) ? "#":"",// window.name can cross domain!!
			window != window.parent ? "*":"",
			QQWB.name,
			": ",
			"[" + level + "] ",
			QQWB.time.shortTime() + " ",
            message,
		].join("");

		logbox = QQWB.bigtable.get("log","latest");

		if (!logbox) {

			logbox = QQWB.bigtable.put("log", "latest",[]);

		}
        // black box
		if (logbox.length >= 100) {
			logbox.shift();
		}

		logbox.push(output);

        // no frame messages
        QQWB.debug && window.console && window.console.log(output);
     }
	 /**
	  * Get latest log, this ignores debug setting, max 100 logs
	  *
	  * @access public
	  */
	,latest: function () {

		var latestlogs = QQWB.bigtable.get("log","latest");
		
		return latestlogs ? latestlogs.join("\n") : "";

	 }
});

QQWB.log.warn = QQWB.log.warning;

// allow cutomize configration before everything
if (window["QQWBENVS"] && typeof QQWBENVS.LogLevel == "number") {

	QQWB.log.setLevel(QQWBENVS.LogLevel);

}
/**
 * Tencent weibo javascript library
 *
 * Time
 *
 * Example:
 * 
 * T.time.getTime()
 *
 * @author michalliu
 * @version 1.0
 * @package util
 * @module time
 * @requires base
 */

QQWB.extend("time", {
    /**
     * Get current time stamp in milliseconds
     *
     * @access public
     * @return {Date} current date
     */
    now: function () {

        return this.dateNow().getTime();

    }

    /**
     * Get current time stamp in seconds
     *
     * @access public
     * @return {Date} current date
     */
   ,secondsNow: function () {

        return Math.round(this.now() / 1000);

    }

    /**
     * Get current time stamp
     *
     * @access public
     * @return {Date} current date
     */
   ,dateNow: function () {

        return new Date();

    }

    /**
     * Get a short time description
	 *
     * @access public
     * @param date {Date} date or current date if date not provided
     * @param format {String} format of date object        
     * @return {String} formatted time string
     */
   ,shortTime: function (date, format) {

	    var tmp;

        if (!(date instanceof Date)) {

            format = date;

            date = this.dateNow();

        }

		return [

			date.getFullYear(),

			'/',

			date.getMonth(),

			'/',

			date.getDate(),

			' ',

			((tmp = date.getHours() ) && tmp < 10 ) ? "0" + tmp : tmp,

			':',

			((tmp = date.getMinutes() ) && tmp < 10 ) ? "0" + tmp : tmp,

			':',

			((tmp = date.getSeconds() ) && tmp < 10 ) ? "0" + tmp : tmp

		].join("");

    }

});

/**
 * Tencent weibo javascript library
 *
 * String extension
 *
 * TODO: encoding libraries
 *
 * http://www.cnblogs.com/cgli/archive/2011/05/17/2048869.html
 * http://www.blueidea.com/tech/web/2006/3622.asp
 *
 * @author michalliu
 * @version 1.0
 * @package common
 * @module String
 * @requires base
 */
QQWB.extend("String",{
    _trimLeft: /^\s+/
   ,_trimRight: /\s+$/
    /**
     * Determine whether an object is string
     *
     * @access public
     * @param source {Mixed} anything
     * @return {Boolean}
     */
   ,isString: function (source) {
        return typeof source === "string";
    }

    /**
     * Strip left blank
     *
     * @access public
     * @param source {Mixed} anything
     * @return {String}
     */
   ,ltrim: function (source) {
       return source == null ? "" : source.toString().replace(this._trimLeft,"");
    }

    /**
     * Strip right blank
     *
     * @access public
     * @param source {Mixed} anything
     * @return {String}
     */
   ,rtrim: function (source) {
       return source == null ? "" : source.toString().replace(this._trimRight,"");
    }

    /**
     * Strip blank at left and right
     *
     * @access public
     * @param source {Mixed} anything
     * @return {String}
     */
    ,trim: String.prototype.trim ? function (source) {
            return source == null ? "" : String.prototype.trim.call(source);
        } : function (source) {
            return source == null ? "" : source.toString().replace(this._trimLeft,"").replace(this._trimRight,"");
        } 

	/**
	 * Determine whether needle at the front of str
	 *
	 * @access public
	 * @param source {Mixed} anything
	 * @return {Boolean}
	 */
	,startsWith: String.prototype.startsWith ? function (source, needle) {
			return source == null ? false : String.prototype.startsWith.call(source, needle);
		} : function (source, needle) {
			return source == null ? false : source.toString().indexOf(needle) == 0;
		} 

	/**
	 * Determine whether needle at the end of str
	 *
	 * @access public
	 * @param source {Mixed} anything
	 * @return {Boolean}
	 */
	,endsWith: String.prototype.endsWith ? function (source, needle) {
			return source == null ? false : String.prototype.endsWith.call(source, needle);
		} : function (source, needle) {
			return source == null ? false : source.toString().lastIndexOf(needle) >= 0 && source.toString().lastIndexOf(needle) + needle.length == source.length;
		} 
});
/**
 * Tencent weibo javascript library
 *
 * Hashtable extension
 *
 * @author michalliu
 * @version 1.0
 * @package util
 * @module bigtable
 * @requires base
 *           common.String
 */
(function () {

	// fast private key-val map
	var bigtable = {};

	function bigtable_make_key (inName, inKey) {
    	var _ = QQWB,
    	    _s = _.String;
    
    	 if (!_s.isString(inName)) {
    	 	_.log.warn("bigtable inName is not a str");
    	 }
    
    	 if (!_s.isString(inKey)) {
    	 	_.log.warn("bigtable inKey is not a str");
    	 }
    
    	 return ["bt", inName, inKey].join("_");
	}

    QQWB.extend("bigtable",{
		/**
		 * Put value to big hashtable
		 *
		 * @param inName {Stirng} bussiness name
		 * @param inKey {Stirng} key name
		 * @param inVal {Stirng} value
		 * @return Boolean indicate put value success or not
		 * @access public
		 */
       put: function (inName, inKey, inVal) {

		    var k = bigtable_make_key(inName, inKey);

		    bigtable[k] = inVal;

			return bigtable[k];
    	}

		/**
		 * retrieve value from big hashtable
		 *
		 * @param inName {Stirng} bussiness name
		 * @param inKey {Stirng} key name
		 * @param optDefaultVal {Mixed} if set, will set to bigtable when the key not exist, and returned
		 * @return {Mixed} stored value
		 * @access public
		 */
	   ,get: function (inName, inKey, optDefaultVal) {

		   var k = bigtable_make_key(inName, inKey),

		       v = bigtable[k],

		       undef;

		   if (optDefaultVal != undef && v == undef) {

			   v = optDefaultVal;

		       bigtable[k] = v;
		   }

		   return v;

	    }

	   ,del: function (inName, inKey) {

		   var k = bigtable_make_key(inName, inKey);

		   try {

			   delete bigtable[k];

		   } catch (ex) {

			   bigtable[k] = null;

		   }
	    }

	   ,has: function (inName, inKey) {

		   var k = bigtable_make_key(inName, inKey);

		   return bigtable.hasOwnProperty(k);
	    }

	   ,_: function () {
		   return bigtable;
		}
    });

	QQWB.bigtable.set = QQWB.bigtable.put;
})();
/**
 * Tencent weibo javascript library
 *
 * Function extension
 *
 * @author michalliu
 * @version 1.0
 * @package common
 * @module Function
 * @requires base
 */
QQWB.extend("Function",{
    /**
     * Determine whether an object is Function
     *
     * @access public
     * @param arg {Mixed} anything
     * @return {Boolean}
     */
    isFunction: function (arg) {
        return typeof arg === "function";
    }
});
/**
 * Tencent weibo javascript library
 *
 * Array extension
 *
 * @author michalliu
 * @version 1.0
 * @package common
 * @module Array
 * @requires base
 *           String
 */
QQWB.extend("Array",{
    /**
     * Get whether an object is array
     *
     * @access public
     * @param arg {Mixed} anything
     * @return {Boolean}
     */
    isArray: function (arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
    }
    /**
     * Get whether an object in the array
     *
     * @access public
     * @param arr {Array} the array object
     *        arg {Mixed} anything
     * @return {Boolean}
     */
   ,inArray: function (arr, arg) {
       for (var i=0,l=arr.length; i<l; i++) {
           if (arg === arr[i]) {
               return true;
           }
       }
       return false;
    }
    /**
     * Build array from String
     *
     * @access public
     * @param source {String} the source string
     * @param optSep {Regexp|String} the seprator passed into String.split method
     * @param optMax {Number} the maxCount of the newly builded array
     * @return {Array}
     */
   ,fromString: function (source, optSep, optMax) {
       if (!QQWB.String.isString(source)) {
           return [];
       } 
       optSep = optSep || "";
       return optMax ? source.split(optSep, optMax) : source.split(optSep);
    }
    /**
     * Build array from an array-like object
     *
     * @access public
     * @param source {Object} the source object
     * @param optMax {Number} the maxCount of the newly builded array
     * @return {Array}
     */
   ,fromArguments: function (source, optMax) {
       if (typeof source !== "object") {
           return [];
       } 
       return optMax ? Array.prototype.slice.call(source, optMax) : Array.prototype.slice.call(source);
    }
    /**
     * Argument object to array
     * 
     * @deprecated use fromString,fromArguments instead
     * @access public
     * @param arg {Mixed} source
     * @return {Array}
     */
   ,toArray: function (arg) {
       if (typeof arg == "string") {
           return arg.split("");
       } else if (typeof arg == "object") {
           return Array.prototype.slice.call(arg,0);
       } else {
           return this.toArray(arg.toString());
       }
    }
    /**
     * Enumerate the array
     *
     * Note:
     * If handler executed and returned false,
     * The enumeration will stop immediately
     *
     * @access public
     * @param arr {Array} the array object
     *        handler {Function} the callback function
     */
   ,each: function (arr, handler) {
       for (var i=0,l=arr.length; i<l; i++) {
           if (false === handler(i,arr[i])) {
               break;
           }
       }
    }
    /**
     * Invokes _inFunc_ on each element of _inArray_.
     * Returns an array (map) of the return values from each invocation of _inFunc_.
     * If _inContext_ is specified, _inFunc_ is called with _inContext_ as _this_.
     * 
	 */
   ,forEach: function(inArray, inFunc, inContext) {
   		var result = [];
   		if (inArray) {
   			var context = inContext || this;
   			for (var i=0, l=inArray.length, v; i<l; i++) {
   				v = inFunc.call(context, inArray[i], i, inArray);
   				if (v !== undefined) {
   					result.push(v);
   				}
   			}
   		}
   		return result;
   	}
	/**
	 * Get element from array
	 *
	 * Examples:
	 *
	 * get([1,2],-1)
	 *
	 * output
	 *
	 * 2
	 *
	 * @access public
	 * @param arr {Array} the array object
	 * @param index {Number} the index at array
	 */
   ,get: function (arr, index) {
	   var l = arr.length;
	   if (Math.abs(index) < l) {
		   return index >= 0 ? arr[index] : arr[l+index]; 
	   }
    }
});
/**
 * Tencent weibo javascript library
 *
 * Deferred object
 *
 * Note:
 *
 * Code is ported from jquery
 * A good explaination at 
 * http://stackoverflow.com/questions/4866721/what-are-deferred-objects/4867928#comment-8591160
 *
 * @author michalliu
 * @version 1.0
 * @package util
 * @module deferred
 * @requires base
 *           common.Array
 *           common.Function
 */

(function () {

	var defer;

	defer = function () {

		var callbacks = [], // callback list

			fired, // stored [ context, args], use to fire again

			firing, // to avoid firing when already doing so

			cancelled, // flag to know if the deferred has been cancelled

			deferred = { // the deferred itself

				done: function () {

					if (!cancelled) {

				        var args = arguments

						   ,elem

						   ,_fired;

						   // we should consider about fired status here
						   // this is neccesary to handle how done deals
						   // with arrays recursively
						   if (fired) {

							   _fired = fired;

							   fired = 0;
						   }

						   // add callbacks smartly
						   for (var i=0,l=args.length; i<l; i++) { 

							    elem = args[i];

							    if (QQWB.Array.isArray(elem)) {

								   deferred.done.apply(deferred, elem);

							   } else if (QQWB.Function.isFunction(elem)) {

								   callbacks.push(elem);

						    	}

						   }

						   // consider fired here
						   // if it's already been resolved then call resolveWith
						   // using the cached context and arguments to call the 
						   // callbacks immediatly
						   if (_fired) {

							   deferred.resolveWith(_fired[0], _fired[1]);

						   }

					}

					return this;

				}

				// resolve with given context and args
			   ,resolveWith: function (context, args) {
				   // if its been cancelled then we can't resolve
				   // if it has fired then we can't fire again
				   // if it's currently firing then we can't fire
				   if (!cancelled && !fired && !firing) {

					   args = args || [];

					   firing = 1;
					   // using try {} finally {} block because you are
					   // calling external callbacks, maybe these callbacks
					   // made by the user which are not bugfree.

					   // the finally block will always run no matter how bad
					   // the internal code is
					   try { 

					       while (callbacks[0]) {

							   callbacks.shift().apply(context, args);// first in first out

						   }

					   }

					   finally {

						   fired = [context, args]; // cache the the context and args

						   firing = 0;

					   }

				   }

				   return this;

			    }

				// Resolve with this as context and given arguments
			   ,resolve: function () {

				   deferred.resolveWith(this, arguments);

				   return this;

			    }

				// Has this deferred been resolved?
			   ,isResolved: function () {

				   return !!(firing || fired);

			    }
				// Cancel
			   ,cancel: function () {

				   cancelled = 1;

				   callbacks = [];

				   return this;

			    }

	    };

		return deferred;

	};


QQWB.extend("deferred", {

	/**
	 * Full fledged deferred (two callback list success and fail)
	 */
   deferred: function (func) {

	   var promise,

	       deferred = defer(),

	       failDeferred = defer();

	   // Add errorDeferred methods, then and promise
	   QQWB.extend(deferred, {

		   // send to failed deferred object
		   fail: failDeferred.done

		   // send to sucess callback and failcallbacks at a time
		  ,then: function (doneCallbacks, failCallbacks) {

			  deferred.done(doneCallbacks).fail(failCallbacks);

			  return this;

		   }

		   // send to success callback and to fail callback aslo
		  ,always: function () {

			  return deferred.done.apply(deferred, arguments).fail.apply(this, arguments);

		   }

		   // invoke callbacks in failed deferred with context and arguments
		  ,rejectWith: failDeferred.resolveWith

		   // invoke callbacks in failed deferred
		  ,reject: failDeferred.resolve

		   // is callbacks in failed deferred invoked
		  ,isRejected: failDeferred.isResolved

		  // promise to return a read-only copy(cant call resolve resolveWith
		  // reject and rejectWith) of deferred
		  ,promise: function (obj) {

			  var promiseMethods = "done fail isResolved isRejected promise then always success error complete whatever".split(" ");

			  if (obj == null) {

				  if (promise) {

				      return promise;

				  }

				  promise = obj = {};

			  }

			  var i = promiseMethods.length;

			  while (i--) {

				  obj[promiseMethods[i]] = deferred[promiseMethods[i]];

			  }

			  return obj;

		   }

	   });

	   // lovely alternative function names
	   deferred.success = deferred.done;

       deferred.error = deferred.fail;

       deferred.complete = deferred.whatever = deferred.always;

	   // funciton either success or fail
	   // if success fail deferer will cancel,vice versa
	   deferred.done(failDeferred.cancel).fail(deferred.cancel);

	   // unexpose cancel
	   delete deferred.cancel;

	   // a chance allow outer function to get a pointer to deferred object
	   func &&  func.call(deferred, deferred);

	   return deferred;

    }

	/**
	 * Deferred helper
	 */
   ,when: function (firstParam) {

	   var args = arguments,

		   length = args.length,

		   count = length,

		   deferred = length <= 1 && firstParam && QQWB.Function.isFunction(firstParam.promise) ?

		              firstParam :

					  QQWB.deferred.deferred(); // generate a deferred object or use the exists one

	    function resolveFunc (i) {

			return function (value) {

				args[i] = arguments.length > 1 ? QQWB.Array.fromArguments(arguments) : value;

				if (!(--count)) { // the last operation is resolved, resolve the when deffered

					deferred.resolveWith(deferred, QQWB.Array.fromArguments(args));

				}

			};

		}

		if (length > 1) { // more than one deferred object

		    for ( var i=0; i < length; i++) {

				if (args[i] && QQWB.Function.isFunction(args[i].promise)) { // arg is deferred object

				    // deferred.reject will called if any operation in when in rejected
				    args[i].promise().then(resolveFunc(i),deferred.reject);

				} else { // ingore arg that not a deferred object

					--count; // total arg -- 

				}

				if (!count) { // nothing is deferred

				    deferred.resolveWith (deferred, args);// let new deferred object handle it

				}

			}

		} else if ( deferred !== firstParam) {

			deferred.resolveWith(deferred, length ? [firstParam] : []);

		}

		return deferred.promise();

    }

});

QQWB.task = QQWB.when = QQWB.deferred.when;

} ());
/**
 * Tencent weibo javascript library
 *
 * basic init and the public init method
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module init
 * @requires base
 *           util.bigtable
 *           util.deferred
 */
(function () {
	var _ = QQWB,

	    _b = _.bigtable,

		baseurl = "http://open.t.qq.com";

    _b.put("uri","api",[baseurl,"/api"].join(""));
    _b.put("uri","auth",[baseurl,"/oauth2_html/login.php"].join(""));
    _b.put("uri","html5proxy",[baseurl,"/proxy/proxy.html"].join(""));
    _b.put("uri","flashas3proxy",[baseurl,"/proxy/proxy_as3_v2.swf"].join(""));
    _b.put("uri","exchangetoken",[baseurl,"/cgi-bin/exchange_token"].join(""));
    _b.put("uri","autotoken",[baseurl,"/cgi-bin/auto_token"].join(""));

    _b.put("authwindow","name","authClientProxy_ee5a0f93");
    _b.put("authwindow","width","575");
    _b.put("authwindow","height","465");

	if (window["QQWBENVS"] && typeof QQWBENVS.CookieDomain != "undefined") {

        _b.put("cookie","domain",QQWBENVS.CookieDomain);

	} else {

        _b.put("cookie","domain","");

	}

	if (window["QQWBENVS"] && typeof QQWBENVS.CookiePath != "undefined") {

        _b.put("cookie","path",QQWBENVS.CookiePath);

	} else {

        _b.put("cookie","path","/");

	}

    _b.put("cookie","accesstokenname","QQWBToken");
    _b.put("cookie","refreshtokenname","QQWBRefreshToken");

    _b.put("nativeevent","userloggedin","UserLoggedIn");
    _b.put("nativeevent","userloginfailed","UserLoginFailed");
    _b.put("nativeevent","userloggedout","UserLoggedOut");
    _b.put("nativeevent","tokenready","tokenReady");
    _b.put("nativeevent","documentready","documentReady");
    _b.put("nativeevent","everythingready","everythingReady");

    _b.put("solution","deferred",_.deferred.deferred());
    _b.put("solution","jscallbackname","onFlashReady_a1f5b4ce");

    _b.put("api","count",0);

    _b.put("ping","urlbase","http://btrace.qq.com/collect");
    _b.put("ping","paramorder",["ftime","sIp","iQQ","sBiz","sOp","iSta","iTy","iFlow"]);
    _b.put("ping","paramsep",";");

    _b.put("io","timeout", 30 * 1000);

    QQWB.provide("init", function (opts) {

		   var _ = QQWB,

		       _b = _.bigtable,

		       _p = _.ping,

			   _l = _.log,

			   base = "base",

			   tokenReady;

	       tokenReady = _b.get("boot", "tokenready");

           if (_b.get(base,"inited") === true) {

               _l.warning("already initialized");

               return;
           }

           _l.info("init signal has arrived");

		   opts = _.extend({

			   callbackurl: document.location.href.replace(location.search,"").replace(location.hash,"")

			  ,pingback: true // pingback level 

			  ,synclogin: true // auto login user. default yes

			  ,autoclose: true // auto close the authwindow

			  ,samewindow: false // open authenciate window in same window

		   },opts,true);

		   _b.put(base,"pingback",opts.pingback);

		   _b.put(base,"autoclose",opts.autoclose);

		   _b.put(base,"samewindow",opts.samewindow);

           var 
               accessToken = _._token.getAccessToken(),

               rawAccessToken = _._token.getAccessToken(true), 

               refreshToken = _._token.getRefreshToken(),

               needExchangeToken = refreshToken && !accessToken && rawAccessToken,

               needRequestNewToken = !refreshToken && !accessToken && opts.synclogin;

           if (opts.appkey) {

               _l.info("client id is " + opts.appkey);

			   _b.put("base", "appkey", opts.appkey);
           }

           _l.info("client proxy uri is " + opts.callbackurl);

           _b.put("uri","redirect",opts.callbackurl);

           if (/*true || force exchange token*/needExchangeToken) {

               tokenReady.lock();

               _l.info("exchanging refresh token to access token...");

               QQWB._token.exchangeForToken(function (response) {

                   // does it really neccessary?
                   if (opts.synclogin && response.error) {// exchangeToken encountered error, try to get a new access_token automaticly

                       QQWB.log.warning("exchange token has failed, trying to retrieve a new access_token...");

                       tokenReady.lock();// lock for async refresh token

                       QQWB._token.getNewAccessToken(function () {

                           tokenReady.unlock();// unlock for async refresh token

                       });

                   }

                   // don't put this segment to top
                   // because of the stupid door-locking mechanism
                   tokenReady.unlock();// unlock for async refresh token

               });

           } else if (needRequestNewToken) {

               tokenReady.lock();

               _l.info("retrieving new access token...");

               _._token.getNewAccessToken(function () {

                   tokenReady.unlock(); // unlock for async get token

               });

           }

           _b.put(base, "inited", true);

           tokenReady.unlock(); // unlock init

		   if (_p && opts.pingback) {

		       _p.pingInit();

			   if ((typeof opts.pingback == "number" && opts.pingback > 1) || typeof opts.pingback == "boolean") {

                   _.bind(_b.get("nativeevent","userloggedin"),_p.pingLoggedIn);

                   _.bind(_b.get("nativeevent","userloginfailed"),_p.pingLoggedInFailed);

			   }
		   }

           return _;
    });

}());

/**
 * Tencent weibo javascript library
 *
 * Input and output,AJAX,JSONP
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module io
 * @requires base
 *           core.init
 *           core.log
 *           util.bigtable
 *           util.time
 */
(function () {

	var _ = QQWB,

	    _b = _.bigtable,

		_l = _.log,

		_t = _.time,

	    iotimeout = _b.get("io", "timeout"),

		ioscript,

		ioajax,

		ioas3,
		
		ioas3tktcounter = 0,
		
		apiAjax,

		apiResponder,

		ajaxResponder;

	ioscript = function (cfg) {

        var script;

		return {

			send: function (complete) {

				var start = _t.now(),

                    head = document.head || document.getElementsByTagName("head")[0] || document.documentElement,

			        timer = setTimeout(function () {

			            _l.error("load script " + cfg.url + " timeout");

			            // @see ITEF Standard http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
			            complete(599, "timeout",  _t.now() - start);

						complete = null; // avoid execute again

			        }, iotimeout);

                script = document.createElement("script");

                script.async = "async";

                if (cfg.charset) {

                    script.charset = cfg.charset;

                }

                script.src = cfg.url;

                script.onload = script.onreadystatechange = function (e, isAbort) {

					// finished anyway
                    if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {

						// done timer
						var t;

				        clearTimeout(timer);

						// clean up things
                        script.onload = script.onreadystatechange = null;

                        if (head && script.parentNode) {

                            head.removeChild(script);

                        }

                        script = null;

						// has callback
						if (complete) {

							t = _t.now() - start;

							if (isAbort) {

                                complete(-1, "aborted", t);

							} else {

                                complete(200, "success", t);

							}

						    complete = null;

						}
                    }
                };

                // ie 678 and opera not support script onerror(not tested)
                script.onerror = function (e) { 

				    clearTimeout(timer);

                    complete && complete(404, e, _t.now() - start);

				    complete = null;
                };

                head.insertBefore(script, head.firstChild);

			},

			abort: function () {

               if (script) {

                   script.onload(0,1);

               }

			}
		};
	}; // ioscript

	ioajax = function (cfg) {

	    var xhrcallback;

		return {

			send: function (complete) {

				var start = _t.now(),

	                xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new window.ActiveXObject("Microsoft.XMLHTTP"),

				    timer = setTimeout(function () {

                         _l.error("ajax timeout, url " + cfg.url);

                         //@see ITEF Standard http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
                         complete(599,"timeout",  _t.now() - start);

						 complete = null;

                     }, iotimeout);
                
                if (!cfg.async) {

                    cfg.async = "async";

                }

                if (cfg.username) {

                    xhr.open(cfg.type, cfg.url, cfg.async, cfg.username, cfg.password);

                } else {

                    xhr.open(cfg.type, cfg.url, cfg.async);

                }
                
                try {

                    if (cfg.type.toUpperCase() == "POST") {

                        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

                    }

                    xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");

                    xhr.setRequestHeader("X-Requested-From","openjs" + _.version);

				} catch (ex) {

					_l.warning("set header error " + ex);

			   	}
                
                xhr.send(cfg.data || null);
                
				// xhr callback
                xhrcallback = function (x, isAbort) {

                    var status,

                 	    statusText,

                 	    responseHeaders,

                 	    responses,

                        response,

						xml;
                
                    try {

                        if (xhrcallback && (isAbort || xhr.readyState === 4)) {
                 		   
                 		   xhrcallback = null;
                
						   // abort ajax request
                 		   if (isAbort) {

							   // can abort
                 			   if (xhr.readyState !== 4) {

                                   clearTimeout(timer);

                 				   xhr.abort();

								   complete && complete(-1, "aborted", _t.now() - start);

								   complete = null;

							   } else {

								   _l.debug("abort ajax failed, already finish");

							   }

                 		    } else {

                                clearTimeout(timer);

                 				status = xhr.status;

                 				responseHeaders = xhr.getAllResponseHeaders() || "";

								// a collection
                 				responses = {};

                 				xml = xhr.responseXML;
                
                 				if (xml && xml.documentElement) {

                 				    responses.xml = xml;

                 				}
                
                 				responses.text = xhr.responseText;
                
                 				try {

                 				    statusText = xhr.statusText;

                 				} catch (webkitException) {

                 					statusText = "";

                 				}
                
                 				if (status === 1223) {

                 				    status = 204;

                 				}
                
                                 if (cfg.dataType.toLowerCase() == "json") { /// parse to json object

                 					response = _.JSON.fromString(responses.text);

                                 } else if (cfg.dataType.toLowerCase() == "xml") { // parse to xml object

                                     response = responses.xml;

                                 } else {

                                     response = responses.text;

                                 }
                
                 	    	}
                
                 		   //if (response) { // in case of server returns empty body sometimes
						   
                 	           complete(status, statusText, _t.now() - start, response, responses.text, responseHeaders, cfg.dataType);

							   complete = null;

                 		   //}
                 	   }

                    } catch (ex /*firefoxOrInvalidJSONFormatParserException*/) {

                       clearTimeout(timer);

                 	   _l.error("caught exception " + [ex.type, ex.message].join(" ") + " in ioajax");

                 	   complete(-2, "exception " + ex, _t.now() - start);

					   complete = null;

                    }

                };
                
				// register xhr handler
                if (!cfg.async || xhr.readyState === 4) {

                    xhrcallback();

                } else {

                    xhr.onreadystatechange = xhrcallback;

                }

			},

			abort: function () {

			  if (xhrcallback) {

			      xhrcallback(0, 1);

			  }

			}
		};

	}; // ioajax

	ioas3 = function (cfg) {

	    var callback;

		return {

		   send: function (complete) {

               var start = _t.now(),
			       
			       proxy = _b.get("solution", "flashmovie"),

				   ticket = "as3callbacktkt" + (++ioas3tktcounter),

                   timer = setTimeout(function () {

                         _l.error("flash as3 timeout, url " + cfg.url);

                         //@see ITEF Standard http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
                         complete(599,"timeout",  _t.now() - start);

						 complete = null;

                     }, iotimeout);

               // the call is allowed call once
               callback = function (_, isAbort) {

                   var status,

                	   statusText,

                	   responseHeaders,

                	   responses,

                       response,

                	   xml;
               
                    try{
                    
                        if (callback) {
                    
                            callback = null; // to avoid memory leak in IE
                    
                            clearTimeout(timer);

                            if (isAbort) {

                                complete && complete(-1, "aborted", _t.now() - start);
                                
                                complete = null;

                            } else {

                     		   status = this["httpStatus"];

                         	   statusText = this["httpStatus"] == 200 ? "ok" : "";

                         	   responseHeaders = ""; //as3 don't support that this should be filled at future

                         	   responses = {}; // internal object

                         	   responses.text = this["httpResponseText"];
                    
                         	   if (cfg.dataType.toLowerCase() == "json") { // parse to json object

                         		   response = QQWB.JSON.fromString(responses.text);

                                } else if (cfg.dataType.toLowerCase() == "xml"){ // parse to xml object

                         		   response = QQWB.XML.fromString(responses.text);

                                } else {

                         		   response = responses.text;
                                }
                            }
                    
                     	   //if (response) { // when server returns empty body sometimes, response will never called

                         	complete(status, statusText, _t.now() - start, response, responses.text, responseHeaders, cfg.dataType);

							complete = null;

                     	   //}
                        }

                     } catch (ex /*firefoxOrInvalidJSONFormatParserException*/) {

                        clearTimeout(timer);

                        _l.error("caught exception " + [ex.type, ex.message].join(" ") + " in ioas3");

                        complete(-2, "exception " + ex, _t.now() - start);

				        complete = null;

                     }

               }; // end callback
               
			   _b.put("io", ticket, callback);

               if (proxy && proxy.httpRequest) {
               
                   proxy.httpRequest(cfg.url, cfg.data, cfg.type, ticket);
               
               } else {
               
                   _l.critical("flash transportation object error");
               
               }

		   }

		  ,abort: function () {

			  if (callback) {

			      callback(0,1);

			  }
		   }
		};
	}; // ioas3

	
	window.onFlashRequestComplete_8df046 = function (eventData) {

		var cb,

		    srcEvt;

		if (!eventData.ticket) {

			_l.error("ticket doesn't exists in response");

			return;

		}

		cb = _b.get("io", eventData.ticket);

		srcEvt = eventData.srcEvent;

        if (!cb.readyState) {

            cb.readyState = 0;

        }
        
        if (/httpStatus/i.test(srcEvt.type)) { // this is a http status code response, cache it

            cb["httpStatus"] = srcEvt.status

            cb.readyState++;

        } else if (/error/i.test(srcEvt.type)) { // possible io_Error or security error

            cb["httpError"] = srcEvt.type

            cb.readyState++;

        } else if (/complete/i.test(srcEvt.type)) {

            cb["httpResponseText"] = srcEvt.target.data

            cb.readyState++;
        }
        
        if (cb.readyState == 2) {

            cb.call(cb);

            _b.del("io", eventData.ticket);
        }
        
	}; // onFlashRequestComplete_8df046

	apiResponder = function (deferred) {

	    return function (status ,statusText ,elapsedtime ,parsedResponse ,responseText ,responseHeaders ,dataType) {

	        var retcode,errorcode;

            if (status !== 200) { // http error

	            // error code over than 2000000 represent physicall error
	      	    status = 2000000 + Math.abs((status ? status : 0));

                deferred.reject(status, statusText, elapsedtime, "");

	        } else if ( typeof (retcode = QQWB.weibo.util.parseRetCode(responseText)) == "number" && 0 !== retcode ) { // api error

	            errorcode = QQWB.weibo.util.parseErrorCode(responseText); 

	            // error code over than 1000000 and less than 2000000 represent logic error
	      	    status = 1000000 + retcode * 1000 + 500 + (errorcode ? errorcode : 0);

	      	    deferred.reject(status,  QQWB.weibo.util.getErrorMessage(retcode,errorcode), elapsedtime, responseText);

            } else {

	      	    deferred.resolve(status, statusText, elapsedtime, parsedResponse, responseHeaders, dataType);

            }

	    };

    }; // apiResponder

	ajaxResponder = function (deferred) {

	    return function (status ,statusText ,elapsedtime ,parsedResponse ,responseText ,responseHeaders ,dataType) {

            if (status !== 200) {

                deferred.reject(status, statusText, elapsedtime, "");

            } else {

                deferred.resolve(parsedResponse, elapsedtime, responseText);

            }

	    };

   }; // ajaxResponder

QQWB.extend("io", {
   /**
	* Emulate AJAX request via flash
	*
	* @access public
	* @param opts {Object} url configuration object
	* @return {Object} promise object
	*/
  flashAjax: function (opts) {

       var deferred = QQWB.deferred.deferred(),

           default_opts = {

               type: "get"

              ,dataType: "json"

           };

       QQWB.extend(default_opts, opts, true);

       ioas3(default_opts).send(apiResponder(deferred));

	   return deferred.promise();
   }
	/**
	 * Ajax request sender
	 * 
	 * @access public
	 * @param opts {Object} ajax settings
	 * @return {Object} deferred object
	 */
   ,ajax: function (opts) {

       var deferred = QQWB.deferred.deferred(),

           default_opts = {

               type: "get"

              ,dataType: "json"

           };

        QQWB.extend(default_opts, opts, true);

        ioajax(default_opts).send(apiResponder(deferred));

		return deferred.promise();
    }

	/**
	 * Ajax request sender
	 *
	 * Note:
	 * 
	 * same as ajax, the only difference is when ajax success, 
	 * it only pass one response object as argument, this is the
	 * function to expose to our root namespace
	 * 
	 * @access public
	 * @param opts {Object} ajax settings
	 * @return {Object} deferred object
	 */
   ,ajax2: function (opts) {

       var deferred = QQWB.deferred.deferred(),

           default_opts = {

               type: "get"

              ,dataType: "json"

           };

        QQWB.extend(default_opts, opts, true);

        ioajax(default_opts).send(ajaxResponder(deferred));

		return deferred.promise();
    }

    /**
     * Dynamiclly load script
     *
     * @access public
     * @param src {String} script src
     * @param optCharset {String} script charset
     * @return {Object} promise
     */
   ,script: function (src, optCharset) {

       var optCharset = optCharset || "utf-8",

           deferred = QQWB.deferred.deferred();

       ioscript({

           charset: optCharset

          ,url: src

       }).send(function (status, statusText, elapsedtime) {

           if (status !== 200) {

               deferred.reject(status, statusText, elapsedtime);

           } else {

               deferred.resolve(status, statusText, elapsedtime);

           }

       });

       return deferred.promise();
    }
    /**
     * JSONP request
     *
     * @access public
     * @param opts {Object} jsonp config
     * @return {Object} promise
     */
    ,jsonp: function (opts) {

        var deferred = QQWB.deferred.deferred(),

            callbackName = "jsonp_" + QQWB.uid(5),

            _oldcallback = window.callbackName,

			timeCost,

            default_opts = {

                dataType: "text"

               ,charset: "utf-8"

               ,url: ""

            };

        QQWB.extend(default_opts, opts, true);

        if (default_opts.data) {

            default_opts.url += ("?" + default_opts.data +  "&callback=" + callbackName);

        } 

        window[callbackName] = function (data) {

            var response = data;

			try {

                if (default_opts.dataType.toLowerCase() === "json") {

                    response = QQWB.JSON.fromString(data);

                } else if (default_opts.dataType.toLowerCase() === "xml") {

                    response = QQWB.XML.fromString(data);

                }

			} catch (ex) {

                _l.error("caught exception " + [ex.type, ex.message].join(" ") + " in ioajax");

                deferred.reject(-2, "exception " + ex, timeCost);

			}

            deferred.resolve(response, timeCost);

            window[callbackName] = _oldcallback; 
            
        };

        ioscript(default_opts).send(function (status, statusText, elapsedtime) {

            if (status !== 200) {

                deferred.reject(status, statusText, elapsedtime);

            }

			timeCost = elapsedtime;

        });

       return deferred.promise();

    }
});

QQWB.ajax = QQWB.io.ajax2;

QQWB.jsonp = QQWB.io.jsonp;

QQWB.script = QQWB.io.script;

}());

/**
 * Tencent weibo javascript library
 *
 * API descriptor
 *
 *
 * @author michalliu
 * @version 1.0
 * @package weibo
 * @module util
 * @requires base
 *           common.String
 */

(function () {

var retError =  {
        "1": "参数错误",
        "2": "频率受限",
        "3": "鉴权失败",
        "4": "内部错误"
    },

    errorCode = {
        "4": "过多脏话",
        "5": "禁止访问",
        "6": "记录不存在",
        "8": "内容过长",
        "9": "内容包含垃圾信息",
        "10": "发表太快，频率限制",
        "11": "源消息不存在",
        "12": "未知错误",
        "13": "重复发表"
    };

QQWB.extend("weibo.util", {
    /**
     * Parse ret code from server response
     *
     * @param text {String} server response contains retcode
     * @return retcode {Number} ret code
     */
    parseRetCode: function(text) {
        var match = text.match(/\"ret\":(\d+)\}/) || text.match(/<ret>(\d+)<\/ret>/);
        return match ? parseInt(match[1], 10) : match;
    }
    /**
     * Parse error code from server response
     *
     * @param text {String} server response contains retcode
     * @return errorcode {Number} ret code
     */
    ,parseErrorCode: function(text) {
        var match = text.match(/\"errcode\":(-?\d+)/) || text.match(/<errcode>(\d+)<\/errcode>/);
        return match ? parseInt(match[1], 10) : match;
    }
    /**
     * Convert retcode and error code to human reading messages
     */
    ,getErrorMessage: function(optRetcode, optErrorcode) {
        var msg = [],
            optRetcode = optRetcode + "",
            optErrorcode = optErrorcode + "",
            retErrorMsg = retError[optRetcode],
            retCodeErrorMsg = errorCode[optErrorcode];

        retErrorMsg && msg.push(retErrorMsg);
        retCodeErrorMsg && msg.push(retCodeErrorMsg);

        return msg.length > 0 ? msg.join(",") : "未知错误";
    }
    /**
     * Enhance the compatbility of input value
     *
     * @access public
     * @param apiInterface {String} the api interface
     * @return {String} the api interface
     */
    ,compat: function(apiInterface) {
        !QQWB.String.startsWith(apiInterface, "/") && (apiInterface = "/" + apiInterface);
        return apiInterface.toLowerCase();
    }
});
}())
/**
 * Tencent weibo javascript library
 *
 * Querystring encoder and decoder
 *
 * @author michalliu
 * @version 1.0
 * @package util
 * @module queryString
 * @requires base
 */

QQWB.extend("queryString",{
    /**
     * Encode parameter object to query string
     *
     * @access public
     * @param params {Object} the object contains params
     * @param opt_sep {String} the seprator string, default is '&'
     * @param opt_encode {Function} the function to encode param, default is encodeURIComponent
	 * @param opt_filter {Array} filter the result
     * @return {String} the encoded query string
     */
    encode: function (params, opt_sep, opt_encode, opt_filter) {

        var regexp = /%20/g,

            sep = opt_sep || '&',

            encode = opt_encode || encodeURIComponent,

            pairs = [],

			pairsShadow = [],

			key,val; // filtered from filters

        for (key in params) {

            if (params.hasOwnProperty(key)) {

                val = params[key];

                if (val !== null && typeof val != 'undefined') {

					key = encode(key).replace(regexp,"+");

					val = encode(val).replace(regexp,"+");

					if (!opt_filter) {

                        pairs.push(key + "=" + val);

					} else {

						for (var i=0,l=opt_filter.length; i<l; i++) {

							if (opt_filter[i] === key) {

								pairs[i] = key + "=" + val;

							}

						}

					}

                }

            }

        } // end loop

		// remove undefined value in an array
		for (var j=0,len=pairs.length;j<len;j++) {

			if (typeof pairs[j] != "undefined") {

				pairsShadow.push(pairs[j]);

			}

		}

		// swap value
		pairs = pairsShadow;

        pairsShadow = null;

        // pairs.sort();
        return pairs.join(sep);
    }

    /**
     * Decode query string to parameter object
     *
     * @param str {String} query string
     *        opt_sep {String} the seprator string default is '&'
     *        opt_decode {Function} the function to decode string default is decodeURIComponent
     * @return {Object} the parameter object
     */
   ,decode: function (str, opt_sep, opt_decode) {

       var decode = opt_decode || decodeURIComponent,

           sep = opt_sep || '&',

           parts = str.split(sep),

           params = {},

           pair;

       for (var i = 0,l = parts.length; i<l; i++) {

           pair = parts[i].split('=',2);

           if (pair && pair[0]) {

               params[decode(pair[0])] = decode(pair[1]);

           }

       }

       return params;
    }
});
/*
 * @author crockford
 * @url https://raw.github.com/douglascrockford/JSON-js/master/json2.js
 * @module JSON2
 * @licence Public Domain
 */
/*
    http://www.JSON.org/json2.js
    2011-02-23

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/**
 * Tencent weibo javascript library
 *
 * JSON manipulate
 *
 * @author michalliu
 * @version 1.0
 * @package common
 * @module JSON
 * @requires base
 *           String
 *           JSON2
 */
QQWB.extend("JSON",{
    /**
     * Get JSON Object from string
     *
     * @access public
     * @param source {String} the source string
     * @throws {SyntaxError} sytaxError if failed to parse string to JSON object
     * @return {Object} json object
     */
    fromString: function (source) {
        if (!source || !QQWB.String.isString(source)) {
            return {};
        } else {
            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            source = source.replace(/^\s+/,"").replace(/\s+$/,"");

            if ( window.JSON && window.JSON.parse ) {
                source = window.JSON.parse( source );
            } else {
                // Make sure the incoming data is actual JSON
                // Logic borrowed from http://json.org/json2.js
                if ( /^[\],:{}\s]*$/.test( source.replace( /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@" )
                    .replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]" )
                    .replace( /(?:^|:|,)(?:\s*\[)+/g, "")) ) {

                    source = (new Function( "return " + data ))();
                } else {
                    throw new SyntaxError ("Invalid JSON: " + source);
                }
            }

            return source;
        } // end if
    } // end fromString

    /**
     * Convert JSON Object to string
     *
     * @access public
     * @param source {Object} the source object
     * @return {String} the stringified version of an object
     */
   ,stringify: function (source) {
       return source == null ? "" : window.JSON.stringify(source);
    }

    /**
     * Convert JSON Object to string
     *
     * @access public
     * @deprecated use JSON.stringify instead
     * @param source {Object} the source object
     * @return {String} the stringified version of an object
     */
   ,toString: function (source) {
       return QQWB.JSON.stringify(source);
    }
    /**
     * Convert string to JSON object
     *
     * @access public
     * @deprecated use JSON.fromString instead
     * @param source {String} the source string
     * @return {Object}
     */
   ,parse: function (source) {
       return source == null ? {} : window.JSON.parse(source);
    }

}, true/*overwrite toString method inherit from Object.prototype*/);
/**
 * Tencent weibo javascript library
 *
 * Server side runs
 *
 * @author michalliu
 * @version 1.0
 * @package builder
 * @module proxy
 * @requires base
 *           core.log
 *           core.io
 *           util.bigtable
 *           util.queryString
 *           core.init
 *           common.JSON
 *           common.Array
 *           common.String
 *           weibo.util
 */

// build server side proxy

// boot library
(function () {
	var _ = QQWB,

	    _j = _.JSON,

		_a = _.Array,

		_s = _.String,

		_b = _.bigtable,

		_q = _.queryString,

		_l = _.log,

		_i = _.io,

	    messageHandler,

		targetOrigin = "*", // we don't care who will handle the data

        appWindow = window.parent; // the third-party application window

    _l.info("[proxy] proxy is running");

    // post a message to the parent window indicate that server frame(itself) was successfully loaded
	if (window != appWindow) { // iframe

        appWindow.postMessage("success", targetOrigin); 

	}

   function apiAjax (api, apiParams, dataType, type) {

       var opts = {

               type: _s.trim(type.toUpperCase())

              ,url: _b.get("uri","api") + api

              ,data: _q.encode(apiParams)

              ,dataType: _s.trim(dataType.toLowerCase())

           };

       if (opts.type == "GET") {

           opts.url += (opts.data ? "?" + opts.data : "");

           delete opts.data;

       }

       return _i.ajax(opts);

    }

	messageHandler = function (e) {

		// accept any origin, we do strict api check here to protect from XSS/CSRF attack
		var data,id,args,apiInterface;

		try {

			data = _j.fromString(e.data);

		} catch (jsonParseError) {}

		// check format
		if (data && data.id && data.data) {

			id = data.id, // message id related to the deferred object

			args = data.data,

			apiInterface = args[0];

	    	if (args[2].toLowerCase() == "xml") {
	    		// if dataType is xml, the ajax will return a xml object, which can't call
	    		// postMessage directly (will raise an exception) , instead we request to tranfer
	    		// XML as String, then parse it back to XML object.
	    		// io.js will fall to response.text
	    		// api.js will detect that convert it back to xml
	    		// @see io.js,api.js
	    		args[2] = "xmltext";
	    	}

	    	if (!apiInterface) { // basic interface name validation

	    		appWindow.postMessage(_j.stringify({

	    			id: id

	    		   ,data: [-1, "interface can not be empty"]

	    		}), targetOrigin);

	    		_l.error("[proxy] interface cant not be empty");

	    	} else {

	    		apiAjax.apply(this,args).complete(function () {

	    			// can't stringify a xml object here
	    	    	appWindow.postMessage(_j.stringify({

	    	    		id: id

	    	    	   ,data: _a.fromArguments(arguments)

	    	    	}), targetOrigin);

	    		});

	        }

		} else {

			_l.warn("[proxy] ignore unexpected message " + e.data);

		}

    }; // end message handler

    if (window.addEventListener) {

        window.addEventListener("message", messageHandler, false);

    } else if (window.attachEvent) {

        window.attachEvent("onmessage", messageHandler);

    }

}());
