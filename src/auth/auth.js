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
 *           event.event
 *           core.queryString
 *           core.log
 */
QQWB.extend("",{
    /**
     * Login in user
     *
     * @access public
     * @param optSuccessHandler {Function} handlers when login is success
     * @param optFailHandler {Function} handlers when login is fail
     * @return {Object|undefined}
     */
    login: function (optSuccessHandler, optFailHandler) {

        if (!this._inited) {
            this.log.critical("Library not initialized, call T.init() to initialize");
        }

        var loginStatus = this.loginStatus(); 

        optSuccessHandler && this.bind(this.events.USER_LOGGEDIN_EVENT, optSuccessHandler);
        optFailHandler && this.bind(this.events.USER_LOGIN_FAILED_EVENT, optFailHandler);

        // user already logged in
        if (loginStatus) {

            optSuccessHandler && optSuccessHandler.call(this,loginStatus);
            this.trigger(this.events.USER_LOGGEDIN_EVENT,loginStatus);

        } else { // open authorization window

            var 
                currWindow = {
                    x: window.screenX || window.screenLeft
                   ,y: window.screenY || window.screenTop
                   ,width: window.outerWidth || document.documentElement.clientWidth
                   ,height: window.outerHeight || document.documentElement.clientHeight
                },

                authWindow = {
                    width: 500
                   ,height: 300
                   ,authQuery: function () {
                      return QQWB.queryString.encode({
                               response_type: "token"
                              ,client_id: QQWB._appkey
                              ,redirect_uri: QQWB._domain.clientproxy
                              ,referer: document.location.href // IE will lost http referer when new window opened
                              ,scope: "all"
                           });
                    }
                   ,x: function () {
                       return parseInt(currWindow.x + (currWindow.width - this.width) / 2, 10);
                    }
                   ,y: function () {
                       return parseInt(currWindow.y + (currWindow.height - this.height) / 2, 10);
                    }
                   ,popup: function () {
                       this.contentWindow = window.open(QQWB._domain.auth + "?" + this.authQuery(), "", ["height="
                                                                                                   ,this.height
                                                                                                   ,", width="
                                                                                                   ,this.width
                                                                                                   ,", top="
                                                                                                   ,this.y()
                                                                                                   ,", left="
                                                                                                   ,this.x()
                                                                                                   ,", toobar="
                                                                                                   ,"no"
                                                                                                   ,", menubar="
                                                                                                   ,"no"
                                                                                                   ,", scrollbars="
                                                                                                   ,"no"
                                                                                                   ,", resizable="
                                                                                                   ,"yes"
                                                                                                   ,", location="
                                                                                                   ,"yes"
                                                                                                   ,", status="
                                                                                                   ,"no"
                           ].join(""));
                       return this;
                    }
                   ,focus: function () {
                       this.contentWindow && this.contentWindow.focus && this.contentWindow.focus();
                       return this;
                    }
                };

            authWindow.popup().focus();

            if (this.browser.msie) {// a timer is running to check autheciation and window status
                (function () {

                    var responseText;

                    if (authWindow.contentWindow.closed) {
                        responseText = "error=access_denied";
                        QQWB._token.resolveResponse(responseText);
                        return;
                    }

                    try {
                        responseText = authWindow.contentWindow.location.hash.split("#").pop();
                        QQWB._token.resolveResponse(responseText);
                        authWindow.contentWindow.close();
                    } catch (ex) {
                        setTimeout(arguments.callee,0);
                    }

                }());
            } else {

                QQWB._startTrackingAuthWindowStatus();

                (function () {

                    var responseText;

                    if (!QQWB._isTrackingAuthWindowStatus()) {
                        return;
                    }

                    if (authWindow.contentWindow.closed) {
                        responseText = "error=access_denied";
                        QQWB._token.resolveResponse(responseText);
                        return;
                    } else {
                        setTimeout(arguments.callee, 0);
                    }

                }());
            }
        } // end if loginStatus

        return this;
    }

    /**
     * Logout user
     *
     * @return {Object} QQWB object
     */
   ,logout: function (optHandler) {
	   var loginStatus = this.loginStatus();
       QQWB.log.info("logging out user...");
       if (!loginStatus) {
           this.log.warning("oops, user not logged in");
       } else {
           this._token.clearAccessToken();
           this._token.clearRefreshToken();
           this.log.info(loginStatus.name + " has logged out successfully");
       }
       optHandler && optHandler.call(this);
       this.trigger(this.events.USER_LOGGEDOUT_EVENT);
       return this;
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
           accessToken = this._token.getAccessToken(),
           user = this._token.getTokenUser();

       if (accessToken) {
           status = {
               access_token: accessToken
              ,name: user.name
              ,nick: user.nick
           };
       }

       optCallback && optCallback.call(this, status);

       return status;
    }
    /**
     * Are we tracking autheciate window status?
     * This is usefull in non-IE browser
     *
     * In IE,when autheciate window opened,there is a timer in the opener
     * keep tracking the opended window's location to parse and save token
     * then the autheciate window is closed by force.
     *
     * In non-IE browser,the way is different. Once the browser's token come back
     * the autheciate window will push that token to opener then close itself. but
     * there is aslo a timer is running in the opener to keep tracking if user manaually
     * closed the autheciate window. If user close that window (window.closed equal to
     * true),we will simulate a error response.The problem is when the user finished the
     * authoriztion task normally the autheciate window will closed aslo.the timer inside
     * the opener will detect that and set response incorrectly. to correct this, If the
     * user finished the authorization task normally, we should stop the timer immediatly.
     * that is before the autheciate window close itself, it told the opener, "don't track 
     * my status anymore,i will close my self normally",If the timer see that, the timer will
     * not running anymore, and the set error reponse will never called.
     *
     */
    ,_isTrackingAuthWindowStatus: function () {
        return !!this._trackAuthWindowStatus;
    }
   /**
    * Don't track if autheciate window is closed or not
    * 
    * @access private
    * @return {undefined}
    */
   ,_startTrackingAuthWindowStatus: function() {
       this._trackAuthWindowStatus = true;
    }
   /**
    * Don't track if autheciate window is closed or not
    * 
    * @access private
    * @return {undefined}
    */
   ,_stopTrackingAuthWindowStatus: function() {
       this._trackAuthWindowStatus = false;
    }
});
