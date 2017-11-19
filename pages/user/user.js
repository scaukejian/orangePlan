Page({
  data: {

  },
  onLoad: function () {

  },
    finishList: function (e) {
        wx.navigateTo({
            url: '../note/note?finish=1'
        });
    },
    topList: function (e) {
        wx.navigateTo({
            url: '../note/note?top=1'
        });
    },
    recycleList: function (e) {
        wx.navigateTo({
            url: '../note/note?display=0'
        });
    }
})
