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
    _trimLeft: /^\s+/
   ,_trimRight: /\s+$/
    /**
     * Determine whether an object is string
     *
     * @access public
     * @param source {Mixed} anything
     * @return {Boolean}
     */
   ,isString: function (source) {
        return typeof source === "string";
    }

    /**
     * Strip left blank
     *
     * @access public
     * @param source {Mixed} anything
     * @return {String}
     */
   ,ltrim: function (source) {
       return source == null ? "" : source.toString().replace(this._trimLeft,"");
    }

    /**
     * Strip right blank
     *
     * @access public
     * @param source {Mixed} anything
     * @return {String}
     */
   ,rtrim: function (source) {
       return source == null ? "" : source.toString().replace(this._trimRight,"");
    }

    /**
     * Strip blank at left and right
     *
     * @access public
     * @param source {Mixed} anything
     * @return {String}
     */
    ,trim: String.prototype.trim ? function (source) {
            return source == null ? "" : String.prototype.trim.call(source);
        } : function (source) {
            return source == null ? "" : source.toString().replace(this._trimLeft,"").replace(this._trimRight,"");
        } 
});
