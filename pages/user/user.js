Page({
    data: {},
    onLoad: function () {
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
    }
})
