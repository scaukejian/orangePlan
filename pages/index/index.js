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
        height_textarea:'',
        msgList:[],
        height:0,
        scrollY:true
    },
    swipeCheckX:35, //激活检测滑动的阈值
    swipeCheckState:0, //0未激活 1激活
    maxMoveLeft:185, //消息列表项最大左滑距离
    correctMoveLeft:175, //显示菜单时的左滑距离
    thresholdMoveLeft: 75,//左滑阈值，超过则显示菜单
    lastShowMsgId:'', //记录上次显示菜单的消息id
    moveX:0,  //记录平移距离
    showState:0, //0 未显示菜单 1显示菜单
    touchStartState:0, // 开始触摸时的状态 0 未显示菜单 1 显示菜单
    swipeDirection:0, //是否触发水平滑动 0:未触发 1:触发水平滑动 2:触发垂直滑动
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
                    that.pixelRatio = app.globalData.deviceInfo.pixelRatio;
                    var windowHeight = app.globalData.deviceInfo.windowHeight;
                    var brand = app.globalData.deviceInfo.brand;
                    var height;
                    if (brand.indexOf("Meizu") != -1) {
                        height = windowHeight -79;
                    } else {
                        height = windowHeight -31;
                    }
                    var tempList = that.data.noteList;
                    console.log("1、tempList:"+tempList.length);
                    for (var i = 0; i < tempList.length; i++) {
                        var note = tempList[i];
                        var msg = {};
                        msg.id = 'id-' + i+1;
                        msg.noteId = note.id;
                        msg.content = note.content;
                        msg.top = note.top;
                        msg.display = note.display;
                        msg.updateTime = utils.formatTime(new Date(note.updateTime));
                        that.data.msgList.push(msg);
                    }
                    that.setData({msgList:that.data.msgList, height:height});
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
                    console.log("2、tempList:"+tempList.length);
                    for (var i = 0; i < tempList.length; i++) {
                        tempList[i].updateTime = utils.formatTime(new Date(tempList[i].updateTime));
                    }
                    that.pixelRatio = app.globalData.deviceInfo.pixelRatio;
                    var windowHeight = app.globalData.deviceInfo.windowHeight;
                    var brand = app.globalData.deviceInfo.brand;
                    var height;
                    if (brand.indexOf("Meizu") != -1) {
                        height = windowHeight - 79;
                    } else {
                        height = windowHeight - 31;
                    }
                    that.data.msgList.splice(0,that.data.msgList.length);//清空数组
                    for (var i = 0; i < tempList.length; i++) {
                        var note = tempList[i];
                        var msg = {};
                        msg.id = 'id-' + i+1;
                        msg.noteId = note.id;
                        msg.content = note.content;
                        msg.top = note.top;
                        msg.display = note.display;
                        msg.updateTime = utils.formatTime(new Date(note.updateTime));
                        that.data.msgList.push(msg);
                    }
                    that.setData({msgList:that.data.msgList, height:height});
                    /*that.setData({
                        noteList: tempList
                    })*/
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
                            duration: 500
                        })
                    } else {
                        wx.showToast({
                            title: '未完成',
                            icon: 'success',
                            duration: 500
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
        var noteId = e.currentTarget.dataset.noteid;
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
                    that.translateXMsgItem(e.currentTarget.id, 0, 0);
                    that.getNoteData(currentFolderId, searchInputInfo);
                    if (top == 1) {
                        wx.showToast({
                            title: '已置顶',
                            icon: 'success',
                            duration: 500
                        })
                    } else {
                        wx.showToast({
                            title: '已取消置顶',
                            icon: 'success',
                            duration: 500
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
                        duration: 500
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
    editNotebtn: function (e) {
        var that = this;
        //触摸时间距离页面打开的毫秒数
        var noteId = e.currentTarget.dataset.noteid;
        var content = e.currentTarget.dataset.content;
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
    setRecycle: function (noteId, display, e) {
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
                    that.translateXMsgItem(e.currentTarget.id, 0, 0);
                    that.getNoteData(currentFolderId, searchInputInfo);
                    if (display == 0) {
                        wx.showToast({
                            title: '已放入回收站',
                            icon: 'success',
                            duration: 500
                        })
                    } else {
                        wx.showToast({
                            title: '已移出回收站',
                            icon: 'success',
                            duration: 500
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
    ontouchstart: function(e) {
        if (this.showState === 1) {
            this.touchStartState = 1;
            this.showState = 0;
            this.moveX = 0;
            this.translateXMsgItem(this.lastShowMsgId, 0, 100);
            this.lastShowMsgId = "";
            return;
        }
        this.firstTouchX = e.touches[0].clientX;
        this.firstTouchY = e.touches[0].clientY;
        if (this.firstTouchX > this.swipeCheckX) {
            this.swipeCheckState = 1;
        }
        this.lastMoveTime = e.timeStamp;
    },

    ontouchmove: function(e) {
        if (this.swipeCheckState === 0) {
            return;
        }
        //当开始触摸时有菜单显示时，不处理滑动操作
        if (this.touchStartState === 1) {
            return;
        }
        var moveX = e.touches[0].clientX - this.firstTouchX;
        var moveY = e.touches[0].clientY - this.firstTouchY;
        //已触发垂直滑动，由scroll-view处理滑动操作
        if (this.swipeDirection === 2) {
            return;
        }
        //未触发滑动方向
        if (this.swipeDirection === 0) {
            console.log(Math.abs(moveY));
            //触发垂直操作
            if (Math.abs(moveY) > 4) {
                this.swipeDirection = 2;

                return;
            }
            //触发水平操作
            if (Math.abs(moveX) > 4) {
                this.swipeDirection = 1;
                this.setData({scrollY:false});
            }
            else {
                return;
            }

        }
        //禁用垂直滚动
        // if (this.data.scrollY) {
        //   this.setData({scrollY:false});
        // }

        this.lastMoveTime = e.timeStamp;
        //处理边界情况
        if (moveX > 0) {
            moveX = 0;
        }
        //检测最大左滑距离
        if (moveX < -this.maxMoveLeft) {
            moveX = -this.maxMoveLeft;
        }
        this.moveX = moveX;
        this.translateXMsgItem(e.currentTarget.id, moveX, 0);
    },
    ontouchend: function(e) {
        this.swipeCheckState = 0;
        var swipeDirection = this.swipeDirection;
        this.swipeDirection = 0;
        if (this.touchStartState === 1) {
            this.touchStartState = 0;
            this.setData({scrollY:true});
            return;
        }
        //垂直滚动，忽略
        if (swipeDirection !== 1) {
            return;
        }
        if (this.moveX === 0) {
            this.showState = 0;
            //不显示菜单状态下,激活垂直滚动
            this.setData({scrollY:true});
            return;
        }
        if (this.moveX === this.correctMoveLeft) {
            this.showState = 1;
            this.lastShowMsgId = e.currentTarget.id;
            return;
        }
        if (this.moveX < -this.thresholdMoveLeft) {
            this.moveX = -this.correctMoveLeft;
            this.showState = 1;
            this.lastShowMsgId = e.currentTarget.id;
        }
        else {
            this.moveX = 0;
            this.showState = 0;
            //不显示菜单,激活垂直滚动
            this.setData({scrollY:true});
        }
        this.translateXMsgItem(e.currentTarget.id, this.moveX, 200);
        //this.translateXMsgItem(e.currentTarget.id, 0, 0);
    },
    onDeleteMsgTap: function(e) {
        this.deleteMsgItem(e);
    },
    onDeleteMsgLongtap: function(e) {
        console.log(e);
    },
    onMarkMsgTap: function(e) {
        console.log(e);
    },
    onMarkMsgLongtap: function(e) {
        console.log(e);
    },
    getItemIndex: function(id) {
        var msgList = this.data.msgList;
        for (var i = 0; i < msgList.length; i++) {
            if (msgList[i].id === id) {
                return i;
            }
        }
        return -1;
    },
    deleteMsgItem: function(e) {
        var that = this;
        var noteId = e.currentTarget.dataset.noteid;
        var display = 1 - e.currentTarget.dataset.display;
        wx.showModal({
            title: '删除计划',
            content: '删除后可在【回收站】中找回',
            success: function (res) {
                if (res.confirm) {
                    that.setRecycle(noteId, display, e);
                }
            }
        })
    },
    translateXMsgItem: function(id, x, duration) {
        var animation = wx.createAnimation({duration:duration});
        animation.translateX(x).step();
        this.animationMsgItem(id, animation);
    },
    animationMsgItem: function(id, animation) {
        var index = this.getItemIndex(id);
        var param = {};
        var indexString = 'msgList[' + index + '].animation';
        param[indexString] = animation.export();
        this.setData(param);
    },
    animationMsgWrapItem: function(id, animation) {
        var index = this.getItemIndex(id);
        var param = {};
        var indexString = 'msgList[' + index + '].wrapAnimation';
        param[indexString] = animation.export();
        this.setData(param);
    }
})
