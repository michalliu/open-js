/**
 * Tencent javascript library
 *
 * API call
 *
 * If there is a problem when processing to meet the condition.
 * then the api call will failed too.
 *
 * @access public
 * @param api {String} the rest-style api interface
 * @param apiParams {Object} api params
 * @param optDataType {String} the dataType supports either "json","xml","text", case-insensitive, default is "json"
 * @param optType {String} the request method supports either "get","post", case-insensitive, default is "get"
 * @param optSolution {String} use solution by force @see QQWB.solution
 * @return {Object} promise object
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module api
 * @requires base
 *           core.deferred
 *           core.boot
 *           weibo.api
 *           qzone.api
 */

QQWB.provide("api", function (api, apiParams, optDataType, optType, optSolution) {
	var deferred =  QQWB.deferred.deferred();
	T.ready(function () { // this is to make sure QQWB.platform is inited
		switch(QQWB.platform) {
		    case QQWB.platforms.WEIBO:
		    	QQWB.weibo.api(api, apiParams, optDataType, optType, optSolution)
		    	.then(function () {
		    		deferred.resolveWith(deferred, arguments);
		         }, function () {
		    		deferred.rejectWith(deferred, arguments);
		         });
			break;
			case QQWB.platforms.QZONE:
		    	QQWB.qzone.api(api, apiParams, optDataType, optType, optSolution)
		    	.then(function () {
		    		deferred.resolveWith(deferred, arguments);
		         }, function () {
		    		deferred.rejectWith(deferred, arguments);
		         });
		    break;
			default:
			    deferred.reject(-1, "unsupported platform");
		}
	});
	return deferred.promise();
});
