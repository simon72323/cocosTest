/**
 * GTCommEvents 命名空間
 *
 * 包含三個枚舉類型定義遊戲通訊事件：
 * - `Game`: 遊戲狀態相關事件。
 * - `Comm`: 通用遊戲設置和命令相關事件。
 *
 */
/**
 * Game 事件枚舉
 *
 * 定義與遊戲操作直接相關的事件。
 */
export enum Game {
    /**
     * 交換餘額
     * - 遊戲監聽：用於監聽系統交換餘額的通知
     */
    EXCHANGE_CREDIT = 'exchange_credit',
    /**
     * 預先下注
     * - 遊戲呼叫：檢查餘額狀態，判斷是否需自動換分或可直接SPIN
     */
    PRE_SPIN = 'pre_spin',
    /**
     * 預先購買免費遊戲
     * - 遊戲呼叫：發起購買免費遊戲的下注操作
     */
    PRE_BUY_FREEGAME_SPIN = 'pre_buy_freegame_spin',
    /**
     * 觸發遊戲下注事件
     * - 遊戲監聽：監控下注操作的觸發
     */
    SPIN = 'game_spin_event',
    /**
     * 停止旋轉
     * - 遊戲監聽：監聽停止SPIN動作
     */
    STOP_SPIN = 'stop_spin',
    /**
     * 購買免費遊戲的下注事件
     * - 遊戲監聽：監聽免費遊戲購買行為
     */
    BUY_FREEGAME_SPIN = 'buy_freegame_spin_event',
    /**
     * 退出遊戲
     * - 遊戲呼叫：執行退出遊戲的操作
     */
    EXIT_GAME = 'exit_game',
    /**
     * 重整遊戲
     * - 遊戲呼叫：重置遊戲至初始狀態
     */
    RESTART_GAME = 'restart_game'
}

/**
 * Comm 事件枚舉
 *
 * 定義通用的遊戲設置和命令事件。
 */
export enum Comm {
    /**
     * 設置 SPIN 事件的按鈕鎖定狀態
     * - 遊戲呼叫：在SPIN期間鎖定按鈕
     */
    SET_ONREADY_SPIN_BTN_INTERACTABLE = 'set_onready_spin_btn_interactable',
    /**
     * 設置 LOADER 所有按鈕的鎖定狀態
     * - 遊戲呼叫：會立刻鎖定所有按鈕
     */
    SET_LOADER_ALL_BUTTON_INTERACTABLE = 'set_loader_all_button_interactable',
    /**
     * 設定節點重新定位
     * - 遊戲呼叫：用於調整節點位置
     */
    SET_GAMECORENODE_REPOSITION = 'set_gamecorenode_reposition',
    /**
     * 設定跑馬燈信息
     * - 遊戲呼叫：更新顯示跑馬燈內容
     */
    SET_MARQUEE = 'set_maquee',
    /**
     * 顯示彈窗
     * - 遊戲呼叫：觸發顯示提示性彈窗
     */
    SHOW_ALERT = 'show_alert',
    /**
     * 設定公版界面開關
     * - 遊戲呼叫：控制公版界面的顯示狀態
     */
    SET_PUBLIC_GAME_PANEL_SWITCH = 'set_public_gamepanel_switch',
    /**
     * 設置按鈕點擊事件
     * - 遊戲呼叫：監控所有按鈕的點擊事件
     */
    LOADER_BUTTON_CLICK = 'loader_button_click',
    /**
     * 準備換分
     * - 遊戲監聽：監聽準備換分的提示
     */
    PREPARE_EXCHANGE = 'prepare_exchange',
    /**
     * 顯示換分頁面
     * - 遊戲呼叫：打開換分介面
     */
    SHOW_EXCHANGE_PAGE = 'show_exchange_page',
    /**
     * 儲存換分狀態
     * - 遊戲監聽：保存換分的數據狀態
     */
    CALL_STORE_EXRECORD = 'call_Store_ExRECord',
    /**
     * 取得公版場景ControlToSettingNode
     */
    GET_CONTROLTOSETTINGNODE = 'get_control_to_settingNode',
    /**
     * 取得公版場景UnderSettingPanelNode
     */
    GET_UNDERSETTINGPANELNODE = 'get_under_setting_panel_Node',
    /**
      * 取得公版場景SettingToBottomNode
      */
    GET_SETTINGTOBOTTOMNODE = 'get_setting_to_bottomNode',
    /**
      * 取得公版場景TopGameNode
      */
    GET_TOPGAMENODE = 'get_top_gameNode',
    /**
     * 拉中Jackpot
     */
    HIT_JACKPOT = 'hit_jackpot',
    /**
     * loader的settingPanel切換時觸發
     */
    LOADER_TOGGLE_SETTING_PANEL = 'loader_toggle_setting_panel',
    /** */
    /**
     * 設置下注選項的節點參數
     */
    SET_BET_OPTION_NODE_PARAM = 'set_bet_option_node_param',
    /**
     * 顯示下注選項
     */
    SHOW_BET_OPTION = 'show_bet_option'
}

export type EventType = Game | Comm;

/**
 * GTLoaderButtonType 枚舉
 *
 * 定義按鈕的類型。
 */
export enum GTLoaderButtonType {
    none = 'none',
    betBtn = 'betBtn',
    betSetBtn = 'betSetBtn',
    decreaseBetBtn = 'decreaseBtn',
    increaseBetBtn = 'increaseBtn',
    spinBtn = 'spinBtn',
    autoSetBtn = 'autoSetBtn',
    autoBtn = 'autoBtn',
    turboOnBtn = 'turboOnBtn',
    turboOffBtn = 'turboOffBtn',
    settingPanelBtn = 'settingPanelBtn',
    exchangeBtn = 'exchangeBtn',
    settingPanelCloseBtn = 'settingPanelCloseBtn',
    buyFreeGameIncreaseBetBtn = 'buyFreeGameIncreaseBetBtn',
    buyFreeGameDescreaseBetBtn = 'buyFreeGameDecreaseBetBtn'
}

