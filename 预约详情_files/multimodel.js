define(function(require, exports, module) {
	var tpl = require('text!./multimodel.html');
	return function() {
		var page = {
			template : tpl,
			name : "multi-model",
			props : {
				'label' : {
					type : [ String, Number ]
				},
				'title' : {
					type : [ String, Number ],
					required : true
				},
				'titleBtn' : {
					"default" : "+添加"
				},
				'model' : {
					type : Object,
					required : true
				},
				'readonly' : {
					type : Boolean,
					"default" : true
				},
				'valueList' : {
					type : Array,
					required : true
				},
				'limit' : [ String, Number ],
				'showAdd' : {
					type : Boolean,
					"default" : false
				},
				'showDel' : {
					type : Boolean,
					"default" : false
				}
			},
			data : function() {
				return {
					items : [],
					formValueList : [],
					multiNum : 1,
					delWids : []
				};
			},
			mounted : function() {
				var that = this;
				that.formValueList = that.valueList;
				if (that.formValueList != null && that.formValueList.length > 0) {
					that.multiNum = that.formValueList.length;
				}
			},
			methods : {
				addMulti : function() {
					if (this.limit != null && this.limit <= this.multiNum) {
						mintUI.Toast({
							message : "条数已达上限",
							iconClass : "iconfont mint-icon-i icon-error"
						});
						return;
					}
					this.multiNum++;
				},
				delMulti : function(i) {
					var self = this;
					mintUI.MessageBox.confirm('确定删除当前数据？').then(function() {
						if (self.formValueList[i] && self.formValueList[i].WID != '' && self.formValueList[i].WID != null) {
							self.delWids.push(self.formValueList[i].WID)
						}
						if (self.formValueList.length > 0) {
							self.formValueList.splice(i, 1);
						}
						if (self.multiNum == 1) {
							return;
						} else {
							self.multiNum--;
						}
					});
				},
				validate : function() {
					var formFlag = true;
					for (var i = 0; i < this.$refs.form.length; i++) {
						var tempFlag = this.$refs.form[i].validate();
						if (!tempFlag) {
							formFlag = false;
						}
					}
					return formFlag;
				}
			}
		};
		return page;
	};
});