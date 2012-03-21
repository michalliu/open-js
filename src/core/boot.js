/**
 * Tencent weibo javascript library
 *
 * bootstrap, the start point
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module boot
 * @requires base
 *           util.door
 *           util.time
 *           util.deferred
 *           util.bigtable
 *           core.init
 *           core.log
 *           core.event
 *           core.dom
 *           core.browser
 *           common.String
 *           common.Array
 *           common.JSON
 *           core.token
 */

(function () {

	var _ = QQWB,

	    _b = _.bigtable,

		_l = _.log,

		_s = _.String,

		_br = _.browser,

		tokenReady,

		everythingReady,
		
		html5Implementation,

		flashAs3Implementation,
		
		setupHtml5Implementation,

		setupFlashAs3Implementation,

	    crossdomainImplementationError,

		crossdomainMethod;

	tokenReady = _b.put("boot", "tokenready", QQWB.door.door(function () {

        _l.info("tokenReady is locked");

    }, function () {

        _l.info("tokenReady is unlocked");

        tokenReady.isOpen() && _l.info("token is ready") && _.trigger(_b.get("nativeevent","tokenready"));

    }));

	everythingReady = _b.put("boot", "everythingready", QQWB.door.door(function () {

        _l.info("everythingReady is locked");

    }, function () {

        _l.info("everythingReady is unlocked");

        everythingReady.isOpen() && _l.info("everything is ready") && _.trigger(_b.get("nativeevent","everythingready"));

    }));

    tokenReady.lock(); // init must be called

    everythingReady.lock(); // token must be ready

    everythingReady.lock(); // document(DOM) must be ready
    
    _.bind(_b.get("nativeevent","tokenready"), function () {
        everythingReady.unlock(); // unlock for token ready
    });
    
	// post message implementation
	html5Implementation = function () {

		var _ = QQWB,

		    _l = _.log,

			_d = _.dom,

			_b = _.bigtable,

			p  = _b.get("uri","html5proxy"),

			sd =  _b.get("solution","deferred"),
			
			messageHandler;

		messageHandler = function (e) {

            if (p.indexOf(e.origin) !== 0) {

	            _l.warn("ignore a message from " + e.origin);

			} else {

				if (e.data === "success") {

                    QQWB.log.info("html5 solution was successfully initialized");

					sd.resolve();

                    if (window.addEventListener) {

                        window.removeEventListener("message", messageHandler, false);

                    } else if (window.attachEvent) {

                        window.detachEvent("onmessage", messageHandler);

                    }

                    messageHandler = null;

				} else {

	                _l.warn("ignore wired message from " + e.origin);

				}

			}
		};

		if (window.addEventListener) {

            window.addEventListener("message", messageHandler, false);

        } else if (window.attachEvent) {

            window.attachEvent("onmessage", messageHandler);

        }

		_d.ready(function () {

			var proxyframe,

			    id = "openjsframe_" + _.uid(5),

		    	onProxyLoad;

			_l.info ("init html5 solution ...");

			//@see http://www.cnblogs.com/demix/archive/2009/09/16/1567906.html
			//@see http://msdn.microsoft.com/en-us/library/ms535258(v=vs.85).aspx
			//@see http://msdn.microsoft.com/en-us/library/cc197055%28VS.85%29.aspx
			proxyframe = document.createElement("iframe");

			proxyframe.id = id;

			proxyframe.src = p;

			proxyframe.style.display = "none";

			onProxyLoad = function () { // timeout checker

			    setTimeout (function () {

					if (!sd.isResolved()) {

	        	        sd.reject(-6, "can't load proxy frame from path " + p + ",request timeout");

						_l.critical("proxy frame error");
					}

				}, 3 * 1000);

			}

            if (proxyframe.attachEvent){

                proxyframe.attachEvent("onload", onProxyLoad);

            } else {

                proxyframe.onload = onProxyLoad;

            }

			_b.put("solution", "frame", proxyframe);

			document.body.appendChild(proxyframe);

		});
	}; // end html5 postmessage implementation

	flashAs3Implementation = function () {
		
		var _ = QQWB,

		    _l = _.log,

			_b = _.bigtable,

			_br = _.browser,

			_d = _.dom,

			_f = _.flash,

			sd =  _b.get("solution","deferred"),

			p = _b.get("uri","flashas3proxy"),

			timer,

			undef;

		_d.ready ( function () {

			var invisible,

			    movie,

				id = "openjsflash_" + _.uid(5),

			    jscallbackname = _b.get("solution","jscallbackname");

	        _l.info ("init flash as3 solution ...");

			window[jscallbackname] = function () { // will be invoke when flash loaded

                 _l.info("flash solution initlized successfully");
				 
				 setTimeout(function () {

                     movie = window[id] || document.getElementById(id);

				     if (!movie) {

				         _l.critical("proxy movie insertion error, os " + _br.os.name + "; browser engine " + _br.engine +"; version " + _br.version);

				     } else {

				    	 _b.put("solution", "flashmovie", movie);

                         sd.resolve();

				     }

				 }, 0); // if don't use settimeout here, the swf can not load from cache under IE

                 timer && clearTimeout(timer);

				 try {

					 delete window[jscallbackname];

				 } catch (ex) {

				     window[jscallbackname] = undef;

				 }
			}

			invisible = document.createElement("div");

			invisible.style.width = "0px";

			invisible.style.height = "0px";

            invisible.style.position = "absolute";

            invisible.style.top = "-9999px";

			// logic borrowed from swfobject.js @see http://code.google.com/p/swfobject/

			if (_br.msie && _br.os.windows) {

				invisible.innerHTML = ['<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ', // classid IE only
				                       'id="' + id + '" ',
				                       'name="' + id + '">',
				                       '<param name="movie" value="' + p + '"></param>', // IE only
                                       '<param name="allowscriptaccess" value="always"></param>',
				                       '</object>'
				                      ].join("");

			} else {

				invisible.innerHTML = ['<object type= "application/x-shockwave-flash"',
				                       'id="' + id + '" ',
									   'data="' + p + '">',
                                       '<param name="allowscriptaccess" value="always"></param>',
				                       '</object>'
				                      ].join("");

			}


			document.body.appendChild(invisible);

		    timer =  setTimeout(function () {
            
                if (!sd.isResolved()) {
            
                    sd.reject(-6, "can't load proxy swf from " + p + ",request timeout");
            
					try {
					    document.body.removeChild(invisible);
				    } catch (ex) {}
                }
            
            }, 15 * 1000);
		});

	}; // end flash external interface solution


	setupHtml5Implementation = function () {

        html5Implementation ();

        _b.put("solution","name","html5");

	}; // end setupHtml5Implementation
	
	setupFlashAs3Implementation = function () {

        _l.info("flash player version " + _br.feature.flash.version);

        if (!_br.feature.flash.externalInterface) {
        
        	_l.warn("flash player too old, openjs may not work properly");

        }

        flashAs3Implementation ();

        _b.put("solution","name","as3");

	}; // end setupFlashAs3Implementation

	crossdomainImplementationError = function (msg) {

        var sd =  _b.get("solution","deferred");

        sd.reject(-6, msg);

	}; // crossdomainImplementationError

	// enviroment specified solution
	if (window["QQWBENVS"] && typeof QQWBENVS.CrossDomainMethod != "undefined") {

		_l.debug("read crossdomain method from enviroment variable");

        crossdomainMethod = _s.trim(QQWBENVS.CrossDomainMethod.toLowerCase());

		switch (crossdomainMethod) {

			case "html5":
			case "postmessage":

                if (_br.feature.postmessage) {

                    setupHtml5Implementation();

				} else {

                    _l.critical("can not setup enviroment specified solution " + QQWBENVS.CrossDomainMethod + ", please remove that enviroment variable");

		        	crossdomainImplementationError("postmessage solution can not be setted up");
				}

			break;

			case "flash":

			case "as3":

		    	if (_br.feature.flash) {

                    setupFlashAs3Implementation();

				} else {

                    _l.critical("can not setup enviroment specified solution " + QQWBENVS.CrossDomainMethod + ", please remove that enviroment variable");

		        	crossdomainImplementationError("flash as3 solution can not be setted up");

				}

			break;
		}

	// auto detect
	} else {

		_l.debug("detecting crossdomain method");

        if (_br.feature.postmessage) {

            setupHtml5Implementation();

        } else if (_br.feature.flash) {

            setupFlashAs3Implementation();

        } else {

            _l.critical("no solution available, switch to modern browser or install latest flash player, then refresh this page");

			crossdomainImplementationError("no solution available, need a modern browser or install lastest flash player");
        }
	}

}());

