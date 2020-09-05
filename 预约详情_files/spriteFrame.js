(function ( require ) {
	// Define and loading required javascript library.
	require.config( {
		urlArgs: "r=" + (typeof APP_VERSION != "undefined"? APP_VERSION : APP_CONFIG.APP_VERSION),
		paths : {
			jquery 			: SERVER_PATH + '/bower_components/jquery/dist/jquery.min',
			vue 			: SERVER_PATH + '/bower_components/vue2/vue.min',
			vueRouter 		: SERVER_PATH + '/bower_components/vue2/vue-router.min',
			iview 			: SERVER_PATH + '/fe_components/iview2/iview.min',
			text 			: SERVER_PATH + '/bower_components/text/text', // A RequireJS/AMD loader plugin for loading text resources, e.g: txt、css、html、xml、svg.
			MINT 			: SERVER_PATH + '/fe_components/mobile/MINT/index', 
			TGUI 			: SERVER_PATH + '/fe_components/mobile/tg-ui/index', // Emapflow components depend on this lib.
			'emap-h5tag' 	: SERVER_PATH + '/fe_components/mobile/tg-ui/emap-h5tag.min', // Emapflow components depend on this lib.
			axios 			: SERVER_PATH + '/bower_components/vue2/axios.min',
			qs	 			: contextPath + '/sys/itpub/public/mob/newframe/lib/qs',
			spriteUtils 	: contextPath + '/sys/itpub/public/mob/newframe/spriteUtil',
			httpUtils	 	: contextPath + '/sys/itpub/public/mob/newframe/httpUtils',
			custom_lw 		: contextPath + '/sys/itpub/public/js/custom_lw',
			'emap-mobile' 	: SERVER_PATH + '/fe_components/mobile/emap-mobile.min', // Emap frontend components.
			BH_MOBILE 		: SERVER_PATH + '/fe_components/mobile/BH_MIXIN_SDK', // This lib is use for integrate to JS-SDK on Wechat and Dingtalk.
			'draggable' 	: SERVER_PATH + "/bower_components/vuedraggable/vuedraggable",
			'sortable' 		: SERVER_PATH + "/bower_components/sortable/1.5.1/Sortable.min",
			pagelog 		: SERVER_PATH + '/fe_components/sentry/sentry.min',
			cropper 		: SERVER_PATH + '/bower_components/cropper/cropper.min',
			emapMin 		: contextPath + '/sys/itpub/public/mob/js/emapMin',
			// The following are custom components.
			selectRolePage	: contextPath + '/sys/itpub/public/mob/newframe/component/selectrole/selectrole',
			homePage		: contextPath + '/sys/itpub/public/mob/newframe/component/home/home',
			flowhomePage	: contextPath + '/sys/itpub/public/mob/newframe/component/flowhome/home',
			nopermissionPage: contextPath + '/sys/itpub/public/mob/newframe/component/nopermission/nopermission',
			notfoundPage	: contextPath + '/sys/itpub/public/mob/newframe/component/notfound/notfound',
			basicComponents : contextPath + '/sys/itpub/public/mob/newframe/component',
			publicVueComponent : contextPath + '/sys/itpub/public/mob/component',
			util 			: 'public/util/util', // 用于兼容业务应用中使用了util的程序
		},
		shim : {
	        vue: {
	            exports : 'Vue'
	        },
			iview : [
				'vue'
			]
		},
		waitSeconds : 0, // Wait timeout for loading a resource.
		// urlArgs		: "vt=" +  (new Date()).getTime(), // Prevent loading javascript file from cache.
	} );
	
	// 封装的公共vue组件
	var defaultCustomComponents = [ {
		name : 'auditProcess',
		jsPath : 'basicComponents/auditprocess/auditProcess'
	}, {
		name : 'noneDatas',
		jsPath : 'basicComponents/nonedatas/nonedatas'
	}, {
		name : 'emapFlowView',
		jsPath : 'basicComponents/emapflowview/emapflowview'
	}, {
		name : 'rateCouple',
		jsPath : 'basicComponents/rateCouple/rateCouple'
	}, {
		name : 'multiModel',
		jsPath : 'publicVueComponent/multimodel/multimodel'
	}, {
		name : 'baseSelectedFooter',
		jsPath : 'publicVueComponent/baseSelectFooter/baseSelectFooter'
	}, {
		name : 'bsTransitionPage',
		jsPath : 'publicVueComponent/bsTransitionPage/bsTransitionPage'
	}, {
		name : 'baseSelect',
		jsPath : 'publicVueComponent/baseSelect/baseSelect'
	}, {
		name : 'choosePerson',
		jsPath : 'publicVueComponent/chooseperson/chooseperson'
	} ];
	
	// Require components
	var requireLibs = [ 'jquery', 
	                    'vue', 
	                    'vueRouter', 
	                    'MINT', 
	                    'TGUI', 
	                    'emap-h5tag', 
	                    'emap-mobile', 
	                    'axios', 
	                    'spriteUtils', 
	                    'httpUtils', 
	                    'custom_lw', 
	                    'draggable', 
	                    'emapMin', 
	                    'pagelog', 
	                    'cropper',
	                    'iview' ];

	// 加载框架所需的库和公共页面
	require( requireLibs, function ( $, Vue, VueRouter, mintUI, Tg, emap_h5tag, emap_mobile, axios, sprite, httpUtils, custom_lw, draggable, emapMin, pagelog, cropper, iview ) {

		// 设置拖拽组件
		Vue.component( 'draggable', draggable );

		// 将各个组件库输出到全局作用域
		window.axios = axios;
		window.Vue = Vue;
		window.VueRouter = VueRouter;
		window.mintUI = mintUI;
		window.Tg = Tg;
		window.emap_h5tag = emap_h5tag;
		window.EMAP_MOBILE = emap_mobile;
		window.WIS_EMAP_SERV = emapMin;
		window.sprite = sprite;
		window.httpUtils = httpUtils;

		$.each( emap_h5tag['default'], function ( i, item ) {
			Vue.component( i, item );
		} );

		$.each( Tg['default'], function ( i, item ) {
			Vue.component( item['name'], item );
		} );

		// vue路由组件
		Vue.use( VueRouter );
		// 饿了么移动端组件mint-ui
		Vue.use( mintUI );
		Vue.use( Tg );
		// EMAP相关vue组件
		Vue.use( emap_h5tag );
		Vue.use( emap_mobile );
		// iview
		Vue.use( iview );
		
		// 定义一个spriteUtils需要的config对象
		var config = {
			defaultComponents : defaultCustomComponents
		};
		if ( window.mobileConfig && !(window.mobileConfig.defaultComponents instanceof Array) ) {
			throw new Error ( 'window.mobileConfig.defaultComponents type must be array!' );
		}
		// 将业务应用中 的mobileConfig对象与config进行合并
		$.extend ( true, config, window.mobileConfig );
		
		// ids认证
		if ( userId ) {
			// 如果是任务中心过来的请求，将不做角色的选择
			if ( sprite.isTaskCenterRequest () ) {
				config.isShowSelectRolePage = false;
			}
		}
		// 游客
		else {
			// 初始化应用--游客模式
			config.anonymousAccess = true;
		}
		sprite.run ( config );

		$.extend($,{
			/**
			 * 获取当前日期，格式为YYYY-MM-DD
			 * 
			 */
			newServerDate : function() {
				var result = null;
				$.ajax({
					url : contextPath + "/sys/itpub/api/getServerTime.do",
					type : 'POST',
					async : false,
					success : function(resp) {
						result = resp;
					},
					dataType : "JSON"
				});
				var date = new Date(result.date);
				var seperator1 = "-";
				var year = date.getFullYear();
				var month = date.getMonth() + 1;
				var strDate = date.getDate();
				if (month >= 1 && month <= 9) {
					month = "0" + month;
				}
				if (strDate >= 0 && strDate <= 9) {
					strDate = "0" + strDate;
				}
				var currentdate = year + seperator1 + month + seperator1 + strDate;
				return currentdate;
			},
			/**
			 * 获取当前时间，格式为YYYY-MM-DD hh24:mm:ss
			 * 
			 */
			newServerDateTime : function() {
				var result = null;
				$.ajax({
					url : contextPath + "/sys/itpub/api/getServerTime.do",
					type : 'POST',
					async : false,
					success : function(resp) {
						result = resp;
					},
					dataType : "JSON"
				});
				var date = new Date(result.date);
				var seperator1 = "-";
				var year = date.getFullYear();
				var month = date.getMonth() + 1;
				var strDate = date.getDate();
				var strDate = date.getDate();
				var hours = date.getHours();
				var minutes = date.getMinutes();
				var seconds = date.getSeconds();
				if (month >= 1 && month <= 9) {
					month = "0" + month;
				}
				if (strDate >= 0 && strDate <= 9) {
					strDate = "0" + strDate;
				}
				if (hours >= 0 && hours <= 9) {
					hours = "0" + hours;
				}
				if (minutes >= 0 && minutes <= 9) {
					minutes = "0" + minutes;
				}
				if (seconds >= 0 && seconds <= 9) {
					seconds = "0" + seconds;
				}
				var currentdate = year + seperator1 + month + seperator1 + strDate + " " + hours + ":" + minutes + ":" + seconds;
				return currentdate;
			},

			/**
			 * 根据流程和taskid获取节点配置
			 * 
			 * @param {defKey, taskId}
			 * 
			 */
			getRenderFlowComponentParamsInForm : function(param) {
				var result = null;
				$.ajax({
					url : contextPath + "/sys/itpub/common/api/flow/getRenderFlowComponentParamsInForm.do",
					type : 'POST',
					async : false,
					data : param,
					success : function(resp) {
						result = resp;
					},
					dataType : "JSON"
				});
				return result;
			}
		} );
	} );
}( require ));