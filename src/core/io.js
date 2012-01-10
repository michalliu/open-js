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
 *           weibo.util
 *           deferred
 *           common.XML
 *           common.JSON
 *           time
 */

QQWB.extend("io", {
	// global IO timeout (30 seconds)
	_globalIOTimeout: 30 * 1000
    /**
     * The script IO mechanism
     *
     * @access private
     * @param cfg {Object} the configration for script io
     * @return {Object} to send/abort the request
     */
   ,_IOScript: function (cfg) {
        var 
            script,
			scriptLoadTimeout,
            head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
        return {
            send: function (complete) {
				var started = QQWB.time.now();
                script = document.createElement("script");
                script.async = "async";

                if (cfg.charset) {
                    script.charset = cfg.charset;
                }

                script.src = cfg.url;

			    scriptLoadTimeout = setTimeout(function () {
			  	    QQWB.log.warning("script loading timeout");
				    // ITEF Standard http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
				    complete(599,"network connect timeout",  QQWB.time.now() - started);
			    }, QQWB.io._globalIOTimeout);

                script.onload = script.onreadystatechange = function (e,isAbort) {

                    if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {

				        clearTimeout(scriptLoadTimeout);

                        script.onload = script.onreadystatechange = null;

                        if (head && script.parentNode) {
                            head.removeChild(script);
                        }

                        script = null;

                        !isAbort && complete && complete.apply(QQWB,[200,"success",QQWB.time.now() - started]);
                        isAbort && complete && complete.apply(QQWB,[-1,"aborted",QQWB.time.now() - started]);
                    }
                };

                script.onerror = function (e) { // ie 6/7/8/opera not supported(not tested)
				    clearTimeout(scriptLoadTimeout);
                    complete && complete.apply(QQWB,[404,e,QQWB.time.now() - started]);
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
	       ajaxTimeout,
	       cfg = cfg || {},
	       xhr = window.XMLHttpRequest ? 
	             new window.XMLHttpRequest() :
	             new window.ActiveXObject("Microsoft.XMLHTTP");

       if (!cfg.async) {
           cfg.async = "async";
       }

	   return {
		   send: function (complete) {
			   var started = QQWB.time.now();

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
				   xhr.setRequestHeader("X-Requested-From","TencentWeiboJavascriptSDK");
			   } catch (ex) {}

			   xhr.send(cfg.data || null);

			   ajaxTimeout = setTimeout(function () {
				   QQWB.log.warning("request timeout");
				   // ITEF Standard http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
				   complete(599,"network connect timeout",  QQWB.time.now() - started);
			   }, QQWB.io._globalIOTimeout);

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
                                if (cfg.dataType.toLowerCase() == "json") { /// parse to json object
									response = QQWB.JSON.fromString(responses.text);
                                } else if (cfg.dataType.toLowerCase() == "xml") { // parse to xml object
                                    response = responses.xml;
                                } else { // as normal text
                                    response = responses.text;
                                }

					    	}

						   //if (response) { // when server returns empty body sometimes, response will never called
				               clearTimeout(ajaxTimeout);
					           complete(status, statusText, QQWB.time.now() - started, response, responses.text, responseHeaders, cfg.dataType); // take cfg.dataType back
						   //}
					   } // end readyState 4
			       } catch (firefoxException) {
					   status = -2;
					   statusText = (firefoxException && firefoxException.message) ? firefoxException.message : firefoxException;
					   QQWB.log.warning("caught " + statusText + " exception QQWB.io._IOAjax");
					   if (!isAbort) {
				           clearTimeout(ajaxTimeout);
						   //complete(xhr.status, xhr.statusText, QQWB.time.now() - started);
					       complete(status, statusText, QQWB.time.now() - started);
					   }
			       } // end try catch
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
	       flashTimeout,
	       readyState,
	       cfg = cfg || {};
	   
	   return {
		   send: function (complete) {
			   var started = QQWB.time.now();
			   readyState = 1;

			   flashTimeout = setTimeout(function () {
				   QQWB.log.warning("request timeout");
				   complete(599,"network connect timeout",  QQWB.time.now() - started);
			   }, QQWB.io._globalIOTimeout);

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

				   clearTimeout(flashTimeout);

				   try{

				       if (callback && (isAbort || readyState == 4)) {

				           callback = null;

				           if (isAbort) {
				        	   complete(-1, "request has aborted", QQWB.time.now() - started);
				           } else {
				        	   var success = /complete/i.test(_.type);
				        	   status = success ? 200 : 204;
				        	   statusText = success ? "ok" : _.type;
				        	   responseHeaders = ""; //FIXME: fill responseHeaders with datas
				        	   responses = {}; // internal object
				        	   responses.text = _.target.data;

				        	   if (cfg.dataType.toLowerCase() == "json") { // parse to json object
				        		   response = QQWB.JSON.fromString(responses.text);
                               } else if (cfg.dataType.toLowerCase() == "xml"){ // parse to xml object
				        		   response = QQWB.XML.fromString(responses.text);
                               } else {
				        		   response = responses.text;
                               }
				           }

						   //if (response) { // when server returns empty body sometimes, response will never called
				        	   complete(status, statusText, QQWB.time.now() - started, response, responses.text, responseHeaders, cfg.dataType);
						   //}
					   }
					} catch (ex) {
					   status = -2;
					   statusText = (ex && ex.message) ? ex.message : ex;
					   QQWB.log.warning("caught " + statusText + " exception QQWB.io._IOFlash");
					   if (!isAbort) {
					       complete(status, statusText, QQWB.time.now() - started);
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
			   
			   if (cfg.flashObj && cfg.flashObj.httpRequest) {
				   try {
			           cfg.flashObj.httpRequest(cfg.url,cfg.data,cfg.type);
				   } catch (pluginError) {
					   var status = -2,
					       statusText = (pluginError && pluginError.message) ? pluginError.message : pluginError;
					   QQWB.log.warning("caught " + statusText + " exception QQWB.io._IOFlash");
					   complete(status, statusText, QQWB.time.now() - started);
				   }
			   } else {
			       QQWB.log.critical("flash transportation object error");
			   }
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
   ,_apiAjax: function (api, apiParams, dataType, type, platform) {
       // build ajax acceptable opt object from arguments
       var opts = {
               type: type.toUpperCase()
              ,url: QQWB.getPlatform(platform).domain.api + api
              ,data: QQWB.queryString.encode(apiParams)
              ,dataType: dataType
           };
       if (opts.type == "GET") {
           opts.url += opts.data ? "?" + opts.data : "";
           delete opts.data;
       }
       return QQWB.io.ajax(opts, platform);
    }
	/**
	 * Helper method to make api ajax call via flash
	 *
	 */
  ,_apiFlashAjax: function (api, apiParams, dataType, type, platform, flashObj) {
       var opts = {
               type: type.toUpperCase()
              ,url: QQWB.getPlatform(platform).domain.api + api
              ,data: QQWB.queryString.encode(apiParams)
              ,dataType: dataType
			  ,flashObj: flashObj
           };
       if (opts.type == "GET") {
           opts.url += opts.data ? "?" + opts.data : "";
           delete opts.data;
       }
       return QQWB.io.flashAjax(opts, platform);
   }
   /**
	* SendResponse regarding api call
	*/
  ,_apiResponder: function (deferred, platform) {
	  return function (status ,statusText ,elapsedtime ,parsedResponse ,responseText ,responseHeaders ,dataType) {
		  var retcode,errorcode;
          if (status !== 200) { // http error
		      // error code over than 2000000 represent physicall error
		      status = 2000000 + Math.abs((status ? status : 0));
              deferred.reject(status, statusText, elapsedtime, "");
		  } else {
			  if (platform === QQWB.platforms.WEIBO
			      && typeof (retcode = QQWB.weibo.util.parseRetCode(responseText)) == "number"
				  && 0 !== retcode) {
		              errorcode = QQWB.weibo.util.parseErrorCode(responseText); 
		              // error code over than 1000000 and less than 2000000 represent logic error
		              status = 1000000 + retcode * 1000 + 500 + (errorcode ? errorcode : 0);
		              deferred.reject(status,  QQWB.weibo.util.getErrorMessage(retcode,errorcode), elapsedtime, responseText);
			  }
			  //FIXME: parse logic error for other platform
		      deferred.resolve(status, statusText, elapsedtime, parsedResponse, responseHeaders, dataType);
		  }
	  };
   }
   /**
	* SendResponse regarding ajax call
	*/
  ,_ajaxResponder: function (deferred) {
	  return function (status ,statusText ,elapsedtime ,parsedResponse ,responseText ,responseHeaders ,dataType) {
          if (status !== 200) {
              deferred.reject(status, statusText, elapsedtime, "");
          } else {
              deferred.resolve(parsedResponse, elapsedtime, responseText);
          }
	  };
   }
   /**
	* Emulate AJAX request via flash
	*
	* @access public
	* @param opts {Object} url configuration object
	* @return {Object} promise object
	*/
  ,flashAjax: function (opts, platform) {
       var 
           deferred = QQWB.deferred.deferred(),
           default_opts = {
               type: "get"
              ,dataType: "json"
           };

       QQWB.extend(default_opts, opts, true);
       QQWB.io._IOFlash(default_opts).send(QQWB.io._apiResponder(deferred, platform));
	   return deferred.promise();
   }
	/**
	 * Ajax request sender
	 * 
	 * @access public
	 * @param opts {Object} ajax settings
	 * @return {Object} deferred object
	 */
   ,ajax: function (opts, platform) {

       var 
           deferred = QQWB.deferred.deferred(),
           default_opts = {
               type: "get"
              ,dataType: "json"
           };

        QQWB.extend(default_opts, opts, true);

        QQWB.io._IOAjax(default_opts).send(QQWB.io._apiResponder(deferred, platform));
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

       var 
           deferred = QQWB.deferred.deferred(),
           default_opts = {
               type: "get"
              ,dataType: "json"
           };

        QQWB.extend(default_opts, opts, true);
        QQWB.io._IOAjax(default_opts).send(QQWB._ajaxResponder(deferred));
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
        var 
            deferred = QQWB.deferred.deferred(),
            callbackQueryName = "callback", // callback name in query string
            callbackNamePrefix = "jsonp_", // jsonp callback function name prefix
            callbackName = callbackNamePrefix + QQWB.uid(), //random jsonp callback name
            _oldcallback = window.callbackName, // keep a reference to the variable we will overwrite(very little chance)
			timeCost,
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
            deferred.resolve(response, timeCost);

            window[callbackName] = _oldcallback; // restore back to original value
            
            //if (typeof window[callbackName] == "undefined") { // original value is undefined
                //delete window[callbackName]; // delete it
            //}
        };

        QQWB.io._IOScript(default_opts).send(function (status, statusText, elapsedtime) {
            if (status !== 200) {
                deferred.reject(status, statusText, elapsedtime);
            }
			timeCost = elapsedtime;
        });


       return deferred.promise();
    }
});

// expose to global namespace
QQWB._alias("ajax",QQWB.io.ajax2);
QQWB._alias("jsonp",QQWB.io.jsonp);
QQWB._alias("script",QQWB.io.script);
