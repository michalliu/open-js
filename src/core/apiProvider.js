/**
 * Tencent weibo javascript library
 *
 * API descriptor
 *
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module apiProvider
 * @requires base
 *           static
 */
//TODO: more api should be supported
QQWB.extend("_apiProvider", {
	// api list
    apis: {
         "/statuses/home_timeline": {
             category: QQWB._static.CATEGORY_TIMELINE
            ,description: "主页时间线"
            ,supportMethod: QQWB._static.GET
            ,supportParams: {
                 pageflag: {
                     defaultValue:0
                    ,description:QQWB._static.EMPTY_STR
                 }
                ,reqnum: {
                    defaultValue:20
                   ,description:QQWB._static.EMPTY_STR
                 }
                ,pagetime: {
                    defaultValue:0
                   ,description:QQWB._static.EMPTY_STR
                 }
             }
         }
        ,"/statuses/public_timeline": {
             category: QQWB._static.CATEGORY_TIMELINE
            ,description: "广播大厅时间线"
            ,supportMethod: QQWB._static.GET
            ,supportParams: {
                 pos: {
                     defaultValue:0
                    ,description:QQWB._static.EMPTY_STR
                 }
                ,reqnum: {
                    defaultValue:20
                   ,description:QQWB._static.EMPTY_STR
                 }
                ,pagetime: {
                    defaultValue:0
                   ,description:QQWB._static.EMPTY_STR
                 }
             }
         }
    }
	/**
	 * Get an api descriptor object
	 *
	 * @access public
	 * @param interface {String} the api interface
	 * @return {Object} the descriptor object
	 */
   ,getDescriptor: function (interface) {
       return this.apis[interface];
    }
	/**
	 * Determine an api is in the api list or not
	 *
	 * @access public
	 * @param interface {String} the api interface
	 * @return {Boolean}
	 */
   ,isProvide: function (interface) {
       return !!this.getDescriptor(interface);
    }
	/**
	 * Try to describe the api interface by human read-able format
	 *
	 * @access public
	 * @param interface {String} the api interface
	 * @return {Boolean}
	 */
    ,describe: function (interface) {
		var descriptor = this.getDescriptor(interface);
		if (descriptor) {
			return descriptor.category + ">" + descriptor.description;
		} else {
			return "";
		}
	 }
});

