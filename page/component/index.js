var app = getApp()
Page( {
  data: {
      userInfo:'',
      userMobile:'',
      username:'',
      tel:'',
      company:'',
      job:'',
      email:'',
      desc:'',
      canshow:false,
      showShare: false
  },
  onLoad: function(e) {
    var that = this,
        openId = wx.getStorageSync('openId'),
        type = e.type;
    if(openId){
      wx.request({
          url: app.globalData.ROOT + '/user/getMyUserInfo.do',//自己的服务接口地址
          method: 'GET',
          header: {
              'content-type': 'application/json',
              'openId': wx.getStorageSync('openId')
          },
          data: {},
          success: function (res) {
            var result = res.data
            if(result.status == 'success'){
              that.setData( {
                userInfo: result.data,
                username: result.data.name,
                userMobile: result.data.phone,
                canshow:true
              })
            }else if(result.status == 'failed'){
              if(result.message){
                app.alertBox(result.message)
              }else{
                app.alertBox('服务器繁忙')
              }
            }else if(result.status == 'error'){
              if(result.message){
                app.alertBox(result.message)
              }else{
                app.alertBox('服务器崩溃')
              }
            }
          },
          fail: function () {
              console.log('系统错误')
          }
      })
    }else{
      //调用应用实例的方法获取全局数据
      app.getUserInfo( function( userInfo ) {
        //更新数据
        that.setData( {
          userInfo: userInfo,
          username: userInfo.name,
          userMobile: userInfo.phone,
          canshow:true
        })
      })
    }

  },
  onShow: function() {
  },
  useCard: function(){
    var that = this;
    that.setData( {
      showShare: true
    })
    setTimeout(function(){
      that.setData({
        showShare: false
      })
    },1000)
  },
  hideCard: function(){
    this.setData( {
      showShare: false
    })
  },
  getData: function(){
    var that = this;
    wx.request({
        url: app.globalData.ROOT + '/user/getMyUserInfo.do',//自己的服务接口地址
        method: 'GET',
        header: {
            'content-type': 'application/json',
            'openId': wx.getStorageSync('openId')
        },
        data: {},
        success: function (res) {
          var result = res.data
          if(result.status == 'success'){
            that.setData( {
              userInfo: result.data,
              username: result.data.name,
              userMobile: result.data.phone,
              canshow:true
            })
          }else if(result.status == 'failed'){
            if(result.message){
              app.alertBox(result.message)
            }else{
              app.alertBox('服务器繁忙')
            }
          }else if(result.status == 'error'){
            if(result.message){
              app.alertBox(result.message)
            }else{
              app.alertBox('服务器崩溃')
            }
          }
        },
        fail: function () {
            console.log('系统错误')
        },
        complete: function() {
          // complete
          wx.hideNavigationBarLoading() //完成停止加载
          wx.stopPullDownRefresh() //停止下拉刷新
        }
    })
  },
  onPullDownRefresh: function(){
    var that = this;
    that.getData();
  },
  makeCall: function(e){
    var that = this;
    if(that.data.userInfo.phoneStatus == 0){
      wx.showModal({
        content: '请验证手机',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/page/component/component-pages/sendCode/sendCode'
            })
          }
        }
      })
    }else{
      wx.makePhoneCall({
        phoneNumber: e.target.dataset.value //仅为示例，并非真实的电话号码
      })
    }
  },
  onShareAppMessage: function () {
    return {
      title: '您好，这是我的名片，请惠存',
      path: '/page/component/component-pages/userinfo/userinfo?type=share&uid='+this.data.userInfo.id
    }
  }
})