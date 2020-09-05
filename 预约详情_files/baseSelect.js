define(function(require, exports, module) {
	var tpl = require("text!./baseSelect.html");
	const
	pageSize = 20;
	return function() {
		var page = {
			template : tpl,
			props : {
				search : {
					type : Boolean,
					"default" : true
				},
				readonly : {
					type : Boolean,
					"default" : false
				},
				disabled : {
					type : Boolean,
					"default" : false
				},
				required : {
					type : Boolean,
					"default" : false
				},
				displayValue : {
					"default" : ''
				},
				value : {
					"default" : ''
				},
				selectedOptions : {
					type : Array,
					"default" : []
				},
				/**
				 * @noteType prop
				 * @field label
				 * @desc 标题
				 * @type input
				 * @value 标题
				 */
				label : {
					type : String,
					required : true
				},
				/**
				 * @noteType prop
				 * @field placeholder
				 * @desc 占位文本
				 * @type input
				 * @value 请选择
				 */
				placeholder : {
					type : String,
					"default" : '请选择'
				},
				options : {
					type : Array,
					"default" : []
				},
				/**
				 * @noteType prop
				 * @field selectType
				 * @desc 选择器类型
				 * @type multi-select ,select
				 */
				selectType : {
					type : String,
					"default" : 'select'
				},
				titlewidth : {
					type : String,
					"default" : function() {
						return '';
					}
				},
				textalign : {
					type : String,
					"default" : function() {
						return '';// flex-start
					}
				},
				direction : String,
				dataUrl : String,
				params : "",
				customLabel : Function
			},
			data : function() {
				return {
					searchKey : '',
					selectorShow : false,
					cHeight : document.documentElement.clientHeight,
					footerHeight : 59,
					searchHeight : 44,
					currentValue : this.getCurrentValue(this.value, this.selectType),
					start : 1,
					preHandler : {},
					allLoaded : false
				};
			},
			created : function() {
				// debugger
				console.log(this);
				// this.selectOptions = [];
				// this.selectedOptions = [];
				// if(this.value!=''&&this.value!=null&&this.value.length)
				if (this.dataUrl == '' || this.dataUrl == null) {
					this.options = [];
				}
				// this.loadMore();
			},
			filters : {},
			computed : {
				checklistHeight : function() {
					if (this.search) {
						return this.cHeight - this.footerHeight - this.searchHeight;
					}
					return this.cHeight - this.footerHeight;
				},
				radiolistHeight : function() {
					var visibleHeight = '';
					if (this.search) {
						visibleHeight = this.cHeight - this.searchHeight - 44;
					} else {
						visibleHeight = this.cHeight - 44;
					}
					var contentHeight = (this.selectOptions && this.selectOptions.length > 0) ? this.selectOptions.length * 50 : 10000;// 50是标准单个cell的高度
					return (visibleHeight > contentHeight) ? contentHeight : visibleHeight;
				},
				convertedOptions : function() {
					return this.getSelectOptions(this.options);
				},
				selectOptions : function() {
					var self = this;
					if (this.searchKey) {
						var options = [];
						if (this.dataUrl == '' || this.dataUrl == null) {
							options = this.convertedOptions.filter(function(item) {
								return (item.label ? item.label : "").indexOf(self.searchKey) > -1;
							}).slice(0, this.start * pageSize);
							return options;
						} else {
							self.$nextTick(function() {
								if (self.options.length < pageSize && !self.allLoaded) {
									self.loadMore();
								}
							});
						}
					}
					return this.convertedOptions.slice(0, this.start * pageSize);
				},
				selectedDisplayValue : function() {
					var currentValue = this.value;
					if (currentValue) {
						if (this.selectedOptions != '' && this.selectedOptions != null && this.selectedOptions.length > 0) {
							var displays = [];
							var vals = currentValue.split(',');
							this.selectedOptions.forEach(function(item) {
								vals.forEach(function(v) {
									if (v === item.id) {
										displays.push(item.name);
									}
								});
							});
							return displays.join(',') || this.displayValue;
						} else if (!this.options.length) {
							return this.displayValue;
						} else {
							var displays = [];
							var vals = currentValue.split(',');
							this.options.forEach(function(item) {
								vals.forEach(function(v) {
									if (v === item.id) {
										displays.push(item.name);
									}
								});
							});
							return displays.join(',') || this.displayValue;
						}
					}
					if (!this.readonly) {
						return this.placeholder;
					}
					return this.displayValue;
				}
			},

			watch : {
				value : function(val) {
					if (!this._isValueEqual()) {
						this.currentValue = this.getCurrentValue(val, this.selectType);
					}
					this.$emit('display-change', this.selectedDisplayValue);
				},
				currentValue : function(val) {
					// 移除禁止滑动事件
					// document.removeEventListener('touchmove',
					// this.preHandler, false);
					var self = this;
					var options = $.extend([], this.options);
					self.selectedOptions.map(function(el) {
						var contain = false;
						for (var i = 0; i < self.options.length; i++) {
							if (self.options[i].id == el.id) {
								contain = true;
							}
						}
						if (!contain) {
							options.push(el);
						}
					});
					var selected = options.filter(function(item) {
						return val.indexOf(item.id.toString()) > -1;
					}).map(function(item) {
						return $.extend(item, {
							value : item.id,
							label : item.name
						});
					});
					selected.map(function(el, index) {
						var contain = false;
						for (var i = 0; i < self.selectedOptions.length; i++) {
							if (self.selectedOptions[i].id == el.id) {
								contain = true;
							}
						}
						if (!contain) {
							self.selectedOptions.push(el);
						}
					});
					self.selectedOptions.map(function(el, index) {
						var contain = false;
						for (var i = 0; i < selected.length; i++) {
							if (selected[i].id == el.id) {
								contain = true;
							}
						}
						if (!contain) {
							self.selectedOptions.splice(index, 1);
						}
					});
					if (this.selectType === 'select') {
						this.$emit('input', (val || '').toString());
						this.$emit('change', selected);
					}
					$('body').removeClass('vf-h');
					$('#app').removeClass('vf-h');
				},
				selectorShow : function(val) {
					this.preHandler = function(e) {
						e.preventDefault();
					}
					if (val) {
						// if(localStorage.getItem('cHeight')){
						// this.cHeight = localStorage.getItem('cHeight')
						// }else {
						// this.cHeight = document.documentElement.clientHeight;
						// localStorage.setItem('cHeight',this.cHeight)
						// }
						// 添加禁止滑动事件
						// document.addEventListener('touchmove',
						// this.preHandler, false);
						$('body').addClass('vf-h');
						$('#app').addClass('vf-h');
					} else {
						// 移除禁止滑动事件
						// document.removeEventListener('touchmove',
						// this.preHandler, false);
						if (!this._isValueEqual()) {
							// 如果用户没有点击确定，重置勾选状态
							this.currentValue = this.getCurrentValue(this.value, this.selectType);
						}
					}
				},
				options : function() {
					if (this.dataUrl == '' || this.dataUrl == null) {
						this.start = 1;
					}
				},
				searchKey : function() {
					if (this.dataUrl != '' && this.dataUrl != null) {
						this.start = 1;
						this.options = [];
						this.allLoaded = false;
						this.$nextTick(function() {
							this.loadMore();
						});
					}
				}
			},

			mounted : function() {
				window.addEventListener('resize', this.getCHeight);
				window.addEventListener("popstate", function(e) {
					$('body').removeClass('vf-h');
					$('#app').removeClass('vf-h');
				}, false);
			},

			beforeDestroy : function() {
				window.removeEventListener('resize', this.getCHeight);
			},

			methods : {
				getSelectedOptions : function() {
					if (this.dataUrl == "" || this.dataUrl == null) {
						return this.options;
					} else {
						return this.selectedOptions;
					}
				},
				formatLabel : function(item) {
					var label = "";
					if (this.customLabel instanceof Function) {
						label = this.customLabel(item);
					} else {
						label = item.label;
					}
					return label;
				},
				getCHeight : function() {
					this.cHeight = document.documentElement.clientHeight;
				},
				goback : function() {
					// 移除禁止滑动事件
					// document.removeEventListener('touchmove',
					// this.preHandler, false);
					$('body').removeClass('vf-h');
					$('#app').removeClass('vf-h');
					history.go(-1);
				},
				_isValueEqual : function() {
					if (this.selectType === 'select') {
						return this.value === this.currentValue;
					}
					return this.value === this.currentValue.join(',');
				},
				getCurrentValue : function(val) {
					if (this.selectType === 'select') {
						return val;
					} else {
						if (!val) {
							return [];
						}
						return val.split(',');
					}
				},
				getSelectOptions : function(options) {
					if (options && options.length) {
						return options.map(function(item) {
							return $.extend(item, {
								value : item.id,
								label : item.name
							});
						});
					}
					return [];
				},
				handleDisplayClick : function() {
					if (this.readonly || this.disabled) {
						return;
					}
					this.selectorShow = true;
				},
				handleClickSelect : function() {
					history.back();
				},
				handleConfirm : function() {
					var self = this;
					this.$emit('input', this.currentValue.join(','));
					var options = $.extend([], this.options);
					self.selectedOptions.map(function(el) {
						var contain = false;
						for (var i = 0; i < self.options.length; i++) {
							if (self.options[i].id == el.id) {
								contain = true;
							}
						}
						if (!contain) {
							options.push(el);
						}
					});
					var selected = options.filter(function(item) {
						return self.currentValue.indexOf(item.id.toString()) > -1;
					}).map(function(item) {
						return $.extend(item, {
							value : item.id,
							label : item.name
						});
					});
					selected.map(function(el, index) {
						var contain = false;
						for (var i = 0; i < self.selectedOptions.length; i++) {
							if (self.selectedOptions[i].id == el.id) {
								contain = true;
							}
						}
						if (!contain) {
							self.selectedOptions.push(el);
						}
					});
					self.selectedOptions.map(function(el, index) {
						var contain = false;
						for (var i = 0; i < selected.length; i++) {
							if (selected[i].id == el.id) {
								contain = true;
							}
						}
						if (!contain) {
							self.selectedOptions.splice(index, 1);
						}
					});
					this.$emit('change', self.selectedOptions);
					history.back();
				},
				loadMore : function() {
					var self = this;
					if (this.dataUrl == "" || this.dataUrl == null) {
						if (Math.ceil(this.options.length / pageSize) >= (this.start + 1)) {
							this.start++;
						}
					} else {
						if (!this.allLoaded) {
							var params = JSON.parse(this.params);
							params.pageSize = pageSize;
							params.pageNumber = self.start;
							if (this.searchKey) {
								params.SEARCHKEY = this.searchKey;
							}
							MOB_UTIL.Post(this.dataUrl, params).done(function(res) {
								if (res.datas.code.rows) {
									var rows = res.datas.code.rows;
									rows.map(function(el, index) {
										var contain = false;
										for (var i = 0; i < self.options.length; i++) {
											if (self.options[i].id == el.id) {
												contain = true;
											}
										}
										if (!contain) {
											self.options.push(el);
										}
									});
									if (rows.length < pageSize) {
										self.allLoaded = true;
									} else {
										self.start++;
									}
								}
							});
						}
					}
				}
			},
		};
		return page;
	};
});