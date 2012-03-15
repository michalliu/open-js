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
 */
(function () {
	var _ = QQWB,

	    _b = _.bigtable,

		baseurl = "http://open.t.qq.com";

    _b.put("uri","api",[baseurl,"/api"].join(""));
    _b.put("uri","auth",[baseurl,"/oauth2_html/login.php"].join(""));
    _b.put("uri","html5proxy",[baseurl,"/proxy/proxy.html"].join(""));
    _b.put("uri","flashas3proxy",[baseurl,"/proxy/proxy_as3_v2.swf"].join(""));
    _b.put("uri","exchangetoken",[baseurl,"/cgi-bin/exchange_token"].join(""));
    _b.put("uri","autotoken",[baseurl,"/cgi-bin/auto_token"].join(""));

    _b.put("authwindow","name","authClientProxy_ee5a0f93");
    _b.put("authwindow","width","575");
    _b.put("authwindow","height","465");

	if (window["QQWBENVS"] && typeof QQWBENVS.CookieDomain != "undefined") {

        _b.put("cookie","domain",QQWBENVS.CookieDomain);

	} else {

        _b.put("cookie","domain","");

	}

	if (window["QQWBENVS"] && typeof QQWBENVS.CookiePath != "undefined") {

        _b.put("cookie","path",QQWBENVS.CookiePath);

	} else {

        _b.put("cookie","path","/");

	}

    _b.put("cookie","accesstokenname","QQWBToken");
    _b.put("cookie","refreshtokenname","QQWBRefreshToken");

    _b.put("nativeevent","userloggedin","UserLoggedIn");
    _b.put("nativeevent","userloginfailed","UserLoginFailed");
    _b.put("nativeevent","userloggedout","UserLoggedOut");
    _b.put("nativeevent","tokenready","tokenReady");
    _b.put("nativeevent","documentready","documentReady");
    _b.put("nativeevent","everythingready","everythingReady");

    _b.put("solution","deferred",_.deferred.deferred());
    _b.put("solution","jscallbackname","onFlashReady_a1f5b4ce");

    _b.put("api","count",0);

    _b.put("ping","urlbase","http://btrace.qq.com/collect");
    _b.put("ping","paramorder",["ftime","sIp","iQQ","sBiz","sOp","iSta","iTy","iFlow"]);
    _b.put("ping","paramsep",";");

    _b.put("io","timeout", 30 * 1000);

    QQWB.provide("init", function (opts) {

		   var _ = QQWB,

		       _b = _.bigtable,

		       _p = _.ping,

			   _l = _.log,

			   base = "base",

			   tokenReady;

	       tokenReady = _b.get("boot", "tokenready");

           if (_b.get(base,"inited") === true) {

               _l.warning("already initialized");

               return;
           }

           _l.info("init signal has arrived");

		   opts = _.extend({

			   callbackurl: document.location.href.replace(location.search,"").replace(location.hash,"")

			  ,pingback: true // pingback level 

			  ,synclogin: true // auto login user. default yes

			  ,autoclose: true // auto close the authwindow

			  ,samewindow: false // open authenciate window in same window

		   },opts,true);

		   _b.put(base,"pingback",opts.pingback);

		   _b.put(base,"autoclose",opts.autoclose);

		   _b.put(base,"samewindow",opts.samewindow);

           var 
               accessToken = _._token.getAccessToken(),

               rawAccessToken = _._token.getAccessToken(true), 

               refreshToken = _._token.getRefreshToken(),

               needExchangeToken = refreshToken && !accessToken && rawAccessToken,

               needRequestNewToken = !refreshToken && !accessToken && opts.synclogin;

           if (opts.appkey) {

               _l.info("client id is " + opts.appkey);

			   _b.put("base", "appkey", opts.appkey);
           }

           _l.info("client proxy uri is " + opts.callbackurl);

           _b.put("uri","redirect",opts.callbackurl);

           if (/*true || force exchange token*/needExchangeToken) {

               tokenReady.lock();

               _l.info("exchanging refresh token to access token...");

               QQWB._token.exchangeForToken(function (response) {

                   // does it really neccessary?
                   if (opts.synclogin && response.error) {// exchangeToken encountered error, try to get a new access_token automaticly

                       QQWB.log.warning("exchange token has failed, trying to retrieve a new access_token...");

                       tokenReady.lock();// lock for async refresh token

                       QQWB._token.getNewAccessToken(function () {

                           tokenReady.unlock();// unlock for async refresh token

                       });

                   }

                   // don't put this segment to top
                   // because of the stupid door-locking mechanism
                   tokenReady.unlock();// unlock for async refresh token

               });

           } else if (needRequestNewToken) {

               tokenReady.lock();

               _l.info("retrieving new access token...");

               _._token.getNewAccessToken(function () {

                   tokenReady.unlock(); // unlock for async get token

               });

           }

           _b.put(base, "inited", true);

           tokenReady.unlock(); // unlock init

		   if (_p && opts.pingback) {

		       _p.pingInit();

			   if ((typeof opts.pingback == "number" && opts.pingback > 1) || typeof opts.pingback == "boolean") {

                   _.bind(_b.get("nativeevent","userloggedin"),_p.pingLoggedIn);

                   _.bind(_b.get("nativeevent","userloginfailed"),_p.pingLoggedInFailed);

			   }
		   }

           return _;
    });

}());

