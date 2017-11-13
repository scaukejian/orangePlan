var app = getApp()
var pageData = {
	data: {
      userInfo:'',
      userMobile:'',
      username:'',
      tel:'',
      company:'',
      job:'',
      email:'',
      desc:''
  },
  onLoad: function() {
  },
  getData: function(){
    var that = this,
        openId = wx.getStorageSync('openId');
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
  onShow: function(){
    var that = this;
    that.getData();
  },
  goInfoEdit: function(){
    var that = this;
    if(that.data.userInfo.phoneStatus == '1' || that.data.userInfo.phone == undefined){
      wx.navigateTo({
        url: '/page/component/component-pages/myInfo/myInfo'
      })
    }else{
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
    }
  },
  onPullDownRefresh: function(){
    var that = this;
    that.getData();
  },
}
Page(pageData);