/**
 * Tencent weibo javascript library
 *
 * API descriptor
 *
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module apiProvider
 * @requires base
 *           common.String
 */
QQWB.extend("_const", {
    HTTP_METHOD_GET: "GET",
    HTTP_METHOD_POST: "POST",
    HTTP_METHOD_GET_OR_POST: "GET | POST",
    API_CATEGORY_TIMELINE: "时间线",
    API_CATEGORY_WEIBO: "微博相关",
    API_CATEGORY_ACCOUNT: "账户相关",
    API_CATEGORY_RELATION: "关系链相关",
    API_CATEGORY_SIXIN: "私信相关",
    API_CATEGORY_SEARCH: "搜索相关",
    API_CATEGORY_TRENS: "热度趋势",
    API_CATEGORY_QUERY: "查看数据",
    API_CATEGORY_FAVORITE: "数据收藏",
    API_CATEGORY_TOPIC: "话题相关",
    API_CATEGORY_TAG: "标签相关",
    API_CATEGORY_OTHER: "其他",
    API_NO_DESCRIPTION: "暂时没有关于此参数的说明",
    API_NO_DEFAULT_VALUE: "",
    COMMON_NULL: null,
    COMMON_EMPTY_STRING: ""
});

QQWB.extend("_apiProvider", {
    // api error
    _apiRetError: {
        "1": "参数错误",
        "2": "频率受限",
        "3": "鉴权失败",
        "4": "内部错误"
    },
    _apiErrorCode: {
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
    /**
     * Parse ret code from server response
     *
     * @param text {String} server response contains retcode
     * @return retcode {Number} ret code
     */
    ,
    _apiParseRetCode: function (text) {
        var match = text.match(/\"ret\":(\d+)\}/) || text.match(/<ret>(\d+)<\/ret>/);
        return match ? parseInt(match[1], 10) : match;
    }
    /**
     * Parse error code from server response
     *
     * @param text {String} server response contains retcode
     * @return errorcode {Number} ret code
     */
    ,
    _apiParseErrorCode: function (text) {
        var match = text.match(/\"errcode\":(\d+)\}/) || text.match(/<errcode>(\d+)<\/errcode>/);
        return match ? parseInt(match[1], 10) : match;
    }
    /**
     * Convert retcode and error code to human reading messages
     */
    ,
    _apiGetErrorMessage: function (optRetcode, optErrorcode) {
        var msg = [],
            optRetcode = optRetcode + "",
            optErrorcode = optErrorcode + "",
            retErrorMsg = QQWB._apiProvider._apiRetError[optRetcode],
            retCodeErrorMsg = QQWB._apiProvider._apiErrorCode[optErrorcode];

        retErrorMsg && msg.push(retErrorMsg);
        retCodeErrorMsg && msg.push(retCodeErrorMsg);

        return msg.length > 0 ? msg.join(",") : "";
    }
    // api list
    ,
    apis: {
        "/statuses/home_timeline": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "主页时间线",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/public_timeline": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "广播大厅时间线",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pos: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/user_timeline": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "其他用户发表时间线",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/mentions_timeline": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "@提到我的时间线",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "0x1",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/ht_timeline": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "话题时间线",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                httext: {
                    defaultValue: "pBoard",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pageinfo: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/broadcast_timeline": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "我发表时间线",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/special_timeline": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "特别收听的人发表时间线",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/broadcast_timeline_ids": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "我发表时间线索引",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/home_timeline_ids": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "首页时间线索引",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/mentions_timeline_ids": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "提及我的时间线索引",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/user_timeline_ids": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "用户发表时间线索引",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/users_timeline": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "多用户发表时间线",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                names: {
                    defaultValue: "t,api_weibo",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/users_timeline_ids": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "多用户发表时间线索引",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                names: {
                    defaultValue: "t,api_weibo",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/area_timeline": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "同城发表时间线",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pos: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                country: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                province: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                city: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/ht_timeline_ext": {
            category: QQWB._const.API_CATEGORY_TIMELINE,
            description: "话题时间线(修复翻页问题)",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 10,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                flag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                httext: {
                    defaultValue: "iweibo",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                htid: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/show": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "获取一条微博数据",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                id: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/add": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "发表一条微博",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/del": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "删除一条微博",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                id: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/re_add": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "转播一条微博",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reid: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/reply": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "回复一条微博",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reid: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/add_pic": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "发表一条图片微博",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/re_count": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "转播数或点评数",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                ids: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                flag: {
                    defaultValue: "2",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/re_list": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "获取单条微博的转发和点评列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                flag: {
                    defaultValue: "2",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                rootid: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                twitterid: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/comment": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "点评一条微博",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reid: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/add_music": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "发表音频微博",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                url: {
                    defaultValue: "http://a.com/b.mp3",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                title: {
                    defaultValue: "歌名",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                author: {
                    defaultValue: "演唱者",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/add_video": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "发表视频微博",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "AR.Drone",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                url: {
                    defaultValue: "http://v.youku.com/v_show/id_XMjExODczODM2.html",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/getvideoinfo": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "获取视频信息",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                url: {
                    defaultValue: "http://v.youku.com/v_show/id_XMjExODczODM2.html",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/list": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "根据微博ID批量得到微博数据",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                ids: {
                    defaultValue: "39110101242147,39578069128701",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/t/sub_re_count": {
            category: QQWB._const.API_CATEGORY_WEIBO,
            description: "获取转播的再次转播数",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                ids: {
                    defaultValue: "8171051658365,55054116813124",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/user/info": {
            category: QQWB._const.API_CATEGORY_ACCOUNT,
            description: "获取自己的详细资料",
            supportMethod: QQWB._const.HTTP_METHOD_GET
        },
        "/user/update": {
            category: QQWB._const.API_CATEGORY_ACCOUNT,
            description: "更新个人资料",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                nick: {
                    defaultValue: "tester",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                sex: {
                    defaultValue: "1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                year: {
                    defaultValue: 2000,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                month: {
                    defaultValue: "1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                day: {
                    defaultValue: "1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                countrycode: {
                    defaultValue: 86,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                provincecode: {
                    defaultValue: 34,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                citycode: {
                    defaultValue: "0755",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                introduction: {
                    defaultValue: "i am ok.",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/user/update_head": {
            category: QQWB._const.API_CATEGORY_ACCOUNT,
            description: "更新个人资料头像",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                pic: {
                    defaultValue: "img",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/user/other_info": {
            category: QQWB._const.API_CATEGORY_ACCOUNT,
            description: "获取其他人资料",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/user/infos": {
            category: QQWB._const.API_CATEGORY_ACCOUNT,
            description: "多用户信息",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                names: {
                    defaultValue: "t,api_weibo",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/user/verify": {
            category: QQWB._const.API_CATEGORY_ACCOUNT,
            description: "验证账户是否合法（是否注册微博）",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/user/emotion": {
            category: QQWB._const.API_CATEGORY_ACCOUNT,
            description: "获取心情微博",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                id: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                timstamp: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                emotiontype: {
                    defaultValue: "0xFFFFFFFF",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 10,
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/fanslist": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "我的听众列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/idollist": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "我收听的人列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/blacklist": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "黑名单列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/speciallist": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "特别收听列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/add": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "收听某个用户",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/del": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "取消收听某个用户",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/addspecial": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "特别收听某个用户",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/delspecial": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "取消特别收听某个用户",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/addblacklist": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "添加某个用户到黑名单",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/delblacklist": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "从黑名单中删除某个用户",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/check": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "检查是否我的听众或收听的人",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                names: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                flag: {
                    defaultValue: "2",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/user_fanslist": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "其他账户听众列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 30,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/user_idollist": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "其他账户收听的人列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 30,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/user_speciallist": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "其他账户特别收听的人列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 30,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                name: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/fanslist_s": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "多听众列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 100,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/idollist_s": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "多收听人列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 100,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/friends/mutual_list": {
            category: QQWB._const.API_CATEGORY_RELATION,
            description: "互听关系链列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 30,
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/private/add": {
            category: QQWB._const.API_CATEGORY_SIXIN,
            description: "发私信",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                name: {
                    defaultValue: "t",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/private/del": {
            category: QQWB._const.API_CATEGORY_SIXIN,
            description: "删除一条私信",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                id: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/private/recv": {
            category: QQWB._const.API_CATEGORY_SIXIN,
            description: "收件箱",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/private/send": {
            category: QQWB._const.API_CATEGORY_SIXIN,
            description: "发件箱",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/search/user": {
            category: QQWB._const.API_CATEGORY_SEARCH,
            description: "搜索用户",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                keyword: {
                    defaultValue: "test",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagesize: {
                    defaultValue: 10,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                page: {
                    defaultValue: "1",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/search/t": {
            category: QQWB._const.API_CATEGORY_SEARCH,
            description: "搜索微博",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                keyword: {
                    defaultValue: "test",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagesize: {
                    defaultValue: 10,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                page: {
                    defaultValue: "1",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/search/userbytag": {
            category: QQWB._const.API_CATEGORY_SEARCH,
            description: "通过标签搜索用户",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                keyword: {
                    defaultValue: "test",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagesize: {
                    defaultValue: 10,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                page: {
                    defaultValue: "1",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/trends/ht": {
            category: QQWB._const.API_CATEGORY_TRENS,
            description: "话题热榜",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                type: {
                    defaultValue: "3",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pos: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/trends/t": {
            category: QQWB._const.API_CATEGORY_TRENS,
            description: "热门转播",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pos: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/info/update": {
            category: QQWB._const.API_CATEGORY_QUERY,
            description: "更新条数",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                op: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "9",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/fav/addt": {
            category: QQWB._const.API_CATEGORY_FAVORITE,
            description: "收藏一条微博",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                id: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/fav/delt": {
            category: QQWB._const.API_CATEGORY_FAVORITE,
            description: "取消收藏一条微博",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                id: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/fav/list_t": {
            category: QQWB._const.API_CATEGORY_FAVORITE,
            description: "收藏的微博列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                nexttime: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                prevtime: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/fav/addht": {
            category: QQWB._const.API_CATEGORY_FAVORITE,
            description: "订阅话题",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                id: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/fav/delht": {
            category: QQWB._const.API_CATEGORY_FAVORITE,
            description: "取消收藏话题",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                id: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/fav/list_ht": {
            category: QQWB._const.API_CATEGORY_FAVORITE,
            description: "获取已订阅话题列表",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 20,
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pageflag: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/ht/ids": {
            category: QQWB._const.API_CATEGORY_TOPIC,
            description: "根据话题名称查询话题ID",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                httexts: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/ht/info": {
            category: QQWB._const.API_CATEGORY_TOPIC,
            description: "根据话题ID获取话题相关微博",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                ids: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/tag/add": {
            category: QQWB._const.API_CATEGORY_TAG,
            description: "添加标签",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                tag: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/tag/del": {
            category: QQWB._const.API_CATEGORY_TAG,
            description: "删除标签",
            supportMethod: QQWB._const.HTTP_METHOD_POST,
            supportParams: {
                tagid: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/other/kownperson": {
            category: QQWB._const.API_CATEGORY_OTHER,
            description: "我可能认识的人",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                ip: {
                    defaultValue: "127.0.0.1",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                country_code: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                province_code: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                },
                city_code: {
                    defaultValue: "",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/other/kownperson": {
            category: QQWB._const.API_CATEGORY_OTHER,
            description: "可能认识的人",
            supportMethod: QQWB._const.HTTP_METHOD_GET
        },
        "/other/shorturl": {
            category: QQWB._const.API_CATEGORY_OTHER,
            description: "短URL转长URL",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                url: {
                    defaultValue: "3M6GSa",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/other/get_emotions": {
            category: QQWB._const.API_CATEGORY_OTHER,
            description: "获取表情接口",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                type: {
                    defaultValue: "0",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        },
        "/other/kownperson": {
            category: QQWB._const.API_CATEGORY_OTHER,
            description: "我可能认识的人",
            supportMethod: QQWB._const.HTTP_METHOD_GET,
            supportParams: {
                ip: {
                    defaultValue: "127.0.0.1",
                    description: QQWB._const.API_NO_DESCRIPTION
                }
            }
        }
    }
    /**
     * Get an api descriptor object
     *
     * @access public
     * @param apiInterface {String} the api interface
     * @return {Object} the descriptor object
     */
    ,
    getDescriptor: function (apiInterface) {
        return this.apis[apiInterface];
    }
    /**
     * Determine an api is in the api list or not
     *
     * @access public
     * @param apiInterface {String} the api interface
     * @return {Boolean}
     */
    ,
    isProvide: function (apiInterface) {
        return !!this.getDescriptor(apiInterface);
    }
    /**
     * Try to describe the api interface by human read-able format
     *
     * @access public
     * @param apiInterface {String} the api interface
     * @return {Boolean}
     */
    ,
    describe: function (apiInterface) {
        var descriptor = this.getDescriptor(apiInterface);
        if (descriptor) {
            return descriptor.category + ">" + descriptor.description;
        } else {
            return "";
        }
    }
    /**
     * Enhance the compatbility of input value
     *
     * @access public
     * @param apiInterface {String} the api interface
     * @return {String} the api interface
     */
    ,
    compat: function (apiInterface) {
        !QQWB.String.startsWith(apiInterface, "/") && (apiInterface = "/" + apiInterface);
        return apiInterface.toLowerCase();
    }
});
