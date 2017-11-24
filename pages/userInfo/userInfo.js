var utils = require('../../utils/util.js')
var app = getApp();
Page({
    data: {
        user: {},
        qRCodeUrl:'',
        birthday:''
    },
    onLoad: function () {
        var that = this;
        if (!wx.getStorageSync('user')) {
            app.getUserInfo(function (userInfoData) {
                that.setData({
                    user: userInfoData.data
                });
            })
        } else {
            that.setData({
                user: wx.getStorageSync('user')
            });
        }
        if (that.data.user != null && that.data.user.birthday != undefined) {
            that.setData({
                birthday: utils.formatDate(that.data.user.birthday)
            });
        }
        if (that.data.user.openId != undefined) {
            wx.request({
                url: 'https://hellogood.top/hellogood_api/mina/getQRCodeUrl.do',//请求地址
                header: {
                    'openId': that.data.user.openId
                },
                method: "GET",//get为默认方法/POST
                success: function (res) {
                    //如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
                    var result = res.data
                    if (result.status == 'success') {
                        that.setData({
                            qRCodeUrl: res.data.data
                        });
                    } else if (result.status == 'failed') {
                        if (result.message) {
                            app.alertBox(result.message)
                        } else {
                            app.alertBox('服务器繁忙')
                        }
                    } else if (result.status == 'error') {
                        if (result.message) {
                            app.alertBox(result.message)
                        } else {
                            app.alertBox('服务器崩溃')
                        }
                    }
                },
                fail: function (err) {
                    showRequestInfo();
                },//请求失败
                complete: function () {

                }//请求完成后执行的函数
            });
        }
    },
    onShow: function () {
        this.onLoad();
    },
    onPullDownRefresh: function () {
        wx.switchTab({
            url: 'user'
        });
    },
    folderList: function (e) {
        wx.navigateTo({
            url: '../folder/folder'
        });
    },
    finishList: function (e) {
        wx.navigateTo({
            url: '../myNote/myNote?finish=1&title=已完成计划'
        });
    },
    topList: function (e) {
        wx.navigateTo({
            url: '../myNote/myNote?top=1&title=置顶计划'
        });
    },
    recycleList: function (e) {
        wx.navigateTo({
            url: '../myNote/myNote?display=0&title=回收站计划'
        });
    },
    help: function (e) {
        wx.navigateTo({
            url: '../help/help'
        });
    },
    edit: function (e) {
        wx.navigateTo({
            url: '../userInfoEdit/userInfoEdit'
        });
    },
    //图片点击事件
    qrCodePreview:function(event){
        var src = event.currentTarget.dataset.src;//获取data-src
        var imageList = [src];
        //图片预览
        wx.previewImage({
            current: imageList[0], // 当前显示图片的http链接
            urls: imageList
        })
    }
})
