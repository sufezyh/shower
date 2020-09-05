define(function(require, exports, module) {

	var appConfig = {
			// 工作流名称
			defkey : APPNAME+ ".MainFlow",
			// 申请数据获取地址
			applyUrl : "T_PUBLIC_BATHROOM_APPLICATION_QUERY",
			// 审核数据获取地址
			reviewUrl : "T_PUBLIC_BATHROOM_APPLICATION_QUERY",
			// 查询数据获取地址
			queryUrl : "T_PUBLIC_BATHROOM_APPLICATION_QUERY",
			// 删除数据地址
			deleteUrl : "T_PUBLIC_BATHROOM_APPLICATION_DELETE",
			
			// 查询违约记录地址
			queryDefaultInquiryUrl : "defaultInquiry",
			// 查询进出馆记录地址
			queryAccessQueryUrl : "accessQuery",
			
			// 移动端-获取我的预约列表
			getMyAppointmentDataList : '/sys/' + APPNAME + '/modules/libraryQRCode/getMyAppointmentRecord.do',
			
			//获取预约详情
			getAppointmentMobDetail : '/sys/' + APPNAME + '/modules/myAppointment/getAppointmentMobDetail.do',
			//获取馆区详情
			getPublicPlaceSettingsData : '/sys/' + APPNAME + '/modules/myAppointment/getPublicPlaceSettingsData.do',
			
			getPublicPlaceSettingsMobData : '/sys/' + APPNAME + '/modules/publicPlaceSettings/getPublicPlaceSettingsData.do',
			//获取预约详情
			getAppointmentManagerMobDetail : '/sys/' + APPNAME + '/modules/publicPlaceSettings/getAppointmentMobDetail.do',
			//移动端-管理员获取今日预约数据
			getApplyManagerAdmin : '/sys/' + APPNAME + '/modules/bathroomStaff/getAppointmentByAdmin.do',
			// 应用名称：
			appName : APPNAME,
			// 审核节点
			reviewNodes : moduleNodes.review,
			// 申请节点
			applicationNode : moduleNodes.application,
			// 应用标题
			appTitle : "浴室预约",
			// 构造流转信息[表格]
			getFlowView : function ( taskid, processid ) {
				if ( !taskid ) {
					$.getFlowView( taskid, appConfig.defkey, '10%', '340px', '', true );
				} else {
					$.getFlowView( taskid, appConfig.defkey, '10%', '200px' );
				}
			},
			getNowFormatDate:function() {//获取当前时间
				var date = new Date();
				var seperator1 = "-";
				var seperator2 = ":";
				var month = date.getMonth() + 1<10? "0"+(date.getMonth() + 1):date.getMonth() + 1;
				var strDate = date.getDate()<10? "0" + date.getDate():date.getDate();
				var hour = date.getHours()<10?"0" + date.getHours():date.getHours();
				var minute = date.getMinutes()<10?"0" + date.getMinutes():date.getMinutes();
				var second = date.getSeconds()<10?"0" + date.getSeconds():date.getSeconds();
				var currentdate = date.getFullYear() + seperator1  + month  + seperator1  + strDate
						+ " "  + hour  + seperator2  + minute
						+ seperator2 + second;
				return currentdate;
			},
			getNowFormatDate2:function() {//获取当前时间 yyy-mm-dd
				var date = new Date();
				var seperator1 = "-";
				var seperator2 = ":";
				var month = date.getMonth() + 1<10? "0"+(date.getMonth() + 1):date.getMonth() + 1;
				var strDate = date.getDate()<10? "0" + date.getDate():date.getDate();
				var currentdate = date.getFullYear() + seperator1  + month  + seperator1  + strDate;
				return currentdate;
			},
			//计算天数差的函数，通用 
			DateDiff: function  (sDate1,  sDate2){   
			       var  aDate,  oDate1,  oDate2,  iDays 
			       aDate  =  sDate1.split("-") 
			       oDate1  =  new  Date(aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0])   
			       aDate  =  sDate2.split("-") 
			       oDate2  =  new  Date(aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0]) 
			       iDays  = ( oDate1  -  oDate2)  /  1000  /  60  /  60  /24   //把相差的毫秒数转换为天数 
			       return  iDays 
			},
			//判断结束时间是否在开始时间之后
			judgeEndDateAfterStartDate:function(startDate,endDate){
				//解决IE兼容性问题
				var startDate = startDate.replace(/-/g,'/');
				var endDate = endDate.replace(/-/g,'/');
				var nowDate = new Date();
				startDate = Date.parse(startDate);
				endDate = Date.parse(endDate);
				return endDate>=startDate;
			},
		};

		return appConfig;

});