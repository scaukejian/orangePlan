//index.js
//获取应用实例
var utils = require('../../utils/util.js')
var app = getApp();
var inputinfo = "";
var searchInputInfo = "";
var currentFolderId = 0;
var currentFolderIndex = 0;
var mini = 1;
Page({
    data: {
        userId: 0,
        folderList: [],
        noteList: [],
        animationData: "",
        showModalStatus: false,
        noteContent: "",
        noteId: 0,
        touch_start: 0,
        touch_end: 0,
        lastX: 0,
        lastY: 0,
        text: "没有滑动",
        currentGesture: 0,
        folderListSize: 0,
        folderNameList: [],
        beforeFolderList: [],
        searchShow:false,
        folderShow:true,
        index:0,
        show: false,
        beforeFolderName:'',
        height:''
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        });
    },
    onLoad: function () {
        //调用应用实例的方法获取全局数据
        var that = this;
        if (!wx.getStorageSync('userId')) {
            app.getUserInfo(function (userInfoData) {
                that.setData({
                    userId: userInfoData.data.userId,
                    folderList: userInfoData.folderList,
                    noteList: userInfoData.noteList,
                    folderNameList: userInfoData.folderNameList,
                    beforeFolderList: userInfoData.beforeFolderList
                });
                that.setData({
                    beforeFolderName: that.data.beforeFolderList[0]
                });
                if (currentFolderId == null || currentFolderId <= 0) {
                    currentFolderId = that.data.folderList[0].id;
                    currentFolderIndex = 0;
                }
                if (that.data.noteList != null && that.data.noteList.length > 0) {
                    that.setData({
                        show: true
                    });
                }
            })
        } else {
            that.setData({
                userId: wx.getStorageSync('userId'),
                folderNameList: wx.getStorageSync('folderNameList'),
                beforeFolderList: wx.getStorageSync('beforeFolderList')
            });
            that.setData({
                beforeFolderName: that.data.beforeFolderList[0]
            });
            that.getFolderData();
        }
    },
    onPullDownRefresh: function () {
        this.getNoteData(currentFolderId, searchInputInfo);
    },
    getFolderData: function () {//定义函数名称
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        wx.request({
            url: 'https://hellogood.top/hellogood_api/folder/getFolderList.do',//请求地址
            data: {//发送给后台的数据
                page: 1,
                pageSize: 10,
                userId: that.data.userId
            },
            method: "POST",//get为默认方法/POST
            success: function (res) {
                //如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
                var result = res.data
                if (result.status == 'success') {
                    that.setData({
                        folderList: res.data.dataList,
                        folderListSize: res.data.dataList.length
                    });

                    if (currentFolderId == null || currentFolderId <= 0) {
                        currentFolderId = that.data.folderList[0].id;
                        currentFolderIndex = 0;
                    }

                    that.getNoteData(currentFolderId, searchInputInfo);
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
    bindPickerChange: function(e) {
        var that = this;
        that.setData({
            index: e.detail.value,
            beforeFolderName: that.data.beforeFolderList[e.detail.value]
        })
        var folderId = that.data.folderList[that.data.index].id;
        currentFolderId = folderId;
        currentFolderIndex = e.detail.value;
        that.getNoteData(currentFolderId, searchInputInfo);
    },
    getNoteData: function (folderId, searchContent) {//定义函数名称
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        wx.request({
            url: 'https://hellogood.top/hellogood_api/note/getNoteList.do',//请求地址
            data: {//发送给后台的数据
                display: 1,
                folderId: folderId,
                userId: that.data.userId,
                content: searchContent,
                page: 1,
                pageSize: 10,
                mini: mini
            },
            method: "POST",//get为默认方法/POST
            success: function (res) {
                //如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
                var result = res.data
                if (result.status == 'success') {
                    that.setData({
                        noteList: res.data.dataList
                    });
                    if (that.data.noteList != null && that.data.noteList.length > 0) {
                        that.setData({
                            show: true
                        });
                    } else {
                        that.setData({
                            show: false
                        });
                    }
                    //格式化
                    var tempList = that.data.noteList;
                    for (var i = 0; i < tempList.length; i++) {
                        tempList[i].updateTime = utils.formatTime(new Date(tempList[i].updateTime));
                    }
                    that.setData({
                        noteList: tempList
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
                showRequestInfo();
            },
            complete: function() {
                // complete
                wx.hideNavigationBarLoading() //完成停止加载
                wx.stopPullDownRefresh() //停止下拉刷新
            }
        });
    },
    changeFinish: function (e) {
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        var noteId = e.currentTarget.id;
        var finish = 1 - e.currentTarget.dataset.finish;
        wx.request({
            url: 'https://hellogood.top/hellogood_api/note/setFinish.do',//请求地址
            data: {//发送给后台的数据
                id: noteId,
                finish: finish,
                userId: that.data.userId
            },
            method: "POST",//get为默认方法/POST
            success: function (res) {
                //如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
                var result = res.data
                if (result.status == 'success') {
                    that.getNoteData(currentFolderId, searchInputInfo);
                    if (finish == 1) {
                        wx.showToast({
                            title: '已完成',
                            icon: 'success',
                            duration: 300
                        })
                    } else {
                        wx.showToast({
                            title: '未完成',
                            icon: 'success',
                            duration: 300
                        })
                    }
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
                showRequestInfo();
            },//请求失败
            complete: function () {

            }//请求完成后执行的函数
        });
    },
    changeTop: function (e) {
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        var noteId = e.currentTarget.id;
        var top = 1 - e.currentTarget.dataset.top;
        wx.request({
            url: 'https://hellogood.top/hellogood_api/note/setTop.do',//请求地址
            data: {//发送给后台的数据
                id: noteId,
                top: top,
                userId: that.data.userId
            },
            method: "POST",//get为默认方法/POST
            success: function (res) {
                //如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
                var result = res.data
                if (result.status == 'success') {
                    that.getNoteData(currentFolderId, searchInputInfo);
                    if (top == 1) {
                        wx.showToast({
                            title: '已置顶',
                            icon: 'success',
                            duration: 300
                        })
                    } else {
                        wx.showToast({
                            title: '已取消置顶',
                            icon: 'success',
                            duration: 300
                        })
                    }
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
                showRequestInfo();
            },//请求失败
            complete: function () {

            }//请求完成后执行的函数
        });
    },
    showModal: function () {
        // 显示遮罩层
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        })
        this.animation = animation
        animation.translateY(300).step()
        this.setData({
            animationData: animation.export(),
            showModalStatus: true
        })
        setTimeout(function () {
            animation.translateY(0).step()
            this.setData({
                animationData: animation.export()
            })
        }.bind(this), 200)
    },
    addNotebtn: function () {
        this.setData({
            noteContent: "",
            noteId: 0
        });
        if (this.data.showModalStatus) {
            this.hideModal();
        } else {
            this.showModal();
        }
    },
    hideModal: function () {
        // 隐藏遮罩层
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        })
        this.animation = animation
        animation.translateY(300).step()
        this.setData({
            animationData: animation.export(),
        })
        setTimeout(function () {
            animation.translateY(0).step()
            this.setData({
                animationData: animation.export(),
                showModalStatus: false
            })
        }.bind(this), 200)
    },
    click_cancel: function () {
        console.log("点击取消");
        this.hideModal();
    },
    input_content: function (e) {
        inputinfo = e.detail.value;
        console.log(inputinfo);
        var that = this;
        that.setData({
            height: "margin-bottom:30px"
        })
    },
    click_ok: function (e) {
        var that = this;  // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        if (inputinfo == '') {
            app.alertBox('计划内容不能为空!');
            return;
        }
        var id = e.currentTarget.id;
        var url = '';
        var title = '';
        var sentData = {//发送给后台的数据
            folderId: currentFolderId,
            content: inputinfo,
            userId: that.data.userId,
            mini: mini
        }
        if (id == null || id == 0) {
            url = 'https://hellogood.top/hellogood_api/note/add.do';
            title = '已添加';
        } else {
            url = 'https://hellogood.top/hellogood_api/note/update.do';
            sentData.id = id;
            title = '已更新';
        }

        wx.request({
            url: url,//请求地址
            data: sentData,
            method: "POST",//get为默认方法/POST
            success: function (res) {
                //如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
                var result = res.data
                if (result.status == 'success') {
                    that.getNoteData(currentFolderId, searchInputInfo);
                    wx.showToast({
                        title: title,
                        icon: 'success',
                        duration: 300
                    });
                    that.hideModal();
                    inputinfo = "";
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
                showRequestInfo();
            },//请求失败
            complete: function () {
                inputinfo = "";
            }//请求完成后执行的函数
        });
    },
    editNotebtn: function (noteId, content) {
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        that.showModal();
        that.setData({
            noteContent: content,
            noteId: noteId
        });

    },
    mytouchstart: function (e) {
        var that = this;
        that.setData({
            touch_start: e.timeStamp
        })
        console.log(e.timeStamp + '- touch-start')
    },
    //按下事件结束
    mytouchend: function (e) {
        var that = this;
        that.setData({
            touch_end: e.timeStamp
        })
        console.log(e.timeStamp + '- touch-end')
    },
    updateOrDelete: function (options) {
        var that = this;
        //触摸时间距离页面打开的毫秒数
        var touchTime = that.data.touch_end - that.data.touch_start;
        var id = options.currentTarget.id;
        var content = options.currentTarget.dataset.content;
        var display = 1 - options.currentTarget.dataset.display;

        if (touchTime < 200) {
            that.editNotebtn(id, content);
        } else {
            wx.showModal({
                title: '删除计划',
                content: '删除后可在【回收站】中找回',
                success: function (res) {
                    if (res.confirm) {
                        that.setRecycle(id, display);
                    }
                }
            })

        }
    },
    setRecycle: function (noteId, display) {
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        wx.request({
            url: 'https://hellogood.top/hellogood_api/note/setRecycle.do',//请求地址
            data: {//发送给后台的数据
                id: noteId,
                display: display,
                userId: that.data.userId
            },
            method: "POST",//get为默认方法/POST
            success: function (res) {
                //如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
                var result = res.data
                if (result.status == 'success') {
                    that.getNoteData(currentFolderId, searchInputInfo);
                    if (display == 0) {
                        wx.showToast({
                            title: '已放入回收站',
                            icon: 'success',
                            duration: 300
                        })
                    } else {
                        wx.showToast({
                            title: '已移出回收站',
                            icon: 'success',
                            duration: 300
                        })
                    }
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
                showRequestInfo();
            },//请求失败
            complete: function () {

            }//请求完成后执行的函数
        });
    },


    handletouchmove: function (event) {
        let currentX = event.touches[0].pageX
        let currentY = event.touches[0].pageY
        let tx = currentX - this.data.lastX
        let ty = currentY - this.data.lastY
        let text = ""
        //左右方向滑动
        if (Math.abs(tx) > Math.abs(ty)) {
            if (tx < 0) {
                text = "向左滑动"
                this.data.currentGesture = 1
            }
            else if (tx > 0) {
                text = "向右滑动"
                this.data.currentGesture = 2
            }
        }
        //上下方向滑动
        else {
            if (ty < 0) {
                text = "向上滑动"
                this.data.currentGesture = 3
            }
            else if (ty > 0) {
                text = "向下滑动"
                this.data.currentGesture = 4
            }
        }
        //将当前坐标进行保存以进行下一次计算
        this.data.lastX = currentX
        this.data.lastY = currentY
        this.setData({
            text: text,
        });

    },

    handletouchtart: function (event) {
        this.data.lastX = event.touches[0].pageX
        this.data.lastY = event.touches[0].pageY
    },
    handletouchend: function (event) {
        var currentGesture = this.data.currentGesture;
        var text = this.data.text;
        if (currentGesture == 1) { //向左滑动
            if (currentFolderIndex < this.data.folderListSize - 1) {
                currentFolderIndex += 1;
                this.goNoteListMove(currentFolderIndex);
            }

        } else if (currentGesture == 2) { //向右滑动
            if (currentFolderIndex > 0) {
                currentFolderIndex -= 1;
                this.goNoteListMove(currentFolderIndex);
            }
        }
        this.data.currentGesture = 0;
    },
    goNoteListMove: function (currentFolderIndex) {
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        var folderId = that.data.folderList[currentFolderIndex].id;
        var folderIndex = currentFolderIndex;
        currentFolderId = folderId;
        currentFolderIndex = folderIndex;
        that.getNoteData(currentFolderId, "");
    },

    searchIcon: function () {
        var that = this;
        that.setData({
            folderShow: false,
            searchShow: true
        })
    },
    searchInput: function (e) {
        searchInputInfo = e.detail.value;
        console.log(searchInputInfo);
    },
    searchNotebtn: function () {
        var that = this;
        that.setData({
            folderShow: true,
            searchShow: false
        })
        if (searchInputInfo != null) {
            that.getNoteData(currentFolderId, searchInputInfo);
            searchInputInfo = "";
        }
    },
    addHeight: function () {
        var that = this;
        that.setData({
            height: "margin-bottom:450rpx"
        })
    }
})
