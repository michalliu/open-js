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

	// code borrowed from http://detectmobilebrowsers.com/
	function getPlatform() {
		var platform = navigator.userAgent || navigator.vendor || window.opera;
		if (/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(platform) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(platform.substr(0, 4))) {
			return {mobile: true};
		}
		return {pc: true};
	}

	function getOS() {
		var appversion = navigator.appVersion,
		    os = {},
		    osName = "unknown";
        if (appversion.indexOf("Win")!=-1) { osName="windows"};
        if (appversion.indexOf("Mac")!=-1) { osName="mac"};
        if (appversion.indexOf("X11")!=-1) { osName="unix"};
        if (appversion.indexOf("Linux")!=-1) { osName="linux"};
		os[osName] = true;
		return os;
	}

    browserMatch = uaMatch(ua);

    QQWB.extend('browser',{
        "version":browserMatch.version
    });

    QQWB.browser[browserMatch.browser] = true;

    featureTest();

    QQWB.extend('browser.feature',browserFeatures);
	QQWB.extend('browser.platform', getPlatform());
	QQWB.extend('browser.os', getOS());

}());
