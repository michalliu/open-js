/**
 * Tencent weibo javascript library
 *
 * A simple event system provide hooks
 *
 * @author michalliu
 * @version 1.0
 * @package event
 * @module eventProvider
 * @requires base
 *           ext.Array
 */
QQWB.extend("_eventProvider",{

    /**
     * Get event system's internal map or create it if not exists
     *
     * @access private
     * @return {Object} the internal event map
     */
    _getEventsMap: function () {
        if (!this._eventsMap) {
            this._eventsMap = {};
        }
        return this._eventsMap;
    }

    /**
     * Bind an event
     *
     * @access public
     * @param name {String} the event name to bind
     * @param handler {Function} the handler for this event
     * @return {Void}
     */
   ,bind: function (name, handler) {
       var evts = this._getEventsMap();
       if (!evts[name]) {
           evts[name] = [handler];
       } else {
           if (!QQWB.Array.inArray(evts[name],handler)) {
               evts[name].push(handler);
           }
       }
    }

    /**
     * Unbind an event
	 * 
	 * If no handler provided, it will unbind all the handlers to this event
     * @access public
     * @param name {String} the event name to unbind
     *        handler {Function} the handler's reference for this event to unbind
     * @return {Void}
     */
   ,unbind: function (name, handler) {
	   var handlers = this._getEventsMap()[name];
	   if (handlers) {
		   if (handler) { // unbind specific handler,do nothing if handler not registered
			   for (var i=0,l=handlers.length; i<l; i++) {
				   if (handler === handlers[i]) {
					   handlers[i] = null;
				   }
			   }
		   } else { // unbind all the handlers
			   //handlers.length = 0;
			   delete this._getEventsMap()[name];
		   }
	   }
    }

   /**
	* Trigger a named event
	*
	* @access private
	* @param name {String} the event name
	*        data {Mixed} the event data
	*/
   ,trigger: function (name, data) {
	   var handlers = this._getEventsMap()[name];
	   if (handlers) {
           for (var i=0,l=handlers.length; i<l; i++) {
			   var handler = handlers[i];
			   if (handler) {
				   handler.call(QQWB,data);
			   }
           }
	   }
    }
});
