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