/**
 * GTCommPanelParm 類別
 *
 * 定義與控制面板、跑馬燈面板等開關狀態相關的類別。
 */
export interface GTCommPanelParm {
    /** 控制面板是否開啟 */
    controlPanelIsOpen?: boolean;
    /** 用戶設定面板是否開啟 */
    userSettingPanelIsOpen?: boolean;
    /** 底部按鈕面板是否開啟 */
    bottomButtonPanelIsOpen?: boolean;
}
/**
 * GTAlertType 枚舉
 *
 * 定義不同類型的警告框。
 */
export enum GTAlertType {
    /** 沒有按鈕的警告框，僅右上角有 X（取消） 按鈕*/
    BASIC_NONE = 'alert_basic_none',
    /** 有一個確定按鈕的警告框 */
    BASIC = 'alert_basic',
    /** 有兩個按鈕的警告框，左邊是取消右邊是確定 */
    DIALOG = 'alert_dialog',
    /** 有兩個圖示的警告框，左邊是取消右邊是確定 */
    ICON_ALERT_DIALOG = 'alert_icon_dialog',
    /** 斷線重連警告框 */
    RECONNECT = 'alert_reconnect',
    /** 錯誤警告框 */
    ERROR = 'alert_error'
}
/**
 * GTAlertPram 類別
 *
 * 定義警告框的模型，包含標題、內容、類型、取消按鈕文本、確認按鈕文本、取消回調和確認回調。
 */
export interface GTAlertPram {
    type: GTAlertType;
    title: string;
    content: string;
    errorCode?: string;
    cancelBtnText: string;
    confirmBtnText: string;
    cancelCallback?: () => void;
    confirmCallback?: () => void;
    autoCancel?: number;
}
/**
 * GTCommEventMap 接口
 *
 * 定義與遊戲相關的事件類型。
 */
export type GTCommEventMap = {
    /**
     * 顯示警告框
     * @param {GTAlertPram}
     */
    [Comm.SHOW_ALERT]: GTAlertPram;
    /**
     * 交換餘額
     * @param exchangeCredit 換分金額
     * @param isManual 是否為手動換分
     */
    [Game.EXCHANGE_CREDIT]: {
        exchangeCredit: number;
        isManual?: boolean;
        callback: (success: boolean) => void;
    };
    /**
     * 準備下注
     * @param preBet 準備下注的金額（可選），沒帶的話用當前籌碼
     * @param callback 回傳preSpin有沒有成功
     */
    [Game.PRE_SPIN]: {
        preBet?: number;
        callback: (success: boolean) => void;
    };
    /**
     * 準備購買FreeGame
     * @param gameRate 遊戲倍率，用來加成Bet的數字，可以用來做額度判斷
     * @param callback 方法CallBack 用來返回額度判斷狀態
     */
    [Game.PRE_BUY_FREEGAME_SPIN]: {
        gameRate: number;
        callback: (success: boolean) => void;
    };
    /** 下注事件  */
    [Game.SPIN]: null;
    /** 購買FreeGame事件 */
    [Game.BUY_FREEGAME_SPIN]: null;
    /** 設置跑馬燈 */
    [Comm.SET_MARQUEE]: {
        marquee: string;
    };
    /**
     * 設置公版界面開關
     * @param controlPanelIsOpen 控制面板是否開啟
     * @param userSettingPanelIsOpen 用戶設定面板是否開啟
     * @param bottomButtonPanelIsOpen 底部按鈕面板是否開啟
     */
    [Comm.SET_PUBLIC_GAME_PANEL_SWITCH]: GTCommPanelParm;
    /**
      * 按鈕點擊事件
      * @param type 按鈕類型
      */
    [Comm.LOADER_BUTTON_CLICK]: {
        type: GTLoaderButtonType;
    };
    /**
     * 儲存玩家資訊
     * @param exchangeCredit 換分紀錄
     * @param autoExchange 自動換分開關
     */
    [Comm.CALL_STORE_EXRECORD]: {
        exchangeCredit: number;
        autoExchange: boolean;
    };
    /**
     * Loader 遊戲在SPIN在OnReady時按鈕禁用狀態
     */
    [Comm.SET_ONREADY_SPIN_BTN_INTERACTABLE]: {
        settingPanelBtn: boolean;
        exchangeBtn: boolean;
    };
    /**
     * 設置遊戲節點重置位置，僅能塞入cocos Node節點型別
     */
    [Comm.SET_GAMECORENODE_REPOSITION]: {
        upperNode: any[];
        downNode: any[];
        callback: (success: boolean, err: Error) => void;
    };
    [Comm.GET_CONTROLTOSETTINGNODE]: {
        callback: (tempNode: any) => void;
    };
    [Comm.GET_UNDERSETTINGPANELNODE]: {
        callback: (tempNode: any) => void;
    };
    [Comm.GET_SETTINGTOBOTTOMNODE]: {
        callback: (tempNode: any) => void;
    };
    [Comm.GET_TOPGAMENODE]: {
        callback: (tempNode: any) => void;
    };
    [Comm.HIT_JACKPOT]: {
        jpAmount: number;
        jpType: number;
        callback: () => void;
    };
    [Comm.SET_LOADER_ALL_BUTTON_INTERACTABLE]: {
        interactable: boolean;
    };
    [Comm.LOADER_TOGGLE_SETTING_PANEL]: {
        status: boolean;
    };
};