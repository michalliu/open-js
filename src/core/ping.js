/**
 * Tencent weibo javascript library
 *
 * Pingback
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module ping
 * @requires base
 *           cookie
 *           queryString
 */

QQWB.extend("ping", {

	// pingback url
	_pingbackURL: "http://btrace.qq.com/collect"

	// params order
   ,_stupidPingParamsOrder:["ftime","sIp","iQQ","sBiz","sOp","iSta","iTy","iFlow"]

	// generate a basic ping params
   ,_getBasePingParams: function () {
	    // unique flow id
		var     qq = QQWB.cookie.get("uin",null,"0").match(/\d+/)[0],
		    flowid = ""; // not implemented
        return {
            sIp:"" // ip
           ,iQQ: qq // QQ
           ,sBiz:"" // biz name
           ,sOp:"" // operation name
           ,iSta: 0 // state
           ,iTy:"" // system id
           ,iFlow: flowid// unquie id
         };
	 } 
	// ping with parameters
   ,pingWith: function (params, order) {
	   // we are intend to use global variable to avoid browser drop the ping request
	   params = QQWB.extend(QQWB.ping._getBasePingParams(), params, true);
	   QQWBPingTransport_18035d19 = new Image(1,1);
	   QQWBPingTransport_18035d19.src = QQWB.ping._pingbackURL 
	                                    + "?" 
	                                    + QQWB.queryString.encode(params) 
										//+ "&uid=" 
										//+ QQWB.uid()
										;// random id to defect browser cache
    }
	// ping when appkey inited, success or unsuccess
   ,pingAppkeyInitCalled: function () {
	   var appkeyVersion,
	       order = QQWB.ping._stupidPingParamsOrder.concat("sAppKey","sAppPageUrl");
	   if (/^[a-z\d][a-z\d]{30}[a-z\d]$/i.test(QQWB._appkey)) {
           appkeyVersion = 1;
	   } else if (/^[1-9][0-9]{7}[0-9]$/.test(QQWB._appkey)) {
           appkeyVersion = 2;
	   } else {
           appkeyVersion = -1;
	   }
	   return QQWB.ping.pingWith({
		    sBiz: "jssdk.appkey"
		   ,sOp: "initCalled"
		   ,iSta: appkeyVersion
		   ,iTy: 1219
		   ,sAppKey: QQWB._appkey
		   ,sAppPageUrl: document.location.href
		   ,sRand: QQWB.uid()
	   });
    }
});

