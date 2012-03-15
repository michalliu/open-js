/**
 * Tencent weibo javascript library
 *
 * API descriptor
 *
 *
 * @author michalliu
 * @version 1.0
 * @package weibo
 * @module interface
 * @requires base
 *           common.String
 */

(function () {

var HTTP_METHOD_GET         =  "GET",
    HTTP_METHOD_POST        =  "POST",
    HTTP_METHOD_GET_OR_POST =  "GET | POST",
    API_CATEGORY_TIMELINE   =  "时间线",
    API_CATEGORY_WEIBO      =  "微博相关",
    API_CATEGORY_ACCOUNT    =  "账户相关",
    API_CATEGORY_RELATION   =  "关系链相关",
    API_CATEGORY_SIXIN      =  "私信相关",
    API_CATEGORY_SEARCH     =  "搜索相关",
    API_CATEGORY_TRENS      =  "热度趋势",
    API_CATEGORY_QUERY      =  "查看数据",
    API_CATEGORY_FAVORITE   =  "数据收藏",
    API_CATEGORY_TOPIC      =  "话题相关",
    API_CATEGORY_TAG        =  "标签相关",
    API_CATEGORY_OTHER      =  "其他",
    API_NO_DESCRIPTION      =  "暂时没有关于此参数的说明",
    API_NO_DEFAULT_VALUE    =  "",
    COMMON_NULL             =  null,
    COMMON_EMPTY_STRING     =  "";


QQWB.extend("weibo.interface", {
	// api name collection
    collection: {
        "/statuses/home_timeline": {
            category: API_CATEGORY_TIMELINE,
            description: "主页时间线",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/home_timeline_vip": {
            category: API_CATEGORY_TIMELINE,
            description: "vip用户时间线",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "2",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/public_timeline": {
            category: API_CATEGORY_TIMELINE,
            description: "广播大厅时间线",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pos: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/user_timeline": {
            category: API_CATEGORY_TIMELINE,
            description: "其他用户发表时间线",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/mentions_timeline": {
            category: API_CATEGORY_TIMELINE,
            description: "@提到我的时间线",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "0x1",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/ht_timeline": {
            category: API_CATEGORY_TIMELINE,
            description: "话题时间线",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                httext: {
                    defaultValue: "pBoard",
                    description: API_NO_DESCRIPTION
                },
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pageinfo: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/broadcast_timeline": {
            category: API_CATEGORY_TIMELINE,
            description: "我发表时间线",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/special_timeline": {
            category: API_CATEGORY_TIMELINE,
            description: "特别收听的人发表时间线",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/broadcast_timeline_ids": {
            category: API_CATEGORY_TIMELINE,
            description: "我发表时间线索引",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/home_timeline_ids": {
            category: API_CATEGORY_TIMELINE,
            description: "首页时间线索引",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/mentions_timeline_ids": {
            category: API_CATEGORY_TIMELINE,
            description: "提及我的时间线索引",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/user_timeline_ids": {
            category: API_CATEGORY_TIMELINE,
            description: "用户发表时间线索引",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/users_timeline": {
            category: API_CATEGORY_TIMELINE,
            description: "多用户发表时间线",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                names: {
                    defaultValue: "t,api_weibo",
                    description: API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/users_timeline_ids": {
            category: API_CATEGORY_TIMELINE,
            description: "多用户发表时间线索引",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                names: {
                    defaultValue: "t,api_weibo",
                    description: API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/area_timeline": {
            category: API_CATEGORY_TIMELINE,
            description: "同城发表时间线",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pos: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                country: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                },
                province: {
                    defaultValue: 11,
                    description: API_NO_DESCRIPTION
                },
                city: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/statuses/ht_timeline_ext": {
            category: API_CATEGORY_TIMELINE,
            description: "话题时间线(修复翻页问题)",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 10,
                    description: API_NO_DESCRIPTION
                },
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                flag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                httext: {
                    defaultValue: "iweibo",
                    description: API_NO_DESCRIPTION
                },
                htid: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/show": {
            category: API_CATEGORY_WEIBO,
            description: "获取一条微博数据",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                id: {
                    defaultValue: 51545056800467,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/add": {
            category: API_CATEGORY_WEIBO,
            description: "发表一条微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/del": {
            category: API_CATEGORY_WEIBO,
            description: "删除一条微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                id: {
                    defaultValue: 94035056272295,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/re_add": {
            category: API_CATEGORY_WEIBO,
            description: "转播一条微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                reid: {
                    defaultValue: 77048060858014,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/reply": {
            category: API_CATEGORY_WEIBO,
            description: "回复一条微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                reid: {
                    defaultValue: 77048060858014,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/add_pic": {
            category: API_CATEGORY_WEIBO,
            description: "发表一条图片微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                pic: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/add_emotion": {
            category: API_CATEGORY_WEIBO,
            description: "发表一条心情微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                signtype: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/re_count": {
            category: API_CATEGORY_WEIBO,
            description: "转播数或点评数",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                ids: {
                    defaultValue: 12704604231530709392,
                    description: API_NO_DESCRIPTION
                },
                flag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/re_list": {
            category: API_CATEGORY_WEIBO,
            description: "获取单条微博的转发和点评列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                flag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                rootid: {
                    defaultValue: 92035070199751,
                    description: API_NO_DESCRIPTION
                },
                pageflag: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: "2",
                    description: API_NO_DESCRIPTION
                },
                twitterid: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/comment": {
            category: API_CATEGORY_WEIBO,
            description: "点评一条微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                reid: {
                    defaultValue: 28135069067568,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/add_music": {
            category: API_CATEGORY_WEIBO,
            description: "发表音频微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                url: {
                    defaultValue: "http://url.cn",
                    description: API_NO_DESCRIPTION
                },
                title: {
                    defaultValue: "歌名",
                    description: API_NO_DESCRIPTION
                },
                author: {
                    defaultValue: "演唱者",
                    description: API_NO_DESCRIPTION
                },
                reid: {
                    defaultValue: 12345678,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/add_video": {
            category: API_CATEGORY_WEIBO,
            description: "发表视频微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                url: {
                    defaultValue: "http://url.cn",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/add_video": {
            category: API_CATEGORY_WEIBO,
            description: "发表视频微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                url: {
                    defaultValue: "http://url.cn",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/getvideoinfo": {
            category: API_CATEGORY_WEIBO,
            description: "获取视频信息",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                url: {
                    defaultValue: "http://v.youku.com/v_show/id_XMjExODczODM2.html",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/list": {
            category: API_CATEGORY_WEIBO,
            description: "根据微博ID批量得到微博数据",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                ids: {
                    defaultValue: "39110101242147,39578069128701",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/add_video_prev": {
            category: API_CATEGORY_WEIBO,
            description: "预发表一条视频微博",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                vid: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                title: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/t/sub_re_count": {
            category: API_CATEGORY_WEIBO,
            description: "获取转播的再次转播数",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                ids: {
                    defaultValue: "8171051658365,55054116813124",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/user/info": {
            category: API_CATEGORY_ACCOUNT,
            description: "获取自己的详细资料",
            supportMethod: HTTP_METHOD_GET
        },
        "/user/update": {
            category: API_CATEGORY_ACCOUNT,
            description: "更新个人资料",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                nick: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                sex: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                year: {
                    defaultValue: 2000,
                    description: API_NO_DESCRIPTION
                },
                month: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                },
                day: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                },
                countrycode: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                },
                provincecode: {
                    defaultValue: 11,
                    description: API_NO_DESCRIPTION
                },
                citycode: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                },
                introduction: {
                    defaultValue: "xxxx",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/user/update_edu": {
            category: API_CATEGORY_ACCOUNT,
            description: "更新个人教育信息",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                year: {
                    defaultValue: 1995,
                    description: API_NO_DESCRIPTION
                },
                level: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                },
                schoolid: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                },
                field: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                },
                departmentid: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/user/update_head": {
            category: API_CATEGORY_ACCOUNT,
            description: "更新个人资料头像",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                pic: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/user/other_info": {
            category: API_CATEGORY_ACCOUNT,
            description: "获取其他人资料",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/user/infos": {
            category: API_CATEGORY_ACCOUNT,
            description: "多用户信息",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                names: {
                    defaultValue: "t,api_weibo",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/user/verify": {
            category: API_CATEGORY_ACCOUNT,
            description: "验证账户是否合法（是否注册微博）",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/user/emotion": {
            category: API_CATEGORY_ACCOUNT,
            description: "获取心情微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                },
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                id: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                timstamp: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                contenttype: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                },
                accesslevel: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                emotiontype: {
                    defaultValue: "0xFFFFFFFF",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 10,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/fanslist": {
            category: API_CATEGORY_RELATION,
            description: "我的听众列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/idollist": {
            category: API_CATEGORY_RELATION,
            description: "我收听的人列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/blacklist": {
            category: API_CATEGORY_RELATION,
            description: "黑名单列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/speciallist": {
            category: API_CATEGORY_RELATION,
            description: "特别收听列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/add": {
            category: API_CATEGORY_RELATION,
            description: "收听某个用户",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/del": {
            category: API_CATEGORY_RELATION,
            description: "取消收听某个用户",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/addspecial": {
            category: API_CATEGORY_RELATION,
            description: "特别收听某个用户",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/delspecial": {
            category: API_CATEGORY_RELATION,
            description: "取消特别收听某个用户",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/addblacklist": {
            category: API_CATEGORY_RELATION,
            description: "添加某个用户到黑名单",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/delblacklist": {
            category: API_CATEGORY_RELATION,
            description: "从黑名单中删除某个用户",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/check": {
            category: API_CATEGORY_RELATION,
            description: "检查是否我的听众或收听的人",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                names: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                },
                flag: {
                    defaultValue: "2",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/user_fanslist": {
            category: API_CATEGORY_RELATION,
            description: "其他账户听众列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 30,
                    description: API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/user_idollist": {
            category: API_CATEGORY_RELATION,
            description: "其他账户收听的人列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 30,
                    description: API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/user_speciallist": {
            category: API_CATEGORY_RELATION,
            description: "其他账户特别收听的人列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 30,
                    description: API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                name: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/fanslist_s": {
            category: API_CATEGORY_RELATION,
            description: "多听众列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 100,
                    description: API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/idollist_s": {
            category: API_CATEGORY_RELATION,
            description: "多收听人列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 100,
                    description: API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/friends/mutual_list": {
            category: API_CATEGORY_RELATION,
            description: "互听关系链列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                name: {
                    defaultValue: "t",
                    description: API_NO_DESCRIPTION
                },
                startindex: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 30,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/private/add": {
            category: API_CATEGORY_SIXIN,
            description: "发私信",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                content: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                clientip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                },
                jing: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                wei: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                name: {
                    defaultValue: "mmplayer",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/private/del": {
            category: API_CATEGORY_SIXIN,
            description: "删除一条私信",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                id: {
                    defaultValue: 26154115313103,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/private/recv": {
            category: API_CATEGORY_SIXIN,
            description: "收件箱",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/private/send": {
            category: API_CATEGORY_SIXIN,
            description: "发件箱",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/search/user": {
            category: API_CATEGORY_SEARCH,
            description: "搜索用户",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                keyword: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                pagesize: {
                    defaultValue: 10,
                    description: API_NO_DESCRIPTION
                },
                page: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/search/t": {
            category: API_CATEGORY_SEARCH,
            description: "搜索微博",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                keyword: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                pagesize: {
                    defaultValue: 10,
                    description: API_NO_DESCRIPTION
                },
                page: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/search/userbytag": {
            category: API_CATEGORY_SEARCH,
            description: "通过标签搜索用户",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                keyword: {
                    defaultValue: "test",
                    description: API_NO_DESCRIPTION
                },
                pagesize: {
                    defaultValue: 10,
                    description: API_NO_DESCRIPTION
                },
                page: {
                    defaultValue: "1",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/trends/ht": {
            category: API_CATEGORY_TRENS,
            description: "话题热榜",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                type: {
                    defaultValue: "3",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                pos: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/trends/t": {
            category: API_CATEGORY_TRENS,
            description: "热门转播",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                pos: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/info/update": {
            category: API_CATEGORY_QUERY,
            description: "更新条数",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                op: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                type: {
                    defaultValue: "9",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/fav/addt": {
            category: API_CATEGORY_FAVORITE,
            description: "收藏一条微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                id: {
                    defaultValue: 123456789,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/fav/delt": {
            category: API_CATEGORY_FAVORITE,
            description: "取消收藏一条微博",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                id: {
                    defaultValue: 123456789,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/fav/list_t": {
            category: API_CATEGORY_FAVORITE,
            description: "收藏的微博列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                nexttime: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                prevtime: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/fav/addht": {
            category: API_CATEGORY_FAVORITE,
            description: "订阅话题",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                id: {
                    defaultValue: 123456789,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/fav/delht": {
            category: API_CATEGORY_FAVORITE,
            description: "取消收藏话题",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                id: {
                    defaultValue: 123456789,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/fav/list_ht": {
            category: API_CATEGORY_FAVORITE,
            description: "获取已订阅话题列表",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                reqnum: {
                    defaultValue: 20,
                    description: API_NO_DESCRIPTION
                },
                pageflag: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                pagetime: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                },
                lastid: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/ht/ids": {
            category: API_CATEGORY_TOPIC,
            description: "根据话题名称查询话题ID",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                httexts: {
                    defaultValue: "abc,efg",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/ht/info": {
            category: API_CATEGORY_TOPIC,
            description: "根据话题ID获取话题相关微博",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                ids: {
                    defaultValue: 12704604231530709392,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/tag/add": {
            category: API_CATEGORY_TAG,
            description: "添加标签",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                tag: {
                    defaultValue: "snow",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/tag/del": {
            category: API_CATEGORY_TAG,
            description: "删除标签",
            supportMethod: HTTP_METHOD_POST,
            supportParams: {
                tagid: {
                    defaultValue: 5131240618185167659,
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/other/kownperson": {
            category: API_CATEGORY_OTHER,
            description: "我可能认识的人",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                ip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                },
                country_code: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                province_code: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                },
                city_code: {
                    defaultValue: "",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/other/kownperson": {
            category: API_CATEGORY_OTHER,
            description: "可能认识的人",
            supportMethod: HTTP_METHOD_GET
        },
        "/other/shorturl": {
            category: API_CATEGORY_OTHER,
            description: "短URL转长URL",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                url: {
                    defaultValue: "3M6GSa",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/other/get_emotions": {
            category: API_CATEGORY_OTHER,
            description: "获取表情接口",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                type: {
                    defaultValue: "0",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/other/kownperson": {
            category: API_CATEGORY_OTHER,
            description: "我可能认识的人",
            supportMethod: HTTP_METHOD_GET,
            supportParams: {
                ip: {
                    defaultValue: "127.0.0.1",
                    description: API_NO_DESCRIPTION
                }
            }
        },
        "/other/videokey": {
            category: API_CATEGORY_OTHER,
            description: "获取视频上传的key",
            supportMethod: HTTP_METHOD_GET
        },
        "/other/gettopreadd": {
            category: API_CATEGORY_OTHER,
            description: "一键转播热门排行",
            supportMethod: HTTP_METHOD_GET
        },
        "/other/url_converge": {
            category: API_CATEGORY_OTHER,
            description: "短url聚合",
            supportMethod: HTTP_METHOD_GET
        }
    }
    /**
     * Get an api descriptor object
     *
     * @access public
     * @param apiInterface {String} the api interface
     * @return {Object} the descriptor object
     */
    ,getDescriptor: function(apiInterface) {
        return QQWB.weibo.interface.collection[apiInterface];
    }
    /**
     * Determine an api is in the api list or not
     *
     * @access public
     * @param apiInterface {String} the api interface
     * @return {Boolean}
     */
    ,isProvide: function(apiInterface) {
        return !!QQWB.weibo.interface.getDescriptor(apiInterface);
    }
    /**
     * Try to describe the api interface by human read-able format
     *
     * @access public
     * @param apiInterface {String} the api interface
     * @return {Boolean}
     */
    ,describe: function(apiInterface) {
        var descriptor = QQWB.weibo.interface.getDescriptor(apiInterface);
        if (descriptor) {
            return descriptor.category + ">" + descriptor.description;
        } else {
            return "";
        }
    }
});

}());
