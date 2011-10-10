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
 *           solution
 *           cookie
 *           browser
 *           queryString
 */

QQWB.extend("ping", {

	// pingback url
	_pingbackURL: "http://btrace.qq.com/collect"

	// params order
   ,_stupidPingParamsOrder:["ftime","sIp","iQQ","sBiz","sOp","iSta","iTy","iFlow"]

   // params seprator
   ,_paramSeprator: ";"

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
		   ,sUrl: [document.title,document.location.href].join(QQWB.ping._paramSeprator)
		   ,sText: QQWB.appkey.value
		   ,iBak1: getClientInfo()
	   }, QQWB.ping._stupidPingParamsOrder.concat("iFrom","iPubFrom","sUrl","iUrlType"
	                                             ,"iPos","sText","iBak1","iBak2","sBak1","sBak2"));
    }
	// Send pingback when user authorize(loggin) success or fail
   ,_pingAuthorize: function (success) {
	   return QQWB.ping.pingWith({
		    sOp: "login"
		   ,iSta: success ? 1 : 0
		   ,iFrom: QQWB.version.replace(/\./g,"")
		   ,sUrl: document.location.href
		   ,sText: QQWB.appkey.value
	   }, QQWB.ping._stupidPingParamsOrder.concat("iFrom","iPubFrom","sUrl","iUrlType"
	                                             ,"iPos","sText","iBak1","iBak2","sBak1","sBak2"));
    }
	// Send pingback when user successfull login
   ,pingLoggedIn: function () {
	   return QQWB.ping._pingAuthorize(true);
    }
	// Send pingback when user unsuccessfull login
   ,pingLoggedInFailed: function () {
	   return QQWB.ping._pingAuthorize(false);
    }
	/**
	 * Send pingback when api is called
	 *
	 * @param apiname {String} apiname
	 * @param params {String} params
	 * @param method {String} http method
	 * @param responseTime {Number} response time
	 * @param status {Number} api result status
	 * @param statusText {String} status text
	 * @param solutionName {String} html5 or flash
	 *
	 * @return {Void}
	 */
   ,pingAPI: function (apiname, params, format, method,  status, statusText, responseTime, solutionName) {
	   var solutionInfo = 1000000;
	   apiname = apiname || "";// represent unknown apiname
	   params = params || "";// represent unknown params
	   format = format || "";// represent unknown format
	   method = method || "";// represent unknown method
	   status = status || "-2"; // represent unknown status
	   statusText = statusText || ""; // represent unknown status text
	   responseTime = responseTime || "-1"; // represent unknown responsetime
	   solutionName = solutionName || "";// represent unknown solutionName

       switch(solutionName){
           case QQWB._solution.HTML5_SOLUTION:
           case "postmessage":
           solutionInfo+=100;
		   break;
           case QQWB._solution.FLASH_SOLUTION:
           solutionInfo+=200;
		   break;
           case QQWB._solution.SILVER_LIGHT_SOLUTION:
           solutionInfo+=400;
		   break;
       }

	   method = method.toUpperCase();
       switch(method){
           case "GET":
           solutionInfo+=10;
		   break;
           case "POST":
           solutionInfo+=20;
		   break;
       }

	   return QQWB.ping.pingWith({
		    sOp: "api"
		   ,iSta: status
		   ,iFrom: QQWB.version.replace(/\./g,"")
		   ,iPubFrom: solutionInfo
		   ,sUrl: document.location.href
		   ,sText: QQWB.appkey.value
		   ,iBak1: responseTime
		   ,sBak1: [apiname, params].join(QQWB.ping._paramSeprator)
		   //,sBak2: statusText
	   }, QQWB.ping._stupidPingParamsOrder.concat("iFrom","iPubFrom","sUrl","iUrlType"
	                                             ,"iPos","sText","iBak1","iBak2","sBak1","sBak2"));
    }
});

