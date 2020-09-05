define( function ( require ) {
	
	/**
	 * 暴露给外部调用的配置信息
	 */
	var config = {
		isShowSelectRolePage 	: true, 	// 是否需要显示选择用户角色的页面，default value : true
		anonymousAccess			: false, 	// 是否允许匿名访问, default value : false
		appRoot 				: '#app',	// 装载app的dom节点
		defaultComponents		: {}, 		// 框架默认需要使用的组件
		onApplicationStarted	: function () {}, // 当这个APP正式初始化结束后，会触发这个方法
		enableBackToRoute		: false		// 其否启用自动跳转到指定路由, default value : false
	};
	
	// 需要用到的接口列表
	var services = {
		wechatJsSdkUrl 			: WIS_CONFIG.ROOT_PATH + '/sys/itpub/mobile/api/public/wechat/config/jsapi.do',
		//
		uploadImgsFromWechat	: WIS_CONFIG.ROOT_PATH + '/sys/itpub/mobile/api/public/wechat/uploadMedia.do',
		uploadImgsFromDingTalk	: WIS_CONFIG.ROOT_PATH + '/sys/itpub/mobile/api/public/dingtalk/uploadMedia.do',
		// 集成钉钉JSSDK的URL
		dingtalkJsSdkUrl 		: WIS_CONFIG.ROOT_PATH + '/sys/itpub/mobile/api/public/dingtalk/config/jsapi.do',
		// 设置登录用户的默认角色
		setupDefaultRoleUrl		: WIS_CONFIG.ROOT_PATH + '/sys/itpub/mobile/api/authenticated/users/setupDefaultRole.do',
		// 获取用户能使用的菜单
		getUserMenu 			: WIS_CONFIG.ROOT_PATH + '/sys/itpub/mobile/api/public/users/menu.do',
	};
	
	// 当前类中的成员变量
	var data = {
		pages 			: [], // 从服务器获取到的页面数据
		menu 			: [], // 从服务器获取到的菜单数据
		menuRoutes		: [], // route格式的菜单列表
		indexRoute		: {}, // route格式的首页
		entranceLocation: window.location.href,
	};
	
	// 所有与框架相关的接口集合
	var apiService = {
		/**
		 * 获取当前用户能使用的菜单和页面
		 */
		sendGetUserMenu : function () {
			var dfd = $.Deferred();
			if(spriteUtils.getQueryString ( 'GROUPID' )){
				roleId = spriteUtils.getQueryString ( 'GROUPID' );
			}
			MOB_UTIL.doGet( {
				url : services.getUserMenu,
				params : {
					APPID 	: WIS_CONFIG.APPID,
					APPNAME : WIS_CONFIG.APPNAME,
					ROLEID : roleId
				}
			} ).done( function ( result ) {
				data.pages 	= result.data.PAGES;
				data.menu 	= result.data.MENU;
				dfd.resolve();
			} );
			return dfd;
		},
		
		/**
		 * 为用户设置默认的权限
		 */
		sendSetupDefaultRole	: function () {
			var dfd = $.Deferred();
			MOB_UTIL.doGet( {
				url : services.setupDefaultRoleUrl,
				params : {
					APPID 	: WIS_CONFIG.APPID,
					APPNAME : WIS_CONFIG.APPNAME
				}
			} ).done( function ( result ) {
				dfd.resolve();
			} );
			return dfd;
		},
		
		/**
		 * 默认要加载与浏览器相关的SDK
		 */
		sendLoadingSdk : function () {
			var dfd = $.Deferred();
			var currentLocation = window.location.href.replace( /#(\S+)?/, '' );
			// 如果在微信环境，则请求微信签名用于加载微信jssdk
			if ( /micromessenger/.test( navigator.userAgent.toLowerCase() ) ) {
				spriteUtils.post ({
					url 	: services.wechatJsSdkUrl,
					data 	: {
						url : currentLocation
					},
					serverErrorHandler 	: function ( deferred, result ) {
						result.msg = result.msg || '系统内部错误，请联系管理员';
						deferred.resolve( result );
					},
				}).done( function ( result ) {
					if ( result.code != '0' ) {
						dfd.resolve();
						console.log ( '微信SDK集成时遇到错误，原因为: ' + result.msg );
					} else {
						dfd.resolve( result.data );
					}
				} );
			} else if ( /dingtalk/.test( navigator.userAgent.toLowerCase() ) ) {
				spriteUtils.post ({
					url 	: services.dingtalkJsSdkUrl,
					data 	: {
						url : currentLocation
					},
					serverErrorHandler 	: function ( deferred, result ) {
						result.msg = result.msg || '系统内部错误，请联系管理员';
						deferred.resolve( result );
					},
				}).done( function ( result ) {
					if ( result.code != '0' ) {
						dfd.resolve();
						console.log ( '钉钉SDK集成时遇到错误，原因为: ' + result.msg );
					} else {
						dfd.resolve( result.data );
					}
				} );
			} else {
				dfd.resolve();
			}
			return dfd;
		}
	}
	
	// 对外暴露的相关方法
	var spriteUtils = {
		/**
		 * 初始化应用
		 */
		run : function ( _config, callBack ) {
			$.extend( config, _config, true );
			// If anon-access to this app is allowed.
			if ( config.anonymousAccess ) {
				// Must be set this value to false.
				config.isShowSelectRolePage = false;
				console.log( 'Enable to the user anon-access : Yes' );
			}
			
			// Use RequireJS to loading the default component for this application.
			var defaultComponentJsPaths = [];
			for ( i in config.defaultComponents ) {
				var component = config.defaultComponents[i];
				defaultComponentJsPaths.push ( component['jsPath'] );
			}
			require ( defaultComponentJsPaths, function () {
				for ( i in config.defaultComponents ) {
					var component = config.defaultComponents[i];
					Vue.component( component.name, spriteUtils.resolved( component.jsPath ) );
				}
			} );
			
			// Framework is creating the mobile application now.
			if ( config.isShowSelectRolePage ) {
				createApp ().then ( startSelectRoleView );
			} else {
				if ( config.anonymousAccess ) {
					createApp ().then ( spriteUtils.startIndexView );
				} else {
					apiService.sendSetupDefaultRole ()
								.then ( createApp )
								.then ( spriteUtils.startIndexView );
				}
			}
		},

		/**
		 * 编译页面组件（包括业务中的页面及组件）
		 */
		resolved : function ( path ) {
			return function () {
				var dfd = $.Deferred();
				require( [ path ], function ( componentInit ) {
					var component = componentInit();
					component.template = compileTpl( component.template );
					dfd.resolve( component );
				} );
				return dfd;
			};
		},

		/**
		 * 从URL上获取参数值
		 * 
		 * @param name
		 *            参数名
		 */
		getQueryString : function ( name ) {
			var reg = new RegExp( "(^|&)" + name + "=([^&]*)(&|$)" );
			var r = window.location.search.substr( 1 ).match( reg );
			if ( r != null ) {
				return unescape( r[2] );
			}
			return null;
		},

		/**
		 * 判断当前页面是否为任务中心请求
		 */
		isTaskCenterRequest : function () {
			if ( spriteUtils.getQueryString( 'processInstanceId' ) 
					&& spriteUtils.getQueryString( 'nodeId' ) 
					&& spriteUtils.getQueryString( 'instId' )
					&& spriteUtils.getQueryString( 'taskId' ) 
					&& spriteUtils.getQueryString( 'defId' ) 
					&& spriteUtils.getQueryString( 'defKey' ) ) {
				return true;
			}
			return false;
		},
		
		/**
		 * 跳转首页
		 * <p>
		 * 程序会先加载首页中的所有菜单模块，同时会显示出需要激活的菜单模块
		 */
		startIndexView : function () {
			apiService.sendGetUserMenu ().then ( function () {
				// 加载用户可用的路由页面
				var userVueRoutes = loadVueRoutes ();
				var simpleRoutes = userVueRoutes['simpleRoutes'];
				var menuRoutes = userVueRoutes['menuRoutes'];
				
				// 403 : No anything route.
				if ( simpleRoutes.length == 0 && menuRoutes.length == 0 ) {
					startNoPermissionView ();
					return;
				}
				
				 // 应用中至少应该存在一个首页
		        if ( menuRoutes.length == 0 ) {
		            throw new Error( "The application needs one menu page at least!" );
		        }
		        
		        var newRoutes = simpleRoutes;
				var indexRoute = getIndexViewRoute ( menuRoutes );
				// 404 : 获取404的route, *** 必须放到这个地方来加载, 否则在还未加载动态路由的时, 都会跳转到404
				var notfoundRoute = getNotfoundRoute ();
				newRoutes.push ( indexRoute );
				newRoutes.push ( notfoundRoute );
				// 设置对象到全局变量中
				data.indexRoute = indexRoute;
				data.menuRoutes = menuRoutes;
				
				// Add avaliable daynamic routes to VueRouter.
				router.addRoutes ( newRoutes );
				
				var requireRoutesJsPaths = [];
				for ( i in data.pages ) {
					var item = data.pages[i];
					var jsPath = item['vueJsPath'];
					requireRoutesJsPaths.push ( jsPath );
				}
				// 在require中装载这些路由节点的js资源
				require ( requireRoutesJsPaths );
				
				if ( config.enableBackToRoute ) {
					// 判断当前Location中是否包含有Route, 如果有，则从VueRouter对象中查找route是否存在
					// 如果在VueRouter中匹配到route，将直接跳转到对应的route中，否则进入到data.indexRoute对象中
					var routePathOnUrl = sprite.getRoutePathFromURL( data.entranceLocation );
					if ( routePathOnUrl ) {
						var matchedRoute = router.match ( routePathOnUrl );
						if ( matchedRoute ) {
							router.push ( {
								path : routePathOnUrl
							} );
							return;
						}
					}
				}
				
				router.push ( {
					name 	: data.indexRoute['name']
				} );
			} );
		},
		
		/**
		 * 获取首页菜单页的Route对象
		 */
		getMenuRoutes : function () {
			if ( data.menuRoutes ) {
				return data.menuRoutes;
			}
			return [];
		},
		
		/**
		 * 发起一个Http GET的请求
		 * @param _options = {
		 * 		url 		: 'http://www.xx.com/api/yyy/zzz',
		 * 		data 		: {},
		 * 		method 		: 'get|post|put|delete',
		 * 		showLoading : 'true|false',
		 * 		serverErrorHandler : function (deferred, result){},
		 * }
		 */
		get : function ( _options ) {
			var options = {
				method	: 'get'
			}
			$.extend ( _options, options, true );
			return spriteUtils.sendHttpRequest ( _options );
		},
		
		/**
		 * 发起一个Http POST的请求
		 * @param _options = {
		 * 		url 		: 'http://www.xx.com/api/yyy/zzz',
		 * 		data 		: {},
		 * 		method 		: 'get|post|put|delete',
		 * 		showLoading : 'true|false',
		 * 		serverErrorHandler : function (deferred, result){},
		 * }
		 */
		post : function ( _options ) {
			var options = {
					method	: 'post'
				}
			$.extend ( _options, options, true );
			return spriteUtils.sendHttpRequest ( _options );
		},
		
		/**
		 * 发起一个Http的请求
		 * @param _options = {
		 * 		url 		: 'http://www.xx.com/api/yyy/zzz',
		 * 		data 		: {},
		 * 		method 		: 'get|post|put|delete',
		 * 		showLoading : 'true|false',
		 * 		serverErrorHandler : function (deferred, result){},
		 * }
		 */
		sendHttpRequest : function ( _options ) {
			var options = {
				url					: '',		// 接口地址
				data				: {},		// 入参
				method				: 'post',	// http的method
				showLoading			: true,		// 是否需要弹出加载框
				serverErrorHandler 	: function ( deferred, result ) { // 当接口端返回错误信息时调用此函数
					result.msg = result.msg || '系统内部错误，请联系管理员';
					mintUI.Toast( result.msg );
					dfd.reject( result );
				},
			}
			
			$.extend ( options, _options, true );
			
			var dfd = $.Deferred();
			// Show loading dialog if the attribute 'showLoading' is true.
			if ( options.showLoading ) {
				mintUI.Indicator.open();
			}
			// Define a XMLHttpRequest object.
			axios({
				method 	: options.method,
				data 	: { data : encodeURIComponent( JSON.stringify( options.data ) ) },
				params	: { data : encodeURIComponent( JSON.stringify( options.data ) ) },
				url 	: options.url,
			}).then( function( response ) {
				if ( options.showLoading ) {
					mintUI.Indicator.close();
				}
				
				var result = response.data;
				if ( result.code === '0' ) {
					dfd.resolve( result );
				} else {
					// Write a log content to console.
					console.error ( result.msg );
					
					if ( typeof(options.serverErrorHandler) == 'function' ) {
						options.serverErrorHandler ( dfd, result );
					} else {
						dfd.reject( result );
					}
				}
			})['catch']( function( error ) {
				if ( options.showLoading ) {
					mintUI.Indicator.close();
				}
				if ( error.response ) {
					mintUI.MessageBox( '网络错误(' + error.response.status + ')', error.message );
				} else {
					error.message = error.message == 'Network Error'? '网络连接不可用': error.message;
					mintUI.MessageBox( '错误', error.message );
				}
				console.error( error );
				dfd.reject( error );
			});
			return dfd;
		},
		
		/**
		 * 从当前Location中获取Route的path
		 */
		getRoutePathFromURL : function ( url ) {
			var routeMatcher = url.match( /.*\#\/(.+)/ );
			if ( routeMatcher && routeMatcher.length > 1 ) {
				return routeMatcher[1];
			}
			return null;
		}
	};
	
	// 定义Vue对象
	var app = null
	// 定义VueRouter对象
	var router = null;
	
	/**
	 * 默认的路由列表
	 */
	var defaultRoutes = [ {
		path 		: '/selectrole',
		name 		: 'selectrole',
		component 	: spriteUtils.resolved( 'selectRolePage' ),
		meta : {
			keepAlive : true
		}
	}, {
		path 		: '/nopermission',
		name 		: '403',
		component 	: spriteUtils.resolved( 'nopermissionPage' ),
		meta : {
			keepAlive : true
		}
	},];

	/**
	 * 开始构建APP整个框架
	 */
	function createApp () {
		var dfd = $.Deferred();
		
		var routes = [];

		var appContainer = config.appRoot;
		
		// 将默认的路由合并到routes对象中
		$.extend ( routes, defaultRoutes, true );
		
		// 生成VueRouter对象
		router = new VueRouter( {
			routes : routes
		} );
		
		// 路由切换完成后执行的操作
		router.afterEach( function ( to, from, next ) {
			// 页面离开时，关闭messagebox
			mintUI.MessageBox.close();

			/**
			 * 当前端组件页面弹出遮罩层，为了控制遮罩层下的文本不滚动， 
			 * 在<body></body>与<div id="app"></div>上设置了样式：overflow:hidden;height:100%,锁死了页面。
			 */
			if ( document.body.style.overflow == 'hidden' && document.body.style.height == '100%' ) {
				document.body.style.overflow = null;
				document.body.style.height = null;
				document.body.firstElementChild.style.overflow = null;
				document.body.firstElementChild.style.height = null;
			}

			/**
			 * 在切换路由后自动执行一个轻微滑动 这样写的原因：ios在页面的高度比较高时，从其他页面返回该页面将会出现页面空白的现象
			 * 需要轻触屏幕进行滑动才能恢复原页面
			 */
			if ( !to.meta.keepAlive && !from.meta.keepAlive ) {
				var top = document.body.scrollTop;
				document.body.scrollTop = top + 1;
				setTimeout( function () {
					document.body.scrollTop = top - 1;
				}, 0 );
			}
		} );
		
		// 判断父窗口中是否加载了SDK，如果加载了则直接使用父窗口的SDK
        // 这样写的原因：微信SDK在同一页面初始化两次会造成第二次初始化失败，即使是iframe嵌套的页面也不行
        if ( window.parent && window.parent.SDK ) {
            window.SDK = window.parent.SDK;
            app = new Vue( {
                el		: appContainer,
                router	: router
            } );
            dfd.resolve ();
        } else {
        	apiService.sendLoadingSdk ().then ( function ( signData ) {
        		var config = {};
                // 如果获取到了第三方SDK的签名，则去加载第三方的SDK
                if ( signData && '{}' !== JSON.stringify( signData ) ) {
                	config = {
                        // 微信jdk初始化参数
                        wx: {
                            uploadImgsToEmapUrl : services.uploadImgsFromWechat,
                            signData : signData
                        },
                        // 钉钉jdk初始化参数
                        dd: {
                        	uploadImgsToEmapUrl : services.uploadImgsFromDingTalk,
                        	signData : signData
                        }
                    };
                }
                
                //使用BH_MOBILE提供的方法进行SDK的注册
                require(['BH_MOBILE'], function( BH_MOBILE ) {
                    window.BH_MOBILE = BH_MOBILE;
                    
                    var callback = function ( res ) {
                        window.SDK = res.sdk;
                        app = new Vue( {
                            el		: appContainer,
                            router	: router
                        } );
                        dfd.resolve();
                    };
                    // 调用bh.js的default方法用于加载移动端的sdk, 加载成功后会回调callback
                    BH_MOBILE['default']( callback, config );
                });
            });
        }
        
        // Call-back function 'config.onApplicationStarted' when this application has been load completed.
        dfd.done ( function () {
        	if ( typeof( config.onApplicationStarted ) === 'function' ) {
        		config.onApplicationStarted ();
        	}
        	console.log( 'MobileApp started successfully.' );
        });
        
        return dfd;
	}
	

	/**
	 * 加载用户可用的路由
	 * @return {
	 * 	simpleRoutes 	: []
	 * 	menuRouts		: []
	 * }
	 */
	function loadVueRoutes () {
		var route = {
			simpleRoutes 	: [],// Simple item
			menuRoutes	 	: [] // Menu item in the index page.
		};
		var routes = [];
		var menuRouteItems = []; 
		
		for ( i in data.pages ) {
			var item = data.pages[i];
			
			// 将接口端的权限列表转换构造为Vue需要的route对象
			var routeObject = {};
			routeObject['path'] = item['vueRoute'];
			routeObject['name'] = item['vueRouteName'];
			routeObject['component'] = loadPage( item['vueJsPath'], item.components );
			var meta = routeObject['meta'] = {};
			meta['keepAlive'] = item['keepAlive'];
			
			if ( item['isIndex'] == true ) {
				//配置为多首页时使用
				meta['index'] = item['vueRouteName'];
				meta['indexIcon'] = item['indexIcon'];
				meta['indexName'] = item['indexName'];
				
				route.menuRoutes.push ( routeObject );
			} else {
				route.simpleRoutes.push ( routeObject );
			}
		}
		return route;
	}
	
	/**
	 * 获取并生成首页的Route对象
	 */
	function getIndexViewRoute ( menuRouteItems ) {
        if(window.showType&&window.showType==='lightFlow'){
            var home = {
                path		: '/',
	            name		: 'home',
                component	: spriteUtils.resolved('flowhomePage'),
                children	: menuRouteItems,
                redirect	: menuRouteItems[0].path
            };
	        return home;
        }else{
	        // 单首页，直接path设置为"/"根路径
	        if ( menuRouteItems.length == 1 ) {
        		menuRouteItems[0].path = '/'
	        	return menuRouteItems[0];
	        }
	        
	        // 多首页
	        var home = {
	            path		: '/',
	            name		: 'home',
	            component	: spriteUtils.resolved( 'homePage' ),
	            children	: menuRouteItems,
	            redirect	: menuRouteItems[0].path,
	        };
	        return home;
        }
	}
	
	/**
	 * 获取404页面Route对象
	 */
	function getNotfoundRoute () {
		return {
			path 		: '*',
			name 		: '404',
			component 	: spriteUtils.resolved( 'notfoundPage' ),
			meta : {
				keepAlive : true
			}
		};
	}
	
	/**
	 * 跳转到“角色选择”页面
	 */
	function startSelectRoleView () {
		router.push ({
            name: 'selectrole'
        });
	}
	
	/**
	 * 跳转到“403”页面
	 */
	function startNoPermissionView () {
		router.push ({
            name: '403'
        });
	}
	
	/**
     * 加载页面
     */
    function loadPage ( path, components ) {
        return function () {
            var dfd = $.Deferred();
            spriteUtils.resolved( path ).call ().then( function ( page ) {
                //注册应用自定义组件
                if ( !page.components ) {
                    page.components = {};
                }
                if ( components && components instanceof Array ) {
                    components.forEach( function ( component ) {
                        page.components[ component.name ] = spriteUtils.resolved( component.jsPath );
                    });
                }
                dfd.resolve( page );
            });

            return dfd;
        };
    }
	
	/**
	 * 正则扫描模板文件，实现按钮权限
	 */
	function compileTpl ( tpl ) {
		if ( !window.MOBILE_BUTTONAUTH_LIST ) {
			window.MOBILE_BUTTONAUTH_LIST = [];
		}
		// 获取tpl中所有权限id
		var tplIds = [];
		var result;
		var pattern = new RegExp( 'auth-id=[\'|\"]{1}[^\'^\"]+[\'|\"]{1}', 'gm' );
		while ( (result = pattern.exec( tpl )) != null ) {
			tplIds.push( result[0].substring( 9, result[0].length - 1 ) );
		}
		;
		if ( tplIds.length == 0 ) {
			return tpl;
		}

		// 删除所有无权限的dom
		tplIds.forEach( function ( id, index ) {
			if ( window.MOBILE_BUTTONAUTH_LIST.indexOf( id ) < 0 ) {
				var regExp = new RegExp( '<[^/].*(auth.*?auth-id=[\'|\"]{1}' + id + '[\'|\"]{1}).*>[\\s\\S]*?</.*auth.*>', 'gm' );
				tpl = tpl.replace( regExp, "" );
			}
		} );

		return tpl;
	}

	return spriteUtils;
} );