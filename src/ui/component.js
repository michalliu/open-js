/**
 * Tencent weibo javascript library
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
 *           common.JSON
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

        proto;

    proto = {

        // configuration
        dimension: function (width, height) {

            if (typeof width == "object") {

                _.extend(this.componentConfig, width, true);

            } else {

                _.extend(this.componentConfig, {

                    width: width,

                    height: height

                }, true);
            }

            return this;

        },

        // width
        width: function (width) {

            _.extend(this.componentConfig, { width : width }, true);

            return this;
        },

        // height
        height: function (height) {

            _.extend(this.componentConfig, { height : height }, true);

            return this;
        },

        // style
        style: function (styleName) {

            _.extend(this.componentConfig, {

                style: styleName

            }, true);

            return this;
        },

        // configuration
        config: function (cfg) {

            _.extend(this.componentConfig, cfg, true);

            return this;

        },

        // render component to element
        renderInto: function (context) {

            var that = this,

                msg,

                _context = context;

            // render component common process
            function renderComponent(root) {

                var create,

                    comp,

                    cname,

                    c;

                cname = that.componentName;

                comp = getComponentByName(cname);

                if (!comp.hasOwnProperty('create')) {

                    msg = "创建" + cname + "组件失败，未定义create方法";

                    _l.error(msg);

                    throw new Error(msg);

                }

                // 调用组件的create方法生成组件外观
                c = comp.create(that.componentConfig);

                // 允许设置父容器样式避免有些页面设置全局样式影响到组件内部展现，如line-height和text-align等
                // 这种属性可以被所有子节点继承，有时候会造成显示问题
                if (comp.rootStyle) {
                    _d.setProperties(root, {
                        style : comp.rootStyle
                    });
                } else {
                    //TODO 目前什么也不做，或者设置恢复所有的样式为默认值
                }

                if (typeof c != "undefined" && (c.nodeType == 1 || c.nodeType == 11)) {

                    root.appendChild(c);

                } else if (_s.isString(c)) {

                    root.innerHTML = c;

                } else {

                    msg = "创建" + that.componentName + "组件失败，无法处理的create方法返回结果";

                    _l.error(msg);

                    throw new Error(msg);

                }

            }

            if (context && context.nodeType == 1) {

				if (_b.get("document", "ready")) {

                    renderComponent(context);

				} else {

					_.dom.ready(function () {

                        renderComponent(context);

					});

				}

            } else if (_s.isString(context)) {

                _.dom.ready(function () {

                    context = _.dom.find(_context);

                    if (context.length > 0) {

                        context = context[0];

                        renderComponent(context);

                    } else {

                        msg = "加载" + that.componentName + "组件失败，未找到节点" + _context;

                        _l.error(msg);

                        throw new Error(msg);

                    }
                });

            // unexpected behavior
            } else {

                msg = "加载" + that.componentName + "组件失败，无效的节点" + context;

                _l.error(msg);

                throw new Error(msg);
            }

        },

        // render
        render: function () {

            var o,

                msg,

                that = this,

                comp = getComponentByName(that.componentName);

            _d.ready( function () {

                var o = document.getElementById(comp.idname);

                if (o && o.nodeType == 1) {

                    that.renderInto(o);

                } else {

                    msg = ['未找到',comp.componentName,'节点',comp.idname].join("");

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

        o.componentName = name;

        if (optConfig) {

            o.componentConfig = optConfig;

        } else {

            o.componentConfig = {};

        }

        _.extend(o, conf.methods);

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

            attributes: 'width height style appkey title colors',

            create: function (cfg) { // 实现逻辑, this指向组件配置Map

                var msg,

                    frame,

                    url = "http://comment.v.t.qq.com/index.html",

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
                // qurl = encodeURIComponent(qurl);

                _.extend(props, {

                    src: [url, "#", _q.encode({appkey: cfg.appkey, url: qurl, title: cfg.title, colorset: cfg.colors})].join(""),

                    width: cfg.width || "100%",

                    height: cfg.height || "500",

                    frameborder: 0,

                    scrolling: "no",

                    allowtransparency: "true"

                });

                frame = _d.createElement("iframe", props);

                return frame;

            },

            methods: {

                // appkey
                appkey: function (appkey) { // this 指向组件instance

                    _.extend(this.componentConfig, {

                        appkey: appkey

                    }, true);

                    return this;

                },

                // expect an array
                colors: function (colors) {

                    if (_s.isString(colors)) {

                        colors = _a.fromArguments(arguments);

                    }

                    if (_a.isArray(colors)) {

                        _.extend(this.componentConfig, { "colors" : colors }, true);

                    } else {

                        _l.error("component set colors error, expect an array");
                    }

                    return this;
                }

            } // endof method
        });

    // 定义一键转播组件
    _.component.defineComponent({

            name: "一键转播", // 名称

            version: '1.0', // 版本

            allowRedefination: false, // 默认为true

            idname: 'qqwb_share__', // HTML页面中的ID

            attributes: 'icon counter counter_pos cto_icon cto_ui appkey content richcontent pic',

            rootStyle: 'text-align:left;',

            create: function (cfg) {

                // default query meters
                var share_url_query = location.href,

                    share_url = "http://share.v.t.qq.com/index.php?c=share&a=index",

                    share_attrs = "toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=yes,status=no",

                    share_icon_index = 0, // 转播按钮样式

                    share_counter = false, // 是否显示转播数字

                    share_counter_pos = "right", // 转播数字显示的位置

                    share_pic = cfg.pic || "", // 转播的图片

                    share_content = cfg.content || "", // 默认的转播文字

                    share_richcontent = cfg.richcontent || '', // 默认的rich化文字，多行用|分割

                    share_ctoui = cfg.cto_ui || '', // 定制化一键转播页面，不设置此参数 - 不定制。
                    /**
                     *
                     *  值为0表示不显示 为1表示显示
                     *
                     * |--------------------------------|
                     * |  位置 |  含义                  |
                     * |--------------------------------|
                     * |   0   |  是否显示告诉TA们      |
                     * |--------------------------------|
                     * |   1   |  是否显示同步到QZone   |
                     * |--------------------------------
                     *
                     */

                    temp;

                if (!cfg.appkey) {

                    msg = "创建" + this.name + "组件失败，缺少Appkey";

                    _l.error(msg);

                    throw new Error(msg);
                }

                if (location.hash) {

                    share_url_query = share_url_query.replace(location.hash, "");

                }

                // 图标
                if (cfg.icon) {

                    share_icon_index = parseInt(cfg.icon,10);

                }

                // 是否显示数字检查
                if (cfg.counter) {

                    share_counter = !!parseInt(cfg.counter,10);

                }

                share_richcontent = _s.splitby('|', share_richcontent);

                // 显示数字的位置检查
                if (cfg.counter_pos) {

                    temp = _s.trim(cfg.counter_pos);

                    if (temp != "top" && temp != "right") {

                        _l.warn("已忽略的计数位置指定错误，无法在位置" + cfg.counter_pos + "显示计数");

                    } else {

                        share_counter_pos = temp;

                    }

                }

                // dom elements
                var doc = document,

                    node_a = doc.createElement('a'),

                    node_img = doc.createElement('img'),

                    node_div = doc.createElement('div'),

                    frag = doc.createDocumentFragment(),

                    dshare_icon = node_img.cloneNode(false),

                    dshare_btn = node_a.cloneNode(false),

                    dshare_count = node_div.cloneNode(false);

                var counter_style = _.template("counter_style"),

                    sharebtn_style = _.template("sharebtn_style");


                dshare_icon.src = cfg.cto_icon || ("http://mat1.gtimg.com/app/newvt/share/images/share_icon_" + share_icon_index + ".png");

                dshare_icon.style.border = "0";

                dshare_btn.href = "#";

                dshare_btn.onclick = function () {

                    var query = {

                        url: share_url_query,

                        appkey: cfg.appkey

                    }, currentCount;

                    if (share_content) _.extend(query,{ title: share_content });

                    if (share_pic) _.extend(query,{ pic: share_pic });

                    // 1 代表开启定制化，若为0表示开启定制化并隐藏全部的额外界面元素，不设置代表显示所有的界面元素

                    if (share_ctoui) _.extend(query,{ bm: '1' + share_ctoui });                     

                    if (share_richcontent.length > 0) {

                        // 最多支持3行richcontent
                        for (var i=0,l=share_richcontent.length;i<l && i<3; i++) {

                            query['line' + (i + 1)] = share_richcontent[i];

                        }

                    }

                    window.open(share_url + "&" + _q.encode(query),null,share_attrs);

                    currentCount = parseInt(dshare_count.innerHTML,10);

                    drawCounter(currentCount + 1); // 分享加1

                    return false;

                };

                dshare_btn.appendChild(dshare_icon);

                // 显示计数
                counter_style.add("font-family:Microsoft YaHei,SimSun,Arial,sans-serf;text-align:center;color:#647f88;font-size:12px;") // 文字属性
                             .add("width:<%=bgwidth%>px;height:<%=bgheight%>px;line-height:<%=textheight%>px;") // 背景属性
                             .add("background:url(http://mat1.gtimg.com/app/newvt/share/images/share.png) no-repeat <%=bgoffsetx%>px <%=bgoffsety%>px;") // 背景图片
                             .add("<%=textposition%>")
                             .add("<%=boxposition%>");

                sharebtn_style.add("<%=boxposition%>");

                // 格式化计数
                function formatCounter(num) {

                    num = Math.max(num,0);

                    if ( num >= 0 && num < 10E3) {

                        return  num;

                    } else if (num > 10E5 && num < 10E7-1) {

                        return Math.floor( num / 10E3 ) + "万";
                    
                    } else {

                        return "上亿次";
                    }
                    
                    return Math.floor(num * 10 / 10E3) / 10 + "万";

                }

                // 绘制计数
                function drawCounter(count) {

                    var text = formatCounter(count);

                    switch (share_icon_index) {
                        case 0:
                            switch (share_counter_pos) {
                                case "right":
                                    _d.setProperties(dshare_count,{
                                        style:counter_style.renderWith({
                                            bgwidth: 50,
                                            bgheight: 32,
                                            bgoffsetx: -3,
                                            bgoffsety: -4,
                                            textheight: 32,
                                            textposition: "text-indent:4px;",
                                            boxposition: "margin-left:35px;margin-bottom:-32px;"
                                        }),
                                        innerHTML: text
                                    });
                                    break;
                                case "top":
                                    _d.setProperties(dshare_count,{
                                        style:counter_style.renderWith({
                                            bgwidth: 46,
                                            bgheight: 28,
                                            bgoffsetx: -60,
                                            bgoffsety: -4,
                                            textheight: 24,
                                            textposition: "text-indent:0px;",
                                            boxposition: "margin-bottom:3px;"
                                        }),
                                        innerHTML: text
                                    });
                                    _d.setProperties(dshare_btn,{
                                        style:sharebtn_style.renderWith({
                                            boxposition: "margin-left:" + (46 - 32) / 2 + "px;"
                                        })
                                    });
                                    break;
                            }
                            break;
                        case 1:
                            switch (share_counter_pos) {
                                case "right":
                                    _d.setProperties(dshare_count,{
                                        style:counter_style.renderWith({
                                            bgwidth: 50,
                                            bgheight: 24,
                                            bgoffsetx: -3,
                                            bgoffsety: -43,
                                            textheight: 24,
                                            textposition: "text-indent:5px;",
                                            boxposition: "margin-left:62px;margin-bottom:-24px;"
                                        }),
                                        innerHTML: text
                                    });
                                    break;
                                case "top":
                                    _d.setProperties(dshare_count,{
                                        style:counter_style.renderWith({
                                            bgwidth: 46,
                                            bgheight: 28,
                                            bgoffsetx: -60,
                                            bgoffsety: -4,
                                            textheight: 24,
                                            textposition: "text-indent:0px;",
                                            boxposition: "margin-bottom:3px;margin-left:" + (62 - 46) / 2 + "px;"
                                        }),
                                        innerHTML: text
                                    });
                                    break;
                            }
                            break;

                    }

                }

                // 绘制计数
                function updateCounter() {

                    _.jsonp({

                        url : "http://open.t.qq.com/api/other/get_count",

                        data : {

                            url: share_url_query,

                            appkey: cfg.appkey

                        },

                        dataType: "text"

                    }).success(function (response) {

                        var currentCount = parseInt(dshare_count.innerHTML,10);

                        // 只有当实际的转播数字大于所显示的数字时，才绘制到屏幕上
                        // 若用户不停的点击转播按钮，但又未实际的转播出去，可能会导致
                        // 显示的转播数字比实际的转播数字要大，而发生转播数字突然变小
                        // 的情况
						if (response.ret === 0 && response.count > currentCount) {

							drawCounter(response.count);

						} else {

							_l.warn("获取转播数字失败, ret=" + response.ret);

						}

                    });

                }

                if (share_counter) {

                    frag.appendChild(dshare_count);

                    drawCounter(0); // 默认显示转播数为0

                    updateCounter();
                }

                frag.appendChild(dshare_btn);

                return frag;
            },

            methods: {

                // appkey
                appkey: function (appkey) { // this 指向组件instance

                    _.extend(this.componentConfig, {

                        appkey: appkey

                    }, true);

                    return this;

                },

                icon: function (ico) {

                    if (typeof ico === 'number' || _s.isString(ico)) {

                        if (typeof ico === 'number' && (ico < 0 || ico > 2)) {

                            _l.warn("component set icon, default icon index must be 0,1,2, you gave " + ico);

                        }

                        _.extend(this.componentConfig, { "icon" : ico }, true);

                    } else {

                        _l.error("component set icon error, expect number or string, you gave " + (typeof ico));

                    }

                    return this;
                },

                showCounter: function (position) {

                    var ico = this.componentConfig.icon;

                    // position must be either left or top
                    switch(position) {

                        case 'left':

                        case 'top':

                        break;

                        default:

                        _l.warning("component showcounter, position must be either 'left' or 'top', you gave " + "'" + position + "'" );

                        return this;
                    }

                    if (typeof ico === 'number' && (ico === 0 || ico === 1) ) {

                        _.extend(this.componentConfig, {"counter":1, "counter_pos" : position }, true);

                    } else { // icon index must be 1 or 2

                        _l.warning("component showcounter, icon index must be either 0 or 1, you gave " + ico);

                    }

                    return this;
                }
            }
    });

    // try to render components automaticlly through component's idname
    _l.info('scanning components ...');

    _d.ready(function () {

        var compFound = 0;

        _a.forEach(components, function (c) {

            var id = c.idname,

                attrs = (c.attributes || '').split(/\s+/),

                datakeys,

                dataval,

                cfg = {},

                autorender = false, // 是否应该自动渲染找到的预定义节点

                e = document.getElementById(id);

            datakeys = _a.forEach(attrs, function (v,i) {

                return 'data-' + v;

            });

            if (e) {

                dataval = _.dom.getProperties(e, datakeys);

                _.Object.forEach(dataval, function (v, k) {

                    if (v) {

                        k = k.replace('data-','');

                        cfg[k] = v;

                        if (!autorender && v !== null) { // 只要v有一次不为null，即组件指定的idname中有可读取的属性，就应该渲染该节点，否则不渲染

                            autorender = true;

                        }
                    }

                });

                _l.debug(['read configuration ', QQWB.JSON.stringify(cfg)].join(''));

                if (autorender) {

                    _l.debug(['try render component [', c.name, ' ', c.version,']'].join(''));

                    try {

                        _.component(c.name).config(cfg).render();

                    } catch (componentRenderError) {

                        _l.error(['render component [', c.name, c.version, '] error exception: ', componentRenderError].join(''));

                    }
                    compFound++;

                } else {

                    _l.debug(['found dom element for [', c.name, ' ', c.version,'], but auto render will not start'].join(''));
                }

            }

        }); // end forEach

        _l.info('found ' + compFound + ' components');

    });// end domReady

}());
