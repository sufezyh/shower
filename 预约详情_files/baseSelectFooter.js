define(function(require, exports, module) {
	var tpl = require("text!./baseSelectFooter.html");
	return function() {
		var page = {
			template : tpl,
			props : {
				options : {
					required : true,
					type : Array
				},
				value : {
					required : true,
					type : Array
				},
				customLabel : Function
			},
			data : function() {
				return {
					isShowDetail : false,
					currentValue : []
				};
			},
			watch : {
				value : function(val) {
					this.currentValue = val.slice(0, this.value.length);
				}
			},
			computed : {
				listData : function() {
					var self = this;
					if (this.value.length === 0 || this.options.length === 0) {
						return [];
					}
					return this.options.filter(function(item) {
						return self.value.indexOf(item.id.toString()) > -1;
					}).map(function(item) {
						return $.extend(item, {
							value : item.id,
							label : item.name
						});
					});
				}
			},
			methods : {
				formatLabel : function(item) {
					var label = "";
					if (typeof this.customLabel == "function") {
						label = this.customLabel(item);
					} else {
						label = item.label;
					}
					return label;
				},
				handleCancel : function() {
					this.currentValue = JSON.parse(JSON.stringify(this.value));
					this.isShowDetail = false;
				},
				handleClickListConfirm : function() {
					this.$emit('input', this.currentValue);
					this.isShowDetail = false;
				},
				handleConfirm : function() {
					this.$emit('confirm-click');
				}
			},
			created : function() {
				this.currentValue = this.value.slice(0, this.value.length);
			}
		};
		return page;
	};
});