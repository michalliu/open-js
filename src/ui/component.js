/**
 * Tencent weibo javascript library
 *
 * Use
 *
 * Example:
 *
 * T.man("/Statuses/home_timeline");
 *
 * @author michalliu
 * @version 1.0
 * @package ui
 * @module component
 * @requires base
 *           util.bigtable
 *           core.dom
 *           core.log
 *           util.queryString
 *           common.String
 *           common.Array
 *
 * @includes common.Object
 */

(function () {

	var _ = QQWB,

	    _b = _.bigtable,

	    _d = _.dom,

		_l = _.log,

		_q = _.queryString,

		_s = _.String,

        _a = _.Array,

		components,

		getComponentByName,

	    proto,


	components = [
		{
			name: "微评论",

			allowuse: true,

			create: function (cfg) {

				var msg,

				    frame,

				    url = "http://comment.v.t.qq.com",

					qurl = location.href,

					props = {};

				if (!cfg.appkey) {

					msg = "创建" + this.name + "组件失败，缺少Appkey";

		    		_l.error(msg);

					throw new Error(msg);
				}

				// remove location.search
				/*
				if (location.search) {

					qurl = qurl.replace(location.search, "");

				}*/

				// remove location.hash
				if (location.hash) {

					qurl = qurl.replace(location.hash, "");

				}

				// url
				qurl = encodeURIComponent(qurl);

				_.extend(props, {

					src: [url, "?", _q.encode({appkey: cfg.appkey, url: qurl})].join(""),

					width: cfg.width || 560,

					height: cfg.height || 500,

					frameborder: 0,

					scrolling: "yes",

					allowtransparency: "true"

				});

				frame = _d.createElement("iframe", props);

				return frame;

			}
		}
	];

	proto = {

		// configuration
		dimension: function (width, height) {

			if (typeof width == "object") {

				_.extend(this.config, width, true);

			} else {

				_.extend(this.config, {

					width: width,

					height: height

				}, true);
			}

			return this;

		},

		// width
		width: function (width) {

			_.extend(this.config, { width : width }, true);

			return this;
		},

		// height
		height: function (height) {

			_.extend(this.config, { height : height }, true);

			return this;
		},

		// expect an array
		colors: function (colors) {

			if (_s.isString(colors)) {

				colors = _a.fromArguments(arguments);

			}

			if (_a.isArray(colors)) {

			    _.extend(this.config, { "colors" : colors }, true);

			} else {

				_l.error("component set colors error, expect an array");
			}

			return this;
		},

		// style
		style: function (styleName) {

			_.extend(this.config, {

				style: styleName

			}, true);

			return this;
		},

		// appkey
		appkey: function (appkey) {

			_.extend(this.config, {

				appkey: appkey

			}, true);

			return this;

		},

		// configuration
		config: function (cfg) {

			_.extend(this.config, cfg, true);

			return this;

		},

		// render component to element
		renderInto: function (element) {

			var that = this,

			    msg;

			// render component common process
			function renderComponent() {

				var create,

				    comp,

					c;

				comp = getComponentByName(that.name);

				if (!comp.hasOwnProperty('create')) {

					msg = "创建" + that.name + "组件失败，未定义create方法";

		    		_l.error(msg);

		    		throw new Error(msg);

				}

		    	c = comp.create(that.config);

		    	if (typeof c != "undefined" && c.nodeType == 1) {

		    	    element.appendChild(c);

		    	} else if (_s.isString(c)) {

		    		element.innerHTML = c;

		    	} else {

					msg = "创建" + that.name + "组件失败";

		    		_l.error(msg);

		    		throw new Error(msg);

		    	}

			}

			// node exists
			if (element.nodeType == 1) {

				 renderComponent();

		    // find node
			} else if (_s.isString(element)) {

				_.dom.ready(function () {

			    	element = _.dom.find(element);

			    	if (element.length > 0) {

			    		element = element[0];

						renderComponent();

			    	} else {

						msg = "加载" + that.name + "组件失败，未找到父元素";

			    	    _l.error(msg);

		    		    throw new Error(msg);

			    	}
				});

			// unexpected behavior
			} else {

				msg = "加载" + that.name + "组件失败，无效的父元素" + element;

			    _l.error(msg);

		        throw new Error(msg);
			}

		},

		// render
		render: function () {

			var o,

			    that = this;

			_d.ready( function () {

			    var o = document.getElementById("qqwb_root")

				that.renderInto(o);
			});
		}
		
	};

	getComponentByName = function getComponentByName(name) {

		var c;

		_a.each(components, function (i, v) {

			if (v.name == name) {

				c = v;

				return false;
			}

		});

		return c;
	};

	// component method
    _.provide("component", function (name, optConfig) {
    
		var _ = QQWB,

		    _s = _.String,

			_o = _.Object,

			_l = _.log,

			conf,

			msg,
			
			o;

		name = _s.trim(name);

		conf = getComponentByName(name);

		if (!conf) {

			msg = "无法使用组件" + name + "，该组件不存在";

			_l.error(msg);

			throw new Error(msg);

		} else if (!conf.allowuse) {

			msg = "无法使用组件" + name + "，暂不支持该组件";

			_l.error(msg);

			throw new Error(msg);
		}

		o = _.Object.create(proto);

		o.name = name;

		if (optConfig) {

			o.config = optConfig;

		} else {

		    o.config = {};

		}

    	return o;

    });

}());
