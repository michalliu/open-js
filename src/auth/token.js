/**
 * Tencent weibo javascript library
 *
 * Token management
 *
 * @author michalliu
 * @version 2.0
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
	 * Set token property to cookie
	 * 
	 * Examples:
	 *
	 * setProperty("openid","xx");
	 *
	 * @param name {String} cookie's key name
	 * @param value {Mixed} cookie value
	 * @return Mixed {Mixed}
	 */
   setProperty: function (name, value, optPlatform) {
	   var platform = optPlatform || QQWB.getPlatform();
       QQWB.cookie.set(platform.cookie.names[name]
                      ,value
                      ,365 * 24 * 3600
                      ,platform.cookie.path
                      ,platform.cookie.domain
           );
       return QQWB;
	}
	/**
	 * Get token property from cookie
	 * 
	 * Examples:
	 *
	 * getProperty("openid","xx");
	 *
	 * @param name {String} cookie's key name
	 * @param optDefault {Mixed} returned value if property value is null
	 * @return Mixed {Mixed}
	 */
   ,getProperty: function (name, optDefault, optPlatform) {
	   var platform = optPlatform || QQWB.getPlatform(),
           value = QQWB.cookie.get(platform.cookie.names[name]);
	   return (optDefault && value == null) ? optDefault : value;
    }
	/**
	 * Remove token property from cookie
	 * 
	 * Examples:
	 *
	 * removeProperty("openid");
	 *
	 */
   ,removeProperty: function (name, optPlatform) {
	    var platform = optPlatform || QQWB.getPlatform();
        QQWB.cookie.del(platform.cookie.names[name],platform.cookie.path,platform.cookie.domain);
        return QQWB;
    }
    /**
     * Save access token to cookie
     *
     * @access public
     * @param accessToken {String} access token string
     * @param expireIn {Number} expire after seconds from now
     * @param optUsername {String} username associate with accesstoken
     * @param optNickname {String} nickname associate with accesstoken
	 * @param optPlatform {Object} platform
     * @return {Object} QQWB object
     */
   ,setAccessToken: function (accessToken, expireIn, optUsername, optNickname, optPlatform) {
		var platform = optPlatform || QQWB.getPlatform(),
            tokenUser = this.getTokenUser(true,platform); // retrieve the old user info accesstoken
		return QQWB._token.setProperty("accessToken",[accessToken,QQWB.time.now() + expireIn * 1000
                                                      ,optUsername || (tokenUser && tokenUser.name) || ""
                                                      ,optNickname || (tokenUser && tokenUser.nick) || ""].join("|"),platform);
    }
    /**
     * Get access token saved before
     *
     * @access public
     * @param optRaw {Boolean} if set to true, will not consider about accesstoken expiration
     * @return {String|undefined} a string represent access token if available
     */
   ,getAccessToken: function (optRaw, optPlatform) {
       var token = QQWB._token.getProperty("accessToken",null,optPlatform);
       if (token) {
           token = token.split("|",2);
           if (optRaw || parseInt(token[1],10) > QQWB.time.now()) {
               return token[0];
           }
       }
	   return null;
    }
    /**
     * Get user infomation associated with access token
     *
     * @access public
     * @param optRaw {Boolean} if set to true, will not consider about expiration
     * @return {Object|undefined} an user object associated with access token if available
     */
   ,getTokenUser: function (optRaw, optPlatform) {
	   var result,
	       token = QQWB._token.getProperty("accessToken",null,optPlatform);
       if (token) {
           token = token.split("|",4);
           if (optRaw || parseInt(token[1],10) > QQWB.time.now()) {
               result = {
                   name: token[2]
                  ,nick: token[3]
               };
           }
       }

	   if (result && (optPlatform === QQWB.getPlatform(QQWB.platforms.QZONE))) {
		   result = QQWB.extend(result,{
			   openId: QQWB._token.getProperty("openId",null,optPlatform)
			  ,clientId: QQWB._token.getProperty("clientId",null,optPlatform)
		   },true);
	   }

	   return result;
    }
    /**
     * Clear access token
     *
     * @access public
     * @return {Object} QQWB object
     */
   ,clearAccessToken: function (optPlatform) {
	    return QQWB._token.removeProperty("accessToken",optPlatform);
    }
    /**
     * Save refresh token to cookie
     *
     * @param refreshToken {String} refresh token string
	 * @param optPlatform {Object} platform
     * @return {Object} QQWB object
     */
   ,setRefreshToken: function (refreshToken, optPlatform) {
	    return QQWB._token.setProperty("refreshToken",refreshToken,optPlatform);
    }
    /**
     * Get refresh token saved before
     *
     * @return {String|undefined} a string represent refresh token if available
     */
   ,getRefreshToken: function (optPlatform) {
        return QQWB._token.getProperty("refreshToken",null,optPlatform);
    }
    /**
     * Clear refresh token
     *
     * @access public
     * @return {Object} QQWB object
     */
   ,clearRefreshToken: function (optPlatform) {
        return QQWB._token.removeProperty("refreshToken",null,optPlatform);
    }
    /**
     * Use refresh token to obtain an access token
     *
     * @access public
     * @param optCallback {Function} callback function when result returned
     */
   ,exchangeForToken: function (optCallback, optPlatform) {
	   var platform = optPlatform || QQWB.getPlatform();
	   if ( !platform.domain.exchangeToken ) {
		   QQWB.log.error("can't perform exchange token action for platform " + platform + ", url not defined");
		   return;
	   }
       QQWB.io.jsonp({
                url: platform.domain.exchangeToken
               ,data: QQWB.queryString.encode({
                          response_type: "token"
                         ,client_id: platform.client.appkey
                         //,scope: "all"
                         //,state: "1"
                         ,refresh_token: this.getRefreshToken(platform)
                         ,access_token: this.getAccessToken(true,platform)
                      })
       }).success(function (response) {

           var _response = response;

           QQWB.String.isString(response) && (response = QQWB.queryString.decode(response));

           if(response.access_token){

               !response.expires_in && QQWB.log.error("token expires_in not retrieved");
               !response.wb_name && QQWB.log.warning("weibo username not retrieved, will not update username");
               !response.wb_nick && QQWB.log.warning("weibo usernick not retrieved, will not update usernick");

               QQWB._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wb_name, response.wb_nick ,platform);

               if (response.refresh_token) { // which should exists if accesstoken exists
                    QQWB._token.setRefreshToken(response.refresh_token ,platform);
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
	   var platform = optPlatform || QQWB.getPlatform();
	   if ( !platform.domain.autoToken) {
		   QQWB.log.error("can't perform auto token action for platform " + platform + ", url not defined");
		   return;
	   }
       QQWB.io.jsonp({
               url: platform.domain.autoToken
              ,data: QQWB.queryString.encode({
                   response_type: "token"
                  ,client_id: platform.client.appkey
                  //,scope: "all"
                  //,state: "1"
               })
       }).success(function (response) {

           var _response = response;

           QQWB.String.isString(response) && (response = QQWB.queryString.decode(response));

           if(response.access_token){

               !response.expires_in && QQWB.log.error("token expires_in not retrieved");
               !response.wb_name && QQWB.log.warning("weibo username not retrieved");
               !response.wb_nick && QQWB.log.warning("weibo usernick not retrieved");

               QQWB._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wb_name, response.wb_nick, platform);

               if (response.refresh_token) { // which should exists if accesstoken exists
                    QQWB._token.setRefreshToken(response.refresh_token, platform);
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
	 * @param platform {Object} platform
     */
   ,resolveResponse: function (responseText, optGlobal, optPlatform) {
       var 
           loginStatus,
		   platform = optPlatform || QQWB.getPlatform();
           global = (optGlobal || window)["QQWB"],
           response = QQWB.String.isString(responseText) ? global.queryString.decode(responseText) : responseText;

       if (response.access_token) {

		   // OAuth 2.0 standard parameters access_token
           global._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), response.wb_name, response.wb_nick, platform);

		   // OAuth 2.0 standard parameters refresh_token
           if (response.refresh_token) {
               global._token.setRefreshToken(response.refresh_token, platform);
           } else {
               global.log.warning("refresh token not retrieved");
           }

		   // weibo platform is so simple
		   if (platform === QQWB.getPlatform(QQWB.platforms.WEIBO)) {
               loginStatus = global.loginStatus(null,platform); // get current login status
               global.log.info("user " + loginStatus.name + " logged in");
               global.trigger(global.events.USER_LOGGEDIN_EVENT,loginStatus);

		   // a little complex dealing with qzone platform
		   } else if (platform === QQWB.getPlatform(QQWB.platforms.QZONE)) {
			   var oldCallback = window.callback;
			   // save openid and client_id
			   window["callback"] = function (appinfo) {
				   if (appinfo.client_id) {
					   QQWB._token.setProperty("clientId",appinfo.client_id, platform);
				   } else {
					   QQWB.log.warning("can't get QZone client id");
				   }
				   if (appinfo.openid) {
					   QQWB._token.setProperty("openId",appinfo.openid, platform);
				   } else {
					   QQWB.log.warning("can't get QZone Open id");
				   }

				   // retrieve basic user info
				   //FIXME: is it safe to use api method here?
				   QQWB.log.info("QQ login, auto get basic user info...")
				   QQWB.api("/user/get_user_info")
				       .success(function (userinfo) {
						   // update usernick
                           global._token.setAccessToken(response.access_token, parseInt(response.expires_in,10), "" , userinfo.nickname, platform);
					   })
					   .error(function (code, message) {
						   QQWB.log.warning("error, can't get user info " + message);
					   })
					   .complete(function () { // get current login status
                           loginStatus = global.loginStatus(null,platform);
                           global.log.info("user " + loginStatus.nick + " logged in");
                           global.trigger(global.events.USER_LOGGEDIN_EVENT,loginStatus);
					   });
                   window["callback"] = oldCallback;
			   }
			   // request openid and client_id
			   QQWB.script(platform.domain.openid + "?access_token=" + response.access_token);
		   } else {
			   QQWB.log.error("resolve response error, unknown or unsupported platform");
		   }
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
