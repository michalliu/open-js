/**
 * Tencent weibo javascript library
 *
 * solution manager
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module solution
 * @requires base
 *           deferred
 *           common.Array
 *           dom
 *           flash
 *           browser
 */
QQWB.extend("_solution", {

    HTML5_SOLUTION: "html5"

   ,FLASH_SOLUTION: "flash"

   ,SILVER_LIGHT_SOLUTION: "silverlight"

   ,getBrowserBestSolution: function () {
	   if (QQWB.browser.feature.postmessage) {
           return this.HTML5_SOLUTION;
       } else if (QQWB.browser.feature.flash) {
           return this.FLASH_SOLUTION;
       } else {
		   return "";
       }
   }
   ,initSolution: function (name, optPlatform) {

       // default init solution for current platform
	   optPlatform = QQWB.platform == null ? QQWB.platforms.WEIBO : QQWB.platform;

	   var platform = QQWB.getPlatform(optPlatform),

           // the choosed solution, platform and solution type specified
           solution,

		   // the current init session
		   internalDeferred,

		   // the whole solution init process
           solutionInit = QQWB.deferred.deferred();

       // if the solution passed in we supported and not initialized then initialze it
	   // we create a object to hold the solution object
	   if (   (!this[optPlatform] || !this[optPlatform][name])
	       && QQWB.Array.inArray([this.HTML5_SOLUTION
                                             ,this.FLASH_SOLUTION
                                             ,this.SILVER_LIGHT_SOLUTION]
                                             ,name)) {
		   internalDeferred = QQWB.deferred.deferred();
           QQWB.extend(["_solution",optPlatform,name].join("."), {
			   "name": name // solution's name(type)
			  ,"readyState": 0 //  0 not resolved;1 solution is relsolved successfully;2 solution is rejected;
			  ,"id": "solution_" + optPlatform + QQWB.uid() // use to indendify the solution object
			  ,"deferred": internalDeferred //  deferred ready object
			  ,"promise": internalDeferred.promise() // deferred ready promise object
           });
	   }

	   // if specified platform solution already initilized, don't do it again
	   // if already inited we know the final result immediately
	   if (this[optPlatform] && this[optPlatform][name] && this[optPlatform][name].readyState !== 0) {
           this[optPlatform][name].deferred.success(function () {
                solutionInit.resolve(QQWB.Array.fromArguments(arguments));
           }).fail(function () {
                solutionInit.reject(QQWB.Array.fromArguments(arguments));
	       });
	   // platform and type of solution is not inited yet
	   } else {
           // switch between solution types
           switch (name) {

               // this is the html5 solution
               case this.HTML5_SOLUTION:

               // the browser must support postmessage feature
               // to support html5 solution
               if (QQWB.browser.feature.postmessage) {

                   // a reference for choosed solution object
                   solution = this[optPlatform][this.HTML5_SOLUTION];

				   // add message handler in currentpage
                   var messageHandler = function (e) {
                       // we expected the message only come from serverproxy (we trusted)
                       // omit other messages, to protect your site alway from XSS/CSRF attack
                       if (platform.domain.iframeProxy.indexOf(e.origin) !== 0) {
	                       QQWB.log.warning("unexpected message arrived from " + e.origin + " with data " + e.data);
	        	       } else { // make sure it is the message we wanted
                           if (e.data === "success") {
                               QQWB.log.info("html5 solution for platform **" + optPlatform + "** was successfully initialized");
                               solution.readyState = 1;
                               solution.deferred.resolve();
                           } else { // amm.. the trusted server post a message we don't understand
                               QQWB.log.warning("recieved unexpected solution signal for platform **" + optPlatform + "** " + e.data);
                           }

                           // clean up things
                           // unbind handlers
                           if (window.addEventListener) {
                               window.removeEventListener("message", messageHandler, false);
                           } else if (window.attachEvent) {
                               window.detachEvent("onmessage", messageHandler);
                           }

                           messageHandler = null;
                       }
                   };

                   if (window.addEventListener) {
                       window.addEventListener("message", messageHandler, false);
                   } else if (window.attachEvent) {
                       window.attachEvent("onmessage", messageHandler);
                   }

                   // append the server frame to page
                   QQWB.ready(function () {
					   
                       QQWB.log.info("init html5 solution for platform **"+ optPlatform +"** ...");

					   serverframe = QQWB.dom.createHidden("iframe", { 
						   id: solution.id,
						   src: platform.domain.iframeProxy
					   });

                       QQWB.dom.append(serverframe);

					   // detect server proxy working or not
                       setTimeout(function () {
                           if (solution.readyState !== 1) {
                               QQWB.log.error("html5 solution for platform **" + optPlatform + "** init has failed");
                               solution.readyState = 2;
                               solution.deferred.reject(-1,"server proxy frame not working");
                           }
                       }, 1 * 30 * 1000);

                   });
               } else { // browser don't support postmessage feature, the html5 solution failed
                   QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support postmessage";
                   solutionInit.reject("browser not supported");
               }
               break;

               case this.FLASH_SOLUTION:

               if (QQWB.browser.feature.flash) {

                   // a reference to choosed solution object
                   solution = this[optPlatform][this.FLASH_SOLUTION];

	        	   QQWB.ready(function () {
                       QQWB.log.info("init flash solution for platform **" + optPlatform + "** ...");

	        		   var resolveTimer,
	        		       resolveTimeout = 10 * 1000, // max waiting for 10 seconds
	        		       movieBox = QQWB.flash.load(platform.domain.flashProxy, solution.id, function () {
							  QQWB.log.info("flash solution initlized successfully");
	        	              solution.readyState = 1;
							  // window["QQWBFlashTransport"] = QQWB.flash.getSWFObjectByName(moviename);
	        				  // clear the timer
	        				  resolveTimer && clearTimeout(resolveTimer);
	        	              solution.deferred.resolve();
                           }, QQWB.flash.NO_CACHE/* ie has problems if cache allowed,please advice if you know a better solution*/);
	        		   
                       // if solution didn't marked as resolved(success) after 30 seconds 
	        		   // mark the solution to failed and do clean up
	        		   resolveTimer = setTimeout(function () {
	        	    		   if (!solution.deferred.isResolved()) {
	        	    		       solution.readyState = 2;
	        	    		       solution.deferred.reject(-1, "encounter error while loading proxy swf for platform **" + optPlatform + "**, required newer flash player");
	        	    		       // remove the box cotains the flash
	        	    		       QQWB.dom.remove(movieBox);
	        	    		   }
	        	    	   }, resolveTimeout);
	        	       //
	        	   });

               } else {
                   QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support flash or flash is disabled";
                   solutionInit.reject("browser not supported");
               }
               break;

               case this.SILVER_LIGHT_SOLUTION:
               if (QQWB.browser.feature.silverlight) {
                   // silverlight not implemented
                   QQWB.log.error("sorry, silverlight solution is not implemented");
               } else {
                   QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support silverlight or silverlight is disabled";
                   solutionInit.reject("browser not supported");
               }
               break;

               default:
               QQWB.log.error("can't init solution \"" + name) +"\",not supported";
               solutionInit.reject("solution " + name + " not supported");
               break;
           }

	       }
           
           return solutionInit.promise();
    }
});
