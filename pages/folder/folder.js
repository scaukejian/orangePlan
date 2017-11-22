//index.js
//获取应用实例
var utils = require('../../utils/util.js')
var app = getApp();
// 当前页数
var page = 1;
var pageSize = 15;
var total = 0;
var canRefresh = true;
var inputinfo = "";
Page({
    data: {
        userId: 0,
        name:'',
        folderList: [],
        folderTotal:0,
        folderId: 0,
        currentGesture: 0,
        index: 0,
        show: false,
        msgList: [],
        height: 0,
        scrollY: true,
        folderTip: '拼命加载中...',
        scrollTop : 0,
        hasMoreData:true,
        title:'',
        editTip:''
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
        page = 1;
        that.getFolderData();
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
        that.getFolderData();
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
            that.getFolderData();
        } else {
            /*wx.showToast({
                title: '没有更多文件夹了哟~',
                icon: 'info',
                duration: 1000
            })*/
        }
    },
    getFolderData: function () {//定义函数名称
        canRefresh = false;
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        var data = {//发送给后台的数据
                userId: that.data.userId,
                page: page,
                pageSize: pageSize
        }
        wx.request({
            url: 'https://hellogood.top/hellogood_api/folder/getFolderList.do',//请求地址
            data:data,
            method: "POST",//get为默认方法/POST
            success: function (res) {
                //如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
                var result = res.data
                if (result.status == 'success') {
                    that.setData({
                        folderList: res.data.dataList
                    });
                    if (that.data.folderList != null && that.data.folderList.length > 0) {
                        that.setData({
                            show: true
                        });
                        total = res.data.total;
                        //格式化
                        var tempList = that.data.folderList;
                        that.pixelRatio = app.globalData.deviceInfo.pixelRatio;
                        var windowHeight = app.globalData.deviceInfo.windowHeight;
                        var windowWidth = app.globalData.deviceInfo.windowWidth;
                        var brand = app.globalData.deviceInfo.brand;
                        var height;
                        if (brand.indexOf("Meizu") != -1) {
                            height = windowHeight - 79;
                        } else {
                            height = windowHeight - 31;
                        }
                        //that.data.msgList.splice(0, that.data.msgList.length);//清空数组（切换文件夹的时候清空缓存数据）
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
                            var folder = tempList[i];
                            var msg = {};
                            msg.id = 'id-' + (i + 1 + (page -1) * pageSize);
                            msg.folderId = folder.id;
                            msg.name = folder.name;
                            msg.userId = folder.userId;
                            msg.msg_item_height = 38+increaseNum1;
                            msg.msg_height = 38+increaseNum1;
                            msg.msg_menu_height = 37+increaseNum1;
                            msg.msg_menu_line_height = 38+increaseNum1;
                            var length = utils.strlen(folder.name);
                            if (folder.name != null && length > (37 + increaseNum2)) {
                                var rowNum = Math.floor(length /  (37 + increaseNum2));
                                if (length % (37 + increaseNum2) == 0) {
                                    rowNum = rowNum - 1;
                                }
                                msg.msg_item_height = msg.msg_item_height + ((24+increaseNum1) * rowNum);
                                msg.msg_height = msg.msg_height + ((24+increaseNum1) * rowNum);
                                msg.msg_menu_height = msg.msg_menu_height + ((24+increaseNum1) * rowNum);
                                msg.msg_menu_line_height = msg.msg_menu_line_height + ((24+increaseNum1) * rowNum);
                            }
                            that.data.msgList.push(msg);
                        }
                        that.setData({msgList: that.data.msgList, height: height});
                        if (that.data.folderList.length < pageSize) {
                            that.setData({
                                hasMoreData:false
                            })
                        } else {
                            that.setData({
                                hasMoreData:true
                            })
                            page = page + 1;
                        }
                    } else {
                        that.setData({
                            show: false,
                            folderTip: "暂无文件夹"
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
                    folderTip: "暂无文件夹"
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
    addFolderbtn: function () {
        this.setData({
            name: "",
            folderId: 0,
            editTip:"新增文件夹"
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
        this.hideModal();
    },
    input_content: function (e) {
        inputinfo = e.detail.value;
    },
    click_ok: function (e) {
        if (!canRefresh) return;
        var that = this;  // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        var id = e.currentTarget.id;
        var url = '';
        var title = '';
        var sentData = {//发送给后台的数据
            name: inputinfo,
            userId: that.data.userId
        }
        if (id == null || id == 0) {
            if (inputinfo == '') {
                app.alertBox('文件夹内容不能为空!');
                return;
            }
            url = 'https://hellogood.top/hellogood_api/folder/add.do';
            title = '已添加';
        } else {
            if (inputinfo == '') {
                that.hideModal();
                return;
            }
            url = 'https://hellogood.top/hellogood_api/folder/update.do';
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
                    page = 1;
                    that.data.msgList.splice(0, that.data.msgList.length);//清空数组
                    that.setData({msgList: that.data.msgList, show:false});
                    that.getFolderData();
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
    editFolderbtn: function (e) {
        var that = this;
        //触摸时间距离页面打开的毫秒数
        var folderId = e.currentTarget.dataset.folderid;
        var name = e.currentTarget.dataset.name;
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        that.showModal();
        that.setData({
            name: name,
            folderId: folderId,
            editTip:"修改文件夹"
        });

    },
    setRecycle: function (folderId, e) {
        if (!canRefresh) return;
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        wx.request({
            url: 'https://hellogood.top/hellogood_api/folder/delete.do',//请求地址
            data: {//发送给后台的数据
                id: folderId,
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
                    that.getFolderData();
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
        var folderId = e.currentTarget.dataset.folderid;
        wx.showModal({
            title: '移出回收站',
            content: '此操作可让文件夹在首页展示',
            success: function (res) {
                if (res.confirm) {
                    that.setRecycle(folderId, e);
                }
            }
        })
    },
    deleteOverTap: function (e) {
        var that = this;
        var folderId = e.currentTarget.dataset.folderid;
        wx.showModal({
            title: '彻底删除',
            content: '此操作不可恢复',
            success: function (res) {
                if (res.confirm) {
                    that.deleteOne(folderId, e);
                }
            }
        })
    },
    deleteOne: function (folderId, e) {
        if (!canRefresh) return;
        var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
        wx.request({
            url: 'https://hellogood.top/hellogood_api/folder/delete.do',//请求地址
            data: {//发送给后台的数据
                id: folderId,
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
                    that.getFolderData();
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
        var folderId = e.currentTarget.dataset.folderid;
        wx.showModal({
            title: '删除文件夹',
            content: '删除后无法恢复',
            success: function (res) {
                if (res.confirm) {
                    that.setRecycle(folderId, e);
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
            title: '橙子文件夹',
            desc:'我发现了一款不错的小程序，橙子文件夹，不仅可以分类管理文件夹，还有智能提醒功能哟~',
            path: '/pages/index/index',
            imageUrl:'/image/icon_home.png',
            success: function(res) {
                console.log("转发成功:" +res); // 转发成功
            },
            fail: function(res) {
                console.log("转发失败:" +res); // 转发失败
            }
        }
    },
    getNoteList: function (e) {
        var folderId = e.currentTarget.dataset.folderid;
        console.log()
        wx.navigateTo({
            url: '../index/index?folderId=' + folderId
        });
    }
})
