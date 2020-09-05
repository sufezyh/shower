define( function ( require, exports, module ) {
	var tpl = require( 'text!basicComponents/selectrole/selectrole.html' );
	var spriteUtils = require( 'spriteUtils' );

	return function () {
		var page = {
			template : tpl,
			data : function () {
				return {
					// 用于控制是否展示空页面
					hasDatas 	: true,
					// 当前展示的数组
					list 		: [],
					listBackup	: [],
					styleObject : {
						"margin-top" : ""
					}
				};
			},
			created : function () {
				SDK.setTitleText( "选择角色" );
				this.sendGetUserRoles();
			},
			activated : function () {
				if ( this.listBackup && this.listBackup.length > 0  ) {
					this.list = this.listBackup;
					this.hasDatas = true;
				}
			},
			updated : function () {
				// 计算页面高度，使加载的角色内容始终居中
				var screenHeight = document.documentElement.clientHeight;
				var roleNum = this.list.length;
				if ( screenHeight <= 109 * roleNum ) {
					this.styleObject["margin-top"] = "20px !important";
				} else {
					var diff = screenHeight - 109 * roleNum;
					this.styleObject["margin-top"] = diff / 2 + "px !important";
				}
			},
			methods : {
				/**
				 * 查询用户角色
				 */
				sendGetUserRoles : function () {
					var $this = this;
					var url = WIS_CONFIG.ROOT_PATH + '/sys/itpub/mobile/api/authenticated/funauth/users/roles.do';
					var data = {
						APPID 		: window.WIS_CONFIG.APPID,
						APPNAME 	: window.WIS_CONFIG.APPNAME
					}
					
					MOB_UTIL.doPost( {
						url 		: url,
						params 		: data
					} ).done( function ( result ) {
						if ( result.code == '0' ) {
							var roles = result.data;
							if ( roles && roles.length == 1 ) {
								$this.setAppRole ( roles[0]['id'] ).done ( function () {
									spriteUtils.startIndexView ();
								}); 
								$this.listBackup = roles;
							} else if ( roles && roles.length > 0 ) {
								$this.list = roles;
								$this.hasDatas = true;
							} else {
								$this.list = [];
								$this.hasDatas = false;
							}
						} else {
							mintUI.MessageBox( '提示', result.msg );
						}
					} );
				},
				/**
				 * 点击角色进入角色配置页面
				 */
				startIndexView : function ( e ) {
					var selectedRoleId = e.currentTarget.getAttribute( "roleId" );
					this.setAppRole( selectedRoleId ).done( function () {
						spriteUtils.startIndexView ();
					} );
				},
				/**
				 * 设置登录角色
				 */
				setAppRole : function ( roleId ) {
					var params = {
						url : WIS_CONFIG.ROOT_PATH + '/sys/itpub/mobile/api/authenticated/users/setupRole.do',
						params : {
							APPID 	: WIS_CONFIG.APPID,
							APPNAME : WIS_CONFIG.APPNAME,
							ROLEID 	: roleId
						}
					};
					return MOB_UTIL.doPost( params );
				}
			}
		};
		return page;
	};

} );