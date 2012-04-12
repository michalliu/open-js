/**
 * Tencent weibo javascript library
 *
 * Authenticate user
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module auth
 * @requires base
 *           core.init
 * @includes core.token
 *           core.log
 */
(function (){

var authWindow = function () {

	var _ = QQWB,
	    
	    _b = _.bigtable,

	    width = _b.get("authwindow","width"),

    	height = _b.get("authwindow","height"),

		name = _b.get("authwindow","name"),

		url = _b.get("uri","auth"),

		attrs = "toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=yes,status=no",

		authorizing = false,

		awindow = null;
	
	return {

		show: function () {

	        var _ = QQWB,

	            _b = _.bigtable,

	            appkey = _b.get("base", "appkey"),

		        autoclose = _b.get("base","autoclose"),

		        samewindow = _b.get("base","samewindow"),

				x,

				y,

				query,

				props;

			if (!authorizing) {

		        x = (window.screenX || window.screenLeft) + ((window.outerWidth || document.documentElement.clientWidth) - width) / 2;

		        y = (window.screenY || window.screenTop) + ((window.outerHeight || document.documentElement.clientHeight) - height) / 2;

		        query =  _.queryString.encode({

                     response_type: "token"

                    ,client_id: appkey

                    ,redirect_uri: _b.get("uri","redirect")

                    ,scope: "all"

                    ,status: 0

                });

		        props = ["width=" + width, "height=" + height, "left=" + x, "top=" + y].join(",")

				if (samewindow) {

					window.name = name;

					window.location.href = url + "?" + query;

					return;
				}

	            awindow = window.open(url + "?" + query, name, [props, attrs].join(","));

				authorizing = true;

		        (function () {

					var _ = QQWB,

					    _t = _._token,

					    response,

						mark,

					    _q = _.queryString;

                   if (!awindow) {

						errormsg = "browser blocked popup authorize window";

						_l.error(errormsg);

                        _t.resolveResponse("error=" + errormsg, true);

						return;
					}
					
                    if (awindow.closed) { // user close like ALT + F4

                        _t.resolveResponse("error=access_denied", true);

						authorizing = false;

						awindow = null;

                        return;

		            } else {

		                try {

		                 	response = awindow.location && awindow.location.href;

		                } catch (ex) {

		                	response = null;
		                }

		                if (response && response != "about:blank") { // window.open url firstly is about:blank
						   
						   mark = response.lastIndexOf('#');

						   response = mark == -1 ? "" : response.slice(mark+1);

		         		   response = _q.decode(response);

						   //TODO: posibble bug non standard oauth2.0 protocol
		         		   if (parseInt(response.status,10) == 200) {

		                        _t.resolveResponse(response, true);

		         		   }

	                       authorizing = false;

                           autoclose && awindow.close();

						   awindow = null;

		                   return;

		                }

                        setTimeout(arguments.callee, 0);

                    }

                }());

			} else {

                awindow && awindow.focus();

			}
			
		}

	};

}(); // end authWindow

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

	    var _ = QQWB,

	        _b = _.bigtable,

			_l = _.log,

			_t = _._token,

			inited = _b.get("base","inited"),

			syncloginenabled = _b.get("base","synclogin"),

            loginStatus = _.auth.loginStatus(), 

			error,

			syncloginResponseText,

            onLoginSessionComplete; // hander on this logon session complete

        if (!inited) {

			error = _.name + " not initialized, call T.init() to initialize";

            _l.critical(error);

        }

		if (error && optFailHandler) {

			optFailHandler({message:error});

			return _;
		}

		if (loginStatus && optSuccessHandler) {

            optSuccessHandler(loginStatus);

			return _;

		}

		// QQ loginstatus exhchange to oauth login status
	    if (syncloginenabled) {

	    	syncloginResponseText = _b.get("synclogin","responsetext");

	    	if (syncloginResponseText) {

	    	    _l.debug("using prefetched synclogin ...");

	    		_t.resolveResponse(syncloginResponseText, false); // don't trigger any events

                loginStatus = _.auth.loginStatus(); // update loginstatus after using preloaded sync login result

	    		if (loginStatus) {

	    	        _l.debug("synclogin succeed");

	    			optSuccessHandler && optSuccessHandler(loginStatus);

	    			return _;

	    		}

	    	}
	    	
	    	_l.debug("synclogin failed, fallback to login window");

	    }

	    if (optSuccessHandler || optFailHandler) {

	    	onLoginSessionComplete = function (arg1) {

	    		if(arg1.access_token && optSuccessHandler) {

	    			optSuccessHandler(arg1);

	    		} else if(arg1.error && optFailHandler){

	    			optFailHandler(arg1);

	    		} else {

                    _l.error("wired result of T.login " + arg1);

	    		}

                _.unbind(_b.get("nativeevent","userloggedin"), onLoginSessionComplete);

                _.unbind(_b.get("nativeevent","userloginfailed"), onLoginSessionComplete);

                onLoginSessionComplete = null;

	    	};

            _.bind(_b.get("nativeevent","userloggedin"), onLoginSessionComplete);

            _.bind(_b.get("nativeevent","userloginfailed"), onLoginSessionComplete);

	    }

	    authWindow.show();

        return _;
    }

    /**
     * Logout user
     *
     * @return {Object} QQWB object
     */
   ,logout: function (optHandler) {

	   var  _ = QQWB,

	        _b = _.bigtable,

			_l = _.log,

			_t = _._token,

	        loginStatus = _.loginStatus();

       _l.info("logging out user");

       if (!loginStatus) {

           _l.warning("oops, user not logged in");

       } else {

           _t.clearAccessToken();

           _t.clearRefreshToken();

		   _b.del("synclogin","responsetext");

           _l.info("user " + (loginStatus.name || "unknown") + " logged out");

       }

       optHandler && optHandler();

       _.trigger(_b.get("nativeevent","userloggedout"));

       return _;
    }

   /**
    * Get login status object
    *
    * @access public
    * @param optCallback {Function} callback handler
    * @return {Object|undefined}
    */
   ,loginStatus: function (optCallback) {

	   var _ = QQWB,

		   _t = _._token,

           accessToken = _t.getAccessToken(),

           user = _t.getTokenUser(),

	       status;

       if (accessToken) {

           status = {

               access_token: accessToken

              ,name: user.name

              ,nick: user.nick

           };

       }

       optCallback && optCallback(status);

       return status;
    }
});

QQWB.login = QQWB.auth.login;

QQWB.logout = QQWB.auth.logout;

QQWB.loginStatus = QQWB.auth.loginStatus;

}());
