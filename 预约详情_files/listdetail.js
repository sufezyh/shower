define(function (require, exports, module) {
	var tpl = require('text!./listdetail.html');
	//var util = require('util');
	var api = require('api');
	return function () {
		var page = {
			template : tpl,
			data : function () {
				return {
					page: 'about',
					selected: '1',
	                subselected:'sub1',
	                current2:'',
	                current3:'',
	                wid:'',
	                appointmentData:{},
	                cancalBtn:true 
				};
			},
			created : function () {
				this.wid = this.$route.query.WID;
				this.getPublicPlaceDate(this.wid);
				
				
			},
			watch : { 
			},
	
			activated : function () {
				SDK.setTitleText("我的预约");
				document.title = "我的预约";
			//	this.initPage();
			},
			methods : {
				
				getPublicPlaceDate:function(wid){
					var self = this;
					var params={
							WID:this.wid
					};
					MOB_UTIL.Post(api.getMyAppointmentRecord, params).done(function (result) {
						var rows = result.datas.getMyAppointmentRecord.rows;
						if (rows.length !== 0) {
							self.appointmentData = rows[0];
						}
					});
				},
				 
				//取消预约
				cancelApply:function(wid){
					var self  = this;
					mintUI.MessageBox.confirm( "确定取消预约吗？" ).then(function() {
  						axios({
  	                      method: "POST",
  	                      url: api.appointmentCancel,
  	                      params: {
  	                    	WID:wid,
							IS_CANCELLED:'1'
  	                      },
  						}).then(function(rsp) {
  							if ( rsp && rsp.data.code=='0') {
  				  				mintUI.Toast("取消预约成功！");
  				  				self.cancalBtn = false;
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

});