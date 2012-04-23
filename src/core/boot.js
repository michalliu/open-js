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

QQWB.bigtable.put('boot','solution', function () {

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

        implementationTimeout = 15,

		crossdomainMethod;

	tokenReady = _b.put("boot", "tokenready", QQWB.door.door(function (reason) {

		_l.debug("tokenReady is locked" + (reason ? "," + reason : ""));

    }, function (reason) {

		_l.debug("tokenReady is unlocked" + (reason ? "," + reason : ""));

        if (tokenReady.isOpen()) {

            _l.info("token is ready");

            _.trigger(_b.get("nativeevent","tokenready"));

        }

    }));

	everythingReady = _b.put("boot", "everythingready", QQWB.door.door(function (reason) {

		_l.debug("everythingReady is locked" + (reason ? "," + reason : ""));

    }, function (reason) {

		_l.debug("everythingReady is unlocked" + (reason ? "," + reason : ""));

        if (everythingReady.isOpen()) {

            _l.info("everything is ready");

            _.trigger(_b.get("nativeevent","everythingready"));

            _.trigger(_b.get("nativeevent","ready"));

        }

    }));

    tokenReady.lock("waiting init");

    everythingReady.lock("wait token ready"); // token must be ready

	if (!_b.get("document", "ready")) {

        everythingReady.lock("wait document ready");

	}
    
    _.bind(_b.get("nativeevent","tokenready"), function () {

        everythingReady.unlock("token is ready");

    });
    
	// post message implementation
	html5Implementation = function () {

		var _ = QQWB,

		    _l = _.log,

			_d = _.dom,

			_b = _.bigtable,

			p  = _b.get("uri","html5proxy"),

			sd =  _b.get("solution","deferred"),
			
            timer,

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

			onProxyLoad = function () {

                timer && clearTimeout(timer);

			}

            if (proxyframe.attachEvent){

                proxyframe.attachEvent("onload", onProxyLoad);

            } else {

                proxyframe.onload = onProxyLoad;

            }

            // max wait 15 seconds to load proxy frame
			timer = setTimeout (function () {

				if (!sd.isResolved()) {

	                sd.reject(-6, "can't load proxy frame from path " + p + ",request timeout");

					_l.critical("proxy frame error");
				}

			}, implementationTimeout * 1000);

            // sometimes webkit will force to cancel the iframe load request
            // due the signal thread mode in javascript
            // we just to ensure the the frame will be loaded
            setTimeout(function () {

			    document.body.appendChild(proxyframe);

            },0);

			_b.put("solution", "frame", proxyframe);

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
				 
                 timer && clearTimeout(timer);

                 movie = window[id] || document.getElementById(id);

				 if (!movie) {

				     _l.critical("proxy swf has unexpected error, os " + _br.os.name + "; browser engine " + _br.engine +"; version " + _br.version);

				 } else {

                     _l.info("flash solution initlized successfully");

				     _b.put("solution", "flashmovie", movie);

                     sd.resolve();

				 }

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
		    timer =  setTimeout(function () {
            
                if (!sd.isResolved()) {
            
                    sd.reject(-6, "can't load proxy swf from " + p + ",request timeout");
            
					try {

					    document.body.removeChild(invisible);

				    } catch (ex) {}
                }
            
            }, implementationTimeout * 1000);

            // ensure this invisible node will insert into dom, cause of the single thread mode in javascript
            setTimeout(function () {

			    document.body.appendChild(invisible);

                // this is a huge bug in flash
                // the flash external interface calls when you set innerHTML to a div even that div doesn't append to DOM yet
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

            },0);

		});

	}; // end flash external interface solution


	setupHtml5Implementation = function () {

        html5Implementation ();

        _b.put("solution","name","html5");

	}; // end setupHtml5Implementation
	
	setupFlashAs3Implementation = function () {

        _l.info("flash player version " + _br.feature.flash.version);

        if (!_br.feature.flash.externalinterface) {
        
        	_l.warn("flash player too old, openjs may not work properly");

        }

        flashAs3Implementation ();

        _b.put("solution","name","as3");

	}; // end setupFlashAs3Implementation

	crossdomainImplementationError = function (msg) {

        var sd =  _b.get("solution","deferred");

        sd.reject(-6, msg);

	}; // crossdomainImplementationError

	// auto detect
	if (QQWB.envs.crossdomainmethod == 'auto') {

		_l.debug("detect crossdomain method");

        if (_br.feature.postmessage) {

            setupHtml5Implementation();

        } else if (_br.feature.flash) {

            setupFlashAs3Implementation();

        } else {

            _l.critical("no solution available, switch to modern browser or install latest flash player, then refresh this page");

			crossdomainImplementationError("no solution available, need a modern browser or install lastest flash player");
        }

	} else {

		_l.debug("load crossdomain method " + QQWB.envs.crossdomainmethod);

        crossdomainMethod = _s.trim(QQWB.envs.crossdomainmethod.toLowerCase());

		switch (crossdomainMethod) {

			case "html5":
			case "postmessage":

                if (_br.feature.postmessage) {

                    setupHtml5Implementation();

				} else {

                    _l.critical("can not setup crossdomain method " + QQWB.envs.crossdomainmethod + ", browser not support");

		        	crossdomainImplementationError("postmessage solution can not be setted up");
				}

			break;

			case "flash":

			case "as3":

		    	if (_br.feature.flash) {

                    setupFlashAs3Implementation();

				} else {

                    _l.critical("can not setup crossdomain method " + QQWB.envs.crossdomainmethod + ", browser not support");

		        	crossdomainImplementationError("flash as3 solution can not be setted up");

				}

			break;
		}

	}

});

//TODO: version check and update infomation reminder

if (QQWB.envs.autoboot) {

	QQWB.bigtable.put('boot','booting', true);

	// boot
	QQWB.bigtable.get('boot','solution')();

}
