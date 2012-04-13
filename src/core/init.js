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
    _b.put("uri","html5proxy",[baseurl,"/open-js/proxy/proxy_v2.html"].join(""));
    _b.put("uri","flashas3proxy",[baseurl,"/open-js/proxy/proxy_as3_v2.swf"].join(""));
    _b.put("uri","exchangetoken",[baseurl,"/cgi-bin/exchange_token"].join(""));
    _b.put("uri","autotoken",[baseurl,"/cgi-bin/auto_token"].join(""));

    _b.put("authwindow","name","authClientProxy_ee5a0f93");
    _b.put("authwindow","width","575");
    _b.put("authwindow","height","465");
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

	_b.put('boot','booting', false);

    QQWB.provide("init", function (opts) {

		   var _ = QQWB,

		       _b = _.bigtable,

		       _p = _.ping,

			   _l = _.log,

			   _t = _._token,

			   base = "base",

			   booting = _b.get('boot','booting'),

               accessToken = _t.getAccessToken(),

               rawAccessToken = _t.getAccessToken(true), 

               refreshToken = _t.getRefreshToken(),

               needExchangeToken = refreshToken && !accessToken && rawAccessToken,

			   preloadSyncLoginToken = opts.synclogin && !refreshToken && !accessToken,

			   tokenReady;

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

			  ,pingback: true // pingback level 

			  ,synclogin: false // auto login user. default yes

			  ,autoclose: true // auto close the authwindow

			  ,samewindow: false // open authenciate window in same window

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

           _l.info("client proxy uri is " + opts.callbackurl);

           _b.put("uri","redirect",opts.callbackurl);

           if (needExchangeToken) {

               tokenReady.lock("exchange token");

               _l.info("exchanging refresh token to access token...");

               _t.exchangeForToken(function (response) {

                   tokenReady.unlock("token exchanged");// unlock for async refresh token

               });

           }

		   if (preloadSyncLoginToken) {

               _l.info("preload synclogin token");

			   _t.loadSyncLoginToken().success(function (responseText) {

			       _b.put("synclogin", "responsetext", responseText);

			   }).error(function (status, statusText) {

				   _l.error(["preload synclogin token failed,", status, " " , statusText].join(""));

			   });

		   }

           tokenReady.unlock("init is called"); // unlock init

		   if (_p && opts.pingback) {

		       _p.pingInit();

			   if ((typeof opts.pingback == "number" && opts.pingback > 1) || typeof opts.pingback == "boolean") {

                   _.bind(_b.get("nativeevent","userloggedin"),_p.pingLoggedIn);

                   _.bind(_b.get("nativeevent","userloginfailed"),_p.pingLoggedInFailed);

			   }
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

