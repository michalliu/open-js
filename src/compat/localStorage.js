/**
 * Tencent weibo javascript library
 *
 * Crossbrowser localstorage solution
 *
 * @author michalliu
 * @version 1.0
 * @package compat
 * @module localStorage
 * @requires base
 *           core.browser
 *           core.boot
 *           core.log
 *           core.time
 *           JSON2
 */

if (QQWB.browser.feature.localstorage) { // implement html5 localstorge
    QQWB.extend("localStorage", {
        set: function (key, value, expireInDays) {
            key = "k" + key;
            var 
                expire = QQWB.time.secondsNow() + (expireInDays || 7) * 24 * 3600,
                val = {
                    value: value
                   ,expire: expire
                };
            localStorage[key] = JSON.stringify(val);
            return localStorage[key];
        }
       ,get: function (key, defaultVal) {
           key = "k" + key;
           var temp = localStorage[key];
           if (temp && (temp = JSON.parse(temp)) && temp.value &&  QQWB.time.secondsNow() < temp.expire) {
               return temp.value;
           }
           return defaultVal;
        }
       ,del: function (key) {
           key = "k" + key;
           localStorage.removeItem(key);
           return !!!localStorage[key];
        }
    });
} else if (QQWB.browser.feature.userdata) {
    var 
        userData,
        storeName = "QQWBLocalStore";

    QQWB.documentReady(function () {
        userData = document.createElement("input");
        userData.type = "hidden";
        userData.style.display="none";
        userData.addBehavior("#default#userData");
        userData.expires = new Date(QQWB.time.now() + 365 * 10 * 24 * 3600 * 1000).toUTCString();
        document.body.appendChild(userData);
    });

    QQWB.extend("store", {
        set: function (key, value, expireInDays) {
            key = "k" + key;
            var 
                expire = QQWB.time.secondsNow() + (expireInDays || 7) * 24 * 3600,
                val = {
                    value: value
                   ,expire: expire
                };
            !userData && QQWB.log.error("store can't set value for key " + key + ", userData is unavaiable, please try later");
            userData && userData.load(storeName);
            userData && userData.setAttribute(key,JSON.stringify(val));
            userData && userData.save(storeName);
            return userData.getAttribute(key);
        }
       ,get: function (key, defaultVal) {
           key = "k" + key;
           !userData && QQWB.log.error("store can't get value for key " + key + ", userData is unavaiable, please try later");
           userData && userData.load(storeName);
           var temp = userData && userData.getAttribute(key);
           if (temp && (temp = JSON.parse(temp)) && temp.value && QQWB.time.secondsNow() < temp.expire) {
               return temp.value;
           }
           return defaultVal;
        }
       ,del: function (key) {
           key = "k" + key;
           !userData && QQWB.log.error("store can't delete value for key " + key + ", userData is unavaiable, please try later");
           userData && userData.load(storeName);
           userData && userData.removeAttribute(key);
           userData && userData.save(storeName);
           return !!!userData.getAttribute(key);
       }
   });

} else {
    QQWB.log.warning("T.localStorage object isn't initialized, do check before use");
}

if (QQWB.browser.feature.localstorage || QQWB.browser.feature.userdata) {
    QQWB._alias.call(QQWB.localStorage,"save",QQWB.localStorage.set);
    QQWB._alias.call(QQWB.localStorage,"remove",QQWB.localStorage.del);
}
