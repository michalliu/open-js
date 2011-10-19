/**
 * Tencent weibo javascript library
 *
 * API descriptor
 *
 *
 * @author michalliu
 * @version 1.0
 * @package weibo
 * @module errors
 * @requires base
 */
QQWB.extend("weibo.errors", {
    retError: {
        "1": "参数错误",
        "2": "频率受限",
        "3": "鉴权失败",
        "4": "内部错误"
    },
    errorCode: {
        "4": "过多脏话",
        "5": "禁止访问",
        "6": "记录不存在",
        "8": "内容过长",
        "9": "内容包含垃圾信息",
        "10": "发表太快，频率限制",
        "11": "源消息不存在",
        "12": "未知错误",
        "13": "重复发表"
    }
});
