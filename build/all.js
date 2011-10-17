/**
 * Tencent weibo javascript library
 *
 * Provide the namespace with some core methods
 *
 * @author michalliu
 * @version 1.0
 * @module base
 */

/**
 * Constructor of SDK's error object
 *
 * Usage:
 *
 * throw QQWBError("message")
 *
 * @access public
 *
 * function QQWBError(message) {
 *     this.message = message;
 *     this.stack = (new Error()).stack;
 * }
 * 
 * QQWBError.prototype = new Error;
 * QQWBError.prototype.name = "QQWBError";
 */

// base file
(function () {

    var 
        twb, // the internal namespace object
        originalT = window.T; // get a reference of window's T

    var 
        protocol = "http";          // server protocol
          scheme = protocol + "://", // server scheme
            host = "open.t.qq.com",  // server host

    // Core base object
    twb = {

        /**
         * Human readable name for this sdk
         *
         * Used for debug propose
         *
         * @access public
         */
        name: "Tencent weibo SDK"

		/**
		 * SDK version
		 */
	   ,version: "1.0"

		/**
		 * Client appkey configuration object
		 */
	   ,appkey: {
		   /**
			* Client appkey
			*/
		   value: "{APPKEY}"
		   /**
			* Appkey version
			* -1 not determined
			* 1 oauth 1.0
			* 2 oauth 2.0
			*/
		  ,version: "{APPKEY_VERSION}"
          /**
           * Indicate appkey is valid or not
           *
           * Is the http referer matched with the url registered by this appkey?
           * If appkey is not verified,you may not use this sdk
		   *
           */
		  ,verified: "{APPKEY_VERIFIED}" === "verified"
	    }
        /**
         * Debug mode
         *
         * Speak pointless babble
         *
         * @access public
         */
       ,debug: true
	   /**
		* send pingback to our server, help us to improve this SDK
		*/
	   ,pingback: true

        /**
         * Domain configration
         *
         * @access private
         */
       ,_domain: {
                   api : scheme + host + "{API_URI}"
          ,       auth : scheme + host + "{AUTH_URI}"
          ,      query : scheme + host +  "{QUERY_TOKEN_URI}"
          ,   exchange : scheme + host +  "{EXCHANGE_TOKEN_URI}"
          , flashproxy : scheme + host +  "{FLASHPROXY_URI}"     // server flash proxy
          ,serverproxy : scheme + host +  "{SERVERPROXY_URI}"    // server html proxy
          ,clientproxy : "{CLIENTPROXY_URI}" // autheciation redirect uri
          //,cdn: "{CDN_URI}"
        }
		/*
		 * global vars 
		 */
	   ,_const: {
		   AUTH_WINDOW_NAME: "authClientProxy_ee5a0f93"
		  ,AUTH_WINDOW_WIDTH: 575
		  ,AUTH_WINDOW_HEIGHT: 465
	    }
        /**
         * Cookie configration
         *
         * @access private
         */
       ,_cookie: {
           names: {
               accessToken: "QQWBToken"
              ,refreshToken: "QQWBRefreshToken"
           }
          ,path: "/"
          ,domain: ""
        }
        /**
         * Rollback window's T to its original value
         *
         * @access public
         * @return {Object} The internal twb object
         */
       ,noConflict: function () {
           originalT && (window.T = originalT);
           return twb;
       }

        /**
         * Copy things from source into target
         *
         * @access public
         * @return {Object} The *modified* target object
         */
       ,copy: function (target, source, overwrite, transform) {
           for (var key in source) {
               if (overwrite || typeof target[key] === "undefined") {
                   target[key] = transform ? transform(source[key]) : source[key];
               }
           }
           return target;
       }

        /**
         * Create sub namespace
         *
         * @access public
         * @return {Object} The created object 
         */
       ,create: function (name, value) {
           var 
               node = this, // this is our root namespace
               nameParts = name ? name.split(".") : [],
               c = nameParts.length;
           for (var i=0; i<c; i++) {
               var
                   part = nameParts[i],
                   nso = node[part];
               if (!nso) {
                   nso = (value && i + 1 === c) ? value : {};
                   node[part] = nso;
               }
               node = nso;
           }
           return node;
       }

        /**
         * Extends root namespace and create sub namespace if needs
         *
         * @access public
         * @return {Object} The *modified* target
         */
       ,extend: function (target, source, overwrite) {
           return twb.copy(
               typeof target === 'string' ? twb.create.call(this, target) : target
              ,source
              ,overwrite
           );
       }

       /**
        * Alias names
        *
        * @access private
        * @param alias {String|Array} aliased name(s)
        * @param origin {Object} the object to alias
        * @return {Void}
        */
       ,_alias: function (alias, origin) {
           origin = origin || twb;
           if(typeof alias === 'string') {
               this[alias] = origin;
           } else if (Object.prototype.toString.call(alias) === "[object Array]") {
               for (var i=0,l=alias.length;i<l;i++) {
                   this[alias[i]] = origin;
               }
           }
       }

       /**
        * Alias names for twb
        *
        * @deprecated not recommended
        * @access public
		* @param alias {String|Array} aliased name(s)
		* @param origin {String} things under QQWB
        * @return {Void}
        */
       ,alias: function (alias, origin) {
           twb._alias(alias, twb[origin]);
       }

       /**
        * Assign template vars with value
        *
        * Usage:
        *
        * 1). replace T.appkey from "{APPKEY}" to "123456"
        *     T.assign("appkey","APPKEY","123456")
        * 
        * 2). search in namespace T replace all from "{APPKEY}" to "123456"
        *     T.assign("","APPKEY","123456")
        *
        * 3). replace T.test.appkey from "{APPKEY}" to "123456"
        *     T.assign("test.appkey","APPKEY","123456")
        * 
        * 4). search in namespace T.test replace all from "{APPKEY}" to "123456"
        *     T.assign("test","APPKEY","123456")
        *
        * @deprecated render template vars by js
        * @access public
        * @param name {String} namespace
        * @param replace {String} template vars
        * @param value {String} replaced value
        * @return {Void}
        * @throws {Error}
        */
       ,assign: function (name, key, value) {
            var
                node = this,
                lastNode = node,
                nameParts = name ? name.split(".") : [],
                c = nameParts.length;

            for (var i=0; i<c; i++) {
                var
                    part = nameParts[i],
                    nso = node[part];
                if (!nso) { // should we use break here?
                    throw new Error("Tencent weibo SDK: [ERROR] no such name " + part);
                }
                lastNode = node;
                node = nso;
            }

            // node is either value of name or namespace
            if (typeof node === "string") { // value goes here
                lastNode[part] = node.replace(new RegExp("\\{" + key + "\\}","ig"),value);
            } else if (typeof node === "object") { // namespace object goes here
                for (var prop in node) {
                    if (node.hasOwnProperty(prop) && typeof node[prop] === "string") {
                        node[prop] = node[prop].replace(new RegExp("\\{" + key + "\\}","ig"),value);
                    }
                }
            }
       }

        /**
         * Generate a random id
         *
         * @access public
         * @return {String} The ramdom ID
         */
       ,uid: function () {
           return Math.random().toString(16).substr(2);
       }

    };

    // alternative names for interal function
    twb.alias('provide','create'); // provide a specific function
    
    // expose variable
    twb._alias.call(window,["QQWB","T"],twb); // we probably should only export one global variable

    twb.assign("_domain","API_URI","/api"); // no trailer slash   
    twb.assign("_domain","AUTH_URI","/oauth2_html/login.php");   
    twb.assign("_domain","SERVERPROXY_URI","/open-js/proxy.html");   
    twb.assign("_domain","FLASHPROXY_URI","/open-js/proxy.swf");   
    twb.assign("_domain","EXCHANGE_TOKEN_URI","/cgi-bin/exchange_token");   
    twb.assign("_domain","QUERY_TOKEN_URI","/cgi-bin/auto_token");   

}());
/**
 * Tencent weibo javascript library
 *
 * String extension
 *
 * //TODO: encoding libraries
 *
 * http://www.cnblogs.com/cgli/archive/2011/05/17/2048869.html
 * http://www.blueidea.com/tech/web/2006/3622.asp
 *
 * @author michalliu
 * @version 1.0
 * @package common
 * @module String
 * @requires base
 */
