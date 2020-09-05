$.extend({
	/*
	 * url:业务表的删除接口 param:删除参数{ processInstanceId:删除流程实例时候必填 defkey:删除流程实例时候必填
	 * isDelete:选填，true删除流程实例，false终止流程实例 其余参数根据实际应用业务表的删除方法添加 }
	 */
	deleteBusinessAndTask : function(url, param) {
		if (param.defkey && param.processInstanceId) {
			if(!param.isDelete){
				param.isDelete = true;
			}
			param.defKey = param.defkey;
			return $.doAjax(WIS_EMAP_SERV.getContextPath() + '/sys/emapflow/tasks/deleteInstance.do', param).done(function(data) {
				if (data.succeed) {
					$.doAjax(url, param);
				} else {
					$.err("删除失败");
				}
			});
		} else if (param.defkey || param.processInstanceId) {
			$.err("参数错误");
		} else {
			return $.doAjax(url, param);
		}
	},

	doAjax : function(url, param, type) {
		return $.ajax({
			url : url,
			type : 'POST',
			async : true,
			data : param,
			success : function(resp) {
				result = resp;
			},
			dataType : type
		});
	},

	/**
	 * 自定义显示列导出
	 * 
	 * @author hndai 01315003
	 * @param params {
	 *            taskType : 'ALL_ADMIN', // 未完成-NOTEND，已完成-ENDED，所有-ALL
	 *            flowStatus : flowStatus, // 流程状态 nodeId : '', //
	 *            流程定义中人工环节的编号，必填 appName : appName, // 应用的名称，必填 module :
	 *            module, // 模块名，可以没有，默认modules page : page, // 回调动作的epg的编号，必填
	 *            action : action, // 回调的动作，必填 '*order' : '-CREATED_AT',
	 *            exportAction : 'flowExport', //
	 *            流程导出动作，flowExport或者flowObserveExport tableContainerSelector :
	 *            '#emapdatatable', // 表格选择器，用于选择字段 searchContainerSelector :
	 *            '#emapAdvancedQuery' // 高级搜索选择器，用于导出搜索条件 }
	 * @date 2020年4月20日
	 * @since 1.0_TR3
	 */
	selectToExportFlowDatas : function(params) {
		var tableObj = $(params.tableContainerSelector).data().emapdatatable;
		var columns = WIS_EMAP_SERV.cloneObj(tableObj.$element.data('columns'));
		var newmodel = tableObj.$element.data('newmodel');
		var action = {
			type : 'export',
			columnsReorder : false,
			name : $.i18n('bh-dd-exportChoosedKeys'),
			handler : function(columns) {
				var selectedCols = [];
				columns.forEach(function(col) {
					if (col.hidden === false && col.hasOwnProperty('datafield')) {
						selectedCols.push(col.datafield);
					}
				});
				if (params.searchContainerSelector != null && params.searchContainerSelector != undefined && params.searchContainerSelector != '') {
					params.querySetting = $(params.searchContainerSelector).emapAdvancedQuery('getValue');
				}
				params.exportItems = selectedCols.join(',').replace(/_DISPLAY/g, '').toUpperCase();
				var exportAction = params.exportAction;
				delete params.tableContainerSelector;
				delete params.searchContainerSelector;
				_emapflow[exportAction](params);
			}
		}
		_initSelectColumnsWindow(tableObj, newmodel, columns, action);
	}
});

function _initSelectColumnsWindow(instance, newmodel, columns, action) {
	var callback = function(cols) {
		var colMap = {};
		cols.forEach(function(item) {
			colMap[item.name] = {
				hidden : item.hidden
			};
		});

		var clength = columns.length;
		if (action.type === 'export') {
			var exportCols = [];
			for (var i = 0; i < clength; i++) {
				if (columns[i].datafield) {
					var key = columns[i].datafield.replace('_DISPLAY', '');
					if (colMap[key]) {
						exportCols.push({
							datafield : key,
							hidden : !!colMap[key].hidden
						});
					}
				}
			}
			action.handler(exportCols);
		} else {
			if (action.columnsReorder) {
				if (columns.length === 1 && cols.length) {
					columns[0].hidden = cols[0].hidden;
				}
				var orderedCols = [];
				var indexs = [];
				columns.forEach(function(item, i) {
					if (item.datafield) {
						var index = indexOf(cols, function(col) {
							return col.name === item.datafield.replace('_DISPLAY', '');
						});
						if (index > -1) {
							item.hidden = cols[index].hidden;
							orderedCols[index] = item;
							return;
						}
					}
					indexs.push(i);
				});
				indexs.forEach(function(i) {
					orderedCols.splice(i, 0, columns[i]);
				});
				columns = compact(orderedCols);
			} else {
				for (var j = 0; j < clength; j++) {
					if (columns[j].datafield) {
						var key = columns[j].datafield.replace('_DISPLAY', '');
						if (colMap[key]) {
							columns[j].hidden = colMap[key].hidden;
						}
					}
				}
			}

			instance.$element.trigger('custom.grid', [ cols ]);
			action.handler(columns);
		}
	};
	var opt = {
		model : newmodel,
		alwaysHide : $.extend([], instance.settings.alwaysHide, action.hides || []),
		callback : callback,
		columns : columns,
		title : action.name,
		params : {},
		type : action.type,
		mustSelect : instance.settings.mustSelect,
		columnsReorder : action.columnsReorder,
		useGroup : WIS_EMAP_CONFIG.customFieldsUseGroup
	};
	$.extend(opt.params, action.dialogOpt);
	opt.schemaList = instance.$element.data('schemaList');
	$.bhCustomizeColumn(opt);
}