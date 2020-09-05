;
 (function(mixins) {

   mixins.common = {
		   
	data: function() {
		return {
			userInfo: null,
			isAdmin: undefined,
			logoutUrl: '',
			activeName: undefined,
			webRoot: webRoot,
			menuArr: [{
		         title: '流程管理',
		         name: 'lcgl',
		         subMenu: [{
		           title: '流程定义',
		           name: '2',
		           href: `${webRoot}/sys/emapflow/definition/getCategoryProcessDefinitions.do`
		         }, {
		           title: '流程任务',
		           name: '1',
		           href: `${webRoot}/sys/emapflow/tasks/queryTasks.do`
		         }, {
		           title: '流程实例',
		           name: '3',
		           href: `${webRoot}/sys/emapflow/tasks/getProcessInstances.do?queryType=1`
		         }, {
		           title: '印章管理',
		           name: '6',
		           href: `${webRoot}/sys/emapflow/elecseal/elecseal.do`
		         }, {
		           title: '流程委托',
		           name: '7',
		           href: `${webRoot}/sys/emapflow/delegate/toDelegate.do`
		         }]
		       }, {
		         title: '流程统计',
		         name: '4',
		         href: `${webRoot}/sys/flowstatistics/index.do`
		       }, {
		         title: '干预记录',
		         name: '5',
		         href: `${webRoot}/sys/emapflow/intervene/intervene.do`
		       }]
		}
	},
     computed: {
       winSize: function() {
         var winW = document.documentElement.clientWidth
         if (winW > 1200) {
           return 'lg'
         } else if (winW >= 992) {
           return 'md'
         } else if (winW >= 768) {
           return 'sm'
         } else {
           return 'xs'
         }
       }
     },
     methods: {
         filterAdminMenu(arr) {
             arr = arr.filter((item) => {
               if (item.subMenu) {
                 item.subMenu = this.filterAdminMenu(item.subMenu)
               }
               return !item.isAdmin
             })
             return arr
           },
         findMenuItem(menuArr, name) {
        	 var obj = null
        	 for(var i = 0, len = menuArr.length; i < len; i++) {
        		var item = menuArr[i]
        		if (item.subMenu && item.subMenu.length) {
        			return this.findMenuItem(item.subMenu, name)
        		}
        		if (name === item['name']) {
        			obj = item
        			break
        		}
        	 }
        	 return obj
         },
         goUserCenter() {
        	window.location.href = `${webRoot}/sys/flowcenter/*default/index.do#/flow-user-center`
         },
    	 sniffer() {
           var _this = this
	        window["emap-h5tag"].utils.Get(`${webRoot}/sys/emapflow/delegate/getCenterFlag.do`).then(function(response) {
	           var data = response && response.data
	           if (data) {
   	   				const flowDefItem = _this.findMenuItem(_this.menuArr, '2')
   	   				flowDefItem && flowDefItem.href && (flowDefItem.href = `${webRoot}/sys/flowcenter/*default/index.do#/flow-definition-group`)
	        	   //流程中心模式 
	        	   _this.menuArr.unshift(_this.adminMenu)
	        	   //获取用户信息
	        	   window["emap-h5tag"].utils.Get(`${webRoot}/sys/flowcenter/*default/isAdmin.do`).then(function(res) {
	        	   		const data = res.data
	        	   		if(data.code === '0') {
	        	   			_this.isAdmin = data.datas && data.datas.isAdmin && data.datas.isAdmin.isAdmin
	        	   			if (typeof(_this.isAdmin) !== 'undefined' && !_this.isAdmin) {
	        	   				_this.menuArr = _this.filterAdminMenu(_this.menuArr)
	        	   			}
	        	   			_this.$nextTick(function() {
		        	   			//菜单动态生成后手动高亮
		        	   			_this.activeName = document.querySelector('[data-activename]').getAttribute('data-activename')
		        	   		})
	        	   		}
	        	   		return window["emap-h5tag"].utils.Get(`${webRoot}/sys/flowcenter/*default/getPageData.do`)
	        	   }).then(function(res) {
	        	   		const data = res.data
	        	   		if (data.code === '0') {
	        	   			const datas = data.datas && data.datas.getPageData
	        	   			_this.userInfo = datas.user
	        	   			_this.logoutUrl = datas.logoutUrl
	        	   		}

	        	   }).catch(function(err) {
	        	   		console.log(err)
	        	   })
	        	} else {
	        		_this.activeName = document.querySelector('[data-activename]').getAttribute('data-activename')
	        	}
	        }).catch(function(err) {
	        	console.log(err)
	        }); 
    	 },
    	 logout() {
    	 	window.location.href = `${webRoot}${this.logoutUrl}`
    	 }
     },
     created() {
       this.adminMenu = 
       {
		  title: '系统管理',
		  name: 'xtgl',
		  isAdmin: true,
		  subMenu: [{
		    title: '管理员管理',
		    name: 'admin',
		    href: `${webRoot}/sys/flowcenter/*default/index.do#/flow-admin-manage`,
		    isAdmin: true
		  }, {
		    title: '业务域管理',
		    name: 'domain',
		    href: `${webRoot}/sys/flowcenter/*default/index.do#/flow-domain-manage`,
		    isAdmin: true
		  }]
		}
       this.sniffer()
     },
   }
 })(window.emapMixins = window.emapMixins || {})
