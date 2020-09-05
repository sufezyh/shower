define( function ( require, exports, module ) {
	var tpl = require( 'text!./checkin.html' );
	var qrcode = require( 'jquery.qrcode.min' );
	var appConfig = require( 'appConfig' );
	var api = require('api');
	return function () {
		var page = {
			template : tpl,
			data : function () {
				return {
					WID : "",
					PLACEID:"",
					//formModel 		: WIS_EMAP_SERV.getModel( "/modules/myAppointment.do", "getAppointmentMobDetail", "form" ),// 表单模型
					applicationInfo :{},
					hasData : false 
				};
			},
			created : function () {
				SDK.setTitleText( "预约详情" );
				document.title = "预约详情";
				this.WID = this.$route.query.WID;
				this.PLACEID = this.$route.query.PLACEID;
				this.getMyAppointmentInfo();
			},
			watch : {
			},
			mounted : function(){
				var $this = this;
				jQuery( '#qrCode_img' ).qrcode( {
					text : window.location.protocol + '//' + window.location.hostname + WIS_EMAP_SERV.getContextPath()  + "/sys/"+
                    APPNAME+ '/*default/index.do#/checkinResult?WID='+this.WID+ '&PLACEID=' + $this.PLACEID,
					width : 200,
					height : 200,
					fill : '#061255'
				} );
			},
			methods : {
				getMyAppointmentInfo : function () {
					var $this = this;
					var params = {
						WID : $this.WID
					};
					MOB_UTIL.Post(WIS_CONFIG.ROOT_PATH +appConfig.getAppointmentMobDetail, params).done(function(result) {
						var rows = result.datas.getAppointmentMobDetail.rows;
						if (rows.length !== 0) {
							$this.applicationInfo = rows[0];
							if($this.applicationInfo.IS_CANCELLED=='0' && $this.applicationInfo.IS_USE=='0'){
								//显示取消按钮
								$this.hasData = true;
			            	}
						}
					});
					 
				} ,
				saveRecode: function () {
					var $this = this;
					mintUI.MessageBox.confirm( "确定取消预约吗？" ).then(function() {
  						axios({
  	                      method: "POST",
  	                      url: api.appointmentCancel,
  	                      params: {
  	                    	WID:$this.WID,
							IS_CANCELLED:'1'
  	                      },
  						}).then(function(rsp) {
  							if ( rsp && rsp.data.code=='0') {
  				  				mintUI.Toast("取消预约成功！");
  				  					$this.hasData = false;
  								} else {
  									mintUI.Toast("取消预约失败！");
  							}
  						})
						})
				} 
			}
		};
		return page;
	};
 
} );