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
 *           ext.Array
 *           dom
 *           flash
 */
QQWB.extend("_solution", {

    HTML5_SOLUTION: "html5"

   ,FLASH_SOLUTION: "flash"

   ,SILVER_LIGHT_SOLUTION: "silverlight"

   ,initSolution: function (name) {

       var solution,  // the choosed solution

           // the whole initilized process is success?
           // this is the deferred object for the whole process
           // not the single solution
           solutionInit = QQWB.deferred.deferred();

       // if the solution passed in we supported
	   // and not initialized
	   // then initialze it
       if (!this[name] && QQWB.Array.inArray([this.HTML5_SOLUTION
                                             ,this.FLASH_SOLUTION
                                             ,this.SILVER_LIGHT_SOLUTION]
                                             ,name)) {

           // a choosed solution object
           this[name] = {};

           // indicate choosed solution is ready or not
           // 0 not resolved
           // 1 solution is relsolved successfully
           // 2 solution is rejected
           this[name]["readyState"] = 0;

           // the choosed solution id
           // use to indendify the solution object
           this[name]["id"] = "solution_" + QQWB.uid();

           // the choosed solution deferred ready object
           this[name]["deferred"] = QQWB.deferred.deferred();

           // the choosed solution deferred ready promise object
           this[name]["promise"] = this[name]["deferred"].promise();

	   }

       // register callback to sub solutions deferred object
       // if choosed solution failed then the whole solution failed,vice versa
	   if (this[name] && this[name].readyState !== 0) {
           this[name].deferred.success(function () {
                solutionInit.resolve(QQWB.Array.fromArguments(arguments));
           }).fail(function () {
                solutionInit.reject(QQWB.Array.fromArguments(arguments));
	       });
	   } else {
           // switch between solution types
           switch (name) {
               // this is the html5 solution
               case this.HTML5_SOLUTION:
               // the browser must support postmessage feature
               // to support html5 solution
               if (QQWB.browser.feature.postmessage) {
                   // reference for choosed solution object
                   solution = this[this.HTML5_SOLUTION];
                   var messageHandler = function (e) {
                       // we expected the message only come from serverproxy (we trusted)
                       // omit other messages, to protect your site alway from XSS/CSRF attack
                       if (QQWB._domain.serverproxy.indexOf(e.origin) !== 0) {
	                       QQWB.log.warning("unexpected message arrived from " + e.origin + " with data " + e.data);
	        	       } else { // this is the message we expected
                           if (e.data === "success") {
                               QQWB.log.info("html5 solution was successfully initialized");
                               solution.readyState = 1;
                               solution.deferred.resolve();
                           } else { // amm.. the trusted server post a message we don't understand
                               QQWB.log.info("unexpected solution signal " + e.data);
                           }
                       }
                       // clean up things
                       //
                       // unbind handlers
                       if (window.addEventListener) {
                           window.removeEventListener("message", messageHandler, false);
                       } else if (window.attachEvent) {
                           window.detachEvent("onmessage", messageHandler);
                       }
                       // 
                       messageHandler = null;
                   };

                   if (window.addEventListener) {
                       window.addEventListener("message", messageHandler, false);
                   } else if (window.attachEvent) {
                       window.attachEvent("onmessage", messageHandler);
                   }

                   // append the server frame to page
                   QQWB.documentReady(function () {
                       QQWB.log.info("init html5 solution...");
                       serverframe = QQWB.dom.createHidden("iframe", {id: solution.id,src: QQWB._domain.serverproxy});
                       QQWB.dom.append(serverframe);
                       // the onload event is fired before the actually content loaded
                       // so we set a delay of 1 sec
                       // if serverframe doesn't post that message, we know there is an error
                       // maybe a 404 Error?
                       // the onload event will fired on chrome even the frame is 404 !!!
                       // there is no frame.onerror event
                       serverframe.onload = function (e) {
                           setTimeout(function () {
                               // should be 1 now, if everything is fine
                               // if not there is a problem
                               if (solution.readyState !== 1) {
                                   QQWB.log.error("html5 solution initialition has failed, server proxy frame encountered error");
                                   solution.readyState = 2;
                                   solution.deferred.reject(-1,"server proxy frame not working");
                               }
                           }, 1 * 1000)/* check delayed */;
                       };
                   });
               } else { // browser don't support postmessage feature, the html5 solution failed
                   QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support postmessage";
                   solutionInit.reject("browser not supported");
               }
               break;

               case this.FLASH_SOLUTION:
               // the browser must support flash feature to initliz flash solution
               if (QQWB.browser.feature.flash) {
                   // reference for choosed solution object
                   solution = this[this.FLASH_SOLUTION];

	        	   QQWB.documentReady(function () {
                       QQWB.log.info("init flash solution...");
	        		   var resolveTimer,
	        		       resolveTimeout = 10 * 1000,
	        		       movieBox = QQWB.flash.load(QQWB._domain.flashproxy, function (moviename) {
							  QQWB.log.info("flash solution initlized successfully");
	        	              solution.readyState = 1;
	        				  window["QQWBFlashTransport"] = QQWB.flash.getSWFObjectByName(moviename);
	        				  // clear the timer
	        				  resolveTimer && clearTimeout(resolveTimer);
	        	              solution.deferred.resolve();
                           });
	        		   
                       // if solution didn't marked as resolved(success) after 30 seconds 
	        		   // mark the solution has failed and do clean up
	        		   resolveTimer = setTimeout(function () {
	        	    		   if (!solution.deferred.isResolved()) {
	        	    		       solution.readyState = 2;
	        	    		       solution.deferred.reject(-1, "encounter error while loading proxy swf");
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
                   ~1;
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
