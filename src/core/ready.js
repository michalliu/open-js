/**
 * Tencent weibo javascript library
 *
 * common ready event handlers
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module ready
 * @requires base
 *           boot
 */
/*jslint laxcomma:true*/
QQWB.extend("",{
   /**
    * Add callback funtions when the sdk is ready
    * 
    * @access public
    * @param handler {Function} callback function
    * @return {Object} QQWB object
    */
   tokenReady: function (handler) {

       var _ = QQWB,

           _b = _.bigtable,

           ready = _b.get("boot", "tokenready");

       if (ready && ready.isOpen()) { // autoboot为false时ready可能为undefined

           if(handler) handler();

       } else {

           _.bind(_b.get("nativeevent","tokenready"), handler);

       }

       return _;
    }
   /**
    * Add callback funtions when everything is ready
    * 
    * @access public
    * @param handler {Function} callback function
    * @return {Object} QQWB object
    */
   ,everythingReady: function (handler) {

       var _ = QQWB,

           _b = _.bigtable,

           ready = _b.get("boot", "everythingready");

       if (ready && ready.isOpen()) {

           if(handler) handler();

       } else {

           _.bind(_b.get("nativeevent","everythingready"), handler); // internal events

       }

       return _;
    }

});

QQWB.ready = QQWB.everythingReady;