QQWB.extend("String",{
    _trimLeft: /^\s+/
   ,_trimRight: /\s+$/
    /**
     * Determine whether an object is string
     *
     * @access public
     * @param source {Mixed} anything
     * @return {Boolean}
     */
   ,isString: function (source) {
        return typeof source === "string";
    }

    /**
     * Strip left blank
     *
     * @access public
     * @param source {Mixed} anything
     * @return {String}
     */
   ,ltrim: function (source) {
       return source == null ? "" : source.toString().replace(this._trimLeft,"");
    }

    /**
     * Strip right blank
     *
     * @access public
     * @param source {Mixed} anything
     * @return {String}
     */
   ,rtrim: function (source) {
       return source == null ? "" : source.toString().replace(this._trimRight,"");
    }

    /**
     * Strip blank at left and right
     *
     * @access public
     * @param source {Mixed} anything
     * @return {String}
     */
    ,trim: String.prototype.trim ? function (source) {
            return source == null ? "" : String.prototype.trim.call(source);
        } : function (source) {
            return source == null ? "" : source.toString().replace(this._trimLeft,"").replace(this._trimRight,"");
        } 

	/**
	 * Determine whether needle at the front of str
	 *
	 * @access public
	 * @param source {Mixed} anything
	 * @return {Boolean}
	 */
	,startsWith: String.prototype.startsWith ? function (source, needle) {
			return source == null ? false : String.prototype.startsWith.call(source, needle);
		} : function (source, needle) {
			return source == null ? false : source.toString().indexOf(needle) == 0;
		} 

	/**
	 * Determine whether needle at the end of str
	 *
	 * @access public
	 * @param source {Mixed} anything
	 * @return {Boolean}
	 */
	,endsWith: String.prototype.endsWith ? function (source, needle) {
			return source == null ? false : String.prototype.endsWith.call(source, needle);
		} : function (source, needle) {
			return source == null ? false : source.toString().lastIndexOf(needle) >= 0 && source.toString().lastIndexOf(needle) + needle.length == source.length;
		} 
});
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
        var match = text.match(/\"errcode\":(-?\d+)/) || text.match(/<errcode>(\d+)<\/errcode>/);
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

        return msg.length > 0 ? msg.join(",") : "未知错误";
    }
    // api list
    ,
	apis: {"/statuses/home_timeline":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"主页时间线",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/home_timeline_vip":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"vip用户时间线",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:"2",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/public_timeline":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"广播大厅时间线",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pos:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/user_timeline":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"其他用户发表时间线",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/mentions_timeline":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"@提到我的时间线",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},type:{defaultValue:"0x1",description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/ht_timeline":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"话题时间线",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{httext:{defaultValue:"pBoard",description:QQWB._const.API_NO_DESCRIPTION},pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pageinfo:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/broadcast_timeline":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"我发表时间线",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/special_timeline":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"特别收听的人发表时间线",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/broadcast_timeline_ids":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"我发表时间线索引",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},type:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},contenttype:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},accesslevel:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/home_timeline_ids":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"首页时间线索引",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},type:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},contenttype:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},accesslevel:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/mentions_timeline_ids":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"提及我的时间线索引",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},type:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},contenttype:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},accesslevel:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/user_timeline_ids":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"用户发表时间线索引",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION},type:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},contenttype:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},accesslevel:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/users_timeline":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"多用户发表时间线",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},names:{defaultValue:"t,api_weibo",description:QQWB._const.API_NO_DESCRIPTION},type:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},contenttype:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},accesslevel:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/users_timeline_ids":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"多用户发表时间线索引",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},names:{defaultValue:"t,api_weibo",description:QQWB._const.API_NO_DESCRIPTION},type:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},contenttype:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},accesslevel:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/area_timeline":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"同城发表时间线",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pos:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},country:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION},province:{defaultValue:11,description:QQWB._const.API_NO_DESCRIPTION},city:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION}}},"/statuses/ht_timeline_ext":{category:QQWB._const.API_CATEGORY_TIMELINE,description:"话题时间线(修复翻页问题)",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{reqnum:{defaultValue:10,description:QQWB._const.API_NO_DESCRIPTION},pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},flag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},accesslevel:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},type:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},contenttype:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},httext:{defaultValue:"iweibo",description:QQWB._const.API_NO_DESCRIPTION},htid:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/t/show":{category:QQWB._const.API_CATEGORY_WEIBO,description:"获取一条微博数据",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{id:{defaultValue:51545056800467,description:QQWB._const.API_NO_DESCRIPTION}}},"/t/add":{category:QQWB._const.API_CATEGORY_WEIBO,description:"发表一条微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{content:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},clientip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION},jing:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},wei:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/t/del":{category:QQWB._const.API_CATEGORY_WEIBO,description:"删除一条微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{id:{defaultValue:94035056272295,description:QQWB._const.API_NO_DESCRIPTION}}},"/t/re_add":{category:QQWB._const.API_CATEGORY_WEIBO,description:"转播一条微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{content:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},clientip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION},jing:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},wei:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},reid:{defaultValue:77048060858014,description:QQWB._const.API_NO_DESCRIPTION}}},"/t/reply":{category:QQWB._const.API_CATEGORY_WEIBO,description:"回复一条微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{content:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},clientip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION},jing:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},wei:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},reid:{defaultValue:77048060858014,description:QQWB._const.API_NO_DESCRIPTION}}},"/t/add_pic":{category:QQWB._const.API_CATEGORY_WEIBO,description:"发表一条图片微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{content:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},clientip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION},jing:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},wei:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},pic:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/t/add_emotion":{category:QQWB._const.API_CATEGORY_WEIBO,description:"发表一条心情微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{content:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},clientip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION},jing:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},wei:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},signtype:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/t/re_count":{category:QQWB._const.API_CATEGORY_WEIBO,description:"转播数或点评数",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{ids:{defaultValue:12704604231530709392,description:QQWB._const.API_NO_DESCRIPTION},flag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/t/re_list":{category:QQWB._const.API_CATEGORY_WEIBO,description:"获取单条微博的转发和点评列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{flag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},rootid:{defaultValue:92035070199751,description:QQWB._const.API_NO_DESCRIPTION},pageflag:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:"2",description:QQWB._const.API_NO_DESCRIPTION},twitterid:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/t/comment":{category:QQWB._const.API_CATEGORY_WEIBO,description:"点评一条微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{content:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},clientip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION},jing:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},wei:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},reid:{defaultValue:28135069067568,description:QQWB._const.API_NO_DESCRIPTION}}},"/t/add_music":{category:QQWB._const.API_CATEGORY_WEIBO,description:"发表音频微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{content:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},clientip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION},jing:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},wei:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},url:{defaultValue:"http://url.cn",description:QQWB._const.API_NO_DESCRIPTION},title:{defaultValue:"歌名",description:QQWB._const.API_NO_DESCRIPTION},author:{defaultValue:"演唱者",description:QQWB._const.API_NO_DESCRIPTION},reid:{defaultValue:12345678,description:QQWB._const.API_NO_DESCRIPTION}}},"/t/add_video":{category:QQWB._const.API_CATEGORY_WEIBO,description:"发表视频微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{content:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},clientip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION},jing:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},wei:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},url:{defaultValue:"http://url.cn",description:QQWB._const.API_NO_DESCRIPTION}}},"/t/add_video":{category:QQWB._const.API_CATEGORY_WEIBO,description:"发表视频微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{content:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},clientip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION},jing:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},wei:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},url:{defaultValue:"http://url.cn",description:QQWB._const.API_NO_DESCRIPTION}}},"/t/getvideoinfo":{category:QQWB._const.API_CATEGORY_WEIBO,description:"获取视频信息",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{url:{defaultValue:"http://v.youku.com/v_show/id_XMjExODczODM2.html",description:QQWB._const.API_NO_DESCRIPTION}}},"/t/list":{category:QQWB._const.API_CATEGORY_WEIBO,description:"根据微博ID批量得到微博数据",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{ids:{defaultValue:"39110101242147,39578069128701",description:QQWB._const.API_NO_DESCRIPTION}}},"/t/add_video_prev":{category:QQWB._const.API_CATEGORY_WEIBO,description:"预发表一条视频微博",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{content:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},clientip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION},jing:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},wei:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},vid:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},title:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/t/sub_re_count":{category:QQWB._const.API_CATEGORY_WEIBO,description:"获取转播的再次转播数",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{ids:{defaultValue:"8171051658365,55054116813124",description:QQWB._const.API_NO_DESCRIPTION}}},"/user/info":{category:QQWB._const.API_CATEGORY_ACCOUNT,description:"获取自己的详细资料",supportMethod:QQWB._const.HTTP_METHOD_GET},"/user/update":{category:QQWB._const.API_CATEGORY_ACCOUNT,description:"更新个人资料",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{nick:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},sex:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},year:{defaultValue:2000,description:QQWB._const.API_NO_DESCRIPTION},month:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION},day:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION},countrycode:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION},provincecode:{defaultValue:11,description:QQWB._const.API_NO_DESCRIPTION},citycode:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION},introduction:{defaultValue:"xxxx",description:QQWB._const.API_NO_DESCRIPTION}}},"/user/update_edu":{category:QQWB._const.API_CATEGORY_ACCOUNT,description:"更新个人教育信息",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{year:{defaultValue:1995,description:QQWB._const.API_NO_DESCRIPTION},level:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION},schoolid:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION},field:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION},departmentid:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION}}},"/user/update_head":{category:QQWB._const.API_CATEGORY_ACCOUNT,description:"更新个人资料头像",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{pic:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/user/other_info":{category:QQWB._const.API_CATEGORY_ACCOUNT,description:"获取其他人资料",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION}}},"/user/infos":{category:QQWB._const.API_CATEGORY_ACCOUNT,description:"多用户信息",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{names:{defaultValue:"t,api_weibo",description:QQWB._const.API_NO_DESCRIPTION}}},"/user/verify":{category:QQWB._const.API_CATEGORY_ACCOUNT,description:"验证账户是否合法（是否注册微博）",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION}}},"/user/emotion":{category:QQWB._const.API_CATEGORY_ACCOUNT,description:"获取心情微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION},pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},id:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},timstamp:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},type:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},contenttype:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION},accesslevel:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},emotiontype:{defaultValue:"0xFFFFFFFF",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:10,description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/fanslist":{category:QQWB._const.API_CATEGORY_RELATION,description:"我的听众列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},startindex:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/idollist":{category:QQWB._const.API_CATEGORY_RELATION,description:"我收听的人列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},startindex:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/blacklist":{category:QQWB._const.API_CATEGORY_RELATION,description:"黑名单列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},startindex:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/speciallist":{category:QQWB._const.API_CATEGORY_RELATION,description:"特别收听列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},startindex:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/add":{category:QQWB._const.API_CATEGORY_RELATION,description:"收听某个用户",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/del":{category:QQWB._const.API_CATEGORY_RELATION,description:"取消收听某个用户",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/addspecial":{category:QQWB._const.API_CATEGORY_RELATION,description:"特别收听某个用户",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/delspecial":{category:QQWB._const.API_CATEGORY_RELATION,description:"取消特别收听某个用户",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/addblacklist":{category:QQWB._const.API_CATEGORY_RELATION,description:"添加某个用户到黑名单",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/delblacklist":{category:QQWB._const.API_CATEGORY_RELATION,description:"从黑名单中删除某个用户",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/check":{category:QQWB._const.API_CATEGORY_RELATION,description:"检查是否我的听众或收听的人",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{names:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION},flag:{defaultValue:"2",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/user_fanslist":{category:QQWB._const.API_CATEGORY_RELATION,description:"其他账户听众列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{reqnum:{defaultValue:30,description:QQWB._const.API_NO_DESCRIPTION},startindex:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/user_idollist":{category:QQWB._const.API_CATEGORY_RELATION,description:"其他账户收听的人列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{reqnum:{defaultValue:30,description:QQWB._const.API_NO_DESCRIPTION},startindex:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/user_speciallist":{category:QQWB._const.API_CATEGORY_RELATION,description:"其他账户特别收听的人列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{reqnum:{defaultValue:30,description:QQWB._const.API_NO_DESCRIPTION},startindex:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},name:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/fanslist_s":{category:QQWB._const.API_CATEGORY_RELATION,description:"多听众列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{reqnum:{defaultValue:100,description:QQWB._const.API_NO_DESCRIPTION},startindex:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/idollist_s":{category:QQWB._const.API_CATEGORY_RELATION,description:"多收听人列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{reqnum:{defaultValue:100,description:QQWB._const.API_NO_DESCRIPTION},startindex:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/friends/mutual_list":{category:QQWB._const.API_CATEGORY_RELATION,description:"互听关系链列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{name:{defaultValue:"t",description:QQWB._const.API_NO_DESCRIPTION},startindex:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:30,description:QQWB._const.API_NO_DESCRIPTION}}},"/private/add":{category:QQWB._const.API_CATEGORY_SIXIN,description:"发私信",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{content:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},clientip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION},jing:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},wei:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},name:{defaultValue:"mmplayer",description:QQWB._const.API_NO_DESCRIPTION}}},"/private/del":{category:QQWB._const.API_CATEGORY_SIXIN,description:"删除一条私信",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{id:{defaultValue:26154115313103,description:QQWB._const.API_NO_DESCRIPTION}}},"/private/recv":{category:QQWB._const.API_CATEGORY_SIXIN,description:"收件箱",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/private/send":{category:QQWB._const.API_CATEGORY_SIXIN,description:"发件箱",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/search/user":{category:QQWB._const.API_CATEGORY_SEARCH,description:"搜索用户",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{keyword:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},pagesize:{defaultValue:10,description:QQWB._const.API_NO_DESCRIPTION},page:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION}}},"/search/t":{category:QQWB._const.API_CATEGORY_SEARCH,description:"搜索微博",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{keyword:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},pagesize:{defaultValue:10,description:QQWB._const.API_NO_DESCRIPTION},page:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION}}},"/search/userbytag":{category:QQWB._const.API_CATEGORY_SEARCH,description:"通过标签搜索用户",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{keyword:{defaultValue:"test",description:QQWB._const.API_NO_DESCRIPTION},pagesize:{defaultValue:10,description:QQWB._const.API_NO_DESCRIPTION},page:{defaultValue:"1",description:QQWB._const.API_NO_DESCRIPTION}}},"/trends/ht":{category:QQWB._const.API_CATEGORY_TRENS,description:"话题热榜",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{type:{defaultValue:"3",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},pos:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/trends/t":{category:QQWB._const.API_CATEGORY_TRENS,description:"热门转播",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},pos:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/info/update":{category:QQWB._const.API_CATEGORY_QUERY,description:"更新条数",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{op:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},type:{defaultValue:"9",description:QQWB._const.API_NO_DESCRIPTION}}},"/fav/addt":{category:QQWB._const.API_CATEGORY_FAVORITE,description:"收藏一条微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{id:{defaultValue:123456789,description:QQWB._const.API_NO_DESCRIPTION}}},"/fav/delt":{category:QQWB._const.API_CATEGORY_FAVORITE,description:"取消收藏一条微博",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{id:{defaultValue:123456789,description:QQWB._const.API_NO_DESCRIPTION}}},"/fav/list_t":{category:QQWB._const.API_CATEGORY_FAVORITE,description:"收藏的微博列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},nexttime:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},prevtime:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/fav/addht":{category:QQWB._const.API_CATEGORY_FAVORITE,description:"订阅话题",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{id:{defaultValue:123456789,description:QQWB._const.API_NO_DESCRIPTION}}},"/fav/delht":{category:QQWB._const.API_CATEGORY_FAVORITE,description:"取消收藏话题",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{id:{defaultValue:123456789,description:QQWB._const.API_NO_DESCRIPTION}}},"/fav/list_ht":{category:QQWB._const.API_CATEGORY_FAVORITE,description:"获取已订阅话题列表",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{reqnum:{defaultValue:20,description:QQWB._const.API_NO_DESCRIPTION},pageflag:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},pagetime:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION},lastid:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/ht/ids":{category:QQWB._const.API_CATEGORY_TOPIC,description:"根据话题名称查询话题ID",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{httexts:{defaultValue:"abc,efg",description:QQWB._const.API_NO_DESCRIPTION}}},"/ht/info":{category:QQWB._const.API_CATEGORY_TOPIC,description:"根据话题ID获取话题相关微博",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{ids:{defaultValue:12704604231530709392,description:QQWB._const.API_NO_DESCRIPTION}}},"/tag/add":{category:QQWB._const.API_CATEGORY_TAG,description:"添加标签",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{tag:{defaultValue:"snow",description:QQWB._const.API_NO_DESCRIPTION}}},"/tag/del":{category:QQWB._const.API_CATEGORY_TAG,description:"删除标签",supportMethod:QQWB._const.HTTP_METHOD_POST,supportParams:{tagid:{defaultValue:5131240618185167659,description:QQWB._const.API_NO_DESCRIPTION}}},"/other/kownperson":{category:QQWB._const.API_CATEGORY_OTHER,description:"我可能认识的人",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{ip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION},country_code:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},province_code:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION},city_code:{defaultValue:"",description:QQWB._const.API_NO_DESCRIPTION}}},"/other/kownperson":{category:QQWB._const.API_CATEGORY_OTHER,description:"可能认识的人",supportMethod:QQWB._const.HTTP_METHOD_GET},"/other/shorturl":{category:QQWB._const.API_CATEGORY_OTHER,description:"短URL转长URL",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{url:{defaultValue:"3M6GSa",description:QQWB._const.API_NO_DESCRIPTION}}},"/other/get_emotions":{category:QQWB._const.API_CATEGORY_OTHER,description:"获取表情接口",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{type:{defaultValue:"0",description:QQWB._const.API_NO_DESCRIPTION}}},"/other/kownperson":{category:QQWB._const.API_CATEGORY_OTHER,description:"我可能认识的人",supportMethod:QQWB._const.HTTP_METHOD_GET,supportParams:{ip:{defaultValue:"127.0.0.1",description:QQWB._const.API_NO_DESCRIPTION}}},"/other/videokey":{category:QQWB._const.API_CATEGORY_OTHER,description:"获取视频上传的key",supportMethod:QQWB._const.HTTP_METHOD_GET},"/other/gettopreadd":{category:QQWB._const.API_CATEGORY_OTHER,description:"一键转播热门排行",supportMethod:QQWB._const.HTTP_METHOD_GET}}
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
/*
 * @author crockford
 * @url https://raw.github.com/douglascrockford/JSON-js/master/json2.js
 * @module JSON2
 * @licence Public Domain
 */
/*
    http://www.JSON.org/json2.js
    2011-02-23

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/**
 * Tencent weibo javascript library
 *
 * JSON manipulate
 *
 * @author michalliu
 * @version 1.0
 * @package common
 * @module JSON
 * @requires base
 *           String
 *           JSON2
 */
QQWB.extend("JSON",{
    /**
     * Get JSON Object from string
     *
     * @access public
     * @param source {String} the source string
     * @throws {SyntaxError} sytaxError if failed to parse string to JSON object
     * @return {Object} json object
     */
    fromString: function (source) {
        if (!source || !QQWB.String.isString(source)) {
            return {};
        } else {
            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            source = source.replace(/^\s+/,"").replace(/\s+$/,"");

            if ( window.JSON && window.JSON.parse ) {
                source = window.JSON.parse( source );
            } else {
                // Make sure the incoming data is actual JSON
                // Logic borrowed from http://json.org/json2.js
                if ( /^[\],:{}\s]*$/.test( source.replace( /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@" )
                    .replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]" )
                    .replace( /(?:^|:|,)(?:\s*\[)+/g, "")) ) {

                    source = (new Function( "return " + data ))();
                } else {
                    throw new SyntaxError ("Invalid JSON: " + source);
                }
            }

            return source;
        } // end if
    } // end fromString

    /**
     * Convert JSON Object to string
     *
     * @access public
     * @param source {Object} the source object
     * @return {String} the stringified version of an object
     */
   ,stringify: function (source) {
       return source == null ? "" : window.JSON.stringify(source);
    }

    /**
     * Convert JSON Object to string
     *
     * @access public
     * @deprecated use JSON.stringify instead
     * @param source {Object} the source object
     * @return {String} the stringified version of an object
     */
   ,toString: function (source) {
       return QQWB.JSON.stringify(source);
    }
    /**
     * Convert string to JSON object
     *
     * @access public
     * @deprecated use JSON.fromString instead
     * @param source {String} the source string
     * @return {Object}
     */
   ,parse: function (source) {
       return source == null ? {} : window.JSON.parse(source);
    }

}, true/*overwrite toString method inherit from Object.prototype*/);
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

/**
 * Tencent weibo javascript library
 *
 * Array extension
 *
 * @author michalliu
 * @version 1.0
 * @package common
 * @module Array
 * @requires base
 *           String
 */
QQWB.extend("Array",{
    /**
     * Get whether an object is array
     *
     * @access public
     * @param arg {Mixed} anything
     * @return {Boolean}
     */
    isArray: function (arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
    }
    /**
     * Get whether an object in the array
     *
     * @access public
     * @param arr {Array} the array object
     *        arg {Mixed} anything
     * @return {Boolean}
     */
   ,inArray: function (arr, arg) {
       for (var i=0,l=arr.length; i<l; i++) {
           if (arg === arr[i]) {
               return true;
           }
       }
       return false;
    }
    /**
     * Build array from String
     *
     * @access public
     * @param source {String} the source string
     * @param optSep {Regexp|String} the seprator passed into String.split method
     * @param optMax {Number} the maxCount of the newly builded array
     * @return {Array}
     */
   ,fromString: function (source, optSep, optMax) {
       if (!QQWB.String.isString(source)) {
           return [];
       } 
       optSep = optSep || "";
       return optMax ? source.split(optSep, optMax) : source.split(optSep);
    }
    /**
     * Build array from an array-like object
     *
     * @access public
     * @param source {Object} the source object
     * @param optMax {Number} the maxCount of the newly builded array
     * @return {Array}
     */
   ,fromArguments: function (source, optMax) {
       if (typeof source !== "object") {
           return [];
       } 
       return optMax ? Array.prototype.slice.call(source, optMax) : Array.prototype.slice.call(source);
    }
    /**
     * Argument object to array
     * 
     * @deprecated use fromString,fromArguments instead
     * @access public
     * @param arg {Mixed} source
     * @return {Array}
     */
   ,toArray: function (arg) {
       if (typeof arg == "string") {
           return arg.split("");
       } else if (typeof arg == "object") {
           return Array.prototype.slice.call(arg,0);
       } else {
           return this.toArray(arg.toString());
       }
    }
    /**
     * Enumerate the array
     *
     * Note:
     * If handler executed and returned false,
     * The enumeration will stop immediately
     *
     * @access public
     * @param arr {Array} the array object
     *        handler {Function} the callback function
     */
   ,each: function (arr, handler) {
       for (var i=0,l=arr.length; i<l; i++) {
           if (false === handler(i,arr[i])) {
               break;
           }
       }
    }
	/**
	 * Get element from array
	 *
	 * Examples:
	 *
	 * get([1,2],-1)
	 *
	 * output
	 *
	 * 2
	 *
	 * @access public
	 * @param arr {Array} the array object
	 * @param index {Number} the index at array
	 */
   ,get: function (arr, index) {
	   var l = arr.length;
	   if (Math.abs(index) < l) {
		   return index >= 0 ? arr[index] : arr[l+index]; 
	   }
    }
});
/**
 * Tencent weibo javascript library
 *
 * DOM operations
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module dom
 * @requires base
 *           common.String
 *           common.Array
 */

QQWB.extend("dom", {
    /**
     * Create an element
     * 
     * @access public
     * @param tagName {String} the element's tagName
     * @param optAttrs {Object} attrs on that element
     * @return {DOMElement} an element
     */
    create: function (tagName,optAttrs) {
        var element = document.createElement(tagName + "");
        if (optAttrs && element) {
            for (attr in optAttrs) {
                if (optAttrs.hasOwnProperty(attr)) {
					if(!QQWB.String.startsWith(attr,"data-")) {
                        element[attr] = optAttrs[attr];
					} else {
						element.setAttribute(attr,optAttrs[attr]);
					}
                }
            }
        }
        return element;
     }
    /**
     * Create and return a hiddened element
     *
     * @access public
     * @param optTagName {String} tagName
     * @param optAttrs {Object} element's attrs
	 * @param optFake {Boolean} use visibility:hidden insteadof display:none
     * @return {DOMElement} a hiddened element
     */
   ,createHidden: function (optTagName, optAttrs, optFake) {
        optTagName = optTagName || "div";
        var el = this.create(optTagName,optAttrs);
		if (optFake) {
            // we can't use the flash object in IE if flash container's style of visibility 
            // is hidden or display is none;
            // we can't use the flash object in chrome if flash container's style of display
            // is none, and visibility is hidden no problem
            // for convience we hidden the flash by giving it a large offset of top
			// el.style.visibility = "hidden";
            el.width = el.height = 0;
            el.style.width = el.style.height = 0;
            el.style.position = "absolute";
            el.style.top = "-9999px";
		} else {
            el.style.display = "none";
		}
        return el;
    }
    /**
     * Append child to parent
     *
     * Note:
     * if parent is not valid then append to dom body 
     *
     * @access public
     * @param child {DOMElement} childNode
     * @param parent {DOMElement} parentNode
	 * @return {Object} QQWB.dom
     */
   ,append: function (child, parent) {
       parent = parent || document.body;
       if (child && child.nodeType) {
           parent.appendChild(child);
       }
       return this;
    }
    /**
     * Set element's innerHTML
     *
     * @access public
	 * @param node {Node} node
	 * @param html {String} the html text for the node
	 * @return {Object} QQWB.dom
     */
   ,html: function (node, html) {
       node && node.nodeType && html && (node.innerHTML = html);
       return this;
   }
    /**
     * Append html to DOM and make it hidden
     *
     * @access public
     * @param html {DOMElement|String}
     * @param optAttrs {Object} element's attrs
	 * @param optFake {Boolean} use visibility:hidden insteadof display:none
	 * @return {Object} QQWB.dom
     */
   ,appendHidden: function (html, optAttrs ,optFake) {
       var hidden = this.createHidden(null, optAttrs, optFake);
       this.html(hidden, html);
       return this.append(hidden);
    }
	/**
	 * Remove node from DOM
	 *
     * @access public
	 * @param node {Node} the DOM node
	 * @return {Object} QQWB.dom
	 */
   ,remove: function (node) {
	   node && node.nodeType /* is node */ && node.parentNode /* parentNode exists */ && node.parentNode.removeChild(node)/* remove it */;
	   return this;
    }
	/**
	 * Determine whether node has the class name
	 *
     * @access public
	 * @param node {Node} the DOM node
	 * @param classname {Node} classname
	 * @return {Boolean}
	 */
   ,hasClass: function (node, classname) {
	   return (" " + node.className + " ").indexOf(" " + classname + " ") >= 0;
    }
	/**
	 * Add classname to node
	 *
     * @access public
	 * @param nodes {Node|Array} the DOM node(s)
	 * @param classname {Node} classname
	 * @return {Object} QQWB.dom
	 */
   ,addClass: function (nodes, classname) {
	   classname = QQWB.String.trim(classname);
	   if (QQWB.Array.isArray(nodes)) {
		   QQWB.Array.each(nodes, function (i, node) {
			   QQWB.dom.addClass(node, classname);
		   });
		   return this;
	   }
	   if (!QQWB.dom.hasClass(nodes,classname)) {
		  nodes.className = nodes.className + " " + classname;
	   }
	   return this;
    }

	/**
	 * remove classname of node
	 *
     * @access public
	 * @param nodes {Node|Array} the DOM node(s)
	 * @param classname {Node} classname
	 * @return {Object} QQWB.dom
	 */
   ,removeClass: function (nodes, classname) {
	   classname = QQWB.String.trim(classname);
	   if (QQWB.Array.isArray(nodes)) {
		   QQWB.Array.each(nodes, function (i, node) {
			   QQWB.dom.removeClass(node, classname);
		   });
		   return this;
	   }
	   if (QQWB.dom.hasClass(nodes, classname)) {
		   nodes.className = nodes.className.replace(classname, "");
		   QQWB.dom.removeClass(nodes, classname);
	   }
	   return this;
    }
});

/**
 * Tencent weibo javascript library
 *
 * Querystring encoder and decoder
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module queryString
 * @requires base
 */

QQWB.extend("queryString",{
    /**
     * Encode parameter object to query string
     *
     * @access public
     * @param params {Object} the object contains params
     * @param opt_sep {String} the seprator string, default is '&'
     * @param opt_encode {Function} the function to encode param, default is encodeURIComponent
	 * @param opt_filter {Array} filter the result
     * @return {String} the encoded query string
     */
    encode: function (params, opt_sep, opt_encode, opt_filter) {
        var 
            regexp = /%20/g,
            sep = opt_sep || '&',
            encode = opt_encode || encodeURIComponent,
            pairs = [],
			pairsShadow = [],
			key,val; // filtered from filters

        for (key in params) {
            if (params.hasOwnProperty(key)) {

                val = params[key];

                if (val !== null && typeof val != 'undefined') {

					key = encode(key).replace(regexp,"+");
					val = encode(val).replace(regexp,"+");

					if (!opt_filter) {
                        pairs.push(key + "=" + val);
					} else {
						for (var i=0,l=opt_filter.length; i<l; i++) {
							if (opt_filter[i] === key) {
								pairs[i] = key + "=" + val;
							}
						} // end opt_filter loop
					} // end opt_filter
                } // end val
            } // end hasOwnProperty
        } // end loop

		// remove undefined value in an array
		for (var j=0,len=pairs.length;j<len;j++) {
			if (typeof pairs[j] != "undefined") {
				pairsShadow.push(pairs[j]);
			}
		}
		// swap value
		pairs = pairsShadow;
        pairsShadow = null;

        // pairs.sort();
        return pairs.join(sep);
    }
    /**
     * Decode query string to parameter object
     *
     * @param str {String} query string
     *        opt_sep {String} the seprator string default is '&'
     *        opt_decode {Function} the function to decode string default is decodeURIComponent
     * @return {Object} the parameter object
     */
   ,decode: function (str, opt_sep, opt_decode) {
       var
           decode = opt_decode || decodeURIComponent,
           sep = opt_sep || '&',
           parts = str.split(sep),
           params = {},
           pair;

       for (var i = 0,l = parts.length; i<l; i++) {
           pair = parts[i].split('=',2);
           if (pair && pair[0]) {
               params[decode(pair[0])] = decode(pair[1]);
           }
       }

       return params;
    }
});
/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 *
 *  @author John Resig
 *  @url    http://sizzlejs.com/
 *  @module sizzle
 *  @licence MIT, BSD, and GPL
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var match,
			type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var found, item,
					filter = Expr.filter[ type ],
					left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					var first = match[2],
						last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
	
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
var oldSizzle = window.Sizzle;

// Added
Sizzle.noConflict = function () {
    window.Sizzle = oldSizzle;
};

window.Sizzle = Sizzle;

})();
/**
 * Tencent weibo javascript library
 *
 * Sizzle CSS selector engine with chained ablity
 * http://sizzlejs.com/
 *
 * @author michalliu
 * @version 1.0
 * @package compat
 * @module find
 * @requires base
 *           sizzle
 *           common.Array
 *           
 */

