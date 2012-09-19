/*jslint laxcomma:true*/
/*global ok,test,asyncTest,module,strictEqual,deepEqual,equal,notEqual,start,expect,document,setTimeout,T,QQWB*/
var syncedT,onOpenjsLoad;
var confirmLayer;
var appkey='801124054'; // matched open.t.qq.com
var appkey='801203220'; // matched openjs.org
function requireConfirm(msg, agree, refuse) {
    // 在大多数手机浏览器上如palm pre3
    // 如果不是用户真实点击触发的window.open会被默认拦截，导致我们的测试用例无法正常运行
    // 这里主要为了解决这个问题
    if (!confirmLayer) {
        confirmLayer = T.dom.createElement('div', {
            id: 'confirmlayer',
            style: ['position:absolute;top:0;left:0;padding:5px;overflow:hidden;z-index:999;visibility:hidden;font-size:24px;'
                , (T.browser.msie && T.browser.version < 9) ? 'filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr="#4c000000", EndColorStr="#4c000000");' : 'background-color:rgba(0,0,0,0.3);'].join(''),
            
            innerhtml: '<div style="text-align:center;color:yellow;font-weight:bold;padding-top:40px;"><p>' + msg + '</p><p><button style="width:120px;height:70px;font-size:24px;" id="agree"/>同意</button>' + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button style="width:120px;height:70px;font-size:24px;" id="refuse"/>不同意</button></p></div>'
        });
        document.body.appendChild(confirmLayer);
    }
    // 绑定事件
    document.getElementById("agree").onclick = function () {
        if (agree) agree();
        confirmLayer.style.visibility="hidden";
        return false;
    };
    document.getElementById("refuse").onclick = function () {
        if (refuse) refuse();
        confirmLayer.style.visibility="hidden";
        return false;
    };

    // 调整位置，给reflow一点儿时间
    setTimeout(function () {
        var width = confirmLayer.clientWidth,
            height = confirmLayer.clientHeight,
            scrolledtop = document.documentElement.scrollTop || document.body.scrollTop;
        confirmLayer.style.left = Math.max(0,(T.browser.viewport.width - width)) / 2 + 'px';
        confirmLayer.style.top = scrolledtop + Math.max(0,(T.browser.viewport.height - height)) / 2 + 'px';
        confirmLayer.style.visibility = "visible"; // show auth layer
    },0);
}
module('加载');
test('同步加载', 4, function () {
    ok(T,'T 已被赋值');
    ok(QQWB,'QQWB 已被赋值');
    strictEqual(T,QQWB,'QQWB和T指向相同的内存');
    deepEqual(T.envs,{
                      debug:false,
                      loglevel:20,
                      crossdomainmethod:'auto',
                      cookiedomain:'',
                      cookiepath:'',
                      autoboot: false
                     },'同步加载环境变量解析');
    syncedT = T;
});

asyncTest('异步加载', 3, function () {

    onOpenjsLoad = function (t) {
        ok(t,'异步加载传入T对象');
        notEqual(t,syncedT,'异步加载的T对象与同步加载的T对象不同');
        deepEqual(t.envs,{
                          debug:true,
                          loglevel:10,
                          crossdomainmethod:'auto',
                          cookiedomain:'',
                          cookiepath:'',
                          autoboot: false
                         },'异步加载环境变量解析');
        start();
    };

    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = '../build/openjs.js#debug=yes&logLevel=10&cookieDomain=&cookiePath=&autoboot=false';
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'openjs'));

});

module('授权管理');
asyncTest('登录与授权', function () {
    T.init({appkey:appkey,callbackurl:'./callback.html'});
    T.tokenReady(function () {
        if (!T.loginStatus()) {
            requireConfirm("授权管理测试模块将弹出授权窗口，请选择同意", function () {
                T.login(function (loginstatus) {
                    expect(4);
                    ok(loginstatus,'当前页面是未登录状态，调用T.login请求用户对应用授权，执行授权成功的回调函数');
                    ok(loginstatus.name,'微博名存在[' + loginstatus.name + ']');
                    ok(loginstatus.nick,'微博昵称存在[' + loginstatus.nick + ']');
                    ok(loginstatus.openid,'openid存在[' + loginstatus.openid + ']');
                    start();
                },function () {
                    expect(1);
                    ok(true,'当前页面是未登录状态，调用T.login请求用户对应用授权，但被用户拒绝，执行授权失败的回调函数');
                    start();
                });
            }, function () {
                expect(1);
                ok(false,'您拒绝了弹出授权窗口，此项测试无法继续进行');
                start();
            });
        } else {
            T.login(function (loginstatus) {
                expect(4);
                ok(loginstatus,'当前页面是已登录状态，调用T.login请求用户对应用授权，视为用户已授权，直接执行授权成功后回调函数');
                ok(loginstatus.name,'微博名存在[' + loginstatus.name + ']');
                ok(loginstatus.nick,'微博昵称存在[' + loginstatus.nick + ']');
                ok(loginstatus.openid,'openid存在[' + loginstatus.openid + ']');
                start();
            });
        }
    });
});

