/**
 * GTM 事件管理器 - 用於管理遊戲的 GTM 事件追蹤
 */

import { commonStore } from '@common/h5GameTools/CommonStore';
import { Logger } from '@common/utils/Logger';

/**
 * 下注基礎數據介面
 */
interface BetBaseData {
    bet_amount: number;
    exchange_rate: number;
    is_auto: boolean;
    is_turbo: boolean;
    is_extra_bet: boolean;
    is_buy_freegame: boolean;
    is_freegame: boolean;
    is_reSpin: boolean;
}

/**
 * GTM 事件管理器類別
 */
export class GTMEvent {
    private betBaseData: BetBaseData;
    private isBuyFreeGame: boolean;

    constructor() {
        // 儲存與下注相關的基本數據
        this.betBaseData = {} as BetBaseData;
        this.isBuyFreeGame = false;
        this.updateBetBaseData();
    }

    /**
     * 使用單例模式來獲取 GTMEvent 的共享實例
     */
    public static getInstance(): GTMEvent {
        if (!GTMEvent._instance) {
            GTMEvent._instance = new GTMEvent();
        }
        return GTMEvent._instance;
    }

    private static _instance: GTMEvent | null = null;

    /**
     * 更新下注基礎數據
     */
    private updateBetBaseData(): void {
        this.betBaseData = {
            bet_amount: commonStore.storeState.bet,
            exchange_rate: commonStore.storeState.base,
            is_auto: commonStore.storeState.isAutoPlay,
            is_turbo: commonStore.storeState.isTurbo,
            is_extra_bet: commonStore.storeState.isExtraBet,
            is_buy_freegame: this.isBuyFreeGame,
            is_freegame: commonStore.storeState.isFreeGame,
            is_reSpin: commonStore.storeState.isReSpin
        };
    }

