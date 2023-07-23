function getNowFormatDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = '0' + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate;
    }
    var currentdate = year + '-' + month + '-' + strDate;
    return currentdate;
}

const GameState = {
    "OutGame": 0,
    "InGame": 1,
    "Prepared": 2,
    "GameStart": 3, // or RoundEnd
    "RoundStart": 4,
    "RoundSkip": 5,
    "PlayerEnd": 6
}

export {
    getNowFormatDate,
    GameState
}