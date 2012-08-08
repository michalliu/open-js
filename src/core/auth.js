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
 *           core.token
 *           core.log
 *           util.bigtable
 *           util.cookie
 *           common.String
 *
 * @include core.dom
 *          core.event
 *          core.browser
 */
/*jslint laxcomma:true*/
(function (){

   var _ = QQWB,

       _b = _.bigtable,

       _br = _.browser,

       _l = _.log,

       _t = _._token,

       _c = _.cookie,

       _s = _.String,

       oAuthWindow,

       innerAuthLayer;

    innerAuthLayer = {

           show: function () {

               QQWB.documentReady(function () {

                   var layerid = _b.get('innerauth', 'layerid'),

                       appkey = _b.get("base", "appkey"),

                       url = _b.get("uri","innerauth"),

                       attrs = 'frameBorder="0" width="100%" height="100%" scrolling="no"',

                       layer = document.getElementById(layerid),

                       lastw, lasth, resize, cleanup;

                   if (!layer) {

                       layer = QQWB.dom.createElement('div', {

                           id: _b.get('innerauth', 'layerid'),

                           style: ['position:absolute;padding:5px;overflow:hidden;z-index:999;visibility:hidden;'
                               , (_br.msie && _br.version < 9) ? 'filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr="#4c000000", EndColorStr="#4c000000");' : 'background-color:rgba(0,0,0,0.3);'].join(''),

                           innerhtml: ['<iframe src="', url , '?appkey=', appkey, '" ', attrs, '></iframe>'].join('')

                       });

                       resize = function () {

                            QQWB.trigger(_b.get("innerauth","eventproxysizechange"), lastw, lasth);

                       };

                       cleanup = function () {

                           layer.parentNode.removeChild(layer);

                           QQWB.unbind(_b.get("innerauth","eventproxysizechange"), false); // unbind all size change listener

                           if (window.removeEventListener) {

                               window.removeEventListener('resize', resize);

                           } else if (window.detachEvent) {

                               window.detachEvent('onresize', resize);

                           }
                       };

                       QQWB.once(_b.get("innerauth","eventproxysubmit"), function (responseText) {

                           QQWB._token.resolveResponse(responseText,true);

                           cleanup();

                       });

                       QQWB.once(_b.get("innerauth","eventproxycancel"), function () {

                           QQWB._token.resolveResponse("error=user_refused",true);

                           cleanup();

                       });

                       //
                       QQWB.bind(_b.get("innerauth","eventproxysizechange"), function (w, h) {

                           // not correct in chrome
                           //var offsettop = _br.rendererMode.standard ? document.documentElement.scrollTop : document.body.scrollTop;

                           var offsettop = document.documentElement.scrollTop || document.body.scrollTop;

                           lastw = w;

                           lasth = h;

                           layer.style.width = w + 'px';

                           layer.style.height = h + 'px';

                           layer.style.left = Math.max(0,(_br.viewport.width - w)) / 2 + 'px';

                           layer.style.top = offsettop + Math.max(0,(_br.viewport.height - h)) / 2 + 'px';

                           layer.style.visibility = "visible"; // show auth layer

                       });

                       if (window.addEventListener) {

                           window.addEventListener('resize', resize);

                       } else if(window.attachEvent) {

                              window.attachEvent('onresize', resize);

                       }

                       document.body.appendChild(layer);

                   }

               }); // end documentReady

           } // end show

       };

   oAuthWindow = (function () {

       var  authorizing = false,
    
            awindow = null;
        
        return {
    
            show: function () {
    
                   var width = _b.get("oauthwindow","width"),
               
                       height = _b.get("oauthwindow","height"),
               
                       name = _b.get("oauthwindow","name"),
               
                       url = _b.get("uri","auth"),
               
                       attrs = "toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=yes,status=no",

                    appkey = _b.get("base", "appkey"),
    
                    autoclose = _b.get("base","autoclose"),
    
                    samewindow = _b.get("base","samewindow"),
    
                    x,
    
                    y,
    
                    query,
    
                    props;
    
                if (!authorizing) {
    
                    x = (window.screenX || window.screenLeft) + Math.max(0,((window.outerWidth || document.documentElement.clientWidth) - width)) / 2;
    
                    y = (window.screenY || window.screenTop) + Math.max(0,((window.outerHeight || document.documentElement.clientHeight) - height)) / 2;
    
                    query =  _.queryString.encode({
    
                         response_type: "token"
    
                        ,client_id: appkey
    
                        ,redirect_uri: _b.get("uri","redirect")
    
                        ,scope: "all"

                        ,wap: _br.platform.mobile ? 2 : null
    
                    });

                    props = ["width=" + width, "height=" + height, "left=" + x, "top=" + y].join(",");
    
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
    
                               if (response) { // hash must be exists
    
                                    response = _q.decode(response);
    
                                   _t.resolveResponse(response, true);
    
                                   authorizing = false;
    
                                   if (autoclose) {

                                       setTimeout(function () {

                                           awindow.close();

                                           awindow = null;

                                       }, 0);

                                   } else {

                                       awindow = null;

                                   }
    
                                   return;
    
                               }
    
                            }
    
                            setTimeout(arguments.callee, 0);
    
                        }
    
                    }());
    
                } else {
    
                    awindow && awindow.focus();
    
                }
                
            }
    
        };

    }()); // end oAuthWindow

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

        var inited = _b.get("base","inited"),

            innerauth = _b.get("innerauth","enabled"),

            loginStatus = _.auth.loginStatus(), 

            error,

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

        if (optSuccessHandler || optFailHandler) {

            onLoginSessionComplete = function (arg1) {

                if(arg1.access_token && optSuccessHandler) {

                    optSuccessHandler(arg1);

                } else if(arg1.error && optFailHandler){

                    optFailHandler(arg1);

                } else {

                    _l.error("wired result of T.login " + QQWB.JSON.stringify(arg1));

                }

                _.unbind(_b.get("nativeevent","userloggedin"), onLoginSessionComplete);

                _.unbind(_b.get("nativeevent","userloginfailed"), onLoginSessionComplete);

                onLoginSessionComplete = null;

            };

            _.bind(_b.get("nativeevent","userloggedin"), onLoginSessionComplete);

            _.bind(_b.get("nativeevent","userloginfailed"), onLoginSessionComplete);

        }

        if (innerauth) {

            innerAuthLayer.show();

        } else {

            oAuthWindow.show();

        }

        return _;
    }

    /**
     * Logout user
     *
     * @return {Object} QQWB object
     */
   ,logout: function (optHandler) {

       var loginStatus = _.loginStatus(),

           innerauth = _b.get("innerauth","enabled"),

           rootDomain = _b.get("innerauth","rootdomain");

       _l.info("logging out user");

       if (!loginStatus) {

           _l.warning("oops, user not logged in");

       } else {

           _t.clearAccessToken();

           _t.clearRefreshToken();

           _l.info("user " + (loginStatus.name || "unknown") + " logged out");

       }

       if (innerauth) {
           _c.del('uin','/',rootDomain);
           _c.del('skey','/',rootDomain);
           _c.del('luin','/',rootDomain);
           _c.del('lskey','/',rootDomain);
       }

       if (optHandler) optHandler();

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

       var accessToken = _t.getAccessToken(),

           user = _t.getTokenUser(),

           status;

       if (accessToken) {

           status = {

               access_token: accessToken

              ,openid: user.openid

              ,name: user.name

              ,nick: user.nick

           };

       }

       if(optCallback) optCallback(status);

       return status;
    }
});

QQWB.login = QQWB.auth.login;

QQWB.logout = QQWB.auth.logout;

QQWB.loginStatus = QQWB.auth.loginStatus;

}());
