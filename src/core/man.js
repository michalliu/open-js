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
 *           apiProvider
 *           common.JSON
 */

QQWB.provide("man", function (api) {
	api = this._apiProvider.compat(api);
    return this._apiProvider.getDescriptor(api) ? QQWB.JSON.stringify(this._apiProvider.getDescriptor(api)) : "no such api";
});

