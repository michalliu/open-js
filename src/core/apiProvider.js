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
 *           static
 *           common.String
 */
QQWB.extend("_apiProvider", {
	// api error
	apiError: {
		httpHeaderFlag: /X-APIErrorCode:\s+(\d+)/
	   ,"1": "参数错误"
	   ,"2": "频率受限"
	   ,"3": "鉴权失败"
	   ,"4": "内部错误"
	}
    // api list
   ,apis: {
        "/statuses/home_timeline": {
            category: "时间线",
            description: "主页时间线",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/public_timeline": {
            category: "时间线",
            description: "广播大厅时间线",
            supportMethod: "get",
            supportParams: {
                pos: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/user_timeline": {
            category: "时间线",
            description: "其他用户发表时间线",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: "t",
                    description: QQWB._static.NO_DESCRIPTION
                },
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/mentions_timeline": {
            category: "时间线",
            description: "@提到我的时间线",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/ht_timeline": {
            category: "时间线",
            description: "话题时间线",
            supportMethod: "post",
            supportParams: {
                httext: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pageflag: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                pageinfo: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/broadcast_timeline": {
            category: "时间线",
            description: "我发表时间线",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/special_timeline": {
            category: "时间线",
            description: "特别收听的人发表时间线",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/broadcast_timeline_ids": {
            category: "时间线",
            description: "我发表时间线索引",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                type: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                contenttype: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                accesslevel: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/home_timeline_ids": {
            category: "时间线",
            description: "首页时间线索引",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                type: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                contenttype: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                accesslevel: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/mentions_timeline_ids": {
            category: "时间线",
            description: "提及我的时间线索引",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                type: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                contenttype: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                accesslevel: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/user_timeline_ids": {
            category: "时间线",
            description: "用户发表时间线索引",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: "t",
                    description: QQWB._static.NO_DESCRIPTION
                },
                name: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                type: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                contenttype: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                accesslevel: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/users_timeline": {
            category: "时间线",
            description: "多用户发表时间线",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: "t,api_weibo",
                    description: QQWB._static.NO_DESCRIPTION
                },
                names: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                type: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                contenttype: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                accesslevel: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/users_timeline_ids": {
            category: "时间线",
            description: "多用户发表时间线索引",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: "t,api_weibo",
                    description: QQWB._static.NO_DESCRIPTION
                },
                names: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                type: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                contenttype: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                accesslevel: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/statuses/area_timeline": {
            category: "时间线",
            description: "同城发表时间线",
            supportMethod: "get",
            supportParams: {
                pos: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                country: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                province: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                city: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/show": {
            category: "微博相关",
            description: "获取一条微博数据",
            supportMethod: "get",
            supportParams: {
                id: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/add": {
            category: "微博相关",
            description: "发表一条微博",
            supportMethod: "post",
            supportParams: {
                content: {
                    defalutValue: "127.0.0.1",
                    description: QQWB._static.NO_DESCRIPTION
                },
                clientip: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                jing: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                wei: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/del": {
            category: "微博相关",
            description: "删除一条微博",
            supportMethod: "post",
            supportParams: {
                id: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/re_add": {
            category: "微博相关",
            description: "转播一条微博",
            supportMethod: "post",
            supportParams: {
                content: {
                    defalutValue: "127.0.0.1",
                    description: QQWB._static.NO_DESCRIPTION
                },
                clientip: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                jing: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                wei: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                reid: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/reply": {
            category: "微博相关",
            description: "回复一条微博",
            supportMethod: "post",
            supportParams: {
                content: {
                    defalutValue: "127.0.0.1",
                    description: QQWB._static.NO_DESCRIPTION
                },
                clientip: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                jing: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                wei: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                reid: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/add_pic": {
            category: "微博相关",
            description: "发表一条图片微博",
            supportMethod: "post",
            supportParams: {
                content: {
                    defalutValue: "127.0.0.1",
                    description: QQWB._static.NO_DESCRIPTION
                },
                clientip: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                jing: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                wei: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/re_count": {
            category: "微博相关",
            description: "转播数或点评数",
            supportMethod: "post",
            supportParams: {
                ids: {
                    defalutValue: 2,
                    description: QQWB._static.NO_DESCRIPTION
                },
                flag: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/re_list": {
            category: "微博相关",
            description: "获取单条微博的转发和点评列表",
            supportMethod: "get",
            supportParams: {
                flag: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                rootid: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pageflag: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                twitterid: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/comment": {
            category: "微博相关",
            description: "点评一条微博",
            supportMethod: "post",
            supportParams: {
                content: {
                    defalutValue: "127.0.0.1",
                    description: QQWB._static.NO_DESCRIPTION
                },
                clientip: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                jing: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                wei: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                reid: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/add_music": {
            category: "微博相关",
            description: "发表音频微博",
            supportMethod: "post",
            supportParams: {
                content: {
                    defalutValue: "127.0.0.1",
                    description: QQWB._static.NO_DESCRIPTION
                },
                clientip: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                jing: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                wei: {
                    defalutValue: "http://a.com/b.mp3",
                    description: QQWB._static.NO_DESCRIPTION
                },
                url: {
                    defalutValue: "歌名",
                    description: QQWB._static.NO_DESCRIPTION
                },
                title: {
                    defalutValue: "演唱者",
                    description: QQWB._static.NO_DESCRIPTION
                },
                author: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/add_video": {
            category: "微博相关",
            description: "发表视频微博",
            supportMethod: "post",
            supportParams: {
                content: {
                    defalutValue: "127.0.0.1",
                    description: QQWB._static.NO_DESCRIPTION
                },
                clientip: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                jing: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                wei: {
                    defalutValue: "http://v.youku.com/v_show/id_XMjExODczODM2.html",
                    description: QQWB._static.NO_DESCRIPTION
                },
                url: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/getvideoinfo": {
            category: "微博相关",
            description: "获取视频信息",
            supportMethod: "post",
            supportParams: {
                url: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/t/list": {
            category: "微博相关",
            description: "根据微博ID批量得到微博数据",
            supportMethod: "get",
            supportParams: {
                ids: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/user/info": {
            category: "账户相关",
            description: "获取自己的详细资料",
            supportMethod: "get"
        },
        "/user/update": {
            category: "账户相关",
            description: "更新个人资料",
            supportMethod: "post",
            supportParams: {
                nick: {
                    defalutValue: 1,
                    description: QQWB._static.NO_DESCRIPTION
                },
                sex: {
                    defalutValue: 2000,
                    description: QQWB._static.NO_DESCRIPTION
                },
                year: {
                    defalutValue: 1,
                    description: QQWB._static.NO_DESCRIPTION
                },
                month: {
                    defalutValue: 1,
                    description: QQWB._static.NO_DESCRIPTION
                },
                day: {
                    defalutValue: 86,
                    description: QQWB._static.NO_DESCRIPTION
                },
                countrycode: {
                    defalutValue: 34,
                    description: QQWB._static.NO_DESCRIPTION
                },
                provincecode: {
                    defalutValue: "0755",
                    description: QQWB._static.NO_DESCRIPTION
                },
                citycode: {
                    defalutValue: "i am ok.",
                    description: QQWB._static.NO_DESCRIPTION
                },
                introduction: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/user/update_head": {
            category: "账户相关",
            description: "更新个人资料头像",
            supportMethod: "post",
            supportParams: {
                pic: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/user/other_info": {
            category: "账户相关",
            description: "获取其他人资料",
            supportMethod: "get",
            supportParams: {
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/user/infos": {
            category: "账户相关",
            description: "多用户信息",
            supportMethod: "post",
            supportParams: {
                names: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/user/verify": {
            category: "账户相关",
            description: "验证账户是否合法（是否注册微博）",
            supportMethod: "post",
            supportParams: {
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/fanslist": {
            category: "关系链相关",
            description: "我的听众列表",
            supportMethod: "get",
            supportParams: {
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                startindex: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/idollist": {
            category: "关系链相关",
            description: "我收听的人列表",
            supportMethod: "get",
            supportParams: {
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                startindex: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/blacklist": {
            category: "关系链相关",
            description: "黑名单列表",
            supportMethod: "get",
            supportParams: {
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                startindex: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/speciallist": {
            category: "关系链相关",
            description: "特别收听列表",
            supportMethod: "get",
            supportParams: {
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                startindex: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/add": {
            category: "关系链相关",
            description: "收听某个用户",
            supportMethod: "post",
            supportParams: {
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/del": {
            category: "关系链相关",
            description: "取消收听某个用户",
            supportMethod: "post",
            supportParams: {
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/addspecial": {
            category: "关系链相关",
            description: "特别收听某个用户",
            supportMethod: "post",
            supportParams: {
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/delspecial": {
            category: "关系链相关",
            description: "取消特别收听某个用户",
            supportMethod: "post",
            supportParams: {
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/addblacklist": {
            category: "关系链相关",
            description: "添加某个用户到黑名单",
            supportMethod: "post",
            supportParams: {
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/delblacklist": {
            category: "关系链相关",
            description: "从黑名单中删除某个用户",
            supportMethod: "post",
            supportParams: {
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/check": {
            category: "关系链相关",
            description: "检查是否我的听众或收听的人",
            supportMethod: "get",
            supportParams: {
                names: {
                    defalutValue: 2,
                    description: QQWB._static.NO_DESCRIPTION
                },
                flag: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/user_fanslist": {
            category: "关系链相关",
            description: "其他账户听众列表",
            supportMethod: "get",
            supportParams: {
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                startindex: {
                    defalutValue: "t",
                    description: QQWB._static.NO_DESCRIPTION
                },
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/user_idollist": {
            category: "关系链相关",
            description: "其他账户收听的人列表",
            supportMethod: "get",
            supportParams: {
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                startindex: {
                    defalutValue: "t",
                    description: QQWB._static.NO_DESCRIPTION
                },
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/user_speciallist": {
            category: "关系链相关",
            description: "其他账户特别收听的人列表",
            supportMethod: "get",
            supportParams: {
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                startindex: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/fanslist_s": {
            category: "关系链相关",
            description: "多听众列表",
            supportMethod: "get",
            supportParams: {
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                startindex: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/friends/idollist_s": {
            category: "关系链相关",
            description: "多收听人列表",
            supportMethod: "get",
            supportParams: {
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                startindex: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/private/add": {
            category: "私信相关",
            description: "发私信",
            supportMethod: "post",
            supportParams: {
                content: {
                    defalutValue: "127.0.0.1",
                    description: QQWB._static.NO_DESCRIPTION
                },
                clientip: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                jing: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                wei: {
                    defalutValue: "t",
                    description: QQWB._static.NO_DESCRIPTION
                },
                name: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/private/del": {
            category: "私信相关",
            description: "删除一条私信",
            supportMethod: "post",
            supportParams: {
                id: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/private/recv": {
            category: "私信相关",
            description: "收件箱",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/private/send": {
            category: "私信相关",
            description: "发件箱",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/search/user": {
            category: "搜索相关",
            description: "搜索用户",
            supportMethod: "get",
            supportParams: {
                keyword: {
                    defalutValue: 10,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagesize: {
                    defalutValue: 1,
                    description: QQWB._static.NO_DESCRIPTION
                },
                page: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/search/t": {
            category: "搜索相关",
            description: "搜索微博",
            supportMethod: "get",
            supportParams: {
                keyword: {
                    defalutValue: 10,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagesize: {
                    defalutValue: 1,
                    description: QQWB._static.NO_DESCRIPTION
                },
                page: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/search/userbytag": {
            category: "搜索相关",
            description: "通过标签搜索用户",
            supportMethod: "get",
            supportParams: {
                keyword: {
                    defalutValue: 10,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagesize: {
                    defalutValue: 1,
                    description: QQWB._static.NO_DESCRIPTION
                },
                page: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/trends/ht": {
            category: "热度趋势",
            description: "话题热榜",
            supportMethod: "get",
            supportParams: {
                type: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pos: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/trends/t": {
            category: "热度趋势",
            description: "热门转播",
            supportMethod: "get",
            supportParams: {
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pos: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/info/update": {
            category: "查看数据",
            description: "更新条数",
            supportMethod: "get",
            supportParams: {
                op: {
                    defalutValue: 9,
                    description: QQWB._static.NO_DESCRIPTION
                },
                type: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/fav/addt": {
            category: "数据收藏",
            description: "收藏一条微博",
            supportMethod: "post",
            supportParams: {
                id: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/fav/delt": {
            category: "数据收藏",
            description: "取消收藏一条微博",
            supportMethod: "post",
            supportParams: {
                id: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/fav/list_t": {
            category: "数据收藏",
            description: "收藏的微博列表",
            supportMethod: "get",
            supportParams: {
                pageflag: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                nexttime: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                prevtime: {
                    defalutValue: 20,
                    description: QQWB._static.NO_DESCRIPTION
                },
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/fav/addht": {
            category: "数据收藏",
            description: "订阅话题",
            supportMethod: "post",
            supportParams: {
                id: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/fav/delht": {
            category: "数据收藏",
            description: "取消收藏话题",
            supportMethod: "post",
            supportParams: {
                id: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/fav/list_ht": {
            category: "数据收藏",
            description: "获取已订阅话题列表",
            supportMethod: "get",
            supportParams: {
                reqnum: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pageflag: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                pagetime: {
                    defalutValue: 0,
                    description: QQWB._static.NO_DESCRIPTION
                },
                lastid: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/ht/ids": {
            category: "话题相关",
            description: "根据话题名称查询话题ID",
            supportMethod: "get",
            supportParams: {
                httexts: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/ht/info": {
            category: "话题相关",
            description: "根据话题ID获取话题相关微博",
            supportMethod: "get",
            supportParams: {
                ids: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/tag/add": {
            category: "标签相关",
            description: "添加标签",
            supportMethod: "post",
            supportParams: {
                tag: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/tag/del": {
            category: "标签相关",
            description: "删除标签",
            supportMethod: "post",
            supportParams: {
                tagid: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/other/kownperson": {
            category: "其他",
            description: "我可能认识的人",
            supportMethod: "get",
            supportParams: {
                ip: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                country_code: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                province_code: {
                    defalutValue: "",
                    description: QQWB._static.NO_DESCRIPTION
                },
                city_code: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/other/kownperson": {
            category: "其他",
            description: "可能认识的人",
            supportMethod: "get"
        },
        "/other/shorturl": {
            category: "其他",
            description: "短URL转长URL",
            supportMethod: "get",
            supportParams: {
                url: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
                }
            }
        },
        "/other/get_emtions": {
            category: "其他",
            description: "获取表情接口",
            supportMethod: "get",
            supportParams: {
                type: {
                    defalutValue: QQWB._static.NO_DEFAULT_VALUE,
                    description: QQWB._static.NO_DESCRIPTION
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
   ,getDescriptor: function (apiInterface) {
        return this.apis[apiInterface];
    }
    /**
     * Determine an api is in the api list or not
     *
     * @access public
     * @param apiInterface {String} the api interface
     * @return {Boolean}
     */
   ,isProvide: function (apiInterface) {
        return !!this.getDescriptor(apiInterface);
    }
    /**
     * Try to describe the api interface by human read-able format
     *
     * @access public
     * @param apiInterface {String} the api interface
     * @return {Boolean}
     */
   ,describe: function (apiInterface) {
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
   ,compat: function (apiInterface) {
    	!QQWB.String.startsWith(apiInterface,"/") && (apiInterface = "/" + apiInterface);
        return apiInterface.toLowerCase();
    }
});
