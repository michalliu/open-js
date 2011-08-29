/**
 * Tencent weibo javascript library
 *
 * Flash(swf file) loader
 *
 * @author michalliu
 * @version 1.0
 * @package ext
 * @module Flash
 * @requires base
 *           ext.Array
 */
QQWB.extend("Flash",{

    _minVersions:[
        [9,0,159,0],
        [10,0,22,87]
    ]

    /**
     * Load swf to the current page by path
     *
     * @access public
     * @param swfPath {String} the swf file path
     * @param callback {Function} the callback when swf is ready
     * @return Flash {Object}
     */
   ,load: function (swfPath, callback) {

       if (!this.loadedSwfs) {
           this.loadedSwfs = [];
       }

       if (QQWB.Array.inArray(this.loadedSwfs, swfPath)) {
           QQWB.log.warning(swfPath + "is already loaded");
           return;
       }

       // this is the function name will be called inside flash
       // to indicate that the flash is ready now
       var flashReadyCallbackName = "onFlashReady_a1f5b4ce";

    }
});
