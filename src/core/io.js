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

       if (cfg.dataType) {
           cfg.dataType = cfg.dataType.toLowerCase();
       }

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
                                if (cfg.dataType == "json") {
                                    var responseText = responses.text;
                                    if (typeof responseText !== "string" || !responseText) {
                                        response = {};
                                    } else {
                                        // Make sure leading/trailing whitespace is removed (IE can't handle it)
                                        response = responseText.replace(/^\s+/,"").replace(/\s+$/,"");

                                        if ( window.JSON && window.JSON.parse ) {
                                            response = window.JSON.parse( response );
                                        } else {
                                            // Make sure the incoming data is actual JSON
                                            // Logic borrowed from http://json.org/json2.js
                                            if ( /^[\],:{}\s]*$/.test( response.replace( /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@" )
                                                .replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]" )
                                                .replace( /(?:^|:|,)(?:\s*\[)+/g, "")) ) {

                                                response = (new Function( "return " + data ))();
                                            } else {
                                                throw new SyntaxError ("Invalid JSON: " + response);
                                            }
                                        }
                                    }
                                } else if (cfg.dataType == "xml") { // parse to xml
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
	 * Ajax request sender
	 * 
	 * @access public
	 * @param opts {Object} ajax settings
	 * @return {Object} deferred object
	 */
   ,ajax: function (opts) {

	    var deferred = QQWB.deferred.deferred();

		this._IOAjax(opts).send(function (status, statusText, responses, responseHeaders, dataType) {
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

       this._IOScript({
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
     * @access public
     * @param url {String} jsonp url callback is added automaticlly
     * @return {Object} promise
     */
    ,jsonp: function (url) {
        var 
            deferred = QQWB.deferred.deferred(),
            callbackQueryName = "callback", // callback name in query string
            callbackNamePrefix = "jsonp_", // jsonp callback function name prefix
            callbackName = callbackNamePrefix + QQWB.uid(), //random jsonp callback name
            _oldcallback = window.callbackName; // keep a reference to the variable we will overwrite(very little chance)

        window[callbackName] = function (data) {

            // jsonp successed
            deferred.resolve(data);

            window[callbackName] = _oldcallback; // restore back to original value
            
            if (typeof window[callbackName] == "undefined") { // original value is undefined
                delete window[callbackName]; // delete it
            }
        };

        this._IOScript({
            charset: "utf-8"
           ,url: url + "&" + callbackQueryName + "=" + callbackName
        }).send(function (status, statusText) {
            if (status !== 200) {
                deferred.reject(status, statusText);
            }
        });


       return deferred.promise();
    }
});

