define(function(require, exports, module) {
			var tpl = require('text!./rateCouple.html');
			return function() {
				var page = {
					template : tpl,
				    props: {
				      score: {
				        type: Number,
				        'default': 0,
				        //required: true
				      },
				      disabled: {
				        type: Boolean,
				        'default': false,
				      },
				      isShowNum: {
				        type: Boolean,
				        'default': false,
				      },
				      commentTitle: {
					     type: String,
					     'default': '评价内容',
					  },
					  comment: {
						 type: String,
						 'default': '',
					  },
					  commentSize: {
						 type: Number,
						'default': 256,
					  },
					  commentRows: {
						type: Number,
					   'default': 5,
					  },
					  commentRequired:{
						  type: Boolean,
						  'default': true,
					  }
				    },
				    data:function() {
				      return {
				        curScore: '',
				        width:'',
				      }
				    },
				    created: function () {
				      this.getDecimal();
				    },
				    methods: {
				      getClass:function(i) {
				        if (this.curScore === '') {
				          return i <= this.score ? 'icon-star' : 'icon-star o'
				        } else {
				          return i <= this.curScore ? 'icon-star' : 'icon-star o'
				        }
				      },
				      getDecimal:function() {
				    	  if(this.curScore){
				    		  return;
				    	  }
				        this.width=Number(this.score * 100 - Math.floor(this.score) * 100)+'%';
				      },
				      setScore:function(i){
				        this.$emit('update:score',i);//使用`.sync`修饰符，对score 进行“双向绑定
				      }
				    }
				};
				return page;
			};
		});