/**
 * Tencent weibo javascript library
 *
 * Flash(swf file) loader
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module flash
 * @requires base
 *           common.Array
 *           browser
 *           dom
 */
QQWB.extend("flash",{
    NO_CACHE: 1
    /**
     * Load swf to the current page by swf file path
     *
     * @access public
     * @param swfPath {String} the swf file path
     * @param optCallback {Function} the optCallback when swf is ready
     * @param optCache {Number} indicate whether cache the swf file
     * @return Flash {Object}
     */
   ,load: function (swfPath,movieName,optCallback, optCache) { 

       // lazy create the loaded swfs
       if (!this.loadedSwfs) {
           this.loadedSwfs = [];
       }

       // if that swf already loaded, prevent to load the same swf again
       if (QQWB.Array.inArray(this.loadedSwfs, swfPath)) {
           QQWB.log.warning(swfPath + "is already loaded");
           return;
       }

	   // defect cache
       if (optCache === this.NO_CACHE) {
	       swfPath += "?" + QQWB.uid();
       }

       // this is the function name will be called inside flash
       // to indicate that the flash itself is ready now
       var movieContainerId= "movieContainer_" + QQWB.uid(),
           flashReadyCallbackName = "onFlashReady_a1f5b4ce",
           _flashReady = window[flashReadyCallbackName];

       window[flashReadyCallbackName] = function () {

           optCallback && optCallback();
           // restore back to original value
           window[flashReadyCallbackName] = _flashReady;
           // if the original value is undefined
           // then delete it
           //if (typeof _flashReady === "undefined") {
               //delete window[flashReadyCallbackName];
           //}
           // clean up variables in closure to avoid memory leak in IE
           _flashReady = null;
           optCallback && (optCallback = null);
       };

       // code generated
       QQWB.dom.appendHidden(['<object'
                              ,  'type="application/x-shockwave-flash"'
                              ,  'id="' + movieName + '"'
                              ,  QQWB.browser.msie ? 'name="' + movieName +  '"' : ''
                              ,  QQWB.browser.msie ? 'data="' + swfPath + '"' : ''//FIXME: IE下会触发两次HTTP请求
                              ,  QQWB.browser.msie ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"' : ''
                              ,  'allowscriptaccess="always">'
                              ,  '<param name="movie" value="' + swfPath + '"></param>'
                              ,  '<param name="allowscriptaccess" value="always"></param>'
                              ,  '</object>'
                              ].join(" "),{id:movieContainerId},true);
       return document.getElementById(movieContainerId);
    }
    /**
     * Retrieve the swf object
     *
     * @access public
     * @param name {String} the swf name
     * @param {Object} the swf object
     */
   ,getSWFObjectByName: function (name) {
       if (QQWB.browser.msie) {
           return window[name];
       } else {
           if (document[name].length) {
               return document[name][1];
           }
           return document[name];
       }
    }
});
