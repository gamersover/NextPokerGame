const os = require('os');


function getNowFormatDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = '0' + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate;
    }
    const currentdate = year + '-' + month + '-' + strDate;
    return currentdate;
}

const GameState = {
    "OutGame": 0,
    "InGame": 1,
    "Prepared": 2,
    "GameStart": 3, // or RoundEnd
    "RoundStart": 4,
    "RoundSkip": 5,
    "PlayerEnd": 6,
    "GameEnd": 7
}

export {
    getNowFormatDate,
    GameState,
}