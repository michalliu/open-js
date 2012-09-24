/*author:icefrogli,2012/9/7*/
/*global QQWB,T,setTimeout*/
if (QQWB.name === "OpenJS" && parseInt(QQWB.version,10) >= 3) {
	QQWB.widget.register({
		name: "帐号连接",
		version: "1.0",
		width: 91,
		height: 22,
		main: function () {
			var that = this,
				container = that.getContainer();
			
			var icon = QQWB.dom.createElement('img', {
				src: 'http://mat1.gtimg.com/app/openjs/widget/static/connect/images/connect.png',
				style: 'border:0;'
			});

			var connectButton = QQWB.dom.createElement('a', {
				href: '#'
			});

			connectButton.onclick = function () {
				QQWB.login(function (response) {
					that.sendSuccessData(response);
				}, function (message) {
					that.sendErrorData(message.error);
				});
				return false;
			};

			connectButton.appendChild(icon);

			setTimeout(function () {
				container.appendChild(connectButton);
				that.ready();
			}, 2000);
		}
	});
}
