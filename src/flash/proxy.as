package
{
	import flash.display.MovieClip;
	import flash.external.ExternalInterface;
	import flash.events.Event; 
    import flash.events.ErrorEvent; 
	import flash.events.IOErrorEvent; 
	import flash.events.SecurityErrorEvent; 
	import flash.net.URLLoader; 
	import flash.net.URLRequest; 
	import flash.net.URLRequestMethod; 
	import flash.net.URLVariables; 
	
	public class proxy extends MovieClip
	{
		public function proxy()
		{
			ExternalInterface.addCallback("httpRequest", httpRequest);
			ExternalInterface.call("onFlashProxyReady");
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
			urlRequest.data = param;
			
			urlLoader.addEventListener(Event.COMPLETE, urlRequestComplete);
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, urlRequestError);
			urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, urlRequestError);
			urlLoader.load(urlRequest);
		}
		
		private function urlRequestComplete(e:Event):void {
			ExternalInterface.call("onFlashProxyMessage",e);
		}
		
		private function urlRequestError(e:ErrorEvent):void {
			ExternalInterface.call("onFlashProxyMessage",e);
		}
		
	}
}