(function (){

    var $ = window.Sizzle;

    $.noConflict(); // rollback Sizzle to its original value

    //if (typeof window.Sizzle === "undefined") { // if we introduce the Sizzle variable then we don't need it anymore 
        //delete window.Sizzle; //
    //}

    /**
     * Continues to find nodes in results
     *
     * Note:
     * find("div > a") and find("div").find("a") is totally different
     * 1) The first rule means give me the node which
     *    1. nodeName is A
     *    2. its parent node nodename is div 
     * 2) The second rule means give me the node which
     *    1. nodeName is A
     *    2. (regardless its parentnode)it is wrapped by div
     *
     * @access private
     * @return {Array} the *modified* results
     */
    function find (selector) {
        var tempArr;
        if (!QQWB.Array.isArray(this)) { // expected an array
            return this;
        }
        tempArr = [];
        for (var i=0,l=this.length; i<l; i++) {
            tempArr = tempArr.concat($(selector,this[i]));
        }
        return tempArr;
    }

    /**
     * Filter nodes contains the specific text
     *
     * @access private
     * @return {Array} the filtered results
     */
    function contains (text) {
        if (typeof text !== 'string') {
            return this;
        }
        if (text.length <= 0) {
            return this;
        }
        return $.matches(":contains(" + text + ")",this);
    }

    /**
     * Keep the node that match with the selector and remove the others
     *
     * @access private
     * @return {Array} the *modified* results
     */
    function keep (selector) {
        return $.matches(selector,this);
    }

    /**
     * Teardown the node that don't match with the selector and keep the others
     *
     * @access private
     * @return {Array} the *modified* results
     */
    function tear (selector) {
        return $.matches(":not(" + selector + ")",this);
    }

	/**
	 * Get the element in result
	 *
	 * @access private
	 * @return {Node}
	 */
	function get (index) {
		return QQWB.Array.get(this, index);
	}

    /**
     * A beautiful way to enumerate the nodes
     *
     * @access private
     * @return {Array} the *same* nodes
     */
    function each (func) {
        if (!QQWB.Array.isArray(this) || !func) { // expected an array and handler
            return this;
        }
        for (var i=0,l=this.length; i<l; i++) {
            if(func(this[i]) === false) { // execute func
                break;
            }
        }
        return this;
    }

    /**
     * Add chainability to Sizzle
     *
     * @access private
     * @return {Array} the *same* nodes
     */
    function create_chain(nodes) {
        !nodes.find && 
        (nodes.find = function (selector) {
            return create_chain(find.call(nodes,selector));
        });

        !nodes.contains && 
        (nodes.contains = function (text) {
            return create_chain(contains.call(nodes,text));
        });

        !nodes.keep &&
        (nodes.keep = function (selector) {
            return create_chain(keep.call(nodes,selector));
        });

        !nodes.tear &&
        (nodes.tear = function (selector) {
            return create_chain(tear.call(nodes,selector));
        });

        !nodes.get &&
        (nodes.get = function (index) {
            return get.call(nodes,index);
        });

        !nodes.each &&
        (nodes.each = function (func) {
            return each.call(nodes,func); // source object is not modified
        });

        return nodes;
    }

    // expose to dom module
    QQWB.provide('dom.find', function (selector, context) {
        return create_chain($(selector, context));
    });

	// alias to global
	QQWB._alias("find", QQWB.dom.find);
}());
/**
 * Tencent weibo javascript library
 *
 * format string with python style
 *
 * @author michalliu
 * @version 1.0
 * @package format
 * @module sprintf
 * @requires base
 */

/**
 * sprintf() for JavaScript 0.7-beta1
 * http://www.diveintojavascript.com/projects/javascript-sprintf
 * 
 * Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of sprintf() for JavaScript nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function (){
    var sprintf = (function() {
    	function get_type(variable) {
    		return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    	}
    	function str_repeat(input, multiplier) {
    		for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
    		return output.join('');
    	}
    
    	var str_format = function() {
    		if (!str_format.cache.hasOwnProperty(arguments[0])) {
    			str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
    		}
    		return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
    	};
    
    	str_format.format = function(parse_tree, argv) {
    		var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
    		for (i = 0; i < tree_length; i++) {
    			node_type = get_type(parse_tree[i]);
    			if (node_type === 'string') {
    				output.push(parse_tree[i]);
    			}
    			else if (node_type === 'array') {
    				match = parse_tree[i]; // convenience purposes only
    				if (match[2]) { // keyword argument
    					arg = argv[cursor];
    					for (k = 0; k < match[2].length; k++) {
    						if (!arg.hasOwnProperty(match[2][k])) {
    							throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
    						}
    						arg = arg[match[2][k]];
    					}
    				}
    				else if (match[1]) { // positional argument (explicit)
    					arg = argv[match[1]];
    				}
    				else { // positional argument (implicit)
    					arg = argv[cursor++];
    				}
    
    				if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
    					throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
    				}
    				switch (match[8]) {
    					case 'b': arg = arg.toString(2); break;
    					case 'c': arg = String.fromCharCode(arg); break;
    					case 'd': arg = parseInt(arg, 10); break;
    					case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
    					case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
    					case 'o': arg = arg.toString(8); break;
                        //case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
                        case 's': arg = ((arg = arg ? String(arg):"") && match[7] ? arg.substring(0, match[7]) : arg); break;
    					case 'u': arg = Math.abs(arg); break;
    					case 'x': arg = arg.toString(16); break;
    					case 'X': arg = arg.toString(16).toUpperCase(); break;
    				}
    				arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
    				pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
    				pad_length = match[6] - String(arg).length;
    				pad = match[6] ? str_repeat(pad_character, pad_length) : '';
    				output.push(match[5] ? arg + pad : pad + arg);
    			}
    		}
    		return output.join('');
    	};
    
    	str_format.cache = {};
    
    	str_format.parse = function(fmt) {
    		var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
    		while (_fmt) {
    			if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
    				parse_tree.push(match[0]);
    			}
    			else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
    				parse_tree.push('%');
    			}
    			else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
    				if (match[2]) {
    					arg_names |= 1;
    					var field_list = [], replacement_field = match[2], field_match = [];
    					if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
    						field_list.push(field_match[1]);
    						while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
    							if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
    								field_list.push(field_match[1]);
    							}
    							else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
    								field_list.push(field_match[1]);
    							}
    							else {
    								throw('[sprintf] huh?');
    							}
    						}
    					}
    					else {
    						throw('[sprintf] huh?');
    					}
    					match[2] = field_list;
    				}
    				else {
    					arg_names |= 2;
    				}
    				if (arg_names === 3) {
    					throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
    				}
    				parse_tree.push(match);
    			}
    			else {
    				throw('[sprintf] huh?');
    			}
    			_fmt = _fmt.substring(match[0].length);
    		}
    		return parse_tree;
    	};
    
    	return str_format;
    })();

    var vsprintf = function(fmt, argv) {
    	argv.unshift(fmt);
    	return sprintf.apply(null, argv);
    };

	// expost to String module
    QQWB.extend("String.format", {

        sprintf: sprintf

       ,vsprintf: vsprintf
    });

	// expost shortcut
	QQWB._alias("format", QQWB.String.format);

}());
/**
 * Tencent weibo javascript library
 *
 * Time
 *
 * Example:
 * 
 * T.time.getTime()
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module time
 * @requires base
 *           format.sprintf
 */

QQWB.extend("time", {
    /**
     * Get current time stamp in milliseconds
     *
     * @access public
     * @return {Date} current date
     */
    now: function () {
        return +this.dateNow();
    }
    /**
     * Get current time stamp in seconds
     *
     * @access public
     * @return {Date} current date
     */
   ,secondsNow: function () {
        return Math.round(this.now() / 1000);
    }
    /**
     * Get current time stamp
     *
     * @access public
     * @return {Date} current date
     */
    ,dateNow: function () {
        return new Date;
    }
    /**
     * Get a short time description
     * 
     * Example:
     * 
     * T.time.shortTime(); // output is 08:04:34
     * T.time.shortTime(new Date()); // output date
     * T.time.shortTime(new Date(),"%(year)s"); // output date with format
     * T.time.shortTime("%(year)s"); // output current date with format
     *
     * @access public
     * @param date {Date} date or current date if date not provided
     *        format {String} format of date object        
     * @return {String} formatted time string
     */
   ,shortTime: function (date, format) {
        if (!(date instanceof Date)) {
            format = date;
            date = this.dateNow();
        }
        format = format || "%(year)s/%(month)s/%(day)s %(hour)02d:%(minute)02d:%(second)02d";
        return QQWB.format.sprintf(format,{
            year: date.getFullYear()
           ,month: date.getMonth()
           ,day: date.getDate()
           ,hour: date.getHours()
           ,minute: date.getMinutes()
           ,second: date.getSeconds()
        });
    }
});

/**
 * Tencent weibo javascript library
 *
 * Log messages
 *
 * Example:
 * 
 * T.log.info("your message")
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module log
 * @requires base
 *           time
 *           format.sprintf
 */

QQWB.extend("log", {
	
	 // critical level
     CRITICAL: 50

	 // error level
    ,ERROR: 40

	 // warning level
    ,WARNING: 30

	 // infomation level
    ,INFO: 20

	 // debug level
    ,DEBUG: 10

	 // notset level, will log out all the messages
    ,NOTSET: 0

	// log level messages less than this level will be ingored
	// default level set to QQWB.log.NOTSET
    ,_level: 0 

	// log message format
    //,_format:"{{name}} : [{{levelname}}] {{time}} {{message}}"

	// log message format
    ,_format:"%(source)s%(popup)s%(frame)s%(name)s: [%(levelname)s] %(time)s %(message)s"

	/**
	 * Set log message level
	 * 
	 * @access public
	 * @param level {Number} log level
	 * @return {Object} log object
	 */
    ,setLevel: function (level) {
        this._level = level;
        return this;
     }

	/**
	 * Set log message format
	 * 
	 * @access public
	 * @param format {String} log format
	 * @return {Object} log object
	 */
    ,setFormat: function (format) {
        this._format = format;
		return this;
     }

	/**
	 * Log a debug message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,debug: function (message) {
        this.DEBUG >= this._level && this._out("DEBUG",message);
        return this;
     }

	/**
	 * Log a info message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,info: function (message) {
        this.INFO >= this._level && this._out("INFO",message);
        return this;
     }

	/**
	 * Log a warning message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,warning: function (message) {
        this.WARNING >= this._level && this._out("WARNING",message);
        return this;
     }

	/**
	 * Log a error message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,error: function (message) {
        this.ERROR >= this._level && this._out("ERROR",message);
        return this;
     }

	/**
	 * Log a critical message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,critical: function (message) {
        this.CRITICAL >= this._level && this._out("CRITICAL",message);
        return this;
     }

	/**
	 * Log out message
	 *
	 * @access private
	 * @param level {String} message level
	 *        message {String} message to log out
	 * @return {Void}
	 */
    ,_out: function (level,message) {
        var output = this._format;
        //output = output.replace("{{time}}", this._getTime())
                       //.replace("{{levelname}}", level)
                       //.replace("{{name}}", QQWB.name)
                       //.replace("{{message}}", message);
        //output = output.replace(/\{\{.*?\}\}/g,output);
        output = QQWB.format.sprintf(output,{
            name: QQWB.name
           ,levelname: level
           ,time: QQWB.time.shortTime()
           ,message: message
           ,frame: window != window.parent ? "*":""
		   ,source: window.name ? window.name : ""
		   ,popup: (window.opener || window.name === QQWB._const.AUTH_WINDOW_NAME) ? "#":""
        });

        // capture message
        if (this._capture && typeof this._captureLevel == "number" && this[level] > this._captureLevel && this._capturedMessages) {
            if (this._capturedMessages.length >= this._captureMaxSize) {
                this._capturedMessages.shift();
            }
            this._capturedMessages.push(output);
        }

        // no frame messages
        QQWB.debug && window.console && window.console.log(output);
     }

	/**
	 * Start capture log
	 *
	 * @access public
	 * @param optLevel {String} message level
	 * @param optMaxSize {Number} the max size of captured message
	 * @return {Object} log object
	 */
    ,startCapture: function (optLevel, optMaxSize) {
         this._captureLevel = optLevel || this.NOTSET; // set level of messages to capture
         this._captureMaxSize = optMaxSize || 50; // max keeping 50 messages
         this._capturedMessages = []; // store captured messages
         this._capture = true; // flag know capturing messages or not
         return this;
     }

	/**
	 * Stop capture log
	 *
	 * @access public
	 * @return {Object} log object
	 */
    ,stopCapture: function () {
        if (this._capture) {
            this._capture = false;
        }
        return this;
     }

	/**
	 * Retrieve the last captured messages
	 *
	 * @access public
     * @param {sep} the seprator
	 * @return {Object} log object
	 */
    ,lastCaptured: function (sep) {
        sep = sep || "\n";
        return this._capturedMessages ? this._capturedMessages.join(sep) : "";
     }
});

/**
 * Tencent weibo javascript library
 *
 * Cookie manipulation
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module cookie
 * @requires base
 *           log
 */

QQWB.extend("cookie", {
    /**
     * Set cookie
     *
     * @param name {String} cookie name
     *        value {String} cookie value
     *        maxage {Number} seconds from now. If present -1 it means a session cookie(default by browser)
     *        path {String} cookie path. If not present then use full request path(default by browser)
     *        domain {String} cookie domain. If not present then use full request host name(default by browser)
     * @access public
     * @return {Void}
     */
    set: function (name, value, opt_maxage, opt_path, opt_domain, enc) {

	   enc = enc || escape;
       if ( typeof opt_maxage === "undefined" || opt_maxage === null) {
           opt_maxage = -1;
       }

       var cookieDomain = opt_domain ? "domain=" + opt_domain : "";
       var cookiePath = opt_path ? "path=" + opt_path : "";
       var cookieExpire = "";

       if (opt_maxage === 0) {
           // expire the cookie
           cookieExpire = "expires=" + new Date(1970,1,1).toUTCString();
       } else if (opt_maxage > 0) {
           cookieExpire = "expires=" + new Date(+new Date+opt_maxage*1000).toUTCString();
       }

       document.cookie = [name + "=" + enc(value), cookieExpire, cookiePath, cookieDomain].join("; ");

       return this;
    }

    /**
     * Return the first value for the given cookie name 
     *
     * @access public
     * @param name {String} cookie name
     * @return {String} value for cookie
     */
   ,get: function (name, dec ,optDefault) {
	   dec = dec || unescape;
       var 
           cookieName = name + "=";
           cookies = (document.cookie || "").split(/\s*;\s*/);
       for (var i=0,l=cookies.length; i<l; i++) {
           var cookie = cookies[i];
           if (cookie.indexOf(cookieName) === 0) {
               return dec(cookie.substr(cookieName.length));
           }
       }
	   return optDefault;
    }

    /**
     * Delete cookie
     *
     * @access public
     * @param name {String} cookie name
     *        opt_path {String} the path of cookie
     *        opt_domain {String} the domain of cookie
     * @return {Void}
     */
   ,del: function (name, opt_path, opt_domain) {

       this.set(name, '', 0, opt_path, opt_domain);

       if (document.cookie.indexOf(name+"=") >= 0) {
           QQWB.log.warning("Cookie may not be deleted as you expected");
       }

       return this;
    }
});
/**
 * Tencent weibo javascript library
 *
 * String extension
 *
 * @author michalliu
 * @version 1.0
 * @package common
 * @module XML
 * @requires base
 */
