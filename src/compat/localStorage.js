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
 *           core.dom
 *           core.log
 */

if (QQWB.browser.feature.localstorage) { // implement html5 localstorge

    QQWB.extend("localStorage", {

        set: function (key, value, expireInDays) {

            key = "k" + key;

            var _ = QQWB,

                expire = _.time.secondsNow() + (expireInDays || 7) * 24 * 3600,

                val = {

                    value: value

                   ,expire: expire

                };

            try {

                localStorage[key] = _.JSON.stringify(val);

            } catch (stringifyJSONError) {

                _.log.error("[localstorage] save error key [" + key + "] value [" + value + "]" + stringifyJSONError);

                return;

            }

            return localStorage[key];
        }

       ,get: function (key, defaultVal) {

           key = "k" + key;

		   var _ = QQWB,

		       temp = localStorage[key];

           if (temp && (temp = _.JSON.parse(temp)) && temp.value &&  _.time.secondsNow() < temp.expire) {

               return temp.value;

           }

           return defaultVal;

        }

       ,del: function (key) {

           key = "k" + key;

           localStorage.removeItem(key);

           return typeof localStorage[key] == "undefined";

        }

    });

} else if (QQWB.browser.feature.userdata) {

	(function () {

    	var _ = QQWB,
    
    	    userData,
    
            storeName = "QQWBLocalStorage";
    
        _.dom.ready(function () {
    
			var writeCache = _.bigtable.get("localstorage", "writecache"),

			    deleteCache = _.bigtable.get("localstorage", "deletecache");

            userData = document.createElement("input");
    
            userData.type = "hidden";
    
            userData.style.display="none";
    
            userData.addBehavior("#default#userData");
    
            userData.expires = new Date(_.time.now() + 365 * 10 * 24 * 3600 * 1000).toUTCString();
    
            document.body.appendChild(userData);

			if (writeCache && writeCache.length > 0) {

				_.Array.forEach(writeCache, function (v) {

				    _.localStorage.set.apply(_.localStorage,v);

				});

			}

			if (deleteCache && deleteCache.length > 0) {

				_.Array.forEach(deleteCache, function (v) {

				    _.localStorage.del.apply(_.localStorage,v);

				});
			}
        });
    
        _.extend("localStorage", {

            set: function (key, value, expireInDays) {

				var _ = QQWB,

				    cache,

			    	expire,

			    	val;

				if (!userData) { // write to cache

				    cache = _.bigtable.get("localstorage", "writecache", []);

					cache.push(_.Array.fromArguments(arguments));

					_.log.warning("userdata is not ready, save operation to write cache, key " + key);

					return -1; 
				}

                key = "k" + key;

				expire = _.time.secondsNow() + (expireInDays || 7) * 24 * 3600,

                val = {

                    value: value

                   ,expire: expire

                };

                try {

                    userData.load(storeName);

                    userData.setAttribute(key,JSON.stringify(val));

                    userData.save(storeName);

                } catch (stringifyJSONError) {

                    _.log.error("[localstorage] save error key [" + key + "] value [" + value + "]" + stringifyJSONError);

                    return;

                }

                return userData.getAttribute(key);

            }

           ,get: function (key, defaultVal) {

			   var _ = QQWB,

			       temp;

               key = "k" + key;

			   if (!userData) {

                   _.log.error("[localStorage] can't get value for key " + key + ",userData is currently unavaiable");

				   return defaultVal;
			   }


               userData.load(storeName);

               temp = userData.getAttribute(key);

               if (temp && (temp = JSON.parse(temp)) && temp.value && _.time.secondsNow() < temp.expire) {

                   return temp.value;

               }

               return defaultVal;
            }

           ,del: function (key) {

			   var _ = QQWB,

			       cache;

               if (!userData) {
               
                   cache = _.bigtable.get("localstorage", "deletecache", []);
                   
                   cache.push(_.Array.fromArguments(arguments));
                   
                   _.log.warning("userdata is not ready, save operation to delete cache, key " + key);
                   
                   return -1; 
               }

               key = "k" + key;

               userData.load(storeName);

               userData.removeAttribute(key);

               userData.save(storeName);

               return typeof userData.getAttribute(key) == "undefined";
           }

       });

	} ());


} else {

    QQWB.log.error("localStorage is not supported and no workaround");

    QQWB.extend("localStorage", {
        set: function () {return;},
        get: function () {return;},
        del: function () {return;}
    });
}

if (QQWB.localStorage) {

	QQWB.localStorage.save = QQWB.localStorage.set;

	QQWB.localStorage.remove = QQWB.localStorage.del;
}
