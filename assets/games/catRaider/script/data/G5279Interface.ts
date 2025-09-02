import { Node } from "cc";

export interface onBeginGame {
    event: boolean,
    data: {
        totalPay: number, // 此局玩家贏了多少 credit
        lines: lines[][], // 中線相關資料
        cards: number[][][], // 此次中線symbol資料 [每輪中線symbol資料]/[symbol資料]
        BBJackpot?: BBJackpot, // Jackpot 資料
        wagersID: number, // 局號
        credit: number, // 此次特殊遊戲前，玩家 credit
        creditEnd: number, // 此次特殊遊戲到目前此次slot，玩家 credit
        status?: number,
        hitWagersID?: number, // 中 freegame 當下局號

        /**奪寶奇喵 */
        chanceCards: number[], // 機會卡獲得排序
        floors: floors[], // 每回的下層盤面資料
        // startLevel: number, //初始盤面等級(因購買遊戲會導致初始就要表演進入等級3)
        bonusGame: bonusGame, // bonus遊戲資料
    },
    tokenId?: string
}

export interface lines {
    event: string, // 事件名稱("line","chance","levelUp","bonus","rat","party")
    grids?: number[], // 中線過程位置ID (by line/rat)
    //盜鼠:起點位置ID+蒐集的寶石位置ID(只填有寶石的位置)+終點位置ID
    symbolIDs?: number[], // 中線過程符號ID(第一個參數就能知道哪隻角色移動) (by line/rat)
    //盜鼠:起點盜鼠ID+蒐集的寶石ID+終點的寶石ID(沒寶石就填0)

    payoff?: number[], // 此次中線玩家得到多少credit (by line/rat)
    cardID?: number, // 使用機會卡ID (by chance)
    level?: number, // 盤面等級(2=6x6) (by levelUp/party)
    hitFree?: boolean, // 是否是獲得bonus遊戲階段(是才出現獲得畫面) (by bonus)
    freeGameTimes?: number, // 目前剩餘bonus遊戲次數 (by bonus)
    freeGameTotal?: number, // 總bonus遊戲次數 (by bonus)
    payoffTotal?: number, // 總派彩金額 (by bonus)
    ratScore?: number, // 盜鼠目前累積的寶石分數 (by rat)
}

export interface floors {
    grids: number[], // 地面符號位置ID
    symbolIDs: number[], // 地面符號ID
    payoff: number[], // 金幣分數("地洞"跟"鼠洞"分數為0)
}

interface bonusGame {
    status: boolean, // 是否是獲得bonus遊戲階段(是才出現獲得畫面)
    payoff: number, // bonus遊戲總贏分
}

interface BBJackpot {
    pools: pool[];
}

interface pool {
    jPTypeID: number;
    poolAmount: number;
    jPType: string;
    poolID: string;
    raiseAmount: number;
    ratio: number;
    timestamp: number;
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
    event?: boolean,
    data: {
        common: common,
        extra: extra,
        game: game,
        vendor: vendor,
    },
    // tokenId: string
}

interface common {
    balance: number, // 玩家擁有金額
    betCreditList: number[],//下注額度列表
    currency: string, // 幣別
    defaultBetCredit: number,//預設下注額度
    userId: string, // 玩家ID
    // credit: number, // 玩家目前在遊戲中有多少 credit
}

interface extra {
    buyFree: boolean,
    buyFreeRatio: number[],
    maxEnergy: number,
}

interface game {
    payTable: { [key: string]: number[] }
}

interface vendor {
    gameCode: number,
    userName: string,
}

export type updateJPData = [grand: number, major: number, minor: number, mini: number];

export interface onGetMachineDetail {
    data: {
        event: boolean,
        exchangeRate: number,
        loginName: string, // 玩家暱稱
        currency: string, // 幣別
        hallID: number,
        UserID: number,
        balance: number, // 玩家擁有金額
        test: boolean,
        base: string, // 目前換分比
        defaultBase: string,  // default 換分比
        credit: number,  // 玩家目前在遊戲中有多少 credit
        betBase: string, // default 下注比例
        wagersID: number, // 局號
    },
    event: boolean,
}

export interface onCreditExchange {
    data: {
        balance: number, // 玩家還有多少錢
        betBase: string, // 換分比
        credit: number, // 玩家換了多少分
        event: boolean
    },
    event: boolean
}

// interface userAutoExchange {
//     'IsAuto': boolean,  // 玩家是否自動換分
//     'Credit': number,   // 自動換分要換多少
//     'BetBase': string,  // 自動換分比例 2:1(代表2元換1分) , 1:2(1元換2分)
//     'Record': [] // 換分紀錄
// }

// interface userSetting {
//     autoCredit: number, // 自動開洗多少分
//     auto: boolean, // 自動開洗分
//     info: {},
//     rate: "1:1" // 自動開洗分比例
// }

//設置symbol屬性
export interface SymbolNode extends Node {
    symbolID: number;//symbolID
    posID: number;//symbol位置ID
    isWin: boolean;//是否中獎(一般中獎符號使用)
    payoff: number;//中獎金額(地面金幣使用)
    isCoinCover: boolean;//是否被上層金幣蓋住(因為金幣會重疊)
}