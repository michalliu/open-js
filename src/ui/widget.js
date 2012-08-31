/**
 * Tencent weibo javascript library
 *
 * @author michalliu
 * @version 1.0
 * @package ui
 * @module widget
 * @requires base
 *           core.log
 *           common.Array
 */
(function () {

	var _ = QQWB,

        _l = _.log;

	var manifests = [],

        simpleManifests; // manifests的精简版，主要提供一些挂件信息

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
		// 挂件需要登录
		if (manifest.loginRequired) {
	    	T.tokenReady(function () {
	    	})
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

			// 提供精简版的manifest，仅提供查询功能(如，挂件列表)
			simpleManifests = _.Array.forEach(manifests, function (v, i) {

				return [v.name,v.version].join(',');

			});

		},

		/**
		 * 获取已注册的插件列表
		 */
		list: function () {

			return simpleManifests;

		}
	});
}());
