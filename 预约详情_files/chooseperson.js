define(function(require, exports, module) {
	var tpl = require("text!./chooseperson.html");
	return function() {
		var page = {
			template : tpl,
			props : {
				title : {
					"type" : String,
					"default" : ""
				},
				label : {
					"type" : String,
					"default" : "已选人员"
				},
				value : {
					"type" : Array,
					"default" : [],
					"example" : [ {
						name : "邢志武",
						id : "01116216",
						type : "2",
						deptCode : "000079",
						deptName : "人才交流培训中心",
					} ]
				},
				backgroud : {
					"type" : String,
					"default" : "unset"
				},
				searchType : {
					"type" : String,
					"default" : ""
				},
				top : {
					"type" : String,
					"default" : "0px"
				},
				buttom : {
					"type" : String,
					"default" : "0px"
				},
				multiSelect : {
					"type" : Boolean,
					"default" : false
				},
				placeholder : {
					"type" : String,
					"default" : "请选择"
				},
				required : {
					"type" : Boolean,
					"default" : false
				}
			},
			data : function() {
				return {
					multiSelectValue : this.getSelectedVal(),
					displayValue : "",
					dataUrl : contextPath + "/sys/itpub/widget/choose_person.do",
					params : '{"params":"{}"}'
				};
			},
			created : function() {
				if (this.searchType != '' && this.searchType != null) {
					var params = {
						searchType : this.searchType
					};
					this.params = JSON.stringify({
						params : JSON.stringify(params)
					})
				}
			},
			methods : {
				getSelectedVal : function() {
					var val = [];
					if (this.value != null && this.value != "" && this.value.length > 0) {
						this.value.map(function(item) {
							val.push(item.id);
						});
					}
					return val.join(',');
				},
				change : function(datas) {
					this.value = datas;
				},
				customLabel : function(item) {
					return (item.name ? item.name : "") + "(" + (item.id ? item.id : "") + ")" + "  " + (item.deptName ? item.deptName : "");
				}
			},
			watch : {
				value : {
					deep : true,
					handler : function(newVal) {
						var val = [];
						if (this.value != null && this.value != "" && this.value.length > 0) {
							this.value.map(function(item) {
								val.push(item.id);
							});
						}
						this.multiSelectValue = val.join(',');
						// this.$emit('change', this.value);
					}
				}
			}
		};
		return page;
	};
});