/**
 * Tencent weibo javascript library
 *
 * API descriptor
 *
 *
 * @author michalliu
 * @version 1.0
 * @package qzone
 * @module util
 * @requires base
 *           common.String
 */
QQWB.extend("qzone.util", {
    compat: function(apiInterface) {
        QQWB.String.startsWith(apiInterface, "/") && (apiInterface = apiInterface.substr(1));
        return apiInterface.toLowerCase();
    }
});
