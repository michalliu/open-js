package
{
	import flash.display.MovieClip;
	import flash.external.ExternalInterface;
	import flash.events.Event; 
    import flash.events.ErrorEvent; 
	import flash.events.HTTPStatusEvent
	import flash.events.IOErrorEvent; 
	import flash.events.SecurityErrorEvent; 
	import flash.net.URLLoader; 
	import flash.net.URLLoaderDataFormat; 
	import flash.net.URLRequest; 
	import flash.net.URLRequestMethod;
	import flash.net.URLRequestHeader;
	import flash.net.URLVariables; 
	import flash.system.Security;
    Security.allowDomain("*");
	
	public class proxy extends MovieClip
	{
		public function proxy()
		{
			ExternalInterface.addCallback("httpRequest", httpRequest);
			ExternalInterface.call("onFlashReady_a1f5b4ce");
		}
		
		private function httpRequest (uri:String, param:String="", method:String="GET", ticket:String=""):void
		{
			
		    var 
		        urlRequest:URLRequest = new URLRequest(uri),
		    	urlLoader:URLLoader = new URLLoader();
			
			function onURLRequestHttpStatusComplete():Function {
				    return function (e:HTTPStatusEvent):void {
						var ret:Object = new Object();
						ret["ticket"] = ticket;
						ret["srcEvent"] = e;
			            ExternalInterface.call("onFlashRequestComplete_8df046",ret);
					};
			};
			
			function onURLRequestComplete():Function {
				    return function (e:Event):void {
						/*
			             * api response <a href=\"xxx\"> example </a> which will
			             * cause ExternalInterface eval error. IE will raise exception of "missing }",
			             * chrome will raise exception "Uncaught SyntaxError: Unexpected identifier".
			             */
						// ExternalInterface.call("QQWB.log.debug","[proxy.swf] URL request status " + e.type + " ,ExternalInterface may raise exception due eval with backslash");
						var ret:Object = new Object();
			            e.target.data = e.target.data.split("\\").join("\\\\");
						ret["ticket"] = ticket;
						ret["srcEvent"] = e;
			            ExternalInterface.call("onFlashRequestComplete_8df046",ret);
					};
			};
		
			function onURLRequestError():Function {
				    return function (e:Event):void {
						var ret:Object = new Object();
						ExternalInterface.call("QQWB.log.error","[proxy.swf] URL request error " + e.type);
						ret["ticket"] = ticket;
						ret["srcEvent"] = e;
			            ExternalInterface.call("onFlashRequestComplete_8df046",ret);
					};
			};
			
		    method = method.toLowerCase();
		    
		    switch (method) 
		    {
		        case "get":
		    	urlRequest.method = URLRequestMethod.GET;
		    	break;
		    	case "post":
		    	urlRequest.method = URLRequestMethod.POST;
		    	break;
		    	default:
		    	urlRequest.method = URLRequestMethod.GET;
		    }
			
			urlRequest.contentType = "text/plain; charset=utf-8";
			urlRequest.requestHeaders.push(new URLRequestHeader("X-Requested-With", "XMLHttpRequest"));
			urlRequest.requestHeaders.push(new URLRequestHeader("X-Requested-From", "openjs"));
		    urlRequest.data = param;
		    urlLoader.dataFormat = URLLoaderDataFormat.TEXT;
		    urlLoader.addEventListener(Event.COMPLETE, onURLRequestComplete());
	        urlLoader.addEventListener(HTTPStatusEvent.HTTP_STATUS, onURLRequestHttpStatusComplete());
		    urlLoader.addEventListener(IOErrorEvent.IO_ERROR, onURLRequestError());
		    urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onURLRequestError());
			try {
		        urlLoader.load(urlRequest);
			} catch (error:Error) {
			    ExternalInterface.call("QQWB.log.error","[proxy.swf] URL loader error [" + error.name + "] " + error.message);
			}
		}
		
		
	}
}
