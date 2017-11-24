function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}
function formatDate(time) {
    var date = new Date(time);
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    return [year, month, day].map(formatNumber).join('-');
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function sleep(time) {
    var startTime = Date.now();
    var nowTime = 0;
    while (1) {
        nowTime = Date.now();
        if ((nowTime - startTime) > time) {
            return;
        }
    }
}
function strlen(str){
    var len = 0;
    for (var i=0; i<str.length; i++) {
        var c = str.charCodeAt(i);
        //单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
            len++;
        }
        else {
            len+=2;
        }
    }
    return len;
}

//首页时间格式化
function dateformat(now) {
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var h=now.getHours();
    var m=now.getMinutes();
    var s=now.getSeconds();
    if (h < 10) {
        h = "0" + h;
    }
    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }
    var str = year + "年" + month + "月" + day + "日 " + h + ":" + m + ":" + s;
    return str;
}

function getTime(that) {
    var now = new Date();
    var week = " 周"+"日一二三四五六".charAt(new Date().getDay());
    // 渲染倒计时时钟
    that.setData({
        time: dateformat(now) + week
    });
    //每秒渲染一次
    setTimeout(function () {
        getTime(that);
    }, 1000)
}

module.exports = {
    formatTime: formatTime,
    sleep: sleep,
    strlen:strlen,
    getTime:getTime,
    formatDate:formatDate
}
