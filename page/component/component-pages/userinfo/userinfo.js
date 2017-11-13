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
      isCollect:'',
      myCollectionNum:'',
      loading: false,
      canshow: false,
      uid:''
  },

  onLoad: function(e) {
    var that = this,
        openId = wx.getStorageSync('openId'),
        uid = e.uid;

    that.setData({
      uid: uid
    })
    if(!openId){//调用登录接口
      wx.login({
        success: function (r) {
          var code = r.code;//登录凭证
          if (code) {
              //2、调用获取用户信息接口
              //...
            wx.getUserInfo({
              success: function (res) {
                //3.请求自己的服务器，解密用户信息 获取unionId等加密信息
                wx.showToast({
                  title: '拼命加载中...',
                  icon: 'loading',
                  mask:true,
                  duration: 10000
                })
                wx.request({
                    url: app.globalData.ROOT + '/user/isExist.do',//自己的服务接口地址
                    method: 'POST',
                    header: {
                        'content-type': 'application/json'
                    },
                    data: {encryptedData: res.encryptedData, iv: res.iv, code: code, openId:openId},
                    success: function (data) {
                        wx.hideToast()
                        //4.解密成功后 获取自己服务器返回的结果
                        if (data.data.status == "success") {
                            wx.setStorageSync('openId', data.data.data.openId);
                            that.getData(uid,data.data.data.openId);
                        } else {
                            console.log('解密失败')
                        }
                    },
                    fail: function () {
                        console.log('系统错误')
                    }
                })
              },
              fail: function () {
                  console.log('获取用户信息失败')
              }
            })

          } else {
              console.log('获取用户登录态失败！' + r.errMsg)
          }
        }
      })
    }else{
        that.getData(uid,wx.getStorageSync('openId'));
    }
  },
  onShow: function() {
    if(this.data.uid != ''){
      this.getData(this.data.uid,wx.getStorageSync('openId'));
    }
  },
  getData: function(uid,oid){
    var that = this;
    wx.request({
      url: app.globalData.ROOT + '/user/getByUserId/'+ uid +'.do',//自己的服务接口地址
      method: 'GET',
      header: {
          'content-type': 'application/json',
          'openId': oid
      },
      data: {},
      success: function (res) {
        var result = res.data
        if(result.status == 'success'){
          that.setData( {
            userInfo: result.data,
            username: result.data.nickName,
            userMobile: result.data.phone,
            isCollect: result.data.isCollect,
            myCollectionNum: result.data.collectMeNum,
            canshow:true
          })
        }
      },
      fail: function () {
          console.log('系统错误')
      }
    })
  },
  goPath: function(){
    wx.switchTab({
      url: '/page/component/index',
      success: function (e) {
        var page = getCurrentPages().pop();
        if (page == undefined || page == null) return;
        page.onShow();
      }
    })
  },
  makeCall: function(e){
    var that = this;
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.value //仅为示例，并非真实的电话号码
    })
  },
  addLike: function(){ /* 加入收藏 */
    var that = this,
        isCollect = that.data.isCollect;
    that.setData({
      loading: !that.data.loading
    })
    wx.request({
        url: app.globalData.ROOT + '/collect/subscribeOrCancel/'+ that.data.userInfo.id +'.do',//自己的服务接口地址
        method: 'GET',
        header: {
            'content-type': 'application/json',
            'openId': wx.getStorageSync('openId')
        },
        data: {},
        success: function (res) {
          var result = res.data
          if(result.status == 'success'){
            that.setData({
              loading: !that.data.loading
            })
            if(isCollect == false){
              var newNum = that.data.myCollectionNum++
              that.setData( {
                isCollect: true,
                myCollectionNum: (that.data.myCollectionNum)++
              })
            }else{
              var newNum = that.data.myCollectionNum--
              that.setData( {
                isCollect: false,
                myCollectionNum: (that.data.myCollectionNum)--
              })
            }
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
  },
  onShareAppMessage: function () {
    return {
      title: '您好，这是我的名片，请惠存',
      path: '/page/component/component-pages/userinfo/userinfo?type=share&uid='+this.data.userInfo.id
    }
  }
})