/**
 * Tencent weibo javascript library
 *
 * Token management
 *
 * @author michalliu
 * @version 1.0
 * @package auth
 * @module token
 * @requires base
 *           core.time
 *           core.cookie
 *           core.io
 *           common.String
 */
QQWB.extend("_token",{
    /**
     * Save access token to cookie
     *
     * @access public
     * @param accessToken {String} access token string
     *        expireIn {Number} expire after seconds from now
     *        optUsername {String} username associate with accesstoken
     *        optNickname {String} nickname associate with accesstoken
     * @return {Object} QQWB object
     */
    setAccessToken: function (accessToken, expireIn, optUsername, optNickname) {
        var tokenUser = this.getTokenUser(true); // retrieve the old user info accesstoken
        QQWB.cookie.set(QQWB._cookie.names.accessToken
                       ,[accessToken
                           ,QQWB.time.now() + expireIn * 1000
                           ,optUsername || (tokenUser && tokenUser.name) || ""
                           ,optNickname || (tokenUser && tokenUser.nick) || ""
                        ].join("|")
                       ,365 * 24 * 3600
                       ,QQWB._cookie.path
                       ,QQWB._cookie.domain
            );
        return QQWB;
    }
    /**
     * Get access token saved before
     *
     * @access public
     * @param optRaw {Boolean} if set to true, will not consider about accesstoken expiration
     * @return {String|undefined} a string represent access token if available
     */
   ,getAccessToken: function (optRaw) {
       var token = QQWB.cookie.get(QQWB._cookie.names.accessToken);
       if (token) {
           token = token.split("|",2);
           if (optRaw || parseInt(token[1],10) > QQWB.time.now()) {
               return token[0];
           }
       }
    }
    /**
     * Get user infomation associated with access token
     *
     * @access public
     * @param optRaw {Boolean} if set to true, will not consider about expiration
     * @return {Object|undefined} an user object associated with access token if available
     */
   ,getTokenUser: function (optRaw) {
       var token = QQWB.cookie.get(QQWB._cookie.names.accessToken);
       if (token) {
           token = token.split("|",4);
           if (optRaw || parseInt(token[1],10) > QQWB.time.now()) {
               return {
                   name: token[2]
                  ,nick: token[3]
               };
           }
       }
    }
    /**
     * Clear access token
     *
     * @access public
     * @return {Object} QQWB object
     */
   ,clearAccessToken: function () {
        QQWB.cookie.del(QQWB._cookie.names.accessToken,QQWB._cookie.path,QQWB._cookie.domain);
        return QQWB;
    }
    /**
     * Save refresh token to cookie
     *
     * @param refreshToken {String} refresh token string
     * @return {Object} QQWB object
     */
   ,setRefreshToken: function (refreshToken) {
        QQWB.cookie.set(QQWB._cookie.names.refreshToken
                       ,refreshToken
                       ,365 * 24 * 3600
                       ,QQWB._cookie.path
                       ,QQWB._cookie.domain
            );
        return QQWB;
    }
    /**
     * Get refresh token saved before
     *
     * @return {String|undefined} a string represent refresh token if available
     */
   ,getRefreshToken: function () {
        return QQWB.cookie.get(QQWB._cookie.names.refreshToken);
    }
    /**
     * Clear refresh token
     *
     * @access public
     * @return {Object} QQWB object
     */
   ,clearRefreshToken: function () {
        QQWB.cookie.del(QQWB._cookie.names.refreshToken,QQWB._cookie.path,QQWB._cookie.domain);
        return QQWB;
    }
    /**
     * Use refresh token to obtain an access token
     *
     * @access public
     * @param optCallback {Function} callback function when result returned
     */
   ,exchangeForToken: function (optCallback) {
       QQWB.io.jsonp({
                url: QQWB._domain.exchange
               ,data: QQWB.queryString.encode({
                          response_type: "token"
                         ,client_id: QQWB._appkey
                         ,scope: "all"
                         ,state: "1"
                         ,refresh_token: this.getRefreshToken()
                         ,access_token: this.getAccessToken(true)
                      })
       }).success(function (response) {

           var _response = response;

           QQWB.String.isString(response) && (response = QQWB.queryString.decode(response));

           if(response.access_token){

               !response.expires_in && QQWB.log.error("token expires_in not retrieved");
               !response.wb_name && QQWB.log.warning("weibo username not retrieved, will not update username");
               !response.wb_nick && QQWB.log.warning("weibo usernick not retrieved, will not update usernick");

               QQWB._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wb_name, response.wb_nick);

               if (response.refresh_token) { // which should exists if accesstoken exists
                    QQWB._token.setRefreshToken(response.refresh_token);
               } else {
                   QQWB.log.error("refresh token not retrieved");
               }

               QQWB.log.info("exchange token succeed");

           } else if (response.error) {
               QQWB.log.error("exchange token error " + response.error );
           } else {
               QQWB.log.error("unexpected result returned from server " + _response + " while exchanging for new access token");
           }

       }).error(function (status, statusText) {
           if (status === 404) {
               QQWB.log.error("exchange token has failed, script not found");
           } else {
               QQWB.log.error("exchange token has failed, " + statusText);
           }
       }).complete(function (arg1, arg2, arg3) {
           optCallback && optCallback.apply(QQWB,[arg1, arg2, arg3]);
       });

       return QQWB;
    }
    /**
     * Obtain an access token
     *
     * @access public
     * @param optCallback {Function} callback function when result returned
     */
   ,getNewAccessToken: function (optCallback) {
       QQWB.io.jsonp({
               url: QQWB._domain.query
              ,data: QQWB.queryString.encode({
                   response_type: "token"
                  ,client_id: QQWB._appkey
                  ,scope: "all"
                  ,state: "1"
               })
       }).success(function (response) {

           var _response = response;

           QQWB.String.isString(response) && (response = QQWB.queryString.decode(response));

           if(response.access_token){

               !response.expires_in && QQWB.log.error("token expires_in not retrieved");
               !response.wb_name && QQWB.log.warning("weibo username not retrieved");
               !response.wb_nick && QQWB.log.warning("weibo usernick not retrieved");

               QQWB._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wb_name, response.wb_nick);

               if (response.refresh_token) { // which should exists if accesstoken exists
                    QQWB._token.setRefreshToken(response.refresh_token);
               } else {
                   QQWB.log.error("refresh token not retrieved");
               }

               QQWB.log.info("retrieve new access token succeed");

           } else if (response.error) {
               QQWB.log.error("retrieve new access token error " + response.error );
           } else {
               QQWB.log.error("unexpected result returned from server " + _response + " while retrieving new access token");
           }

       }).error(function (status, statusText) {
           if (status === 404) {
               QQWB.log.error("get token has failed, script not found");
           } else {
               QQWB.log.error("get token failed, " + statusText);
           }
       }).complete(function (arg1, arg2, arg3) {
           optCallback && optCallback.apply(QQWB,[arg1, arg2, arg3]);
       });

       return QQWB;
    }
    /**
     * Auto resolve response from server
     *
     * @param responseText {String} the server response
     * @param optGlobal {Object} the global window object,default is current window
     */
   ,resolveResponse: function (responseText, optGlobal) {
       var 
           loginStatus,
           global = (optGlobal || window)["QQWB"],
           response = QQWB.String.isString(responseText) ? global.queryString.decode(responseText) : responseText;

       if (response.access_token) {

           global._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wb_name, response.wb_nick);

           if (response.refresh_token) { // which should exists if accesstoken exists
               global._token.setRefreshToken(response.refresh_token);
           } else {
               global.log.error("refresh token not retrieved");
           }

           loginStatus = global.loginStatus(); // get current login status
           global.log.info("user " + loginStatus.name + " logged in");
           global.trigger(global.events.USER_LOGGEDIN_EVENT,loginStatus);
       } else if (response.error) {
           global.log.error("login error occurred " + response.error);
           response.message = response.error; // alternative error name
           global.trigger(global.events.USER_LOGIN_FAILED_EVENT,response);
       } else {
           global.log.error("unexpected result returned from server " + responseText);
           response.message = response.error = "server error";
           global.trigger(global.events.USER_LOGIN_FAILED_EVENT,response);
       }
    }
});
