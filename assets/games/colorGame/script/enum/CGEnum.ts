//押注類型
export enum BetType {
    NEW_BET = 'newBet',
    RE_BET = 'reBet',
}

//續押狀態
export enum RebetState {
    INIT = 'init',
    ONCE_BET = 'onceBet',
    AUTO_BET = 'autoBet',
    AUTO_STOP = 'autoStop'
}

//遊戲狀態
export enum GameState {
    NEW_ROUND = 'NewRound',//新局開始
    BEGIN_GAME = 'BeginGame',//遊戲中(押注階段)
    OPENING = 'Opening',//停止押注(開骰)
    ENDED_GAME = 'EndedGame',//回合結束(派獎階段)
}

//骰子顏色ID
export enum ColorID {
    Yellow = 0,
    Grey = 1,
    Purple = 2,
    Blue = 3,
    Red = 4,
    Green = 5
}