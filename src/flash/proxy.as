package
{
	import flash.display.MovieClip;
	import flash.external.ExternalInterface;
	import flash.events.Event; 
    import flash.events.ErrorEvent; 
	import flash.events.IOErrorEvent; 
	import flash.events.HTTPStatusEvent; 
	import flash.events.SecurityErrorEvent; 
	import flash.net.URLLoader; 
	import flash.net.URLLoaderDataFormat; 
	import flash.net.URLRequest; 
	import flash.net.URLRequestMethod;
	import flash.net.URLRequestHeader;
	import flash.net.URLVariables; 
	import flash.system.Security;
    Security.allowDomain("*");
	Security.allowInsecureDomain("*");
	
	public class proxy extends MovieClip
	{
		public function proxy()
		{
			ExternalInterface.addCallback("httpRequest", httpRequest);
			ExternalInterface.call("onFlashReady_a1f5b4ce");
		}
		
		private function httpRequest (uri:String, param:String="", method:String="GET"):void
		{
		    var 
		        urlRequest:URLRequest = new URLRequest(uri),
		    	urlLoader:URLLoader = new URLLoader();
		    
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
			urlRequest.requestHeaders.push(new URLRequestHeader("X-Requested-From", "TencentWeiboJavascriptSDK"));
		    urlRequest.data = param;
		    urlLoader.dataFormat = URLLoaderDataFormat.TEXT;
		    urlLoader.addEventListener(Event.COMPLETE, urlRequestComplete);
		    urlLoader.addEventListener(IOErrorEvent.IO_ERROR, urlRequestError);
		    urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, urlRequestError);
			urlLoader.addEventListener(HTTPStatusEvent.HTTP_STATUS, urlRequestProcessing);
			try {
		        urlLoader.load(urlRequest);
			} catch (error:Error) {
			    ExternalInterface.call("QQWB.log.error","[proxy.swf] URL loader error [" + error.name + "] " + error.message);
			}
		}
		
		private function urlRequestComplete(e:Event):void {
			/*
			 * api response <a href=\"xxx\"> example </a> which will
			 * cause ExternalInterface eval error. IE will raise exception of "missing }",
			 * chrome will raise exception "Uncaught SyntaxError: Unexpected identifier".
			 */
			ExternalInterface.call("QQWB.log.info","[proxy.swf] URL request status " + e.type + " ,ExternalInterface may raise exception due eval with backslash");
			e.target.data = e.target.data.split("\\").join("\\\\");
			ExternalInterface.call("onFlashRequestComplete_8df046",e);
		}
		
		private function urlRequestError(e:ErrorEvent):void {
			ExternalInterface.call("QQWB.log.warning","[proxy.swf] URL request error " + e.type);
			ExternalInterface.call("onFlashRequestComplete_8df046",e);
		}
		
		private function urlRequestProcessing(e:HTTPStatusEvent):void {
			ExternalInterface.call("QQWB.log.info","[proxy.swf] http status change " + " phase "+ e.eventPhase + "," + e.type + " " + e.status);
		}
		
	}
}
