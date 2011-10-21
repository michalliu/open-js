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
	  init: function () {
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
	 * }
	 *
     * @access private
     */
	 ,_qzoneInit: function (qzoneInitOpts) {
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
           if (this._inited === true) {
               this.log.warning("already initialized");
               return this;
           }

           this.log.info("init signal has arrived");

		   weiboInitOpts = QQWB.extend({
			   redirectURI: document.location.href.replace(location.search,"").replace(location.hash,"")
			  ,pingback: true // send pingback to server.default yes
			  ,synclogin: true // auto login user.default yes
		   },weiboInitOpts,true);

		   QQWB.pingback = weiboInitOpts.pingback;

           var 
               accessToken = this._token.getAccessToken(),
               rawAccessToken = this._token.getAccessToken(true), 
               refreshToken = this._token.getRefreshToken(),
               needExchangeToken = refreshToken && !accessToken && rawAccessToken,
               needRequestNewToken = !refreshToken && !accessToken && weiboInitOpts.synclogin,
			   sappkey = weiboInitOpts.appkey || weiboInitOpts.clientId, // this is to compatible with older version,we use appkey at older version
			   sredirect = weiboInitOpts.callbackurl || weiboInitOpts.redirectURI; // this is to compatible with older version,we use appkey at older version

           if (sappkey) {
               this.log.info("client id is " + sappkey);
               this.assign("appkey.value","APPKEY",sappkey);
		   } else {
			   this.log.critical("can't init, appkey(clientId) is REQUIRED");
			   return;
		   }

           this.log.info("auth redirect uri is " + sredirect);
           this.assign("_domain","CLIENTPROXY_URI", sredirect);

           if (/*true || force exchange token*/needExchangeToken || needRequestNewToken) {
               QQWB._tokenReadyDoor.lock(); // lock for async get or refresh token
           }

           if (/*true || force exchange token*/needExchangeToken) {
               this.log.info("exchanging refresh token to access token...");
               QQWB._token.exchangeForToken(function (response) {

                   // does it really neccessary?
                   if (weiboInitOpts.synclogin && response.error) {// exchangeToken encountered error, try to get a new access_token automaticly
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

QQWB._tokenReadyDoor.lock(); // init must be called
QQWB._everythingReadyDoor.lock(); // token must be ready
QQWB._everythingReadyDoor.lock(); // document(DOM) must be ready

QQWB.bind(QQWB.events.TOKEN_READY_EVENT, function () {
    QQWB._everythingReadyDoor.unlock(); // unlock for token ready
});


// auto adopt a solution to client(browser)
if (QQWB.browser.feature.postmessage) {
    QQWB._solution.initSolution(QQWB._solution.HTML5_SOLUTION);
} else if (QQWB.browser.feature.flash) {
    QQWB._solution.initSolution(QQWB._solution.FLASH_SOLUTION);
} else {
    QQWB.log.error("init solution is called, but no solution for the browser");
}

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
