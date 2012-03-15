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
 * Event API
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module event
 * @requires base
 */

QQWB.extend("",{
    /**
     * Bind handler with an event name
     *
     * @param name {String} event name to bind
     * @param handler {Function} the handler for this event
     */
    bind: function (name, handler) {

        name = name.toLowerCase();

	    var _ = QQWB,

	        _b = _.bigtable,

	        handlers = _b.get("eventhandler",name);

	    if (handlers) {
	        
            if (!QQWB.Array.inArray(handlers,handler)) {

	     	   handlers.push(handler);

            }

	    } else {

	        _b.put("eventhandler", name, [handler]);

	    }

	    return _;
    }

    /**
     * Bind handler with an event name
	 * This handler will removed after event happens
     *
     * @param name {String} event name to bind
     * @param handler {Function} the handler for this event
     */
   ,once: function (name, handler) {

		name = name.toLowerCase();

		var _ = QQWB,

		    handlerWrapper;

		handlerWrapper = function () {

			var ret = handler.apply(QQWB, arguments);

            _.unbind(name, handlerWrapper);

			handlerWrapper = null;

			return ret;

		}

        _.bind(name, handlerWrapper);

    	return _;
	}

    /**
     * Unbind handler from event
     *
     * Example:
     *
     * // handler for when user logged in
     * // keep a reference to this handler
     * var userlogin = function () {
     *     T.log.info("user logged in");
     * }
     *
     * // bind handler
     * T.bind("UserLoggedIn", userlogin);
     *
     * // unbind this handler 
     * T.unbind("UserLoggedIn", userlogin);
     *
     * // unbind all the handlers
     * T.unbind("UserLoggedIn")
     *
     * @param name {String} event name to unbind
     *        handler {Function} the handler's reference for this event to unbind
     */
   ,unbind: function (name, handler) {

        name = name.toLowerCase();

	    var _ = QQWB,

	        _b = _.bigtable,

	        handlers = _b.get("eventhandler",name),

	        i;

	    if (handlers) {

	        if (handler) {

	     	   for (i=0,l=handlers.length; i<l; i++) {

	     		   if (handler === handlers[i]) {

					   handler = null;

	     			   handlers.splice(i,1);

	     		   }

	     	   }

	        } else {

	     	   _b.del("eventhandler",name);

	        }

	    }

	    return !_b.get("eventhandler",name);
    }

    /**
     * Trigger an event manually
     *
     * Example:
     *
     * T.trigger("UserLoggedIn");
     *
     * @param eventName {String} the event's name to bind
     * @param data {Mixed} the data passed to the callback function
     */
   ,trigger: function (name, data) {

        name = name.toLowerCase();

	    var _ = QQWB,

	        _a = _.Array,

	        _b = _.bigtable,

	        handlers = _b.get("eventhandler",name);

	    if (handlers) {

	        return _a.forEach(handlers, function (handler, i) {

			   if (handler) {
				   return handler.call(_, data);
			   }

			   return;

	        });
	    }

	    return;
    }
});
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
 * API call
 *
 * Example:
 * 
 *  T.api( "/status/home_timeline"
 *        ,{
 *            maxpage: 20
 *         }
 *        ,"json","GET")
 *  .success(function (response) {
 *  })
 *  .error(function (error) {
 *  });
 *
 *  Note:
 *
 *  T.api method supports cache, when the condition meets.
 *  The cached api will run automaticlly.
 *
 *  If there is a problem when processing to meet the condition.
 *  then the api call will failed too.
 *
 * @access public
 * @param api {String} the rest-style api interface
 * @param apiParams {Object} api params
 * @param optDataType {String} the dataType supports either "json","xml","text", case-insensitive, default is "json"
 * @param optType {String} the request method supports either "get","post", case-insensitive, default is "get"
 * @param optOverride {String} override appkey and accesstoken provided in T.init and cookie
 * @return {Object} promise object
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module api
 * @requires base
 * @includes io
 *           util.deferred
 *           weibo.util
 */

QQWB.provide("api", function (api, apiParams, optDataType, optType, optOverride) {

	var _ = QQWB,

	    _a = _.Array,

	    _s = _.String,

		_j = _.JSON,

		_x = _.XML,

	    _b = _.bigtable,

	    _l = _.log,

		_q = _.queryString,

		_i = _.io,

		counter = _b.get("api","count"),

		solution = _b.get("solution","deferred"),

		solutionName = _b.get("solution","name"),

		format = optDataType,

		supportedFormats = {json:true,xml:true/*,text:true*/},

    	deferred = _.deferred.deferred(),

		promise = deferred.promise(),

	    appkey,

		actoken,

		proxyFrame,
		
		onDataBack;
	
	api = _.weibo.util.compat(api);

	apiParams = apiParams || {};

    optDataType = (optDataType || "json").toLowerCase();

    optType = optType || "GET";

	optOverride = optOverride || {};

	appkey = optOverride.appkey || optOverride.clientid || _b.get("base", "appkey");

	actoken = optOverride.accesstoken || optOverride.token || _._token.getAccessToken();

	if (!(format in supportedFormats)) {
		format = "json";
	}

	apiParams["oauth_consumer_key"] = appkey;

	apiParams["oauth_token"] = actoken;

	apiParams["oauth_version"] = "2.0";

	apiParams["format"] = format;


	if (!appkey) {

		_l.error("appkey can not be empty");

		deferred.reject(-1, "appkey cant not be empty",0);

		return promise;

	}

	if (!actoken) {

		_l.warn("accesstoken is empty");

	}

	if (!solution.isResolved() && !solution.isRejected()) {

		_l.warning("api call cached, waiting solution ready ...");

    	solution.promise().done(function () {

		    _l.info("invoking cached api call " + api + "...");

			_.api(api, apiParams, optDataType, optType, optOverride)

			    .success(function () {

				    deferred.resolveWith(deferred,arguments);

				 })

			    .error(function (){

				    deferred.rejectWith(deferred,arguments);

			     });

		}).fail(function () {

		    _l.error("can't invoking cached api call " + api + "...");

		    deferred.rejectWith(deferred,arguments);

		});

		return promise;
	}

	if (!solution.isResolved()) {

		solution.fail(function () {

		    _l.error(arguments[1]);

		    deferred.rejectWith(deferred,arguments);
		});

		return promise;
	}

    _b.put("api","count",++counter);

    _l.info("[" + counter + "] sending weibo request...");

    // html5 solution
    if (solutionName === "html5") {

		    proxyFrame = _b.get("solution", "frame");

			if (!proxyFrame) {

	            _l.error(-1, "proxy frame not found");

	            deferred.reject(-1,"proxy frame not found");

			} else {

					onDataBack = _b.get("api","ondataback");

					if (!onDataBack) {

						onDataBack = _b.put("api","ondataback", function (e) {

							var data,

							    id,

								defr,

								response;

							if (_b.get("uri","html5proxy").indexOf(e.origin) !== 0) {

	                            _l.warn("ignore data from origin " + e.origin);

							} else {

								data = _j.fromString(e.data);

								id = data.id;

								response = data.data;

								defr = _b.get("api","resultdeferred" + id);

								if (defr) {

							        if (response[0] !== 200) {

										defr.rejectWith(defr,response);

									} else {

										if (response[5] == "xmltext") {

											response[3] = _x.fromString(response[3]);

										}

                                        defr.resolve(response[3]/* response body */, response[2]/* elpased time */, response[4]/*response header*/);
									}

								    _b.del("api","resultdeferred" + id);

								} else {

									_l.error("invalid api request id " + id);

								}
							}

						});

                        if (window.addEventListener) {

                            window.addEventListener("message", onDataBack, false);

                        } else if (window.attachEvent) {

                            window.attachEvent("onmessage", onDataBack);

                        }
					}

					_b.put("api", "resultdeferred" + counter, deferred);

					// IE8 has problems if not wrapped by setTimeout
					setTimeout(function () {

                        // @see http://msdn.microsoft.com/en-us/library/cc197015(v=vs.85).aspx
                        proxyFrame.contentWindow.postMessage(_j.stringify({ 

                        	id: counter

                           ,data: [api, apiParams, optDataType, optType]

                        }),_b.get("uri","html5proxy"));

					}, 0 );

			}

	} else if (solutionName === "as3") {

       function apiFlashAjax (api, apiParams, dataType, type) {

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

            return _i.flashAjax(opts);

        }

		// @see io.js onFlashRequestComplete_8df046 for api call sequence management
		apiFlashAjax(api, apiParams, optDataType, optType).complete(function () {

			if (arguments[0] !== 200) {

				deferred.rejectWith(deferred,arguments);

			} else {

                deferred.resolve(arguments[3]/* response body */, arguments[2]/* elpased time */, arguments[4]/*response header*/);
			}
		});
	}

    (function () {

		var serial = counter,

		    name = solutionName,

			pingback = _b.get("base", "pingback");

     	promise.complete(function () {

             _l.info("*[" + serial + "] done");

             serial = null;

     	});

		if (_.ping && pingback && (typeof pingback == "boolean" || (typeof pingback == "number" && pingback > 2))) {

			function sendPingback(status, statusText, responseTime) {

				responseTime = responseTime || 0;

                _.ping.pingAPI(api, _q.encode(apiParams), optDataType, optType, status, statusText, responseTime, name);

			}

			promise.success(function (response, elapsedTime) {

                sendPingback(200,"ok",elapsedTime);

			});

			promise.fail(function (status, statusText, elapsedTime) {

                sendPingback(status,statusText,elapsedTime);

			});
		}

    }());

    return promise;
});
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
/**
 * Tencent weibo javascript library
 *
 * Browser and browser's feature detection
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module browser
 * @requires base
 *           log
 */

