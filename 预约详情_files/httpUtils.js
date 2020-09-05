define( function ( require ) {
	const OK_STATUS = '0';
	
	var qs = require ( 'qs' );
	
	// 默认超时时间
	var requestTimeout = 5 * 1000;
	var defaultContentType = 'application/x-www-form-urlencoded;charset=UTF-8';
	
	// 定义一个加载弹出框，调用方可以自行实现自己需要加载控件
	var loadingDialog = {
			show 	: function () {
				mintUI.Indicator.open();
			},
			
			dismiss	: function () {
				mintUI.Indicator.close();
			}
	};
	// 定义一个消息框，提供了error和toast方法，调用方可以自行实现自己需要加载控件
	var messageDialog = {
			error	: function ( message, title ) {
				if ( !title ) {
					title = "系统消息";
				}
				mintUI.MessageBox( title, message );
			},
			toast	: function ( message ) {
				mintUI.Toast( message );
			}
	};
	
	// 请求前的拦截器配置
	var beforeHandle = function ( axiosProxy, options ) {
		if ( !axiosProxy ) {
			return false;
		}
		
		axiosProxy.interceptors.request.use( function ( config ) {
			config = Object.assign ( config, options );
			// Sets request timeout for default value.
			if ( !config.timeout ) {
				config.timeout = requestTimeout;
			}
			if ( !config.headers['Content-Type'] ) {
				config.headers['Content-Type'] = defaultContentType;
			}
			// Will config.data serialize to queryString that sets to the config.params if the method is 'get'.
			if ( config.method && config.method.toLowerCase() == 'get' ) {
				if ( config.data ) {
					config.params = config.data;
					config.data = {};
				}
			}
			if ( config.method && config.method.toLowerCase() == 'post' ) {
				if ( config.data ) {
					config.data = qs.stringify( config.data );
				}
			}
			// Show loading dialog if the attribute 'showLoading' is true.
			if ( config.showLoading ) {
				loadingDialog.show ();
			}
			return config;
		}, function ( error ) {
			console.error ( error );
			return Promise.reject( error );
		});
	};
	
	// 响应拦截器的配置
	var afterHandle = function ( axiosProxy, options, deferred ) {
		if ( !axiosProxy ) {
			return false;
		}
		
		axiosProxy.interceptors.response.use( function ( response ) {
			// Close loading dialog if the attribute 'showLoading' is true.
			if ( options.showLoading ) {
				loadingDialog.dismiss ();
			}
			return response;
		}, function ( error ) {
			// Close loading dialog if the attribute 'showLoading' is true.
			if ( options.showLoading ) {
				loadingDialog.dismiss ();
			}
			if ( error.message.includes( 'timeout' ) ) {
				messageDialog.error ( "请求超时，请本地网络是否正常！" );
				return;
			}
			if ( error.response.status && options.showErrorDialog ) {
	            switch ( error.response.status ) {
	                case 401 :
	                	messageDialog.error ( "您当前还未认证，请前往认证系统认证", "401" );
	                	break;
	                case 403:
	                	messageDialog.error ( "没有权限访问", "403" );
	                    break;
	                case 404:
	                	messageDialog.error ( "您访问的接口未找到", "404" );
	                    break;
	                case 500:
	                	messageDialog.error ( "系统内部异常", "500" );
	                	break;
	                // 其他错误，直接抛出错误提示                
	                default:
	                	messageDialog.error ( error.message );
	            }
	        }
			// Write an error message to console.
			console.error ( error );
			// Callback the reject function.
			deferred.reject ( error );
		});
	}
	
	
	var httpUtils = {
			/**
			 * 发起一个Http GET的请求
			 * @param _options 参考#sendHttpRequest方法
			 */
			get : function ( _options ) {
				var options = {
						method	: 'get'
				};
				$.extend ( _options, options, true );
				return this.sendHttpRequest ( _options );
			},
			/**
			 * 发起一个Http POST的请求
			 * @param _options 参考#sendHttpRequest方法
			 */
			post : function ( _options ) {
				var options = {
						method	: 'post'
				};
				$.extend ( _options, options, true );
				return this.sendHttpRequest ( _options );
			},
			/**
			 * 发起一个Http PUT的请求
			 * @param _options 参考#sendHttpRequest方法
			 */
			put : function ( _options ) {
				var options = {
						method	: 'put'
				};
				$.extend ( _options, options, true );
				return this.sendHttpRequest ( _options );
			},
			/**
			 * 发起一个Http DELETE的请求
			 * @param _options 参考#sendHttpRequest方法
			 */
			'delete' : function ( _options ) {
				var options = {
						method	: 'delete'
				};
				$.extend ( _options, options, true );
				return this.sendHttpRequest ( _options );
			},
			/**
			 * <p>发起一个Http的请求
			 * 其他的配置参数可以参考axios官方文档中的config.
			 * @param _options = {
			 * 		url 		: 'http://www.xx.com/api/yyy/zzz',
			 * 		data 		: {},
			 * 		method 		: 'get|post|put|delete',
			 *      headers		: {
			 *      	Content-Type 	: 'application/json',
			 *      	User-Agent		: 'Mozilla/5.0' 
			 *      },
			 *      timeout		: 0,
			 *      // 是否需要显示加载框，默认为`true`
			 * 		showLoading : 'true|false',
			 * 		// 是否需要显示错误响应报文的提示框，默认为`true`
			 * 		showErrorDialog : 'true|false',
			 * 		// 如果服务端出现了错误将会回调此方法
			 * 		// `deferred` 是jquery中的Deferred
			 * 		// `result` 为响应报文
			 * 		serverErrorHandler : function (deferred, result) {
			 * 			// doing something.
			 * 		},
			 * }
			 */
			sendHttpRequest : function ( _options ) {
				var options = {
					url					: '',		// 接口地址
					data				: {},		// 入参
					method				: 'post',	// http的method
					showLoading			: true,		// 是否需要显示加载框，默认为`true`
					showErrorDialog		: true,		// 是否需要显示错误响应报文的提示框，默认为`true`
					headers				: {},		// http的header
					serverErrorHandler 	: function ( deferred, result ) { // 当接口端返回错误信息时调用此函数
						var errormsg = result.msg || '系统内部错误，请联系管理员';
						messageDialog.toast ( errormsg );
						dfd.reject( result );
					},
				};
				
				options = Object.assign ( options, _options );
				
				var dfd = $.Deferred();
				var instance = axios.create( options );
				
				beforeHandle ( instance, options );
				afterHandle ( instance, options, dfd );
				
				instance.request ().then( function( response ) {
					if ( !response || !response.data ) {
						return;
					}
					var result = response.data;
					if ( result.code === '0' ) {
						dfd.resolve( result );
					} else {
						if ( typeof(options.serverErrorHandler) == 'function' ) {
							options.serverErrorHandler ( dfd, result );
						} else {
							dfd.reject( result );
						}
					}
				})
				return dfd;
			},
	};
	return httpUtils;
});