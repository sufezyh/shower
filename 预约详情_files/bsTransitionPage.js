define(function(require, exports, module) {
	var tpl = require("text!./bsTransitionPage.html");
	var isBh = function() {
		return /iphone/.test(navigator.userAgent.toLowerCase()) && !/micromessenger/.test(navigator.userAgent.toLowerCase());
	};
	return function() {
		var page = {
			template : tpl,
			props : [ 'value' ],
			data : function() {
				return {
					visible : this.value,
					top : 0,
					left : 0,
					position : 'fixed'
				};
			},
			watch : {
				value : function(val) {
					this.visible = val;
				},
				visible : function(val) {
					if (val) {
						history.pushState('', null, '#/smile-select');
					}
					this.$emit('input', val);
				}
			},

			mounted : function() {
				window.addEventListener("popstate", this.historyChange);
				// ios唤起软键盘后，position:fixed失效
				console.log('去掉ios的isbh')
				// if (isBh()) {
				// var $input =
				// this.$el.querySelector('input[type="search"]');
				// if ($input) {
				// this.bindTouch();
				// $input.addEventListener('focus', this.foucusSetPosition);
				// $input.addEventListener('blur', () => {
				// this.top = 0;
				// this.left = 0;
				// this.position = 'fixed';
				// });
				// }
				// }
			},
			beforeDestroy : function() {
				window.removeEventListener("popstate", this.historyChange);
			},

			methods : {
				bindTouch : function() {
					var startY;
					var $vm = this;
					this.$el.addEventListener('touchstart', function(e) {
						startY = e.touches[0].clientY;
					});
					this.$el.addEventListener('touchmove', function(e) {
						var ele = this;
						var currentY = e.touches[0].clientY;
						var stopEvent = function(el) {
							if (el == ele) {
								e.preventDefault();
								return;
							}
							var overflowY = el.style.overflowY;
							if (overflowY === 'auto' || overflowY === 'scroll') {
								if (el.offsetHeight >= el.scrollHeight) {
									e.preventDefault();
									return;
								}
								var up = currentY - startY > 0;
								if (el.scrollTop <= 0) {
									if (up) {
										$vm.setPosition();
										e.preventDefault();
										return;
									}
								}
								if (el.scrollTop + el.offsetHeight >= el.scrollHeight) {
									if (!up) {
										$vm.setPosition();
										e.preventDefault();
										return;
									}
								}
							} else {
								stopEvent(el.parentNode);
							}
						}
						stopEvent(e.target);
					});
				},
				foucusSetPosition : function() {
					var timer = setInterval(this.setPosition, 20);
					setTimeout(function() {
						clearInterval(timer);
						this.setPosition();
					}, 200);
				},
				setPosition : function() {
					var position = this.$el.parentNode.getBoundingClientRect();
					this.left = '-' + position.left + 'px';
					this.top = '-' + position.top + 'px';
					this.position = 'absolute';
				},
				historyChange : function() {
					this.visible = false;
				},
				afterLeave : function() {
					document.activeElement.blur();
				}
			}
		};
		return page;
	};
});