/**
 * Tencent weibo javascript library
 *
 * Incode document
 *
 * Example:
 *
 * T.man("/Statuses/home_timeline");
 *
 * @author michalliu
 * @version 1.0
 * @package misc
 * @module man
 * @requires base
 *           weibo.interface
 *           weibo.util
 *           common.JSON
 */

QQWB.provide("man", function (api) {
	var descriptor = QQWB.weibo.interface.getDescriptor(QQWB.weibo.util.compat(api))
    return descriptor ? QQWB.JSON.stringify(descriptor) : "no such api";
});