(function (){

    var browserMatch, // ua regexp match result

              ua = navigator.userAgent,

           //rmsie = /(msie) ([\w.]+)/,
		   
          ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,

         rwebkit = /(webkit)[ \/]([\w.]+)/,

        rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

        browserFeatures = {}, // keep browser features

        browserPrefixes = ["Webkit","Moz","O","ms","khtml"],

        featureTests = {

             "cookie": function () {

                 var cookieEnabled = navigator.cookieEnabled;

                 if (cookieEnabled && QQWB.browser.webkit) {

                     // resolve older webkit bug
					 
                     var cookiename = "COOKIE_TEST_" + QQWB.uid();

                     document.cookie = cookiename + "=" + 1 +"; domain=; path=;";

                     if (document.cookie.indexOf(cookiename) < 0) {
						 
                         cookieEnabled = false;

                     } else {

                         document.cookie = cookiename + "=" +"; expires=" + new Date(1970,1,1).toUTCString() + "; domain=; path=;";

                     }

                 }

                 !cookieEnabled && QQWB.log.warn("This browser doesn't support cookie or cookie isn't enabled");

                 return cookieEnabled;
			 }

			 // code borrowed from http://code.google.com/p/swfobject
            ,"flash": function () { 

		      	 var desc,

		             enabled,

					 flashAX,

					 playerversion,

					 ret;// major,minor,build

                 if (typeof navigator.plugins != "undefined" && typeof navigator.plugins["Shockwave Flash"] == "object") {

                    desc = navigator.plugins["Shockwave Flash"].description; // plug in exists;

                    enabled = typeof navigator.mimeTypes != "undefined"

                                  && navigator.mimeTypes["application/x-shockwave-flash"]

                                  && navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin;

					if (desc && enabled) {

						desc = desc.replace(/^.*\s+(\S+\s+\S+$)/, "$1");

						playerversion = [];

						playerversion[0] = parseInt(desc.replace(/^(.*)\..*$/, "$1"), 10);

				        playerversion[1] = parseInt(desc.replace(/^.*\.(.*)\s.*$/, "$1"), 10);

				        playerversion[2] = /[a-zA-Z]/.test(desc) ? parseInt(desc.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;

					}

                 } else if (typeof window.ActiveXObject != "undefined") {
                     try {

                         flashAX = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");

					 } catch (ex) {
					 
					 }

                     if (flashAX) {

                         desc = flashAX.getVariable("$version");

					     if (desc) {

                             desc = desc.split(" ")[1].split(",");

                             playerversion = [parseInt(desc[0], 10), parseInt(desc[1], 10), parseInt(desc[2], 10)];

					     } else {

					    	 playerversion = [0, 0, 0];

					     }
                     }
                 }

				 if (playerversion) {

					 ret = { version : playerversion.join(".")};

					 if ( playerversion[0] >= 9 ) { // detect if flash player too old

						 ret["externalInterface"] = true;

					 }

					 return ret;

				 }

             }

            ,"userdata": function () {

                return QQWB.browser.msie;

             }

            ,"postmessage": function () {

                // ie8 support postmessage but it does not work with window.opener
				
                return !!window.postMessage && ((QQWB.browser.msie && parseInt(QQWB.browser.version,10) < 8) ? false : true); 

             }

            ,"canvas": function () {

                var elem = document.createElement("canvas");

                return !!(elem.getContext && elem.getContext("2d"));

            }

            ,"webgl": function () {

                return !!window.WebGLRenderingContext;

            }

            ,"geolocation": function () {

                return !!navigator.geolocation;

            }

            ,"websqldatabase": function () {

                return !!window.openDatabase;

            }

            ,"indexeddb": function () {

                for (var i = 0, l = browserPrefixes.length; i < l; i++) {

                    if (window[browserPrefixes[i].toLowerCase() + "IndexedDB"]) {
						
                        return true;

                    }

                }

                return !!window.indexedDB;

            }

            ,"websocket": function () {

                for (var i = 0, l = browserPrefixes.length; i < l; i++) {

                    if (window[browserPrefixes[i].toLowerCase() + "WebSocket"]) {

                        return true;

                    }

                }

                return !!window.WebSocket;

            }

            ,"localstorage": function () {

                return !!(window.localStorage && localStorage.getItem);

            }

            ,"sessionstorage": function () {

                return !!(window.sessionStorage && sessionStorage.getItem);

            }

            ,"webworker": function () {

                return !!window.Worker;

            }

            ,"applicationcache": function () {

                return !!window.applicationCache;

            }

        };

    // detect browser type and version rely on the browser's user-agent
    function uaMatch (ua) {

        ua = ua.toLowerCase();

		var ie, uamatch;

		// http://stackoverflow.com/questions/4169160/javascript-ie-detection-why-not-use-simple-conditional-comments
		// a more reliable way
        ie = (function(){
        
            var undef,
                v = 3,
                div = document.createElement('div'),
                all = div.getElementsByTagName('i');
        
            while (
                div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                all[0]
            );
        
            return v > 4 ? v : undef;
        
        }());

		if ( ie ) {

            return { browser: "msie", version: ie };

		}

        uamatch = rwebkit.exec( ua ) ||
                    ropera.exec( ua ) ||
                  //rmsie.exec( ua ) ||
                    ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
                    [];

        return { browser: uamatch[1] || "unknown", version: uamatch[2] || "0" };
    }

    // test browser features
    // now we only support little features
    // please visit http://www.modernizr.com for full feature test
    function featureTest () {
		
		var featureName,

		    result;

        for (featureName in featureTests) {

            if (featureTests.hasOwnProperty(featureName)) {

				result = featureTests[featureName](); // run the test

                if (result) {

                    browserFeatures[featureName] = result;

                }
            }
        }
    }

	// code borrowed from http://detectmobilebrowsers.com/
	function dectectPlatform() {

		var platform = navigator.userAgent || navigator.vendor || window.opera;

		if (/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(platform)) {

			return {mobile: true};

		}

		return {pc: true};

	}

	function detectOS() {

		var appversion = navigator.appVersion,

		    os = {},

		    osName = "unknown";

        if (appversion.indexOf("Win")!=-1) { osName="windows"};

        if (appversion.indexOf("Mac")!=-1) { osName="mac"};

        if (appversion.indexOf("X11")!=-1) { osName="unix"};

        if (appversion.indexOf("Linux")!=-1) { osName="linux"};

		os[osName] = true;

		os.name = osName;

		return os;

	}

    browserMatch = uaMatch(ua);

    QQWB.extend('browser',{

        "version":browserMatch.version

    });

    QQWB.browser[browserMatch.browser] = true;

	QQWB.browser.engine = browserMatch.browser;

    featureTest();

    QQWB.extend('browser.feature',browserFeatures);

	QQWB.extend('browser.platform', dectectPlatform());

	QQWB.extend('browser.os', detectOS());

}());
/**
 * Tencent weibo javascript library
 *
 * Cookie manipulation
 *
 * @author michalliu
 * @version 1.0
 * @package util
 * @module cookie
 * @requires base
 *           core.browser
 */

if (QQWB.browser.feature.cookie) {

    QQWB.extend("cookie", {
        /**
         * Set cookie
         *
         * @param name {String} cookie name
         * @param value {String} cookie value
         * @param maxage {Number} seconds from now. If present -1 it means a session cookie(default by browser)
         * @param path {String} cookie path. If not present then use full request path(default by browser)
         * @param domain {String} cookie domain. If not present then use full request host name(default by browser)
         * @access public
         * @return {Void}
         */
        set: function (name, value, opt_maxage, opt_path, opt_domain, enc) {
    
		   var domain,

		       path,

		       expire;

    	   enc = enc || escape;
    
           if ( typeof opt_maxage === "undefined" || opt_maxage === null) {
    
               opt_maxage = -1;
    
           }
    
           domain = opt_domain ? "domain=" + opt_domain : "";
    
           path = opt_path ? "path=" + opt_path : "";
    
           expire = "";
    
           if (opt_maxage === 0) {
    
               expire = "expires=" + new Date(1970,1,1).toUTCString();
    
           } else if (opt_maxage > 0) {
    
               expire = "expires=" + new Date(new Date().getTime() + opt_maxage * 1000).toUTCString();
    
           }
    
           document.cookie = [name + "=" + enc(value), expire, path, domain].join("; ");
    
		   return QQWB;
        }
    
        /**
         * Return the first value for the given cookie name 
         *
         * @access public
         * @param name {String} cookie name
         * @return {String} value for cookie
         */
       ,get: function (name, dec ,optDefault) {
    
    	   dec = dec || unescape;
    
           name = name + "=";
    
           cookies = (document.cookie || "").split(/\s*;\s*/);
    
           for (var i=0,l=cookies.length; i<l; i++) {
    
               var cookie = cookies[i];
    
               if (cookie.indexOf(name) === 0) {
    
                   return dec(cookie.substr(name.length));
    
               }
    
           }
    
    	   return optDefault;
        }
    
        /**
         * Delete cookie
         *
         * @access public
         * @param name {String} cookie name
         * @param opt_path {String} the path of cookie
         * @param opt_domain {String} the domain of cookie
         * @return {Void}
         */
       ,del: function (name, opt_path, opt_domain) {
    
           QQWB.cookie.set(name, '', 0, opt_path, opt_domain);
    
           if (document.cookie.indexOf(name + "=") >= 0) {
    
               QQWB.log.warning("cookie may not be deleted as you expected");
    
           }
    
           return QQWB;
    
        }
    });

} else {

	QQWB.log.debug("cookie isn't support or be enabled");

}
/**
 * Tencent weibo javascript library
 *
 * Token management
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module token
 * @requires base
 * @includes util.queryString
 *           util.cookie
 */

QQWB.extend("_token",{
    /**
     * Save access token to cookie
     *
     * @access public
     * @param accessToken {String} access token string
     * @param expireIn {Number} expire after seconds from now
     * @param optUsername {String} username associate with accesstoken
     * @param optNickname {String} nickname associate with accesstoken
     * @return {Object} QQWB object
     */
    setAccessToken: function (accessToken, expireIn, optUsername, optNickname) {

		var _ = QQWB,

		    _b = _.bigtable,

		    _c = _.cookie,

			_t = _.time,

			user;

        user = this.getTokenUser(true);

        _c.set(_b.get("cookie","accesstokenname")

                       ,[accessToken, _t.now() + expireIn * 1000, optUsername || (user && user.name) || "", optNickname || (user && user.nick) || ""].join("|")

                       ,365 * 24 * 3600

                       ,QQWB.bigtable.get("cookie","path")

                       ,QQWB.bigtable.get("cookie","domain")
            );

        return _;
    }

    /**
     * Get access token saved before
     *
     * @access public
     * @param optRaw {Boolean} if set to true, will not consider about accesstoken expiration
     * @return {String|undefined} a string represent access token if available
     */
   ,getAccessToken: function (optRaw) {

        var _ = QQWB,

		    _b = _.bigtable,

		    _c = _.cookie,

			_t = _.time,

			token;

         token = _c.get(_b.get("cookie","accesstokenname"));

         if (token) {

             token = token.split("|",2);

             if (optRaw || parseInt(token[1],10) > _t.now()) {

                 return token[0];

             }

         }

    }

    /**
     * Get user infomation associated with access token
     *
     * @access public
     * @param optRaw {Boolean} if set to true, will not consider about expiration
     * @return {Object|undefined} an user object associated with access token if available
     */
   ,getTokenUser: function (optRaw) {

        var _ = QQWB,

		    _b = _.bigtable,

		    _c = _.cookie,

			_t = _.time,

			token;

         token = _c.get(_b.get("cookie","accesstokenname"));

         if (token) {

             token = token.split("|",4);

             if (optRaw || parseInt(token[1],10) > QQWB.time.now()) {

                 return {

                     name: token[2]

                    ,nick: token[3]

                 };

             }

         }

    }

    /**
     * Clear access token
     *
     * @access public
     * @return {Object} QQWB object
     */
   ,clearAccessToken: function () {

        var _ = QQWB,

		    _b = _.bigtable,

		    _c = _.cookie;

        return _c.del(_b.get("cookie","accesstokenname"),_b.get("cookie","path"),_b.get("cookie","domain"));
    }

    /**
     * Save refresh token to cookie
     *
     * @param refreshToken {String} refresh token string
     * @return {Object} QQWB object
     */
   ,setRefreshToken: function (refreshToken) {

        var _ = QQWB,

		    _b = _.bigtable,

		    _c = _.cookie;

         _c.set(_b.get("cookie","refreshtokenname")

                ,refreshToken

                ,365 * 24 * 3600

                ,_b.get("cookie","path")

                ,_b.get("cookie","domain")
            );

        return _;

    }

    /**
     * Get refresh token saved before
     *
     * @return {String|undefined} a string represent refresh token if available
     */
   ,getRefreshToken: function () {

        return QQWB.cookie.get(QQWB.bigtable.get("cookie","refreshtokenname"));

    }

    /**
     * Clear refresh token
     *
     * @access public
     * @return {Object} QQWB object
     */
   ,clearRefreshToken: function () {

        return QQWB.cookie.del(QQWB.bigtable.get("cookie","refreshtokenname"),QQWB.bigtable.get("cookie","path"),QQWB.bigtable.get("cookie","domain"));

    }

    /**
     * Use refresh token to obtain an access token
     *
     * @access public
     * @param optCallback {Function} callback function when result returned
     */
   ,exchangeForToken: function (optCallback) {

	   var _ = QQWB,

	       _b = _.bigtable,

		   _q = _.queryString,

		   _l = _.log,

		   _i = _.io,

		   _s = _.String,

		   appkey = _b.get("base", "appkey");

       _i.jsonp({

                url: _b.get("uri","exchangetoken")

               ,data: _q.encode({

                          response_type: "token"

                         ,client_id: appkey

                         ,scope: "all"

                         ,state: "1"

                         ,refresh_token: this.getRefreshToken()

                         ,access_token: this.getAccessToken(true)

                      })

       }).success(function (response) {

           var _response = response;

           _s.isString(response) && (response = _q.decode(response));

           if(response.access_token){

               !response.expires_in && _l.error("accesstoken expires_in not returned");

               !response.wb_name && _l.warning("weibo username not retrieved, will not update username");

               !response.wb_nick && _l.warning("weibo nick not retrieved, will not update nick");

               _._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wb_name, response.wb_nick);

               if (response.refresh_token) {

                    _._token.setRefreshToken(response.refresh_token);

               } else {

                   _l.warning("refresh token not retrieved");

               }

               _l.info("exchange token succeed");

           } else if (response.error) {

               _l.error("exchange token error " + response.error );

           } else {

               _l.error("unexpected result returned from server " + _response + " while exchanging for new accesstoken");

           }

       }).error(function (status, statusText) {

           if (status === 404) {

               _l.error("exchange token has failed, script not found");

           } else {

               _l.error("exchange token has failed, " + statusText);

           }

       }).complete(function (arg1, arg2, arg3) {

           optCallback && optCallback(arg1, arg2, arg3);

       });

       return _;

    }

    /**
     * Obtain an access token
     *
     * @access public
     * @param optCallback {Function} callback function when result returned
     */
   ,getNewAccessToken: function (optCallback) {

	   var _ = QQWB,

	       _b = _.bigtable,

		   _q = _.queryString,

		   _l = _.log,

		   _i = _.io,

		   _s = _.String,

		   appkey = _b.get("base", "appkey");

       _i.jsonp({

               url: _b.get("uri","autotoken")

              ,data: _q.encode({

                   response_type: "token"

                  ,client_id: appkey

                  ,scope: "all"

                  ,state: "1"

               })

       }).success(function (response) {

           var _response = response;

           _s.isString(response) && (response = _q.decode(response));

           if(response.access_token){

               !response.expires_in && _l.error("token expires_in not retrieved");

               !response.wb_name && _l.warning("weibo username not retrieved");

               !response.wb_nick && _l.warning("weibo usernick not retrieved");

               _._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wb_name, response.wb_nick);

               if (response.refresh_token) { // which should exists if accesstoken exists

                    _._token.setRefreshToken(response.refresh_token);

               } else {

                   _l.warning("refresh token not retrieved");

               }

               _l.info("retrieve new access token succeed");

           } else if (response.error) {

               _l.error("retrieve new access token error " + response.error );

           } else {

               _l.error("unexpected result returned from server " + _response + " while retrieving new access token");

           }

       }).error(function (status, statusText) {

           if (status === 404) {

               _l.error("get token has failed, script not found");

           } else {

               _l.error("get token failed, " + statusText);

           }

       }).complete(function (arg1, arg2, arg3) {

           optCallback && optCallback(arg1, arg2, arg3);

       });

       return _;
    }

    /**
     * Auto resolve response from server
     *
     * @param responseText {String} the server response
     */
   ,resolveResponse: function (responseText) {
	   var _ = QQWB,

	       _b = _.bigtable,

		   _q = _.queryString,

		   _l = _.log,

		   _s = _.String,

           loginStatus,

           response = _s.isString(responseText) ? _q.decode(responseText) : responseText;

       if (response.access_token) {

           _._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wb_name, response.wb_nick);

           if (response.refresh_token) {

               _._token.setRefreshToken(response.refresh_token);

           } else {

               _l.error("refresh token not retrieved");

           }

           loginStatus = _.loginStatus();

           _l.info("user " + loginStatus.name + " logged in");

           _.trigger(_b.get("nativeevent","userloggedin"),loginStatus);

       } else if (response.error) {

           _l.error("login error occurred " + response.error);

           response.message = response.error;

           _.trigger(_b.get("nativeevent","userloginfailed"),response);

       } else {

           _l.error("unexpected result returned from server " + responseText);

           response.message = response.error = "server error";

           _.trigger(_b.get("nativeevent","userloginfailed"),response);
       }

    }

});
/**
 * Tencent weibo javascript library
 *
 * Authenticate user
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module auth
 * @requires base
 *           core.init
 * @includes core.token
 */