    /* GAME CORE GTM */
    /**
     * 點擊畫面Symbol的 GTM 事件
     * @param symbol 符號名稱
     * @param odds 賠率
     */
    public CORE_GAME_SYMBOL_CLICK(symbol: string, odds: number): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_SYMBOL-CLICK - symbol: ${symbol}, odds: ${odds}`);
    }

    /**
     * 發送派彩的 GTM 事件
     * 當下注結束並派彩時調用
     * CORE 開頭表示為遊戲核心相關的 GTM 事件
     */
    public CORE_GAME_PAYOFF(pf: number): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_PAYOFF - payoff: ${pf}`);
    }

    /**
     * 發送購買免費遊戲的 GTM 事件
     * 當玩家嘗試購買免費遊戲時調用
     * @param isOpen 畫面是否為開啟狀態
     * CORE 開頭表示為遊戲核心相關的 GTM 事件
     */
    public CORE_GAME_BUY_FREEGAME_CLICK(isOpen: boolean = true): void {
        this.isBuyFreeGame = isOpen;
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_BUY-FREEGAME-CLICK - is_open: ${isOpen}`);
    }

    /**
     * 發送購買幸運下注的 GTM 事件
     * 當玩家嘗試購買幸運下注時調用
     * CORE 開頭表示為遊戲核心相關的 GTM 事件
     */
    public CORE_GAME_BUY_LUCKYBET_CLICK(isOpen: boolean = true): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_LUCKYBET-CLICK - is_open: ${isOpen}`);
    }

    /**
     * 發送跟注點擊的 GTM 事件
     * 當玩家嘗試按下跟注記錄點擊次數用
     * 目前是ColorGame有用到
     * CORE 開頭表示為遊戲核心相關的 GTM 事件
     */
    public CORE_GAME_CALLBET_CLICK(): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_CALLBET-CLICK');
    }

    /**
     * 發送跟注的 GTM 事件
     * 當玩家嘗試下跟注用
     * 目前是ColorGame有用到
     * CORE 開頭表示為遊戲核心相關的 GTM 事件
     */
    public CORE_GAME_CALLBET(): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_CALLBET');
    }

    /**
     * 發送下注的 GTM 事件
     * 當玩家下注用
     * 如果因遊戲的差異，需要特例處理，請在各自的遊戲中呼叫此方法
     * 但需要跟Loader提出讓Loader做例外處理，以避免重複事件
     * CORE 開頭表示為遊戲核心相關的 GTM 事件
     */
    public CORE_GAME_BET(): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_BET');
    }

    /**
     * 發送重新下注的 GTM 事件
     * 當玩家在遊戲畫面上，遊戲自行設置的按鈕進行重新下注時調用
     * 目前在五行再次轉動有使用到。
     * @param bet 下注金額
     */
    public CORE_GAME_REBET(bet?: number): void {
        this.updateBetBaseData();
        const betAmount = bet ?? commonStore.storeState.bet;
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_REBET - bet_amount: ${betAmount}`);
    }

    /**
     * 發送主要免費遊戲開始的 GTM 事件
     * 當免費遊戲模式開始時調用
     * CORE 開頭表示為遊戲核心相關的 GTM 事件
     */
    public CORE_GAME_FG_START(): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_FREEGAME_START');
    }

    /**
     * 發送主要免費遊戲結束的 GTM 事件
     * 當免費遊戲模式結束時調用
     * @param fgCount 免費遊戲的次數
     * CORE 開頭表示為遊戲核心相關的 GTM 事件
     */
    public CORE_GAME_FG_END(fgCount: number): void {
        this.updateBetBaseData();
        this.isBuyFreeGame = false;
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_FREEGAME_END - fg_count: ${fgCount}`);
    }

    /*  LOADER GTM  */
    /**
     * 發送遊戲開始加載的 GTM 事件
     * 通常在遊戲加載開始時調用
     */
    public LOADER_START(): void {
        // TODO: 實作 LoadingInfo.push 和 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_LOADPAGE_LOADSTART');
    }

    /**
     * 發送加載 Pubversion 完成的 GTM 事件
     * 需要加載時間的參數
     * @param loadingTime 加載所需時間
     */
    public LOADER_PUBVERSION_FINSHED(loadingTime: number): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_LOADPAGE_PUBVERSION-FINSH - loading_time: ${loadingTime}`);
    }

    /**
     * 發送加載場景完成的 GTM 事件
     * 需要加載時間的參數
     * @param loadingTime 加載所需時間
     */
    public LOADER_LOADINGSCENE_FINSHED(loadingTime: number): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_LOADPAGE_LOADINGSCENE-FINISH - loading_time: ${loadingTime}`);
    }

    /**
     * 發送遊戲場景加載完成的 GTM 事件
     * 需要加載時間的參數
     * @param loadingTime 加載所需時間
     */
    public LOADER_GAMESCENE_FINSHED(loadingTime: number): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_LOADPAGE_GAMESCENE-FINISH - loading_time: ${loadingTime}`);
    }

    /**
     * 發送遊戲設置準備好的 GTM 事件
     * 遊戲設置完成並準備啟動時調用
     * @param loadingTime 加載所需時間
     */
    public LOADER_GAME_SETUP_READY(loadingTime: number): void {
        // TODO: 實作 LoadingInfo.push 和 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_ON-GAME-SETUP-READY - loading_time: ${loadingTime}`);
    }

    /**
     * 遊戲所有資源載入完畢，把gameScene加到節點上的時間點
     */
    public LOADER_GAME_ALL_RESOURCE_FINISHED(): void {
        // TODO: 實作 LoadingInfo.push
        Logger.debug('GTM Event: LOADER_GAME_ALL_RESOURCE_FINISHED');
    }

    /**
     * 發送遊戲就緒的 GTM 事件
     * 當遊戲完全準備好可以開始時調用
     */
    public LOADER_GAME_ON_READY(): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_ON-READY');
    }

    /**
     * 發送遊戲開始旋轉事件的 GTM 事件
     * 當遊戲開始旋轉時調用
     */
    public LOADER_GAME_ON_GET_BEGIN_GAME_RESULT(): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_ON-GET-BEGIN-GAME-RESULT');
    }

    /**
     * 收到遊戲觸發急停的 GTM 事件
     * 收到遊戲可以觸發急停時調用
     * @deprecated 預計移除此事件
     */
    public LOADER_GAME_ON_READY_TO_STOP(): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_ON-READY-TO-STOP (deprecated)');
    }

    /**
     * 發送遊戲手動停止自動下注的 GTM 事件
     * 當玩家手動停止自動下注時調用
     */
    public LOADER_GAME_STOP_AUTO_SPIN_CLICK(autoRound: number): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_STOP-AUTO-SPIN-CLICK - auto_round: ${autoRound}`);
    }

    /**
     * 發送遊戲急停的 GTM 事件
     * 當玩家手動觸發急停時調用
     */
    public LOADER_GAME_STOP_SPIN_CLICK(): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_STOP-SPIN-CLICK');
    }

    /**
     * 發送主要下注的 GTM 事件
     * 玩家進行下注操作時調用
     */
    public LOADER_GAME_BET(autoRound: number): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_BET - auto_round: ${autoRound}`);
    }

    /**
     * 發送玩家點擊JP按鈕 GTM 事件
     * 當玩家手動點擊JP按鈕
     */
    public LOADER_GAME_JP_CLICK(): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_JP-CLICK');
    }

    /**
     * 發送玩家點擊JP關閉按鈕 GTM 事件
     */
    public LOADER_GAME_JP_CLOSE_CLICK(): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_JP-CLOSE-CLICK');
    }

    /**
     * 發送玩家派彩JP GTM 事件
     * 當玩家派彩JP金額
     */
    public LOADER_GAME_JP_PAYOFF(payoff: number, jptype: string): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_JP-PAYOFF - payoff: ${payoff}, jptype: ${jptype}`);
    }

    /**
     * 發送購買免費遊戲下注 GTM事件
     * 當玩家嘗試購買免費遊戲下注時調用
     */
    public LOADER_GAME_BUY_FREEGAME_BET(rate: number = 0): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_BUY-FREEGAME-BET - freegame_rate: ${rate}`);
    }

    /**
     * 發送下注金額切換的 GTM 事件
     * 玩家切換下注金額時調用
     * @param from 原始下注金額
     * @param to 新下注金額
     * @param target 目標按鈕
     */
    public LOADER_MAIN_BETAMOUNT_SWITCH(from: number, to: number, target: string = 'none'): void {
        this.updateBetBaseData();
        let amountTarget = target;

        if (this.isBuyFreeGame && to > from) {
            amountTarget = 'buyFreeGameIncreaseBetBtn';
        } else if (this.isBuyFreeGame && to < from) {
            amountTarget = 'buyFreeGameDescreaseBetBtn';
        }

        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_BETAMOUNT-SWITCH - from: ${from}, to: ${to}, target: ${amountTarget}`);
    }

    /**
     * 發送點擊增加下注金額的 GTM 事件
     */
    public LOADER_MAIN_ADDBET_CLICK(): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_ADDBET_CLICK');
    }

    /**
     * 發送點擊減少下注金額的 GTM 事件
     */
    public LOADER_MAIN_MINUSBET_CLICK(): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_MINUSBET_CLICK');
    }

    /**
     * 發送點擊下注金額面板按鈕 GTM 事件
     */
    public LOADER_MAIN_BETSWITCH_CLICK(isOpen: boolean = true): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_BETSWITCH_CLICK - is_open: ${isOpen}`);
    }

    /**
     * 發送點擊自動旋轉切換按鈕的 GTM 事件
     * @param autoRound 自動旋轉次數
     * @param isOpen 是否開啟
     */
    public LOADER_MAIN_AUTO_SWITCH_CLICK(autoRound: number, isOpen: boolean = true): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_AUTOSPIN-SWITCH-CLICK - auto_round: ${autoRound}, is_open: ${isOpen}`);
    }

    /**
     * 發送自動旋轉切換的 GTM 事件
     * 玩家切換自動旋轉狀態時調用
     * @param autoRound 自動旋轉的次數
     */
    public LOADER_MAIN_AUTO_SWITCH(autoRound: number): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_AUTOSPIN-SWITCH - auto_round: ${autoRound}`);
    }

    /**
     * 發送渦輪模式切換的 GTM 事件
     * 玩家切換渦輪模式（快速旋轉）狀態時調用
     */
    public LOADER_MAIN_TURBO_SWITCH(isOpen: boolean = true): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_TURBO-SWITCH - is_open: ${isOpen}`);
    }

    /**
     * 發送離開主界面的 GTM 事件
     * 當玩家離開主遊戲界面時調用
     * @param isLeave 判斷是否為離開狀態
     * @param playtime 遊戲時間
     */
    public LOADER_MAIN_LEAVE(isLeave: boolean, playtime: number): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_SETTING_LEAVE - leave: ${isLeave}, playtime: ${playtime}`);
    }

    /**
     * 發送兌換的 GTM 事件
     * 當玩家進行發送開分時調用
     */
    public LOADER_MAIN_EXCHANGE(success: boolean): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_SETTING_EXCHANGE_SEND-EXCHANGE - success: ${success}`);
    }

    /**
     * 發送點擊主畫面捷徑換分的 GTM 事件
     * 當用戶點擊桌面捷徑換分
     */
    public LOADER_MAIN_SHORTCUT_EXCHANGE_CLICK(): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_SHORTCUT-EXCHANGE-CLICK');
    }

    /**
     * 發送進入設置界面的 GTM 事件
     * 當用戶進入或調整設定時調用
     */
    public LOADER_MAIN_SETTING(): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_SETTING-CLICK');
    }

    /* SETTING PAGE */
    /**
     * 發送查看遊戲規則的 GTM 事件
     * 用戶查看遊戲規則時調用
     */
    public LOADER_SETTING_GAMERULE_CLICK(): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_SETTING_GAMERULE-CLICK');
    }

    /**
     * 發送查看下注歷史的 GTM 事件
     * 用戶查看下注歷史記錄時調用
     */
    public LOADER_SETTING_BETHISTORY_CLICK(): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_SETTING_BETHISTORY-CLICK');
    }

    /**
     * 發送點擊設定頁面換分的 GTM 事件
     */
    public LOADER_SETTING_EXCHANGE_CLICK(): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_SETTING_EXCHANGE-CLICK');
    }

    /**
     * 發送聲音設置的 GTM 事件
     * 當玩家調整音效設置時調用
     */
    public LOADER_SETTING_SOUNDSET_CLICK(): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_SETTING_SOUNDSET-CLICK');
    }

    /**
     * 發送點擊離開按鈕的 GTM 事件
     * 當玩家玩家點擊離開按鈕
     */
    public LOADER_SETTING_EXIT_CLICK(): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_SETTING_EXIT-CLICK');
    }

    /**
     * 發送點擊關閉設定頁面按鈕
     */
    public LOADER_SETTING_EXITSETTING_CLICK(): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_SETTING_EXITSETTING-CLICK');
    }

    /**
     * 發送查看幫助信息的 GTM 事件
     * 當用戶進入幫助功能時調用
     */
    public LOADER_SETTING_HELP_CLICK(): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_SETTING_HELP-CLICK');
    }

    /**
     * 發送點擊自動兌換的GTM事件
     */
    public LOADER_SETTING_EXCHANGE_AUTOEXCHANGE_CLICK(isOpen: boolean): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_SETTING_EXCHANGE_AUTOEXCHANGE-CLICK - is_open: ${isOpen}`);
    }

    /**
     * 發送點擊快速換分數字事件
     * @param fastBtnNumber 快速按鈕數字
     */
    public LOADER_SETTING_EXCHANGE_FASTEXCHGANGE_CLICK(fastBtnNumber: number): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_SETTING_EXCHANGE_FASTEXCHGANGE-CLICK - fast_bet: ${fastBtnNumber}`);
    }

    /* ALERT */
    /**
     * 發送點擊設定加速旋轉Alert GTM 事件
     * @deprecated 預計移除此事件
     */
    public LOADER_MAIN_TURBO_SWITCH_ALERT(isOpen: boolean = true): void {
        this.updateBetBaseData();
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_MAIN_TURBO-SWITCH-ALERT (deprecated) - is_open: ${isOpen}`);
    }

    /**
     * 發送顯示警告框的 GTM 事件
     * @param message 警告訊息
     */
    public LOADER_MAIN_ALERT_SHOW(message: string): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_ALERT-SHOW - message: ${message}`);
    }

    /**
     * 發送點擊重新連接按鈕Alert的 GTM 事件
     */
    public LOADER_MAIN_RECONNECT_ALERT(): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug('GTM Event: GT_CASINO_MAIN_RECONNECT-ALERT');
    }

    /**
     * 發送用戶點擊確認按鈕的 GTM 事件
     * 用於確認用戶操作的警告框
     * @param message 確認訊息
     */
    public LOADER_MAIN_ALERT_CONFIRM_CLICK(message: string): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_ALERT-CONFIRM-CLICK - message: ${message}`);
    }

    /**
     * 發送用戶點擊取消按鈕的 GTM 事件
     * 用於取消用戶操作的警告框
     * @param message 取消訊息
     */
    public LOADER_MAIN_ALERT_CANCEL_CLICK(message: string): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_ALERT-CANCEL-CLICK - message: ${message}`);
    }

    /**
     * 發送用戶點擊關閉按鈕的 GTM 事件
     * 用於關閉用戶操作的警告框
     * @param message 關閉訊息
     */
    public LOADER_MAIN_ALERT_CLOSE_CLICK(message: string): void {
        // TODO: 實作 UserBehavior.sendGTMEvent
        Logger.debug(`GTM Event: GT_CASINO_ALERT-CLOSE-CLICK - message: ${message}`);
    }
}

// 匯出單例實例
export const gtmEvent = GTMEvent.getInstance();


