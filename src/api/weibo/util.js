/**
 * Tencent weibo javascript library
 *
 * API descriptor
 *
 *
 * @author michalliu
 * @version 1.0
 * @package weibo
 * @module util
 * @requires base
 *           errors
 *           common.String
 */
QQWB.extend("weibo.util", {
    /**
     * Parse ret code from server response
     *
     * @param text {String} server response contains retcode
     * @return retcode {Number} ret code
     */
    parseRetCode: function(text) {
        var match = text.match(/\"ret\":(\d+)\}/) || text.match(/<ret>(\d+)<\/ret>/);
        return match ? parseInt(match[1], 10) : match;
    }
    /**
     * Parse error code from server response
     *
     * @param text {String} server response contains retcode
     * @return errorcode {Number} ret code
     */
    ,parseErrorCode: function(text) {
        var match = text.match(/\"errcode\":(-?\d+)/) || text.match(/<errcode>(\d+)<\/errcode>/);
        return match ? parseInt(match[1], 10) : match;
    }
    /**
     * Convert retcode and error code to human reading messages
     */
    ,getErrorMessage: function(optRetcode, optErrorcode) {
        var msg = [],
            optRetcode = optRetcode + "",
            optErrorcode = optErrorcode + "",
            retErrorMsg = QQWB.weibo.errors.retError[optRetcode],
            retCodeErrorMsg = QQWB.weibo.errors.errorCode[optErrorcode];

        retErrorMsg && msg.push(retErrorMsg);
        retCodeErrorMsg && msg.push(retCodeErrorMsg);

        return msg.length > 0 ? msg.join(",") : "未知错误";
    }
    /**
     * Enhance the compatbility of input value
     *
     * @access public
     * @param apiInterface {String} the api interface
     * @return {String} the api interface
     */
    ,compat: function(apiInterface) {
        !QQWB.String.startsWith(apiInterface, "/") && (apiInterface = "/" + apiInterface);
        return apiInterface.toLowerCase();
    }
});
