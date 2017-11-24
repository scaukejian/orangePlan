//index.js
//获取应用实例
var utils = require('../../utils/util.js')
var app = getApp();
var mini = 1;
// 当前页数
var page = 1;
var pageSize = 10;
var total = 0;
var canRefresh = true;
var scanDisplay = 'display:none';
Page({
    data: {
        userId: 0,
        noteList: [],
        noteTotal:0,
        noteId: 0,
        currentGesture: 0,
        index: 0,
        show: false,
        msgList: [],
        height: 0,
        scrollY: true,
        noteTip: '拼命加载中...',
        scrollTop : 0,
        hasMoreData:true,
        finish:'',
        top:'',
        display:'',
        title:''
    },
    swipeCheckX: 35, //激活检测滑动的阈值
    swipeCheckState: 0, //0未激活 1激活
    maxMoveLeft: 270, //消息列表项最大左滑距离
    correctMoveLeft: 265, //显示菜单时的左滑距离
    thresholdMoveLeft: 75,//左滑阈值，超过则显示菜单
    lastShowMsgId: '', //记录上次显示菜单的消息id
    moveX: 0,  //记录平移距离
    showState: 0, //0 未显示菜单 1显示菜单
    touchStartState: 0, // 开始触摸时的状态 0 未显示菜单 1 显示菜单
    swipeDirection: 0, //是否触发水平滑动 0:未触发 1:触发水平滑动 2:触发垂直滑动
    onLoad: function (option) {
        //调用应用实例的方法获取全局数据
        var that = this;
        if (!wx.getStorageSync('userId')) {
            app.getUserInfo(function (userInfoData) {
                that.setData({
                    userId: userInfoData.data.userId
                });
            })
        } else {
            that.setData({
                userId: wx.getStorageSync('userId')
            });
        }
        that.setData({
            finish:option.finish,
            top:option.top,
            display:option.display,
        })
        wx.setNavigationBarTitle({
            title: option.title//页面标题为路由参数
        })

        page = 1;
        that.getNoteData();
    },
    onPullDownRefresh: function () {
        if (!canRefresh) return;
        var that = this;
        that.setData({
            scrollTop : 0
        });
        page = 1;
        that.data.msgList.splice(0, that.data.msgList.length);//清空数组
        that.setData({msgList: that.data.msgList, show:false});
        that.getNoteData();
    },
    // 上拉加载数据 上拉动态效果不明显有待改善
    pullUpLoad: function() {
        if (!canRefresh) return;
        var that = this;
        if (that.data.hasMoreData) {
            //显示加载中
            wx.showToast({
                title: '加载中...',
                duration: 100,
                icon: 'loading',
            });
            that.getNoteData();
        } else {
            /*wx.showToast({
                title: '没有更多计划了哟~',
                icon: 'info',
                duration: 1000
            })*/
        }
    },
    getNoteData: function () {//定义函数名称
        canRefresh = false;
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        var data = {//发送给后台的数据
                userId: that.data.userId,
                page: page,
                pageSize: pageSize,
                mini: mini
        }
        if (that.data.finish != undefined){
            data.finish = that.data.finish;
            data.display = 1;
            that.setData({
                title:"已完成"
            })
        }
        if (that.data.top != undefined){
            data.top = that.data.top;
            data.display = 1;
            that.setData({
                title:"已置顶"
            })
        }
        if (that.data.display != undefined){
            data.display = that.data.display;
            that.setData({
                title:"回收站"
            })
        }
        wx.request({
            url: 'https://hellogood.top/hellogood_api/note/getNoteList.do',//请求地址
            data:data,
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
                        total = res.data.total;
                        //格式化
                        var tempList = that.data.noteList;
                        that.pixelRatio = app.globalData.deviceInfo.pixelRatio;
                        var windowHeight = app.globalData.deviceInfo.windowHeight;
                        var windowWidth = app.globalData.deviceInfo.windowWidth;
                        var brand = app.globalData.deviceInfo.brand;
                        var height = windowHeight;
                        //that.data.msgList.splice(0, that.data.msgList.length);//清空数组（切换计划的时候清空缓存数据）
                        var increaseNum1 = 4;
                        var increaseNum2 = 7;
                        if (windowWidth < 375) {
                            increaseNum1 = 0;
                            increaseNum2 = 0;
                            if (windowWidth >= 360) {
                                increaseNum1 = 2;
                                increaseNum2 = 5;
                            }
                        }
                        for (var i = 0; i < tempList.length; i++) {
                            var note = tempList[i];
                            var msg = {};
                            msg.id = 'id-' + (i + 1 + (page -1) * pageSize);
                            msg.noteId = note.id;
                            msg.content = note.content;
                            msg.top = note.top;
                            msg.display = note.display;
                            msg.finish = note.finish;
                            msg.updateTime = utils.formatTime(new Date(note.updateTime));
                            msg.msg_item_height = 58+increaseNum1;
                            msg.msg_height = 58+increaseNum1;
                            msg.msg_menu_height = 57+increaseNum1;
                            msg.msg_menu_line_height = 58+increaseNum1;
                            var length = utils.strlen(note.content);
                            if (note.content != null && length > (37 + increaseNum2)) {
                                var rowNum = Math.floor(length /  (37 + increaseNum2));
                                if (length % (37 + increaseNum2) == 0) {
                                    rowNum = rowNum - 1;
                                }
                                msg.msg_item_height = msg.msg_item_height + ((24+increaseNum1) * rowNum);
                                msg.msg_height = msg.msg_height + ((24+increaseNum1) * rowNum);
                                msg.msg_menu_height = msg.msg_menu_height + ((24+increaseNum1) * rowNum);
                                msg.msg_menu_line_height = msg.msg_menu_line_height + ((24+increaseNum1) * rowNum);
                            }
                            if (note.top != 1) {
                                msg.bookmark_display = "none";
                            }
                            if (note.finish != 1) {
                                msg.tick_display = "none";
                            }
                            that.data.msgList.push(msg);
                        }
                        that.setData({msgList: that.data.msgList, height: height});
                        if (that.data.noteList.length < pageSize) {
                            that.setData({
                                hasMoreData:false
                            })
                            if (page > 1) {
                                scanDisplay = "";
                            } else {
                                scanDisplay = 'display:none';
                            }
                        } else {
                            that.setData({
                                hasMoreData:true
                            })
                            page = page + 1;
                        }
                    } else {
                        that.setData({
                            show: false,
                            noteTip: "暂无计划"
                        });
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
                canRefresh = true;
            },
            fail: function (err) {
                console.log(err);
                showRequestInfo();
                that.setData({
                    show: false,
                    noteTip: "暂无计划"
                });
                app.alertBox('服务器繁忙,请稍后再试');
            },
            complete: function () {
                // complete
                wx.hideNavigationBarLoading() //完成停止加载
                wx.stopPullDownRefresh() //停止下拉刷新
            }
        });
    },
    changeFinish: function (e) {
        if (!canRefresh) return;
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        var noteId = e.currentTarget.dataset.noteid;
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
                    that.translateXMsgItem(e.currentTarget.id, 0, 0);
                    page = 1;
                    that.data.msgList.splice(0, that.data.msgList.length);//清空数组
                    that.setData({msgList: that.data.msgList, show:false});
                    that.getNoteData();
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
        if (!canRefresh) return;
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
                    page = 1;
                    that.data.msgList.splice(0, that.data.msgList.length);//清空数组
                    that.setData({msgList: that.data.msgList, show:false});
                    that.getNoteData();
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
    setRecycle: function (noteId, display, e) {
        if (!canRefresh) return;
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
                    page = 1;
                    that.data.msgList.splice(0, that.data.msgList.length);//清空数组
                    that.setData({msgList: that.data.msgList, show:false});
                    that.getNoteData();
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
    ontouchstart: function (e) {
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
    ontouchmove: function (e) {
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
            //触发垂直操作
            if (Math.abs(moveY) > 4) {
                this.swipeDirection = 2;

                return;
            }
            //触发水平操作
            if (Math.abs(moveX) > 4) {
                this.swipeDirection = 1;
                this.setData({scrollY: false});
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
    ontouchend: function (e) {
        this.swipeCheckState = 0;
        var swipeDirection = this.swipeDirection;
        this.swipeDirection = 0;
        if (this.touchStartState === 1) {
            this.touchStartState = 0;
            this.setData({scrollY: true});
            return;
        }
        //垂直滚动，忽略
        if (swipeDirection !== 1) {
            return;
        }
        if (this.moveX === 0) {
            this.showState = 0;
            //不显示菜单状态下,激活垂直滚动
            this.setData({scrollY: true});
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
            this.setData({scrollY: true});
        }
        this.translateXMsgItem(e.currentTarget.id, this.moveX, 200);
        //this.translateXMsgItem(e.currentTarget.id, 0, 0);
    },
    onDeleteMsgTap: function (e) {
        this.deleteMsgItem(e);
    },
    getItemIndex: function (id) {
        var msgList = this.data.msgList;
        for (var i = 0; i < msgList.length; i++) {
            if (msgList[i].id === id) {
                return i;
            }
        }
        return -1;
    },
    deleteReverseTap: function (e) {
        var that = this;
        var noteId = e.currentTarget.dataset.noteid;
        var display = 1 - e.currentTarget.dataset.display;
        wx.showModal({
            title: '移出回收站',
            content: '此操作可让计划在首页展示',
            success: function (res) {
                if (res.confirm) {
                    that.setRecycle(noteId, display, e);
                }
            }
        })
    },
    deleteOverTap: function (e) {
        var that = this;
        var noteId = e.currentTarget.dataset.noteid;
        wx.showModal({
            title: '彻底删除',
            content: '此操作不可恢复',
            success: function (res) {
                if (res.confirm) {
                    that.deleteOne(noteId, e);
                }
            }
        })
    },
    deleteOne: function (noteId, e) {
        if (!canRefresh) return;
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        wx.request({
            url: 'https://hellogood.top/hellogood_api/note/delete.do',//请求地址
            data: {//发送给后台的数据
                id: noteId,
                userId: that.data.userId
            },
            method: "POST",//get为默认方法/POST
            success: function (res) {
                //如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
                var result = res.data
                if (result.status == 'success') {
                    that.translateXMsgItem(e.currentTarget.id, 0, 0);
                    page = 1;
                    that.data.msgList.splice(0, that.data.msgList.length);//清空数组
                    that.setData({msgList: that.data.msgList, show:false});
                    that.getNoteData();
                    wx.showToast({
                        title: '已删除',
                        icon: 'success',
                        duration: 500
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
            },//请求失败
            complete: function () {

            }//请求完成后执行的函数
        });
    },

    deleteMsgItem: function (e) {
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
    translateXMsgItem: function (id, x, duration) {
        var animation = wx.createAnimation({duration: duration});
        animation.translateX(x).step();
        this.animationMsgItem(id, animation);
    },
    animationMsgItem: function (id, animation) {
        var index = this.getItemIndex(id);
        var param = {};
        var indexString = 'msgList[' + index + '].animation';
        param[indexString] = animation.export();
        this.setData(param);
    },
    animationMsgWrapItem: function (id, animation) {
        var index = this.getItemIndex(id);
        var param = {};
        var indexString = 'msgList[' + index + '].wrapAnimation';
        param[indexString] = animation.export();
        this.setData(param);
    },
    // 定位数据
    scroll:function(event){
        if(!canRefresh) return;
        var that = this;
        that.setData({
            scrollTop : event.detail.scrollTop
        });
    },
    onShareAppMessage: function (res) {
        return {
            title: '橙子计划',
            desc:'我发现了一款不错的小程序，橙子计划，不仅可以分类管理计划，还有智能提醒功能哟~',
            path: '/pages/index/index',
            imageUrl:'/image/icon_home.png',
            success: function(res) {
                console.log("转发成功:" +res); // 转发成功
            },
            fail: function(res) {
                console.log("转发失败:" +res); // 转发失败
            }
        }
    }
})
