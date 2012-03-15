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
 *           common.String
 */

(function () {

var retError =  {
        "1": "参数错误",
        "2": "频率受限",
        "3": "鉴权失败",
        "4": "内部错误"
    },

    errorCode = {
        "4": "过多脏话",
        "5": "禁止访问",
        "6": "记录不存在",
        "8": "内容过长",
        "9": "内容包含垃圾信息",
        "10": "发表太快，频率限制",
        "11": "源消息不存在",
        "12": "未知错误",
        "13": "重复发表"
    };

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
            retErrorMsg = retError[optRetcode],
            retCodeErrorMsg = errorCode[optErrorcode];

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
}())