(function (){

var authWindow = function () {

	var _ = QQWB,
	    
	    _b = _.bigtable,

	    width = _b.get("authwindow","width"),

    	height = _b.get("authwindow","height"),

		name = _b.get("authwindow","name"),

		url = _b.get("uri","auth"),

		attrs = "toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=yes,status=no",

		authorizing = false,

		awindow = null;
	
	return {

		show: function () {

	        var _ = QQWB,

	            _b = _.bigtable,

	            appkey = _b.get("base", "appkey"),

		        autoclose = _b.get("base","autoclose"),

		        samewindow = _b.get("base","samewindow"),

				x,

				y,

				query,

				props;

			if (!authorizing) {

		        x = (window.screenX || window.screenLeft) + ((window.outerWidth || document.documentElement.clientWidth) - width) / 2;

		        y = (window.screenY || window.screenTop) + ((window.outerHeight || document.documentElement.clientHeight) - height) / 2;

		        query =  _.queryString.encode({

                     response_type: "token"

                    ,client_id: appkey

                    ,redirect_uri: _b.get("uri","redirect")

                    ,scope: "all"

                    ,status: 0

                });

		        props = ["width=" + width, "height=" + height, "left=" + x, "top=" + y].join(",")

				if (samewindow) {

					window.name = name;

					window.location.replace(url + "?" + query);

					return;
				}

	            awindow = window.open(url + "?" + query, name, [props, attrs].join(","));

				authorizing = true;

		        (function () {

					var _ = QQWB,

					    _q = _.queryString;

                    if (awindow.closed) { // user close like ALT + F4

                        _._token.resolveResponse("error=access_denied");

						authorizing = false;

						awindow = null;

                        return;

		            } else {

		                try {

		                 	response = awindow.location.hash;	

		                } catch (ex) {

		                	response = null;
		                }

		                if (response) {

		         		   response = _q.decode(response.split("#").pop());

		         		   if (parseInt(response.status,10) == 200) {

		                        _._token.resolveResponse(response);

		         		   }

	                       authorizing = false;

                           autoclose && awindow.close();

						   awindow = null;

		                   return;

		                }

                        setTimeout(arguments.callee, 0);

                    }

                }());

			} else {

                awindow && awindow.focus();

			}
			
		}

	};

}(); // end authWindow

QQWB.extend("auth",{
    /**
     * Login in user
     *
     * @access public
     * @param optSuccessHandler {Function} handlers when login is success
     * @param optFailHandler {Function} handlers when login is fail
     * @return {Object|undefined}
     */
    login: function (optSuccessHandler, optFailHandler) {

	    var _ = QQWB,

	        _b = _.bigtable,

			_l = _.log,

			inited = _b.get("base","inited"),

            loginStatus = _.loginStatus(), 

            onLoginSessionComplete; // hander on this logon session complete

        if (!inited) {

            _l.critical(_.name + " not initialized, call T.init() to initialize");

        }

		// user loggedin at successhandler is passedIn
		if (loginStatus && optSuccessHandler) {

            optSuccessHandler(loginStatus);

			return _;

		}

		if (optSuccessHandler || optFailHandler) {

			onLoginSessionComplete = function (arg1) {

				if(arg1.access_token && optSuccessHandler) {

					optSuccessHandler(arg1);

				} else if(arg1.error && optFailHandler){

					optFailHandler(arg1);

				} else {

                    _l.error("wired result of T.login " + arg1);

				}

                _.unbind(_b.get("nativeevent","userloggedin"), onLoginSessionComplete);

                _.unbind(_b.get("nativeevent","userloginfailed"), onLoginSessionComplete);

                onLoginSessionComplete = null;

			};

            _.bind(_b.get("nativeevent","userloggedin"), onLoginSessionComplete);

            _.bind(_b.get("nativeevent","userloginfailed"), onLoginSessionComplete);

		}

		authWindow.show();

        return _;
    }

    /**
     * Logout user
     *
     * @return {Object} QQWB object
     */
   ,logout: function (optHandler) {

	   var  _ = QQWB,

	        _b = _.bigtable,

			_l = _.log,

	        loginStatus = _.loginStatus();

       _l.info("logging out user");

       if (!loginStatus) {

           _l.warning("oops, user not logged in");

       } else {

           _._token.clearAccessToken();

           _._token.clearRefreshToken();

           _l.info("user " + (loginStatus.name || "unknown") + "logged out");

       }

       optHandler && optHandler();

       _.trigger(_b.get("nativeevent","userloggedout"));

       return _;
    }

   /**
    * Get login status object
    *
    * @access public
    * @param optCallback {Function} callback handler
    * @return {Object|undefined}
    */
   ,loginStatus: function (optCallback) {

	   var _ = QQWB,

	       status,

           accessToken = _._token.getAccessToken(),

           user = _._token.getTokenUser();

       if (accessToken) {

           status = {

               access_token: accessToken

              ,name: user.name

              ,nick: user.nick

           };

       }

       optCallback && optCallback(status);

       return status;
    }
});

QQWB.login = QQWB.auth.login;

QQWB.logout = QQWB.auth.logout;

QQWB.loginStatus = QQWB.auth.loginStatus;

}());
/**
 * Tencent weibo javascript library
 *
 * Object extension
 *
 * @author michalliu
 * @version 1.0
 * @package common
 * @module Object
 * @requires base
 */
