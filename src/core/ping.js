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
 *           core.init
 */
/*jslint laxcomma:true*/
QQWB.extend("ping", {

   pingWith: function (params, order) {

       function baseParam () {

           var qq = (QQWB.cookie.get("uin",null) || '0').match(/\d+/)[0],

               flowid = "";

           return {
               sIp:"" // ip
              ,iQQ: qq // QQ
              ,sBiz:"openJS" // biz name
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

       params = QQWB.extend(baseParam(), params, true);

       QQWBPingTransport_18035d19 = new Image(1,1);

       QQWBPingTransport_18035d19.src = [QQWB.bigtable.get("ping","urlbase"),
                                        "?",
                                        QQWB.queryString.encode(params, null, null, order)].join("");
    }

    // ping when appkey initilizing, success or unsuccess
   ,pingInit: function () {

       function getClientInfo () {

          var clientInfo = 1000000,

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

          if (QQWB.bigtable.get("innerauth","enabled")) {

              clientInfo += 10000;

          }

          return clientInfo;

       }

       function getAppInfo () {

           var appInfo = 1000000;

           if (QQWB.browser.platform.mobile) {

               appInfo += 100;

           } else /*if (QQWB.browser.platform.pc)*/{

               appInfo += 200;

           }

           if (QQWB.browser.os.windows) {

               appInfo += 10;

           } else if (QQWB.browser.os.mac) {

               appInfo += 20;

           } else if (QQWB.browser.os.linux) {

               appInfo += 30;

           } else if (QQWB.browser.os.unix) {

               appInfo += 40;

           } else /*if (QQWB.browser.os.unknown)*/{

               appInfo += 50;

           }

           return appInfo;
       }

       return QQWB.ping.pingWith({

            sOp: "init"

           ,iFrom: QQWB.version.replace(/\./g,"")

           ,iPubFrom: getAppInfo()

           ,sUrl: [document.title,document.location.href].join(QQWB.bigtable.get("ping","paramsep"))

           ,sText: QQWB.bigtable.get("base", "appkey")

           ,iBak1: getClientInfo()

       }, QQWB.bigtable.get("ping","paramorder").concat("iFrom","iPubFrom","sUrl","iUrlType","iPos","sText","iBak1","iBak2","sBak1","sBak2"));

    }

});
