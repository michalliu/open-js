/*author:icefrogli,2012/9/7*/
/*global QQWB,T*/
if (QQWB.name === "OpenJS" && parseInt(QQWB.version,10) >= 3) {
	QQWB.widget.register({
		name: "好友选择",
		version: "1.0",
		loginRequired:true,
		jquery: true,
		css:'http://mat1.gtimg.com/app/openjs/widget/static/friendselector/css/base.css',
		main: function ($) {
			var that = this;
						
			var bodyobj = that.getContainer();

			var AtFriends;

			T.api('/friends/idollist_s',{'reqnum':200})
			.success(function(data){
				if(data.data !== null) {
					new AtFriends({   //耦合点
						idollist : data.data.info,
						bodyopt : bodyobj,
						sendres : that.sendFinalData
					});
				}else{
					bodyobj.innerHTML = '<div style="font-size:14px;color:#555;padding:40px 0 0 40px">您还没有收听的好友！</div>';
					that.setContentDimension(500,200);
					that.ready();
					return;
				}
				that.setContentDimension(574,364);
				that.ready();
			});

			//以下是独立库文件
			AtFriends = function(opt) {
				//预留参数
				this.height = 324;
				this.maxnum = 10;

				this.thatbody = opt.bodyopt; //框对象
				this.sentData = opt.sendres;

				//数据
				this.fullData = opt.idollist;  //拉取的所有数据
				this.searchData = {};  //搜索结果
				//this.searchPool = {};  //搜索池
				this.showallData = []; //展示的所有数据
				this.selectData = {};
				this.cNum = 0;
				this.keyval = '';
				this.delflag = false; //显示删除按钮，false表示不显示
				this.returnData = {};
				
				this.init();
			};

			AtFriends.prototype = {
				init : function() {
					var self = this;//debugger;

					self.buildBody();
					self.analyzeData();
					
					//DOM对象
					self.itemWrap = $('.QQT_itemWrap');
					self.ulist = $('#QQT_ulist');
					self.selectulist = $('#QQT_selectulist');
					self.searchulist = $('#QQT_searchulist');
					self.cnumdom = $('#QQT_cnum');
					self.tab1 = $('#QQT_tab1');
					self.tab2 = $('#QQT_tab2');
					self.atLabel = $('#QQT_atLabel');
					self.atSearch = $("#QQT_atSearch");
					self.valsearch = $("#QQT_valsearch");
					self.clearclear = $("#QQT_clearclear");
					self.okbtn = $("#QQT_okbtn");

					self.bindEvent();
				},

				//构造DOM结构
				buildBody : function() {
					var self = this;
					var html = '<div class="QQT_atfriends" id="QQT_atfriends" style="padding:20px;"><div class="topCons clearfix"><div class="atTab"><a href="javascript:;" class="current" id="QQT_tab1">全部</a><a href="javascript:;" id="QQT_tab2">已选(<span id="QQT_cnum">0</span>)</a></div><div class="searchWrap"><div class="atSearch"><label for="atSearch" id="QQT_atLabel" style="display:block;">输入名字/帐号</label><input id="QQT_atSearch" type="text" class="inputTxt" maxlength="12"><span class="atbtnIcon"><input type="button" class="btnSearch" id="QQT_valsearch" /><a class="del" title="清空" id="QQT_clearclear"></a></span></div></div></div><div class="selectItemWrap clearfix" ><ul class="clearfix" id="QQT_ulist"></ul><ul class="clearfix" id="QQT_selectulist" style="display:none"></ul><ul class="clearfix" id="QQT_searchulist" style="display:none"></ul></div><div class="butWrap"><a class="noneBtn" id="QQT_okbtn"><span class="text">确认</span></a></div></div>';
					self.thatbody.innerHTML = html;
				},

				//绑定事件
				bindEvent : function() {
					var self = this;
					self.itemWrap.live('mouseover', function(){
						$(this).addClass('itemhover');
					});
					self.itemWrap.live('mouseout', function(){
						$(this).removeClass('itemhover');
					});

					self.itemWrap.live('click', function(){
						var data = {};
						var itemDom;
						var flag;
						flag = ($(this).attr('data-QQTflag') - 0);
						data.name = $(this).attr('data-QQTname');
						data.nick = $(this).attr('data-QQTnick');
						data.head = $(this).attr('data-QQThead');
						data.cvip = $(this).attr('data-QQTcvip');
						if(self.clickChoose(flag, data)) {
							self.cnumdom.empty().html(self.cNum);
							flag = 1 === flag ? 0 : 1;
							itemDom = $(".itemWrap[data-QQTname="+data.name+"]");
							if(flag) {
								itemDom.addClass('selected');
								itemDom.attr('data-QQTflag', 1);
							}
							if(!flag && $(this).hasClass('selected')) {
								itemDom.removeClass('selected');
								itemDom.attr('data-QQTflag', 0);
							}
							$(this).attr('data-QQTflag', flag);
						}
						if( $.isEmptyObject(self.selectData) ) {
							self.okbtn.removeClass('okBut').addClass('noneBtn');
						}else{
							self.okbtn.removeClass('noneBtn').addClass('okBut');
						}
					});

					self.tab2.bind('click', function() {
						self.ulist.hide();
						self.searchulist.hide();
						self.tab1.removeClass('current');
						self.tab2.addClass('current');
						self.selectulist.empty().show();
						if( $.isEmptyObject(self.selectData) ) {
							self.selectulist.append('<div style="font-size:14px;color:#555;padding:20px 0 0 40px">您还没有选择好友！</div>');
						}else{
							self.showChoose();
						}
					});

					self.tab1.bind('click', function() {
						var key = $.trim(self.atSearch.val());
						self.changetoAll();
						if(key === '') {
							self.showallList();
						}else{
							self.selectulist.hide();
							self.searchulist.show();
						}
					});

					self.atSearch.bind('focus', function() {
						var key = $.trim(self.atSearch.val());
						if(key === '') {
							self.atLabel.hide();
							self.showallList();
							self.changetoAll();
						}
					});

					self.atSearch.bind('blur', function() {
						if(self.keyval === ''){
							self.atLabel.show();
						}
					});

					self.atSearch.bind('keyup', function() {
						var key = $.trim(self.atSearch.val());
						if(self.keyval === '' && !self.delflag) {
							self.showdelBtn();
						}
						if(key !== self.keyval && key !== '') {
							self.ulist.hide();
							self.selectulist.hide();
							self.searchulist.empty().show();
							self.changetoAll();
							self.searchFunc(key);
							self.keyval = key;
							self.delflag = true;
						}
						if(key === '') {
							self.showallList();
							self.showsearchBtn();
							self.keyval = key;
							self.delflag = false;
						}
					});

					self.atLabel.click(function() {
						self.atSearch.focus();
					});
					
					self.clearclear.bind('click', function() {
						self.clearsearchRet();
						self.showallList();
					});

					self.okbtn.bind('click', function() {
						if(!$.isEmptyObject(self.selectData)) {
							self.sentData(self.returnData);
							that.close();
						}
					});
				},

				//解析数据
				analyzeData : function() {
					var self = this, i;
					if(!($.isEmptyObject(self.fullData))) {
						for(i in self.fullData) {
							if (self.fullData.hasOwnProperty(i)) {
								var data = self.fullData[i];
								data.cvip = 1 === data.isvip ? 'textIco' : ' ';
								var html = self.buildItem(data, '', 0);
								self.showallData.push(html);
							}
						}
						self.showallData = self.showallData.join('');
						self.pushNode('QQT_ulist');
						self.showallData = [];
					}
				},

				//构造Item
				buildItem : function(data, classname, flag) {
					return '<li class="item"><div class="itemWrap QQT_itemWrap '+classname+'" data-QQTname="'+data.name+'" data-QQTnick="'+data.nick+'" data-QQThead="'+data.head+'" data-QQTcvip="'+data.cvip+'" data-QQTflag="'+flag+'"><div class="itemL"><span class="avatar"><img src="'+data.head+'/50" onerror="javascript:this.src=\'http://mat1.gtimg.com/www/mb/img/p1/head_normal_50.png\'"/></span></div><div class="itemR"><p class="ucardTit"><span class="textU">'+data.nick+'</span><a class="'+data.cvip+'" title="腾讯认证"></a></p><p class="ucardCon"><span class="textName">@'+data.name+'</span></p><p class="ucardCon"><i class="iconFlag"></i></p></div></div></li>';
				},

				//push节点
				pushNode : function(id) {
					var self = this;
					$('#'+id).append(self.showallData);
				},

				//点击选择节点
				clickChoose : function(flag, data) {
					var self = this;
					var name = data.name;
					var tmp = {};
					if(flag === 1) {
						delete self.selectData[name];
						delete self.returnData[name];
						self.cNum--;
						return true;
					}
					if(flag === 0) {
						self.selectData[name] = data;
						tmp.name = data.name;
						tmp.nick = data.nick;
						tmp.head = data.head;
						self.returnData[name] = tmp;
						self.cNum++;
						return true;
					}
				},

				//切换到已选tab
				showChoose : function() {
					var self = this;
					var i;
					for(i in self.selectData) {
						if (self.selectData.hasOwnProperty(i)) {
							self.showallData.push(self.buildItem(self.selectData[i], 'selected', 1));
						}
					}
					self.showallData = self.showallData.join('');
					self.pushNode('QQT_selectulist');
					self.showallData = [];
				},

				//显示全部tab结果
				showallList : function() {
					var self = this;
					self.selectulist.hide();
					self.searchulist.hide();
					self.ulist.show();
				},

				//全部tab选中
				changetoAll : function() {
					var self = this;
					self.tab2.removeClass('current');
					self.tab1.addClass('current');
				},

				//搜索
				searchFunc : function(key) {
					var self = this;
					T.api('/friends/match_nick_tips',{'match' : key, 'reqnum' : 9})
					.success(function(ret){//debugger;
						if(ret.data !== null) {
							var hadc = ret.data.info;
							var tempname = {};
							var data = {};
							var i;
							for(i in hadc) {
								if (hadc.hasOwnProperty(i)) {
									tempname = hadc[i].name;
									if(tempname) {
										data.name = hadc[i].name;
										data.nick = hadc[i].nick;
										data.head = hadc[i].head;
										data.cvip = '';
									
										if(tempname in self.selectData) {
											self.showallData.push(self.buildItem(data, 'selected', 1));
										}else{
											self.showallData.push(self.buildItem(data, '', 0));
										}
									}
								}
							}
							self.showallData = self.showallData.join('');
							self.pushNode('QQT_searchulist');
							self.showallData = [];
						}
					});
				},

				//清除搜索结果
				clearsearchRet : function() {
					var self = this;
					self.changetoAll();
					self.atSearch.val('');
					self.clearclear.hide();
					self.valsearch.show();
					self.keyval = '';
					self.delflag = false;
				},

				//显示删除按钮
				showdelBtn : function() {
					var self = this;
					self.valsearch.hide();
					self.clearclear.show();
				},

				//显示搜索按钮
				showsearchBtn : function() {
					var self = this;
					self.clearclear.hide();
					self.valsearch.show();
				}

			};
		}
	});
}