asyncTest('登出',function () {
    T.init({appkey:appkey,callbackurl:'./callback.html'});
    T.tokenReady(function () {
        expect(2);
        if (T.loginStatus()) {
            T.logout();
            ok(!T.loginStatus(),'当前页面是已登录状态，调用T.logout正常登出');
        } else {
            ok(!T.loginStatus(),'当前页面是未登录状态，调用T.logout不做操作，视为正常登出');
        }
        T.logout(function () {
            ok(true,'执行登出成功的回调函数');
        });
        start();
    });
});

module('凭据管理');
asyncTest('交换token', function () {
    T.init({appkey:appkey,callbackurl:'./callback.html'});
	var refreshToken = T._token.getRefreshToken();
	if (refreshToken) {
		T._token.exchangeForToken(function () {
			var refreshTokenExchanged = T._token.getRefreshToken();
			expect(2);
			ok(true,'交换token回调函数被执行');
			notEqual(refreshToken,refreshTokenExchanged,'凭refreshtoken交换accesstoken成功');
			start();
		});
	} else {
		//TODO: 报错时服务器不支持jsonp的回调，等待服务器支持
		T._token.exchangeForToken(function () {
			expect(2);
			ok(true,'交换token回调函数被执行');
			ok(true,'因refreshtoken不存在，交换token失败');
			start();
		});
	}
});

