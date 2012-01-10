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
	 * SDK init Opts
	 *
	 * Available initOpts
	 *
	 * {
     *     platform: 0
	 *     appkey(clientId): 12345
	 *     ...
     * }
	 *
	 * {
     *     platform: 0
	 *     appkey(clientId): [12345,45678]
	 *     ...
     * }
	 *
	 */
	  init: function (initOpts) {

		  var sappkey,  // appkey
		      sredirect, // redirect url
		      bbSolution,// browser best solution
		      platform, // selected platform
		      authResponse;// will use when auth mode is not popup

          if (QQWB._inited === true) {
              QQWB.log.warning("already initialized");
              return QQWB;
          }

          // default
		  initOpts = initOpts || {};

		  // default options
		  initOpts = QQWB.extend({
			   redirectURI: document.location.href.replace(location.search,"").replace(location.hash,"") // default redirect to currentpage
			  ,pingback: true // send pingback to server.default yes
			  ,platform: QQWB.platforms.WEIBO // default select weibo platform
			  ,popupauth: true // use popup window to auth user
			  ,autocloseauth: true // auto close auth window

		  } ,initOpts ,true);

          QQWB.log.info("init signal has arrived");

          // this is to compatible with older version,we use appkey at older version
		  sappkey = initOpts.appkey || initOpts.clientId; 

          // this is to compatible with older version,we use callbackurl at older version
		  sredirect = initOpts.callbackurl || initOpts.redirectURI; 

		  // pingback
		  QQWB.pingback = initOpts.pingback;

		  // authRedirect
		  QQWB.create("platforms.data.authRedirect", sredirect);

		  // assign parsed appkey value
          if (!sappkey) {
		      QQWB.log.critical("refused to init, appkey(clientId) is REQUIRED");
		      return;
		  }

		  // parse platform
		  platform = QQWB.String.isString(initOpts.platform) ? QQWB.String.trim(initOpts.platform).toLowerCase() : initOpts.platform;

		  // set appkey for platform
		  // if appkey is number or string then set it to the platform
		  // if appkey is array assign appkey through appkeys value
		  // if appkey is object assign appkey throgh key name
		  function setAppkey(appkey ,numericPlatform) {
			  if (typeof appkey != "object") { // number or string
				  QQWB.extend("platforms.data." + numericPlatform + ".client", {
				      appkey: appkey + ""
				  },true);
			  } else if(typeof sappkey == "object" && typeof sappkey.length != "undefined") { // duck-type array object 
			      for (var platid=0,l=sappkey.length;platid<l;platid++) {
					  var platappkey = sappkey[platid];

					  for (var plat in QQWB.platforms) {
						  if (QQWB.platforms.hasOwnProperty(plat)) { // weibo or sns
							  if(QQWB.platforms[plat] === platid) {
				                  QQWB.extend("platforms.data." + platid + ".client", {
				                      appkey: platappkey + ""
				                  },true);
								  break;
							  }
						  }
					  }

				  }
			  } else if(typeof sappkey == "object") {
				  for (var platname in sappkey) {
					  if (sappkey.hasOwnProperty(platname)) {
						  for (var plat in QQWB.platforms) {
							  if (QQWB.platforms.hasOwnProperty(plat)) {
								  if (QQWB.String.trim(plat.toLowerCase()) === QQWB.String.trim(platname.toLowerCase())) {
				                      QQWB.extend("platforms.data." + QQWB.platforms[plat] + ".client", {
				                          appkey: sappkey[platname] + ""
				                      },true);
								      break;
								  }
							  }
						  }
					  }
				  }
		      } else {
				  QQWB.log.error("param appkey not correct");
		      }
		  }

		  switch(platform) {
			  case "qzone":
			  case "qq":
			  case "sns":
			  case "opensns":
			  case QQWB.platforms.QZONE:
			  // set to QZone platform
                  QQWB.log.info("platform is **QZONE** ");
			      QQWB.platform = QQWB.platforms.QZONE;
				  setAppkey(sappkey,QQWB.platforms.QZONE);
			      QQWB._qzoneInit(initOpts);
			      break;
			  default:
			  // set to Weibo platform
                  QQWB.log.info("platform is **WEIBO**");
			      QQWB.platform = QQWB.platforms.WEIBO;
				  setAppkey(sappkey,QQWB.platforms.WEIBO);
			      QQWB._weiboInit(initOpts);
			      break;
		  }

		  QQWB.pingback && QQWB.ping && QQWB.ping.pingInit();
          QQWB.pingback && QQWB.ping && QQWB.bind(QQWB.events.USER_LOGGEDIN_EVENT,QQWB.ping.pingLoggedIn);
          QQWB.pingback && QQWB.ping && QQWB.bind(QQWB.events.USER_LOGIN_FAILED_EVENT,QQWB.ping.pingLoggedInFailed);

          // auto adopt a solution to client(browser)
		  bbSolution = QQWB._solution.getBrowserBestSolution();
		  if (bbSolution) {
			  QQWB._solution.initSolution(bbSolution);
		  } else {
              QQWB.log.error("init solution is called, but no solution implemented for browser");
		  }


		  // auto resolve
		  // resure platform variable
		  platform = QQWB.getPlatform(QQWB.platform);
		  if (!platform.authWindow.popup) {
			  QQWB.log.info("resolving token from server");
			  authResponse = window.location.hash;
		      authResponse = QQWB.queryString.decode(authResponse.split("#").pop());
			  QQWB._token.resolveResponse(authResponse,null,platform);
		  }

          QQWB._inited = true;

		  return QQWB;
	  }
    /**
     * Init config basic parameters for qzone
	 *
     * Available weiboInitOpts
	 *
	 * {
     *     appkey: "" // required, weibo or qzone appkey, for older version
	 *    ,clientId: "" // required, weibo or qzone appkey, same as appkey but its newer name
     *    ,callbackurl:"" // optional, default is currentpage, for older version
	 *    ,redirectURI:"" // optional. default is currentpage, same as callbackurl but its newer name
	 *    ,pingback: true/false // optional. default is true, send pingback to our server or don't
	 *    ,scope:"all" //optional.
	 * }
	 *
     * @access private
     */
	 ,_qzoneInit: function (qzoneInitOpts) {

		 // extra authwindow params
		 QQWB.extend("platforms.data." + QQWB.platforms.QZONE + ".authWindow.params", {
		       scope:qzoneInitOpts.scope || "all"
		      ,which:"ConfirmPage"
			  ,display: QQWB.browser.platform.mobile ? "mobile" : ""
		 },true);

		 QQWB.extend("platforms.data." + QQWB.platforms.QZONE + ".authWindow", {
		       popup: qzoneInitOpts.popupauth
			  ,autoclose: qzoneInitOpts.autocloseauth
		 },true);

		 // trigger tokenready event for the same interface defination
	     QQWB.log.info("token is ready");
	     QQWB.trigger(QQWB.events.TOKEN_READY_EVENT);
	  }

    /**
     * Init config basic parameters for weibo
	 *
     * Available weiboInitOpts
	 *
	 * {
     *     appkey: "" // required, weibo or qzone appkey, for older version
	 *    ,clientId: "" // required, weibo or qzone appkey, same as appkey but its newer name
     *    ,callbackurl:"" // optional, default is currentpage, for older version
	 *    ,redirectURI:"" // optional. default is currentpage, same as callbackurl but its newer name
	 *    ,pingback: true/false // optional. default is true, send pingback to our server or don't
	 *    ,synclogin: true/false // optional. default is true, enable sync login or not
	 * }
	 *
     * @access private
     */
     ,_weiboInit: function (weiboInitOpts) {

		   var appkeyVersion,
		       appkeyValue = QQWB.getAppkey(QQWB.platforms.WEIBO),
               accessToken = QQWB._token.getAccessToken(),
               rawAccessToken = QQWB._token.getAccessToken(true), 
               refreshToken = QQWB._token.getRefreshToken(),
               needExchangeToken = refreshToken && !accessToken && rawAccessToken,
               needRequestNewToken = !refreshToken && !accessToken && weiboInitOpts.synclogin;


		   // extra authwindow params
		   QQWB.extend("platforms.data." + QQWB.platforms.WEIBO + ".authWindow.params", {
			   status: 0
		   },true);

		   QQWB.extend("platforms.data." + QQWB.platforms.WEIBO + ".authWindow", {
		         popup: weiboInitOpts.popupauth
			    ,autoclose: weiboInitOpts.autocloseauth
		   },true);

		   // extra appkey version infomation
		   if (/^[a-z\d][a-z\d]{30}[a-z\d]$/i.test(appkeyValue)) {
			   appkeyVersion = 1;
	       } else if (/^[1-9][0-9]{7}[0-9]$/.test(appkeyValue)) {
			   appkeyVersion = 2;
	       } else {
			   appkeyVersion = 3;
	       }

		   QQWB.extend("platforms.data." + QQWB.platforms.WEIBO + ".client", {
		       "appkeyVersion": appkeyVersion
		   },true);

		   // Extra weibo init options
		   weiboInitOpts = QQWB.extend({
		       synclogin: true // auto login user.default yes
		   },weiboInitOpts,true);

		   // Token IO
           if (needExchangeToken || needRequestNewToken) {
               QQWB._tokenReadyDoor.lock(); // lock for async get or refresh token
			   QQWB.log.info("start token IO ...");
		   } else {
			   QQWB.log.info("token is ready");
			   QQWB.trigger(QQWB.events.TOKEN_READY_EVENT);
		   }

           if (needExchangeToken) {
               QQWB.log.info("exchanging refresh token to access token...");
               QQWB._token.exchangeForToken(function (response) {

				   // does it really neccessary?
				   // exchangeToken encountered error, try to get a new access_token automaticly
                   if (weiboInitOpts.synclogin && response.error) {
                       QQWB.log.warning("exchange token has failed, trying to retrieve a new access_token...");
                       QQWB._tokenReadyDoor.lock();// lock for async refresh token
                       QQWB._token.getNewAccessToken(function () {
                           QQWB._tokenReadyDoor.unlock();// unlock for async refresh token
                       });
                   }

                   // don't put this segment to top
                   // because of the stupid door-locking mechanism
                   QQWB._tokenReadyDoor.unlock();// unlock for async refresh token

               });
           } else if (needRequestNewToken) {
               QQWB.log.info("retrieving new access token...");
               QQWB._token.getNewAccessToken(function () {
                   QQWB._tokenReadyDoor.unlock(); // unlock for async get token
               });
		   }

           return QQWB;
    }
    /**
     * The door controls library ready
     */
    ,_tokenReadyDoor: QQWB.door.door(function () {
            QQWB.log.info("lock tokenReady");
        }, function () {
            QQWB.log.info("unlock tokenReady");
            // the this keyword is pointing to QQWB forced
            QQWB._tokenReadyDoor.isOpen() && QQWB.log.info("token is ready") && QQWB.trigger(QQWB.events.TOKEN_READY_EVENT);
        })
   /**
    * Add callback funtions when the sdk is ready
    * 
    * @access public
    * @param handler {Function} callback function
    * @return {Object} QQWB object
    */
   ,tokenReady: function (handler) {
       if (QQWB._tokenReadyDoor.isOpen()) { // token is ready or not
           handler && handler();
       } else {
           QQWB.bind(QQWB.events.TOKEN_READY_EVENT, handler);
       }
       return QQWB;
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
       if (QQWB._isDocumentReady) { // the event already be triggered,will never trigger again
           return;
       }
       try { // running the test, if no exception raised, the document is ready
           var el = document.getElementsByTagName("body")[0].appendChild(document.createElement("span"));
           el.parentNode.removeChild(el);
       } catch (ex) { // document isn't ready
           return;
       }
       QQWB._isDocumentReady = true;
       QQWB.log.info ("document is ready");
       QQWB.trigger(QQWB.events.DOCUMENT_READY_EVENT);
    }
    /**
     * Add handlers when document is ready
     *
     * @access public
     * @param handler {Function} handler
     * @return {Object} QQWB
     */
   ,documentReady: function (handler) {
       if (QQWB._isDocumentReady) { // we are sure the document is ready to go
           handler && handler();
       } else {
           QQWB.bind(QQWB.events.DOCUMENT_READY_EVENT,handler);// cache the handlers, these hanlders will called when document is ready to go
           QQWB._tryToTriggerDocumentReadyEvents(); // trigger the document ready event as early as posibble
       }
	   return QQWB;
    }
    /**
     * The door controls everything ready
     */
    ,_everythingReadyDoor: QQWB.door.door(function () {
            QQWB.log.info("lock everythingReady");
        }, function () { // the "this" keyword is pointing to QQWB forced
            QQWB.log.info("unlock everythingReady");

            QQWB._everythingReadyDoor.isOpen()
            && QQWB.log.info("everything is ready")
            //&& this.log.info("current user is " + this.loginStatus().name)
            && QQWB.trigger(QQWB.events.EVERYTHING_READY_EVENT);
        })
   /**
    * Add callback funtions when everything is ready
    * 
    * @access public
    * @param handler {Function} callback function
    * @return {Object} QQWB object
    */
   ,everythingReady: function (handler) {
       if (QQWB._everythingReadyDoor.isOpen()) { // library and document, is all of them ready?
           handler && handler();
       } else {
           QQWB.bind(QQWB.events.EVERYTHING_READY_EVENT, handler); // internal events
       }
       return QQWB;
    }
});