QQWB.extend("XML",{
    /**
     * Determine is XML object or not
     *
     * @access public
     * @param xml {Object} xml object
     * @return {Boolean}
     */
    isXML: function (xml) {
       //TODO: not implement yet
    }
    /**
     * xml object to string
     *
     * @access public
	 * @deprecated use stringify instead
     * @param xml {Object} xml object
     * @return {String}
     */
   ,toString: function (xml) {
	   return this.stringify(xml);
    }
    /**
     * xml object to string
     *
     * @access public
     * @param xml {Object} xml object
     * @return {String}
     */
   ,stringify: function (xml) {
        var str;
        if (window.ActiveXObject) {
            str = xml.xml;
        } else {
            str = (new XMLSerializer()).serializeToString(xml);
        }
        return str;
    }
    /**
     * create xml object from string
     *
     * @access public
     * @param str {String} xml string
     * @return {Object} xml object
     */
   ,fromString: function (str) {
       var xml;
       if (window.ActiveXObject) {
           xml = new ActiveXObject("Microsoft.XMLDOM");
           xml.async = "false";
           xml.loadXML(str);
       } else {
           var parser = new DOMParser();
           xml = parser.parseFromString(str, "text/xml");
       }
       return xml;
    }
}, true/*overwrite toString method inherit from Object.prototype*/);
/**
 * Tencent weibo javascript library
 *
 * Function extension
 *
 * @author michalliu
 * @version 1.0
 * @package common
 * @module Function
 * @requires base
 */
QQWB.extend("Function",{
    /**
     * Determine whether an object is Function
     *
     * @access public
     * @param arg {Mixed} anything
     * @return {Boolean}
     */
    isFunction: function (arg) {
        return typeof arg === "function";
    }
});
/**
 * Tencent weibo javascript library
 *
 * Deferred object
 *
 * Note:
 *
 * Code is ported from jquery
 * A good explaination at 
 * http://stackoverflow.com/questions/4866721/what-are-deferred-objects/4867928#comment-8591160
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module deferred
 * @requires base
 *           common.Array
 *           common.Function
 */

QQWB.extend("deferred", {
	 /**
	  * Deferered object read-only methods
	  */
	_promiseMethods: "done fail isResolved isRejected promise then always success error complete whatever".split(" ")
	/**
	 * Create a simple deferred object (one callback list)
	 *
	 * @access private
	 * @return a deferred object
	 */
   ,_deferred: function () {
		var 
		    callbacks = [], // callback list
			fired, // stored [ context, args], use to fire again
			firing, // to avoid firing when already doing so
			cancelled, // flag to know if the deferred has been cancelled
			deferred = { // the deferred itself
				done: function () {
					if (!cancelled) {
						var 
						    args = arguments
						   ,elem
						   ,_fired;

						   // we should consider about fired status here
						   // this is neccesary to handle how done deals
						   // with arrays recursively
						   if (fired) {
							   _fired = fired;
							   fired = 0;
						   }

						   // add callbacks smartly
						   for (var i=0,l=args.length; i<l; i++) { 
							    elem = args[i];
							    if (QQWB.Array.isArray(elem)) {
								   deferred.done.apply(deferred, elem);
							   } else if (QQWB.Function.isFunction(elem)) {
								   callbacks.push(elem);
						    	}
						   }

						   // consider fired here
						   // if it's already been resolved then call resolveWith
						   // using the cached context and arguments to call the 
						   // callbacks immediatly
						   if (_fired) {
							   deferred.resolveWith(_fired[0], _fired[1]);
						   }
					}
					return this;
				}

				// resolve with given context and args
			   ,resolveWith: function (context, args) {
				   // if its been cancelled then we can't resolve
				   // if it has fired then we can't fire again
				   // if it's currently firing then we can't fire
				   if (!cancelled && !fired && !firing) {
					   args = args || [];
					   firing = 1;
					   // using try {} finally {} block because you are
					   // calling external callbacks, maybe these callbacks
					   // made by the user which are not bugfree.

					   // the finally block will always run no matter how bad
					   // the internal code is
					   try { 
					       while (callbacks[0]) {
							   callbacks.shift().apply(context, args);// first in first out
						   }
					   }
					   finally {
						   fired = [context, args]; // cache the the context and args
						   firing = 0;
					   }
				   }
				   return this;
			    }

				// Resolve with this as context and given arguments
			   ,resolve: function () {
				   deferred.resolveWith(this, arguments);
				   return this;
			    }

				// Has this deferred been resolved?
			   ,isResolved: function () {
				   return !!(firing || fired);
			    }
				// Cancel
			   ,cancel: function () {
				   cancelled = 1;
				   callbacks = [];
				   return this;
			    }
	    };
		return deferred;
	}
	/**
	 * Full fledged deferred (two callback list success and fail)
	 */
   ,deferred: function (func) {
	   var
	       promise,
	       deferred = QQWB.deferred._deferred(),
	       failDeferred = QQWB.deferred._deferred();

	   // Add errorDeferred methods, then and promise
	   QQWB.extend(deferred, {
		   // send to failed deferred object
		   fail: failDeferred.done
		   // send to sucess callback and failcallbacks at a time
		  ,then: function (doneCallbacks, failCallbacks) {
			  deferred.done(doneCallbacks).fail(failCallbacks);
			  return this;
		   }
		   // send to success callback and to fail callback aslo
		  ,always: function () {
			  return deferred.done.apply(deferred, arguments).fail.apply(this, arguments);
		   }
		   // invoke callbacks in failed deferred with context and arguments
		  ,rejectWith: failDeferred.resolveWith
		   // invoke callbacks in failed deferred
		  ,reject: failDeferred.resolve
		   // is callbacks in failed deferred invoked
		  ,isRejected: failDeferred.isResolved
		  // promise to return a read-only copy(cant call resolve resolveWith
		  // reject and rejectWith) of deferred
		  ,promise: function (obj) {
			  if (obj == null) {
				  if (promise) {
				      return promise;
				  }
				  promise = obj = {};
			  }
			  var i = QQWB.deferred._promiseMethods.length;
			  while (i--) {
				  obj[QQWB.deferred._promiseMethods[i]] = deferred[QQWB.deferred._promiseMethods[i]];
			  }
			  return obj;
		   }
	   });

	   // lovely alternative function names
	   deferred.success = deferred.done;
       deferred.error = deferred.fail;
       deferred.complete = deferred.whatever = deferred.always;

	   // funciton either success or fail
	   // if success fail deferer will cancel,vice versa
	   deferred.done(failDeferred.cancel).fail(deferred.cancel);

	   // unexpose cancel
	   delete deferred.cancel;

	   // a chance allow outer function to get a pointer to deferred object
	   func &&  func.call(deferred, deferred);

	   return deferred;
    }
	/**
	 * Deferred helper
	 */
   ,when: function (firstParam) {
	   var 
	       args = arguments,
		   length = args.length,
		   count = length,
		   deferred = length <= 1 && firstParam && QQWB.Function.isFunction(firstParam.promise) ?
		              firstParam :
					  QQWB.deferred.deferred(); // generate a deferred object or use the exists one

	    function resolveFunc (i) {
			return function (value) {
				args[i] = arguments.length > 1 ? QQWB.Array.fromArguments(arguments) : value;
				if (!(--count)) { // the last operation is resolved, resolve the when deffered
					deferred.resolveWith(deferred, QQWB.Array.fromArguments(args));
				}
			};
		}

		if (length > 1) { // more than one deferred object
		    for ( var i=0; i < length; i++) {
				if (args[i] && QQWB.Function.isFunction(args[i].promise)) { // arg is deferred object
				    // deferred.reject will called if any operation in when in rejected
				    args[i].promise().then(resolveFunc(i),deferred.reject);
				} else { // ingore arg that not a deferred object
					--count; // total arg -- 
				}

				if (!count) { // nothing is deferred
				    deferred.resolveWith (deferred, args);// let new deferred object handle it
				}
			}
		} else if ( deferred !== firstParam) {
			deferred.resolveWith(deferred, length ? [firstParam] : []);
		}

		return deferred.promise();
    }
});

// expose to global namespace
QQWB._alias(["task","when"], QQWB.deferred.when);
/**
 * Tencent weibo javascript library
 *
 * Input and output,AJAX,JSONP
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module io
 * @requires base
 *           queryString
 *           apiProvider
 *           deferred
 *           common.XML
 *           common.JSON
 *           time
 */

QQWB.extend("io", {
	// global IO timeout (30 seconds)
	_globalIOTimeout: 30 * 1000
    /**
     * The script IO mechanism
     *
     * @access private
     * @param cfg {Object} the configration for script io
     * @return {Object} to send/abort the request
     */
   ,_IOScript: function (cfg) {
        var 
            script,
			scriptLoadTimeout,
            head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
        return {
            send: function (complete) {
				var started = QQWB.time.now();
                script = document.createElement("script");
                script.async = "async";

                if (cfg.charset) {
                    script.charset = cfg.charset;
                }

                script.src = cfg.url;

			    scriptLoadTimeout = setTimeout(function () {
			  	    QQWB.log.warning("script loading timeout");
				    // ITEF Standard http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
				    complete(599,"network connect timeout",  QQWB.time.now() - started);
			    }, QQWB.io._globalIOTimeout);

                script.onload = script.onreadystatechange = function (e,isAbort) {

                    if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {

				        clearTimeout(scriptLoadTimeout);

                        script.onload = script.onreadystatechange = null;

                        if (head && script.parentNode) {
                            head.removeChild(script);
                        }

                        script = null;

                        !isAbort && complete && complete.apply(QQWB,[200,"success",QQWB.time.now() - started]);
                        isAbort && complete && complete.apply(QQWB,[-1,"aborted",QQWB.time.now() - started]);
                    }
                };

                script.onerror = function (e) { // ie 6/7/8/opera not supported(not tested)
				    clearTimeout(scriptLoadTimeout);
                    complete && complete.apply(QQWB,[404,e,QQWB.time.now() - started]);
                };

                head.insertBefore(script, head.firstChild);
            }

           ,abort: function () {
               if (script) {
                   script.onload(0,1);
               }
            }
        };
    }

    /**
     * The AJAX IO mechanism
     *
     * @access private
     * @param cfg {Object} the configration for ajax io
     * @return {Object} to send/abort the request
     */
   ,_IOAjax: function (cfg) {
	   
	   var callback,
	       ajaxTimeout,
	       cfg = cfg || {},
	       xhr = window.XMLHttpRequest ? 
	             new window.XMLHttpRequest() :
	             new window.ActiveXObject("Microsoft.XMLHTTP");

       if (!cfg.async) {
           cfg.async = "async";
       }

	   return {
		   send: function (complete) {
			   var started = QQWB.time.now();

			   if (cfg.username) {
				   xhr.open(cfg.type, cfg.url, cfg.async, cfg.username, cfg.password);
			   } else {
				   xhr.open(cfg.type, cfg.url, cfg.async);
			   }

			   try {
                   if (cfg.type == "POST") {
                       xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                   }
				   xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
				   xhr.setRequestHeader("X-Requested-From","TencentWeiboJavascriptSDK");
			   } catch (ex) {}

			   xhr.send(cfg.data || null);

			   ajaxTimeout = setTimeout(function () {
				   QQWB.log.warning("request timeout");
				   // ITEF Standard http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
				   complete(599,"network connect timeout",  QQWB.time.now() - started);
			   }, QQWB.io._globalIOTimeout);

			   callback = function (_, isAbort) {
				   var
				       status,
					   statusText,
					   responseHeaders,
					   responses,
                       response,
					   xml;


				   try {
					   // never called and (is aborted or complete)
				       if (callback && (isAbort || xhr.readyState === 4)) {
						   
						   // only call once
						   callback = null;

						   if (isAbort) {
							   if (xhr.readyState !== 4) {
								   xhr.abort();
							   }
						    } else {
								status = xhr.status;
								responseHeaders = xhr.getAllResponseHeaders();
								responses = {};
								xml = xhr.responseXML;

								if (xml && xml.documentElement) {
								    responses.xml = xml;
								}

								responses.text = xhr.responseText;

								try {
								    statusText = xhr.statusText;
								} catch (webkitException) {
									statusText = "";
								}

								if (status === 1223) {
								    status = 204;
								}

                                // parse to JSON
                                if (cfg.dataType.toLowerCase() == "json") { /// parse to json object
									response = QQWB.JSON.fromString(responses.text);
                                } else if (cfg.dataType.toLowerCase() == "xml") { // parse to xml object
                                    response = responses.xml;
                                } else { // as normal text
                                    response = responses.text;
                                }

					    	}

						   //if (response) { // when server returns empty body sometimes, response will never called
				               clearTimeout(ajaxTimeout);
					           complete(status, statusText, QQWB.time.now() - started, response, responses.text, responseHeaders, cfg.dataType); // take cfg.dataType back
						   //}
					   } // end readyState 4
			       } catch (firefoxException) {
					   status = -2;
					   statusText = (firefoxException && firefoxException.message) ? firefoxException.message : firefoxException;
					   QQWB.log.warning("caught " + statusText + " exception QQWB.io._IOAjax");
					   if (!isAbort) {
				           clearTimeout(ajaxTimeout);
						   //complete(xhr.status, xhr.statusText, QQWB.time.now() - started);
					       complete(status, statusText, QQWB.time.now() - started);
					   }
			       } // end try catch
			   };

			   if (!cfg.async || xhr.readyState === 4) {
			       callback();
			   } else {
				   xhr.onreadystatechange = callback;
			   }
		   }
		  ,abort: function () {
			  if (callback) {
			      callback(0, 1);
			  }
		   }
	   };
	   
    }
    /**
     * The Flash IO mechanism
     *
     * @access private
     * @param cfg {Object} the configration for script io
     * @return {Object} to send/abort the request
     */
   ,_IOFlash: function (cfg) {

	   var callback,
	       flashTimeout,
	       readyState,
	       cfg = cfg || {};
	   
	   return {
		   send: function (complete) {
			   var started = QQWB.time.now();
			   readyState = 1;

			   flashTimeout = setTimeout(function () {
				   QQWB.log.warning("request timeout");
				   complete(599,"network connect timeout",  QQWB.time.now() - started);
			   }, QQWB.io._globalIOTimeout);

               // the call is allowed call once
			   callback = function (_, isAbort) {
				   var
				       status,
					   statusText,
					   responseHeaders,
					   responses,
                       response,
					   xml,
					   readyState = 4;

				   clearTimeout(flashTimeout);

				   try{

				       if (callback && (isAbort || readyState == 4)) {

				           callback = null;

				           if (isAbort) {
				        	   complete(-1, "request has aborted", QQWB.time.now() - started);
				           } else {
				        	   var success = /complete/i.test(_.type);
				        	   status = success ? 200 : 204;
				        	   statusText = success ? "ok" : _.type;
				        	   responseHeaders = ""; //FIXME: fill responseHeaders with datas
				        	   responses = {}; // internal object
				        	   responses.text = _.target.data;

				        	   if (cfg.dataType.toLowerCase() == "json") { // parse to json object
				        		   response = QQWB.JSON.fromString(responses.text);
                               } else if (cfg.dataType.toLowerCase() == "xml"){ // parse to xml object
				        		   response = QQWB.XML.fromString(responses.text);
                               } else {
				        		   response = responses.text;
                               }
				           }

						   //if (response) { // when server returns empty body sometimes, response will never called
				        	   complete(status, statusText, QQWB.time.now() - started, response, responses.text, responseHeaders, cfg.dataType);
						   //}
					   }
					} catch (ex) {
					   status = -2;
					   statusText = (ex && ex.message) ? ex.message : ex;
					   QQWB.log.warning("caught " + statusText + " exception QQWB.io._IOFlash");
					   if (!isAbort) {
					       complete(status, statusText, QQWB.time.now() - started);
					   }
					}
			   };

			   // register flash message callback
			   // lazy initialize flash message callbacks
			   if (!window.onFlashRequestComplete_8df046) {

				   // this function will be called by flash when httpRequest is done
                   window.onFlashRequestComplete_8df046 = function (event) {
					   // first in first out
					   onFlashRequestComplete_8df046.callbacks.shift()(event);
                   };

				   // our callback queue
                   window.onFlashRequestComplete_8df046.callbacks = [];
		       }

			   // push to queue
               window.onFlashRequestComplete_8df046.callbacks.push(callback);
			   
			   if (QQWBFlashTransport && QQWBFlashTransport.httpRequest) {
			       QQWBFlashTransport.httpRequest(cfg.url,cfg.data,cfg.type);
			   } else {
			       QQWB.log.critical("flash transportation object error" + QQWBFlashTransportName);
			   }
		   }

		  ,abort: function () {
			  if (callback) {
			      callback(0,1);
			  }
		   }
	   };
    }
    /**
     * Helper method to make api ajax call
     *
     */
   ,_apiAjax: function (api, apiParams, dataType, type) {
       // build ajax acceptable opt object from arguments
       var opts = {
               type: type.toUpperCase()
              ,url: QQWB._domain.api + api
              ,data: QQWB.queryString.encode(apiParams)
              ,dataType: dataType
           };
       if (opts.type == "GET") {
           opts.url += opts.data ? "?" + opts.data : "";
           delete opts.data;
       }
       return QQWB.io.ajax(opts);
    }
	/**
	 * Helper method to make api ajax call via flash
	 *
	 */
  ,_apiFlashAjax: function (api, apiParams, dataType, type) {
       var opts = {
               type: type.toUpperCase()
              ,url: QQWB._domain.api + api
              ,data: QQWB.queryString.encode(apiParams)
              ,dataType: dataType
           };
       if (opts.type == "GET") {
           opts.url += opts.data ? "?" + opts.data : "";
           delete opts.data;
       }
       return QQWB.io.flashAjax(opts);
   }
   /**
	* SendResponse regarding api call
	*/
  ,_apiResponder: function (deferred) {
	  return function (status ,statusText ,elapsedtime ,parsedResponse ,responseText ,responseHeaders ,dataType) {
		  var retcode,errorcode;
          if (status !== 200) { // http error
		      // error code over than 2000000 represent physicall error
			  status = 2000000 + Math.abs((status ? status : 0));
              deferred.reject(status, statusText, elapsedtime, "");
		  } else if ( typeof (retcode = QQWB._apiProvider._apiParseRetCode(responseText)) == "number"
		             && 0 !== retcode
			        ) { // api error
		      errorcode = QQWB._apiProvider._apiParseErrorCode(responseText); 
		      // error code over than 1000000 and less than 2000000 represent logic error
			  status = 1000000 + retcode * 1000 + 500 + (errorcode ? errorcode : 0);
			  deferred.reject(status,  QQWB._apiProvider._apiGetErrorMessage(retcode,errorcode), elapsedtime, responseText);
          } else {
			  deferred.resolve(status, statusText, elapsedtime, parsedResponse, responseHeaders, dataType);
          }
	  };
   }
   /**
	* SendResponse regarding ajax call
	*/
  ,_ajaxResponder: function (deferred) {
	  return function (status ,statusText ,elapsedtime ,parsedResponse ,responseText ,responseHeaders ,dataType) {
          if (status !== 200) {
              deferred.reject(status, statusText, elapsedtime, "");
          } else {
              deferred.resolve(parsedResponse, elapsedtime, responseText);
          }
	  };
   }
   /**
	* Emulate AJAX request via flash
	*
	* @access public
	* @param opts {Object} url configuration object
	* @return {Object} promise object
	*/
  ,flashAjax: function (opts) {
       var 
           deferred = QQWB.deferred.deferred(),
           default_opts = {
               type: "get"
              ,dataType: "json"
           };

       QQWB.extend(default_opts, opts, true);
       QQWB.io._IOFlash(default_opts).send(QQWB.io._apiResponder(deferred));
	   return deferred.promise();
   }
	/**
	 * Ajax request sender
	 * 
	 * @access public
	 * @param opts {Object} ajax settings
	 * @return {Object} deferred object
	 */
   ,ajax: function (opts) {

       var 
           deferred = QQWB.deferred.deferred(),
           default_opts = {
               type: "get"
              ,dataType: "json"
           };

        QQWB.extend(default_opts, opts, true);

        QQWB.io._IOAjax(default_opts).send(QQWB.io._apiResponder(deferred));
		return deferred.promise();
    }
	/**
	 * Ajax request sender
	 *
	 * Note:
	 * 
	 * same as ajax, the only difference is when ajax success, 
	 * it only pass one response object as argument, this is the
	 * function to expose to our root namespace
	 * 
	 * @access public
	 * @param opts {Object} ajax settings
	 * @return {Object} deferred object
	 */
   ,ajax2: function (opts) {

       var 
           deferred = QQWB.deferred.deferred(),
           default_opts = {
               type: "get"
              ,dataType: "json"
           };

        QQWB.extend(default_opts, opts, true);
        QQWB.io._IOAjax(default_opts).send(QQWB._ajaxResponder(deferred));
		return deferred.promise();
    }
    /**
     * Dynamiclly load script
     *
     * @access public
     * @param src {String} script src
     * @param optCharset {String} script charset
     * @return {Object} promise
     */
   ,script: function (src, optCharset) {
       var
           optCharset = optCharset || "utf-8",
           deferred = QQWB.deferred.deferred();

       QQWB.io._IOScript({
           charset: optCharset
          ,url: src
       }).send(function (status, statusText, elapsedtime) {
           if (status !== 200) {
               deferred.reject(status, statusText, elapsedtime);
           } else {
               deferred.resolve(status, statusText, elapsedtime);
           }
       });

       return deferred.promise();
    }
    /**
     * JSONP request
     *
     * @access public
     * @param opts {Object} jsonp config
     * @return {Object} promise
     */
    ,jsonp: function (opts) {
        var 
            deferred = QQWB.deferred.deferred(),
            callbackQueryName = "callback", // callback name in query string
            callbackNamePrefix = "jsonp_", // jsonp callback function name prefix
            callbackName = callbackNamePrefix + QQWB.uid(), //random jsonp callback name
            _oldcallback = window.callbackName, // keep a reference to the variable we will overwrite(very little chance)
			timeCost,
            default_opts = {
                dataType: "text"
               ,charset: "utf-8"
               ,url: ""
            };

        QQWB.extend(default_opts, opts, true);

        if (default_opts.data) {
            default_opts.url += ("?" + default_opts.data +  "&" + callbackQueryName + "=" + callbackName);
        } 

        window[callbackName] = function (data) {

            var response = data;

            if (default_opts.dataType.toLowerCase() === "json") {
                response = QQWB.JSON.fromString(data);
            } else if (default_opts.dataType.toLowerCase() === "xml") {
                response = QQWB.XML.fromString(data);
            }
            // jsonp successed
            deferred.resolve(response, timeCost);

            window[callbackName] = _oldcallback; // restore back to original value
            
            //if (typeof window[callbackName] == "undefined") { // original value is undefined
                //delete window[callbackName]; // delete it
            //}
        };

        QQWB.io._IOScript(default_opts).send(function (status, statusText, elapsedtime) {
            if (status !== 200) {
                deferred.reject(status, statusText, elapsedtime);
            }
			timeCost = elapsedtime;
        });


       return deferred.promise();
    }
});

