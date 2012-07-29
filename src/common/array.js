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
     * Enumerate the array, The enumerate will stop of handler returns false
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
