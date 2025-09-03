export interface onBeginGame {
    event: boolean,
    data: {
        PayTotal: number, // 此局玩家贏了多少 credit
        Lines: Lines[][], // 中線相關資料
        Cards: number[][][], // 此次中線symbol資料 [每輪中線symbol資料]/[每行symbol資料]/[symbol資料]
        Scatter: Scatter, // 此次中 scatter 資料
        FreeGame: FreeGame, // 當下中 freegame 資料
        FreeGameSpin: FreeGameSpin, // freegame 中，每一次 freegame 資料
        RollerNumber: number,// 輪帶代號
        BBJackpot: { Pools: JackpotPool[] } | null, // Jackpot 資料
        WagersID: number, // 局號
        Credit: number, // 此次特殊遊戲前，玩家 credit
        Credit_End: number, // 此次特殊遊戲到目前此次slot，玩家 credit
        AxisLocation: string,
        Status?: number,
        HitWagersID?: number, // 中 freegame 當下局號
    },
    tokenId: string
}

export interface onHitJackpot {
    event: boolean,
    data: {
        event: boolean,
        JPAmount: number,
        JPType: number,
        beginGameResult: onBeginGame,
        // TicketNo: string
    }
}

export interface onOnLoadInfo {
    event: boolean,
    data: {
        event: boolean,
        Balance: number, // 玩家擁有金額
        Base: string, // 目前換分比
        DefaultBase: string,  // default 換分比
        BetCreditList: number[], // 下注credit選項
        DefaultBetCredit: number, // default 下注credit選項
        Rates: { [key: string]: number[] }, // symbol 賠率表(顯示在symbol hint)
        UserAutoExchange: UserAutoExchange,
        Currency: string, // 幣別
        LoginName: 'Player', // 玩家暱稱
        AutoExchange: boolean, // 是否自動換分
        Credit: number,  // 玩家目前在遊戲中有多少 credit
        BetBase: string, // default 下注比例
        isCash: boolean, // 是否現金支付
        userSetting: userSetting, // 玩家設定
        SingleBet: 100,// 未知欄位
    },
    tokenId: string
}

export type UpdateJPData = [grand: number, major: number, minor: number, mini: number];

export interface onGetMachineDetail {
    data: {
        event: boolean,
        ExchangeRate: number,
        LoginName: string, // 玩家暱稱
        Currency: string, // 幣別
        HallID: number,
        UserID: number,
        Balance: number, // 玩家擁有金額
        Test: boolean,
        Base: string, // 目前換分比
        DefaultBase: string,  // default 換分比
        Credit: number,  // 玩家目前在遊戲中有多少 credit
        BetBase: string, // default 下注比例
        WagersID: number, // 局號
    },
    event: boolean,
}

export interface onCreditExchange {
    data: {
        Balance: number, // 玩家還有多少錢
        BetBase: string, // 換分比
        Credit: number, // 玩家換了多少分
        event: boolean
    },
    event: boolean
}

export interface Lines {
    DoubleTime: number, // 倍數 X1, X2, X3, X5
    Element: number[], // 此次中線，每一個 slot 中線的 symbol 是什麼
    ElementID: number, //  此次中線，每一個 slot 中線的 symbol 是哪一個
    GridNum: number, // 此次中線是中了幾個格子
    Grids: number[], // 中線是中哪個格子的 symbol
    Payoff: number, // 此次中線玩家得到多少 credit
}

export interface Scatter {
    ID: number, // scatter symbol 代號
    GridNum: number, // 此次 scatter，總共中幾格
    Grids: number[] | null, // 此次 scatter，是哪幾格中
}

export interface FreeGame {
    FreeGamePayoffTotal: number, // 中 free game 當下，總共贏得多少 credit
    FreeGameTime: number, // 中 freegame 當下，此次 freegame 給多少次免費 spin
    HitFree: boolean,  // 當下此次 slot 是否中 free game
    ID: number, // free game symbol 代號
}

export interface FreeGameSpin {
    FreeGameTime: number, // 此局還剩下 freespin 次數
    FreeGamePayoffTotal: number, // 此次 freegame 拉到目前此數總共贏得多少 credit(累積)
    WagersID: number, // freegame 局號
    // LastGame: boolean, // 是否為 freegame最後一局
}

export interface JackpotPool {
    JPTypeID: number,
    PoolAmount: number,
    JPType: string,
    PoolID: string,
    RaiseAmount: number,
    Ratio: number,
    timestamp: number,
}

interface UserAutoExchange {
    'IsAuto': boolean,  // 玩家是否自動換分
    'Credit': number,   // 自動換分要換多少
    'BetBase': string,  // 自動換分比例 2:1(代表2元換1分) , 1:2(1元換2分)
    'Record': [] // 換分紀錄
}

interface userSetting {
    autoCredit: number, // 自動開洗多少分
    auto: boolean, // 自動開洗分
    info: {},
    rate: '1:1' // 自動開洗分比例
}

// 表演用line格式資料(轉換原後端格式用於表演)
export interface NewLines {
    Grids: number[][], // 各行中獎位置
    SymID: number[][], // 各行中獎位置對應的symbolID
    Payoff: number, // 各行中獎金額
    DoubleTime: number, // 該輪倍率
}


