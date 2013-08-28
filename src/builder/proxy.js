/**
 * Tencent weibo javascript library
 *
 * Server side runs
 *
 * @author michalliu
 * @version 1.0
 * @package builder
 * @module proxy
 * @requires base
 *           core.log
 *           core.io
 *           util.bigtable
 *           util.queryString
 *           core.init
 *           common.JSON
 *           common.Array
 *           common.String
 *           weibo.util
 */

/*jslint laxcomma:true */
// build server side proxy

// boot library
(function () {

    var _ = QQWB,

        _j = _.JSON,

        _a = _.Array,

        _s = _.String,

        _b = _.bigtable,

        _q = _.queryString,

        _l = _.log,

        _i = _.io,

        messageHandler,

        sameOrigin,

        rootDomain = _b.get("innerauth","rootdomain"),

        targetOrigin = "*", // we don't care who will handle the data

        asyncCallbackName = _b.get('openjs','asynccallbackfunctionname'),

        appWindow; // the third-party application window


    document.domain = rootDomain;

    appWindow = window.parent;

    /*
     * getToken by uin&skey
     *
     * @param appkey {String} appkey
     * @param force {Boolean} if true force to retrieve a token regardless whether uin had been authorize this appkey
     */
    window.getToken = function (appkey,force) {

        var safekey = document.cookie.match(/skey=([^;]+)/) || document.cookie.match(/lskey=([^;]+)/);

        return  _i.ajax({

            url: _b.get('uri','gettokenbypt'),

            type: 'post',

            data:['appkey=',appkey
                 ,'&version=2.a'
                 ,'&response_type=', force ? 'token' : 'check'
                 ,'&seqid=', Math.floor(Math.random() * 10E5)
                 ,'&appfrom=openjs' + T.version
                 ,'&g_tk=', safekey ? safekey[1] : ''].join(''),

            dataType: 'text'

        });

    };

    /**
     * send API Ajax request
     *
     * @param api {String} apiName
     * @param apiParams {Map} params Map of this api
     * @param dataType {String} json or xml or text
     * @param type {String} get or post
     */
    window.apiAjax = function (api, apiParams, dataType, type) {
    
        var opts = {
    
                type: _s.trim(type.toUpperCase())
    
               ,url: _b.get("uri","api") + api
    
               ,data: _q.encode(apiParams)
    
               ,dataType: _s.trim(dataType.toLowerCase())
    
            };
    
        if (opts.type == "GET") {
    
            opts.url += (opts.data ? "?" + opts.data : "");
    
            delete opts.data;
    
        }
    
        return _i.apiAjax(opts);
    
    };
    
    try {

        sameOrigin = appWindow.location.href;

    } catch (SecurityError) {

    }

    if (sameOrigin) {

        _l.info('[proxy] app running at same origin');

        if (appWindow.QQWB) {

            _l.info('[proxy] openjs used in app');

            appWindow.QQWB.trigger(_b.get("innerauth","eventproxyready"));

        }
        /*
         * if appWindow.QQWB not exists this main code will never excecute
         * for proxy OpenJS is always sync loaded
         else if (typeof appWindow[asyncCallbackName] == "function") {

            _l.info('[proxy] openjs async loading in app');

            (function () {

                if (appWindow.QQWB) {

                    _l.info('[proxy] openjs async loaded in app');

                    appWindow.QQWB.trigger(_b.get("innerauth","eventproxyready"));

                    return;
                }

                setTimeout(arguments.callee, 200);

            }());

        } 
        */
           else {

            _l.warning("[proxy] openjs not detected in app");

        }

    } else {

        _l.info('[proxy] app running at external auth mode');

    }

    // post a message to the parent window indicate that server frame(itself) was successfully loaded
    if ( appWindow && appWindow.postMessage) {

        _l.info("[proxy] message proxy is running properly");

       if (window != appWindow) { // iframe
    
            appWindow.postMessage("success", targetOrigin); 
    
       }
    
        messageHandler = function (e) {
    
            // accept any origin, we do strict api check here to protect from XSS/CSRF attack
            var data,id,args,apiInterface;
    
            try {
    
                data = _j.fromString(e.data);
    
            } catch (jsonParseError) {}
    
            // check format
            if (data && data.id && data.data) {
    
                id = data.id, // message id related to the deferred object
    
                args = data.data,
    
                apiInterface = args[0];
    
                if (args[2].toLowerCase() == "xml") {
                    // if dataType is xml, the ajax will return a xml object, which can't call
                    // postMessage directly (will raise an exception) , instead we request to tranfer
                    // XML as String, then parse it back to XML object.
                    // io.js will fall to response.text
                    // api.js will detect that convert it back to xmlobject
                    // @see io.js,api.js
                    args[2] = "_xml_";
                }
    
                if (!apiInterface) { // basic interface name validation
    
                    appWindow.postMessage(_j.stringify({
    
                        id: id
    
                       ,data: [-1, "interface can not be empty"]
    
                    }), targetOrigin);
    
                    _l.error("[proxy] interface cant not be empty");
    
                } else {
    
                    apiAjax.apply(this,args).complete(function () {
    
                        // can't stringify a xml object here
                        appWindow.postMessage(_j.stringify({
    
                            id: id
    
                           ,data: _a.fromArguments(arguments)
    
                        }), targetOrigin);
    
                    });
    
                }
    
            } else {
    
                _l.warn("[proxy] ignore unexpected message " + e.data);
    
            }
    
        }; // end message handler
    
        if (window.addEventListener) {
    
            window.addEventListener("message", messageHandler, false);
    
        } else if (window.attachEvent) {
    
            window.attachEvent("onmessage", messageHandler);
    
        }

    }


}());
