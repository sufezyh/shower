define( function ( require ) {
	var appConfig = require( 'appConfig' );
	return {
		// 申请相关接口
		deleteApplication 	: WIS_CONFIG.ROOT_PATH + '/sys/' + appConfig.appName + '/api/applications/delete.do',
		getApplication		: WIS_CONFIG.ROOT_PATH + '/sys/' + appConfig.appName + '/api/applications.do',
		getUserDetails 		: WIS_CONFIG.ROOT_PATH + '/sys/itpub/api/getUserDetails.do',
		// 流程相关接口
		getProcessInfo 		: WIS_CONFIG.ROOT_PATH + '/sys/emapflow/tasks/queryFlowState.do?responseType=JSON&taskId=',
		startFlow 			: WIS_CONFIG.ROOT_PATH + '/sys/emapflow/tasks/startFlow.do',
		execute 			: WIS_CONFIG.ROOT_PATH + '/sys/emapflow/tasks/execute.do',
		callback 			: WIS_CONFIG.ROOT_PATH + '/sys/emapflow/tasks/callback.do',
		turnback 			: WIS_CONFIG.ROOT_PATH + '/sys/emapflow/tasks/turnback.do',
		terminateInstance 	: WIS_CONFIG.ROOT_PATH + '/sys/emapflow/tasks/terminateInstance.do',
		
		// 移动端接口
		// 我的预约
		getMyAppointmentData		: WIS_CONFIG.ROOT_PATH + '/sys/' + appConfig.appName + '/api/getMyAppointmentData.do',	
		getViolated					: WIS_CONFIG.ROOT_PATH + '/sys/' + appConfig.appName + '/api/getViolated.do',
		isToday						: WIS_CONFIG.ROOT_PATH + '/sys/' + appConfig.appName + '/api/isToday.do',
		
		getMobileMyAppointmentData	: WIS_CONFIG.ROOT_PATH + '/sys/' + appConfig.appName + '/mobile/getMobileMyAppointmentData.do',
		appointmentValidate			: WIS_CONFIG.ROOT_PATH + '/sys/' + appConfig.appName + '/api/appointmentValidate.do',
		appointmentSave				: WIS_CONFIG.ROOT_PATH + '/sys/' + appConfig.appName + '/api/appointmentSave.do',
		getMyAppointmentRecord		: WIS_CONFIG.ROOT_PATH + '/sys/' + APPNAME + '/modules/myAppointment/getMyAppointmentRecord.do',
		appointmentCancel			: WIS_CONFIG.ROOT_PATH + '/sys/' + APPNAME + '/modules/myAppointment/T_PUBLIC_BATHROOM_APPLICATION_MODIFY.do',
		accessQuery					: WIS_CONFIG.ROOT_PATH + '/sys/' + APPNAME + '/modules/accessQuery/accessQuery.do',
		getViolated					: WIS_CONFIG.ROOT_PATH + '/sys/' + APPNAME + '/modules/myAppointment/T_PUBLIC_ROOM_BLACKLIST_QUERY.do',
	};
} );
