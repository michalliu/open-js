/**
 * Tencent weibo javascript library
 *
 * authorization window management
 *
 * @author michalliu
 * @version 1.0
 * @package auth
 * @module authWindow
 * @requires base
 *           core.queryString
 *           core.browser
 */
QQWB.extend("auth.authWindow",{
   // auth window attributes
   _attribs: "toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=yes,status=no"
   // auth window status
   ,_authorizing: false
   // reference to auth DOMWindow
   ,_window: null
   // show auth window, if already showed do nothing
   ,show: function (optPlatform) {
	   var platform = optPlatform || QQWB.getPlatform(),
	       query,url;

	   query =  QQWB.queryString.encode(QQWB.extend({
            response_type: "token"
           ,client_id: platform.client.appkey
	       ,redirect_uri: QQWB.platforms.data.authRedirect
           ,scope: "all"
       }, platform.authWindow.params, true));

	   url = platform.domain.auth + "?" + query;

	   if (platform.authWindow.popup) {
		   return this._popup(optPlatform, url);
	   } else {
		   window.location.href = url;
		   return this;
	   }
    }
   ,_popup: function (optPlatform, url) {
	   var platform = optPlatform || QQWB.getPlatform()
	      ,type = QQWB.browser.platform.mobile ? "mobile" : "pc" // detect browser type
	      ,x // auth window position x
	      ,y // auth window position y
		  ,width = platform.authWindow.dimension[type].width // auth window width
		  ,height = platform.authWindow.dimension[type].height // auth window height
	      ,props; // auth window propertys

	   if (!this._authorizing) {

		   x = (window.screenX || window.screenLeft) + ((window.outerWidth || document.documentElement.clientWidth) - width) / 2;
		   y = (window.screenY || window.screenTop) + ((window.outerHeight || document.documentElement.clientHeight) - height) / 2;

		   props = ["width="+width,"height="+height,"left="+x,"top="+y]
		   this._authorizing = true;
	       this._window = window.open(url, platform.authWindow.name, props + "," + this._attribs);

		   (function () {
			   var authwindow = QQWB.auth.authWindow,
			       response;
               if (platform.authWindow.autoclose/*自动关闭的授权窗口*/ && authwindow._window.closed) { //already closed
                   QQWB._token.resolveResponse("error=access_denied");
		       	   authwindow.close();
                   return;
		       } else {
		           try {
		            	response = authwindow._window.location.hash;	
		           } catch (ex) {
		           	    response = null;
		           }
		           if (response) {
					   response = QQWB.queryString.decode(response.split("#").pop());
					   // this problem doesn't exists anymore
					   //if (parseInt(response.status,10) == 200) {
		                   QQWB._token.resolveResponse(response,null,platform);
					   //}
		               platform.authWindow.autoclose && authwindow.close();
		               return;
		           }
                   setTimeout(arguments.callee, 0);
               }
            }());
    	} else {
			this.focus();
    	}
	   return this;
    }
   ,close: function () { 
	   this._authorizing = false;
	   if (!this._window) { // has auth window
		   return this;
	   }
	   if (this._window.closed) { // auth window alreay closed
		   return this;
	   }
	   this._window.close(); // closed the window
	   return this;
    }
   ,focus: function () {
	   this._window && this._window.focus();
	   return this;
    }
});
