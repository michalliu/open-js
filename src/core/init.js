/**
 * Tencent weibo javascript library
 *
 * basic init and the public init method
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module init
 * @requires base
 *           util.bigtable
 *           util.deferred
 *           common.String
 *           core.log
 */
(function () {

    var _ = QQWB,

        _b = _.bigtable,

        _l = _.log,

        _s = _.String,

        baseurl = "http://open.t.qq.com";

    _b.put("uri","api",[baseurl,"/api"].join(""));
    _b.put("uri","auth",[baseurl,"/oauth2_html/login.php"].join(""));
    _b.put("uri","html5proxy",[baseurl,"/open-js/proxy/proxy_v2.html"].join(""));
    _b.put("uri","innerauthproxy",[baseurl,"/open-js/proxy/proxy_v2.html"].join(""));
    _b.put("uri","flashas3proxy",[baseurl,"/open-js/proxy/proxy_as3_v2.swf"].join(""));
    _b.put("uri","exchangetoken",[baseurl,"/cgi-bin/exchange_token"].join(""));
    _b.put("uri","autotoken",[baseurl,"/cgi-bin/auto_token"].join(""));
    _b.put("uri","gettokenbypt",[baseurl,"/cgi-bin/oauth2/get_oauth2token_pt"].join(""));
    _b.put("uri","innerauth",[baseurl,"/cgi-bin/oauth2/inner_flow_page"].join(""));

    _b.put("oauthwindow","name","authClientProxy_ee5a0f93");
    _b.put("oauthwindow","width","575");
    _b.put("oauthwindow","height","465");

    _b.put("innerauth","layerid","openjslayer" + QQWB.uid(5));
    _b.put("innerauth","originaldomain",document.domain);
    _b.put("innerauth","rootdomain","qq.com");
    _b.put("innerauth","enabled", document.domain != 'open.t.qq.com' && _s.endsWith(document.domain, _b.get("innerauth","rootdomain")));
    _b.put("innerauth","eventproxyready","InnerAuthProxyFrameReady");
    _b.put("innerauth","eventproxysizechange", "InnerAuthProxySizeChange");
    _b.put("innerauth","eventproxysubmit", "InnerAuthResult");    
    _b.put("innerauth","eventproxycancel", "InnerAuthRequestCancel");    

    _b.put("cookie","domain",QQWB.envs.cookiedomain);
    _b.put("cookie","path",QQWB.envs.cookiepath);
    _b.put("cookie","accesstokenname","QQWBToken");
    _b.put("cookie","refreshtokenname","QQWBRefreshToken");
    _b.put("cookie","refreshtokenexpires",7 * 24 * 3600);
    _b.put('cookie','getAccesstokenName', function () {
        return [_b.get("cookie","accesstokenname"), _b.get("base", "appkey")].join("_");
    });
    _b.put('cookie','getRefreshtokenName', function () {
        return [_b.get("cookie","refreshtokenname"), _b.get("base", "appkey")].join("_");
    });
	//https://github.com/rack/rack/issues/225
    _b.put('cookie','defaultEncoder', function (inStr) {
        // return escape(escape(inStr));
        return escape(inStr);
    });
    _b.put('cookie','defaultDecoder', function (inStr) {
        //return unescape(unescape(inStr));
        return unescape(inStr);
    });
    _b.put("nativeevent","userloggedin","UserLoggedIn");
    _b.put("nativeevent","userloginfailed","UserLoginFailed");
    _b.put("nativeevent","userloggedout","UserLoggedOut");
    _b.put("nativeevent","tokenready","tokenReady");
    _b.put("nativeevent","documentready","documentReady");
    _b.put("nativeevent","everythingready","everythingReady");
    _b.put("nativeevent","ready","ready");

    _b.put("solution","deferred",_.deferred.deferred());
    _b.put("solution","jscallbackname","onFlashReady_a1f5b4ce");

    _b.put("api","count",0);

    _b.put("ping","urlbase","http://btrace.qq.com/collect");
    _b.put("ping","paramorder",["ftime","sIp","iQQ","sBiz","sOp","iSta","iTy","iFlow"]);
    _b.put("ping","paramsep",";");

    _b.put("io","timeout", 30 * 1000);
    _b.put('openjs','asynccallbackfunctionname', "onOpenjsLoad");

    _b.put('boot','booting', false);

    if (_b.get("innerauth","enabled")) {

         _l.info('enter inner auth model, set domain to ' + _b.get("innerauth","rootdomain"));

         document.domain = _b.get("innerauth","rootdomain"); // downgrade document.domain to root same as inner auth token proxy

    }

    QQWB.provide("init", function (opts) {

           var _ = QQWB,

               _b = _.bigtable,

               _p = _.ping,

               _l = _.log,

               _s = _.String,

               _t = _._token,

               _d = _.dom,

               base = "base",

               booting = _b.get('boot','booting'),

               innerauth = _b.get("innerauth","enabled"),

               matchedtoken = location.href.match(/oauth2token=([^&]+)/i),

               wbname,

               wbnick,

               accessToken,

               rawAccessToken, 

               refreshToken,

               tokenReady,

               cookie;

           if (!booting) {

                _b.put('boot','booting', true);

                _b.get('boot','solution')();

           }


           tokenReady = _b.get("boot", "tokenready");

           if (_b.get(base,"inited") === true) {

               _l.warning("already initialized");

               return;
           }

           _l.debug("init signal has arrived");

           opts = _.extend({

               callbackurl: document.location.href.replace(location.search,"").replace(location.hash,"")

              ,pingback: true // pingback send on init

              ,synclogin: false // login user with qq uin & skey. default not allowed

              ,autoclose: true // auto close the oauthwindow

              ,samewindow: false // open authenciate window in same window

              ,showappinfo: true // used in inner auth, if showappinfo is true, user will see appinfo when first use this app otherwise user will not see

           }, opts, true);

           _b.put(base,"pingback",opts.pingback);

           _b.put(base,"autoclose",opts.autoclose);

           _b.put(base,"samewindow",opts.samewindow);

           _b.put(base,"synclogin",opts.synclogin);


           if (typeof opts.appkey != 'undefined') {

               _l.info("client id(appkey) is " + opts.appkey);

               _b.put("base", "appkey", opts.appkey);

           } else {

               _l.critical('client id(appkey) is NOT optional');

               return;

           }

           // resolve token from url address
           if (matchedtoken) {

               _l.info("resolve token from url"); // lock for innerauth mechanism

               wbname = location.href.match(/wb_name=([^&#]+)/i);

               wbnick = location.href.match(/wb_nick=([^&#]+)/i);

               _t.resolveResponse(decodeURIComponent(matchedtoken[1]) + (wbname ? '&wb_name=' + wbname[1] : '') + (wbnick ? '&wb_nick=' + wbnick[1] : ''), false);

           }

           accessToken = _t.getAccessToken();

           rawAccessToken = _t.getAccessToken(true); 

           refreshToken = _t.getRefreshToken();

           cookie = document.cookie;

           // inner auth flow
           if (innerauth) { // forget refreshtoken we spawns new token

              if (!accessToken && cookie &&
                   (
                     (/uin=([^;]+)/.test(cookie) && /skey=([^;]+)/.test(cookie))
                     ||
                     (/luin=([^;]+)/.test(cookie) && /lskey=([^;]+)/.test(cookie))
                   ) // qq is login
                 ) {

                   tokenReady.lock("start auto login"); // lock for innerauth mechanism

                   _b.get("solution","deferred").complete(function () {

                       var frame = _b.get("solution", "frame");

                       if (frame && frame.contentWindow && frame.contentWindow.getToken) {

                            frame.contentWindow.getToken(_b.get("base", "appkey"), !opts.showappinfo)

                                               .success(function (responseText) {

                                                   // _l.info("auto login success result cached " + responseText);

                                                   // _b.put("synclogin", "responsetext", responseText);

                                                   _t.resolveResponse(responseText, false);

                                                })

                                               .error(function (status, statusText, responseTime, responseText) {

                                                   _l.error(["auto login failed,", status, ", " , statusText, ', ', _s.trim(responseText)].join(""));
                                                   
                                                })

                                               .complete(function () {

                                                  tokenReady.unlock("done auto login");

                                              });

                       } else {

                            _l.error("retrieve inner auth token error, proxy frame not loaded");

                            tokenReady.unlock("failed to load innerauth proxy frame, auto login failed");
                       }

                   });
              }

           // outer auth flow
           } else {

               _l.info("client proxy uri is " + opts.callbackurl);

               _b.put("uri","redirect",opts.callbackurl);

               if (refreshToken && !accessToken && rawAccessToken) { // need exchange token

                   tokenReady.lock("exchange token");

                   _l.info("exchanging refresh token to access token...");

                   _t.exchangeForToken(function (response) {

                       tokenReady.unlock("token exchanged");// unlock for async refresh token

                   });

               }

               if (opts.synclogin && !refreshToken && !accessToken) { // need load synctoken

                   tokenReady.lock("start auto login");

                   _t.loadSyncLoginToken().success(function (responseText) {

                       _l.info("auto login success result cached " + responseText);

                       _b.put("synclogin", "responsetext", responseText);

                   }).error(function (status, statusText, responseTime, responseText) {

                       _l.error(["auto login failed,", status, ", " , statusText, ', ', responseText].join(""));

                   }).complete(function () {

                       tokenReady.unlock("done auto login");

                   });

               }

           } // end if innerauth 

           tokenReady.unlock("init is called"); // unlock init

           if (_p && opts.pingback) {

               _p.pingInit();

           }

            // maintain token status, this relies appkey is already known
            (function () {
            
                var _ = QQWB,
            
                    _l = _.log,
            
                    _c = _.cookie,
            
                    _b = _.bigtable,
            
                    maintainTokenScheduler;
            
                function maintainTokenStatus () {
            
                    var canMaintain = !!_._token.getAccessToken(), // user logged in set timer to exchange token
            
                          waitingTime; // server accept to exchange token 30 seconds before actually expire date
            
                    maintainTokenScheduler && _l.info("cancel the **OLD** maintain token schedule");
            
                    maintainTokenScheduler && clearTimeout(maintainTokenScheduler);
            
                    if (canMaintain) {
            
                        // server should accept to exchange token 30 seconds before actually expire date
                        waitingTime = parseInt(_c.get(_b.get("cookie","getAccesstokenName")()).split("|")[1],10)
            
                                      - _.time.now()
            
                                      - 15 * 1000 /*15 seconds ahead of actual expire date*/;
            
                        _l.info("scheduled to exchange token after " + waitingTime + "ms");
            
                        maintainTokenScheduler = setTimeout(function () {
            
                            _._token.exchangeForToken(function () {
            
                                maintainTokenStatus();
            
                            });
            
                        }, waitingTime);
            
                    } else {
            
                        maintainTokenScheduler && _l.info("cancel the exchange token schedule");
            
                        maintainTokenScheduler && clearTimeout(maintainTokenScheduler);
            
                    }
                }
            
                _.bind(_b.get("nativeevent","tokenready"),maintainTokenStatus);
            
                _.bind(_b.get("nativeevent","userloggedin"),maintainTokenStatus);
            
                _.bind(_b.get("nativeevent","userloginfailed"),maintainTokenStatus);
            
                _.bind(_b.get("nativeevent","userloggedout"),maintainTokenStatus);
            
            }());

           // compat cookie with older versions
           _t.compatOldVersion();

           _b.put(base, "inited", true);

           return _;
    });

}());