QQWB.extend("Object",{

	create: function () {

		if (Object.create) {

			return Object.create;

		} else {

			return function (proto, properties) {

				var F = function () {};

				F.prototype = proto;

				return new F();
			}
		}

	}(),

	// closure-library
	forEach: function (obj, f, opt_obj, followproto) {

		for (var key in obj) {

			if (followproto) {

			    f.call(opt_obj, obj[key], key, obj);

			} else {

				if (obj.hasOwnProperty(key)) {

			        f.call(opt_obj, obj[key], key, obj);

				}
			}
		}

	}

});
/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 *
 *  @author John Resig
 *  @url    http://sizzlejs.com/
 *  @module sizzle
 *  @licence MIT, BSD, and GPL
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var match,
			type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var found, item,
					filter = Expr.filter[ type ],
					left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					var first = match[2],
						last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
	
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
var oldSizzle = window.Sizzle;

// Added
Sizzle.noConflict = function () {
    window.Sizzle = oldSizzle;
};

window.Sizzle = Sizzle;

})();
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
/**
 * Tencent weibo javascript library
 *
 * Use
 *
 * Example:
 *
 * T.man("/Statuses/home_timeline");
 *
 * @author michalliu
 * @version 1.0
 * @package ui
 * @module component
 * @requires base
 *           util.bigtable
 *           core.dom
 *           core.log
 *           util.queryString
 *           common.String
 *
 * @includes common.Object
 *           util.queryString
 */

