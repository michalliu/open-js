/**
 * Tencent weibo javascript library
 *
 * Querystring encoder and decoder
 *
 * @author michalliu
 * @version 1.0
 * @package core
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
        var 
            regexp = /%20/g,
            sep = opt_sep || '&',
            encode = opt_encode || encodeURIComponent,
            pairs = [],
			filtered = {};

        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var val = params[key];
                if (val !== null && typeof val != 'undefined') {
					if (!opt_filter) {
                        pairs.push(encode(key).replace(regexp,"+") + "=" + encode(val).replace(regexp,"+"));
					} else {
						for (var i=0,l=opt_filter.length;i<l;i++) {
							if (opt_filter[i] === encode(key).replace(regexp,"+")) {
								pairs[i] = opt_filter[i] + "=" + encode(val).replace(regexp,"+");
							} else {
                                filtered[i] = true;
							}
						} // end opt_filter loop
					} // end opt_filter
                } // end val
            } // end hasOwnProperty
        } // end loop

		for (var j in filtered) {
            if (filtered.hasOwnProperty(j)) {
			    pairs.splice(parseInt(j,10),1);
			}
		}
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
       var
           decode = opt_decode || decodeURIComponent,
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
