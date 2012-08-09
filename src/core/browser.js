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
 *           util.bigtable
 */
/*jslint laxcomma:true*/
(function (){

    var browserMatch, // ua regexp match result

        mobilePlatformMatch,

              ua = navigator.userAgent,

           //rmsie = /(msie) ([\w.]+)/,
           
          ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,

         rwebkit = /(webkit)[ \/]([\w.]+)/,

        rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

        // http://detectmobilebrowsers.com/
        rmobileplatform = /android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i,

        browserFeatures = {}, // keep browser features

        browserPrefixes = ["Webkit","Moz","O","ms","khtml"],

        featureTests = {

             "cookie": function () {

                 if (navigator.cookieEnabled) return true;

                 document.cookie = "cookietest=1";

                 var ret = document.cookie.indexOf("cookietest=") != -1;

                 document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";

                 return ret;

             }

             // code borrowed from http://code.google.com/p/swfobject
            ,"flash": function () { 

                   var desc,

                     enabled,

                     flashAX,

                     playerversion,

                     ret;// major,minor,build

                 if (typeof navigator.plugins != "undefined" && typeof navigator.plugins["Shockwave Flash"] == "object") {

                    desc = navigator.plugins["Shockwave Flash"].description; // plug in exists;

                    enabled = typeof navigator.mimeTypes != "undefined" && navigator.mimeTypes["application/x-shockwave-flash"] && navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin;

                    if (desc && enabled) {

                        desc = desc.replace(/^.*\s+(\S+\s+\S+$)/, "$1");

                        playerversion = [];

                        playerversion[0] = parseInt(desc.replace(/^(.*)\..*$/, "$1"), 10);

                        playerversion[1] = parseInt(desc.replace(/^.*\.(.*)\s.*$/, "$1"), 10);

                        playerversion[2] = /[a-zA-Z]/.test(desc) ? parseInt(desc.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;

                    }

                 } else if (typeof window.ActiveXObject != "undefined") {
                     try {

                         flashAX = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");

                     } catch (ex) {
                     
                     }

                     if (flashAX) {

                         desc = flashAX.getVariable("$version");

                         if (desc) {

                             desc = desc.split(" ")[1].split(",");

                             playerversion = [parseInt(desc[0], 10), parseInt(desc[1], 10), parseInt(desc[2], 10)];

                         } else {

                             playerversion = [0, 0, 0];

                         }
                     }
                 }

                 if (playerversion) {

                     ret = { version : playerversion.join(".")};

                     if ( playerversion[0] >= 9 ) { // detect if flash player too old

                         ret.externalinterface = true;

                     }

                     return ret;

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

                return !!(window.localStorage && localStorage.getItem);

            }

            ,"sessionstorage": function () {

                return !!(window.sessionStorage && sessionStorage.getItem);

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

        var ie, uamatch;

        // http://stackoverflow.com/questions/4169160/javascript-ie-detection-why-not-use-simple-conditional-comments
        // a more reliable way
        ie = (function(){
        
            var undef,
                v = 3,
                div = document.createElement('div'),
                all = div.getElementsByTagName('i');
        
            while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[0]);
        
            return v > 4 ? v : undef;
        
        }());

        if ( ie ) {

            return { browser: "msie", version: ie };

        }

        uamatch = rwebkit.exec( ua ) ||
                    ropera.exec( ua ) ||
                  //rmsie.exec( ua ) ||
                    ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
                    [];

        return { browser: uamatch[1] || "unknown", version: uamatch[2] || "0" };
    }

    // test browser features
    // now we only support little features
    // please visit http://www.modernizr.com for full feature test
    function featureTest () {
        
        var featureName,

            result;

        for (featureName in featureTests) {

            if (featureTests.hasOwnProperty(featureName)) {

                result = featureTests[featureName](); // run the test

                if (result) {

                    browserFeatures[featureName] = result;

                }
            }
        }
    }


    function detectOS() {

        var appversion = navigator.appVersion,

            os = {},

            osName = "unknown";

        if (appversion.indexOf("Win")!=-1)  osName="windows";

        if (appversion.indexOf("Mac")!=-1)  osName="mac";

        if (appversion.indexOf("X11")!=-1)  osName="unix";

        if (appversion.indexOf("Linux")!=-1)  osName="linux";

        os[osName] = true;

        os.name = osName;

        return os;

    }

    function detectRendererMode() {

        if (document.compatMode == 'BackCompat') {

            return {quirks: true};

        } else {

            return {standard: true};

        }

    }

    QQWB.bigtable.put("browser", 'detectviewportsize', function () {

        var el = window,

            attr = 'inner',

            mode = document.compatMode;

        if ( !('innerWidth' in el) ) {

            attr = 'client';

            el = mode == "BackCompat" ? document.body : document.documentElement;

        }

        // el(document.body) may not exists in quirks mode yet
        if (el) {

            return { width: el[attr+'Width'], height: el[attr+'Height'] };

        }

        return { width: 0, height: 0};

    });

    // http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
    function detectViewportSize() {

        return QQWB.bigtable.get("browser", 'detectviewportsize')();

    }


    browserMatch = uaMatch(ua);

    if (window.addEventListener) {

        window.addEventListener('resize', function () {

            QQWB.extend('browser.viewport', detectViewportSize(),true);

        },false);

    } else if (window.attachEvent){

        window.attachEvent('onresize', function () {

            QQWB.extend('browser.viewport', detectViewportSize(),true);

        });

    }

    QQWB.extend('browser',{

        "version":browserMatch.version

    });

    QQWB.browser[browserMatch.browser] = true;

    QQWB.browser.engine = browserMatch.browser;

    featureTest();

    QQWB.extend('browser.feature',browserFeatures);

    mobilePlatformMatch = rmobileplatform.exec(navigator.userAgent || navigator.vendor || window.opera || '');

    
    if (mobilePlatformMatch) {

        QQWB.extend('browser.platform', {name: mobilePlatformMatch[0], mobile: true});

        QQWB.browser.platform[mobilePlatformMatch[0]] = true;

    } else {

        QQWB.extend('browser.platform', {name: "desktop", desktop: true});

    }

    QQWB.extend('browser.os', detectOS());

    QQWB.extend('browser.rendererMode', detectRendererMode());

    QQWB.extend('browser.viewport', detectViewportSize());

}());