(function () {

	var _ = QQWB,

	    _b = _.bigtable,

	    _d = _.dom,

		_l = _.log,

		_q = _.queryString,

		_s = _.String,

		components,

	    proto;

	components = _b.put("use","useable",[
		{
			name: "微评论",

			allowuse: true,

			create: function (cfg) {

				var msg,

				    frame,

				    url = "http://comment.v.t.qq.com",

					qurl = location.href,

					props = {};

				if (!cfg.appkey) {

					msg = "创建" + this.name + "组件失败，缺少Appkey";

		    		_l.error(msg);

					throw new Error(msg);
				}

				// remove location.search
				/*
				if (location.search) {

					qurl = qurl.replace(location.search, "");

				}*/

				// remove location.hash
				if (location.hash) {

					qurl = qurl.replace(location.hash, "");

				}

				// url
				qurl = encodeURIComponent(qurl);

				_.extend(props, {

					src: [url, "?", _q.encode({appkey: cfg.appkey, url: qurl})].join(""),

					width: cfg.width || 560,

					height: cfg.height || 500,

					frameborder: 0,

					scrolling: "yes",

					allowtransparency: "true"

				});

				frame = _d.createElement("iframe", props);

				return frame;

			}
		}
	]);

	proto = {

		// configuration
		dimension: function (width, height) {

			if (typeof width == "object") {

				_.extend(this.config, width, true);

			} else {

				_.extend(this.config, {

					width: width,

					height: height

				}, true);
			}

			return this;

		},

		// configuration
		config: function (cfg) {

			_.extend(this.config, cfg, true);

			return this;

		},

		// appkey
		appkey: function (appkey) {

			_.extend(this.config, {

				appkey: appkey

			}, true);

			return this;

		},

		// style
		style: function (styleName) {

			_.extend(this.config, {

				style: styleName

			}, true);

			return this;

		},

		// width
		width: function (width) {

			_.extend(this.config, { width : width }, true);

			return this;
		},

		// height
		height: function (height) {

			_.extend(this.config, { height : height }, true);

			return this;
		},

		// render component to element
		renderInto: function (element) {

			var that = this,

			    msg;

			function renderComponent() {

		    	var c = that.createComponent(that.config);

		    	if (typeof c != "undefined" && c.nodeType == 1) {

		    	    element.appendChild(c);

		    	} else if (_s.isString(c)) {

		    		element.innerHTML = c;

		    	} else {

					msg = "创建" + that.name + "组件失败";

		    		_l.error(msg);

		    		throw new Error(msg);

		    	}

			}

			// node exists
			if (element.nodeType == 1) {

				 renderComponent();

		    // find node
			} else if (_s.isString(element)) {

				_.dom.ready(function () {

			    	element = _.dom.find(element);

			    	if (element.length > 0) {

			    		element = element[0];

						renderComponent();

			    	} else {

						msg = "加载" + that.name + "组件失败，未找到父元素";

			    	    _l.error(msg);

		    		    throw new Error(msg);

			    	}
				});
			// unexpected behavior
			} else {

				msg = "加载" + that.name + "组件失败，无效的父元素" + element;

			    _l.error(msg);

		        throw new Error(msg);
			}

		},

		// render
		render: function () {

			var o,

			    that = this;

			_d.ready( function () {

			    var o = document.getElementById("qqwb_root")

				that.renderInto(o);
			});
		}
		
	}

	// component method
    _.provide("component", function (name, optConfig) {
    
		var _ = QQWB,

		    _s = _.String,

		    _a = _.Array,

			_o = _.Object,

			_l = _.log,

			conf,

			msg,
			
			o;

		name = _s.trim(name);

		_a.each(components, function (i, v) {

			if (v.name == name) {

				conf = v;

				return false;
			}

		});

		if (!conf) {

			msg = "无法使用组件" + name + "，该组件不存在";

			_l.error(msg);

			throw new Error(msg);

		} else if (!conf.allowuse) {

			msg = "无法使用组件" + name + "，暂不支持该组件";

			_l.error(msg);

			throw new Error(msg);
		}

		o = _.Object.create(proto);

		o.name = name;

		if (optConfig) {

			o.config = optConfig;

		} else {

		    o.config = {};

		}

		o.createComponent = conf.create;

    	return o;
    });

}());
/**
 * Tencent weibo javascript library
 *
 * Crossbrowser localstorage solution
 *
 * @author michalliu
 * @version 1.0
 * @package compat
 * @module localStorage
 * @requires base
 *           core.browser
 *           core.dom
 *           core.log
 */