// expose to global namespace
QQWB._alias("ajax",QQWB.io.ajax2);
QQWB._alias("jsonp",QQWB.io.jsonp);
QQWB._alias("script",QQWB.io.script);
/**
 * Tencent weibo javascript library
 *
 * Token management
 *
 * @author michalliu
 * @version 1.0
 * @package auth
 * @module token
 * @requires base
 *           core.time
 *           core.cookie
 *           core.io
 *           common.String
 */
QQWB.extend("_token",{
    /**
     * Save access token to cookie
     *
     * @access public
     * @param accessToken {String} access token string
     * @param expireIn {Number} expire after seconds from now
     * @param optUsername {String} username associate with accesstoken
     * @param optNickname {String} nickname associate with accesstoken
     * @return {Object} QQWB object
     */
    setAccessToken: function (accessToken, expireIn, optUsername, optNickname) {
        var tokenUser = this.getTokenUser(true); // retrieve the old user info accesstoken
        QQWB.cookie.set(QQWB._cookie.names.accessToken
                       ,[accessToken
                           ,QQWB.time.now() + expireIn * 1000
                           ,optUsername || (tokenUser && tokenUser.name) || ""
                           ,optNickname || (tokenUser && tokenUser.nick) || ""
                        ].join("|")
                       ,365 * 24 * 3600
                       ,QQWB._cookie.path
                       ,QQWB._cookie.domain
            );
        return QQWB;
    }
    /**
     * Get access token saved before
     *
     * @access public
     * @param optRaw {Boolean} if set to true, will not consider about accesstoken expiration
     * @return {String|undefined} a string represent access token if available
     */
   ,getAccessToken: function (optRaw) {
       var token = QQWB.cookie.get(QQWB._cookie.names.accessToken);
       if (token) {
           token = token.split("|",2);
           if (optRaw || parseInt(token[1],10) > QQWB.time.now()) {
               return token[0];
           }
       }
    }
    /**
     * Get user infomation associated with access token
     *
     * @access public
     * @param optRaw {Boolean} if set to true, will not consider about expiration
     * @return {Object|undefined} an user object associated with access token if available
     */
   ,getTokenUser: function (optRaw) {
       var token = QQWB.cookie.get(QQWB._cookie.names.accessToken);
       if (token) {
           token = token.split("|",4);
           if (optRaw || parseInt(token[1],10) > QQWB.time.now()) {
               return {
                   name: token[2]
                  ,nick: token[3]
               };
           }
       }
    }
    /**
     * Clear access token
     *
     * @access public
     * @return {Object} QQWB object
     */
   ,clearAccessToken: function () {
        QQWB.cookie.del(QQWB._cookie.names.accessToken,QQWB._cookie.path,QQWB._cookie.domain);
        return QQWB;
    }
    /**
     * Save refresh token to cookie
     *
     * @param refreshToken {String} refresh token string
     * @return {Object} QQWB object
     */
   ,setRefreshToken: function (refreshToken) {
        QQWB.cookie.set(QQWB._cookie.names.refreshToken
                       ,refreshToken
                       ,365 * 24 * 3600
                       ,QQWB._cookie.path
                       ,QQWB._cookie.domain
            );
        return QQWB;
    }
    /**
     * Get refresh token saved before
     *
     * @return {String|undefined} a string represent refresh token if available
     */
   ,getRefreshToken: function () {
        return QQWB.cookie.get(QQWB._cookie.names.refreshToken);
    }
    /**
     * Clear refresh token
     *
     * @access public
     * @return {Object} QQWB object
     */
   ,clearRefreshToken: function () {
        QQWB.cookie.del(QQWB._cookie.names.refreshToken,QQWB._cookie.path,QQWB._cookie.domain);
        return QQWB;
    }
    /**
     * Use refresh token to obtain an access token
     *
     * @access public
     * @param optCallback {Function} callback function when result returned
     */
   ,exchangeForToken: function (optCallback) {
       QQWB.io.jsonp({
                url: QQWB._domain.exchange
               ,data: QQWB.queryString.encode({
                          response_type: "token"
                         ,client_id: QQWB.appkey.value
                         ,scope: "all"
                         ,state: "1"
                         ,refresh_token: this.getRefreshToken()
                         ,access_token: this.getAccessToken(true)
                      })
       }).success(function (response) {

           var _response = response;

           QQWB.String.isString(response) && (response = QQWB.queryString.decode(response));

           if(response.access_token){

               !response.expires_in && QQWB.log.error("token expires_in not retrieved");
               !response.wb_name && QQWB.log.warning("weibo username not retrieved, will not update username");
               !response.wb_nick && QQWB.log.warning("weibo usernick not retrieved, will not update usernick");

               QQWB._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wb_name, response.wb_nick);

               if (response.refresh_token) { // which should exists if accesstoken exists
                    QQWB._token.setRefreshToken(response.refresh_token);
               } else {
                   QQWB.log.error("refresh token not retrieved");
               }

               QQWB.log.info("exchange token succeed");

           } else if (response.error) {
               QQWB.log.error("exchange token error " + response.error );
           } else {
               QQWB.log.error("unexpected result returned from server " + _response + " while exchanging for new access token");
           }

       }).error(function (status, statusText) {
           if (status === 404) {
               QQWB.log.error("exchange token has failed, script not found");
           } else {
               QQWB.log.error("exchange token has failed, " + statusText);
           }
       }).complete(function (arg1, arg2, arg3) {
           optCallback && optCallback.apply(QQWB,[arg1, arg2, arg3]);
       });

       return QQWB;
    }
    /**
     * Obtain an access token
     *
     * @access public
     * @param optCallback {Function} callback function when result returned
     */
   ,getNewAccessToken: function (optCallback) {
       QQWB.io.jsonp({
               url: QQWB._domain.query
              ,data: QQWB.queryString.encode({
                   response_type: "token"
                  ,client_id: QQWB.appkey.value
                  ,scope: "all"
                  ,state: "1"
               })
       }).success(function (response) {

           var _response = response;

           QQWB.String.isString(response) && (response = QQWB.queryString.decode(response));

           if(response.access_token){

               !response.expires_in && QQWB.log.error("token expires_in not retrieved");
               !response.wb_name && QQWB.log.warning("weibo username not retrieved");
               !response.wb_nick && QQWB.log.warning("weibo usernick not retrieved");

               QQWB._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wb_name, response.wb_nick);

               if (response.refresh_token) { // which should exists if accesstoken exists
                    QQWB._token.setRefreshToken(response.refresh_token);
               } else {
                   QQWB.log.error("refresh token not retrieved");
               }

               QQWB.log.info("retrieve new access token succeed");

           } else if (response.error) {
               QQWB.log.error("retrieve new access token error " + response.error );
           } else {
               QQWB.log.error("unexpected result returned from server " + _response + " while retrieving new access token");
           }

       }).error(function (status, statusText) {
           if (status === 404) {
               QQWB.log.error("get token has failed, script not found");
           } else {
               QQWB.log.error("get token failed, " + statusText);
           }
       }).complete(function (arg1, arg2, arg3) {
           optCallback && optCallback.apply(QQWB,[arg1, arg2, arg3]);
       });

       return QQWB;
    }
    /**
     * Auto resolve response from server
     *
     * @param responseText {String} the server response
     * @param optGlobal {Object} the global window object,default is current window
     */
   ,resolveResponse: function (responseText, optGlobal) {
       var 
           loginStatus,
           global = (optGlobal || window)["QQWB"],
           response = QQWB.String.isString(responseText) ? global.queryString.decode(responseText) : responseText;

       if (response.access_token) {

           global._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wb_name, response.wb_nick);

           if (response.refresh_token) { // which should exists if accesstoken exists
               global._token.setRefreshToken(response.refresh_token);
           } else {
               global.log.error("refresh token not retrieved");
           }

           loginStatus = global.loginStatus(); // get current login status
           global.log.info("user " + loginStatus.name + " logged in");
           global.trigger(global.events.USER_LOGGEDIN_EVENT,loginStatus);
       } else if (response.error) {
           global.log.error("login error occurred " + response.error);
           response.message = response.error; // alternative error name
           global.trigger(global.events.USER_LOGIN_FAILED_EVENT,response);
       } else {
           global.log.error("unexpected result returned from server " + responseText);
           response.message = response.error = "server error";
           global.trigger(global.events.USER_LOGIN_FAILED_EVENT,response);
       }
    }
});
/**
 * Tencent weibo javascript library
 *
 * A simple event system provide hooks
 *
 * @author michalliu
 * @version 1.0
 * @package event
 * @module eventProvider
 * @requires base
 *           common.Array
 */
QQWB.extend("_eventProvider",{

    /**
     * Get event system's internal map or create it if not exists
     *
     * @access private
     * @return {Object} the internal event map
     */
    _getEventsMap: function () {
        if (!this._eventsMap) {
            this._eventsMap = {};
        }
        return this._eventsMap;
    }

    /**
     * Bind an event
     *
     * @access public
     * @param name {String} the event name to bind
     * @param handler {Function} the handler for this event
     * @return {Void}
     */
   ,bind: function (name, handler) {
       var evts = this._getEventsMap();
       if (!evts[name]) {
           evts[name] = [handler];
       } else {
           if (!QQWB.Array.inArray(evts[name],handler)) {
               evts[name].push(handler);
           }
       }
    }

    /**
     * Unbind an event
	 * 
	 * If no handler provided, it will unbind all the handlers to this event
     * @access public
     * @param name {String} the event name to unbind
     *        handler {Function} the handler's reference for this event to unbind
     * @return {Void}
     */
   ,unbind: function (name, handler) {
	   var handlers = this._getEventsMap()[name];
	   if (handlers) {
		   if (handler) { // unbind specific handler,do nothing if handler not registered
			   for (var i=0,l=handlers.length; i<l; i++) {
				   if (handler === handlers[i]) {
					   handlers[i] = null;
				   }
			   }
		   } else { // unbind all the handlers
			   //handlers.length = 0;
			   delete this._getEventsMap()[name];
		   }
	   }
    }

   /**
	* Trigger a named event
	*
	* @access private
	* @param name {String} the event name
	*        data {Mixed} the event data
	*/
   ,trigger: function (name, data) {
	   var handlers = this._getEventsMap()[name];
	   if (handlers) {
           for (var i=0,l=handlers.length; i<l; i++) {
			   var handler = handlers[i];
			   if (handler) {
				   handler.call(QQWB,data);
			   }
           }
	   }
    }
});
/**
 * Tencent weibo javascript library
 *
 * Event API
 *
 * @author michalliu
 * @version 1.0
 * @package event
 * @module event
 * @requires base
 *           common.Array
 *           eventProvider
 */

// event methods
//
QQWB.extend("",{
    /**
     * Bind an event
     *
     * Example:
     * 
     * T.bind("UserLoggedIn", function () {
     *     T.log.info("user logged in");
     * });
     *
     * @param name {String} event name to bind
     * @param handler {Function} the handler for this event
     */
    bind: function (name, handler) {
        name = name.toLowerCase();
        this._eventProvider.bind(name, handler);
    	return this;
    }

    /**
     * Bind an event but only execute once
     *
     * Example:
     * 
     * T.once("UserLoggedIn", function () {
     *     T.log.info("user logged in");
     * });
     *
     * @param name {String} event name to bind
     * @param handler {Function} the handler for this event
     */
   ,once: function (name, handler) {
		name = name.toLowerCase();
		var handlerWrapper = function () {
			var args = QQWB.Array.fromArguments(arguments);
			handler.apply(QQWB, args);
            this._eventProvider.unbind(name, handlerWrapper);
			handlerWrapper = null;
		}
        this._eventProvider.bind(name, handlerWrapper);
    	return this;
	}

    /**
     * Unbind an event
     *
     * Example:
     *
     * // handler for when user logged in
     * // keep a reference to this handler
     * var userlogin = function () {
     *     T.log.info("user logged in");
     * }
     *
     * // bind handler
     * T.bind("UserLoggedIn", userlogin);
     *
     * // unbind this handler 
     * T.unbind("UserLoggedIn", userlogin);
     *
     * // unbind all the handlers
     * T.unbind("UserLoggedIn")
     *
     * @param name {String} event name to unbind
     *        handler {Function} the handler's reference for this event to unbind
     */
   ,unbind: function (name, handler) {
        name = name.toLowerCase();
        this._eventProvider.unbind(name, handler);
	    return this;
    }

    /**
     * Trigger an event manually
     *
     * Example:
     *
     * T.trigger("UserLoggedIn");
     *
     * @param eventName {String} the event's name to bind
     * @param data {Mixed} the data passed to the callback function
     */
   ,trigger: function (name, data) {
        name = name.toLowerCase();
        this._eventProvider.trigger(name, data);
        return this;
    }
});

// internal supported events names
QQWB.extend("events", {
    USER_LOGGEDIN_EVENT: "UserLoggedIn"
   ,USER_LOGIN_FAILED_EVENT: "UserLoginFailed"
   ,USER_LOGGEDOUT_EVENT: "UserLoggedOut"
   ,TOKEN_READY_EVENT: "tokenReady"
   ,DOCUMENT_READY_EVENT: "documentReady"
   ,EVERYTHING_READY_EVENT: "everythingReady"
});
/**
 * Tencent weibo javascript library
 *
 * Browser and browser's feature detection
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module browser
 * @requires base
 *           log
 */

