/**
 * Tencent weibo javascript library
 *
 * String extension
 *
 * TODO: encoding libraries
 *
 * http://www.cnblogs.com/cgli/archive/2011/05/17/2048869.html
 * http://www.blueidea.com/tech/web/2006/3622.asp
 *
 * @author michalliu
 * @version 1.0
 * @package common
 * @module String
 * @requires base
 */
/*jslint laxcomma:true*/
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
       return !source ? "" : source.toString().replace(this._trimLeft,"");
    }

    /**
     * Strip right blank
     *
     * @access public
     * @param source {Mixed} anything
     * @return {String}
     */
   ,rtrim: function (source) {
       return !source ? "" : source.toString().replace(this._trimRight,"");
    }

    /**
     * Strip blank at left and right
     *
     * @access public
     * @param source {Mixed} anything
     * @return {String}
     */
    ,trim: String.prototype.trim ? function (source) {
            return !source ? "" : String.prototype.trim.call(source);
        } : function (source) {
            return !source ? "" : source.toString().replace(this._trimLeft,"").replace(this._trimRight,"");
        } 

	/**
	 * Determine whether needle at the front of str
	 *
	 * @access public
	 * @param source {Mixed} anything
	 * @return {Boolean}
	 */
	,startsWith: String.prototype.startsWith ? function (source, needle) {
			return !source ? false : String.prototype.startsWith.call(source, needle);
		} : function (source, needle) {
			return !source ? false : source.toString().indexOf(needle) === 0;
		} 

	/**
	 * Determine whether needle at the end of str
	 *
	 * @access public
	 * @param source {Mixed} anything
	 * @return {Boolean}
	 */
	,endsWith: String.prototype.endsWith ? function (source, needle) {
			return !source ? false : String.prototype.endsWith.call(source, needle);
		} : function (source, needle) {
			return !source ? false : source.toString().lastIndexOf(needle) >= 0 && source.toString().lastIndexOf(needle) + needle.length == source.length;
		} 
    /**
     * 全部替换
     *
     * @param str {String} 原始字符串
     * @param source {String} 要被替换的字符串
     * @param target {String} 替换后的字符串
     * @return {String}
     */
    ,replaceAll: function (str, source, target) {
        var pre;
        str = str || '';
        do {
            pre = str;
            str = str.replace(source, target);
        } while (pre != str);
        return str;
    }

    /**
     * 按照指定的分隔符把字符串分割成数组，支持转义
     *
     * @access public
     * @param seprator {String} 分隔符，如 '|'
     * @param str {String} 待分割的字符串
     * @return {Array}
     */
    ,splitby: function(seprator, str) {
        var _s = QQWB.String,
            fake = '[****]';
        str = _s.replaceAll(str, '\\' + seprator, fake);
        str = str.split(seprator);
        for (var i=0,l=str.length;i<l;i++) {
            str[i] = _s.replaceAll(str[i],fake,'|');
        }
        return str;
    }

});
