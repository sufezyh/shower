/**
 * 
 */
var _emapflow = {
	getQueryTasksByNodeUrl : function() {
		return WIS_EMAP_SERV.getContextPath()
				+ '/sys/emapflow/*default/index/queryUserTasksByNode.do';
	},

	getQueryTasksByNodeAction : function() {
		return 'queryUserTasksByNode';
	},

	getQueryTasksUrl : function() {
		return WIS_EMAP_SERV.getContextPath()
				+ '/sys/emapflow/*default/index/queryUserTasks.do';
	},

	getQueryTasksAction : function() {
		return 'queryUserTasks';
	},
	
	getObserveQueryTasksUrl : function() {
		return WIS_EMAP_SERV.getContextPath()
				+ '/sys/emapflow/*default/index/queryObserveUserTasks.do';
	},
	
	getObserveQueryTasksAction : function() {
		return 'queryObserveUserTasks';
	},
	
	getDataModel : function(params) {
		if (params.module == null || typeof (params.module) == "undefined")
			params.module = "modules";

		var model = WIS_EMAP_SERV.getModel(
				params.module + "/" + params.page + ".do", params.action,
				'grid', {
					pageNumber : 1
				});
		
		return model;
	},

	getDataModels : function(params) {
		var module = params.module == null ? "modules" : params.module;
		var model = WIS_EMAP_SERV.getModel(module + "/" + params.page + ".do", 
				params.action, 'grid', {pageNumber: 1});
		// 加入流程状态等字段
		model.push(this.makeExtModelItem("PROCESSINSTANCEID"), 
				this.makeExtModelItem("DEFID"),
				this.makeExtModelItem("DEFKEY"),
				this.makeExtModelItem("NODEID"),
				this.makeExtModelItem("NODENAME"),
				this.makeExtModelItem("TASKID"),
				this.makeExtModelItem("FLOWSTATUS"),
				this.makeExtModelItem("TASKSTATUS"),
				this.makeExtModelItem("TASKINFO"),
				this.makeExtModelItem("FLOWSUSPENSION"));
		if (!params.hideFlowState) {
			model.push({
				caption : "流程状态",
				dataSize : 8,
				dataType : "String",
				name : "FLOWSTATUSNAME"
			});
		}
		if (!params.hideTaskState) {
			model.push({
				caption : "任务状态",
				dataSize : 8,
				dataType : "String",
				name : "TASKSTATUSNAME"
			});
		}
		if (params.hideFlowSuspension != null && !params.hideFlowSuspension) {
			model.push({
				caption : "挂起",
				dataSize : 8,
				dataType : "String",
				name : "FLOWSUSPENSIONNAME"
			});
		}
		return WIS_EMAP_SERV.convertModel(model, 'grid');
	},
	
	makeExtModelItem : function(name) {
		return {
			dataSize: 8,
			dataType: "String",
			caption: "",
			name: name,
			hidden: true,
			'grid.fixed': true
		};
	},

	convertGridOption : function(params, option) {
		option.url = this.getQueryTasksUrl();
		option.action = this.getQueryTasksAction();
		option.datamodel = this.getDataModels(params);
		return option;
	},

	// 拼接加载表单模型
	getIntegratedModel : function(pageModel, action, defKey, taskId) {
		var model = WIS_EMAP_SERV.getIntegratedModel(pageModel, action, 'form', {
			"defKey" : defKey,
			"taskId" : taskId
		}, "POST");
		
		return model;
	},
	
	// 流程导出
	flowExport : function(params) {
		window.open(WIS_EMAP_SERV.getContextPath() + '/sys/emapflow/*default/index/exportUserTasks.do?' + $.param(params));
	},
	
	// 流程导出
	flowObserveExport : function(params) {
		window.open(WIS_EMAP_SERV.getContextPath() + '/sys/emapflow/*default/index/exportObserveUserTasks.do?' + $.param(params));
	}
}