(function (){
    var 
        browserMatch; // ua regexp match result
    var
              ua = navigator.userAgent,
           rmsie = /(msie) ([\w.]+)/,
          ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
         rwebkit = /(webkit)[ \/]([\w.]+)/,
        rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;
    var
        browserFeatures = {}, // keep browser features
        browserPrefixes = ["Webkit","Moz","O","ms","khtml"],
        featureTests = {
             "cookie": function () {
                 var cookieEnabled = navigator.cookieEnabled;
                 if (cookieEnabled && QQWB.browser.webkit) {
                     // resolve webkit bug
                     var cookiename = "COOKIE_TEST_" + QQWB.uid();
                     // try to set a test cookie
                     document.cookie = cookiename + "=" + 1 +"; domain=; path=;";
                     // check cookie exists or not
                     if (document.cookie.indexOf(cookiename) < 0) {
                         cookieEnabled = false;
                     } else {
                         // remove test cookie
                         document.cookie = cookiename + "=" +"; expires=" + new Date(1970,1,1).toUTCString() + "; domain=; path=;";
                     }
                 }
                 !cookieEnabled && QQWB.log.critical("Your browser doesn't support cookie or cookie isn't enabled");
                 return cookieEnabled;
             }
            ,"flash": function () { // code borrowed from http://code.google.com/p/swfobject
                 if (typeof navigator.plugins != "undefined" && typeof navigator.plugins["Shockwave Flash"] == "object") {
                     var desc = navigator.plugins["Shockwave Flash"].description; // plug in exists;
                     var enabled = typeof navigator.mimeTypes != "undefined"
                                  && navigator.mimeTypes["application/x-shockwave-flash"]
                                  && navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin;
                     return desc && enabled;
                 } else if (typeof window.ActiveXObject != "undefined") {
                     try {
                         var flashAX = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                         if (flashAX) {
                             return flashAX.getVariable("$version");
                         }
                     } catch (ex) {}
                 }
             }
            ,"userdata": function () {
                return QQWB.browser.msie;
             }
            ,"postmessage": function () {
                // ie8 support postmessage but it does not work with window.opener
                return !!window.postMessage && ((QQWB.browser.msie && parseInt(QQWB.browser.version,10) < 8) ? false : true); 
             }
            ,"canvas": function () {
                var elem = document.createElement("canvas");
                return !!(elem.getContext && elem.getContext("2d"));
            }
            ,"webgl": function () {
                return !!window.WebGLRenderingContext;
            }
            ,"geolocation": function () {
                return !!navigator.geolocation;
            }
            ,"websqldatabase": function () {
                return !!window.openDatabase;
            }
            ,"indexeddb": function () {
                for (var i = 0, l = browserPrefixes.length; i < l; i++) {
                    if (window[browserPrefixes[i].toLowerCase() + "IndexedDB"]) {
                        return true;
                    }
                }
                return !!window.indexedDB;
            }
            ,"websocket": function () {
                for (var i = 0, l = browserPrefixes.length; i < l; i++) {
                    if (window[browserPrefixes[i].toLowerCase() + "WebSocket"]) {
                        return true;
                    }
                }
                return !!window.WebSocket;
            }
            ,"localstorage": function () {
                return window.localStorage && localStorage.getItem;
            }
            ,"sessionstorage": function () {
                return window.sessionStorage && sessionStorage.getItem;
            }
            ,"webworker": function () {
                return !!window.Worker;
            }
            ,"applicationcache": function () {
                return !!window.applicationCache;
            }
        };

    // detect browser type and version rely on the browser's user-agent
    function uaMatch (ua) {
        ua = ua.toLowerCase();
        var 
            match = rwebkit.exec( ua ) ||
                    ropera.exec( ua ) ||
                    rmsie.exec( ua ) ||
                    ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
                    [];

        return { browser: match[1] || "unknown", version: match[2] || "0" };
    }

    // test browser features
    // now we only support little features
    // please visit http://www.modernizr.com for full feature test
    function featureTest () {
        for (var feature in featureTests) {
            if (featureTests.hasOwnProperty(feature)) {
                if (featureTests[feature]()) {
                    browserFeatures[feature] = true;
                }
            }
        }
    }

	// code borrowed from http://detectmobilebrowsers.com/
	function getPlatform() {
		var platform = navigator.userAgent || navigator.vendor || window.opera;
		if (/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(platform) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(platform.substr(0, 4))) {
			return {mobile: true};
		}
		return {pc: true};
	}

	function getOS() {
		var appversion = navigator.appVersion,
		    os = {},
		    osName = "unknown";
        if (appversion.indexOf("Win")!=-1) { osName="windows"};
        if (appversion.indexOf("Mac")!=-1) { osName="mac"};
        if (appversion.indexOf("X11")!=-1) { osName="unix"};
        if (appversion.indexOf("Linux")!=-1) { osName="linux"};
		os[osName] = true;
		return os;
	}

    browserMatch = uaMatch(ua);

    QQWB.extend('browser',{
        "version":browserMatch.version
    });

    QQWB.browser[browserMatch.browser] = true;

    featureTest();

    QQWB.extend('browser.feature',browserFeatures);
	QQWB.extend('browser.platform', getPlatform());
	QQWB.extend('browser.os', getOS());

}());
/**
 * Tencent weibo javascript library
 *
 * Flash(swf file) loader
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module flash
 * @requires base
 *           common.Array
 *           browser
 *           dom
 */
QQWB.extend("flash",{
    NO_CACHE: 1
    /**
     * Load swf to the current page by swf file path
     *
     * @access public
     * @param swfPath {String} the swf file path
     * @param optCallback {Function} the optCallback when swf is ready
     * @param optCache {Number} indicate whether cache the swf file
     * @return Flash {Object}
     */
   ,load: function (swfPath, optCallback, optCache) { 

       // lazy create the loaded swfs
       if (!this.loadedSwfs) {
           this.loadedSwfs = [];
       }

       // if that swf already loaded, prevent to load the same swf again
       if (QQWB.Array.inArray(this.loadedSwfs, swfPath)) {
           QQWB.log.warning(swfPath + "is already loaded");
           return;
       }

	   // defect cache
       if (optCache === this.NO_CACHE) {
	       swfPath += "?" + QQWB.uid();
       }

       // this is the function name will be called inside flash
       // to indicate that the flash itself is ready now
       var movieContainerId= "movieContainer_" + QQWB.uid(),
           movieName = "movie_" + QQWB.uid(),
           flashReadyCallbackName = "onFlashReady_a1f5b4ce",
           _flashReady = window[flashReadyCallbackName];

       window[flashReadyCallbackName] = function () {

           optCallback && optCallback(movieName);
           // restore back to original value
           window[flashReadyCallbackName] = _flashReady;
           // if the original value is undefined
           // then delete it
           //if (typeof _flashReady === "undefined") {
               //delete window[flashReadyCallbackName];
           //}
           // clean up variables in closure to avoid memory leak in IE
           _flashReady = null;
           optCallback && (optCallback = null);
           movieName = null;
       };

       // code generated
       QQWB.dom.appendHidden(['<object'
                              ,  'type="application/x-shockwave-flash"'
                              ,  'id="' + movieName + '"'
                              ,  QQWB.browser.msie ? 'name="' + movieName +  '"' : ''
                              ,  QQWB.browser.msie ? 'data="' + swfPath + '"' : ''
                              ,  QQWB.browser.msie ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"' : ''
                              ,  'allowscriptaccess="always">'
                              ,  '<param name="movie" value="' + swfPath + '"></param>'
                              ,  '<param name="allowscriptaccess" value="always"></param>'
                              ,  '</object>'
                              ].join(" "),{id:movieContainerId},true);
       return document.getElementById(movieContainerId);
    }
    /**
     * Retrieve the swf object
     *
     * @access public
     * @param name {String} the swf name
     * @param {Object} the swf object
     */
   ,getSWFObjectByName: function (name) {
       if (QQWB.browser.msie) {
           return window[name];
       } else {
           if (document[name].length) {
               return document[name][1];
           }
           return document[name];
       }
    }
});
/**
 * Tencent weibo javascript library
 *
 * solution manager
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module solution
 * @requires base
 *           deferred
 *           common.Array
 *           dom
 *           flash
 */
QQWB.extend("_solution", {

    HTML5_SOLUTION: "html5"

   ,FLASH_SOLUTION: "flash"

   ,SILVER_LIGHT_SOLUTION: "silverlight"

   ,initSolution: function (name) {

       var solution,  // the choosed solution

           // the whole initilized process is success?
           // this is the deferred object for the whole process
           // not the single solution
           solutionInit = QQWB.deferred.deferred();

       // if the solution passed in we supported
	   // and not initialized
	   // then initialze it
       if (!this[name] && QQWB.Array.inArray([this.HTML5_SOLUTION
                                             ,this.FLASH_SOLUTION
                                             ,this.SILVER_LIGHT_SOLUTION]
                                             ,name)) {

           // a choosed solution object
           this[name] = {};

		   // represent the solution's name
		   this[name]["name"] = name;

           // indicate choosed solution is ready or not
           // 0 not resolved
           // 1 solution is relsolved successfully
           // 2 solution is rejected
           this[name]["readyState"] = 0;

           // the choosed solution id
           // use to indendify the solution object
           this[name]["id"] = "solution_" + QQWB.uid();

           // the choosed solution deferred ready object
           this[name]["deferred"] = QQWB.deferred.deferred();

           // the choosed solution deferred ready promise object
           this[name]["promise"] = this[name]["deferred"].promise();

	   }

       // register callback to sub solutions deferred object
       // if choosed solution failed then the whole solution failed,vice versa
	   if (this[name] && this[name].readyState !== 0) {
           this[name].deferred.success(function () {
                solutionInit.resolve(QQWB.Array.fromArguments(arguments));
           }).fail(function () {
                solutionInit.reject(QQWB.Array.fromArguments(arguments));
	       });
	   } else {
           // switch between solution types
           switch (name) {
               // this is the html5 solution
               case this.HTML5_SOLUTION:
               // the browser must support postmessage feature
               // to support html5 solution
               if (QQWB.browser.feature.postmessage) {
                   // reference for choosed solution object
                   solution = this[this.HTML5_SOLUTION];
                   var messageHandler = function (e) {
                       // we expected the message only come from serverproxy (we trusted)
                       // omit other messages, to protect your site alway from XSS/CSRF attack
                       if (QQWB._domain.serverproxy.indexOf(e.origin) !== 0) {
	                       QQWB.log.warning("unexpected message arrived from " + e.origin + " with data " + e.data);
	        	       } else { // this is the message we expected
                           if (e.data === "success") {
                               QQWB.log.info("html5 solution was successfully initialized");
                               solution.readyState = 1;
                               solution.deferred.resolve();
                           } else { // amm.. the trusted server post a message we don't understand
                               QQWB.log.info("unexpected solution signal " + e.data);
                           }
                       }
                       // clean up things
                       //
                       // unbind handlers
                       if (window.addEventListener) {
                           window.removeEventListener("message", messageHandler, false);
                       } else if (window.attachEvent) {
                           window.detachEvent("onmessage", messageHandler);
                       }
                       // 
                       messageHandler = null;
                   };

                   if (window.addEventListener) {
                       window.addEventListener("message", messageHandler, false);
                   } else if (window.attachEvent) {
                       window.attachEvent("onmessage", messageHandler);
                   }

                   // append the server frame to page
                   QQWB.everythingReady(function () {
                       QQWB.log.info("init html5 solution...");
                       serverframe = QQWB.dom.createHidden("iframe", {id: solution.id,src: QQWB._domain.serverproxy});
                       QQWB.dom.append(serverframe);
                       // the onload event is fired before the actually content loaded
                       // so we set a delay of 1 sec
                       // if serverframe doesn't post that message, we know there is an error
                       // maybe a 404 Error?
                       // the onload event will fired on chrome even the frame is 404 !!!
                       // there is no frame.onerror event
                       serverframe.onload = function (e) {
                           setTimeout(function () {
                               // should be 1 now, if everything is fine
                               // if not there is a problem
                               if (solution.readyState !== 1) {
                                   QQWB.log.error("html5 solution initialition has failed, server proxy frame encountered error");
                                   solution.readyState = 2;
                                   solution.deferred.reject(-1,"server proxy frame not working");
                               }
                           }, 1 * 1000)/* check delayed */;
                       };
                   });
               } else { // browser don't support postmessage feature, the html5 solution failed
                   QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support postmessage";
                   solutionInit.reject("browser not supported");
               }
               break;

               case this.FLASH_SOLUTION:
               // the browser must support flash feature to initliz flash solution
               if (QQWB.browser.feature.flash) {
                   // reference for choosed solution object
                   solution = this[this.FLASH_SOLUTION];

	        	   QQWB.everythingReady(function () {
                       QQWB.log.info("init flash solution...");
	        		   var resolveTimer,
	        		       resolveTimeout = 10 * 1000,
	        		       movieBox = QQWB.flash.load(QQWB._domain.flashproxy, function (moviename) {
							  QQWB.log.info("flash solution initlized successfully");
	        	              solution.readyState = 1;
							  window["QQWBFlashTransport"] = QQWB.flash.getSWFObjectByName(moviename);
	        				  // clear the timer
	        				  resolveTimer && clearTimeout(resolveTimer);
	        	              solution.deferred.resolve();
                           }, QQWB.flash.NO_CACHE/* ie has problems if cache allowed,please advice if you know a better solution*/);
	        		   
                       // if solution didn't marked as resolved(success) after 30 seconds 
	        		   // mark the solution to failed and do clean up
	        		   resolveTimer = setTimeout(function () {
	        	    		   if (!solution.deferred.isResolved()) {
	        	    		       solution.readyState = 2;
	        	    		       solution.deferred.reject(-1, "encounter error while loading proxy swf, need newer flash player");
	        	    		       // remove the box cotains the flash
	        	    		       QQWB.dom.remove(movieBox);
	        	    		   }
	        	    	   }, resolveTimeout);
	        	       //
	        	   });

               } else {
                   QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support flash or flash is disabled";
                   solutionInit.reject("browser not supported");
               }
               break;

               case this.SILVER_LIGHT_SOLUTION:
               if (QQWB.browser.feature.silverlight) {
                   // silverlight not implemented
                   ~1;
                   QQWB.log.error("sorry, silverlight solution is not implemented");
               } else {
                   QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support silverlight or silverlight is disabled";
                   solutionInit.reject("browser not supported");
               }
               break;

               default:
               QQWB.log.error("can't init solution \"" + name) +"\",not supported";
               solutionInit.reject("solution " + name + " not supported");
               break;
           }

	       }
           
           return solutionInit.promise();
    }
});
/**
 * Tencent weibo javascript library
 *
 * Pingback
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module ping
 * @requires base
 *           solution
 *           cookie
 *           browser
 *           queryString
 */

QQWB.extend("ping", {

	// pingback url
	_pingbackURL: "http://btrace.qq.com/collect"

	// params order
   ,_stupidPingParamsOrder:["ftime","sIp","iQQ","sBiz","sOp","iSta","iTy","iFlow"]

   // params seprator
   ,_paramSeprator: ";"

	// generate a basic ping params
   ,_getBasePingParams: function () {
	    // unique flow id
		var     qq = QQWB.cookie.get("uin",null,"0").match(/\d+/)[0],
		    flowid = ""; // not implemented
        return {
            sIp:"" // ip
           ,iQQ: qq // QQ
           ,sBiz:"open-js" // biz name
           ,sOp:"" // operation name
           ,iSta:""  // state
           ,iTy:1183 // system id
           ,iFlow: flowid// unquie id
		   ,iFrom: "" // op from
		   ,iPubFrom: "" // op from
		   ,sUrl: "" // op url
		   ,iUrlType: "" // url type
		   ,iPos:"" // op position
		   ,sText:"" // some text
		   ,iBak1: ""
		   ,iBak2: ""
		   ,sBak1: ""
		   ,sBak2: QQWB.uid()
         };
	 } 
	// ping with parameters
   ,pingWith: function (params, order) {
	   // we are intend to use global variable to avoid browser drop the ping request
	   params = QQWB.extend(QQWB.ping._getBasePingParams(), params, true);
	   QQWBPingTransport_18035d19 = new Image(1,1);
	   QQWBPingTransport_18035d19.src = QQWB.ping._pingbackURL 
	                                    + "?" 
	                                    + QQWB.queryString.encode(params, null, null, order);
    }
	// ping when appkey initilizing, success or unsuccess
   ,pingInit: function () {

	   function getClientInfo () {
		  var clientInfo = 1000000 
		      feature = 0;

    	  if (QQWB.browser.msie) {
			  clientInfo += 100;
          } else if(QQWB.browser.opera) {
			  clientInfo += 200;
          } else if(QQWB.browser.webkit) {
			  clientInfo += 300;
          } else if(QQWB.browser.mozilla) {
			  clientInfo += 400;
    	  } else {
			  clientInfo += 500;
    	  }
    
    	  if (QQWB.browser.feature.postmessage) {
			  feature += 1;
    	  }
    	  if (QQWB.browser.feature.flash) {
			  feature += 2;
          }
    	  if (QQWB.browser.feature.cookie) {
			  feature += 4;
          }

		  clientInfo += feature;

		  // 1000(browertype)0(browserfeature)
		  //
		  return clientInfo;
	   };

	   function getAppInfo () {
		   var appInfo = 1000000;
		   if (QQWB.browser.platform.mobile) {
			   appInfo += 100;
		   } else /*if (QQWB.browser.platform.pc)*/{
			   appInfo += 200;
		   }

		   if (QQWB.browser.os.windows) {
			   appInfo += 10;
		   } else if (QQWB.browser.os.windows) {
			   appInfo += 20;
		   } else if (QQWB.browser.os.mac) {
			   appInfo += 30;
		   } else if (QQWB.browser.os.unix) {
			   appInfo += 40;
		   } else if (QQWB.browser.os.linux) {
			   appInfo += 50;
		   } else /*if (QQWB.browser.os.unknown)*/{
			   appInfo += 60;
		   }

		   appInfo += parseInt(QQWB.appkey.version,10);

		   // 1000(platform)(os)(appkeyversion)
		   return appInfo;
	   };

	   return QQWB.ping.pingWith({
		    sOp: "init"
		   ,iFrom: QQWB.version.replace(/\./g,"")
		   ,iPubFrom: getAppInfo()
		   ,sUrl: [document.title,document.location.href].join(QQWB.ping._paramSeprator)
		   ,sText: QQWB.appkey.value
		   ,iBak1: getClientInfo()
	   }, QQWB.ping._stupidPingParamsOrder.concat("iFrom","iPubFrom","sUrl","iUrlType"
	                                             ,"iPos","sText","iBak1","iBak2","sBak1","sBak2"));
    }
	// Send pingback when user authorize(loggin) success or fail
   ,_pingAuthorize: function (success) {
	   return QQWB.ping.pingWith({
		    sOp: "login"
		   ,iSta: success ? 1 : 0
		   ,iFrom: QQWB.version.replace(/\./g,"")
		   ,sUrl: document.location.href
		   ,sText: QQWB.appkey.value
	   }, QQWB.ping._stupidPingParamsOrder.concat("iFrom","iPubFrom","sUrl","iUrlType"
	                                             ,"iPos","sText","iBak1","iBak2","sBak1","sBak2"));
    }
	// Send pingback when user successfull login
   ,pingLoggedIn: function () {
	   return QQWB.ping._pingAuthorize(true);
    }
	// Send pingback when user unsuccessfull login
   ,pingLoggedInFailed: function () {
	   return QQWB.ping._pingAuthorize(false);
    }
	/**
	 * Send pingback when api is called
	 *
	 * @param apiname {String} apiname
	 * @param params {String} params
	 * @param method {String} http method
	 * @param responseTime {Number} response time
	 * @param status {Number} api result status
	 * @param statusText {String} status text
	 * @param solutionName {String} html5 or flash
	 *
	 * @return {Void}
	 */
   ,pingAPI: function (apiname, params, format, method,  status, statusText, responseTime, solutionName) {
	   var solutionInfo = 1000000;
	   apiname = apiname || "";// represent unknown apiname
	   params = params || "";// represent unknown params
	   format = format || "";// represent unknown format
	   method = method || "";// represent unknown method
	   status = status || "-2"; // represent unknown status
	   statusText = statusText || ""; // represent unknown status text
	   responseTime = responseTime || "-1"; // represent unknown responsetime
	   solutionName = solutionName || "";// represent unknown solutionName

       switch(solutionName){
           case QQWB._solution.HTML5_SOLUTION:
           case "postmessage":
           solutionInfo+=100;
		   break;
           case QQWB._solution.FLASH_SOLUTION:
           solutionInfo+=200;
		   break;
           case QQWB._solution.SILVER_LIGHT_SOLUTION:
           solutionInfo+=400;
		   break;
       }

	   method = method.toUpperCase();
       switch(method){
           case "GET":
           solutionInfo+=10;
		   break;
           case "POST":
           solutionInfo+=20;
		   break;
       }

	   return QQWB.ping.pingWith({
		    sOp: "api"
		   ,iSta: status
		   ,iFrom: QQWB.version.replace(/\./g,"")
		   ,iPubFrom: solutionInfo
		   ,sUrl: document.location.href
		   ,sText: QQWB.appkey.value
		   ,iBak1: responseTime
		   ,sBak1: [apiname, params].join(QQWB.ping._paramSeprator)
		   //,sBak2: statusText
	   }, QQWB.ping._stupidPingParamsOrder.concat("iFrom","iPubFrom","sUrl","iUrlType"
	                                             ,"iPos","sText","iBak1","iBak2","sBak1","sBak2"));
    }
});

