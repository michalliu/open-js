/**
 * Tencent weibo javascript library
 *
 * Cookie manipulation
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module cookie
 * @requires base
 *           log
 */

QQWB.extend("cookie", {
    /**
     * Set cookie
     *
     * @param name {String} cookie name
     *        value {String} cookie value
     *        maxage {Number} seconds from now. If present -1 it means a session cookie(default by browser)
     *        path {String} cookie path. If not present then use full request path(default by browser)
     *        domain {String} cookie domain. If not present then use full request host name(default by browser)
     * @access public
     * @return {Void}
     */
    set: function (name, value, opt_maxage, opt_path, opt_domain) {

       if ( typeof opt_maxage === "undefined" || opt_maxage === null) {
           opt_maxage = -1;
       }

       var cookieDomain = opt_domain ? "domain=" + opt_domain : "";
       var cookiePath = opt_path ? "path=" + opt_path : "";
       var cookieExpire = "";

       if (opt_maxage === 0) {
           // expire the cookie
           cookieExpire = "expires=" + new Date(1970,1,1).toUTCString();
       } else if (opt_maxage > 0) {
           cookieExpire = "expires=" + new Date(+new Date+opt_maxage*1000).toUTCString();
       }

       document.cookie = [name + "=" + value, cookieExpire, cookiePath, cookieDomain].join("; ");

       return this;
    }

    /**
     * Return the first value for the given cookie name 
     *
     * @access public
     * @param name {String} cookie name
     * @return {String} value for cookie
     */
   ,get: function (name) {
       var 
           cookieName = name + "=";
           cookies = (document.cookie || "").split(/\s*;\s*/);
       for (var i=0,l=cookies.length; i<l; i++) {
           var cookie = cookies[i];
           if (cookie.indexOf(cookieName) === 0) {
               return cookie.substr(cookieName.length);
           }
       }
    }

    /**
     * Delete cookie
     *
     * @access public
     * @param name {String} cookie name
     *        opt_path {String} the path of cookie
     *        opt_domain {String} the domain of cookie
     * @return {Void}
     */
   ,del: function (name, opt_path, opt_domain) {

       this.set(name, '', 0, opt_path, opt_domain);

       if (document.cookie.indexOf(name+"=") >= 0) {
           QQWB.log.warning("Cookie may not be deleted as you expected");
       }

       return this;
    }
});
