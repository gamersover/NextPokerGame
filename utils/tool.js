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

const PlayerState = {
    "OutGame": 0,
    "InGame": 1,
    "Prepared": 2,
    "GameStart": 3, // or RoundEnd
    "RoundStart": 4,
    "RoundSkip": 5,
    "PlayerEnd": 6,
    "GameEnd": 7,
    "GameExit": 8
}

const GameState = {
    "GameNotStart": 0,
    "GameStart": 1,
    "GameStop": 2,
}

export {
    getNowFormatDate,
    PlayerState,
    GameState
}