/**
 * Tencent weibo javascript library
 *
 * Locker mechanism
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module door
 * @requires base
 */
QQWB.extend("door", {

	// count of doors
    doors:0

	/**
	 * Retrieve a new door object, the door can be locked or unlocked
	 *
	 * @access public
	 * @param optLockDo {Function} actions do when lock acts
	 * @param optUnlockDo {Function} action do when unlock acts
	 * @return {Object} locker object
	 */
   ,door: function (optLockDo, optUnlockDo) {

	    // the locks number on this door
        var locks = 0;

		// record the total number of door instance
        this.doors ++;

        return {
			/**
			 * Lock the door
			 *
			 * @access public
			 */
            lock: function () {
                locks ++;
				optLockDo && optLockDo.call(QQWB);
				return this;
            }
			/**
			 * unLock the door
			 *
			 * @access public
			 */
           ,unlock: function () {
               locks --;
			   locks = Math.max(0,locks);
			   optUnlockDo && optUnlockDo.call(QQWB);
			   return this;
            }
			/**
			 * Check whether the door instance is open
			 *
			 * @access public
			 */
           ,isOpen: function () {
               return locks === 0;
            }
        };
    }
	/**
	 * Retrieve the number of lockers
	 *
	 * @access public
	 * @return {Number} count of lockers
	 */
   ,count: function () {
       return this.doors;
    }
});
/**
 * Tencent weibo javascript library
 *
 * Library booter
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module boot
 * @requires base
 *           door
 *           browser
 *           apiProvider
 *           deferred
 *           common.String
 *           common.Array
 *           common.JSON
 *           auth.token
 *           event.event
 *           solution
 *           ping
 *           time
 */

QQWB.extend("",{
    /**
     * Init with appkey and proxy
     *
     * @access public
     */
    init: function (opts) {
           if (this._inited === true) {
               this.log.warning("already initialized");
               return this;
           }
           this.log.info("init signal has arrived");
           var 
               accessToken = this._token.getAccessToken(),
               rawAccessToken = this._token.getAccessToken(true), 
               refreshToken = this._token.getRefreshToken(),
               needExchangeToken = refreshToken && !accessToken && rawAccessToken,
               needRequestNewToken = !refreshToken && !accessToken,
               clientProxy = opts.proxy || document.location.href.replace(location.search,"").replace(location.hash,"");

           if (opts.appkey) {
               this.log.info("client id is " + opts.appkey);
               this.assign("appkey.value","APPKEY",opts.appkey);
           }

           this.log.info("client proxy uri is " + clientProxy);
           this.assign("_domain","CLIENTPROXY_URI",clientProxy);

		   if (opts.pingback == false) {
		       this.pingback = false;
		   }

           if (/*true || force exchange token*/needExchangeToken || needRequestNewToken) {
               QQWB._tokenReadyDoor.lock(); // lock for async get or refresh token
           }

           if (/*true || force exchange token*/needExchangeToken) {
               this.log.info("exchanging refresh token to access token...");
               QQWB._token.exchangeForToken(function (response) {

                   // does it really neccessary?
                   if (response.error) {// exchangeToken encountered error, try to get a new access_token automaticly
                       QQWB.log.warning("exchange token has failed, trying to retrieve a new access_token...");
                       this._tokenReadyDoor.lock();// lock for async refresh token
                       QQWB._token.getNewAccessToken(function () {
                           this._tokenReadyDoor.unlock();// unlock for async refresh token
                       });
                   }

                   // don't put this segment to top
                   // because of the stupid door-locking mechanism
                   this._tokenReadyDoor.unlock();// unlock for async refresh token

               });
           } else if (needRequestNewToken) {
               this.log.info("retrieving new access token...");
               QQWB._token.getNewAccessToken(function () {
                   QQWB._tokenReadyDoor.unlock(); // unlock for async get token
               });
           }

		   if (/^[a-z\d][a-z\d]{30}[a-z\d]$/i.test(QQWB.appkey.value)) {
               this.assign("appkey","APPKEY_VERSION",1);
	       } else if (/^[1-9][0-9]{7}[0-9]$/.test(QQWB.appkey.value)) {
               this.assign("appkey","APPKEY_VERSION",2);
	       } else {
               this.assign("appkey","APPKEY_VERSION",3);
	       }

           this._inited = true;

           QQWB._tokenReadyDoor.unlock();

		   this.pingback && this.ping && this.ping.pingInit();
           this.pingback && this.ping && QQWB.bind(QQWB.events.USER_LOGGEDIN_EVENT,this.ping.pingLoggedIn);
           this.pingback && this.ping && QQWB.bind(QQWB.events.USER_LOGIN_FAILED_EVENT,this.ping.pingLoggedInFailed);

           return this;
    }
    /**
     * The door controls library ready
     */
    ,_tokenReadyDoor: QQWB.door.door(function () {
            this.log.info("tokenReady is locked");
        }, function () {
            this.log.info("tokenReady is unlocked");
            // the this keyword is pointing to QQWB forced
            this._tokenReadyDoor.isOpen() && this.log.info("token is ready") && this.trigger(this.events.TOKEN_READY_EVENT);
        })
   /**
    * Add callback funtions when the sdk is ready
    * 
    * @access public
    * @param handler {Function} callback function
    * @return {Object} QQWB object
    */
   ,tokenReady: function (handler) {
       if (this._tokenReadyDoor.isOpen()) { // token is ready or not
           handler && handler();
       } else {
           this.bind(this.events.TOKEN_READY_EVENT, handler);
       }
       return this;
    }
    /**
     * Indicate whether the document is ready
     */
   ,_isDocumentReady: false
    /**
     * We are trying to trigger the document ready event
     * The document ready event will only be triggered once
     */
   ,_tryToTriggerDocumentReadyEvents: function () {
       if (this._isDocumentReady) { // the event already be triggered,will never trigger again
           return;
       }
       try { // running the test, if no exception raised, the document is ready
           var el = document.getElementsByTagName("body")[0].appendChild(document.createElement("span"));
           el.parentNode.removeChild(el);
       } catch (ex) { // document isn't ready
           return;
       }
       this._isDocumentReady = true;
       this.log.info ("document is ready");
       this._everythingReadyDoor.unlock(); // unlock for document ready
       this.trigger(this.events.DOCUMENT_READY_EVENT);
    }
    /**
     * Add handlers when document is ready
     *
     * @access public
     * @param handler {Function} handler
     * @return {Object} QQWB
     */
   ,documentReady: function (handler) {
       if (this._isDocumentReady) { // we are sure the document is ready to go
           handler && handler();
       } else {
           this.bind(this.events.DOCUMENT_READY_EVENT,handler);// cache the handlers, these hanlders will called when document is ready to go
           this._tryToTriggerDocumentReadyEvents(); // trigger the document ready event as early as posibble
       }
	   return this;
    }
    /**
     * The door controls everything ready
     */
    ,_everythingReadyDoor: QQWB.door.door(function () {
            this.log.info("everythingReady is locked");
        }, function () { // the "this" keyword is pointing to QQWB forced
            this.log.info("everythingReady is unlocked");

            this._everythingReadyDoor.isOpen()
            && this.log.info("everything is ready")
            //&& this.log.info("current user is " + this.loginStatus().name)
            && this.trigger(this.events.EVERYTHING_READY_EVENT);
        })
   /**
    * Add callback funtions when everything is ready
    * 
    * @access public
    * @param handler {Function} callback function
    * @return {Object} QQWB object
    */
   ,everythingReady: function (handler) {
       if (this._everythingReadyDoor.isOpen()) { // library and document, is all of them ready?
           handler && handler();
       } else {
           this.bind(this.events.EVERYTHING_READY_EVENT, handler); // internal events
       }
       return this;
    }
});

T.alias("ready","everythingReady");

// boot library
(function () {
    var 
        inFrame = window != window.parent, // iframe
        asServer = QQWB._domain.serverproxy === window.location.href; // as server proxy

    // auto adopt a solution to client(browser)
    function initSolution() {
        if (QQWB.browser.feature.postmessage) {
            QQWB._solution.initSolution(QQWB._solution.HTML5_SOLUTION);
        } else if (QQWB.browser.feature.flash) {
            QQWB._solution.initSolution(QQWB._solution.FLASH_SOLUTION);
        } else {
            QQWB.log.error("init solution is called, but no solution for the browser");
        }
    }

    QQWB._tokenReadyDoor.lock(); // init must be called
    QQWB._everythingReadyDoor.lock(); // token must be ready
    QQWB._everythingReadyDoor.lock(); // document(DOM) must be ready
    
    QQWB.bind(QQWB.events.TOKEN_READY_EVENT, function () {
        QQWB._everythingReadyDoor.unlock(); // unlock for token ready
    });

    if (inFrame && asServer && QQWB.browser.feature.postmessage) {
        QQWB.log.info("library booting at server proxy mode");
        var 
			targetOrigin = "*", // we don't care who will handle the data
            appWindow = window.parent; // the third-party application window

        // post a message to the parent window indicate that server frame(itself) was successfully loaded
        appWindow.postMessage("success", targetOrigin); 

        // recieve message from appWindow as data transfer proxy
		var messageHandler = function (e) {
			// accept any origin
			// we do strict api check here to protect from XSS/CSRF attack
			//
			var 
			    data = QQWB.JSON.fromString(e.data),
				id = data.id, // message id related to the deferred object
				args = data.data, //
				apiInterface = args[0]; //  the api interface should be the first argument

			if (args[2].toLowerCase() == "xml") {
				// if dataType is xml, the ajax will return a xml object, which can't call
				// postMessage directly (will raise an exception) , instead we request to tranfer
				// XML as String, then parse it back to XML object.
				// io.js will fall to response.text
				// api.js will detect that convert it back to xml
				// @see io.js,api.js
				args[2] = "xmltext";
			}

			if (!apiInterface) { // interface can not be empty
				appWindow.postMessage(QQWB.JSON.stringify({
					id: id
				   ,data: [-1, "interface can not be empty"]
				}), targetOrigin);
				QQWB.log.error("interface is empty");
			} else {
				// This is extremely important to protect from XSS/CSRF attack
				if (!QQWB._apiProvider.isProvide(apiInterface)) {
			    	appWindow.postMessage(QQWB.JSON.stringify({
			    		id: id
			    	   ,data: [-1, "interface \"" + apiInterface +"\" is not supported"]
			    	}), targetOrigin);
				    QQWB.log.error("interface \"" + apiInterface +"\" is not allowed to be called");
				} else {
					// everything goes well
					// we directly pass the data to the reciever regardless its success or not
					//
					QQWB.io._apiAjax.apply(this,args).complete(function () {
						// can't stringify a xml object here
			        	appWindow.postMessage(QQWB.JSON.stringify({
			        		id: id
			        	   ,data: QQWB.Array.fromArguments(arguments)
			        	}), targetOrigin);
					});
				}
		   }
        };

        if (window.addEventListener) {
            window.addEventListener("message", messageHandler, false);
        } else if (window.attachEvent) {
            window.attachEvent("onmessage", messageHandler);
        }

        return;
    }
    
    QQWB.log.info("library booting at normal mode");
    initSolution();

}());

// process document ready event
if (!QQWB._isDocumentReady) { // we will try to trigger the ready event many times when it has a change to be ready

    if (window.addEventListener) {
        document.addEventListener("DOMContentLoaded", function () {
            QQWB._tryToTriggerDocumentReadyEvents();
        }, false);
    }

    if (window.attachEvent) {
        document.attachEvent("onreadystatechange", function () {
            if (/complete/.test(document.readyState)) {
                document.detachEvent("onreadystatechange", arguments.callee);
                QQWB._tryToTriggerDocumentReadyEvents();
            }
        });
        if (window === window.top) { // not inside a frame
            (function (){

                if (QQWB._isDocumentReady) {return;}

                try {
                    document.documentElement.doScroll("left");
                } catch (ex) {
                    setTimeout(arguments.callee, 0);
                    return; // don't bother to try, the document is definitly not ready
                }

                QQWB._tryToTriggerDocumentReadyEvents();

            }());
        }
    }

    if (QQWB.browser.webkit) {
        (function () {
            if (QQWB._isDocumentReady) {return;}
            if (!(/load|complete/.test(document.readyState))) {
                setTimeout(arguments.callee, 0);
                return; // don't bother to try, the document is definitly not ready
            }
            QQWB._tryToTriggerDocumentReadyEvents();
        }());
    }
}

// exhange token scheduler
(function () {

	var maintainTokenScheduler;

	function maintainTokenStatus () {

		var canMaintain = !!QQWB._token.getAccessToken(), // user logged in set timer to exchange token
	      	waitingTime; // server accept to exchange token 30 seconds before actually expire date

        maintainTokenScheduler && QQWB.log.info("cancel the **OLD** maintain token schedule");
        maintainTokenScheduler && clearTimeout(maintainTokenScheduler);

		if (canMaintain) {
		    // server should accept to exchange token 30 seconds before actually expire date
	      	waitingTime = parseInt(QQWB.cookie.get(QQWB._cookie.names.accessToken).split("|")[1],10)
	                      - QQWB.time.now()
	                      - 15 * 1000 /*15 seconds ahead of actual expire date*/;
			QQWB.log.info("scheduled to exchange token after " + waitingTime + "ms");

			maintainTokenScheduler = setTimeout(function () {
				QQWB._token.exchangeForToken(function () {
					maintainTokenStatus();
				});
			}, waitingTime);
		} else {
			maintainTokenScheduler && QQWB.log.info("cancel the exchange token schedule");
            maintainTokenScheduler && clearTimeout(maintainTokenScheduler);
		}
	}

	QQWB.bind(QQWB.events.TOKEN_READY_EVENT,maintainTokenStatus);
	QQWB.bind(QQWB.events.USER_LOGGEDIN_EVENT,maintainTokenStatus);
	QQWB.bind(QQWB.events.USER_LOGIN_FAILED_EVENT,maintainTokenStatus);
	QQWB.bind(QQWB.events.USER_LOGGEDOUT_EVENT,maintainTokenStatus);

}());
/**
 * Tencent weibo javascript library
 *
 * Crossbrowser localstorage solution
 *
 * @author michalliu
 * @version 1.0
 * @package compat
 * @module localStorage
 * @requires base
 *           core.browser
 *           core.boot
 *           core.log
 *           core.time
 *           JSON2
 */

if (QQWB.browser.feature.localstorage) { // implement html5 localstorge
    QQWB.extend("localStorage", {
        set: function (key, value, expireInDays) {
            key = "k" + key;
            var 
                expire = QQWB.time.secondsNow() + (expireInDays || 7) * 24 * 3600,
                val = {
                    value: value
                   ,expire: expire
                };
            localStorage[key] = JSON.stringify(val);
            return localStorage[key];
        }
       ,get: function (key, defaultVal) {
           key = "k" + key;
           var temp = localStorage[key];
           if (temp && (temp = JSON.parse(temp)) && temp.value &&  QQWB.time.secondsNow() < temp.expire) {
               return temp.value;
           }
           return defaultVal;
        }
       ,del: function (key) {
           key = "k" + key;
           localStorage.removeItem(key);
           return !!!localStorage[key];
        }
    });
} else if (QQWB.browser.feature.userdata) {
    var 
        userData,
        storeName = "QQWBLocalStore";

    QQWB.documentReady(function () {
        userData = document.createElement("input");
        userData.type = "hidden";
        userData.style.display="none";
        userData.addBehavior("#default#userData");
        userData.expires = new Date(QQWB.time.now() + 365 * 10 * 24 * 3600 * 1000).toUTCString();
        document.body.appendChild(userData);
    });

    QQWB.extend("localStorage", {
        set: function (key, value, expireInDays) {
            key = "k" + key;
            var 
                expire = QQWB.time.secondsNow() + (expireInDays || 7) * 24 * 3600,
                val = {
                    value: value
                   ,expire: expire
                };
            !userData && QQWB.log.error("store can't set value for key " + key + ", userData is unavaiable, please try later");
            userData && userData.load(storeName);
            userData && userData.setAttribute(key,JSON.stringify(val));
            userData && userData.save(storeName);
            return userData.getAttribute(key);
        }
       ,get: function (key, defaultVal) {
           key = "k" + key;
           !userData && QQWB.log.error("store can't get value for key " + key + ", userData is unavaiable, please try later");
           userData && userData.load(storeName);
           var temp = userData && userData.getAttribute(key);
           if (temp && (temp = JSON.parse(temp)) && temp.value && QQWB.time.secondsNow() < temp.expire) {
               return temp.value;
           }
           return defaultVal;
        }
       ,del: function (key) {
           key = "k" + key;
           !userData && QQWB.log.error("store can't delete value for key " + key + ", userData is unavaiable, please try later");
           userData && userData.load(storeName);
           userData && userData.removeAttribute(key);
           userData && userData.save(storeName);
           return !!!userData.getAttribute(key);
       }
   });

} else {
    QQWB.log.warning("T.localStorage object isn't initialized, do check before use");
}

