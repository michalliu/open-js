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
 *           util.bigtable
 *           compat.localStorage
 *           ui.component
 */

(function () {

	var openjscallbackname = QQWB.bigtable.get('openjs','asynccallbackfunctionname');

    if (typeof window[openjscallbackname] == "function") {
    
    	window[openjscallbackname](QQWB);
    
    }

}());

