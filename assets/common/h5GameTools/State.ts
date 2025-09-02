import { urlHelper } from '@common/utils/UrlHelper';

/**
 * 遊戲狀態枚舉
 */
export enum GameStatus {
    OnGameInit = 'OnGameInit',
    // OnGameReady = 'OnGameReady',
    // OnGamePlaying = 'OnGamePlaying',
    // OnGameEnd = 'OnGameEnd',
    /** 準備換分 */
    OnExchangeCredit = "OnExchangeCredit",

    /** 遊戲設置準備完成 */
    OnGameSetupReady = "OnGameSetupReady",
    /** 遊戲準備就緒 */
    OnReady = "OnGameReady",
    /** 收到遊戲開始結果 */
    OnGetBeginGameResult = "OnGetBeginGameResult",
    /** 準備停止遊戲 */
    OnReadyToStop = "OnReadyToStop",
    /** 所有轉輪停止 */
    OnReelAllStop = "OnReelAllStop",
    /** 餘額不足 */
    OnNotEnough = "OnNotEnough"
}

/**
 * JP 類型枚舉
 */
export enum JPType {
    Grand = 1,
    Minor = 2,
    Major = 3,
    Mini = 4
}

/**
 * 站點類型枚舉
 */
export enum SiteType {
    BB = 1,
    XC = 2,
    LM = 3,
    BBGP = 4
}

/**
 * 獲取站點類型
 * @param site 站點名稱
 * @returns 站點類型枚舉值
 */
function getSiteType(site: string): SiteType {
    switch (site) {
        case "XC":
            return SiteType.XC;
        case "LM":
            return SiteType.LM;
        case "BBIN":
            return SiteType.BB;
        case "BBGP":
            return SiteType.BBGP;
        default:
            return SiteType.BB;
    }
}

/**
 * 獲取自定義配置
 * @param siteType 站點類型
 * @returns 自定義配置對象
 */
function getCustomConfig(siteType: SiteType): any {
    // 這裡可以根據不同的站點類型返回不同的配置
    // 暫時返回空對象，您可以根據需要擴展
    return {};
}

/**
 * 存儲狀態接口
 */
export interface StoreState {
    gameCoreVersion: string;
    userName: string;
    bgAudioOn: boolean;
    effectAudioOn: boolean;
    isTurbo: boolean;
    gameStatus: GameStatus;
    hallID: string;
    userID: number;
    gameCode: string;
    jackpot: number;
    balance: number;
    credit: number;
    wagersID: string;
    payoff: number;
    bet: number;
    totalBet: number;
    betCreditList: any[];
    isCash: boolean;
    isGCP: boolean;
    isXC: boolean;
    siteType: SiteType;
    customConfig: any;
    noExchange: boolean;
    isFreeGame: boolean;
    isBonusGame: boolean;
    isAutoPlay: boolean;
    isReSpin: boolean;
    isExtraBet: boolean;
    showBuyFreeGameDialog: boolean;
    currency: string;
    i18n: Record<string, any>;
    autoExchange: boolean;
    exchangeCredit: number;
    exchangeAll: boolean;
    enableJP: boolean;
    exchangeRecord: any[];
    base: string;
    baseList: any[];
    betLevel: number;
    maxBetLevel: number;
    betLevelBase: number;
    direction: string;
}

/**
 * 獲取基礎存儲狀態
 * @returns 基礎存儲狀態對象
 */
export function getBaseStoreState(): StoreState {
    const siteType = getSiteType(urlHelper.site);
    
    return {
        gameCoreVersion: "1.0.0",
        userName: "",
        bgAudioOn: true,
        effectAudioOn: true,
        isTurbo: false,
        gameStatus: GameStatus.OnGameInit,
        hallID: "",
        userID: 0,
        gameCode: "",
        jackpot: 0,
        balance: 0,
        credit: 0,
        wagersID: "",
        payoff: 0,
        bet: 0,
        totalBet: 0,
        betCreditList: [],
        isCash: false,
        isGCP: false,
        isXC: urlHelper.site === "XC",
        siteType,
        customConfig: getCustomConfig(siteType),
        noExchange: false,
        isFreeGame: false,
        isBonusGame: false,
        isAutoPlay: false,
        isReSpin: false,
        isExtraBet: false,
        showBuyFreeGameDialog: false,
        currency: "",
        i18n: {},
        autoExchange: false,
        exchangeCredit: 0,
        exchangeAll: false,
        enableJP: urlHelper.JpOpen,
        exchangeRecord: [],
        base: "1:1",
        baseList: [],
        betLevel: 1,
        maxBetLevel: 10,
        betLevelBase: 50,
        direction: "P"
    };
}

/**
 * 使用存儲狀態
 * @returns 存儲狀態對象
 */
export function useStoreState(): StoreState {
    const baseData = getBaseStoreState();
    return baseData;
}