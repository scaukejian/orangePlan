var app = getApp();
var pageData = {
    data: {
        tel:'',
        code: '',
        second: '验证',
        setTime: 60
    },
  bindInput:function(e){ //用户名
    this.setData({
      [e.target.dataset.name]:e.detail.value
    })
  },
  alertBox: function(str,obj) {
    wx.showModal({
      content: str,
      showCancel: false,
      success: function(res) {
        if (res.confirm) {
          obj
        }
      }
    })
  },
  djs:function(){
    var that = this,
        second = that.data.second,
        setTime = that.data.setTime;
    if (setTime == 0) {
      that.setData({
        second:'验证',
        setTime: 3
      });
      return ;
    }
   var time = setTimeout(function(){
    that.setData({
     second: (setTime - 1) + 's',
     setTime: setTime -1
    });
    that.djs(that);
   }
   ,1000)
  },
  getCode: function(){
  	var that = this,
  		data = {phone:that.data.tel};
    if(that.data.tel == ''){
      that.alertBox('请输入手机号')
      return false;
    }
    if(that.data.setTime < 60){
      that.alertBox('短信发送频率过快')
      return false;
    }
    that.djs();
    wx.request({
        url: app.globalData.ROOT + '/sms/getCode.do',//自己的服务接口地址
        method: 'GET',
        header: {
            'content-type': 'application/json',
            'openId': wx.getStorageSync('openId')
        },
        data: data,
        success: function (data) {
            var result = data.data
            if(result.status == 'success'){
      			 that.alertBox('发送成功')
            }else if(result.status == 'failed'){
             that.alertBox(result.message)
            }
        },
        fail: function () {
            console.log('系统错误')
        }
    })
  },
  comChange: function(){
  	var that = this,
  		data = {phone:that.data.tel,code:that.data.code};
    wx.request({
        url: app.globalData.ROOT + '/user/savePhone.do',//自己的服务接口地址
        method: 'POST',
        header: {
            'content-type': 'application/json',
            'openId': wx.getStorageSync('openId')
        },
        data: data,
        success: function (data) {
            var result = data.data
            if(result.status == 'success'){
      			that.alertBox('修改成功',wx.switchTab({
  			      url: '/page/component/component-pages/mine/mine',
              success: function (e) {
                var page = getCurrentPages().pop();
                if (page == undefined || page == null) return;
                page.onShow();
              }
  			    }))
            }
        },
        fail: function () {
            console.log('系统错误')
        }
    })
  }
}
Page(pageData);