if (QQWB.localStorage) {
    QQWB._alias.call(QQWB.localStorage,"save",QQWB.localStorage.set);
    QQWB._alias.call(QQWB.localStorage,"remove",QQWB.localStorage.del);
}
/**
 * Tencent weibo javascript library
 *
 * authorization window management
 *
 * @author michalliu
 * @version 1.0
 * @package auth
 * @module authWindow
 * @requires base
 *           core.queryString
 */
QQWB.extend("auth.authWindow",{
    // auth window width
	_width: QQWB._const.AUTH_WINDOW_WIDTH 
   // auth window height
   ,_height: QQWB._const.AUTH_WINDOW_HEIGHT 
   // auth window name
   ,_name: QQWB._const.AUTH_WINDOW_NAME
   // auth url
   ,_url: QQWB._domain.auth
   // auth window attributes
   ,_attribs: "toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=yes,status=no"
   // auth window status
   ,_authorizing: false
   // reference to auth DOMWindow
   ,_window: null
   // show auth window, if already showed do nothing
   ,show: function () {
	   var x,y,query,props;
	   if (!this._authorizing) {
		   x = (window.screenX || window.screenLeft) + ((window.outerWidth || document.documentElement.clientWidth) - this._width) / 2;
		   y = (window.screenY || window.screenTop) + ((window.outerHeight || document.documentElement.clientHeight) - this._height) / 2;
		   query =  QQWB.queryString.encode({
                response_type: "token"
               ,client_id: QQWB.appkey.value
               ,redirect_uri: QQWB._domain.clientproxy
               ,scope: "all"
               ,status: 0
           });
		   props = ["width="+this._width,"height="+this._height,"left="+x,"top="+y]
	       this._window = window.open(this._url + "?" + query, this._name, props+","+this._attribs);
		   this._authorizing = true;

		   (function () {
			   var authwindow = QQWB.auth.authWindow,
			       response;
               if (authwindow._window.closed) { //already closed
                   QQWB._token.resolveResponse("error=access_denied");
		       	   authwindow.close();
                   return;
		       } else {
		           try {
		            	response = authwindow._window.location.hash;	
		           } catch (ex) {
		           	    response = null;
		           }
		           if (response) {
					   response = QQWB.queryString.decode(response.split("#").pop());
					   if (parseInt(response.status,10) == 200) {
		                   QQWB._token.resolveResponse(response);
					   }
		               authwindow.close();
		               return;
		           }
                   setTimeout(arguments.callee, 0);
               }
            }());
    	} else {
			this.focus();
    	}
	   return this;
    }
   ,close: function () { 
	   this._authorizing = false;
	   if (!this._window) { // has auth window
		   return this;
	   }
	   if (this._window.closed) { // auth window alreay closed
		   return this;
	   }
	   this._window.close(); // closed the window
	   return this;
    }
   ,focus: function () {
	   this._window && this._window.focus();
	   return this;
    }
});
/**
 * Tencent weibo javascript library
 *
 * Authenticate user
 *
 * @author michalliu
 * @version 1.0
 * @package auth
 * @module auth
 * @requires base
 *           token
 *           authWindow
 *           event.event
 *           core.queryString
 *           core.log
 */
QQWB.extend("auth",{
    /**
     * Login in user
     *
     * @access public
     * @param optSuccessHandler {Function} handlers when login is success
     * @param optFailHandler {Function} handlers when login is fail
     * @return {Object|undefined}
     */
    login: function (optSuccessHandler, optFailHandler) {

        if (!QQWB._inited) {
            QQWB.log.critical("Library not initialized, call T.init() to initialize");
        }

        var loginStatus = QQWB.loginStatus(), 
            onLoginSessionComplete; // hander on this logon session complete

		// user loggedin at successhandler is passedIn
		// that's the only thing we need to do
		if (loginStatus && optSuccessHandler) {
            optSuccessHandler(loginStatus);
			return;
		}

		// handler exists
		if (optSuccessHandler || optFailHandler) {
			onLoginSessionComplete = function (arg1) {
				if(arg1.access_token && optSuccessHandler) {
					optSuccessHandler(arg1);
				} else if(arg1.error && optFailHandler){
					optFailHandler(arg1);
				} else {
					// the result should be success or error
                    QQWB.log.warning("confused result of T.login");
				}
                QQWB.unbind(QQWB.events.USER_LOGGEDIN_EVENT, onLoginSessionComplete);
                QQWB.unbind(QQWB.events.USER_LOGIN_FAILED_EVENT, onLoginSessionComplete);
                onLoginSessionComplete = null;
			};
            QQWB.bind(QQWB.events.USER_LOGGEDIN_EVENT, onLoginSessionComplete);
            QQWB.bind(QQWB.events.USER_LOGIN_FAILED_EVENT, onLoginSessionComplete);
		}

		// show auth window
		QQWB.auth.authWindow.show().focus();

        return QQWB;
    }

    /**
     * Logout user
     *
     * @return {Object} QQWB object
     */
   ,logout: function (optHandler) {
	   var loginStatus = QQWB.loginStatus();
       QQWB.log.info("logging out user...");
       if (!loginStatus) {
           QQWB.log.warning("oops, user not logged in");
       } else {
           QQWB._token.clearAccessToken();
           QQWB._token.clearRefreshToken();
           QQWB.log.info(loginStatus.name + " has logged out successfully");
       }
       optHandler && optHandler.call(QQWB);
       QQWB.trigger(QQWB.events.USER_LOGGEDOUT_EVENT);
       return QQWB;
    }

   /**
    * Get login status object
    *
    * @access public
    * @param optCallback {Function} callback handler
    * @return {Object|undefined}
    */
   ,loginStatus: function (optCallback) {
       var 
           status,
           accessToken = QQWB._token.getAccessToken(),
           user = QQWB._token.getTokenUser();

       if (accessToken) {
           status = {
               access_token: accessToken
              ,name: user.name
              ,nick: user.nick
           };
       }

       optCallback && optCallback.call(QQWB, status);

       return status;
    }
});
QQWB._alias("login",QQWB.auth.login);
QQWB._alias("logout",QQWB.auth.logout);
QQWB._alias("loginStatus",QQWB.auth.loginStatus);
/**
 * Tencent weibo javascript library
 *
 * API call
 *
 * Example:
  
    T.api(
       "/status/home_timeline"
      ,{
          maxpage: 20
       }
      ,"json","GET")
 *  .success(function (response) {
 *  })
 *  .error(function (error) {
 *  });
 *
 *  Note:
 *
 *  T.api method supports cache, when the condition meets.
 *  The cached api will run automaticlly.
 *
 *  If there is a problem when processing to meet the condition.
 *  then the api call will failed too.
 *
 * @access public
 * @param api {String} the rest-style api interface
 * @param apiParams {Object} api params
 * @param optDataType {String} the dataType supports either "json","xml","text", case-insensitive, default is "json"
 * @param optType {String} the request method supports either "get","post", case-insensitive, default is "get"
 * @param optSolution {String} use solution by force @see QQWB.solution
 * @return {Object} promise object
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module api
 * @requires base
 *           common.XML
 *           common.Array
 *           common.JSON
 *           apiProvider
 *           deferred
 *           auth.token
 *           auth.auth
 *           queryString
 */

QQWB.provide("api", function (api, apiParams, optDataType, optType, optSolution) {

	api = this._apiProvider.compat(api);
	apiParams = apiParams || {};
    optDataType = (optDataType || "json").toLowerCase();
    optType = optType || "GET";

	var 
    	promise,
		solution,
		format = optDataType, // the format string in oauth querystring
		supportedFormats = {json:true,xml:true/*,text:true*/},
    	deferred = QQWB.deferred.deferred();
	
	if (!(format in supportedFormats)) {
		format = "json";
	}

	apiParams["oauth_consumer_key"] = QQWB.appkey.value;
	apiParams["oauth_token"] = QQWB._token.getAccessToken();
	apiParams["oauth_version"] = "2.0";
	apiParams["format"] = format;


    promise = deferred.promise();

	// force to use specified solution
	if (optSolution && QQWB.Array.inArray([QQWB._solution.HTML5_SOLUTION
                                          ,QQWB._solution.FLASH_SOLUTION
										  ,QQWB._solution.SILVER_LIGHT_SOLUTION]
										  ,optSolution)) {
		QQWB.log.warning("forced to use solution " + optSolution);
		// solution has initialized let that solution handle the request
		if(!QQWB._solution[optSolution]) { // solution not initiallize, initialize it
		    QQWB.log.warning("forced to use solution " + optSolution + ", this solution is not inited, initialzing...");
		    QQWB._solution.initSolution[optSolution];
		}
	    solution = QQWB._solution[optSolution];
	} else {
        // solutions with following priority order
        solution =  (QQWB.browser.feature.postmessage && QQWB._solution[QQWB._solution.HTML5_SOLUTION])
            || (QQWB.browser.feature.flash && QQWB._solution[QQWB._solution.FLASH_SOLUTION])
            || (QQWB.browser.feature.silverlight && QQWB._solution[QQWB._solution.SILVER_LIGHT_SOLUTION]);

	}

	// don't handle that, let server to the job
	// then pass a failed message to the callback
    //
	/*if (false && !QQWB._apiProvider.isProvide(api)) {
		QQWB.log.error("can't call \"" + api +"\", not supported");
		deferred.reject(-1, "api not supported"); // immediately error
		return promise;
	}*/

	// no solution or selected solution failed initialze
	// its not possible to implement to QQWB.api method working
	// very little chance
	if (!solution || solution.readyState === 2) {
		QQWB.log.critical("solution error");
		deferred.reject(-1, "solution error",0/*time cost*/); // immediately error
		return promise;
	}

    //TODO: if api call required solution is flash
    //then cache the function do flash solution init
	//if (!solution.support(api)) {
		// choose other solution
		// return  QQWB.api(api, apiParams, optDataType, optType, other solution);
	//}

	// if api called before the solution is ready, we cached it and waiting the solution ready
	// when solution is ready, regardless success or fail, these cached function will be invoke again immediately
	if (solution.readyState === 0) { //solution not ready
		QQWB.log.warning("solution is not ready, your api call request has been cached, will invoke immediately when solution is ready");
    	solution.promise.done(function () { // when solution is ready
		    QQWB.log.info("invoking cached api call \"QQWB.api( " + [api, apiParams, optDataType, optType].join(",") + " )\"...");

			// emulate the request send it to server
			// when data backs, resolve or reject the deferred object previously saved.
			// then pass the data in accordingly
			QQWB.api(api, apiParams, optDataType, optType)
			    .success(function () {
				    deferred.resolveWith(deferred,QQWB.Array.fromArguments(arguments));
				 })
			    .error(function (){
				    deferred.rejectWith(deferred,QQWB.Array.fromArguments(arguments));
			     }); // keep the arguments
		}).fail(function () { // solution failed, we use the arguments from boot section (boot.js)
		    QQWB.log.error("can't invoking cached api call \"QQWB.api( " + [api, apiParams, optDataType, optType].join(",") + " )\"");
		    deferred.rejectWith(deferred,QQWB.Array.fromArguments(arguments));
		});
		return promise;
	}

	// must be here everything must be ready already from here
	
    // user not logged in, don't bother to try to get data
	if (!QQWB.loginStatus()) {
        QQWB.log.error("failed to make api call, not logged in");
		deferred.reject(-1, "not login", 0); // immediately error
		return promise;
	}

	// record the serial
	if (!QQWB.api.id) {
		QQWB.extend(QQWB.api, {
			id: 0
            // how many api call this page does?
		   ,total: function () {
			   return QQWB.api.id;
		    }
		});
	}

    QQWB.api.id ++;

	// describe what we are to do now
    QQWB.log.info("[" + QQWB.api.id + "] requesting data \"" + QQWB._apiProvider.describe(api) + "\" from server...");

    // html5 solution
    if (solution === QQWB._solution[QQWB._solution.HTML5_SOLUTION]) {
			var serverProxy = document.getElementById(solution.id);
			if (!serverProxy) { // double check to avoid the server frame was removed from dom unexpectly
	            QQWB.log.critical("server proxy not found");
	            deferred.reject(-1,"server proxy not found", 0);
			} else {
                // server proxy's url should be same as QQWB._domain.serverproxy, if not may be we got the wrong element
				if (serverProxy.src !== QQWB._domain.serverproxy) { // double check to avoid the server frame src was modified unexpectly 
	                QQWB.log.critical("server proxy is not valid, src attribute has unexpected value");
	                deferred.reject(-1,"server proxy not valid", 0);
				} else {
					// everything goes well
                 	// lazy create an collection object to maintain the deferred object
                 	// only html5 solution need this
                 	if (!QQWB.api._deferredCollection) {
                 		QQWB.extend(QQWB.api, {
                 		    _deferredCollection: {
                 		    }
                 		   ,deferredAt: function (deferredId) {
                 			   if (this._deferredCollection[deferredId]) {
                 			       return this._deferredCollection[deferredId];
                 			   } else {
                 	               QQWB.log.warning("get deferred object has failed, that object does not exist at index " + deferredId);
                 			   }
                 		    }
                 			// uncollect the deferred object
                 		   ,uncollect: function (deferredId) {
                 			   if (this._deferredCollection[deferredId]) {
                 			       delete this._deferredCollection[deferredId];
                 			   } else {
                 	               QQWB.log.warning("uncollect deferred object has failed, that object does not exist at index " + deferredId);
                 			   }
                 		    }
                 			// collect an deferred object to collections
                 		   ,collect: function (deferredObj) {
                 			   if (deferredObj.promise) { // it's an deferred object
                 			       this._deferredCollection[this.id] = deferredObj;
                 			       return this.id;
                 			   } else { // we dont accpept other than deferred object
                 	               QQWB.log.warning("collect a non-deferred object is illegal");
                 			   }
                 		    }
                 		});
                 	}

					if (!QQWB.api.messageHandler) {
						// add listeners for the data when data comes back
						QQWB.provide("api.messageHandler", function (e) {
							// we only trust the data back from the API server, ingore others
							// This is important for security reson
							if (QQWB._domain.serverproxy.indexOf(e.origin) !== 0) {
	                            QQWB.log.warning("unexpected message arrived from " + e.origin + " with data " + e.data);
							} else {
								// here is the result comes back

								// data.id represent the caller's id to know which deferred object should handle the data
								// data.data reprent the result return from API server
								var 
							    	data = QQWB.JSON.fromString(e.data),
									id = data.id,
									relateDeferred = QQWB.api.deferredAt(id),
							    	response = data.data;

								if (relateDeferred) {
							        if (response[0] !== 200) {
										relateDeferred.reject.apply(relateDeferred,response);
									} else {
										if (response[5] == "xmltext") {
											response[3] = QQWB.XML.fromString(response[3]);
										}
										//relateDeferred.resolve.apply(relateDeferred,[response[2],response[3]]);
                                        relateDeferred.resolve(response[3]/* response body */, response[2]/* elpased time */, response[4]/*response header*/);
							    	}
									QQWB.api.uncollect(id);
								} else {
	                                QQWB.log.warning("related deferred object not found, it shouldn't happen");
								}
							}
						}); // end provide

                        if (window.addEventListener) {
                            window.addEventListener("message", QQWB.api.messageHandler, false);
                        } else if (window.attachEvent) {
                            window.attachEvent("onmessage", QQWB.api.messageHandler);
                        }
					}
                 
					try {
						// IE8 has problems if not wrapped by setTimeout
						// @see http://ejohn.org/blog/how-javascript-timers-work/
						var collectionID = QQWB.api.collect(deferred);

						// we send async request at the same time
						// and through id we know the result belong
						// to which request
						setTimeout(function () {
                            // send to proxy server
                            // IE only support String type as the message
                            // @see http://msdn.microsoft.com/en-us/library/cc197015(v=vs.85).aspx
                            serverProxy.contentWindow.postMessage(QQWB.JSON.stringify({ 
                            	id: collectionID
                               ,data: [api, apiParams, optDataType, optType]
                            }),QQWB._domain.serverproxy);
						}, 0 );

					} catch (ex) {
	                    QQWB.log.critical("post message to server proxy has failed, " + ex);
	                    deferred.reject(-1,ex,0);
					}
				} // end server proxy src modified check
			} // end server proxy existance check

	} else if (solution === QQWB._solution[QQWB._solution.FLASH_SOLUTION]) {
		// @see io.js onFlashRequestComplete_8df046 for api call sequence management
		QQWB.io._apiFlashAjax(api, apiParams, optDataType, optType).complete(function () {
			var response = QQWB.Array.fromArguments(arguments);
			if (response[0] !== 200) {
				deferred.reject.apply(deferred,response);
			} else {
				//deferred.resolve.apply(deferred,[response[2],response[3]]);
                deferred.resolve(response[3]/* response body */, response[2]/* elpased time */, response[4]/*response header*/);
			}
		});
	}

	// describe that we have done the request
    (function () {
        var serial = QQWB.api.id;
     	promise.complete(function () {
             QQWB.log.info("*[" + serial + "] done");
             serial = null; // defect memory leak in IE
     	});
        //send pingback
		if (QQWB.pingback && QQWB.ping) {
			function sendPingback(status, statusText, responseTime) {
                QQWB.ping.pingAPI(api,QQWB.queryString.encode(apiParams),optDataType,optType, status, statusText, responseTime, solution.name);
			}
			promise.success(function (response, elapsedTime) {
                sendPingback(200,"ok",elapsedTime);
			});
			promise.fail(function (status, statusText, elapsedTime) {
                sendPingback(status,statusText,elapsedTime);
			});
		}
    }());

    return promise;
});
