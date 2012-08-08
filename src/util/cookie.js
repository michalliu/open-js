/**
 * Tencent weibo javascript library
 *
 * Cookie manipulation
 *
 * @author michalliu
 * @version 1.0
 * @package util
 * @module cookie
 * @requires base
 *           core.browser
 * @includes util.bigtable
 */
/*jslint laxcomma:true*/
if (QQWB.browser.feature.cookie) {

    QQWB.extend("cookie", {
        /**
         * Set cookie
         *
         * @param name {String} cookie name
         * @param value {String} cookie value
         * @param maxage {Number} seconds from now. If present -1 it means a session cookie(default by browser)
         * @param path {String} cookie path. If not present then use full request path(default by browser)
         * @param domain {String} cookie domain. If not present then use full request host name(default by browser)
         * @access public
         * @return {Void}
         */
        set: function (name, value, opt_maxage, opt_path, opt_domain, enc) {
    
           var domain,

               path,

               expire;

           enc = enc || QQWB.bigtable.get("cookie","defaultEncoder");
    
           if ( typeof opt_maxage === "undefined" || opt_maxage === null) {
    
               opt_maxage = -1;
    
           }
    
           domain = opt_domain ? "; domain=" + opt_domain : "";
    
           path = opt_path ? "; path=" + opt_path : "";
    
           expire = "";
    
           if (opt_maxage === 0) {
    
               expire = "; expires=" + new Date(1970,1,1).toUTCString();
    
           } else if (opt_maxage > 0) {
    
               expire = "; expires=" + new Date(new Date().getTime() + opt_maxage * 1000).toUTCString();
    
           }
    
           document.cookie = enc(name) + '=' + escape(value) + expire + domain + path;
    
           return QQWB;
        }
    
        /**
         * Return the first value for the given cookie name 
         *
         * @access public
         * @param name {String} cookie name
         * @return {String} value for cookie
         */
       ,get: function (name, dec ,optDefault) {
    
           dec = dec || QQWB.bigtable.get("cookie","defaultDecoder");
    
           name = name + "=";
    
           cookies = (document.cookie || "").split(/\s*;\s*/);
    
           for (var i=0,l=cookies.length; i<l; i++) {
    
               var cookie = cookies[i];
    
               if (cookie.indexOf(name) === 0) {
    
                   return dec(cookie.substr(name.length));
    
               }
    
           }
    
           return optDefault;
        }
    
        /**
         * Delete cookie
         *
         * @access public
         * @param name {String} cookie name
         * @param opt_path {String} the path of cookie
         * @param opt_domain {String} the domain of cookie
         * @return {Void}
         */
       ,del: function (name, opt_path, opt_domain) {
    
           QQWB.cookie.set(name, '', 0, opt_path, opt_domain);
    
           if (document.cookie.indexOf(name + "=") >= 0) {
    
               QQWB.log.warning("cookie may not be deleted as you expected");
    
           }
    
           return QQWB;
    
        }
    });

} else {

    QQWB.log.debug("cookie isn't support or be enabled");

}
