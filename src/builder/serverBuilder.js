/**
 * Tencent weibo javascript library
 *
 * Server side runs
 *
 * @author michalliu
 * @version 1.0
 * @package builder
 * @module openjsServerSideProxyBuilder
 * @requires base
 *           core.log
 *           core.io
 *           common.JSON
 *           common.Array
 */

// boot library
(function () {
    QQWB.log.info("proxy is running");
    var 
		targetOrigin = "*", // we don't care who will handle the data
        appWindow = window.parent; // the third-party application window

    // post a message to the parent window indicate that server frame(itself) was successfully loaded
    appWindow.postMessage("success", targetOrigin); 

    // recieve message from appWindow as data transfer proxy
	var messageHandler = function (e) {
		// accept any origin
		// we do strict api check here to protect from XSS/CSRF attack
		//
		var 
		    data = QQWB.JSON.fromString(e.data),
			id = data.id, // message id related to the deferred object
			args = data.data, //
			apiInterface = args[0]; //  the api interface should be the first argument

		if (args[2].toLowerCase() == "xml") {
			// if dataType is xml, the ajax will return a xml object, which can't call
			// postMessage directly (will raise an exception) , instead we request to tranfer
			// XML as String, then parse it back to XML object.
			// io.js will fall to response.text
			// api.js will detect that convert it back to xml
			// @see io.js,api.js
			args[2] = "xmltext";
		}

		if (!apiInterface) { // interface can not be empty
			appWindow.postMessage(QQWB.JSON.stringify({
				id: id
			   ,data: [-1, "interface can not be empty"]
			}), targetOrigin);
			QQWB.log.error("interface is empty");
		} else {
			// everything goes well
			// we directly pass the data to the reciever regardless its success or not
			QQWB.io._apiAjax.apply(this,args).complete(function () {
				// can't stringify a xml object here
		    	appWindow.postMessage(QQWB.JSON.stringify({
		    		id: id
		    	   ,data: QQWB.Array.fromArguments(arguments)
		    	}), targetOrigin);
			});
	   }
    };

    if (window.addEventListener) {
        window.addEventListener("message", messageHandler, false);
    } else if (window.attachEvent) {
        window.attachEvent("onmessage", messageHandler);
    }

}());
