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
 *           ext.JSON
 */

QQWB.provide("man", function (api) {
    return this._apiProvider.getDescriptor(api) ? QQWB.JSON.toString(this._apiProvider.getDescriptor(api)) : "no such api";
});