if (QQWB.browser.feature.localstorage) { // implement html5 localstorge

    QQWB.extend("localStorage", {

        set: function (key, value, expireInDays) {

            key = "k" + key;

            var _ = QQWB,

                expire = _.time.secondsNow() + (expireInDays || 7) * 24 * 3600,

                val = {

                    value: value

                   ,expire: expire

                };

            localStorage[key] = _.JSON.stringify(val);

            return localStorage[key];
        }

       ,get: function (key, defaultVal) {

           key = "k" + key;

		   var _ = QQWB,

		       temp = localStorage[key];

           if (temp && (temp = _.JSON.parse(temp)) && temp.value &&  _.time.secondsNow() < temp.expire) {

               return temp.value;

           }

           return defaultVal;

        }

       ,del: function (key) {

           key = "k" + key;

           localStorage.removeItem(key);

           return typeof localStorage[key] == "undefined";

        }

    });

} else if (QQWB.browser.feature.userdata) {

	(function () {

    	var _ = QQWB,
    
    	    userData,
    
            storeName = "QQWBLocalStorage";
    
        _.dom.ready(function () {
    
			var writeCache = _.bigtable.get("localstorage", "writecache"),

			    deleteCache = _.bigtable.get("localstorage", "deletecache");

            userData = document.createElement("input");
    
            userData.type = "hidden";
    
            userData.style.display="none";
    
            userData.addBehavior("#default#userData");
    
            userData.expires = new Date(_.time.now() + 365 * 10 * 24 * 3600 * 1000).toUTCString();
    
            document.body.appendChild(userData);

			if (writeCache && writeCache.length > 0) {

				_.Array.forEach(writeCache, function (v) {

				    _.localStorage.set.apply(_.localStorage,v);

				});

			}

			if (deleteCache && deleteCache.length > 0) {

				_.Array.forEach(deleteCache, function (v) {

				    _.localStorage.del.apply(_.localStorage,v);

				});
			}
        });
    
        _.extend("localStorage", {

            set: function (key, value, expireInDays) {

				var _ = QQWB,

				    cache,

			    	expire,

			    	val;

				if (!userData) { // write to cache

				    cache = _.bigtable.get("localstorage", "writecache", []);

					cache.push(_.Array.fromArguments(arguments));

					_.log.warning("userdata is not ready, save operation to write cache, key " + key);

					return -1; 
				}

                key = "k" + key;

				expire = _.time.secondsNow() + (expireInDays || 7) * 24 * 3600,

                val = {

                    value: value

                   ,expire: expire

                };

                userData.load(storeName);

                userData.setAttribute(key,JSON.stringify(val));

                userData.save(storeName);

                return userData.getAttribute(key);

            }

           ,get: function (key, defaultVal) {

			   var _ = QQWB,

			       temp;

               key = "k" + key;

			   if (!userData) {

                   _.log.error("[localStorage] can't get value for key " + key + ",userData is currently unavaiable");

				   return defaultVal;
			   }


               userData.load(storeName);

               temp = userData.getAttribute(key);

               if (temp && (temp = JSON.parse(temp)) && temp.value && _.time.secondsNow() < temp.expire) {

                   return temp.value;

               }

               return defaultVal;
            }

           ,del: function (key) {

			   var _ = QQWB,

			       cache;

               if (!userData) {
               
                   cache = _.bigtable.get("localstorage", "deletecache", []);
                   
                   cache.push(_.Array.fromArguments(arguments));
                   
                   _.log.warning("userdata is not ready, save operation to delete cache, key " + key);
                   
                   return -1; 
               }

               key = "k" + key;

               userData.load(storeName);

               userData.removeAttribute(key);

               userData.save(storeName);

               return typeof userData.getAttribute(key) == "undefined";
           }

       });

	} ());


} else {

    QQWB.log.warning("localStorage is not supported and no workaround");

}

if (QQWB.localStorage) {

	QQWB.localStorage.save = QQWB.localStorage.set;

	QQWB.localStorage.remove = QQWB.localStorage.del;
}
/**
 * Tencent weibo javascript library
 *
 * Pingback
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module ping
 * @requires base
 *           core.init
 */

QQWB.extend("ping", {

   pingWith: function (params, order) {

	   function baseParam () {

	       var qq = QQWB.cookie.get("uin",null,"0").match(/\d+/)[0],

	           flowid = "";

           return {
               sIp:"" // ip
              ,iQQ: qq // QQ
              ,sBiz:"openJS" // biz name
              ,sOp:"" // operation name
              ,iSta:""  // state
              ,iTy:1183 // system id
              ,iFlow: flowid// unquie id
	          ,iFrom: "" // op from
	          ,iPubFrom: "" // op from
	          ,sUrl: "" // op url
	          ,iUrlType: "" // url type
	          ,iPos:"" // op position
	          ,sText:"" // some text
	          ,iBak1: ""
	          ,iBak2: ""
	          ,sBak1: ""
	          ,sBak2: QQWB.uid()
           };
	   } 

	   params = QQWB.extend(baseParam(), params, true);

	   QQWBPingTransport_18035d19 = new Image(1,1);

	   QQWBPingTransport_18035d19.src = [QQWB.bigtable.get("ping","urlbase"),
	                                    "?",
	                                    QQWB.queryString.encode(params, null, null, order)].join("");
    }

	// ping when appkey initilizing, success or unsuccess
   ,pingInit: function () {

	   function getClientInfo () {

		  var clientInfo = 1000000,

		      feature = 0;

    	  if (QQWB.browser.msie) {

			  clientInfo += 100;

          } else if(QQWB.browser.opera) {

			  clientInfo += 200;

          } else if(QQWB.browser.webkit) {

			  clientInfo += 300;

          } else if(QQWB.browser.mozilla) {

			  clientInfo += 400;

    	  } else {

			  clientInfo += 500;

    	  }
    
    	  if (QQWB.browser.feature.postmessage) {

			  feature += 1;

    	  }

    	  if (QQWB.browser.feature.flash) {

			  feature += 2;

          }

    	  if (QQWB.browser.feature.cookie) {

			  feature += 4;

          }

		  clientInfo += feature;

		  // 1000(browertype)0(browserfeature)
		  return clientInfo;

	   }

	   function getAppInfo () {

		   var appInfo = 1000000;

		   if (QQWB.browser.platform.mobile) {

			   appInfo += 100;

		   } else /*if (QQWB.browser.platform.pc)*/{

			   appInfo += 200;

		   }

		   if (QQWB.browser.os.windows) {

			   appInfo += 10;

		   } else if (QQWB.browser.os.windows) {

			   appInfo += 20;

		   } else if (QQWB.browser.os.mac) {

			   appInfo += 30;

		   } else if (QQWB.browser.os.unix) {

			   appInfo += 40;

		   } else if (QQWB.browser.os.linux) {

			   appInfo += 50;

		   } else /*if (QQWB.browser.os.unknown)*/{
			   appInfo += 60;
		   }

		   return appInfo;
	   }

	   return QQWB.ping.pingWith({

		    sOp: "init"

		   ,iFrom: QQWB.version.replace(/\./g,"")

		   ,iPubFrom: getAppInfo()

		   ,sUrl: [document.title,document.location.href].join(QQWB.bigtable.get("ping","paramsep"))

		   ,sText: QQWB.bigtable.get("base", "appkey")

		   ,iBak1: getClientInfo()

	   }, QQWB.bigtable.get("ping","paramorder").concat("iFrom","iPubFrom","sUrl","iUrlType","iPos","sText","iBak1","iBak2","sBak1","sBak2"));

    }

	// Send pingback when user authorize(loggin) success or fail
   ,_pingAuthorize: function (success) {

	   return QQWB.ping.pingWith({

		    sOp: "login"

		   ,iSta: success ? 1 : 0

		   ,iFrom: QQWB.version.replace(/\./g,"")

		   ,sUrl: document.location.href

		   ,sText: QQWB.bigtable.get("base", "appkey")

	   }, QQWB.bigtable.get("ping","paramorder").concat("iFrom","iPubFrom","sUrl","iUrlType","iPos","sText","iBak1","iBak2","sBak1","sBak2"));

    }

	// Send pingback when user successfull login
   ,pingLoggedIn: function () {

	   return QQWB.ping._pingAuthorize(true);

    }

	// Send pingback when user unsuccessfull login
   ,pingLoggedInFailed: function () {

	   return QQWB.ping._pingAuthorize(false);

    }

	/**
	 * Send pingback when api is called
	 *
	 * @param apiname {String} apiname
	 * @param params {String} params
	 * @param method {String} http method
	 * @param responseTime {Number} response time
	 * @param status {Number} api result status
	 * @param statusText {String} status text
	 * @param solutionName {String} html5 or flash
	 *
	 * @return {Void}
	 */
   ,pingAPI: function (apiname, params, format, method,  status, statusText, responseTime, solutionName) {

	   var solutionInfo = 1000000;

	   apiname = apiname || "";// represent unknown apiname

	   params = params || "";// represent unknown params

	   format = format || "";// represent unknown format

	   method = method || "";// represent unknown method

	   status = status || "-2"; // represent unknown status

	   statusText = statusText || ""; // represent unknown status text

	   responseTime = responseTime || "-1"; // represent unknown responsetime

	   solutionName = solutionName || "";// represent unknown solutionName

       switch(solutionName){

           case "html5":

           case "postmessage":

           solutionInfo+=100;

		   break;

		   case "flash":

           case "as3":

           solutionInfo+=200;

		   break;
       }

	   method = method.toUpperCase();

       switch(method){

           case "GET":

           solutionInfo+=10;

		   break;

           case "POST":

           solutionInfo+=20;

		   break;
       }

	   return QQWB.ping.pingWith({

		    sOp: "api"

		   ,iSta: status

		   ,iFrom: QQWB.version.replace(/\./g,"")

		   ,iPubFrom: solutionInfo

		   ,sUrl: document.location.href

		   ,sText: QQWB.bigtable.get("base", "appkey")

		   ,iBak1: responseTime

		   ,sBak1: [apiname, params].join(QQWB.bigtable.get("ping","paramsep"))

		   //,sBak2: statusText
	   }, QQWB.bigtable.get("ping","paramorder").concat("iFrom","iPubFrom","sUrl","iUrlType","iPos","sText","iBak1","iBak2","sBak1","sBak2"));

    }
});

