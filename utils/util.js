function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
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

module.exports = {
    formatTime: formatTime,
    sleep: sleep
}
