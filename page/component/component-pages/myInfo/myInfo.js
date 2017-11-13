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
      desc:'',
      tempFilePaths:'',
      changeImgTag:0,
      uploadImgDone:0,
      uploadImgInfo:0,
      uploadImgUrl:''
  },
  onLoad: function() {
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
                username: result.data.nickName,
                userMobile: result.data.phone,
                tempFilePaths: result.data.imgUrl,
                tel:result.data.phone,
                company:result.data.company,
                job:result.data.job,
                email:result.data.email,
                desc:result.data.desc,
                uploadImgUrl:result.data.imgUrl,
                canshow:true
              })
            }
          },
          fail: function () {
              console.log('系统错误')
          }
      })

  },
  bindInput:function(e){ //用户名
    this.setData({
      [e.target.dataset.name]:e.detail.value
    })
  },
  changeMobile: function(){
    wx.navigateTo({
      url: '../sendCode/sendCode'
    })
  },
  alertBox: function(str) {
    wx.showModal({
      content: str,
      showCancel: false,
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  },
  changeUimg: function(){
    var that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData( {
          tempFilePaths: tempFilePaths,
          changeImgTag: 1
        })
      }
    })
  },
  uploadImg: function(){
    var that = this;
    wx.showToast({
      title: '拼命加载中...',
      icon: 'loading',
      mask:true,
      duration: 10000
    })
    wx.uploadFile({
      url: app.globalData.ROOT + '/user/uploadPhoto.do',
      filePath: that.data.tempFilePaths[0],
      name: 'file',
      formData:{},
      header: {
          'openId': wx.getStorageSync('openId')
      },
      success: function(res){
        var data = JSON.parse(res.data)
        //do something
        if(data.status == 'success'){
          that.setData( {
            uploadImgDone: 1,
            uploadImgUrl:data.imgUrl
          })
          that.uploadInfo();
        }else if(data.status == 'failed'){
          if(data.message){
            app.alertBox(data.message)
          }else{
            app.alertBox('服务器繁忙')
          }
        }else if(data.status == 'error'){
          if(data.message){
            app.alertBox(data.message)
          }else{
            app.alertBox('服务器崩溃')
          }
        }
      }
    })
  },
  uploadInfo: function(){
    var that = this
    // var com_name = that.data.username != '' ? that.data.username : that.data.userInfo.nickName,
    //     com_tel = that.data.tel != '' ? that.data.tel : that.data.userInfo.phone,
    //     com_company = that.data.company != '' ? that.data.company : that.data.userInfo.company,
    //     com_job = that.data.job != '' ? that.data.job : that.data.userInfo.job,
    //     com_email = that.data.email != '' ? that.data.email : that.data.userInfo.mail,
    //     com_desc = that.data.desc != '' ? that.data.desc : that.data.userInfo.remark,
    //     imgUrl = that.data.uploadImgUrl != '' ? that.data.uploadImgUrl : that.data.userInfo.imgUrl,
    //     newData = {name: com_name,job:com_job,phone:com_tel,company:com_company,mail:com_email,imgUrl:imgUrl,remark:com_desc}
    var com_name = that.data.username,
        com_tel = that.data.tel,
        com_company = that.data.company,
        com_job = that.data.job,
        com_email = that.data.email,
        com_desc = that.data.desc,
        imgUrl = that.data.uploadImgUrl,
        newData = {name: com_name,job:com_job,phone:com_tel,company:com_company,mail:com_email,imgUrl:imgUrl,remark:com_desc}
        // console.log(newData);
        // return false;
    wx.request({
        url: app.globalData.ROOT + '/user/save.do',//自己的服务接口地址
        method: 'POST',
        header: {
            'content-type': 'application/json',
            'openId': wx.getStorageSync('openId')
        },
        data: newData,
        success: function (data) {
          that.setData( {
            uploadImgInfo: 1
          })
          that.checkDone()
        },
        fail: function () {
            console.log('系统错误')
        }
    })
  },
  creatCard: function(event) {
    var that = this
    if(that.data.username == '' && that.data.userInfo.nickName == undefined){
      that.alertBox('请输入姓名')
      return false;
    }
    if(that.data.tel == '' && that.data.userInfo.phone == undefined){
      that.alertBox('请输入电话')
      return false;
    }
    if(that.data.company == '' && that.data.userInfo.company == undefined){
      that.alertBox('请输入公司名称')
      return false;
    }
    if(that.data.job == '' && that.data.userInfo.job == undefined){
      that.alertBox('请输入职务')
      return false;
    }
    //如果有更新照片，上传照片
    if(that.data.changeImgTag == 1){
      that.uploadImg();
    }else{
      that.uploadInfo();
    }
  },
  checkDone: function(){
    var that = this
    setTimeout(function(){
      if(that.data.changeImgTag == 1){
        if(that.data.uploadImgDone == 1 && that.data.uploadImgInfo == 1){
          wx.hideToast()
          wx.switchTab({
            url: '/page/component/component-pages/mine/mine',
            success: function (e) {
              var page = getCurrentPages().pop();
              if (page == undefined || page == null) return;
              page.onShow();
            }
          })
        }
      }else{
        if(that.data.uploadImgInfo == 1){
          wx.hideToast()
          wx.switchTab({
            url: '/page/component/component-pages/mine/mine',
            success: function (e) {
              var page = getCurrentPages().pop();
              if (page == undefined || page == null) return;
              page.getData();
            }
          })
        }
      }
    }
    ,10)
  }
}
Page(pageData);