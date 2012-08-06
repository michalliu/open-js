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
/*jslint laxcomma:true*/
(function () {

    var _ = QQWB,

        _b = _.bigtable,

        _l = _.log,

        _s = _.String,

        basehost = '://open.t.qq.com',
        
        baseurl = 'http' + basehost,
        
        currprotocol = document.location.protocol.replace(':',''),

        securebaseurl = 'https' + basehost;

    _b.put("innerauth","layerid","openjslayer" + QQWB.uid(5));
    _b.put("innerauth","originaldomain",document.domain);
    _b.put("innerauth","rootdomain","qq.com");
    _b.put("innerauth","enabled", document.domain != 'open.t.qq.com' && _s.endsWith(document.domain, _b.get("innerauth","rootdomain")));
    _b.put("innerauth","eventproxyready","InnerAuthProxyFrameReady");
    _b.put("innerauth","eventproxysizechange", "InnerAuthProxySizeChange");
    _b.put("innerauth","eventproxysubmit", "InnerAuthResult");    
    _b.put("innerauth","eventproxycancel", "InnerAuthRequestCancel");    

    _b.put("uri","api",[securebaseurl,"/api"].join(""));
    _b.put("uri","auth",[securebaseurl,"/cgi-bin/oauth2/authorize"].join(""));

    // 工作在域内授权模式下，页面协议以外部页面的协议外住，默认是https
    _b.put("uri","html5proxy",[_b.get("innerauth","enabled") ? (currprotocol + basehost) : securebaseurl,"/oauth2/openjs/proxy_v3.html"].join(""));
    // 域内授权页协议以外部页面协议为主，默认为http协议
    _b.put("uri","innerauth",[_b.get("innerauth","enabled") ? (currprotocol + basehost) : baseurl,"/cgi-bin/oauth2/inner_flow_page2"].join(""));

    _b.put("uri","flashas3proxy",[securebaseurl,"/oauth2/openjs/proxy_as3_v3.swf"].join(""));
    _b.put("uri","exchangetoken",[securebaseurl,"/cgi-bin/oauth2/access_token"].join(""));
    _b.put("uri","autotoken",[baseurl,"/cgi-bin/auto_token"].join(""));
    _b.put("uri","gettokenbypt",[baseurl,"/cgi-bin/oauth2/get_oauth2token_pt"].join(""));

    _b.put("oauthwindow","name","authClientProxy_ee5a0f93");
    _b.put("oauthwindow","width","630");
    _b.put("oauthwindow","height","480");


    _b.put("cookie","domain",QQWB.envs.cookiedomain);
    _b.put("cookie","path",QQWB.envs.cookiepath);

    // cookie version 3
    _b.put("cookie","accesstokenname","QQWBToken" + '3');
    _b.put("cookie","refreshtokenname","QQWBRefreshToken" + '3');

    // on new oauth2.0 refreshtoken expires after 90 days since issued
    _b.put("cookie","refreshtokenexpires",30 * 24 * 3600);

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

               matchedtoken = location.href.match(/oauth2atoken=([^&]+)/i),

               wbname,

               wbnick,

               accessToken,

               refreshToken,

               tokenReady,

               cookie;

           if (!booting) { // autoboot default enabled, boot started at boot.js

                _b.put('boot','booting', true);

                _b.get('boot','solution')();

           }

           if (_b.get(base,"inited") === true) {

               _l.warning("already initialized");

               return;
           }

           // resolve absolute path from a context 
           function resolvePath(p) {
               var dirpattern = /.*(?=\/.*$)/,
                   abspattern = /^\/[^\/]/, // match '/a.js' but not match '//a.com/a.js'
                   httpbasepattern = /^http/, // match 'http://a.com' or 'https://a.com'
                   httpbasepattern2 = /^\/\//, // match url starts with '//a.com/a.js'
                   loc = document.location,
                   host = loc.host,
                   protocol = loc.protocol.replace(':','') + ':',
                   context;

               if ( httpbasepattern2.test(p) || httpbasepattern.test(p) ) {
                   // for http absolute url the context not specified
                   context = '';
               } else if (abspattern.test(p)) {
                   // for absolute root path the context is current host
                   context = protocol + host + '/';
               } else {
                   // for relative path the context is current location
                   context = document.location.href;
                   context = context.match(dirpattern);
                   context = (context ? context[0] : '.') + '/';
               }

               // path like "//a.com/a.js" should resolve to "http(s)://a.com/a.js";
               if(httpbasepattern2.test(p)) {
                   p = protocol + p;
               }

               return context + normalize(p);
           }

           // normalize a url
           function normalize(path, prevPath) {
               // convert backslashes to forward slashes, remove double slashes
               path = path.replace(/\\/g, '/')
                          .replace(/\/\//g, '/')
               // allow form of 'http://' double slashes
                          .replace(/:\//, '://')
               // replace any matches of "./"  with "/"
                          .replace(/(^|[^\.])(\.\/)/g, "$1");

               do {
                   prevPath = path;
               // replace any matches of "some/path/../" with "some/" recursively
                   path = path.replace(/([\w,\-]*[\/]{1,})([\.]{2,}\/)/g, "");
               }while(prevPath !== path);

               return path;
           }

           if (opts.callbackurl) {

               opts.callbackurl = resolvePath(opts.callbackurl);

           }

           _l.debug("init signal has arrived");

           opts = _.extend({

               callbackurl: document.location.href.replace(location.hash,"")

              ,pingback: true // pingback send on init

              ,autoclose: true // auto close the oauthwindow

              ,samewindow: false // open authenciate window in same window

              ,showappinfo: true // used in inner auth, if showappinfo is true, user will see appinfo when first use this app otherwise user will not see

           }, opts, true);

           _b.put(base,"pingback",opts.pingback);

           _b.put(base,"autoclose",opts.autoclose);

           _b.put(base,"samewindow",opts.samewindow);

           if (typeof opts.appkey != 'undefined') {

               _l.info("client id(appkey) is " + opts.appkey);

               _b.put("base", "appkey", opts.appkey);

           } else {

               _l.critical('client id(appkey) is NOT optional');

               return;

           }

           // resolve token from url address, set to cookie but don't trigger any events
           if (matchedtoken) {

               _l.info("resolve token from url"); // lock for innerauth mechanism

               wbname = location.href.match(/name=([^&#]+)/i);

               wbnick = location.href.match(/nick=([^&#]+)/i);

               _t.resolveResponse(decodeURIComponent(matchedtoken[1]) + (wbname ? '&name=' + wbname[1] : '') + (wbnick ? '&nick=' + wbnick[1] : ''), false);

           }

           tokenReady = _b.get("boot", "tokenready");

           accessToken = _t.getAccessToken();

           refreshToken = _t.getRefreshToken();

           cookie = document.cookie;

           // inner auth flow
           if (innerauth) {

              // always use the newest uin & skey
              if ((/uin=([^;]+)/.test(cookie) && /skey=([^;]+)/.test(cookie)) || (/luin=([^;]+)/.test(cookie) && /lskey=([^;]+)/.test(cookie))) {

                   tokenReady.lock("start auto login"); // lock for innerauth mechanism

                   _b.get("solution","deferred").complete(function () {

                       var frame = _b.get("solution", "frame");

                       if (frame && frame.contentWindow && frame.contentWindow.getToken) {

                            frame.contentWindow.getToken(_b.get("base", "appkey"), !opts.showappinfo)

                                               .success(function (responseText) {

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

               if (refreshToken && !accessToken) { // need exchange token

                   tokenReady.lock("exchange token");

                   _l.info("exchanging refresh token to access token...");

                   _t.exchangeForToken(function (response) {

                       tokenReady.unlock("token exchanged");// unlock for async refresh token

                   });

               }

           } // end if innerauth 

           tokenReady.unlock("init is called"); // unlock init, locked in boot.js

           if (_p && opts.pingback) { // send pingback to server

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
            
                    var canMaintain = _t.getAccessToken() && _t.getRefreshToken(), //使用户保持在线状态

                        waitingTime; // server accept to exchange token 30 seconds before actually expire date
            
                    if (maintainTokenScheduler) {
                        
                        _l.info("cancel the **OLD** maintain token schedule");
            
                        clearTimeout(maintainTokenScheduler);
                    }
            
                    if (canMaintain) {
            
                        // server should accept to exchange token 30 seconds before actually expire date
                        // 15 seconds ahead of actual expire date;
                        waitingTime = parseInt(_c.get(_b.get("cookie","getAccesstokenName")()).split("|")[2],10) - _.time.now() - 15 * 1000;

                        _l.info("scheduled to exchange token after " + waitingTime + "ms");
            
                        maintainTokenScheduler = setTimeout(function () {
            
                            _t.exchangeForToken(function () {
            
                                maintainTokenStatus();
            
                            });
            
                        }, waitingTime);
            
                    } else {
            
                        if (maintainTokenScheduler ) {

                            _l.info("cancel the exchange token schedule");
            
                            clearTimeout(maintainTokenScheduler);
                        }
            
                    }
                }
            
                _.bind(_b.get("nativeevent","tokenready"),maintainTokenStatus);
            
                _.bind(_b.get("nativeevent","userloggedin"),maintainTokenStatus);
            
                _.bind(_b.get("nativeevent","userloginfailed"),maintainTokenStatus);
            
                _.bind(_b.get("nativeevent","userloggedout"),maintainTokenStatus);
            
            }());

           _b.put(base, "inited", true);

           return _;
    });

}());

