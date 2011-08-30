/**
 * Tencent weibo javascript library
 *
 * JSON manipulate
 *
 * @author michalliu
 * @version 1.0
 * @package ext
 * @module JSON
 * @requires base
 *           String
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
});
