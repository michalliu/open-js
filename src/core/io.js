/**
 * Tencent weibo javascript library
 *
 * Input and output,AJAX,JSONP
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module io
 * @requires base
 *           core.init
 *           core.log
 *           util.bigtable
 *           util.time
 * @includes common.XML
 */
(function () {

	var _ = QQWB,

	    _b = _.bigtable,

		_l = _.log,

		_t = _.time,

	    iotimeout = _b.get("io", "timeout"),

		ioscript,

		ioajax,

		ioas3,
		
		ioas3tktcounter = 0,
		
		apiAjax,

		apiResponder,

		ajaxResponder;

	ioscript = function (cfg) {

        var script;

		return {

			send: function (complete) {

				var start = _t.now(),

                    head = document.head || document.getElementsByTagName("head")[0] || document.documentElement,

			        timer = setTimeout(function () {

			            _l.error("load script " + cfg.url + " timeout");

			            // @see ITEF Standard http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
			            complete(599, "timeout",  _t.now() - start);

						complete = null; // avoid execute again

			        }, iotimeout);

                script = document.createElement("script");

                script.async = "async";

                if (cfg.charset) {

                    script.charset = cfg.charset;

                }

                script.src = cfg.url;

                script.onload = script.onreadystatechange = function (e, isAbort) {

					// finished anyway
                    if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {

						// done timer
						var t;

				        clearTimeout(timer);

						// clean up things
                        script.onload = script.onreadystatechange = null;

                        if (head && script.parentNode) {

                            head.removeChild(script);

                        }

                        script = null;

						// has callback
						if (complete) {

							t = _t.now() - start;

							if (isAbort) {

                                complete(-1, "aborted", t);

							} else {

                                complete(200, "success", t);

							}

						    complete = null;

						}
                    }
                };

                // ie 678 and opera not support script onerror(not tested)
                script.onerror = function (e) { 

				    clearTimeout(timer);

                    complete && complete(404, e, _t.now() - start);

				    complete = null;
                };

                head.insertBefore(script, head.firstChild);

			},

			abort: function () {

               if (script) {

                   script.onload(0,1);

               }

			}
		};
	}; // ioscript

	ioajax = function (cfg) {

	    var xhrcallback;

		return {

			send: function (complete) {

				var start = _t.now(),

	                xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new window.ActiveXObject("Microsoft.XMLHTTP"),

				    timer = setTimeout(function () {

                         _l.error("ajax timeout, url " + cfg.url);

                         //@see ITEF Standard http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
                         complete(599,"timeout",  _t.now() - start);

						 complete = null;

                     }, iotimeout);
                
                if (!cfg.async) {

                    cfg.async = "async";

                }

                if (cfg.username) {

                    xhr.open(cfg.type, cfg.url, cfg.async, cfg.username, cfg.password);

                } else {

                    xhr.open(cfg.type, cfg.url, cfg.async);

                }
                
                try {

                    if (cfg.type.toUpperCase() == "POST") {

                        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

                    }

                    xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");

                    xhr.setRequestHeader("X-Requested-From","openjs" + _.version);

				} catch (ex) {

					_l.warning("set header error " + ex);

			   	}
                
                xhr.send(cfg.data || null);
                
				// xhr callback
                xhrcallback = function (x, isAbort) {

                    var status,

                 	    statusText,

                 	    responseHeaders,

                 	    responses,

                        response,

						xml;
                
                    try {

                        if (xhrcallback && (isAbort || xhr.readyState === 4)) {
                 		   
                 		   xhrcallback = null;
                
						   // abort ajax request
                 		   if (isAbort) {

							   // can abort
                 			   if (xhr.readyState !== 4) {

                                   clearTimeout(timer);

                 				   xhr.abort();

								   complete && complete(-1, "aborted", _t.now() - start);

								   complete = null;

							   } else {

								   _l.debug("abort ajax failed, already finish");

							   }

                 		    } else {

                                clearTimeout(timer);

                 				status = xhr.status;

                 				responseHeaders = xhr.getAllResponseHeaders() || "";

								// a collection
                 				responses = {};

                 				xml = xhr.responseXML;
                
                 				if (xml && xml.documentElement) {

                 				    responses.xml = xml;

                 				}
                
                 				responses.text = xhr.responseText;
                
                 				try {

                 				    statusText = xhr.statusText;

                 				} catch (webkitException) {

                 					statusText = "";

                 				}
                
                 				if (status === 1223) {

                 				    status = 204;

                 				}
                
                                 if (cfg.dataType.toLowerCase() == "json") { /// parse to json object

                 					response = _.JSON.fromString(responses.text);

                                 } else if (cfg.dataType.toLowerCase() == "xml") { // parse to xml object

                                     response = responses.xml;

                                 } else {

                                     response = responses.text;

                                 }
                
                 	    	}
                
                 		   //if (response) { // in case of server returns empty body sometimes
						   
                 	           complete(status, statusText, _t.now() - start, response, responses.text, responseHeaders, cfg.dataType);

							   complete = null;

                 		   //}
                 	   }

                    } catch (ex /*firefoxOrInvalidJSONFormatParserException*/) {

                       clearTimeout(timer);

                 	   _l.error("caught exception " + [ex.type, ex.message].join(" ") + " in ioajax");

                 	   complete(-2, "exception " + ex, _t.now() - start);

					   complete = null;

                    }

                };
                
				// register xhr handler
                if (!cfg.async || xhr.readyState === 4) {

                    xhrcallback();

                } else {

                    xhr.onreadystatechange = xhrcallback;

                }

			},

			abort: function () {

			  if (xhrcallback) {

			      xhrcallback(0, 1);

			  }

			}
		};

	}; // ioajax

	ioas3 = function (cfg) {

	    var callback;

		return {

		   send: function (complete) {

               var start = _t.now(),
			       
			       proxy = _b.get("solution", "flashmovie"),

				   ticket = "as3callbacktkt" + (++ioas3tktcounter),

                   timer = setTimeout(function () {

                         _l.error("flash as3 timeout, url " + cfg.url);

                         //@see ITEF Standard http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
                         complete(599,"timeout",  _t.now() - start);

						 complete = null;

                     }, iotimeout);

               // the call is allowed call once
               callback = function (_, isAbort) {

                   var status,

                	   statusText,

                	   responseHeaders,

                	   responses,

                       response,

                	   xml;
               
                    try{
                    
                        if (callback) {
                    
                            callback = null; // to avoid memory leak in IE
                    
                            clearTimeout(timer);

                            if (isAbort) {

                                complete && complete(-1, "aborted", _t.now() - start);
                                
                                complete = null;

                            } else {

                     		   status = this["httpStatus"];

                         	   statusText = this["httpStatus"] == 200 ? "ok" : "";

                         	   responseHeaders = ""; //as3 don't support that this should be filled at future

                         	   responses = {}; // internal object

                         	   responses.text = this["httpResponseText"];
                    
                         	   if (cfg.dataType.toLowerCase() == "json") { // parse to json object

                         		   response = QQWB.JSON.fromString(responses.text);

                                } else if (cfg.dataType.toLowerCase() == "xml"){ // parse to xml object

                         		   response = QQWB.XML.fromString(responses.text);

                                } else {

                         		   response = responses.text;
                                }
                            }
                    
                     	   //if (response) { // when server returns empty body sometimes, response will never called

                         	complete(status, statusText, _t.now() - start, response, responses.text, responseHeaders, cfg.dataType);

							complete = null;

                     	   //}
                        }

                     } catch (ex /*firefoxOrInvalidJSONFormatParserException*/) {

                        clearTimeout(timer);

                        _l.error("caught exception " + [ex.type, ex.message].join(" ") + " in ioas3");

                        complete(-2, "exception " + ex, _t.now() - start);

				        complete = null;

                     }

               }; // end callback
               
			   _b.put("io", ticket, callback);

               if (proxy && proxy.httpRequest) {
               
                   proxy.httpRequest(cfg.url, cfg.data, cfg.type, ticket);
               
               } else {
               
                   _l.critical("flash transportation object error");
               
               }

		   }

		  ,abort: function () {

			  if (callback) {

			      callback(0,1);

			  }
		   }
		};
	}; // ioas3

	
	window.onFlashRequestComplete_8df046 = function (eventData) {

		var cb,

		    srcEvt;

		if (!eventData.ticket) {

			_l.error("ticket doesn't exists in response");

			return;

		}

		cb = _b.get("io", eventData.ticket);

		srcEvt = eventData.srcEvent;

        if (!cb.readyState) {

            cb.readyState = 0;

        }
        
        if (/httpStatus/i.test(srcEvt.type)) { // this is a http status code response, cache it

            cb["httpStatus"] = srcEvt.status

            cb.readyState++;

        } else if (/error/i.test(srcEvt.type)) { // possible io_Error or security error

            cb["httpError"] = srcEvt.type

            cb.readyState++;

        } else if (/complete/i.test(srcEvt.type)) {

            cb["httpResponseText"] = srcEvt.target.data

            cb.readyState++;
        }
        
        if (cb.readyState == 2) {

            cb.call(cb);

            _b.del("io", eventData.ticket);
        }
        
	}; // onFlashRequestComplete_8df046

	apiResponder = function (deferred) {

	    return function (status ,statusText ,elapsedtime ,parsedResponse ,responseText ,responseHeaders ,dataType) {

	        var retcode,errorcode;

            if (status !== 200) { // http error

	            // error code over than 2000000 represent physicall error
	      	    status = 2000000 + Math.abs((status ? status : 0));

                deferred.reject(status, statusText, elapsedtime, "");

	        } else if ( typeof (retcode = QQWB.weibo.util.parseRetCode(responseText)) == "number" && 0 !== retcode ) { // api error

	            errorcode = QQWB.weibo.util.parseErrorCode(responseText); 

	            // error code over than 1000000 and less than 2000000 represent logic error
	      	    status = 1000000 + retcode * 1000 + 500 + (errorcode ? errorcode : 0);

	      	    deferred.reject(status,  QQWB.weibo.util.getErrorMessage(responseText), elapsedtime, responseText);

            } else {

	      	    deferred.resolve(status, statusText, elapsedtime, parsedResponse, responseHeaders, dataType);

            }

	    };

    }; // apiResponder

	ajaxResponder = function (deferred) {

	    return function (status ,statusText ,elapsedtime ,parsedResponse ,responseText ,responseHeaders ,dataType) {

            if (status !== 200) {

                deferred.reject(status, statusText, elapsedtime, "");

            } else {

                deferred.resolve(parsedResponse, elapsedtime, responseText);

            }

	    };

   }; // ajaxResponder

QQWB.extend("io", {
   /**
	* Emulate AJAX request via flash
	*
	* @access public
	* @param opts {Object} url configuration object
	* @return {Object} promise object
	*/
  flashAjax: function (opts) {

       var deferred = QQWB.deferred.deferred(),

           default_opts = {

               type: "get"

              ,dataType: "json"

           };

       QQWB.extend(default_opts, opts, true);

       ioas3(default_opts).send(apiResponder(deferred));

	   return deferred.promise();
   }
	/**
	 * Ajax request sender
	 * 
	 * @access public
	 * @param opts {Object} ajax settings
	 * @return {Object} deferred object
	 */
   ,ajax: function (opts) {

       var deferred = QQWB.deferred.deferred(),

           default_opts = {

               type: "get"

              ,dataType: "json"

           };

        QQWB.extend(default_opts, opts, true);

        ioajax(default_opts).send(apiResponder(deferred));

		return deferred.promise();
    }

	/**
	 * Ajax request sender
	 *
	 * Note:
	 * 
	 * same as ajax, the only difference is when ajax success, 
	 * it only pass one response object as argument, this is the
	 * function to expose to our root namespace
	 * 
	 * @access public
	 * @param opts {Object} ajax settings
	 * @return {Object} deferred object
	 */
   ,ajax2: function (opts) {

       var deferred = QQWB.deferred.deferred(),

           default_opts = {

               type: "get"

              ,dataType: "json"

           };

        QQWB.extend(default_opts, opts, true);

        ioajax(default_opts).send(ajaxResponder(deferred));

		return deferred.promise();
    }

    /**
     * Dynamiclly load script
     *
     * @access public
     * @param src {String} script src
     * @param optCharset {String} script charset
     * @return {Object} promise
     */
   ,script: function (src, optCharset) {

       var optCharset = optCharset || "utf-8",

           deferred = QQWB.deferred.deferred();

       ioscript({

           charset: optCharset

          ,url: src

       }).send(function (status, statusText, elapsedtime) {

           if (status !== 200) {

               deferred.reject(status, statusText, elapsedtime);

           } else {

               deferred.resolve(status, statusText, elapsedtime);

           }

       });

       return deferred.promise();
    }
    /**
     * JSONP request
     *
     * @access public
     * @param opts {Object} jsonp config
     * @return {Object} promise
     */
    ,jsonp: function (opts) {

        var deferred = QQWB.deferred.deferred(),

            callbackName = "jsonp_" + QQWB.uid(5),

            _oldcallback = window.callbackName,

			timeCost,

            default_opts = {

                dataType: "text"

               ,charset: "utf-8"

               ,url: ""

            };

        QQWB.extend(default_opts, opts, true);

        if (default_opts.data) {

            default_opts.url += ("?" + default_opts.data +  "&callback=" + callbackName);

        } 

        window[callbackName] = function (data) {

            var response = data;

			try {

                if (default_opts.dataType.toLowerCase() === "json") {

                    response = QQWB.JSON.fromString(data);

                } else if (default_opts.dataType.toLowerCase() === "xml") {

                    response = QQWB.XML.fromString(data);

                }

			} catch (ex) {

                _l.error("caught exception " + [ex.type, ex.message].join(" ") + " in ioajax");

                deferred.reject(-2, "exception " + ex, timeCost);

			}

            deferred.resolve(response, timeCost);

            window[callbackName] = _oldcallback; 
            
        };

        ioscript(default_opts).send(function (status, statusText, elapsedtime) {

            if (status !== 200) {

                deferred.reject(status, statusText, elapsedtime);

            }

			timeCost = elapsedtime;

        });

       return deferred.promise();

    }
});

QQWB.ajax = QQWB.io.ajax2;

QQWB.jsonp = QQWB.io.jsonp;

QQWB.script = QQWB.io.script;

}());

