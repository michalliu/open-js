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
 */
QQWB.extend("auth.authWindow",{
    // auth window width
	_width: QQWB._const.AUTH_WINDOW_WIDTH 
   // auth window height
   ,_height: QQWB._const.AUTH_WINDOW_HEIGHT 
   // auth window name
   ,_name: QQWB._const.AUTH_WINDOW_NAME
   // auth url
   ,_url: QQWB._domain.auth
   // auth window attributes
   ,_attribs: "toolbar=no,menubar=no,scrollbars=no,resizeable=yes,location=yes,status=no"
   // auth window status
   ,_authorizing: false
   // reference to auth DOMWindow
   ,_window: null
   // show auth window, if already showed do nothing
   ,show: function () {
	   var x,y,query,props;
	   if (!this._authorizing) {
		   x = (window.screenX || window.screenLeft) + ((window.outerWidth || document.documentElement.clientWidth) - this._width) / 2;
		   y = (window.screenY || window.screenTop) + ((window.outerHeight || document.documentElement.clientHeight) - this._height) / 2;
		   query =  QQWB.queryString.encode({
                response_type: "token"
               ,client_id: QQWB._appkey
               ,redirect_uri: QQWB._domain.clientproxy
               ,referer: document.location.href
               ,scope: "all"
               ,status: 0
           });
		   props = ["width="+this._width,"height="+this._height,"left="+x,"top="+y]
	       this._window = window.open(this._url + "?" + query, this._name, props+","+this._attribs);
		   this._authorizing = true;

		   (function () {
			   var authwindow = QQWB.auth.authWindow,
			       response;
               if (authwindow._window.closed) { //already closed
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
					   if (parseInt(response.status,10) == 200) {
		                   QQWB._token.resolveResponse(response);
					   }
		               authwindow.close();
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
