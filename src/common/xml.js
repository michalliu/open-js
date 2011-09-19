/**
 * Tencent weibo javascript library
 *
 * String extension
 *
 * @author michalliu
 * @version 1.0
 * @package common
 * @module XML
 * @requires base
 */
QQWB.extend("XML",{
    /**
     * Determine is XML object or not
     *
     * @access public
     * @param xml {Object} xml object
     * @return {Boolean}
     */
    isXML: function (xml) {
       //TODO: not implement yet
    }
    /**
     * xml object to string
     *
     * @access public
     * @param xml {Object} xml object
     * @return {String}
     */
   ,toString: function (xml) {
        var str;
        if (window.ActiveXObject) {
            str = xml.xml;
        } else {
            str = (new XMLSerializer()).serializeToString(xml);
        }
        return str;
    }
    /**
     * create xml object from string
     *
     * @access public
     * @param str {String} xml string
     * @return {Object} xml object
     */
   ,fromString: function (str) {
       var xml;
       if (window.ActiveXObject) {
           xml = new ActiveXObject("Microsoft.XMLDOM");
           xml.async = "false";
           xml.loadXML(str);
       } else {
           var parser = new DOMParser();
           xml = parser.parseFromString(str, "text/xml");
       }
       return xml;
    }
}, true/*overwrite toString method inherit from Object.prototype*/);
