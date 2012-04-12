/**
 * Tencent weibo javascript library
 *
 * Server side runs
 *
 * @author michalliu
 * @version 1.0
 * @package builder
 * @module proxy
 * @requires base
 *           core.log
 *           core.io
 *           util.bigtable
 *           util.queryString
 *           core.init
 *           common.JSON
 *           common.Array
 *           common.String
 *           weibo.util
 */

// build server side proxy

// boot library
(function () {
	var _ = QQWB,

	    _j = _.JSON,

		_a = _.Array,

		_s = _.String,

		_b = _.bigtable,

		_q = _.queryString,

		_l = _.log,

		_i = _.io,

	    messageHandler,

		targetOrigin = "*", // we don't care who will handle the data

        appWindow = window.parent; // the third-party application window

    _l.info("[proxy] proxy is running");

    // post a message to the parent window indicate that server frame(itself) was successfully loaded
	if (window != appWindow) { // iframe

        appWindow.postMessage("success", targetOrigin); 

	}

   function apiAjax (api, apiParams, dataType, type) {

       var opts = {

               type: _s.trim(type.toUpperCase())

              ,url: _b.get("uri","api") + api

              ,data: _q.encode(apiParams)

              ,dataType: _s.trim(dataType.toLowerCase())

           };

       if (opts.type == "GET") {

           opts.url += (opts.data ? "?" + opts.data : "");

           delete opts.data;

       }

       return _i.apiAjax(opts);

    }

	messageHandler = function (e) {

		// accept any origin, we do strict api check here to protect from XSS/CSRF attack
		var data,id,args,apiInterface;

		try {

			data = _j.fromString(e.data);

		} catch (jsonParseError) {}

		// check format
		if (data && data.id && data.data) {

			id = data.id, // message id related to the deferred object

			args = data.data,

			apiInterface = args[0];

	    	if (args[2].toLowerCase() == "xml") {
	    		// if dataType is xml, the ajax will return a xml object, which can't call
	    		// postMessage directly (will raise an exception) , instead we request to tranfer
	    		// XML as String, then parse it back to XML object.
	    		// io.js will fall to response.text
	    		// api.js will detect that convert it back to xmlobject
	    		// @see io.js,api.js
	    		args[2] = "_xml_";
	    	}

	    	if (!apiInterface) { // basic interface name validation

	    		appWindow.postMessage(_j.stringify({

	    			id: id

	    		   ,data: [-1, "interface can not be empty"]

	    		}), targetOrigin);

	    		_l.error("[proxy] interface cant not be empty");

	    	} else {

	    		apiAjax.apply(this,args).complete(function () {

	    			// can't stringify a xml object here
	    	    	appWindow.postMessage(_j.stringify({

	    	    		id: id

	    	    	   ,data: _a.fromArguments(arguments)

	    	    	}), targetOrigin);

	    		});

	        }

		} else {

			_l.warn("[proxy] ignore unexpected message " + e.data);

		}

    }; // end message handler

    if (window.addEventListener) {

        window.addEventListener("message", messageHandler, false);

    } else if (window.attachEvent) {

        window.attachEvent("onmessage", messageHandler);

    }

}());