// dom ready events
(function () {

	var _ = QQWB,

	    _b = _.bigtable,

	    try_trigger_doc_ready;

    try_trigger_doc_ready = function () {

	   var _ = QQWB,

	       _b = _.bigtable,

		   _l = _.log,

	       ready = _b.get("document", "ready"),

           tokenIsReady,

		   inited,

		   body,

		   el;

       if (ready) {
           return;
       }

	   body = document.getElementsByTagName("body")[0];

	   if (!body) {

		   return;

	   }

       try {

           el = body.appendChild(document.createElement("span"));

           el.parentNode.removeChild(el);

       } catch (ex) { // document isn't ready

           return;

       }

	   _b.put("document", "ready", true);

       _l.info ("document is ready");

       _b.get("boot", "everythingready").unlock(); // unlock for document ready

       tokenIsReady = _b.get("boot", "tokenready").isOpen();

	   inited = _b.get("base","inited");

       // dom is ready but token not ready and not inited
	   // prompt to init
	   if (!tokenIsReady && !inited ) { 

		   _l.info("waiting for init ...");

	   }

       _.trigger(_b.get("nativeevent","documentready"));
   };

   _b.put("document", "tryready", try_trigger_doc_ready);



    if (window.addEventListener) {

        document.addEventListener("DOMContentLoaded", function () {

            try_trigger_doc_ready();

        }, false);

    }

    if (window.attachEvent) {

        document.attachEvent("onreadystatechange", function () {

            if (/complete/.test(document.readyState)) {

                document.detachEvent("onreadystatechange", arguments.callee);

                try_trigger_doc_ready();

            }

        });

        if (window === window.top) { // not inside a frame

            (function (){

				var _ = QQWB,

				    _b = _.bigtable,

				    doc_ready = _b.get("document","ready");

				if (doc_ready) {
					return;
				}

                try {

                    document.documentElement.doScroll("left");

                } catch (ex) {

                    setTimeout(arguments.callee, 0);

                    return;
                }

                try_trigger_doc_ready();

            }());
        }
    }

    if (_.browser.webkit) {

        (function () {

			var _ = QQWB,

			    _b = _.bigtable,

				doc_ready = _b.get("document","ready");

			if (doc_ready) {
				return;
			}

            if (!(/load|complete/.test(document.readyState))) {

                setTimeout(arguments.callee, 0);

                return;

            }

            try_trigger_doc_ready();

        }());
    }

}());

