function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
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
module.exports = {
    formatTime: formatTime,
    sleep: sleep,
    strlen:strlen
}
