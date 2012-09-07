/**
 * Tencent weibo javascript library
 *
 * @author michalliu
 * @version 1.0
 * @package ui
 * @module widget
 * @requires base
 *           core.log
 *           core.dom
 *           core.browser
 *           common.Array
 *           util.deferred
 */
(function () {

	var _ = QQWB,

		_d = _.dom,

        _br = _.browser,

        _l = _.log;

	var manifests = [];

	var widgetWindowConfig = {
		borderRadius: 10,
        padding: 10,
        defaultWidth: 200,
        defaultHeight: 200,
        startzIndex: 1000,
		bottomzIndex: 900,
        margin: {
			top:60,right:10,bottom:10,left:10
		}
	};

	function WidgetWindow(width, height) {
		var wrapperContainer, contentContainer, closeBtn, that=this;
		this._width = width || widgetWindowConfig.defaultWidth;
		this._height = height || widgetWindowConfig.defaultHeight;
		this._wid = 'openjs_widget_' + _.uid(5);
		this._wzIndex = widgetWindowConfig.startzIndex ++;
		this._containerIsVisible = false;

		this._widgetContainer = _d.createElement('div', {
			id: this._wid,
			style: 'position:absolute;padding:'+ widgetWindowConfig.padding +'px;overflow:hidden;z-index:' + this._wzIndex + ';'+ ((_br.msie && _br.version < 9) ? 'filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr="#4c000000", EndColorStr="#4c000000");' : 'background-color:rgba(0,0,0,.3);') + 'border-radius:' + widgetWindowConfig.borderRadius + 'px;'
		});

		wrapperContainer = _d.createElement('div', {
			style:'width:100%;height:100%;background:#f5f5f5;',
			innerHTML:'<div style="width:100%;height:7px;font-size:0;background:#C1DEA9 url(./images/line.png) no-repeat;"></div><div style="width:118px;height:29px;top:27px;left:27px;position:absolute;background:url(./images/logo.png) no-repeat;"></div>'
		});

		contentContainer = _d.createElement('div',{
			style: 'position:absolute;'
		});

		closeBtn = _d.createElement('a', {
			style: 'width:15px;height:15px;top:24px;right:18px;position:absolute;background:url(./images/close.png) no-repeat;display:block;',
			href: '#',
			onclick: function () {
				var closeHandler = that.closeHandler;
				if (closeHandler && typeof closeHandler == 'function' && closeHandler() === false) {
					return false;
				}
				that.close();
				return false;
			}
		});

		wrapperContainer.appendChild(closeBtn);
		wrapperContainer.appendChild(contentContainer);
		this._widgetContainer.appendChild(wrapperContainer);
	}

	WidgetWindow.prototype = {
		setWidth: function (width) {
			this._width = width;
			this._reflow();
			this._repaint();
		},
		setContentWidth: function (width) {
			this._width = width + widgetWindowConfig.margin.left + widgetWindowConfig.margin.right;
			this._reflow();
			this._repaint();
		},
		setHeight: function (height) {
			this._height = height;
			this._reflow();
			this._repaint();
		},
		setContentHeight: function (height) {
			this._height = height + widgetWindowConfig.margin.top + widgetWindowConfig.margin.bottom;
			this._reflow();
			this._repaint();
		},
		setDimension: function (width, height) {
			this._width = width;
			this._height = height;
			this._reflow();
			this._repaint();
		},
		setContentDimension: function (width, height) {
			var w = width + widgetWindowConfig.margin.left + widgetWindowConfig.margin.right;
			var h = height + widgetWindowConfig.margin.top + widgetWindowConfig.margin.bottom;
			this.setDimension(w,h);
		},
		_reflow: function () {
			var widgetContainer = this._widgetContainer;
			var contentContainer = this.getContainer();
			var w = this._width;
			var h = this._height;
            var offsettop = document.documentElement.scrollTop || document.body.scrollTop;
			contentContainer.style.width = w -  widgetWindowConfig.margin.left - widgetWindowConfig.margin.right + 'px';
			contentContainer.style.height = (h - widgetWindowConfig.margin.top - widgetWindowConfig.margin.bottom) + 'px'; 
			contentContainer.style.left = widgetWindowConfig.padding + widgetWindowConfig.margin.left + 'px';
			contentContainer.style.top = widgetWindowConfig.padding + widgetWindowConfig.margin.top + 'px';
			widgetContainer.style.width = w + 'px';
			widgetContainer.style.height = h + 'px';
            widgetContainer.style.left = Math.max(0,(_br.viewport.width - (w + widgetWindowConfig.padding * 2))) / 2 + 'px';
            widgetContainer.style.top = offsettop + Math.max(0,(_br.viewport.height - (h + widgetWindowConfig.padding * 2))) / 2 + 'px';
		},
		_repaint: function () {
			var container = this.getContainer();
			container.style.visibility = 'hidden';
			container.style.visibility = 'visible';
			this._widgetContainer.style.zIndex=this._wzIndex + '';
		},
		show: function () {
			var container = this._widgetContainer;
			this._reflow();
			container.style.display = "block";
			this._repaint();
			if (_.find('#' + this._wid).length < 1) {
				document.body.appendChild(container);
			}
			this._containerIsVisible = true;
		},
		hide: function () {
			var container = this._widgetContainer;
			container.style.display = "none";
			this._containerIsVisible = false;
		},
		_remove: function () {
			var container = this._widgetContainer;
			if (container.parentNode) {
                container.parentNode.removeChild(container);
			}
			this._containerIsVisible = false;
		},
		isAlive: function () {
            return _.find('#' + this._wid).length > 0;
		},
		isVisible: function () {
			return this.isAlive() && this._containerIsVisible;
		},
		getContainer: function () {
			return this._widgetContainer.firstChild.childNodes[3];
		},
		getDimension: function () {
			return {
				width: this._width,
				height: this._height,
				outerWidth: this._width +  widgetWindowConfig.padding * 2,
				outerHeight: this._height +  widgetWindowConfig.padding * 2
			};
		},
		getContentDimension: function () {
			return {
				width: this._width -  widgetWindowConfig.margin.left - widgetWindowConfig.margin.right,
				height: this._height - widgetWindowConfig.margin.top - widgetWindowConfig.margin.bottom 
			};
		},
		close: function () {
			this._remove();
		},
		onCloseButtonClicked: function (handler) {
			this.closeHandler = handler;
		},
		_setzIndex: function (index) {
			this._lastwzIndex = this._wzIndex;
			this._wzIndex = index;
			if (this.isAlive()) this._repaint();
		},
		setTopMost: function () {
			this._setzIndex(++widgetWindowConfig.startzIndex);
		},
		setBottomMost: function () {
			this._setzIndex(widgetWindowConfig.bottomzIndex);
		},
		restorezIndex: function () {
			this._setzIndex(this._lastwzIndex);
		}
	};

	_.provide('widget', function (name, version) {

		var manifest;

		_.Array.each(manifests, function (i, v) {
			if (v.name === name) {
				if (!version || (version && v.version === version)) {
					manifest = v;
					return false;
				}
			}
		});

		var cancelAction; // 提供用户点击取消授权的回调，返回true则关闭组件，返回false，不关闭
		var closeAction; // 提供用户点击关闭按钮后的回调
		var dataAction; // 提供插件通知进度的回调
		var exitAction;
		var errormsg;
		// 最终返回给使用者的defer对象
		var deferResult = _.deferred.deferred();
		var result = deferResult.promise({
			onCancel: function (fn) {
				cancelAction = fn;
				return result;
			},
			onClose: function (fn) {
				closeAction = fn;
				return result;
			},
			onData: function (fn) {
				dataAction = fn;
				return result;
			},
			onExit: function (fn) {
				exitAction = fn;
				return result;
			},
			onError: deferResult.fail
		});

		// 未找到插件配置文件
		if (!manifest) {
			errormsg = '找不到名为[' + name + ']' + (version ? ('版本为['+ version+ ']') : '') + '的插件，插件未注册';
			_l.error(errormsg);
			deferResult.reject(errormsg); // 执行onError,fail
			return result;
		}

		if (manifest.loginRequired) { // 需要操心登录态
			_.ready( function () {
				var loginstatus = _.loginStatus();
				var loginid = 'openjs_widget_login_' + _.uid(5);
				var logoutid = 'openjs_widget_logout_' + _.uid(5);
				var requestAuthorizeWindow, con;
				if (!loginstatus) {
					// 授权确认层
					requestAuthorizeWindow = new WidgetWindow(420,210);
					con = requestAuthorizeWindow.getContainer();
					con.innerHTML = '<p style="text-align:center;">' + manifest.name + ' 需要您的腾讯微博授权 </p><div style="width:210px;margin:0 auto;"><div style="display:block;width:85px;height:25px;background:url(./images/btns.png) no-repeat -11px -4px;cursor:hand;cursor:pointer;font-size:12px;text-align:center;line-height:25px;color:white;" href="#" id="' + loginid + '">授 权</div><div style="display:block;width:85px;height:25px;background:url(./images/btns.png) no-repeat -100px -4px;cursor:hand;cursor:pointer;font-size:12px;text-align:center;line-height:25px;margin-top:-25px;margin-left:125px;color:gray;" href="#" id="' + logoutid + '">取 消</div></div>';
					requestAuthorizeWindow.onCloseButtonClicked(function () {
						if (closeAction && typeof closeAction == 'function' && false === closeAction()) return false;
						return true;
					});
					requestAuthorizeWindow.show();
					_.find('#' + loginid)[0].onclick = function () {
						var innerauthenabled = _.bigtable.get('innerauth','enabled');
						if (innerauthenabled) {
							// 不要挡住浮层授权窗
							requestAuthorizeWindow.setBottomMost();
						}
						_.login(function () {
							// 移除当前授权提示窗
							requestAuthorizeWindow._remove();
							// 恢复原来的z轴层级
							requestAuthorizeWindow.restorezIndex();
							// 初始化widget
							initWidget();
						});
						return false;
					};
					_.find('#' + logoutid)[0].onclick = function () {
						// 执行指定的cancelAction
						if (cancelAction && typeof cancelAction == 'function' && false === cancelAction()) return false;
						requestAuthorizeWindow._remove();
						return false;
					};
					return;
				}
				//
				initWidget();
			} );
		} else {// 插件自己管理
			_.documentReady(initWidget);
		}

		function initWidget() {
			var instanceWindow, undef, jqueryReady, jqueryObject;
			instanceWindow = new WidgetWindow(320,130);
			instanceWindow.getContainer().style.background='url(./images/loading.gif) no-repeat 50% 50%';
			// 由组件通知已准备好绘制，隐藏loading动画
			instanceWindow.ready = function () {
				instanceWindow.getContainer().style.background='';
			};
			// 由组件通知进度事件，用户接收
			instanceWindow.sendData = function () {
				if (dataAction && typeof dataAction == 'function') {
					dataAction.apply(window,arguments);
				}
			};
			// 由组件通知结束事件，用户接收
			instanceWindow.sendFinalData = function () {
				if (exitAction && typeof exitAction == 'function') {
					exitAction.apply(window,arguments);
				}
			};
			// 显示loading
			instanceWindow.show();

			function executeMain() {
				// 屏蔽掉组件不应该访问的内部方法
				manifest.main.call(instanceWindow, jqueryObject);
				// 插件未调用show，帮它调用一下
				if (!instanceWindow.isVisible()) instanceWindow.show();
				deferResult.resolve(); // 执行success,complete
			}

			if (manifest.css || manifest.jquery) {
				if (manifest.jquery) {
					jqueryReady = _.deferred.deferred();
					_.bind('jQueryLoaded', function (jquery) {
						jqueryObject = jquery;
						jqueryReady.resolve();
					});
				}
				_.task(
					(manifest.css ? _.loadStyle({url: manifest.css}): 1),
					(manifest.jquery ? _.script({url: "./js/jquery-1.8.1.js"}) : 1),
					(jqueryReady ? jqueryReady : 1)
				).success(executeMain).error(function (code, message) {
					errormsg = '插件[' + manifest.name + '存在错误]，请检查manifest中css,jquery的设置，详细错误信息：' + message;
					_l.error(errormsg);
					deferResult.reject(errormsg); // 执行onError,fail
				});
			} else {
				executeMain();
			}
		}

		return result;

	});


	_.extend('widget', {

		register: function (manifest) {

			var msg = '定义插件出错,';

			if (!manifest.hasOwnProperty('name')) {

				msg += '必须包含name属性';

				throw new Error(msg);

			} else if (!manifest.hasOwnProperty('version')) {

				msg += '必须包含version属性';

				throw new Error(msg);
			}
			
			// 组件未明确指明需要登录，则默认为不需要登录
			if (!manifest.hasOwnProperty('loginRequired')) {

				manifest.loginRequired = false;

			}

			// manifest is valid
			manifests.push(manifest);

		},

		/**
		 * 获取已注册的插件列表
		 */
		all: function () {

			return _.Array.forEach(manifests, function (v, i) {

				return [v.name,v.version].join(',');

			});

		}
	});

}());
