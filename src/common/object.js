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

	},

	isObject: function (test) {

		return Object.prototype.toString.call(test) == "[object Object]";

	}

});
