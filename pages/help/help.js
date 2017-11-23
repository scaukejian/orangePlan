Page({
    data: {},
    onLoad: function () {
    },
    onPullDownRefresh: function () {
        wx.redirectTo({
            url: '../help/help'
        });
    }
})
