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

	/**
	 * Determine whether needle at the front of str
	 *
	 * @access public
	 * @param source {Mixed} anything
	 * @return {Boolean}
	 */
	,startsWith: String.prototype.startsWith ? function (source, needle) {
			return source == null ? false : String.prototype.startsWith.call(source, needle);
		} : function (source, needle) {
			return source == null ? false : source.toString().indexOf(needle) == 0;
		} 

	/**
	 * Determine whether needle at the end of str
	 *
	 * @access public
	 * @param source {Mixed} anything
	 * @return {Boolean}
	 */
	,endsWith: String.prototype.endsWith ? function (source, needle) {
			return source == null ? false : String.prototype.endsWith.call(source, needle);
		} : function (source, needle) {
			return source == null ? false : source.toString().lastIndexOf(needle) >= 0 && source.toString().lastIndexOf(needle) + needle.length == source.length;
		} 
});