/**
 * Tencent weibo javascript library
 *
 * common ready event handlers
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module ready
 * @requires base
 */

QQWB.extend("",{
   /**
    * Add callback funtions when the sdk is ready
    * 
    * @access public
    * @param handler {Function} callback function
    * @return {Object} QQWB object
    */
   tokenReady: function (handler) {

	   var _ = QQWB,

	       _b = _.bigtable,

	       ready = _b.get("boot", "tokenready").isOpen();

       if (ready) {

           handler && handler();

       } else {

           _.bind(_b.get("nativeevent","tokenready"), handler);

       }

       return _;
    }
   /**
    * Add callback funtions when everything is ready
    * 
    * @access public
    * @param handler {Function} callback function
    * @return {Object} QQWB object
    */
   ,everythingReady: function (handler) {

	   var _ = QQWB,

	       _b = _.bigtable,

	       ready = _b.get("boot", "everythingready").isOpen();

       if (ready) {

           handler && handler();

       } else {

           _.bind(_b.get("nativeevent","everythingready"), handler); // internal events

       }

       return _;
    }

});

QQWB.ready = QQWB.everythingReady;
/**
 * Tencent weibo javascript library
 *
 * Locker mechanism
 *
 * @author michalliu
 * @version 1.0
 * @package util
 * @module door
 * @requires base
 */
