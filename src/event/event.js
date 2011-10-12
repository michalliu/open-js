/**
 * Tencent weibo javascript library
 *
 * Event API
 *
 * @author michalliu
 * @version 1.0
 * @package event
 * @module event
 * @requires base
 *           common.Array
 *           eventProvider
 */

// event methods
//
QQWB.extend("",{
    /**
     * Bind an event
     *
     * Example:
     * 
     * T.bind("UserLoggedIn", function () {
     *     T.log.info("user logged in");
     * });
     *
     * @param name {String} event name to bind
     * @param handler {Function} the handler for this event
     */
    bind: function (name, handler) {
        name = name.toLowerCase();
        this._eventProvider.bind(name, handler);
    	return this;
    }

    /**
     * Bind an event but only execute once
     *
     * Example:
     * 
     * T.once("UserLoggedIn", function () {
     *     T.log.info("user logged in");
     * });
     *
     * @param name {String} event name to bind
     * @param handler {Function} the handler for this event
     */
   ,once: function (name, handler) {
		name = name.toLowerCase();
		var handlerWrapper = function () {
			var args = QQWB.Array.fromArguments(arguments);
			handler.apply(QQWB, args);
            this._eventProvider.unbind(name, handlerWrapper);
			handlerWrapper = null;
		}
        this._eventProvider.bind(name, handlerWrapper);
    	return this;
	}

    /**
     * Unbind an event
     *
     * Example:
     *
     * // handler for when user logged in
     * // keep a reference to this handler
     * var userlogin = function () {
     *     T.log.info("user logged in");
     * }
     *
     * // bind handler
     * T.bind("UserLoggedIn", userlogin);
     *
     * // unbind this handler 
     * T.unbind("UserLoggedIn", userlogin);
     *
     * // unbind all the handlers
     * T.unbind("UserLoggedIn")
     *
     * @param name {String} event name to unbind
     *        handler {Function} the handler's reference for this event to unbind
     */
   ,unbind: function (name, handler) {
        name = name.toLowerCase();
        this._eventProvider.unbind(name, handler);
	    return this;
    }

    /**
     * Trigger an event manually
     *
     * Example:
     *
     * T.trigger("UserLoggedIn");
     *
     * @param eventName {String} the event's name to bind
     * @param data {Mixed} the data passed to the callback function
     */
   ,trigger: function (name, data) {
        name = name.toLowerCase();
        this._eventProvider.trigger(name, data);
        return this;
    }
});

// internal supported events names
QQWB.extend("events", {
    USER_LOGGEDIN_EVENT: "UserLoggedIn"
   ,USER_LOGIN_FAILED_EVENT: "UserLoginFailed"
   ,USER_LOGGEDOUT_EVENT: "UserLoggedOut"
   ,TOKEN_READY_EVENT: "tokenReady"
   ,DOCUMENT_READY_EVENT: "documentReady"
   ,EVERYTHING_READY_EVENT: "everythingReady"
});
