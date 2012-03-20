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

		components = [],

		getComponentByName,

	    proto,

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
		renderInto: function (context) {

			var that = this,

		    	msg,

				_context = context,

		    	renderComponent;

			// render component common process
			function renderComponent(root) {

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

		    	    root.appendChild(c);

		    	} else if (_s.isString(c)) {

		    		root.innerHTML = c;

		    	} else {

					msg = "创建" + that.name + "组件失败，无法处理的create方法返回结果";

		    		_l.error(msg);

		    		throw new Error(msg);

		    	}

			}

			if (context && context.nodeType == 1) {

				 renderComponent(context);

			} else if (_s.isString(context)) {

				_.dom.ready(function () {

			    	context = _.dom.find(_context);

			    	if (context.length > 0) {

			    		context = context[0];

						renderComponent(context);

			    	} else {

						msg = "加载" + that.name + "组件失败，未找到节点" + _context;

			    	    _l.error(msg);

		    		    throw new Error(msg);

			    	}
				});

			// unexpected behavior
			} else {

				msg = "加载" + that.name + "组件失败，无效的节点" + context;

			    _l.error(msg);

		        throw new Error(msg);
			}

		},

		// render
		render: function () {

			var o,

			    msg,

			    that = this,

				comp = getComponentByName(that.name);

			_d.ready( function () {

			    var o = document.getElementById(comp.idname)

				if (o && o.nodeType == 1) {

				    that.renderInto(o);

				} else {

					msg = ['未找到',comp.name,'节点',comp.idname].join("");

				    _l.error(msg);

					throw new Error(msg);
				}

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

	// 定义组件
	_.extend('component', {

		defineComponent: function (componentAttr) {

			var err = '定义组件错误，',

			    c,

			    msg;

			if (!componentAttr.hasOwnProperty('name')) {

				msg = err + "必须为组件指定名称";

				_l.error(msg);

				throw new Error(msg);

			} else if(!componentAttr.hasOwnProperty('create')) {

				msg = err + "必须实现创建组件逻辑create方法";

				_l.error(msg);

				throw new Error(msg);

			} else if(!componentAttr.hasOwnProperty('idname')) {

				msg = err + "缺少idname";

				_l.error(msg);

				throw new Error(msg);

			} else if(!componentAttr.hasOwnProperty('version')) {

				msg = err + "缺少version";

				_l.error(msg);

				throw new Error(msg);
			}

			c = getComponentByName(componentAttr['name']);
			
			if (c && !c.allowRedefination) {

				msg = err + "组件" + c.name + '已存在，并且不允许被重新定义';

				_l.error(msg);

				throw new Error(msg);

			}

			components.push(componentAttr);
		}

	});

	// 定义微评论组件
	_.component.defineComponent({

			name: "微评论", // 名称

			version: '1.0', // 版本

			allowRedefination: false, // 默认为true

			idname: 'qqwb_comment__', // HTML页面中的ID

			create: function (cfg) { // 实现逻辑

				var msg,

				    frame,

				    url = "http://comment.v.t.qq.com:8080/index.html",

					qurl = location.href,

					props = {};

				if (!cfg.appkey) {

					msg = "创建" + this.name + "组件失败，缺少Appkey";

		    		_l.error(msg);

					throw new Error(msg);
				}

				// remove location.hash
				if (location.hash) {

					qurl = qurl.replace(location.hash, "");

				}

				// url
				qurl = encodeURIComponent(qurl);

				_.extend(props, {

					src: [url, "#", _q.encode({appkey: cfg.appkey, url: qurl})].join(""),

					width: cfg.width || 560,

					height: cfg.height || 500,

					frameborder: 0,

					scrolling: "no",

					allowtransparency: "true"

				});

				frame = _d.createElement("iframe", props);

				return frame;

			}
		});

}());
