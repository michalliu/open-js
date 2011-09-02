/**
 * Tencent weibo javascript library
 *
 * Deferred object
 *
 * Note:
 *
 * Code is ported from jquery
 * A good explaination at 
 * http://stackoverflow.com/questions/4866721/what-are-deferred-objects/4867928#comment-8591160
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module deferred
 * @requires base
 *           ext.Array
 *           ext.Function
 */

QQWB.extend("deferred", {
	 /**
	  * Deferered object read-only methods
	  */
	_promiseMethods: "done fail isResolved isRejected promise then always success error complete whatever".split(" ")
	/**
	 * Create a simple deferred object (one callback list)
	 *
	 * @access private
	 * @return a deferred object
	 */
   ,_deferred: function () {
		var 
		    callbacks = [], // callback list
			fired, // stored [ context, args], use to fire again
			firing, // to avoid firing when already doing so
			cancelled, // flag to know if the deferred has been cancelled
			deferred = { // the deferred itself
				done: function () {
					if (!cancelled) {
						var 
						    args = arguments
						   ,elem
						   ,_fired;

						   // we should consider about fired status here
						   // this is neccesary to handle how done deals
						   // with arrays recursively
						   if (fired) {
							   _fired = fired;
							   fired = 0;
						   }

						   // add callbacks smartly
						   for (var i=0,l=args.length; i<l; i++) { 
							    elem = args[i];
							    if (QQWB.Array.isArray(elem)) {
								   deferred.done.apply(deferred, elem);
							   } else if (QQWB.Function.isFunction(elem)) {
								   callbacks.push(elem);
						    	}
						   }

						   // consider fired here
						   // if it's already been resolved then call resolveWith
						   // using the cached context and arguments to call the 
						   // callbacks immediatly
						   if (_fired) {
							   deferred.resolveWith(_fired[0], _fired[1]);
						   }
					}
					return this;
				}

				// resolve with given context and args
			   ,resolveWith: function (context, args) {
				   // if its been cancelled then we can't resolve
				   // if it has fired then we can't fire again
				   // if it's currently firing then we can't fire
				   if (!cancelled && !fired && !firing) {
					   args = args || [];
					   firing = 1;
					   // using try {} finally {} block because you are
					   // calling external callbacks, maybe these callbacks
					   // made by the user which are not bugfree.

					   // the finally block will always run no matter how bad
					   // the internal code is
					   try { 
					       while (callbacks[0]) {
							   callbacks.shift().apply(context, args);// first in first out
						   }
					   }
					   finally {
						   fired = [context, args]; // cache the the context and args
						   firing = 0;
					   }
				   }
				   return this;
			    }

				// Resolve with this as context and given arguments
			   ,resolve: function () {
				   deferred.resolveWith(this, arguments);
				   return this;
			    }

				// Has this deferred been resolved?
			   ,isResolved: function () {
				   return !!(firing || fired);
			    }
				// Cancel
			   ,cancel: function () {
				   cancelled = 1;
				   callbacks = [];
				   return this;
			    }
	    };
		return deferred;
	}
	/**
	 * Full fledged deferred (two callback list success and fail)
	 */
   ,deferred: function (func) {
	   var
	       promise,
	       deferred = QQWB.deferred._deferred(),
	       failDeferred = QQWB.deferred._deferred();

	   // Add errorDeferred methods, then and promise
	   QQWB.extend(deferred, {
		   // send to failed deferred object
		   fail: failDeferred.done
		   // send to sucess callback and failcallbacks at a time
		  ,then: function (doneCallbacks, failCallbacks) {
			  deferred.done(doneCallbacks).fail(failCallbacks);
			  return this;
		   }
		   // send to success callback and to fail callback aslo
		  ,always: function () {
			  return deferred.done.apply(deferred, arguments).fail.apply(this, arguments);
		   }
		   // invoke callbacks in failed deferred with context and arguments
		  ,rejectWith: failDeferred.resolveWith
		   // invoke callbacks in failed deferred
		  ,reject: failDeferred.resolve
		   // is callbacks in failed deferred invoked
		  ,isRejected: failDeferred.isResolved
		  // promise to return a read-only copy(cant call resolve resolveWith
		  // reject and rejectWith) of deferred
		  ,promise: function (obj) {
			  if (obj == null) {
				  if (promise) {
				      return promise;
				  }
				  promise = obj = {};
			  }
			  var i = QQWB.deferred._promiseMethods.length;
			  while (i--) {
				  obj[QQWB.deferred._promiseMethods[i]] = deferred[QQWB.deferred._promiseMethods[i]];
			  }
			  return obj;
		   }
	   });

	   // lovely alternative function names
	   deferred.success = deferred.done;
       deferred.error = deferred.fail;
       deferred.complete = deferred.whatever = deferred.always;

	   // funciton either success or fail
	   // if success fail deferer will cancel,vice versa
	   deferred.done(failDeferred.cancel).fail(deferred.cancel);

	   // unexpose cancel
	   delete deferred.cancel;

	   // a chance allow outer function to get a pointer to deferred object
	   func &&  func.call(deferred, deferred);

	   return deferred;
    }
	/**
	 * Deferred helper
	 */
   ,when: function (firstParam) {
	   var 
	       args = arguments,
		   length = args.length,
		   count = length,
		   deferred = length <= 1 && firstParam && QQWB.Function.isFunction(firstParam.promise) ?
		              firstParam :
					  QQWB.deferred.deferred(); // generate a deferred object or use the exists one

	    function resolveFunc (i) {
			return function (value) {
				args[i] = arguments.length > 1 ? QQWB.Array.fromArguments(arguments) : value;
				if (!(--count)) { // the last operation is resolved, resolve the when deffered
					deferred.resolveWith(deferred, QQWB.Array.fromArguments(args));
				}
			}
		}

		if (length > 1) { // more than one deferred object
		    for ( var i=0; i < length; i++) {
				if (args[i] && QQWB.Function.isFunction(args[i].promise)) { // arg is deferred object
				    // deferred.reject will called if any operation in when in rejected
				    args[i].promise().then(resolveFunc(i),deferred.reject);
				} else { // ingore arg that not a deferred object
					--count; // total arg -- 
				}

				if (!count) { // nothing is deferred
				    deferred.resolveWith (deferred, args);// let new deferred object handle it
				}
			}
		} else if ( deferred !== firstParam) {
			deferred.resolveWith(deferred, length ? [firstParam] : []);
		}

		return deferred.promise();
    }
});

// expose to global namespace
QQWB._alias("when", QQWB.deferred.when);

/*QQWB.provide("when", function () {
    return QQWB.deferred.when.apply(this,QQWB.Array.fromArguments(arguments));
});*/