module('获取微博数据');
asyncTest('广播大厅前20条，返回JSON对象，GET方式', function () {
    T.init({appkey:appkey,callbackurl:'./callback.html'});
    T.api('statuses/public_timeline',{reqnum:20})
     .success(function (data) {
         expect(3);
         ok(data,'获取数据成功');
         equal(Object.prototype.toString.call(data),'[object Object]','数据为JSON对象');
         equal(data.data.pos,20,'共20条');
     })
     .error(function (code,message) {
         expect(1);
         ok(false,'获取数据失败[' + code + ',' + message + ']');
     })
     .complete(function () {
         start();
     });
});
asyncTest('广播大厅前20条，返回JSON对象，POST方式', function () {
    T.init({appkey:appkey,callbackurl:'./callback.html'});
    T.api('statuses/public_timeline',{reqnum:20},'json','post')
     .success(function (data) {
         expect(3);
         ok(data,'获取数据成功');
         equal(Object.prototype.toString.call(data),'[object Object]','数据为JSON对象');
         equal(data.data.pos,20,'共20条');
     })
     .error(function (code,message) {
         expect(1);
         ok(false,'获取数据失败[' + code + ',' + message + ']');
     })
     .complete(function () {
         start();
     });
});
asyncTest('广播大厅前20条，XML格式', function () {
    T.init({appkey:appkey,callbackurl:'./callback.html'});
    T.api('statuses/public_timeline',{reqnum:20},'xml')
     .success(function (data) {
         expect(3);
         ok(data,'获取数据成功');
         equal(data.nodeType,9,'数据为XML对象');
         equal(data.getElementsByTagName('pos')[0].firstChild.nodeValue,'20','共20条');
     })
     .error(function (code,message) {
         expect(1);
         ok(false,'获取数据失败[' + code + ',' + message + ']');
     })
     .complete(function () {
         start();
     });
});
asyncTest('广播大厅前20条，纯文本格式', function () {
    T.init({appkey:appkey,callbackurl:'./callback.html'});
    T.api('statuses/public_timeline',{reqnum:20},'text')
     .success(function (data) {
         expect(3);
         ok(data,'获取数据成功');
         equal(Object.prototype.toString.call(data),'[object String]','数据为纯字符串');
         ok(/"pos":20/.test(data),'共20条');
     })
     .error(function (code,message) {
         expect(1);
         ok(false,'获取数据失败[' + code + ',' + message + ']');
     })
     .complete(function () {
         start();
     });
});
asyncTest('用户资料', function () {
    T.init({appkey:appkey,callbackurl:'./callback.html'});
    var main = function () {
        T.api('user/info')
         .success(function (data) {
             expect(1);
             ok(data,'已获取用户资料');
         })
         .error(function (code,message) {
             expect(1);
             ok(false,"未能获取用户资料[" + code + ',' + message + ']');
         })
         .complete(function () {
             start();
         });
    }, refuse = function () {
        expect(1);
        ok(false,'您拒绝了授权，无法获取资料');
        start();
    };

    T.tokenReady(function () {
        if (!T.loginStatus()) {
            requireConfirm("获取个人资料测试模块将弹出授权窗口，请选择同意", function () {
                T.login(main, refuse);
            }, function () {
                expect(1);
                ok(false,'您拒绝了弹出授权窗口，此项测试无法继续进行');
                start();
            });
        } else {
            main();
        }
    });
});
module("事件");
asyncTest('tokenReady', function () {
    expect(1);
    T.init({appkey:appkey,callbackurl:'./callback.html'});
    T.tokenReady(function () {
        ok(true,'回调函数被调用');
        start();
    });
});
asyncTest('documentReady', function () {
    expect(1);
    T.documentReady(function () {
        ok(true,'回调函数被调用');
        start();
    });
});
asyncTest('ready', function () {
    expect(1);
    T.init({appkey:appkey,callbackurl:'./callback.html'});
    T.ready(function () {
        ok(true,'回调函数被调用');
        start();
    });
});
test('bind,trigger', function () {
    expect(6); // trigger两次应有6次响应
    var handler = function (arg0,arg1) {
        ok(true,"事件被触发");
        equal(arg0,'hello',"参数0为hello");
        equal(arg1,'world',"参数1为world");
    };
    T.bind("TEST_EVT_0", handler);
    T.trigger("TEST_EVT_0",'hello','world');
    T.trigger("TEST_EVT_0",'hello','world');
});
test('unbind', function () {
    expect(1);// 已解除绑定，不应该有输出
    ok(true,'');
    var handler = function () {
        ok(false,'不能解除绑定');
    };
    T.bind("TEST_EVT_1", handler);
    T.unbind("TEST_EVT_1", handler);
    T.trigger("TEST_EVT_1",'hello','world');
});
test('once', function () {
    expect(3);// 第一次trigger应触发，第二次不应触发
    var handler = function (arg0,arg1) {
        ok(true,"事件被触发");
        equal(arg0,'hello',"参数0为hello");
        equal(arg1,'world',"参数1为world");
    };
    T.once("TEST_EVT_2", handler);
    T.trigger("TEST_EVT_2",'hello','world');
    T.trigger("TEST_EVT_2",'hello','world');
    T.trigger("TEST_EVT_2",'hello','world');
});
module('扩展功能');
test('本地存储(localStorage)', function () {
    if(T.localStorage) {
        expect(2);
        T.localStorage.set("TEST_LOCALSTORAGE_0", {x:'hello',y:'world'},7);
        deepEqual(T.localStorage.get('TEST_LOCALSTORAGE_0'),{x:'hello',y:'world'},'写入与读取本地存储');
        T.localStorage.del("TEST_LOCALSTORAGE_0");
        equal(T.localStorage.get('TEST_LOCALSTORAGE_0'),null,'删除本地存储');
    } else {
        ok(true, '不支持本地存储');
    }
});
test('浏览器检测',7,function () {
    var b=T.browser;
    ok(b,'browser对象可用');
    ok(b.os,'操作系统类型');
    ok(b.version,'浏览器版本');
    ok(b.engine,'浏览器内核');
    ok(b.platform,'平台检测模块');
    ok(b.feature,'特性检测模块');
    ok(b.rendererMode,'渲染模式');
});
test('模板', 1, function () {
var table = T.template("mytable");
table.add('<% for(var i=0,l=data.length; i<l; i++) {  %>')
     .add('<% var name= data[i][0],score=data[i][1],highlight= i%2==0; %>')
     .add('<tr style="background:<%=highlight ? \"red\" : \"green\" %>;">')
     .add('<td><%=name%></td><td><%=score%></td>')
     .add('</tr>')
     .add('<% } %>')
   .wrapTag('tbody','table')
   .data('data',[["张三",90],["李四",85],["王五",80],["柳六",100]]);
equal(table.render(),'<tbody><table><tr style=\"background:red;\"><td>张三</td><td>90</td></tr><tr style=\"background:green;\"><td>李四</td><td>85</td></tr><tr style=\"background:red;\"><td>王五</td><td>80</td></tr><tr style=\"background:green;\"><td>柳六</td><td>100</td></tr></tbody></table>','模板渲染');
});