QQWB.alias("ready","everythingReady");

QQWB._everythingReadyDoor.lock(); // token must be ready
QQWB.log.info("waitng token ready event to unlock");
QQWB._everythingReadyDoor.lock(); // document(DOM) must be ready
QQWB.log.info("waiting DOM ready event to unlock");

QQWB.bind(QQWB.events.TOKEN_READY_EVENT, function () {
    QQWB._everythingReadyDoor.unlock(); // unlock for token ready
});

QQWB.bind(QQWB.events.DOCUMENT_READY_EVENT, function () {
    QQWB._everythingReadyDoor.unlock(); // unlock for document ready
});



// exhange token scheduler
(function () {

	var maintainTokenScheduler;

	function maintainTokenStatus () {

		if (QQWB.platform !== QQWB.platforms.WEIBO) {
			QQWB.log.info("tokenstatus maintainer disabled");
			maintainTokenStatus = null;
			return;
		}

		var weiboPlatform = QQWB.getPlatform(QQWB.platforms.WEIBO),
		    canMaintain = !!QQWB._token.getAccessToken(false,weiboPlatform), // user logged in set timer to exchange token
	      	waitingTime; // server accept to exchange token 30 seconds before actually expire date

        maintainTokenScheduler && QQWB.log.info("cancel the **OLD** maintain token schedule");
        maintainTokenScheduler && clearTimeout(maintainTokenScheduler);

		if (canMaintain) {
		    // server should accept to exchange token 30 seconds before actually expire date
	      	waitingTime = parseInt(QQWB.cookie.get(weiboPlatform.cookie.names.accessToken).split("|")[1],10)
	                      - QQWB.time.now()
	                      - 15 * 1000 /*15 seconds ahead of actual expire date*/;
			QQWB.log.info("scheduled to exchange token after " + waitingTime + "ms");

			maintainTokenScheduler = setTimeout(function () {
				QQWB._token.exchangeForToken(function () {
					maintainTokenStatus();
				}, weiboPlatform);
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
