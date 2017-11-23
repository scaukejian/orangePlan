var app = getApp();
Page({
    data: {
        user: {},
        qRCodeUrl:''
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
