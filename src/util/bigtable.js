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

               return optDefaultVal;

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
