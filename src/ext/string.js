/**
 * Tencent weibo javascript library
 *
 * String extension
 *
 * //TODO: encoding libraries
 *
 * http://www.cnblogs.com/cgli/archive/2011/05/17/2048869.html
 * http://www.blueidea.com/tech/web/2006/3622.asp
 *
 * @author michalliu
 * @version 1.0
 * @package ext
 * @module String
 * @requires base
 */
QQWB.extend("String",{
    /**
     * Determine whether an object is string
     *
     * @access public
     * @param source {Mixed} anything
     * @return {Boolean}
     */
    isString: function (source) {
        return typeof source === "string";
    }

});
