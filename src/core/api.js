/**
 * Tencent weibo javascript library
 *
 * API call
 *
 * Example:
 * 
 *  T.api( "/status/home_timeline"
 *        ,{
 *            maxpage: 20
 *         }
 *        ,"json","GET")
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
 * @param optOverride {String} override appkey and accesstoken provided in T.init and cookie
 * @return {Object} promise object
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module api
 * @requires base
 * @includes io
 *           util.deferred
 *           weibo.util
 */
/*jslint laxcomma:true*/
QQWB.provide("api", function (api, apiParams, optDataType, optType, optOverride) {

    var _ = QQWB,

        _a = _.Array,

        _s = _.String,

        _j = _.JSON,

        _x = _.XML,

        _b = _.bigtable,

        _l = _.log,

        _q = _.queryString,

        _i = _.io,

        counter = _b.get("api","count",0),

        solution = _b.get("solution","deferred"),

        solutionName = _b.get("solution","name"),

        format = optDataType,

        supportedFormats = {json:true,xml:true/*,text:true*/},

        deferred = _.deferred.deferred(),

        proto = {"api": QQWB.api},

        obj = QQWB.Object.create(proto),

        promise = deferred.promise(obj),

        appkey,

        actoken,

        openid,

        proxyFrame,
        
        onDataBack;
    
    api = _.weibo.util.compat(api);

    apiParams = apiParams || {};

    optDataType = (optDataType || "json").toLowerCase();

    optType = optType || "GET";

    optOverride = optOverride || {};

    appkey = optOverride.appkey || optOverride.clientid || _b.get("base", "appkey");

    actoken = optOverride.accesstoken || optOverride.token || _._token.getAccessToken();

    if (optOverride.openid) {

        openid = optOverride.openid;

    } else {

        openid = _._token.getTokenUser() || '';

        if (openid) {

            openid = openid.openid;

        }

    }

    if (!(format in supportedFormats)) {

        format = "json";

    }

    apiParams.oauth_consumer_key = appkey;

    apiParams.access_token = actoken;

    apiParams.oauth_version = "2.a";

    apiParams.openid = openid;

    apiParams.format = format;


    if (!appkey) {

        _l.error("appkey can not be empty");

        deferred.reject(-1, "appkey cant not be empty",0);

        return promise;

    }

    if (api == '/t/add_pic') {

        _l.error("/t/add_pic is not supported yet");

        deferred.reject(-1, "暂不支持此接口，请使用 t/add_pic_url 代替",0);

        return promise;

    }


    if (!actoken) { // some public api call doesn't need an accesstoken

        _l.warn("accesstoken is empty");

    }

    // solution isn't ready
    if (!solution.isResolved() && !solution.isRejected()) {

        _l.warning("api call cached, waiting solution ready ...");

        solution.promise().done(function () {

            _l.info("invoking cached api call " + api + "...");

            _.api(api, apiParams, optDataType, optType, optOverride)

                .success(function () {

                    deferred.resolveWith(deferred,arguments);

                 })

                .error(function (){

                    deferred.rejectWith(deferred,arguments);

                 });

        }).fail(function () {

            _l.error("can't invoking cached api call " + api + "...");

            deferred.rejectWith(deferred,arguments);

        });

        return promise;
    }

    // solution error
    if (!solution.isResolved()) {

        solution.fail(function () {

            _l.error(arguments[1]);

            deferred.rejectWith(deferred,arguments);
        });

        return promise;
    }

    _b.put("api","count",++counter);

    _l.info("[" + counter + "] sending weibo request...");

    switch (solutionName) {
        case 'innerauth':
        proxyFrame = _b.get("solution", "frame");

        if (proxyFrame && proxyFrame.contentWindow &&  proxyFrame.contentWindow.apiAjax) {

            proxyFrame.contentWindow.apiAjax(api, apiParams, optDataType, optType).complete(function () {

                if (arguments[0] !== 200) {

                    deferred.rejectWith(deferred,arguments);

                } else {

                    deferred.resolve(arguments[3]/* response body */, arguments[2]/* elpased time */, arguments[4]/*response header*/);
                }

            });

        } else {

            _l.error(-1, "proxy frame not found");

            deferred.reject(-1,"proxy frame not found");

        }
        break;
        case 'html5':
        proxyFrame = _b.get("solution", "frame");

        if (!proxyFrame) {

            _l.error(-1, "proxy frame not found");

            deferred.reject(-1,"proxy frame not found");

        } else {

                onDataBack = _b.get("api","ondataback");

                if (!onDataBack) {

                    onDataBack = _b.put("api","ondataback", function (e) {

                        var data,

                            id,

                            defr,

                            response;

                        if (_b.get("uri","html5proxy").indexOf(e.origin) !== 0) {

                            _l.warn("ignore data from origin " + e.origin);

                            return;

                        }

                        // 本函数本不应该处理此种信息，这是容错逻辑
                        // proxy.html加载的时候会发送postMessage，内容是'sucess'
                        // 这会导致JSON解析错误，字符串不能转换为JSON对象
                        try {

                            data = _j.fromString(e.data);

                        } catch (invalidJSONError) {

                            _l.warn('[T.api] invalid JSON:' + e.data);

                            return;
                        }

                        id = data.id;

                        response = data.data;

                        if (!id || !response) {

                            _l.warn('[T.api] invalid data, id and data must exists:' + data);

                            return;
                        }

                        defr = _b.get("api","resultdeferred" + id);

                        if (defr) {

                            if (response[0] !== 200) {

                                defr.rejectWith(defr,response);

                            } else {

                                if (response[5] == "_xml_") {

                                    response[3] = _x.fromString(response[3]);

                                }

                                defr.resolve(response[3]/* response body */, response[2]/* elpased time */, response[4]/*response header*/);
                            }

                            _b.del("api","resultdeferred" + id);

                        } else {

                            _l.error("[T.api] invalid api request id " + id);

                        }

                    });

                    if (window.addEventListener) {

                        window.addEventListener("message", onDataBack, false);

                    } else if (window.attachEvent) {

                        window.attachEvent("onmessage", onDataBack);

                    }

                }

                _b.put("api", "resultdeferred" + counter, deferred);

                // make postMessage async
                // IE8 has problems if not wrapped by setTimeout
                setTimeout(function () {

                    // @see http://msdn.microsoft.com/en-us/library/cc197015(v=vs.85).aspx
                    proxyFrame.contentWindow.postMessage(_j.stringify({ 

                        id: counter

                       ,data: [api, apiParams, optDataType, optType]

                    }),_b.get("uri","html5proxy"));

                }, 0 );

        }
        break;
        case 'as3':
        function apiFlashAjax (api, apiParams, dataType, type) {

             var opts = {

                     type: _s.trim(type.toUpperCase())

                    ,url: _b.get("uri","apiforflash") + api

                    ,data: _q.encode(apiParams)

                    ,dataType: _s.trim(dataType.toLowerCase())

                 };

             if (opts.type == "GET") {

                 opts.url += (opts.data ? "?" + opts.data : "");

                 delete opts.data;

             }

             return _i.flashAjax(opts);

        }

         // @see io.js onFlashRequestComplete_8df046 for api call sequence management
         apiFlashAjax(api, apiParams, optDataType, optType).complete(function () {

             if (arguments[0] !== 200) {

                 deferred.rejectWith(deferred,arguments);

             } else {

                 deferred.resolve(arguments[3]/* response body */, arguments[2]/* elpased time */, arguments[4]/*response header*/);
             }
         });
        break;
        default:
        deferred.reject(-1, "invalid solutionName " + solutionName);
    }

    promise.complete(function () {

        _l.info("*[" + counter + "] done");

    });

    return promise;

});
