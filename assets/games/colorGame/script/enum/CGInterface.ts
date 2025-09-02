import { RebetState } from "./CGEnum";

//==================GS資料格式==================
export interface login {
    action: string;//動作
    event: boolean;//操作是否成功的標誌
    gameType: string;
    error?: string;//錯誤訊息
    data: {
        Sid: string;
        UserID: number;
        HallID: number;
        GameID: number;
        COID: number;
        Test: number;
        ExchangeRate: number;
        IP: string;
    }
};

export interface loadInfo {
    action: string;//動作
    event: boolean;//操作是否成功的標誌
    gameType: string;
    error?: string;//錯誤訊息
    data: {
        event: boolean;//操作是否成功的標誌
        ExchangeRate: number;
        LoginName: string, // 用戶暱稱
        Currency: string, // 幣別
        HallID: string;
        UserID: number;//用戶ID
        AutoExchange: boolean, // 是否自動換分
        Balance: number, // 用戶擁有金額
        Test: string;
        Base: string, // 目前換分比
        DefaultBase: string,  // default 換分比
        Credit: number,  // 用戶目前在遊戲中有多少 credit
        BetBase: string, // default 押注比例
        WagersID: number;
        UserAutoExchange: UserAutoExchange,//是否自動換分
        BetCreditList: number[], // 押注credit選項
        BetRange: { Max: number, Min: number },//押注範圍
        SingleBet: 100,// 未知欄位
        // isCash: boolean, // 是否現金支付
        // userSetting: userSetting, // 用戶設定
    }
}

export interface joinGame {
    action: string;//動作
    gameType: string;
    event: boolean;//操作是否成功的標誌
    error?: string;//錯誤訊息
    data: {
        roadmap: string[];//前10局開獎顏色
        roundSerial: number;//局號
        countdown: number;//剩餘押注時間
        gameState: string;//遊戲目前狀態
        startColor: number[];//該局起始顏色
        betTotalTime: number; // 單局押注時間
        roadmapRate: RoadMapRate;//前100局顏色分佈
        dice: string;//該局勝利3顏色
        playerData: PlayerData;//玩家資料
        roomInfo: { playerList: PlayerData[] };//房間玩家資料
        betData?: ColorBetInfo;//押注資料
        BetTotal?: number;//押注總金額
    }
}

export interface creditExchange {
    action: string;//動作
    gameType: string;
    event: boolean;//操作是否成功的標誌
    error?: string;//錯誤訊息
    data: {
        event: boolean;//操作是否成功的標誌
        Balance: number;//餘額
        Credit: number;//分數
        BetBase: string;//換分比
    }
}

export interface getMachineDetail {
    action: string;//動作
    gameType: string;
    event: boolean;//操作是否成功的標誌
    error?: string;//錯誤訊息
    data: {
        event: boolean;//操作是否成功的標誌
        ExchangeRate: number;
        LoginName: string, // 用戶暱稱
        Currency: string, // 幣別
        HallID: string;
        UserID: number;//用戶ID
        Balance: number, // 用戶擁有金額
        Test: boolean;
        Base: string, // 目前換分比
        DefaultBase: string,  // default 換分比
        Credit: number,  // 用戶目前在遊戲中有多少 credit
        BetBase: string, // default 押注比例
        WagersID: number;
    }
}

//更新資料(server每秒傳送)
export interface update {
    action: string;
    gameType: string;
    data: {
        state: string;//遊戲目前狀態
        //state-NewRound
        roundSerial?: number;//局號
        startColor?: number[];//該局起始顏色
        //state-BeginGame
        countdown?: number;//押注倒數時間(每秒更新)
        betInfo?: BetInfoList[];//所有玩家該秒押注資訊
        //state-Opening
        wagersID?: number;
        dice?: string;//該局勝利3顏色
        position?: number;//該局表演路徑ID
        roadmapRate?: RoadMapRate;//前100局顏色分佈
        payInfo?: PayInfo[];//派彩資料
        balance?: number;//餘額(跟updateCredit一樣，目前沒用到)
        //state-EndedGame(純狀態，無資料)
    }
}

//更新Credit資料
export interface updateCredit {
    action: string;
    gameType: string;
    data: {
        credit: number;//可用餘額
    }
}

//押注成功回傳資料s
export interface beginGame {
    action: string;
    event: boolean; // 操作是否成功的標誌
    gameType: string;
    error?: string;//錯誤訊息
    message?: string;//錯誤訊息
    data: {
        betInfo: {
            Cards: BetInfo[];
        }
        BetTotal: number;
        wagersID?: number;
        Credit: number; // 用戶剩餘額度
        // CreditEnd?: number;
    }
}

//玩家進出資料(ColorGame使用)
export interface player {
    action: string;//動作
    gameType: string;
    data: {
        enter: PlayerData[];//新加入的玩家
        leave: number[];//離開的玩家enterID
    }
}

//玩家資料
export interface PlayerData {
    enterID: number;
    displayName: string;
    avatarID: number;
    pay?: number;//贏分
    betInfo?: ColorBetInfo;//押注資料
    betCredits?: number[];//前端新增的資料格式，會將betInfo的資料轉換成陣列資料[]
}

//押注資料
export interface BetInfoList {
    enterID: number;
    betInfo: BetInfo[];
}

//押注資料
export interface BetInfo {
    color: string;
    betCredit: number;
}

//各顏色押注資料
export interface ColorBetInfo extends Record<string, ColorBetData | undefined> {
    Yellow?: ColorBetData,
    Grey?: ColorBetData,
    Purple?: ColorBetData,
    Blue?: ColorBetData,
    Red?: ColorBetData,
    Green?: ColorBetData
}

// //單顏色押注資料
export interface ColorBetData {
    BetCredit: number;
    payoff?: number;
    odds?: number;
}

//前100局顏色分佈
export interface RoadMapRate {
    Yellow: number;
    Grey: number;
    Purple: number;
    Blue: number;
    Red: number;
    Green: number;
}

//派彩資料
export interface PayInfo {
    enterID: number;//贏得額度
    pay: number;//贏分
}

//自動換分
export interface UserAutoExchange {
    IsAuto: boolean;
    Credit: number;
    BetBase: string;
    Record: number[];
}
//==================GS資料格式==================


//==================遊戲用==================
//表演路徑資料
export interface PathInfo {
    pos: number[][];//路徑座標參數[第幾個frame][三顆骰子的座標]
    rotate: number[][];//路徑旋轉參數[第幾個frame][三顆骰子的座標]
    diceNumber: number[];//開獎點數[三顆骰子的點數](0~5)
}

//上一次續押資料(記錄續押各顏色總金額就好)
export interface RebetData {
    betCredits: number[];//各注區的總押注額
    total: number;//續押金額
    state: RebetState;//續押狀態
}
//==================遊戲用==================