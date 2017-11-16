var ROOT = 'https://hellogood.top/hellogood_api/';
var openId;
//app.js
App({
    onLaunch: function () {
        console.log('App Launch');
        //调用API从本地缓存中获取数据
        var logs = wx.getStorageSync('logs') || [],
            openId = wx.getStorageSync('openId')
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs);
        if (!openId) {
            this.getUserInfo();
        }
        this.globalData.deviceInfo = wx.getSystemInfoSync();
        console.log(this.globalData.deviceInfo);
    },
    getUserInfo: function (cb) {
        var that = this
        if (that.globalData.userInfo) {
            typeof cb == "function" && cb(that.globalData.userInfo)
        } else {
            //调用登录接口
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
                                    mask: true,
                                    duration: 10000
                                })
                                wx.request({
                                    url: ROOT + '/mina/isExist.do',//自己的服务接口地址
                                    method: 'POST',
                                    header: {
                                        'content-type': 'application/json'
                                    },
                                    data: {encryptedData: res.encryptedData, iv: res.iv, code: code},
                                    success: function (data) {
                                        wx.hideToast()
                                        //4.解密成功后 获取自己服务器返回的结果
                                        if (data.data.status == "success") {
                                            wx.setStorageSync('openId', data.data.data.openId);
                                            wx.setStorageSync('userId', data.data.data.userId);
                                            wx.setStorageSync('folderNameList', data.data.folderNameList);
                                            wx.setStorageSync('beforeFolderList', data.data.beforeFolderList);
                                            that.globalData.userInfo = data.data;
                                            typeof cb == "function" && cb(that.globalData.userInfo)
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
        }
    },
    onShow: function () {
        console.log('App Show')
    },
    onHide: function () {
        console.log('App Hide')
    },
    alertBox: function (str, obj) {
        wx.showModal({
            content: str,
            showCancel: false,
            success: function (res) {
                if (res.confirm) {
                    obj
                }
            }
        })
    },
    globalData: {
        openId: '',
        userInfo: null,
        deviceInfo:{},
        ROOT: 'https://hellogood.top/hellogood_api/'
    }
})