var app = getApp()
var pageData = {
    data: {
        pageType:'',
        title: '',
        dataList: '',
        dataListNum:0
    },
    onLoad: function(options) {
        var pageTitle = '名片夹',
            that = this
        this.setData({
            title: pageTitle
        })
        this.getList();
    },
    onShow: function () {
    },
    onReady: function () {
        var that = this
        wx.setNavigationBarTitle({
            title: that.data.title
        })
    },
    makeCall: function(e){
        var num = e.currentTarget.dataset.value;
        wx.makePhoneCall({
          phoneNumber: num
        })
    },
    getList: function() {
        var that = this,
            url = '/collect/listMyCollect.do';
        wx.showToast({
          title: '拼命加载中...',
          icon: 'loading',
          mask:true,
          duration: 10000
        })
      wx.request({
          url: app.globalData.ROOT + url,//自己的服务接口地址
          method: 'GET',
          header: {
              'content-type': 'application/json',
              'openId': wx.getStorageSync('openId')
          },
          data: {page:1,pageSize:1000},
          success: function (res) {
            wx.hideToast();
            var result = res.data
            if(result.status == 'success'){
              console.log(result);
                that.setData({
                    dataList: result.dataList,
                    dataListNum: result.dataList.length
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
  addLike: function(e){ /* 加入收藏 */
    var that = this,
        isCollect = e.target.dataset.value,
        id = e.target.dataset.id;
    wx.request({
        url: app.globalData.ROOT + '/collect/subscribeOrCancel/'+ id +'.do',//自己的服务接口地址
        method: 'GET',
        header: {
            'content-type': 'application/json',
            'openId': wx.getStorageSync('openId')
        },
        data: {},
        success: function (res) {
          var result = res.data
          if(result.status == 'success'){
            if(isCollect == false){
            }else{
            }
          }
        },
        fail: function () {
            console.log('系统错误')
        }
    })
  },
  onPullDownRefresh: function(){
    var that = this;
    that.getList();
  },
}
Page(pageData);