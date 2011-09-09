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
 *           queryString
 *           deferred
 *           ext.XML
 *           ext.JSON
 */

QQWB.extend("io", {
    /**
     * The script IO mechanism
     *
     * @access private
     * @param cfg {Object} the configration for script io
     * @return {Object} to send/abort the request
     */
    _IOScript: function (cfg) {
        var 
            script,
            head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
        return {
            send: function (complete) {
                script = document.createElement("script");
                script.async = "async";

                if (cfg.charset) {
                    script.charset = cfg.charset;
                }

                script.src = cfg.url;

                script.onload = script.onreadystatechange = function (e,isAbort) {

                    if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {

                        script.onload = script.onreadystatechange = null;

                        if (head && script.parentNode) {
                            head.removeChild(script);
                        }

                        script = null;

                        !isAbort && complete && complete.apply(QQWB,[200,"success"]);
                        isAbort && complete && complete.apply(QQWB,[-1,"aborted"]);
                    }
                };

                script.onerror = function (e) { // ie 6/7/8/opera not supported(not tested)
                    complete && complete.apply(QQWB,[404,e]);
                };

                head.insertBefore(script, head.firstChild);
            }

           ,abort: function () {
               if (script) {
                   script.onload(0,1);
               }
            }
        };
    }

    /**
     * The AJAX IO mechanism
     *
     * @access private
     * @param cfg {Object} the configration for ajax io
     * @return {Object} to send/abort the request
     */
   ,_IOAjax: function (cfg) {
	   
	   var callback,
	       cfg = cfg || {},
	       xhr = window.XMLHttpRequest ? 
	             new window.XMLHttpRequest() :
	             new window.ActiveXObject("Microsoft.XMLHTTP");

       if (!cfg.async) {
           cfg.async = "async";
       }

	   return {
		   send: function (complete) {

			   if (cfg.username) {
				   xhr.open(cfg.type, cfg.url, cfg.async, cfg.username, cfg.password);
			   } else {
				   xhr.open(cfg.type, cfg.url, cfg.async);
			   }

			   try {
                   if (cfg.type == "POST") {
                       xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                   }
				   xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
			   } catch (ex) {}

			   xhr.send(cfg.data || null);

			   callback = function (_, isAbort) {
				   var
				       status,
					   statusText,
					   responseHeaders,
					   responses,
                       response,
					   xml;

				   try {
					   // never called and (is aborted or complete)
				       if (callback && (isAbort || xhr.readyState === 4)) {
						   
						   // only call once
						   callback = null;

						   if (isAbort) {
							   if (xhr.readyState !== 4) {
								   xhr.abort();
							   }
						    } else {
								status = xhr.status;
								responseHeaders = xhr.getAllResponseHeaders();
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

                                // parse to JSON
                                if (cfg.dataType.toLowerCase() == "json") {
									response = QQWB.JSON.fromString(responses.text);
                                } else if (cfg.dataType.toLowerCase() == "xml") { // parse to xml
                                    response = responses.xml;
                                } else { // as normal text
                                    response = responses.text;
                                }

					    	}
					   }
			       } catch (firefoxException) {
					   if (!isAbort) {
					       complete(-1, firefoxException);
					   }
			       }

				   if (response) {
					   complete(status, statusText, response, responseHeaders, cfg.dataType); // take cfg.dataType back
				   }
			   };

			   if (!cfg.async || xhr.readyState === 4) {
			       callback();
			   } else {
				   xhr.onreadystatechange = callback;
			   }
		   }
		  ,abort: function () {
			  if (callback) {
			      callback(0, 1);
			  }
		   }
	   };
	   
    }
    /**
     * The Flash IO mechanism
     *
     * @access private
     * @param cfg {Object} the configration for script io
     * @return {Object} to send/abort the request
     */
   ,_IOFlash: function (cfg) {

	   var callback,
	       readyState,
	       cfg = cfg || {};
	   
	   return {
		   send: function (complete) {

			   readyState = 1;
               // the call is allowed call once
			   callback = function (_, isAbort) {
				   var
				       status,
					   statusText,
					   responseHeaders,
					   responses,
                       response,
					   xml,
					   readyState = 4;

				   try{
				       if (callback && (isAbort || readyState == 4)) {

				           callback = null;

				           if (isAbort) {
				        	   complete(-1, "request has aborted");
				           } else {
				        	   var success = /complete/i.test(_.type);
				        	   status = success ? 200 : 204;
				        	   statusText = success ? "ok" : _.type;
				        	   responseHeaders = "";
				        	   responses = {}; // internal object
				        	   responses.text = _.target.data;

				        	   if (cfg.dataType.toLowerCase() == "json") {
				        		   response = QQWB.JSON.fromString(responses.text);
                               } else if (cfg.dataType.toLowerCase() == "xml"){
				        		   response = QQWB.XML.fromString(responses.text);
                               } else {
				        		   response = responses.text;
                               }
				           }

				           // has response
				           if (response) {
				        	   complete(status, statusText, response, responseHeaders);
				           }
					   }
					} catch (ex) {
						if (!isAbort) {
							complete(-1, ex + "");
						}
					}
			   };

			   // register flash message callback
			   // lazy initialize flash message callbacks
			   if (!window.onFlashRequestComplete_8df046) {

				   // this function will be called by flash when httpRequest is done
                   window.onFlashRequestComplete_8df046 = function (event) {
					   // first in first out
					   onFlashRequestComplete_8df046.callbacks.shift()(event);
                   };

				   // our callback queue
                   window.onFlashRequestComplete_8df046.callbacks = [];
		       }

			   // push to queue
               window.onFlashRequestComplete_8df046.callbacks.push(callback);

	           QQWBFlashTransport.httpRequest(cfg.url,cfg.data,cfg.type);

		   }
		  ,abort: function () {
			  if (callback) {
			      callback(0,1);
			  }
		   }
	   };
    }
    /**
     * Helper method to make api ajax call
     *
     */
   ,_apiAjax: function (api, apiParams, dataType, type) {
       // build ajax acceptable opt object from arguments
       var opts = {
               type: type.toUpperCase()
              ,url: QQWB._domain.api + api
              ,data: QQWB.queryString.encode(apiParams)
              ,dataType: dataType
           };
       if (opts.type == "GET") {
           opts.url += opts.data ? "?" + opts.data : "";
           delete opts.data;
       }
       return QQWB.io.ajax(opts);
    }
	/**
	 * Helper method to make api ajax call via flash
	 *
	 */
  ,_apiFlashAjax: function (api, apiParams, dataType, type) {
       var opts = {
               type: type.toUpperCase()
              ,url: QQWB._domain.api + api
              ,data: QQWB.queryString.encode(apiParams)
              ,dataType: dataType
           };
       if (opts.type == "GET") {
           opts.url += opts.data ? "?" + opts.data : "";
           delete opts.data;
       }
       return QQWB.io.flashAjax(opts);
   }
   /**
	* Emulate AJAX request via flash
	*
	* @access public
	* @param opts {Object} url configuration object
	* @return {Object} promise object
	*/
  ,flashAjax: function (opts) {
       var deferred = QQWB.deferred.deferred();

	   if (!opts.type) {
		   opts.type = "get";
	   }

       QQWB.io._IOFlash(opts).send(function (status, statusText, responses, responseHeaders) {
       	if (status !== 200) {
       		deferred.reject(status, statusText);
       	} else {
       		deferred.resolve(status, statusText, responses, responseHeaders);
       	}
       });

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

       var 
           deferred = QQWB.deferred.deferred(),
           default_opts = {
               type: "get"
              ,dataType: "json"
           };

        QQWB.extend(default_opts, opts, true);

		QQWB.io._IOAjax(default_opts).send(function (status, statusText, responses, responseHeaders, dataType) {
			if (status !== 200) {
				deferred.reject(status, statusText);
			} else {
				deferred.resolve(status, statusText, responses, responseHeaders, dataType);
			}
		});

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
       var
           optCharset = optCharset || "utf-8",
           deferred = QQWB.deferred.deferred();

       QQWB.io._IOScript({
           charset: optCharset
          ,url: src
       }).send(function (status, statusText) {
           if (status !== 200) {
               deferred.reject(status, statusText);
           } else {
               deferred.resolve(status, statusText);
           }
       });

       return deferred.promise();
    }
    /**
     * JSONP request
     *
     * TODO: modified to as documention described
     * @access public
     * @param opts {Object} jsonp config
     * @return {Object} promise
     */
    ,jsonp: function (opts) {
        var 
            deferred = QQWB.deferred.deferred(),
            callbackQueryName = "callback", // callback name in query string
            callbackNamePrefix = "jsonp_", // jsonp callback function name prefix
            callbackName = callbackNamePrefix + QQWB.uid(), //random jsonp callback name
            _oldcallback = window.callbackName, // keep a reference to the variable we will overwrite(very little chance)
            default_opts = {
                dataType: "text"
               ,charset: "utf-8"
               ,url: ""
            };

        QQWB.extend(default_opts, opts, true);

        if (default_opts.data) {
            default_opts.url += ("?" + default_opts.data +  "&" + callbackQueryName + "=" + callbackName);
        } 

        window[callbackName] = function (data) {

            var response = data;

            if (default_opts.dataType.toLowerCase() === "json") {
                response = QQWB.JSON.fromString(data);
            } else if (default_opts.dataType.toLowerCase() === "xml") {
                response = QQWB.XML.fromString(data);
            }
            // jsonp successed
            deferred.resolve(response);

            window[callbackName] = _oldcallback; // restore back to original value
            
            if (typeof window[callbackName] == "undefined") { // original value is undefined
                delete window[callbackName]; // delete it
            }
        };

        QQWB.io._IOScript(default_opts).send(function (status, statusText) {
            if (status !== 200) {
                deferred.reject(status, statusText);
            }
        });


       return deferred.promise();
    }
});

// expose to global namespace
QQWB._alias("ajax",QQWB.io.ajax);
QQWB._alias("jsonp",QQWB.io.jsonp);
QQWB._alias("script",QQWB.io.script);
