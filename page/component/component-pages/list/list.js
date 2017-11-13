var app = getApp()
var pageData = {
    data: {
        pageType:'',
        title: '',
        dataList: '',
        canshow: false,
        dataListNum:0
    },
    onLoad: function(options) {
        var pageTitle,
            that = this
        if(options.type == 'zuji'){
            that.setData({
                pageType: options.type
            })
            pageTitle = '足迹'
        }else if(options.type == 'uzuji'){
            that.setData({
                pageType: options.type
            })
            pageTitle = '谁看过我'
        }else if(options.type == 'like'){
            that.setData({
                pageType: options.type
            })
            pageTitle = '我的赞'
        }else if(options.type == 'ulike'){
            that.setData({
                pageType: options.type
            })
            pageTitle = '谁收藏我'
        }else if(options.type == 'card'){
            that.setData({
                pageType: options.type
            })
            pageTitle = '名片夹'
        }
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
          phoneNumber: num,
          complete:function(){
            return false;
          }
        })
    },
    getList: function() {
        var that = this,
            url;
        if(that.data.pageType == 'zuji'){
            url = '/access/listMyAccess.do'
        }else if(that.data.pageType == 'uzuji'){
            url = '/access/listAccessMe.do'
        }else if(that.data.pageType == 'like'){
            url = '/collect/listMyCollect.do'
        }else if(that.data.pageType == 'ulike'){
            url = '/collect/listCollectMe.do'
        }else if(that.data.pageType == 'card'){
            url = '/collect/listMyCollect.do'
        }
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
              var cList = [];
              for (var i = 0; i < result.dataList.length; i++) {
                cList[i] = result.dataList[i].isCollect
              }
              console.log(cList);
              that.setData({
                  dataList: result.dataList,
                  dataListNum: result.dataList.length,
                  collectList: cList,
                  canshow: true
              })
            }
          },
          fail: function () {
              console.log('系统错误')
          }
      })
    },
  addLike: function(e){ /* 加入收藏 */
    var that = this,
        isCollect = e.target.dataset.value,
        id = e.target.dataset.id,
        indexNum = e.target.dataset.key;
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
              that.data.collectList[indexNum] = true
              that.setData({
                  collectList: that.data.collectList
              })
            }else{
              that.data.collectList[indexNum] = false
            }
          }
        },
        fail: function () {
            console.log('系统错误')
        }
    })
  },
}
Page(pageData);