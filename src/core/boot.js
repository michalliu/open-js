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
 *           common.Array
 *           common.JSON
 *           auth.token
 *           event.event
 *           solution
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
			   pingback = opts.ping === false ? false : true, // 数据上报
               clientProxy = opts.proxy || document.location.href.replace(location.search,"").replace(location.hash,"");

           if (opts.appkey) {
               this.log.info("client id is " + opts.appkey);
               this.assign("_appkey","APPKEY",opts.appkey);
           }

           this.log.info("client proxy uri is " + clientProxy);
           this.assign("_domain","CLIENTPROXY_URI",clientProxy);

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

           this._inited = true;

           QQWB._tokenReadyDoor.unlock();

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
