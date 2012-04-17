/**
 * Tencent weibo javascript library
 *
 * DOM operations
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module bom
 * @requires base
 */

(function (undefined) {

	var updateViewPortSize = function () {

		var el = window,

            attr = 'inner',

		    mode = document.compatMode;

		if ( !('innerWidth' in el) ) {

			attr = 'client';

			el = mode == "BackCompat" ? document.body : document.documentElement;

		}

		return { width: el[attr+'Width'], height: el[attr+'Height'] };

	}

	QQWB.extend('bom', {

		/**
		 * get viewport size
		 * http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
		 *
		 * @access public
		 */
		viewport: function () {


		}
	});

}());
