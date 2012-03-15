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
 * @package core
 * @module man
 * @requires base
 */

QQWB.provide("man", function (api) {
	var desc;
	api = this.weibo.util.compat(api);
	desc = this.weibo.interface.getDescriptor(api);
    return  desc ? desc : "no such api";
});

