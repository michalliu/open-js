/**
 * Tencent weibo javascript library
 *
 * Browser and browser's feature detection
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module browser
 * @requires base
 *           log
 */

(function (){
    var 
        browserMatch; // ua regexp match result
    var
              ua = navigator.userAgent,
           rmsie = /(msie) ([\w.]+)/,
          ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
         rwebkit = /(webkit)[ \/]([\w.]+)/,
        rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;
    var
        browserFeatures = {}, // keep browser features
        browserPrefixes = ["Webkit","Moz","O","ms","khtml"],
        featureTests = {
             "cookie": function () {
                 var cookieEnabled = navigator.cookieEnabled;
                 if (cookieEnabled && QQWB.browser.webkit) {
                     // resolve webkit bug
                     var cookiename = "COOKIE_TEST_" + QQWB.uid();
                     // try to set a test cookie
                     document.cookie = cookiename + "=" + 1 +"; domain=; path=;";
                     // check cookie exists or not
                     if (document.cookie.indexOf(cookiename) < 0) {
                         cookieEnabled = false;
                     } else {
                         // remove test cookie
                         document.cookie = cookiename + "=" +"; expires=" + new Date(1970,1,1).toUTCString() + "; domain=; path=;";
                     }
                 }
                 !cookieEnabled && QQWB.log.critical("Your browser doesn't support cookie or cookie isn't enabled");
                 return cookieEnabled;
             }
            ,"flash": function () { // code borrowed from http://code.google.com/p/swfobject
                 if (typeof navigator.plugins != "undefined" && typeof navigator.plugins["Shockwave Flash"] == "object") {
                     var desc = navigator.plugins["Shockwave Flash"].description; // plug in exists;
                     var enabled = typeof navigator.mimeTypes != "undefined"
                                  && navigator.mimeTypes["application/x-shockwave-flash"]
                                  && navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin;
                     return desc && enabled;
                 } else if (typeof window.ActiveXObject != "undefined") {
                     try {
                         var flashAX = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                         if (flashAX) {
                             return flashAX.getVariable("$version");
                         }
                     } catch (ex) {}
                 }
             }
            ,"userdata": function () {
                return QQWB.browser.msie;
             }
            ,"postmessage": function () {
                // ie8 support postmessage but it does not work with window.opener
                return !!window.postMessage && ((QQWB.browser.msie && parseInt(QQWB.browser.version,10) < 8) ? false : true); 
             }
            ,"canvas": function () {
                var elem = document.createElement("canvas");
                return !!(elem.getContext && elem.getContext("2d"));
            }
            ,"webgl": function () {
                return !!window.WebGLRenderingContext;
            }
            ,"geolocation": function () {
                return !!navigator.geolocation;
            }
            ,"websqldatabase": function () {
                return !!window.openDatabase;
            }
            ,"indexeddb": function () {
                for (var i = 0, l = browserPrefixes.length; i < l; i++) {
                    if (window[browserPrefixes[i].toLowerCase() + "IndexedDB"]) {
                        return true;
                    }
                }
                return !!window.indexedDB;
            }
            ,"websocket": function () {
                for (var i = 0, l = browserPrefixes.length; i < l; i++) {
                    if (window[browserPrefixes[i].toLowerCase() + "WebSocket"]) {
                        return true;
                    }
                }
                return !!window.WebSocket;
            }
            ,"localstorage": function () {
                return window.localStorage && localStorage.getItem;
            }
            ,"sessionstorage": function () {
                return window.sessionStorage && sessionStorage.getItem;
            }
            ,"webworker": function () {
                return !!window.Worker;
            }
            ,"applicationcache": function () {
                return !!window.applicationCache;
            }
        };

    // detect browser type and version rely on the browser's user-agent
    function uaMatch (ua) {
        ua = ua.toLowerCase();
        var 
            match = rwebkit.exec( ua ) ||
                    ropera.exec( ua ) ||
                    rmsie.exec( ua ) ||
                    ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
                    [];

        return { browser: match[1] || "unknown", version: match[2] || "0" };
    }

    // test browser features
    // now we only support little features
    // please visit http://www.modernizr.com for full feature test
    function featureTest () {
        for (var feature in featureTests) {
            if (featureTests.hasOwnProperty(feature)) {
                if (featureTests[feature]()) {
                    browserFeatures[feature] = true;
                }
            }
        }
    }

    browserMatch = uaMatch(ua);

    QQWB.extend('browser',{
        "version":browserMatch.version
    });

    QQWB.browser[browserMatch.browser] = true;

    featureTest();

    QQWB.extend('browser.feature',browserFeatures);

}());
