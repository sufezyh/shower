define(function (require, exports, module) {
	var tpl = require('text!./myAppointment.html');
	var api = require('api');
	return function () {
		var page = {
			template : tpl,
			data : function () {
				return {
					loadmoreComponent	: {
						pageNum 		: 1,
						pageSize 		: 10,
						myAppointmentRecords 		: [],
						allLoaded 		: false,
					},
					page: 'about',
					selected: '1',
	                subselected:'sub1',
	                searchDate:'',
	                searchDate_text:"请选择预约日期",
	                searchBeginTime:'',
	                searchEndTime:'',
	                hasData		: false, // 是否存在数据
	                //yyrq:'请选择预约日期', //预约日期
	                //yysj:'请选择预约时间'//预约时间
	                ljwy:0,  //累计违约次数
	                sywy:0,   //剩余违约次数
	                placeArr:[],  //所有可用的场馆
	                jysjd : '',
	                isTips :false,
					hasDataeRecord:false
					
				};
			},
			created : function () {
				/**
				 * 初始化 可预约场馆
				 */
				this.initPublicPlace();
				this.initViolated();
				
				/*初始化预约记录*/
				this.initAppointmentRecords(1,10);
			},
			watch : { 
			},

			activated : function () {
				SDK.setTitleText("我的预约");
				document.title = "我的预约";
				
			},
			methods : {
				// 重载页面
				reloadPage : function () {
					this.loadmoreComponent.pageNum = 1;
					var pageNum = this.loadmoreComponent.pageNum;
					var pageSize = this.loadmoreComponent.pageSize;
					
					// Clear all values.
					this.loadmoreComponent.myAppointmentRecords = [];
					this.loadmoreComponent.allLoaded = false;
					this.initAppointmentRecords(pageNum, pageSize);
					
					this.$nextTick(function(){
						// Compute the component new height.
						this.loadmoreComponent.wrapperHeight = document.documentElement.clientHeight - this.$refs.wrapper.getBoundingClientRect().top - this.$refs.wrapper.getBoundingClientRect().bottom;
					});
				},
				// 下拉刷新
				// 监听事件请以on作为前缀
				onPulldownComponent : function () {
					this.reloadPage ();
					this.$refs.loadmore.onTopLoaded ();
				},
				// 上拉加载更多
				onPullupComponent : function () {
					if (!this.hasData) {
						return;
					}
					this.loadmoreComponent.pageNum += 1;
					var pageNum = this.loadmoreComponent.pageNum;
					var pageSize = this.loadmoreComponent.pageSize;
					
					this.initAppointmentRecords(pageNum, pageSize);
					
					// emit a message to the event.
					this.$refs.loadmore.onBottomLoaded ();
				},
				initViolated:function(){
					var self = this;
					MOB_UTIL.Post(api.getViolated, {USER_ID:USERID}).done(function (result) {
						if(result && "0" == result.code){
							if(result.datas.T_PUBLIC_ROOM_BLACKLIST_QUERY.rows.length > 0){
								self.isTips = true
								self.jysjd =  result.datas.T_PUBLIC_ROOM_BLACKLIST_QUERY.rows[0].BEGINNING_TIME+" 至 "+result.datas.T_PUBLIC_ROOM_BLACKLIST_QUERY.rows[0].ENDING_TIME;
					    	}else{
					    		self.isTips = false;
					    	}
						}
					});
				},
				initPublicPlace:function(){
					var self = this;
					MOB_UTIL.Post(api.getMyAppointmentData, null).done(function (result) {
						
						if(result && result.datas){
							self.placeArr = result.datas;
						}
						
					});
				},
				initAppointmentRecords:function(pageNum, pageSize,datetime_begin,datetime_end){
				
				    var $this = this;
					var params = {
							pageNumber	: pageNum,
							pageSize	: pageSize,
							USER_ID    : USERID
						};
				 
					// Sent a request to remote api.
					MOB_UTIL.Post(api.getMyAppointmentRecord, params).done(function (result) {
						var rows = result.datas.getMyAppointmentRecord.rows;
						if (rows.length !== 0) {
							// $(".lib-orders").show();
							for (var i in rows) {
								var item = rows[i];
								$this.loadmoreComponent.myAppointmentRecords.push (item);
							}
						}else{
							// $(".lib-orders").hide();
							$this.loadmoreComponent.myAppointmentRecords=[];
						}
						
						if (rows.length < pageSize) {
							$this.loadmoreComponent.allLoaded = true;
						}
						
						$this.hasData = $this.loadmoreComponent.myAppointmentRecords.length != 0;
						$this.hasDataeRecord= $this.loadmoreComponent.myAppointmentRecords.length != 0;
					});
				},
				
	            gotoOrderdet:function(wid){
	                this.$router.push({
	                  name:'orderdetail',
	                  query : {
							WID : wid
						}
	                })
	            },
	            //预约记录详情
	            gotoListdet:function(wid,placeid){
	                this.$router.push({
	                  name:'checkin',
	                  query : {
							WID : wid,
							PLACEID : placeid
						}
	                });
	            },
		          change: function(val){
		            // val 为当前选中值，即v-model的value值
		          },
		          subchange: function(val){
		        	  var self=this;
		        	  if(val=='sub2'){
		        		  self.reloadPage();
		        	  }
		            // val 为当前选中值，即v-model的value值
		          },
		          //选择预约日期
		          clickDate:function(){
		            this.$refs['datepicker'].open();
		          },
		          datepickerConfirm:function(val,index){
		        	  var d = new Date(val);
		        	  var year=d.getFullYear();
		        	  var month=d.getMonth() + 1;
		        	  var day=d.getDate();
		        	  if(year<10){
		        		  year='0'+year;
		        	  };
		        	  if(month<10){
		        		  month='0'+month;
		        	  };
		        	  if(day<10){
		        		  day='0'+day;
		        	  };
		        	  var dateText=year + '/' + month + '/' + day;
		        	  var datetime_begin=dateText + ' ' + "00:00:00";
		        	  var datetime_end=dateText + ' ' + "23:59:59";
		        	  this.current2=datetime_begin;
		        	  this.searchDate_text=dateText;
		        	 this.initAppointmentRecords(1,10,datetime_begin,datetime_end)
		          },
		          clickTime:function(){
		        	 
		            this.$refs['timepicker'].open();
		          },
		          clickFilter:function(){
		            ///this.$refs['libfilter'].style.display = 'block';
		            
		          }, 
			}
		};
		return page;
	};

});