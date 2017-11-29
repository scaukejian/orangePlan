var utils = require('../../utils/util.js')
var app = getApp();
Page({
    data: {
        userId:0,
        folderList:[],
        height: 0,
        imgWidth: 0,
        imgHeight: 0,
        showWeather: false,
        showWeatherTip: '',
        weather: '',
        code: 99,
        time: '',
        showFloder:false
    },
    onLoad: function () {
        var that = this;
        //调用上面定义的递归函数，一秒一刷新时间
        utils.getTime(that);
        if (!wx.getStorageSync('userId')) {
            app.getUserInfo(function (userInfoData) {
                that.setData({
                    userId: userInfoData.data.userId,
                    folderList: userInfoData.folderList
                });
                if (that.data.folderList.length <= 0) {
                    wx.showToast({
                        title: '网络异常，请刷新重试',
                        icon: 'loading',
                        duration: 5000
                    })
                    return;
                } else {
                    that.setData({
                        showFloder: true
                    });
                }
                var windowHeight = app.globalData.deviceInfo.windowHeight;
                var windowWidth = app.globalData.deviceInfo.windowWidth;
                var imgWidth = Math.floor(windowWidth / 2);
                var imgHeight = imgWidth;
                var length = that.data.folderList.length;
                if (length > 4 && length < 9) {
                    var row = Math.ceil((length - 4) /  2); //多出row行
                    var one =  Math.floor((windowHeight - (row + 2) * 50) / (row + 2)) //每行高度
                    imgHeight = one;
                }
                that.setData({
                    height: windowHeight,
                    imgWidth: imgWidth,
                    imgHeight: imgHeight
                });

                //加载完计划列表后，请求获取天气数据
                wx.getLocation({
                    type: 'wgs84',
                    success: function (res) {
                        var latitude = res.latitude;//纬度，浮点数，范围为-90~90，负数表示南纬
                        var longitude = res.longitude;//经度，浮点数，范围为-180~180，负数表示西经
                        var location = latitude + ":" + longitude;
                        wx.setStorageSync('location', location);
                        that.getWeather(location);//获取天气
                    },
                    fail: function (err) {
                        console.log(err);
                        that.setData({
                            showWeatherTip: "获取定位失败"
                        })
                    }
                })

            })
        } else {
            that.setData({
                userId: wx.getStorageSync('userId')
            });
            that.getFolderData();
            var location = wx.getStorageSync('location');
            if (location == undefined || location.length <= 0) {
                //加载完计划列表后，请求获取天气数据
                wx.getLocation({
                    type: 'wgs84',
                    success: function (res) {
                        var latitude = res.latitude;//纬度，浮点数，范围为-90~90，负数表示南纬
                        var longitude = res.longitude;//经度，浮点数，范围为-180~180，负数表示西经
                        location = latitude + ":" + longitude;
                        wx.setStorageSync('location', location);
                        that.getWeather(location);//获取天气
                    },
                    fail: function (err) {
                        console.log(err);
                        that.setData({
                            showWeatherTip: "获取定位失败"
                        })
                    }
                })
            } else {
                that.getWeather(location);//获取天气
            }
        }
    },
    onShow: function () {
        this.setData({
            showFloder: false
        });
        this.onLoad();
    },
    onPullDownRefresh: function () {
        wx.switchTab({
            url: 'index'
        });
    },
    getFolderData: function () {//定义函数名称
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        wx.request({
            url: 'https://hellogood.top/hellogood_api/folder/getFolderList.do',//请求地址
            data: {//发送给后台的数据
                page: 1,
                pageSize: 15,
                userId: that.data.userId
            },
            method: "POST",//get为默认方法/POST
            success: function (res) {
                //如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
                var result = res.data
                if (result.status == 'success') {
                    that.setData({
                        folderList: res.data.dataList,
                        showFloder: true
                    });
                    var windowHeight = app.globalData.deviceInfo.windowHeight;
                    var windowWidth = app.globalData.deviceInfo.windowWidth;
                    var imgWidth = Math.floor(windowWidth / 2);
                    var imgHeight = imgWidth;
                    var length = that.data.folderList.length;
                    if (length > 4 && length < 9) {
                        var row = Math.ceil((length - 4) /  2); //多出row行
                        var one =  Math.floor((windowHeight - (row + 2) * 50) / (row + 2)) //每行高度
                        imgHeight = one;
                    }
                    that.setData({
                        height: windowHeight,
                        imgWidth: imgWidth,
                        imgHeight: imgHeight
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
    },
    getNoteList: function (e) {
        var folderId = e.currentTarget.id;
        wx.navigateTo({
            url: '../indexNote/indexNote?folderId=' + folderId
        });
    },
    getWeather: function (location) {
        var that = this;
        //加载完计划列表后，请求获取天气数据
        var url = 'https://hellogood.top/hellogood_api/weather/getWeather/' + location + '.do'; //请求后台获取天气情况
        wx.request({
            url: url,//请求地址
            method: "GET",
            success: function (res) {
                //如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
                var result = res.data;
                if (result.status == 'success') {
                    var weatherResult = result.weatherResult;
                    var text = weatherResult.results[0].now.text;
                    var code = weatherResult.results[0].now.code;
                    var temperature = weatherResult.results[0].now.temperature;
                    that.setData({
                        showWeather: true,
                        weather: text + " " + temperature,
                        code: code,
                        showWeatherTip: ''
                    })
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
                console.log(err);
                that.setData({
                    showWeatherTip: "获取天气失败"
                })
                showRequestInfo();
            },//请求失败
            complete: function () {

            }//请求完成后执行的函数
        });
    }

})