QQWB.extend("door", {

	// count of doors
    doors:0

	/**
	 * Retrieve a new door object, the door can be locked or unlocked
	 *
	 * @access public
	 * @param optLockDo {Function} actions do when lock acts
	 * @param optUnlockDo {Function} action do when unlock acts
	 * @return {Object} locker object
	 */
   ,door: function (optLockDo, optUnlockDo) {

	    // the locks number on this door
        var locks = 0;

		// record the total number of door instance
        this.doors ++;

        return {
			/**
			 * Lock the door
			 *
			 * @access public
			 */
            lock: function () {

                locks ++;

				optLockDo && optLockDo.call(QQWB);

				return this;
            }
			/**
			 * unLock the door
			 *
			 * @access public
			 */
           ,unlock: function () {

               locks --;

			   locks = Math.max(0,locks);

			   optUnlockDo && optUnlockDo.call(QQWB);

			   return this;
            }

			/**
			 * Check whether the door instance is open
			 *
			 * @access public
			 */
           ,isOpen: function () {

               return locks === 0;

            }
        };
    }

	/**
	 * Retrieve the number of lockers
	 *
	 * @access public
	 * @return {Number} count of lockers
	 */
   ,count: function () {

       return this.doors;

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
 * bootstrap, the start point
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module boot
 * @requires base
 *           util.door
 *           util.time
 *           util.deferred
 *           util.bigtable
 *           core.init
 *           core.log
 *           core.event
 *           core.dom
 *           core.browser
 *           common.String
 *           common.Array
 *           common.JSON
 *           core.token
 */

(function () {

	var _ = QQWB,

	    _b = _.bigtable,

		_l = _.log,

		_s = _.String,

		_br = _.browser,

		tokenReady,

		everythingReady,
		
		html5Implementation,

		flashAs3Implementation,
		
		setupHtml5Implementation,

		setupFlashAs3Implementation,

	    crossdomainImplementationError,

		crossdomainMethod;

	tokenReady = _b.put("boot", "tokenready", QQWB.door.door(function () {

        _l.info("tokenReady is locked");

    }, function () {

        _l.info("tokenReady is unlocked");

        tokenReady.isOpen() && _l.info("token is ready") && _.trigger(_b.get("nativeevent","tokenready"));

    }));

	everythingReady = _b.put("boot", "everythingready", QQWB.door.door(function () {

        _l.info("everythingReady is locked");

    }, function () {

        _l.info("everythingReady is unlocked");

        everythingReady.isOpen() && _l.info("everything is ready") && _.trigger(_b.get("nativeevent","everythingready"));

    }));

    tokenReady.lock(); // init must be called

    everythingReady.lock(); // token must be ready

    everythingReady.lock(); // document(DOM) must be ready
    
    _.bind(_b.get("nativeevent","tokenready"), function () {
        everythingReady.unlock(); // unlock for token ready
    });
    
	// post message implementation
	html5Implementation = function () {

		var _ = QQWB,

		    _l = _.log,

			_d = _.dom,

			_b = _.bigtable,

			p  = _b.get("uri","html5proxy"),

			sd =  _b.get("solution","deferred"),
			
			messageHandler;

		messageHandler = function (e) {

            if (p.indexOf(e.origin) !== 0) {

	            _l.warn("ignore a message from " + e.origin);

			} else {

				if (e.data === "success") {

                    QQWB.log.info("html5 solution was successfully initialized");

					sd.resolve();

                    if (window.addEventListener) {

                        window.removeEventListener("message", messageHandler, false);

                    } else if (window.attachEvent) {

                        window.detachEvent("onmessage", messageHandler);

                    }

                    messageHandler = null;

				} else {

	                _l.warn("ignore wired message from " + e.origin);

				}

			}
		};

		if (window.addEventListener) {

            window.addEventListener("message", messageHandler, false);

        } else if (window.attachEvent) {

            window.attachEvent("onmessage", messageHandler);

        }

		_d.ready(function () {

			var proxyframe,

			    id = "openjsframe_" + _.uid(5),

		    	onProxyLoad;

			_l.info ("init html5 solution ...");

			//@see http://www.cnblogs.com/demix/archive/2009/09/16/1567906.html
			//@see http://msdn.microsoft.com/en-us/library/ms535258(v=vs.85).aspx
			//@see http://msdn.microsoft.com/en-us/library/cc197055%28VS.85%29.aspx
			proxyframe = document.createElement("iframe");

			proxyframe.id = id;

			proxyframe.src = p;

			proxyframe.style.display = "none";

			onProxyLoad = function () { // timeout checker

			    setTimeout (function () {

					if (!sd.isResolved()) {

	        	        sd.reject(-6, "can't load proxy frame from path " + p + ",request timeout");

						_l.critical("proxy frame error");
					}

				}, 3 * 1000);

			}

            if (proxyframe.attachEvent){

                proxyframe.attachEvent("onload", onProxyLoad);

            } else {

                proxyframe.onload = onProxyLoad;

            }

			_b.put("solution", "frame", proxyframe);

			document.body.appendChild(proxyframe);

		});
	}; // end html5 postmessage implementation

	flashAs3Implementation = function () {
		
		var _ = QQWB,

		    _l = _.log,

			_b = _.bigtable,

			_br = _.browser,

			_d = _.dom,

			_f = _.flash,

			sd =  _b.get("solution","deferred"),

			p = _b.get("uri","flashas3proxy"),

			timer,

			undef;

		_d.ready ( function () {

			var invisible,

			    movie,

				id = "openjsflash_" + _.uid(5),

			    jscallbackname = _b.get("solution","jscallbackname");

	        _l.info ("init flash as3 solution ...");

			window[jscallbackname] = function () { // will be invoke when flash loaded

                 _l.info("flash solution initlized successfully");
				 
				 setTimeout(function () {

                     movie = window[id] || document.getElementById(id);

				     if (!movie) {

				         _l.critical("proxy movie insertion error, os " + _br.os.name + "; browser engine " + _br.engine +"; version " + _br.version);

				     } else {

				    	 _b.put("solution", "flashmovie", movie);

                         sd.resolve();

				     }

				 }, 0); // if don't use settimeout here, the swf can not load from cache under IE

                 timer && clearTimeout(timer);

				 try {

					 delete window[jscallbackname];

				 } catch (ex) {

				     window[jscallbackname] = undef;

				 }
			}

			invisible = document.createElement("div");

			invisible.style.width = "0px";

			invisible.style.height = "0px";

            invisible.style.position = "absolute";

            invisible.style.top = "-9999px";

			// logic borrowed from swfobject.js @see http://code.google.com/p/swfobject/

			if (_br.msie && _br.os.windows) {

				invisible.innerHTML = ['<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ', // classid IE only
				                       'id="' + id + '" ',
				                       'name="' + id + '">',
				                       '<param name="movie" value="' + p + '"></param>', // IE only
                                       '<param name="allowscriptaccess" value="always"></param>',
				                       '</object>'
				                      ].join("");

			} else {

				invisible.innerHTML = ['<object type= "application/x-shockwave-flash"',
				                       'id="' + id + '" ',
									   'data="' + p + '">',
                                       '<param name="allowscriptaccess" value="always"></param>',
				                       '</object>'
				                      ].join("");

			}


			document.body.appendChild(invisible);

		    timer =  setTimeout(function () {
            
                if (!sd.isResolved()) {
            
                    sd.reject(-6, "can't load proxy swf from " + p + ",request timeout");
            
					try {
					    document.body.removeChild(invisible);
				    } catch (ex) {}
                }
            
            }, 15 * 1000);
		});

	}; // end flash external interface solution


	setupHtml5Implementation = function () {

        html5Implementation ();

        _b.put("solution","name","html5");

	}; // end setupHtml5Implementation
	
	setupFlashAs3Implementation = function () {

        _l.info("flash player version " + _br.feature.flash.version);

        if (!_br.feature.flash.externalInterface) {
        
        	_l.warn("flash player too old, openjs may not work properly");

        }

        flashAs3Implementation ();

        _b.put("solution","name","as3");

	}; // end setupFlashAs3Implementation

	crossdomainImplementationError = function (msg) {

        var sd =  _b.get("solution","deferred");

        sd.reject(-6, msg);

	}; // crossdomainImplementationError

	// enviroment specified solution
	if (window["QQWBENVS"] && typeof QQWBENVS.CrossDomainMethod != "undefined") {

		_l.debug("read crossdomain method from enviroment variable");

        crossdomainMethod = _s.trim(QQWBENVS.CrossDomainMethod.toLowerCase());

		switch (crossdomainMethod) {

			case "postmessage":

			case "html5":

                if (_br.feature.postmessage) {

                    setupHtml5Implementation();

				} else {

                    _l.critical("can not setup enviroment specified solution " + QQWBENVS.CrossDomainMethod + ", please remove that enviroment variable");

		        	crossdomainImplementationError("postmessage solution can not be setted up");
				}

			break;

			case "flash":

			case "as3":

		    	if (_br.feature.flash) {

                    setupFlashAs3Implementation();

				} else {

                    _l.critical("can not setup enviroment specified solution " + QQWBENVS.CrossDomainMethod + ", please remove that enviroment variable");

		        	crossdomainImplementationError("flash as3 solution can not be setted up");

				}

			break;
		}

	// auto detect
	} else {

		_l.debug("detecting crossdomain method");

        if (_br.feature.postmessage) {

            setupHtml5Implementation();

        } else if (_br.feature.flash) {

            setupFlashAs3Implementation();

        } else {

            _l.critical("no solution available, switch to modern browser or install latest flash player, then refresh this page");

			crossdomainImplementationError("no solution available, need a modern browser or install lastest flash player");
        }
	}

}());

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

       _b.get("boot", "everythingready").unlock(); // unlock for document ready

       tokenIsReady = _b.get("boot", "tokenready").isOpen();

	   inited = _b.get("base","inited");

       // dom is ready but token not ready and not inited
	   // prompt to init
	   if (!tokenIsReady && !inited ) { 

		   _l.info("waiting for init ...");

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

// exhange token scheduler
(function () {

	var _ = QQWB,

	    _l = _.log,

		_c = _.cookie,

	    _b = _.bigtable,

        maintainTokenScheduler;

	function maintainTokenStatus () {

		var canMaintain = !!_._token.getAccessToken(), // user logged in set timer to exchange token

	      	waitingTime; // server accept to exchange token 30 seconds before actually expire date

        maintainTokenScheduler && _l.info("cancel the **OLD** maintain token schedule");

        maintainTokenScheduler && clearTimeout(maintainTokenScheduler);

		if (canMaintain) {

		    // server should accept to exchange token 30 seconds before actually expire date
	      	waitingTime = parseInt(_c.get(_b.get("cookie","accesstokenname")).split("|")[1],10)

	                      - _.time.now()

	                      - 15 * 1000 /*15 seconds ahead of actual expire date*/;

			_l.info("scheduled to exchange token after " + waitingTime + "ms");

			maintainTokenScheduler = setTimeout(function () {

				_._token.exchangeForToken(function () {

					maintainTokenStatus();

				});

			}, waitingTime);

		} else {

			maintainTokenScheduler && _l.info("cancel the exchange token schedule");

            maintainTokenScheduler && clearTimeout(maintainTokenScheduler);

		}
	}

	_.bind(_b.get("nativeevent","tokenready"),maintainTokenStatus);

	_.bind(_b.get("nativeevent","userloggedin"),maintainTokenStatus);

	_.bind(_b.get("nativeevent","userloginfailed"),maintainTokenStatus);

	_.bind(_b.get("nativeevent","userloggedout"),maintainTokenStatus);

}());
/**
 * Tencent weibo javascript library
 *
 * Server side runs
 *
 * @author michalliu
 * @version 1.0
 * @package builder
 * @module openjs
 * @includes core.api
 *           core.auth
 *           core.event
 *           core.ready
 *           core.boot
 *           core.ping
 *           util.template
 *           compat.localStorage
 *           ui.component
 */
