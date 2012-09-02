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

	var widgetWindowIndex = 1000;

	function WidgetWindow(width, height) {
		this.width = width;
		this.height = height;
		this.wid = 'widget_' + _.uid(5);
		this.wzIndex = widgetWindowIndex ++;
		this.container = _d.createElement('div', {
			id: this.wid,
			style: 'position:absolute;padding:5px;overflow:hidden;visibility:hidden;z-index:' + this.wzIndex + ';background:red;' + (this.width ? ('width:' + this.width + 'px;') : '') + (this.height ? ('height:' + this.height + 'px;') : '')
		});
		this.containerIsVisible = false;
	}

	WidgetWindow.prototype = {
		setWidth: function (width) {
			this.width = width;
			this.reflow();
			this.repaint();
		},
		setHeight: function (height) {
			this.height = height;
			this.reflow();
			this.repaint();
		},
		setDimension: function (width, height) {
			this.width = width;
			this.height = height;
			this.reflow();
			this.repaint();
		},
		reflow: function () {
			var container = this.getContainer();
			var w = this.width;
			var h = this.height;
            var offsettop = document.documentElement.scrollTop || document.body.scrollTop;
			container.style.width = w + 'px';
			container.style.height = h + 'px';
            container.style.left = Math.max(0,(_br.viewport.width - w)) / 2 + 'px';
            container.style.top = offsettop + Math.max(0,(_br.viewport.height - h)) / 2 + 'px';
		},
		repaint: function () {
			var container = this.getContainer();
			container.style.visibility = 'hidden';
			container.style.visibility = 'visible';
		},
		show: function () {
			var container = this.getContainer();
			this.reflow();
			container.style.display = "block";
			this.repaint();
			if (_.find('#' + this.wid).length < 1) {
				document.body.appendChild(container);
			}
			this.containerIsVisible = true;
		},
		hide: function () {
			var container = this.getContainer();
			container.style.display = "none";
			this.containerIsVisible = false;
		},
		remove: function () {
			var container = this.getContainer();
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
			return this.container;
		},
		close: function () {
			this.remove();
		},
		setTopMost: function () {
			if (this.isAlive()) this.getContainer().style.zIndex=++widgetWindowIndex;
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
				var loginid = 'widget_login_' + _.uid(5);
				var logoutid = 'widget_logout_' + _.uid(5);
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
			widgetWindow = new WidgetWindow(200,200);
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
