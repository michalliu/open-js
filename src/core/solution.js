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
 */
QQWB.extend("_solution", {

    HTML5_SOLUTION: "html5"

   ,FLASH_SOLUTION: "flash"

   ,SILVER_LIGHT_SOLUTION: "silverlight"

   ,initSolution: function (name) {
       if (QQWB.Array.inArray([this.HTML5_SOLUTION
                              ,this.FLASH_SOLUTION
                              ,this.SILVER_LIGHT_SOLUTION]
                              ,name)) {
           // a solution object
           this[name] = {};

           // indicate solution is ready or not
           // 0 not resolved
           // 1 solution is relsolved successfully
           // 2 solution is rejected
           this[name]["readyState"] = 0;

           // the solution id
           // use to indendify the solution object
           this[name]["id"] = "solution_" + QQWB.uid();

           // deferred ready object
           this[name]["deferred"] = QQWB.deferred.deferred();

           // deferred ready promise object
           this[name]["promise"] = this[name]["deferred"].promise();
       }

       var solutionInit = QQWB.deferred.deferred();

       switch (name) {

           case this.HTML5_SOLUTION:

           if (QQWB.browser.feature.postmessage) {

               // appending server proxy frame
               var solution = this[this.HTML5_SOLUTION];

               var messageHandler = function (e) {
                   if (QQWB._domain.serverproxy.indexOf(e.origin) !== 0) {
	                   QQWB.log.warning("unexpected message arrived from " + e.origin + " with data " + e.data);
			       } else { // we expect a success message pushed from sever proxy
                       if (e.data === "success") {
                           QQWB.log.info("html5 solution was successfully initialized");
                           solution.readyState = 1;
                           solution.deferred.resolve();
                       } else {
                           QQWB.log.info("unexpected solution signal " + e.data);
                       }
                   }
                   // unbind handlers
                   if (window.addEventListener) {
                       window.removeEventListener("message", messageHandler, false);
                   } else if (window.attachEvent) {
                       window.detachEvent("onmessage", messageHandler);
                   }
                   messageHandler = null;
               };

               if (window.addEventListener) {
                   window.addEventListener("message", messageHandler, false);
               } else if (window.attachEvent) {
                   window.attachEvent("onmessage", messageHandler);
               }

               QQWB.everythingReady(function () {
                   QQWB.log.info("init html5 solution...");
                   var serverframe = document.createElement("iframe");
                   serverframe.id = solution.id;
                   serverframe.width = 0;
                   serverframe.height = 0;
                   serverframe.style.display = "none";
                   serverframe.style.width = "0";
                   serverframe.style.height = "0";
                   serverframe.src = QQWB._domain.serverproxy;
                   document.body.appendChild(serverframe);
                   serverframe.onload = function (e) {
                       setTimeout(function () {
                           // should be 1 now, if everything is fine
                           // if not there is a problem
                           if (solution.readyState !== 1) {
                               QQWB.log.error("html5 solution initialition has failed, server proxy frame encountered error");
                               solution.readyState = 2;
                               solution.deferred.reject(-1,"server proxy frame not working");
                           }
                       }, 1 * 1000/* check delayed */);
                   }
               });
           } else {
               QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support postmessage";
               solutionInit.reject("browser not supported");
           }
           break;

           case this.FLASH_SOLUTION:
           if (QQWB.browser.feature.flash) {

               // appending server proxy frame
               var solution = this[this.FLASH_SOLUTION];

			   QQWB.everythingReady(function () {
                   QQWB.log.info("init flash solution...");
			   });
           } else {
               QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support flash or flash is disabled";
               solutionInit.reject("browser not supported");
           }
           break;

           case this.SILVER_LIGHT_SOLUTION:
           if (QQWB.browser.feature.silverlight) {
           } else {
               QQWB.log.error("can't init solution \"" + name) +"\",browser doesn't support silverlight or silverlight is disabled";
               solutionInit.reject("browser not supported");
           }
           break;

           default:
           QQWB.log.error("can't init solution \"" + name) +"\",not supported";
           solutionInit.reject("solution " + name + " not supported");
       }

       return solutionInit.promise();
    }
});
