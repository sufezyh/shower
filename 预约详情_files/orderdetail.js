define(function (require, exports, module) {
	var tpl = require('text!./orderdetail.html');
	var api = require('api');
	return function () {
		var page = {
			template : tpl,
			data : function () {
				return {
					wid:'',
					kssj:'',
					jssj:'',
					publicPlace:{},
					recordsArr:[]
				};
			},
			created : function () {
				this.wid = this.$route.query.WID;
				this.getSinglePublicPlaceDate(this.wid);
			},
			watch : { 
			},

			activated : function () {
				SDK.setTitleText("场馆详情");
				document.title = "场馆详情";
			},
			methods : {
				/**
				 * 获取单个场馆数据
				 */
				getSinglePublicPlaceDate : function (wid) {
					var $this = this;
					var params = {
						'WID'		: wid
					};
					MOB_UTIL.Post(api.getMobileMyAppointmentData, params).done(function(result) {
						if(result.datas){
							$this.recordsArr = result.datas.openTimeList;
							$this.recordsArr.sort(function (a, b) {
					    		if (a.DAY < b.DAY) {
					    			return -1;
					    		} else if (a.DAY == b.DAY) {
					    			return 0;
					    		} else {
					    			return 1;
					    		}
					    	});
							$this.publicPlace = result.datas.publicPlace[0]
						}
					});
				},
				appointment:function(publicPlace,items){
					if(publicPlace.PRECONTRACT_MAX_NUM - items.COUNT <= 0){
						mintUI.MessageBox("预约失败，该时间段已无法预约");
						return false;
					}
					var self = this;
					var timeArr=items.RECORDS.split("-");
					var begin_time = items.DAY+" "+timeArr[0];
					var end_time = items.DAY+" "+timeArr[1];

					var validateParams={
							begin_time:begin_time,
							end_time:end_time,
							palce_id:publicPlace.WID
					};
					var saveParams = {
							USER_ID:USERID,
    						USER_NAME:USER_INFO.userName,
    						DEPT_CODE : USER_INFO.deptCode,
    						DEPT_NAME:USER_INFO.deptName,
    						PHONE_NUMBER:USER_INFO.phone,
    						PALCE_ID:publicPlace.WID,
    						BEGINNING_DATE:begin_time,
    						ENDING_DATE:end_time,
    						SCHOOL_DISTRICT_CODE:publicPlace.SCHOOL_DISTRICT_CODE,
    						SCHOOL_DISTRICT:publicPlace.CAMPUS,
    						LOCATION:publicPlace.LOCATION,
    						PLACE_NAME:publicPlace.PLACE_NAME,
    						IS_CANCELLED:0
					};
					axios({
	                      method: "POST",
	                      url: api.appointmentValidate,
	                      params: validateParams,
	                  }).then(function(result) {
	  					if(result && result.data.code==0){
	  						
	  						mintUI.MessageBox.confirm( "确定预约"+items.DAY+" "+items.RECORDS+"吗？" ).then(function() {
		  						axios({
		  	                      method: "POST",
		  	                      url: api.appointmentSave,
		  	                      params: {
		  	                    	formData:JSON.stringify(saveParams)
		  	                      },
		  						}).then(function(rsp) {
		  							if(rsp && rsp.data.code=='0'){
		  								self.getSinglePublicPlaceDate(self.wid);
		  								mintUI.Toast(rsp.data.msg);
		  							}else{
		  								mintUI.Toast(rsp.data.msg);
		  							}
		  	  					
		  						})
	  						});	
	  					}else{
	  						mintUI.MessageBox(result.data.msg);
	  						return;
	  					}
	                  })
//					MOB_UTIL.Post(api.appointmentValidate, params).done(function(result) {
//						if(result.datas){
//							$this.recordsArr = result.datas.openTimeList;
//							$this.publicPlace = result.datas.publicPlace[0]
//						}
//						
//					});
				}
			}
		};
		return page;
	};
});