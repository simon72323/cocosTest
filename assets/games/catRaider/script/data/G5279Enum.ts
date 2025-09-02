// 遊戲狀態
export enum G5279GameState {
    ON_ZOMBIE_PARTY = 'onZombieParty', // 僵屍派對狀態
    ON_BEGIN_GAME = 'onBeginGame',   // 一般轉動狀態
    ON_BONUS = 'onBonus', // Bonus狀態
    ON_READY = 'onReady' // 準備狀態
}

// 下注類型
export enum G5279BetState {
    NORMAL = 'normal', //一般遊戲
    BUY_BONUS_GAME = 'buyBonusGame', // 購買免費遊戲
    BUY_FEATURE_L3 = 'buyFeatureL3', // 購買等級3功能
}

// 符號ID
export enum G5279SymbolIDs {
    //角色
    chr1 = 1,
    chr2 = 2,
    chr3 = 3,
    chr4 = 4,

    //特殊符號
    wild = 51,
    bonus = 52,
    bomb = 53,
    gemLevelUp = 54,
    enertyFull = 55,
    rat = 56,

    //地板sym
    nextLevel = 101,
    ratHole = 102,
    coin2x = 111,
    coin5x = 112,
    coin10x = 113,
    coin15x = 114,
    coin25x = 115,
    coin50x = 116,
    coin100x = 117,
    coin500x = 118,
    coin1000x = 119,
    coin10000x = 120,
}