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
 *           util.queryString
 *           common.String
 *           common.Object
 * @includes common.XML
 *           common.Array
 *           core.browser
 */
/*jslint laxcomma:true,browser:true*/
/*global QQWB*/
(function () {

    var _ = QQWB,

        _b = _.bigtable,

        _s = _.String,

        _q = _.queryString,

        _l = _.log,

        _o = _.Object,

        _t = _.time,

        iotimeout = _b.get("io", "timeout"),

        ioscript,

        iostyle,

        ioajax,

        ioas3,
        
        ioas3tktcounter = 0,
        
        apiResponder,

        getIoProto,

        compatOpts,

        joinUrlWithData,

        ajaxResponder;

    getIoProto = function () {

        return _.Object.create({

                ajax : _.ajax,

                jsonp: _.jsonp,

                script: _.script,

                loadStyle: _.loadStyle

        });

    };

    compatOpts = function (opts, logName) {

        logName = logName || "unknown";

        if (opts.data) {

            if (_o.isObject(opts.data)) {

                opts.data = _q.encode(opts.data);

            } else if (_s.isString(opts.data)) {

                opts.data = _s.trim(opts.data).replace(/^&+/, '');

            } else {

                _l.warn('[' + logName + '] ignored invalid params data ' + opts.data);

            }

        }

        if (_s.trim(opts.type).toUpperCase() === "GET") {

            opts.url = joinUrlWithData(opts.url, opts.data);

        }

        if (_s.trim(opts.type).toUpperCase() === "GET" && !opts.cache) {

           opts.url = joinUrlWithData(opts.url, "nocache=openjs" + QQWB.uid(5));

       }

       return opts;

    };

    joinUrlWithData = function (url, data) {

        var queryMark = url.lastIndexOf('?'),

            newurl;

        if (!data) return url;

        if (queryMark === -1) {

            newurl = [url, '?', data];

        } else if (queryMark === url.length - 1) {

            newurl = [url, data];
            
        } else {

            newurl = [url, '&', data];

        }

        return newurl.join('');

    };

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

                script.type = 'text/javascript';

                script.async = false;

                if (cfg.charset) {

                    script.charset = cfg.charset;

                }

                script.src = cfg.url;

                script.onload = script.onreadystatechange = function (e, isAbort) {

                    // finished anyway
                    // TODO: script实际上不存在但服务器返回404页面时（有html内容）
                    // script.readyState仍会是complete
                    if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {

                        // done timer
                        var t;

                        clearTimeout(timer);

                        // clean up things
                        script.onload = script.onreadystatechange = null;

                        if (head && script.parentNode) {

                            //head.removeChild(script);

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
                script.onerror = function () {

                    clearTimeout(timer);

                    if (complete) complete(500, "server error", _t.now() - start);

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

    iostyle = function (cfg) {

        var stylesheet;

        return {

            send: function (complete) {

                var start = _t.now(),

                    head = document.head || document.getElementsByTagName("head")[0] || document.documentElement,

                    timer = setTimeout(function () {

                        _l.error("load style " + cfg.url + " timeout");

                        // @see ITEF Standard http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
                        complete(599, "timeout",  _t.now() - start);

                        complete = null; // avoid execute again

                        if (checkStyleTimer) clearTimeout(checkStyleTimer);

                    }, iotimeout), checkStyleTimer, stylesheetfound;

                stylesheet = document.createElement('link');

                stylesheet.rel = 'stylesheet';

                stylesheet.type = 'text/css';

                if (cfg.charset) {

                    stylesheet.charset = cfg.charset;

                }

                stylesheet.href = cfg.url;

                // For Non-IE browser we use timer to check if stylesheet is loaded
                function checkStyleSheet() {

                    function styleSheetMatch(actual, origin) {
                        
                        return actual.lastIndexOf(origin.replace('../','').replace('./','')) !== -1;

                    }

                    QQWB.Array.each(document.styleSheets, function (i, v) {

                        var href = v.href;

                        if (href && styleSheetMatch(href, cfg.url) ) {

                            var t;

                            clearTimeout(timer);

                            checkStyleTimer = null;

                            if (head && stylesheet.parentNode) {

                                 //head.removeChild(stylesheet);

                            }

                            if (complete) {

                                t = _t.now() - start;

                                //TODO: 使用cssRules是否存在判断样式表是否加载成功有问题
                                if (false && !v.cssRules) {
    
                                    complete(404, "no css rules", t);
    
                                } else {
    
                                    complete(200, "success", t);
    
                                }
    
                                complete = null;

                            }

                            stylesheetfound = true;

                            stylesheet = null;

                            return false;

                        }

                    });

                    if (stylesheetfound) return;

                    checkStyleTimer = setTimeout(checkStyleSheet, 50);

                }

                if (!QQWB.browser.msie) {

                    checkStyleSheet();

                }

                // IE and abort only
                stylesheet.onreadystatechange = function (e, isAbort) {

                    if (isAbort || /loaded|complete/.test(stylesheet.readyState)) {

                        var t;

                        clearTimeout(timer);

                        if (checkStyleTimer) clearTimeout(checkStyleTimer) ;

                        stylesheet.onreadystatechange = null;

                        if (head && stylesheet.parentNode) {

                            //head.removeChild(stylesheet);

                        }

                        stylesheet = null;

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

                head.insertBefore(stylesheet, head.firstChild);

            },
            abort: function () {

                if (stylesheet) {

                    stylesheet.onreadystatechange(0,1);

                }

            }
        };
    };// iostyle
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

                    if (cfg.type.toUpperCase() === "POST") {

                        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

                    }

                    xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");

                    xhr.setRequestHeader("X-Requested-From","openjs" + _.version);

                } catch (ex) {

                    _l.warning("set header error " + ex);

                   }
                
                // http://www.w3.org/TR/XMLHttpRequest/#the-send-method
                xhr.send(cfg.data || null);
                
                // xhr callback
                xhrcallback = function (x, isAbort) {

                    var status,

                         statusText,

                         responseHeaders,

                         responses,

                        response,

                        xml;
                
                        if (xhrcallback && (isAbort || xhr.readyState === 4)) {
                            
                            xhrcallback = null;
                
                           // abort ajax request
                            if (isAbort) {

                               // can abort
                                if (xhr.readyState !== 4) {

                                   clearTimeout(timer);

                                    xhr.abort();

                                   if (complete) complete(-1, "aborted", _t.now() - start);

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
                
                                 try {

                                     if (cfg.dataType.toLowerCase() === "json") { /// parse to json object

                                         response = _.JSON.fromString(responses.text);

                                     } else if (cfg.dataType.toLowerCase() === "xml") { // parse to xml object

                                         response = responses.xml || _.XML.fromString(responses.text);

                                     } else {

                                         response = responses.text;

                                     }

                                 } catch (ex) {

                                    clearTimeout(timer);

                                    _l.error("caught exception " + [ex.type, ex.message].join(" ") + " in ioajax");

                                    complete(-2, "exception " + ex, _t.now() - start);

                                    return;
                                 }
                    
                             }
                
                            //if (response) { // in case of server returns empty body sometimes
                           
                              complete(status, statusText, _t.now() - start, response, responses.text, responseHeaders, cfg.dataType);

                              complete = null;

                            //}
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

                       response;

                        if (callback) {
                    
                            callback = null; // to avoid memory leak in IE
                    
                            clearTimeout(timer);

                            if (isAbort) {

                                if (complete) complete(-1, "aborted", _t.now() - start);
                                
                                complete = null;

                            } else {

                                status = this.httpStatus;

                                statusText = this.httpStatus === 200 ? "ok" : "";

                                responseHeaders = ""; //as3 don't support that this should be filled at future

                                responses = {}; // internal object

                                responses.text = this.httpResponseText;
                    
                                try {

                                    if (cfg.dataType.toLowerCase() === "json") { // parse to json object

                                        response = QQWB.JSON.fromString(responses.text);

                                    } else if (cfg.dataType.toLowerCase() === "xml"){ // parse to xml object

                                        response = QQWB.XML.fromString(responses.text);

                                    } else {

                                        response = responses.text;
                                    }

                                } catch (ex) {

                                   clearTimeout(timer);

                                   _l.error("caught exception " + [ex.type, ex.message].join(" ") + " in ioas3");

                                   complete(-2, "exception " + ex, _t.now() - start);

                                   return;

                                }

                            }
                    
                            //if (response) { // when server returns empty body sometimes, response will never called

                                complete(status, statusText, _t.now() - start, response, responses.text, responseHeaders, cfg.dataType);

                                complete = null;

                            //}
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

            cb.httpStatus = srcEvt.status;

            cb.readyState++;

        } else if (/error/i.test(srcEvt.type)) { // possible io_Error or security error

            cb.httpError = srcEvt.type;

            cb.readyState++;

        } else if (/complete/i.test(srcEvt.type)) {

            cb.httpResponseText = srcEvt.target.data;

            cb.readyState++;
        }
        
        if (cb.readyState === 2) {

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

            } else if ( typeof (retcode = QQWB.weibo.util.parseRetCode(responseText)) === "number" && 0 !== retcode ) { // api error

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

        return function (status ,statusText ,elapsedtime ,parsedResponse ,responseText/*,responseHeaders,dataType*/) {

            if (status !== 200) {

                deferred.reject(status, statusText, elapsedtime, responseText);

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

   ,ajaxWith: function (opts, responder, proto) {

       var _ = QQWB,

           _s = _.String,

           deferred = QQWB.deferred.deferred(),

           default_opts = {

               type: "get"

              ,dataType: "json"

              ,cache: false

           };

        QQWB.extend(default_opts, opts, true);

        if (!default_opts.url) {

            deferred.reject(-2, "invalid url", 0);

            return deferred.promise(proto);

        }

        default_opts.type = _s.trim(default_opts.type);

        default_opts = compatOpts(default_opts, "script");

        default_opts.dataType = _s.trim(default_opts.dataType);

        if (default_opts.type.toUpperCase() === "GET" && default_opts.data) {

            default_opts.url = joinUrlWithData(default_opts.url, default_opts.data);

            if (!default_opts.cache) {

                default_opts.url = joinUrlWithData(default_opts.url, "nocache=openjs" + QQWB.uid(5));

            }
        }

        ioajax(default_opts).send(responder(deferred));

        return deferred.promise(proto);
    }
    /**
     * Ajax request sender
     *
     * @access public
     * @param opts {Object} ajax settings
     * @return {Object} deferred object
     */
   ,apiAjax: function (opts) {

       return QQWB.io.ajaxWith(opts,apiResponder);

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
   ,ajax: function (opts) {

       return QQWB.io.ajaxWith(opts, ajaxResponder, getIoProto());

    }

    /**
     * Dynamiclly load script
     *
     * @access public
     * @param opts {Map} script config
     * @return {Object} promise
     */
   ,script: function (opts) {

       var _ = QQWB,

           proto = getIoProto(),

           deferred = _.deferred.deferred(),

           default_opts = {

              charset: "utf-8"

              ,cache: true

              ,type: "get"

           };

       QQWB.extend(default_opts, opts, true);

       if (!default_opts.url) {

           deferred.reject(-2, "invalid url", 0);

           return deferred.promise(proto);

       }

       default_opts = compatOpts(default_opts, "script");

       ioscript(default_opts).send(function (status, statusText, elapsedtime) {

           if (status !== 200) {

               deferred.reject(status, statusText, elapsedtime);

           } else {

               deferred.resolve(status, statusText, elapsedtime);

           }

       });

       return deferred.promise(proto);

    }
    /**
     *
     * Dynamicly load style sheet
     *
     */
    ,loadStyle: function (opts) {

       var _ = QQWB,

           proto = getIoProto(),

           deferred = _.deferred.deferred(),

           default_opts = {

                cache: true,

                type: "get"

           };

       QQWB.extend(default_opts, opts, true);

       if (!default_opts.url) {

           deferred.reject(-2, "invalid url", 0);

           return deferred.promise(proto);

       }

       default_opts = compatOpts(default_opts, "loadStyle");

       iostyle(default_opts).send(function (status, statusText, elapsedtime) {

           if (status !== 200) {

               deferred.reject(status, statusText, elapsedtime);

           } else {

               deferred.resolve(status, statusText, elapsedtime);

           }

       });

       return deferred.promise(proto);

    }
    /**
     * JSONP request
     *
     * @access public
     * @param opts {Object} jsonp config
     * @return {Object} promise
     */
    ,jsonp: function (opts) {

        var _ = QQWB,

            _s = _.String,

            proto = getIoProto(),

            deferred = QQWB.deferred.deferred(),

            callbackName = "jsonp_" + QQWB.uid(5),

            _oldcallback = window.callbackName,

            timeCost,

            default_opts = {

                dataType: "json"

               ,charset: "utf-8"

               ,cache: false

               ,type: "get"

            };

        QQWB.extend(default_opts, opts, true);

        if (!default_opts.url) {

            deferred.reject(-2, "invalid url", 0);

            return deferred.promise(proto);

        }

        default_opts = compatOpts(default_opts, "jsonp");

        default_opts.url = joinUrlWithData(default_opts.url, "callback=" + callbackName);

        window[callbackName] = function (data) {

            var response = data;

            if (_s.isString(data)) {

                try {

                    if (default_opts.dataType.toLowerCase() === "json") {

                        response = QQWB.JSON.fromString(data);

                    } else if (default_opts.dataType.toLowerCase() === "xml") {

                        response = QQWB.XML.fromString(data);

                    }

                } catch (ex) {

                    _l.error("caught exception " + [ex.type, ex.message].join(" ") + " in jsonp");

                    deferred.reject(-2, "exception " + ex, timeCost);

                }

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

        return deferred.promise(proto);

    }
});

QQWB.ajax = QQWB.io.ajax;

QQWB.jsonp = QQWB.io.jsonp;

QQWB.script = QQWB.io.script;

QQWB.loadStyle = QQWB.io.loadStyle;

}());
