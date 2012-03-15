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
