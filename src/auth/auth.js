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
 *           authWindow
 *           event.event
 *           core.queryString
 *           core.log
 */
QQWB.extend("auth",{
    /**
     * Login in user
     *
     * @access public
     * @param optSuccessHandler {Function} handlers when login is success
     * @param optFailHandler {Function} handlers when login is fail
     * @return {Object|undefined}
     */
    login: function (optSuccessHandler, optFailHandler) {

        if (!QQWB._inited) {
            QQWB.log.critical("Library not initialized, call T.init() to initialize");
        }

        var loginStatus = QQWB.loginStatus(); 

        optSuccessHandler && QQWB.bind(QQWB.events.USER_LOGGEDIN_EVENT, optSuccessHandler);
        optFailHandler && QQWB.bind(QQWB.events.USER_LOGIN_FAILED_EVENT, optFailHandler);

        // user already logged in
        if (loginStatus) {
            optSuccessHandler && optSuccessHandler.call(QQWB,loginStatus);
            QQWB.trigger(QQWB.events.USER_LOGGEDIN_EVENT,loginStatus);
        } else { // open authorization window
		    QQWB.auth.authWindow.show().focus();
        } // end if loginStatus

        return QQWB;
    }

    /**
     * Logout user
     *
     * @return {Object} QQWB object
     */
   ,logout: function (optHandler) {
	   var loginStatus = QQWB.loginStatus();
       QQWB.log.info("logging out user...");
       if (!loginStatus) {
           QQWB.log.warning("oops, user not logged in");
       } else {
           QQWB._token.clearAccessToken();
           QQWB._token.clearRefreshToken();
           QQWB.log.info(loginStatus.name + " has logged out successfully");
       }
       optHandler && optHandler.call(QQWB);
       QQWB.trigger(QQWB.events.USER_LOGGEDOUT_EVENT);
       return QQWB;
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
           accessToken = QQWB._token.getAccessToken(),
           user = QQWB._token.getTokenUser();

       if (accessToken) {
           status = {
               access_token: accessToken
              ,name: user.name
              ,nick: user.nick
           };
       }

       optCallback && optCallback.call(QQWB, status);

       return status;
    }
});
QQWB._alias("login",QQWB.auth.login);
QQWB._alias("logout",QQWB.auth.logout);
QQWB._alias("loginStatus",QQWB.auth.loginStatus);
