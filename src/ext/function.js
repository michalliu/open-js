/**
 * Tencent weibo javascript library
 *
 * Function extension
 *
 * @author michalliu
 * @version 1.0
 * @package ext
 * @module Function
 * @requires base
 */
QQWB.extend("Function",{
    /**
     * Determine whether an object is Function
     *
     * @access public
     * @param arg {Mixed} anything
     * @return {Boolean}
     */
    isFunction: function (arg) {
        return typeof arg === "function";
    }
});
