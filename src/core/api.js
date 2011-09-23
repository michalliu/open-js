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
 * @access public
 * @param api {String} the rest-style api interface
 * @param apiParams {Object} api params
 * @param optDataType {String} the dataType supports either "json","xml","text", case-insensitive, default is "json"
 * @param optType {String} the request method supports either "get","post", case-insensitive, default is "get"
 * @param optSolution {String} use solution by force @see QQWB.solution
 * @return {Object} promise object
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module api
 * @requires base
 *           common.XML
 *           common.Array
 *           common.JSON
 *           apiProvider
 *           deferred
 *           auth.token
 *           auth.auth
 */

QQWB.provide("api", function (api, apiParams, optDataType, optType, optSolution) {

	api = this._apiProvider.compat(api);
	apiParams = apiParams || {};
    optDataType = (optDataType || "json").toLowerCase();
    optType = optType || "GET";

	var 
    	promise,
		solution,
		format = optDataType, // the format string in oauth querystring
		supportedFormats = {json:true,xml:true/*,text:true*/},
    	deferred = QQWB.deferred.deferred();
	
	if (!(format in supportedFormats)) {
		format = "json";
	}

	apiParams["oauth_consumer_key"] = QQWB._appkey;
	apiParams["oauth_token"] = QQWB._token.getAccessToken();
	apiParams["oauth_version"] = "2.0";
	apiParams["format"] = format;


    promise = deferred.promise();

	// force to use specified solution
	if (optSolution && QQWB.Array.inArray([QQWB._solution.HTML5_SOLUTION
                                          ,QQWB._solution.FLASH_SOLUTION
										  ,QQWB._solution.SILVER_LIGHT_SOLUTION]
										  ,optSolution)) {
		QQWB.log.warning("forced to use solution " + optSolution);
		// solution has initialized let that solution handle the request
		if(!QQWB._solution[optSolution]) { // solution not initiallize, initialize it
		    QQWB.log.warning("forced to use solution " + optSolution + ", this solution is not inited, initialzing...");
		    QQWB._solution.initSolution[optSolution];
		}
	    solution = QQWB._solution[optSolution];
	} else {
        // solutions with following priority order
        solution =  (QQWB.browser.feature.postmessage && QQWB._solution[QQWB._solution.HTML5_SOLUTION])
            || (QQWB.browser.feature.flash && QQWB._solution[QQWB._solution.FLASH_SOLUTION])
            || (QQWB.browser.feature.silverlight && QQWB._solution[QQWB._solution.SILVER_LIGHT_SOLUTION]);

	}

	// don't handle that, let server to the job
	// then pass a failed message to the callback
    //
	/*if (false && !QQWB._apiProvider.isProvide(api)) {
		QQWB.log.error("can't call \"" + api +"\", not supported");
		deferred.reject(-1, "api not supported"); // immediately error
		return promise;
	}*/

	// no solution or selected solution failed initialze
	// its not possible to implement to QQWB.api method working
	// very little chance
	if (!solution || solution.readyState === 2) {
		QQWB.log.critical("solution error");
		deferred.reject(-1, "solution error",0/*time cost*/); // immediately error
		return promise;
	}

    //TODO: if api call required solution is flash
    //then cache the function do flash solution init
	//if (!solution.support(api)) {
		// choose other solution
		// return  QQWB.api(api, apiParams, optDataType, optType, other solution);
	//}

	// if api called before the solution is ready, we cached it and waiting the solution ready
	// when solution is ready, regardless success or fail, these cached function will be invoke again immediately
	if (solution.readyState === 0) { //solution not ready
		QQWB.log.warning("solution is not ready, your api call request has been cached, will invoke immediately when solution is ready");
    	solution.promise.done(function () { // when solution is ready
		    QQWB.log.info("invoking cached api call \"QQWB.api( " + [api, apiParams, optDataType, optType].join(",") + " )\"...");

			// emulate the request send it to server
			// when data backs, resolve or reject the deferred object previously saved.
			// then pass the data in accordingly
			QQWB.api(api, apiParams, optDataType, optType)
			    .success(function () {
				    deferred.resolveWith(deferred,QQWB.Array.fromArguments(arguments));
				 })
			    .error(function (){
				    deferred.rejectWith(deferred,QQWB.Array.fromArguments(arguments));
			     }); // keep the arguments
		}).fail(function () { // solution failed, we use the arguments from boot section (boot.js)
		    QQWB.log.error("can't invoking cached api call \"QQWB.api( " + [api, apiParams, optDataType, optType].join(",") + " )\"");
		    deferred.rejectWith(deferred,QQWB.Array.fromArguments(arguments));
		});
		return promise;
	}

	// must be here everything must be ready already from here
	
    // user not logged in, don't bother to try to get data
	if (!QQWB.loginStatus()) {
        QQWB.log.error("failed to make api call, not logged in");
		deferred.reject(-1, "not login", 0); // immediately error
		return promise;
	}

	// record the serial
	if (!QQWB.api.id) {
		QQWB.extend(QQWB.api, {
			id: 0
            // how many api call this page does?
		   ,total: function () {
			   return QQWB.api.id;
		    }
		});
	}

    QQWB.api.id ++;

	// describe what we are to do now
    QQWB.log.info("[" + QQWB.api.id + "] requesting data \"" + QQWB._apiProvider.describe(api) + "\" from server...");

    // html5 solution
    if (solution === QQWB._solution[QQWB._solution.HTML5_SOLUTION]) {
			var serverProxy = document.getElementById(solution.id);
			if (!serverProxy) { // double check to avoid the server frame was removed from dom unexpectly
	            QQWB.log.critical("server proxy not found");
	            deferred.reject(-1,"server proxy not found", 0);
			} else {
                // server proxy's url should be same as QQWB._domain.serverproxy, if not may be we got the wrong element
				if (serverProxy.src !== QQWB._domain.serverproxy) { // double check to avoid the server frame src was modified unexpectly 
	                QQWB.log.critical("server proxy is not valid, src attribute has unexpected value");
	                deferred.reject(-1,"server proxy not valid", 0);
				} else {
					// everything goes well
                 	// lazy create an collection object to maintain the deferred object
                 	// only html5 solution need this
                 	if (!QQWB.api._deferredCollection) {
                 		QQWB.extend(QQWB.api, {
                 		    _deferredCollection: {
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
                 			       this._deferredCollection[this.id] = deferredObj;
                 			       return this.id;
                 			   } else { // we dont accpept other than deferred object
                 	               QQWB.log.warning("collect a non-deferred object is illegal");
                 			   }
                 		    }
                 		});
                 	}

					if (!QQWB.api.messageHandler) {
						// add listeners for the data when data comes back
						QQWB.provide("api.messageHandler", function (e) {
							// we only trust the data back from the API server, ingore others
							// This is important for security reson
							if (QQWB._domain.serverproxy.indexOf(e.origin) !== 0) {
	                            QQWB.log.warning("unexpected message arrived from " + e.origin + " with data " + e.data);
							} else {
								// here is the result comes back

								// data.id represent the caller's id to know which deferred object should handle the data
								// data.data reprent the result return from API server
								var 
							    	data = QQWB.JSON.fromString(e.data),
									id = data.id,
									relateDeferred = QQWB.api.deferredAt(id),
							    	response = data.data;

								if (relateDeferred) {
							        if (response[0] !== 200) {
										relateDeferred.reject.apply(relateDeferred,response);
									} else {
										if (response[5] == "xmltext") {
											response[3] = QQWB.XML.fromString(response[3]);
										}
										//relateDeferred.resolve.apply(relateDeferred,[response[2],response[3]]);
                                        relateDeferred.resolve(response[3], response[2]);
							    	}
									QQWB.api.uncollect(id);
								} else {
	                                QQWB.log.warning("related deferred object not found, it shouldn't happen");
								}
							}
						}); // end provide

                        if (window.addEventListener) {
                            window.addEventListener("message", QQWB.api.messageHandler, false);
                        } else if (window.attachEvent) {
                            window.attachEvent("onmessage", QQWB.api.messageHandler);
                        }
					}
                 
					try {
						// IE8 has problems if not wrapped by setTimeout
						// @see http://ejohn.org/blog/how-javascript-timers-work/
						var collectionID = QQWB.api.collect(deferred);

						// we send async request at the same time
						// and through id we know the result belong
						// to which request
						setTimeout(function () {
                            // send to proxy server
                            // IE only support String type as the message
                            // @see http://msdn.microsoft.com/en-us/library/cc197015(v=vs.85).aspx
                            serverProxy.contentWindow.postMessage(QQWB.JSON.stringify({ 
                            	id: collectionID
                               ,data: [api, apiParams, optDataType, optType]
                            }),QQWB._domain.serverproxy);
						}, 0 );

					} catch (ex) {
	                    QQWB.log.critical("post message to server proxy has failed, " + ex);
	                    deferred.reject(-1,ex,0);
					}
				} // end server proxy src modified check
			} // end server proxy existance check

	} else if (solution === QQWB._solution[QQWB._solution.FLASH_SOLUTION]) {
		// @see io.js onFlashRequestComplete_8df046 for api call sequence management
		QQWB.io._apiFlashAjax(api, apiParams, optDataType, optType).complete(function () {
			var response = QQWB.Array.fromArguments(arguments);
			if (response[0] !== 200) {
				deferred.reject.apply(deferred,response);
			} else {
				//deferred.resolve.apply(deferred,[response[2],response[3]]);
                deferred.resolve(response[3], response[2]);
			}
		});
	}

	// describe that we have done the request
    (function () {
        var serial = QQWB.api.id;
     	promise.complete(function () {
             QQWB.log.info("*[" + serial + "] done");
             serial = null; // defect memory leak in IE
     	});
    }());

    return promise;
});
