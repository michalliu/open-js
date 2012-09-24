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
/*global QQWB,window,document*/
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

	var basehost = 'http://mat1.gtimg.com/app/openjs/widget/static/base';

	function WidgetWindow(width, height, inElement, style) {
		var wrapperContainer, closeBtn, that=this;
		this._width = width || widgetWindowConfig.defaultWidth;
		this._height = height || widgetWindowConfig.defaultHeight;
		this._wid = 'openjs_widget_' + _.uid(5);
		this._wzIndex = widgetWindowConfig.startzIndex ++;
		this._containerIsVisible = false;
		this._hasParent = !!inElement; // 嵌入到已知的domElement

		// 如果给定的节点是document.body,我们在新创建的标签中渲染，而不污染body本身的样式
		if (inElement && inElement.nodeName === 'BODY') {
			inElement = _d.createElement('div');
		}

		this._widgetContainer = inElement || _d.createElement('div', {
			id: this._wid,
			style: 'position:absolute;padding:'+ widgetWindowConfig.padding +'px;overflow:hidden;z-index:' + this._wzIndex + ';'+ ((_br.msie && _br.version < 9) ? 'filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr="#4c000000", EndColorStr="#4c000000");' : 'background-color:rgba(0,0,0,.3);') + 'border-radius:' + widgetWindowConfig.borderRadius + 'px;'
		});

		this._contentContainer = _d.createElement('div',{
			style: 'position:absolute;'
		});

		if (inElement) {

			inElement.id = this._wid; // inElement存在时让isalive方法正常工作
			inElement.style.position = 'relative'; // 让子元素可以正常定位
			inElement.style.overflow = 'hidden'; // 让子元素可以正常定位

			wrapperContainer = _d.createElement('div', {
				style:'width:100%;height:100%;'+ (style ? style : 'background:#f5f5f5;')
			});

		} else {

			wrapperContainer = _d.createElement('div', {
				style:'width:100%;height:100%;' + (style ? style : 'background:#f5f5f5;'),
				innerHTML:'<div style="width:100%;height:7px;font-size:0;background:#C1DEA9 url(' + basehost +'/images/line.png) no-repeat;"></div><div style="width:118px;height:29px;top:27px;left:27px;position:absolute;background:url(' + basehost + '/images/logo.png) no-repeat;"></div>'
			});


			closeBtn = _d.createElement('a', {
				style: 'width:15px;height:15px;top:24px;right:18px;position:absolute;background:url(' + basehost + '/images/close.png) no-repeat;display:block;',
				href: '#',
				onclick: function () {
					var closeHandler = that.closeHandler;
					if (closeHandler && typeof closeHandler === 'function' && closeHandler() === false) {
						return false;
					}
					that.close();
					return false;
				}
			});

			wrapperContainer.appendChild(closeBtn);
		}

		wrapperContainer.appendChild(this._contentContainer);
		this._widgetContainer.appendChild(wrapperContainer);
	}

	WidgetWindow.prototype = {
		setWidth: function (width) {
			this._width = width;
			this._reflow();
			this._repaint();
		},
		setContentWidth: function (width) {
			if (this._hasParent) {
				this.setWidth(width);
			} else {
				this.setWidth(width + widgetWindowConfig.margin.left + widgetWindowConfig.margin.right);
			}
		},
		setHeight: function (height) {
			this._height = height;
			this._reflow();
			this._repaint();
		},
		setContentHeight: function (height) {
			if (this._hasParent) {
				this.setHeight(height);
			} else {
				this.setHeight(height + widgetWindowConfig.margin.top + widgetWindowConfig.margin.bottom);
			}
		},
		setDimension: function (width, height) {
			this._width = width;
			this._height = height;
			this._reflow();
			this._repaint();
		},
		setContentDimension: function (width, height) {
			if (this._hasParent) {
				this.setDimension(width,height);
			} else {
				this.setDimension(width + widgetWindowConfig.margin.left + widgetWindowConfig.margin.right, height + widgetWindowConfig.margin.top + widgetWindowConfig.margin.bottom);
			}
		},
		_reflow: function () {
			var widgetContainer = this._widgetContainer;
			var contentContainer = this.getContainer();
			var w = this._width;
			var h = this._height;

			widgetContainer.style.width = w + 'px';
			widgetContainer.style.height = h + 'px';

			if (!this._hasParent) {
				var offsettop = document.documentElement.scrollTop || document.body.scrollTop;
				// 内容区域在主容器中定位
				contentContainer.style.width = (w -  widgetWindowConfig.margin.left - widgetWindowConfig.margin.right) + 'px';
				contentContainer.style.height = (h - widgetWindowConfig.margin.top - widgetWindowConfig.margin.bottom) + 'px';
				contentContainer.style.left = widgetWindowConfig.padding + widgetWindowConfig.margin.left + 'px';
				contentContainer.style.top = widgetWindowConfig.padding + widgetWindowConfig.margin.top + 'px';
				// 此处widgetContainer为绝对定位
				widgetContainer.style.left = Math.max(0,(_br.viewport.width - (w + widgetWindowConfig.padding * 2))) / 2 + 'px';
				widgetContainer.style.top = offsettop + Math.max(0,(_br.viewport.height - (h + widgetWindowConfig.padding * 2))) / 2 + 'px';
			} else {
				//contentContainer.style.width = w + 'px';
				//contentContainer.style.height = h + 'px';
				contentContainer.style.width = '100%';
				contentContainer.style.height = '100%';
			}
		},
		_repaint: function () {
			var container = this.getContainer();
			container.style.visibility = 'hidden';
			container.style.visibility = 'visible';
			if (!this._hasParent) this._widgetContainer.style.zIndex=this._wzIndex + '';
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
			// document.body不能被移除，理论上可以，但要防止这种情况，只移除wrapper
			// widgetWindow里面已经对document.body做了保护，出于历史原因保留这段代码
			if (container.nodeName === 'BODY') {
				document.body.removeChild(this.getContainer().parentNode);
				container.removeAttribute('id');
			} else if (container.parentNode) {
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
			return this._contentContainer;
		},
		getDimension: function () {
			return !this._hasParent ? {
				width: this._width,
				height: this._height,
				outerWidth: this._width +  widgetWindowConfig.padding * 2,
				outerHeight: this._height +  widgetWindowConfig.padding * 2
			} : {
				width: this._width,
				height: this._height,
				outerWidth: this._width,
				outerHeight: this._height
			};
		},
		getContentDimension: function () {
			return !this._hasParent ? {
				width: this._width -  widgetWindowConfig.margin.left - widgetWindowConfig.margin.right,
				height: this._height - widgetWindowConfig.margin.top - widgetWindowConfig.margin.bottom
			} : {
				width: this._width,
				height: this._height
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
		var successAction; // 提供插件通知成功的回调
		var errorAction; // 提供插件通知出错的回调
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
			onSuccess: function (fn) {
				successAction = fn;
				return result;
			},
			onError: function (fn) {
				errorAction = fn;
				return result;
			},
			show: function (element) {
				var selectedElement;
				if (!element) {
					showWidget();
				} else if (element && element.nodeType) {
					showWidget(element);
				} else if (typeof element === 'string') {
					selectedElement = _d.find(element);
					if (selectedElement.length > 0 && selectedElement[0] && selectedElement[0].nodeType) {
						showWidget(selectedElement[0]);
					}
				}
				return result;
			}
		});

		// 初始化组件
		// inElement 绘制到指定的元素
		function initWidget(inElement, width, height) {
			var instanceWindow, jqueryReady, jqueryObject;
			if (!inElement) { // 弹出层的方式初始化组件
				width = width || 320; // 与授权窗的大小保持，美观一些
				height = height || 130;
				instanceWindow = new WidgetWindow(width,height,inElement);// inElement 指定组件绘制到指定的元素
			} else { // 绘制组件到指定的节点
				width = width || 160; // 为展示loading图
				height = height || 30;
				// loading图样式改变
				instanceWindow = new WidgetWindow(width,height,inElement, "background:white;");// inElement 指定组件绘制到指定的元素
			}
			instanceWindow.getContainer().style.background='url(' + basehost + '/images/loading.gif) no-repeat 50% 50%';
			// 由组件通知已准备好绘制，隐藏loading动画
			instanceWindow.ready = function () {
				instanceWindow.getContainer().style.background='';
			};
			// 由组件通知进度事件，用户接收
			instanceWindow.sendData = function () {
				if (dataAction && typeof dataAction === 'function') {
					dataAction.apply(window,arguments);
				}
			};
			// 由组件通知成功事件，用户接收
			instanceWindow.sendSuccessData = function () {
				if (successAction && typeof successAction === 'function') {
					successAction.apply(window,arguments);
				}
			};
			// 由组件通知失败事件，用户接收
			instanceWindow.sendErrorData = function () {
				if (errorAction && typeof errorAction === 'function') {
					errorAction.apply(window,arguments);
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
					(manifest.jquery ? _.script({url: basehost + "/js/jquery.js"}) : 1),
					(jqueryReady ? jqueryReady : 1)
				).success(executeMain).error(function (code, message) {
					errormsg = '插件[' + name + ']' + (version ? ('版本为['+ version+ ']') : '') +  ']存在错误，请联系插件作者检查manifest中css,jquery的设置，详细错误信息：' + message;
					_l.error(errormsg);
					deferResult.reject(errormsg); // 执行fail
					if (errorAction && typeof errorAction === 'function') { // 执行onError
						errorAction.apply(window,[errormsg]);
					}
				});
			} else {
				executeMain();
			}
		}

		// 显示组件
		// inElement 指定时绘制到指定的元素，否则绘制到弹出的浮层上
		function showWidget(inElement) {
			if (manifest.loginRequired) { // 需要操心登录态
				_.ready( function () {
					var loginstatus = _.loginStatus();
					var loginid = 'openjs_widget_login_' + _.uid(5);
					var logoutid = 'openjs_widget_logout_' + _.uid(5);
					var requestAuthorizeWindow, con;
					if (!loginstatus) {
						// 授权确认层
						// inElement 指定组件绘制到指定的元素
						requestAuthorizeWindow = new WidgetWindow(inElement ? 220 : 420, inElement ? 100 : 210,inElement);

						// 浮层授权的体验
						// requestAuthorizeWindow = new WidgetWindow(420, 210);
						con = requestAuthorizeWindow.getContainer();
						con.innerHTML = '<div style="text-align:center;font-family:MicrosoftYaHei,SimSun;font-size:14px;margin:20px 0px;">' + manifest.name + ' 需要您的腾讯微博授权 </div><div style="width:210px;margin:0 auto;"><div style="display:block;width:85px;height:25px;background:url(' + basehost + '/images/btns.png) no-repeat -11px -4px;cursor:hand;cursor:pointer;font-size:12px;text-align:center;line-height:25px;color:white;" href="#" id="' + loginid + '">授 权</div><div style="display:block;width:85px;height:25px;background:url(' + basehost + '/images/btns.png) no-repeat -100px -4px;cursor:hand;cursor:pointer;font-size:12px;text-align:center;line-height:25px;margin-top:-25px;margin-left:125px;color:gray;" href="#" id="' + logoutid + '">取 消</div></div>';
						requestAuthorizeWindow.onCloseButtonClicked(function () {
							if (closeAction && typeof closeAction === 'function' && false === closeAction()) return false;
							return true;
						});
						requestAuthorizeWindow.show();
						_.find('#' + loginid)[0].onclick = function () {
							var innerauthenabled = _.bigtable.get('innerauth','enabled');
							if (innerauthenabled) {
								// 不要挡住浮层授权窗
								requestAuthorizeWindow.setBottomMost(); // 在指定元素绘制时不做操作
							}
							_.login(function () {
								// 移除当前授权提示窗
								requestAuthorizeWindow._remove();
								// 恢复原来的z轴层级
								requestAuthorizeWindow.restorezIndex(); // 在指定元素绘制时不做操作
								// 初始化widget
								initWidget(inElement, manifest.width, manifest.height); // 绘制到指定元素
							});
							return false;
						};
						_.find('#' + logoutid)[0].onclick = function () {
							// 执行指定的cancelAction
							if (cancelAction && typeof cancelAction === 'function' && false === cancelAction()) return false;
							requestAuthorizeWindow._remove();
							return false;
						};
						return;
					}
					//
					initWidget(inElement, manifest.width, manifest.height); // 绘制到指定元素
				});
	
			} else {// 插件自己管理
	
				_.documentReady(function () {
					initWidget(inElement, manifest.width, manifest.height);
				});
	
			}

		}

		// 未找到插件配置文件
		if (!manifest) {
			errormsg = '找不到名为[' + name + ']' + (version ? ('版本为['+ version+ ']') : '') + '的插件，插件未注册';
			_l.error(errormsg);
			deferResult.reject(errormsg); // 执行fail
			if (errorAction && typeof errorAction === 'function') { // 执行onError
				errorAction.apply(window,[errormsg]);
			}
			return result;
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

			return _.Array.forEach(manifests, function (v) {

				return [v.name,v.version].join(',');

			});

		}
	});

}());
