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
        startZIndex: 1000,
        margin: {
			top:60,right:10,bottom:10,left:10
		}
	};

	function WidgetWindow(width, height) {
		var wrapperContainer, contentContainer, closeBtn, that=this;
		this.width = width || widgetWindowConfig.defaultWidth;
		this.height = height || widgetWindowConfig.defaultHeight;
		this.wid = 'openjs_widget_' + _.uid(5);
		this.wzIndex = widgetWindowConfig.startZIndex ++;
		this.containerIsVisible = false;

		this.widgetContainer = _d.createElement('div', {
			id: this.wid,
			style: 'position:absolute;padding:'+ widgetWindowConfig.padding +'px;overflow:hidden;z-index:' + this.wzIndex + ';'+ ((_br.msie && _br.version < 9) ? 'filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr="#4c000000", EndColorStr="#4c000000");' : 'background-color:rgba(0,0,0,.3);') + 'border-radius:' + widgetWindowConfig.borderRadius + 'px;'
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
		this.widgetContainer.appendChild(wrapperContainer);
	}

	WidgetWindow.prototype = {
		setWidth: function (width) {
			this.width = width;
			this.reflow();
			this.repaint();
		},
		setContentWidth: function (width) {
			this.width = width + widgetWindowConfig.margin.left + widgetWindowConfig.margin.right;
			this.reflow();
			this.repaint();
		},
		setHeight: function (height) {
			this.height = height;
			this.reflow();
			this.repaint();
		},
		setContentHeight: function (height) {
			this.height = height + widgetWindowConfig.margin.top + widgetWindowConfig.margin.bottom;
			this.reflow();
			this.repaint();
		},
		setDimension: function (width, height) {
			this.width = width;
			this.height = height;
			this.reflow();
			this.repaint();
		},
		setContentDimension: function (width, height) {
			var w = width + widgetWindowConfig.margin.left + widgetWindowConfig.margin.right;
			var h = height + widgetWindowConfig.margin.top + widgetWindowConfig.margin.bottom;
			this.setDimension(w,h);
		},
		reflow: function () {
			var widgetContainer = this.widgetContainer;
			var contentContainer = this.getContainer();
			var w = this.width;
			var h = this.height;
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
		repaint: function () {
			var container = this.getContainer();
			container.style.visibility = 'hidden';
			container.style.visibility = 'visible';
		},
		show: function () {
			var container = this.widgetContainer;
			this.reflow();
			container.style.display = "block";
			this.repaint();
			if (_.find('#' + this.wid).length < 1) {
				document.body.appendChild(container);
			}
			this.containerIsVisible = true;
		},
		hide: function () {
			var container = this.widgetContainer;
			container.style.display = "none";
			this.containerIsVisible = false;
		},
		remove: function () {
			var container = this.widgetContainer;
			if (container.parentNode) {
                container.parentNode.removeChild(container);
			}
			this.containerIsVisible = false;
		},
		isAlive: function () {
            return T.find('#' + this.wid).length > 0;
		},
		isVisible: function () {
			return this.isAlive() && this.containerIsVisible;
		},
		getContainer: function () {
			return this.widgetContainer.firstChild.childNodes[3];
		},
		getContentDimension: function () {
			return {
				width: this.width -  widgetWindowConfig.margin.left - widgetWindowConfig.margin.right,
				height: this.height - widgetWindowConfig.margin.top - widgetWindowConfig.margin.bottom 
			};
		},
		getDimension: function () {
			return {
				width: this.width,
				height: this.height,
				outerWidth: this.width +  widgetWindowConfig.padding * 2,
				outerHeight: this.height +  widgetWindowConfig.padding * 2
			};
		},
		close: function () {
			this.remove();
		},
		onCloseButtonClicked: function (handler) {
			this.closeHandler = handler;
		},
		setTopMost: function () {
			if (this.isAlive()) this.widgetContainer.style.zIndex=++widgetWindowConfig.startZIndex;
		}
	};

	_.provide('widget', function (name, config, version) {

		var manifest;

		_.Array.each(manifests, function (i, v) {
			if (v.name === name) {
				if (!version || (version && v.version === version)) {
					manifest = v;
					return false;
				}
			}
		});

		if (!manifest) {
			_l.error('找不到名为[' + name + ']，版本为['+ version+ ']的挂件，挂件未注册');
			return;
		}

		if (manifest.loginRequired) { // 需要操心登录态
			_.ready( function () {
				var loginstatus = _.loginStatus();
				var loginid = 'openjs_widget_login_' + _.uid(5);
				var logoutid = 'openjs_widget_logout_' + _.uid(5);
				var widgetWindow;
				if (!loginstatus) {
					widgetWindow = new WidgetWindow(200,200);
					widgetWindow.getContainer().innerHTML = '插件需要您的腾讯微博授权, <button id="' + loginid + '">授权</button><button id="' + logoutid + '">不授权</button>';
					widgetWindow.show();
					_.find('#' + loginid)[0].onclick = function () {
						_.login(function () {
							// 移除当前授权提示窗
							widgetWindow.remove();
							// 初始化widget
							initWidget();
						});
					};
					_.find('#' + logoutid)[0].onclick = function () {
						widgetWindow.remove();
					};
					return;
				}
				// make sure is logged in
				initWidget();
			} );
		} else {// 插件自己管理
			_.documentReady(initWidget);
		}

		function initWidget() {
			var widgetWindow;
			widgetWindow = new WidgetWindow();
			manifest.main.call(widgetWindow);
			widgetWindow.show();
		}

	});


	_.extend('widget', {

		register: function (manifest) {

			var msg = '定义挂件出错,';

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
