define(function(require, exports, module) {
	var tpl = require('text!./emapflowview.html');
	return function() {
		var page = {
			template : tpl,
			props : [ 'taskid', 'processid', 'hideUserId', 'flowstatus' ],
			data : function() {
				return {
					items : [],
					flowStatusNames : [ '', '审核中', '已驳回', '已完成', '草稿', '已终止', '已撤回' ]
				};
			},
			filters : {
				formatTime : function(val) {
					return val ? val.substr(11, 5) : '';
				},
				formatDate : function(val) {
					return val ? val.substr(0, 10).replace(/-/g, '.') : '';
				},
				formatType : function(val) {
					return val;// val?val.substr(0, 10).replace(/-/g, '.'):'';
				}
			},
			mounted : function() {
				var that = this;
				var urlParam = 'taskId=' + this.taskid;
				if (this.processid != null && this.processid != "") {
					urlParam = 'processInstanceId=' + this.processid;
				}
				MOB_UTIL.Post(WIS_CONFIG.ROOT_PATH + "/sys/emapflow/tasks/queryFlowState.do?" + urlParam + "&responseType=JSON").then(function(response) {
					// console.log(response)
					var data = response;
					for (var i = 0; i < data.length; i++) {
						var assignee = data[i].assignee;
						if (that.hideUserId == true) {
							assignee = assignee.replace(/\((([^()]*|\([^()]*\))*)\)/g, '');
						}
						data[i].assignee = assignee;
						// type重新赋值
						if (data[i].flowComment == "取回") {
							data[i].type = "撤回";
							data[i].flowComment = '';
						} else if (data[i].typeCode == "turnback") {
							data[i].type = "退回";
						} else if (data[i].typeCode == "completed" && data[i].nodeId == "usertask1") {
							data[i].type = "已提交";
							data[i].flowComment = '';
						} else if (data[i].typeCode == "completed" && data[i].nodeId != "usertask1") {
							data[i].type = "已提交";
						} else if (data[i].typeCode == "completed" && data[i].nodeId != "endevent1") {
							data[i].type = "已提交";
						} else if ((data[i].typeCode == "" || data[i].typeCode == null) && data[i].nodeId != "usertask1" && data[i].nodeId != "endevent1") {
							data[i].type = "待审核";
						}
					}
					that.items = [];
					data.map(function(el, i) {
						var map = data[data.length - 1 - i];
						if (map.nodeId == "usertask1") {
							map.isApply = true;
						}
						if (data.length - 1 - i == 1) {
							map.isFirstApply = true;
						}
						if (data.length - 1 - i != 1 && map.nodeId != "endevent1") {
							if (i != 0 || (map.nodeId != "usertask1" && i == 0)) {
								map.showType = true;
							}
						}
						if (map.nodeId != "startevent1") {
							that.items.push(map);
						}
					});
				});
			},
			methods : {
				getStatus : function(item) {
					if (item.isFirstApply) {
						return "";
					}
					if (item.typeCode == "turnback" || item.typeCode == "termination") {
						return "error";
					} else {
						return item.typeCode == null ? "process" : "finish";
					}
				}
			}
		};
		return page;
	};
});