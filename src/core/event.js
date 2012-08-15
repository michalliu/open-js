/**
 * Tencent weibo javascript library
 *
 * Event API
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module event
 * @requires base
 */
/*jslint laxcomma:true*/
QQWB.extend("",{
    /**
     * Bind handler with an event name
     *
     * @param name {String} event name to bind
     * @param handler {Function} the handler for this event
     */
    bind: function (name, handler) {

        name = name.toLowerCase();

        var _ = QQWB,

            _b = _.bigtable,

            handlers = _b.get("eventhandler",name);

        if (handlers) {
            
            if (!QQWB.Array.inArray(handlers,handler)) {

                handlers.push(handler);

            }

        } else {

            _b.put("eventhandler", name, [handler]);

        }

        return _;
    }

    /**
     * Bind handler with an event name
     * This handler will removed after event happens
     *
     * @param name {String} event name to bind
     * @param handler {Function} the handler for this event
     */
   ,once: function (name, handler) {

        name = name.toLowerCase();

        var _ = QQWB,

            handlerWrapper;

        handlerWrapper = function () {

            var ret = handler.apply(QQWB, arguments);

            _.unbind(name, handlerWrapper);

            handlerWrapper = null;

            return ret;

        };

        _.bind(name, handlerWrapper);

        return _;
    }

    /**
     * Unbind handler from event
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

        var _ = QQWB,

            _b = _.bigtable,

            handlers = _b.get("eventhandler",name),

            i, l;

        if (handlers) {

            if (handler) {

                for (i=0,l=handlers.length; i<l; i++) {

                    if (handler === handlers[i]) {

                       handler = null;

                        handlers.splice(i,1);

                    }

                }

            } else {

                _b.del("eventhandler",name);

            }

        }

        return !_b.get("eventhandler",name);
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

        var _ = QQWB,

            _a = _.Array,

            _b = _.bigtable,

            handlers = _b.get("eventhandler",name);

        data = _a.fromArguments(arguments).slice(1);

        if (handlers) {

            return _a.forEach(handlers, function (handler, i) {

               if (handler) {

                   return handler.apply(_, data);

               }

               return;

            });
        }

        return;
    }
});