// exhange token scheduler
(function () {

	var _ = QQWB,

	    _l = _.log,

		_c = _.cookie,

	    _b = _.bigtable,

        maintainTokenScheduler;

	function maintainTokenStatus () {

		var canMaintain = !!_._token.getAccessToken(), // user logged in set timer to exchange token

	      	waitingTime; // server accept to exchange token 30 seconds before actually expire date

        maintainTokenScheduler && _l.info("cancel the **OLD** maintain token schedule");

        maintainTokenScheduler && clearTimeout(maintainTokenScheduler);

		if (canMaintain) {

		    // server should accept to exchange token 30 seconds before actually expire date
	      	waitingTime = parseInt(_c.get(_b.get("cookie","accesstokenname")).split("|")[1],10)

	                      - _.time.now()

	                      - 15 * 1000 /*15 seconds ahead of actual expire date*/;

			_l.info("scheduled to exchange token after " + waitingTime + "ms");

			maintainTokenScheduler = setTimeout(function () {

				_._token.exchangeForToken(function () {

					maintainTokenStatus();

				});

			}, waitingTime);

		} else {

			maintainTokenScheduler && _l.info("cancel the exchange token schedule");

            maintainTokenScheduler && clearTimeout(maintainTokenScheduler);

		}
	}

	_.bind(_b.get("nativeevent","tokenready"),maintainTokenStatus);

	_.bind(_b.get("nativeevent","userloggedin"),maintainTokenStatus);

	_.bind(_b.get("nativeevent","userloginfailed"),maintainTokenStatus);

	_.bind(_b.get("nativeevent","userloggedout"),maintainTokenStatus);

}());
