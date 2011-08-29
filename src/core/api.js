/**
 * Tencent weibo javascript library
 *
 * API call
 *
 * Example:
  
    T.api(
       "/status/home_timeline"
      ,{
          maxpage: 20
       }
      ,"json","GET")
 *  .success(function (response) {
 *  })
 *  .error(function (error) {
 *  });
 *
 *  Note:
 *
 *  T.api method supports cache, when the condition meets.
 *  The cached api will run automaticlly.
 *
 *  If there is a problem when processing to meet the condition.
 *  then the api call will failed too.
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module api
 * @requires base
 *           ext.XML
 *           ext.Array
 *           apiProvider
 *           deferred
 *           auth.token
 *           auth.auth
 */

QQWB.provide("api", function (api, apiParams, dataType, type) {

	apiParams = apiParams || {};
    dataType = (dataType || "json").toLowerCase();
    type = type || "GET";

	var 
    	promise,
		format = dataType, // the format string in oauth querystring
		supportedFormats = {json:true,xml:true/*,text:true*/},
    	deferred = QQWB.deferred.deferred();
	
	if (!(format in supportedFormats)) {
		format = "json";
	}

	apiParams["access_token"] = QQWB._token.getAccessToken();
	apiParams["version"] = "2.0";
	apiParams["format"] = format;


    promise = deferred.promise();


    // solutions with following priority
    var solution = QQWB._solution[QQWB._solution.HTML5_SOLUTION]
                 ||QQWB._solution[QQWB._solution.FLASH_SOLUTION]
                 ||QQWB._solution[QQWB._solution.SILVER_LIGHT_SOLUTION];

	// don't handle that, let server to the job
	// then pass a failed message to the callback
    //
	/*if (false && !QQWB._apiProvider.isProvide(api)) {
		QQWB.log.error("can't call \"" + api +"\", not supported");
		deferred.reject(-1, "api not supported"); // immediately error
		return promise;
	}*/

	// no solution or solution not correctly initialzed
	// its not possible to implement to QQWB.api method working
	if (!solution || solution.readyState === 2) {
		QQWB.log.critical("solution error");
		deferred.reject(-1, "solution error"); // immediately error
		return promise;
	}

    //TODO: if api call required solution is flash
    //then cache the function do flash solution init

	// if api called before the solution is ready, we cached it and waiting the solution ready
	// when solution is ready, regardless success or fail, these cached function will be invoke again immediately
	
	if (solution.readyState === 0) { //solution not ready
		QQWB.log.warning("solution is not ready, your api call request has been cached, will invoke immediately when solution is ready");
    	solution.promise.done(function () { // when solution is ready
		    QQWB.log.info("invoking cached api call \"QQWB.api( " + [api, apiParams, dataType, type].join(",") + " )\"...");

			// emulate the request send it to server
			// when data backs, resolve or reject the deferred object previously saved.
			// then pass the data in accordingly
			QQWB.api(api, apiParams, dataType, type)
			    .success(function () {
				    deferred.resolveWith(deferred,QQWB.Array.fromArguments(arguments));
				 })
			    .error(function (){
				    deferred.rejectWith(deferred,QQWB.Array.fromArguments(arguments));
			     }); // keep the arguments
		}).fail(function () { // we use the arguments from boot section (boot.js)
		    QQWB.log.error("can't invoking cached api call \"QQWB.api( " + [api, apiParams, dataType, type].join(",") + " )\"");
		    deferred.rejectWith(deferred,QQWB.Array.fromArguments(arguments));
		});
		return promise;
	}

	// must be here everything must be ready already from here
	
    // user not logged in, don't bother to try to get data
	if (!QQWB.loginStatus()) {
		deferred.reject(-1, "not login"); // immediately error
		return promise;
	}

	// describe what we are to do now
    QQWB.log.info("[" + (QQWB.api.id ? QQWB.api.id + 1 : 1) + "] requesting data \"" + QQWB._apiProvider.describe(api) + "\" from server...");

    if (QQWB._solution.html5) { // html5 solution
			var serverProxy = document.getElementById(solution.id);
			if (!serverProxy) { // double check to avoid the server frame was removed from dom unexpectly
	            QQWB.log.critical("server proxy not found");
	            deferred.reject(-1,"server proxy not found");
			} else {
                // server proxy's url should be same as QQWB._domain.serverproxy, if not may be we got the wrong element
				if (serverProxy.src !== QQWB._domain.serverproxy) { // double check to avoid the server frame src was modified unexpectly 
	                QQWB.log.critical("server proxy is not valid, src attribute has unexpected value");
	                deferred.reject(-1,"server proxy not valid");
				} else {
					// everything goes well
					try {
						// lazy create an collection object to maintain the deferred object
						if (!QQWB.api.deferrsCollection) {
					    	QQWB.extend(QQWB.api, {
								id : 0
							   ,_deferredCollection: {
							   }
							   ,deferredAt: function (deferredId) {
								   if (this._deferredCollection[deferredId]) {
								       return this._deferredCollection[deferredId];
								   } else {
	                                   QQWB.log.warning("get deferred object has failed, that object does not exist at index " + deferredId);
								   }
							    }
								// uncollect the deferred object
							   ,uncollect: function (deferredId) {
								   if (this._deferredCollection[deferredId]) {
								       delete this._deferredCollection[deferredId];
								   } else {
	                                   QQWB.log.warning("uncollect deferred object has failed, that object does not exist at index " + deferredId);
								   }
							    }
								// collect an deferred object to collections
							   ,collect: function (deferredObj) {
								   if (deferredObj.promise) { // it's an deferred object
								       this._deferredCollection[++this.id] = deferredObj;
								       return this.id;
								   } else { // we dont accpept other than deferred object
	                                   QQWB.log.warning("collect a non-deferred object is illegal");
								   }
							    }
							  
								// how many api call this page does?
							   ,total: function () {
								   return QQWB.api.id;
							    }
					    	});
						}

						// send to proxy server
						// IE only support String type as the message,http://msdn.microsoft.com/en-us/library/cc197015(v=vs.85).aspx
						serverProxy.contentWindow.postMessage(JSON.stringify({ 
							id: QQWB.api.collect(deferred)
						   ,data: [api, apiParams, dataType, type]
						}),QQWB._domain.serverproxy);

						// add listeners for the data when data comes back
						var messageHandler = function (e) {
							// we only trust the data back from the API server, ingore others
							// This is important for security reson
							if (QQWB._domain.serverproxy.indexOf(e.origin) !== 0) {
	                            QQWB.log.warning("unexpected message arrived from " + e.origin + " with data " + e.data);
							} else {
								// here is the result comes back

								// data.id represent the caller's id to know which deferred object should handle the data
								// data.data reprent the result return from API server
								var 
							    	data = JSON.parse(e.data),
									id = data.id,
									relateDeferred = QQWB.api.deferredAt(id),
							    	response = data.data;

								if (relateDeferred) {
							        if (response[0] !== 200) {
										relateDeferred.reject.apply(relateDeferred,response);
									} else {
										if (response[4] == "xmltext") {
											response[2] = QQWB.XML.fromString(response[2])
										}
										relateDeferred.resolve.apply(relateDeferred,[response[2],response[3]]);
							    	}
									QQWB.api.uncollect(id);
								} else {
	                                QQWB.log.warning("related deferred object not found, it shouldn't happen");
								}
							}

							// remove event listener
							if (window.removeEventListener) {
								window.removeEventListener("message",messageHandler);
							} else if (window.detachEvent) {
								window.detachEvent("onmessage",messageHandler);
							}

							messageHandler = null;
						}
                        if (window.addEventListener) {
                            window.addEventListener("message", messageHandler, false);
                        } else if (window.attachEvent) {
                            window.attachEvent("onmessage", messageHandler);
                        }
					} catch (ex) {
	                    QQWB.log.critical("post message to server proxy has failed, " + ex);
	                    deferred.reject(-1,ex);
					}
				} // end server proxy src modified check
			} // end server proxy existance check

	} else if (QQWB._solution.flash) {
		//TODO: need implement
	}

    return promise;
});

