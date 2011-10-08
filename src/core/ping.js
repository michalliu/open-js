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
 *           browser
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
           ,sBiz:"open-js" // biz name
           ,sOp:"" // operation name
           ,iSta:""  // state
           ,iTy:1183 // system id
           ,iFlow: flowid// unquie id
		   ,iFrom: "" // op from
		   ,iPubFrom: "" // op from
		   ,sUrl: "" // op url
		   ,iUrlType: "" // url type
		   ,iPos:"" // op position
		   ,sText:"" // some text
		   ,iBak1: ""
		   ,iBak2: ""
		   ,sBak1: ""
		   ,sBak2: QQWB.uid()
         };
	 } 
	// ping with parameters
   ,pingWith: function (params, order) {
	   // we are intend to use global variable to avoid browser drop the ping request
	   params = QQWB.extend(QQWB.ping._getBasePingParams(), params, true);
	   QQWBPingTransport_18035d19 = new Image(1,1);
	   QQWBPingTransport_18035d19.src = QQWB.ping._pingbackURL 
	                                    + "?" 
	                                    + QQWB.queryString.encode(params, null, null, order);
    }
	// ping when appkey initilizing, success or unsuccess
   ,pingInit: function () {

	   function getClientInfo () {
		  var clientInfo = 1000000 
		      feature = 0;

    	  if (QQWB.browser.msie) {
			  clientInfo += 100;
          } else if(QQWB.browser.opera) {
			  clientInfo += 200;
          } else if(QQWB.browser.webkit) {
			  clientInfo += 300;
          } else if(QQWB.browser.mozilla) {
			  clientInfo += 400;
    	  } else {
			  clientInfo += 500;
    	  }
    
    	  if (QQWB.browser.feature.postmessage) {
			  feature += 1;
    	  }
    	  if (QQWB.browser.feature.flash) {
			  feature += 2;
          }
    	  if (QQWB.browser.feature.cookie) {
			  feature += 4;
          }

		  clientInfo += feature;

		  // 1000(browertype)0(browserfeature)
		  //
		  return clientInfo;
	   };

	   function getAppInfo () {
		   var appInfo = 1000000;
		   if (QQWB.browser.platform.mobile) {
			   appInfo += 100;
		   } else /*if (QQWB.browser.platform.pc)*/{
			   appInfo += 200;
		   }

		   if (QQWB.browser.os.windows) {
			   appInfo += 10;
		   } else if (QQWB.browser.os.windows) {
			   appInfo += 20;
		   } else if (QQWB.browser.os.mac) {
			   appInfo += 30;
		   } else if (QQWB.browser.os.unix) {
			   appInfo += 40;
		   } else if (QQWB.browser.os.linux) {
			   appInfo += 50;
		   } else /*if (QQWB.browser.os.unknown)*/{
			   appInfo += 60;
		   }

		   appInfo += parseInt(QQWB.appkey.version,10);

		   // 1000(platform)(os)(appkeyversion)
		   return appInfo;
	   };

	   return QQWB.ping.pingWith({
		    sOp: "init"
		   ,iFrom: QQWB.version.replace(/\./g,"")
		   ,iPubFrom: getAppInfo()
		   ,sUrl: document.location.href
		   ,sText: QQWB.appkey.value
		   ,iBak1: getClientInfo()
	   }, QQWB.ping._stupidPingParamsOrder.concat("iFrom","iPubFrom","sUrl","iUrlType"
	                                             ,"iPos","sText","iBak1","iBak2","sBak1","sBak2"));
    }
});

