
import { commonStore } from '@common/h5GameTools/CommonStore';
import { Comm, GTCommPanelParm, GTLoaderButtonType, GTCommEventMap, GTAlertPram, Game, GTAlertType } from '@common/h5GameTools/GTCommEvents';
import { GameStatus } from '@common/h5GameTools/State';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { getEventManager } from '@common/manager/EventManager';
import { Logger } from '@common/utils/Logger';
import { NumberUtils } from '@common/utils/NumberUtils';
import { watch } from '@common/utils/Reactivity';
import { _decorator, Component, Node, Button, Toggle, input, Input, EventKeyboard, KeyCode, UIOpacity, tween } from 'cc';

import { canAutoExchangeCredit, getAutoExchangeCredit, isCreditEnough } from '@/comm/scripts/comm/GTCommTools';
import { GTLoaderEventType } from '@/comm/scripts/comm/GTLoaderEventType';
import { GTLoaderCommStore } from '@/comm/scripts/comm/GTLoderCommStore';
import { GTCommonBetScrollView } from '@/comm/scripts/uicomponents/GTCommonBetScrollView';
import { GTSpintBtn } from '@/comm/scripts/uicomponents/GTSpintBtn';

const { ccclass, property } = _decorator;

@ccclass('GTControlPanelManager')
export class GTControlPanelManager extends Component {
    // UI 元件屬性
    @property(Node) public fastOffBtn: Node = null!;
    @property(Node) public fastOnBtn: Node = null!;
    @property(Button) public autoSetBtn: Button = null!;
    @property(Node) public commAutoSetNode: Node = null!;
    @property(Button) public betSetBtn: Button = null!;
    @property(Node) public commBetSetNode: Node = null!;
    @property(Button) public addBetBtn: Button = null!;
    @property(Button) public lessBetBtn: Button = null!;
    @property(GTSpintBtn) public spinBtn: GTSpintBtn = null!;
    @property(Node) public controlNode: Node = null!;
    @property(Node) public settingNode: Node = null!;
    @property(Node) public bottomNode: Node = null!;
    @property(Button) public settingBtn: Button = null!;
    @property(Button) public exchangeBtn: Button = null!;
    @property(Node) public settingPanel: Node = null!;

    // Internal State
    private _isAutoSetOn: boolean = false;
    private _isBetSetOn: boolean = false;
    private _commBetSetScript: GTCommonBetScrollView = null!;
    private _tempMaxAutoSpinCount: number = -1;
    private _betCountForFastSpinAlert: number = 0;
    private _fastAlertIsShow: boolean = false;
    private isKeepSpace: boolean = false;
    spaceDown!: (data: any) => void;
    spaceUp!: (data: any) => void;
    private _onReadySpinBtnInteractable: GTCommEventMap[Comm.SET_ONREADY_SPIN_BTN_INTERACTABLE] = {
        settingPanelBtn: false,
        exchangeBtn: false
    };

    private _fasterAlert: GTAlertPram = null!;
    // --- 通用防止連點機制 ---
    private _debounceTimers: { [key: string]: number } = {};
    // --- 非同步流程狀態鎖 ---
    private _preSpinPromise: Promise<void> | null = null;
    // Event Bindings
    private eventBindings: { [key: string]: (data: any) => void } = {};

    protected onLoad(): void {
        this.spaceDown = this._spaceClick.bind(this);
        // this.spaceUp = this._spaceBtnUp.bind(this);

        this._initializeState();
        this._setupEventListeners();
        this._setupReactivityWatcher();
        this._setupCommBetSetScript();
    }

    public onDestroy(): void {
        this._removeEventListeners();
        input.off(Input.EventType.KEY_DOWN, this.spaceDown);
        input.off(Input.EventType.KEY_UP, this.spaceUp);
    }

    private _initializeState(): void {
        this._isBetSetOn = false;
        this._isAutoSetOn = false;
        //讓commBetSetNode節點提早觸發監聽
        this.commBetSetNode.active = true;
        this.commBetSetNode.active = false;
        this.fastOnBtn.active = commonStore.storeState.isTurbo;
        this.fastOffBtn.active = !commonStore.storeState.isTurbo;
    }

    private _setupEventListeners(): void {
        this.eventBindings = {
            [GTLoaderEventType.SPIN_BTN_CLICK]: this.onSpinButtonPressed.bind(this),
            [Game.PRE_SPIN]: this._preSpinEvent.bind(this),
            [Game.PRE_BUY_FREEGAME_SPIN]: this._preBuyFreeGameEvent.bind(this),
            [Comm.SET_ONREADY_SPIN_BTN_INTERACTABLE]: this._OnOnReadySpinBtnInteractble.bind(this),
            [Comm.SET_PUBLIC_GAME_PANEL_SWITCH]: this._setPublicGamePanelSwitch.bind(this),
            [Comm.SET_LOADER_ALL_BUTTON_INTERACTABLE]: this._setAllBtnControl.bind(this)
        };

        Object.keys(this.eventBindings).forEach(event => {
            if (event === GTLoaderEventType.SPIN_BTN_CLICK) {
                getEventManager().on(event, this.eventBindings[event]);
            } else {
                getEventManager().on(event, this.eventBindings[event]);
            }
        });
    }

    private _removeEventListeners(): void {
        Object.keys(this.eventBindings).forEach(event => {
            if (event === GTLoaderEventType.SPIN_BTN_CLICK) {
                getEventManager().off(event, this.eventBindings[event]);
            } else {
                getEventManager().off(event, this.eventBindings[event]);
            }
        });
    }

    private _setupReactivityWatcher(): void {
        watch(() => commonStore.storeState.gameStatus, (newStatus, oldStatus) => {
            Logger.debug('GameStatus 變化了:', newStatus, oldStatus);
            this._reloadBtnStateByGameStatus(newStatus);
        });

        watch(() => commonStore.storeState.betCreditList, (newList, oldList) => {
            Logger.debug('betCreditList 變化了:', newList, oldList);
            this._commBetSetScript.initData();
        });

        watch(() => commonStore.storeState.totalBet, (_newBet, _oldBet) => {
            this._setDecreaseBetBtnActive();
            this._setIncreaseBetBtnActive();
        });

        const disWatch = watch(() => commonStore.storeState.gameStatus, newStatus => {
            if (newStatus === GameStatus.OnReady) {
                input.on(Input.EventType.KEY_DOWN, this.spaceDown);
                input.on(Input.EventType.KEY_UP, this.spaceUp);
                if (!commonStore.storeState.customConfig.canExchange) {
                    GTLoaderCommStore.getInstance().setData('isGameReady', true);
                }
                disWatch();
            }
        });
    }

    private _setAllBtnControl(obj: GTCommEventMap[Comm.SET_LOADER_ALL_BUTTON_INTERACTABLE]): void {
        this._setButtonsInteractable(obj.interactable);
        this._setSpinInteractable(obj.interactable);
    }

    private _spaceClick(event: EventKeyboard): void {
        // 防連點衛兵
        if (this._isActionDebounced('spaceClick', 400)) return;

        // 如果彈窗正在顯示，則執行彈窗的回呼
        if (this._fastAlertIsShow) {
            this._fasterAlert.confirmCallback?.();
            return;
        }

        // --- 核心邏輯的防衛性判斷 ---
        const isGameReady = GTLoaderCommStore.getInstance().getData('isGameReady');
        if (!isGameReady) return;
        if (event.keyCode !== KeyCode.SPACE) return;
        if (!this.spinBtn.interactable) return;
        if (!this.controlNode.active) return;
        if (this.settingPanel.active) return;

        this.onSpinButtonPressed(this.spinBtn);
    }

    private _OnOnReadySpinBtnInteractble(obj: GTCommEventMap[Comm.SET_ONREADY_SPIN_BTN_INTERACTABLE]) {
        this._onReadySpinBtnInteractable = obj;
    }

    // 設置下注設定腳本
    private _setupCommBetSetScript(): void {
        this._commBetSetScript = this.commBetSetNode.getComponent(GTCommonBetScrollView)!;
    }

    // 控制面板顯示切換
    private _setPublicGamePanelSwitch(commPanel: GTCommPanelParm): void {
        Logger.debug(commPanel);
        this.controlNode.active = typeof commPanel.controlPanelIsOpen !== 'boolean' ? true : commPanel.controlPanelIsOpen;
        this.settingNode.active = typeof commPanel.userSettingPanelIsOpen !== 'boolean' ? true : commPanel.userSettingPanelIsOpen;
        this.bottomNode.active = typeof commPanel.bottomButtonPanelIsOpen !== 'boolean' ? true : commPanel.bottomButtonPanelIsOpen;
    }

    // 依照遊戲狀態重新設定按鈕狀態
    private _reloadBtnStateByGameStatus(gameStatus: GameStatus): void {
        switch (gameStatus) {
            case GameStatus.OnReady:
                gtmEvent.LOADER_GAME_ON_READY();
                this._handleGameReadyState();
                break;
            case GameStatus.OnReadyToStop:
                // gtmEvent.LOADER_GAME_ON_READY_TO_STOP();
                this._handleGameReadyToStopState();
                break;
            case GameStatus.OnGetBeginGameResult:
                gtmEvent.LOADER_GAME_ON_GET_BEGIN_GAME_RESULT();
                break;
            case GameStatus.OnReelAllStop:
                if (!this.spinBtn.isAutoSpin) {
                    this._disableAllControlButtons(false);
                }
                break;
        }
    }

    // 處理遊戲準備開始狀態
    private _handleGameReadyState(): void {
        if (this.spinBtn.isAutoSpin) {
            this._sendNormalSpinEvent();
        } else {
            this._stopAutoSpinMode();
        }
    }

    // 處理遊戲允許隨時停止狀態
    private _handleGameReadyToStopState(): void {
        if (!this.spinBtn.isAutoSpin) {
            this._disableAllControlButtons(true);
            this.spinBtn.canStopImmediately();
        }
    }

    // 處理轉輪按鈕點擊事件
    public onSpinButtonPressed(btn: GTSpintBtn): void {
        if (this._isActionDebounced('spinClick', 500)) return;

        // 關閉設定相關面板
        this.commAutoSetNode.active = false;
        this.commBetSetNode.active = false;

        // 自動投注狀態並且滾動中的話的話，第一階段動作，要先把按動投注狀態取消
        if (btn.isAutoSpin && btn.isSpinning) {
            gtmEvent.LOADER_GAME_STOP_AUTO_SPIN_CLICK(this.spinBtn.getMaxAutoSpinCount());
            btn.stopAutoSpin();
            this._disableAllControlButtons(false);
            return;
        }

        //New Spin Flow
        switch (commonStore.storeState.gameStatus) {
            case GameStatus.OnReady:
                // this._newCheckBetForFastSpinAlert() ? this._newShowTurnOnFastAlert(() => this._sendNormalSpinEvent()): this._sendNormalSpinEvent();
                this._sendNormalSpinEvent();
                break;
            case GameStatus.OnReadyToStop:
                gtmEvent.LOADER_GAME_STOP_SPIN_CLICK();
                this.spinBtn.stopSpin();
                this._disableAllControlButtons(false);
                break;
        }

        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.spinBtn });
    }

    // 用來轉換preSpin Event資料的地方
    private _preSpinEvent(obj: GTCommEventMap[Game.PRE_SPIN]) {
        if (this._isActionDebounced('preSpin', 500)) {
            obj.callback(false);
            return;
        }

        //New Spin Flow
        this._newPreSpin(obj.preBet, (success: boolean) => {
            if (success) {
                this._playSpinAnimate();
            } else {
                this._stopSpinAnimate();
            }
            obj.callback(success);
        });
    }

    // 用來轉換preBuyFreeGame Event資料的地方
    private _preBuyFreeGameEvent(obj: GTCommEventMap[Game.PRE_BUY_FREEGAME_SPIN]) {
        if (this._isActionDebounced('buyFreeGame', 500)) return;

        commonStore.storeMutation.setData(
            'exchangeCredit',
            NumberUtils.accMul(obj.gameRate, commonStore.storeState.bet)
        );

        //New Spin Flow
        this._newPreSpin(commonStore.storeState.exchangeCredit, (success: boolean) => {
            if (success) {
                this._playSpinAnimate();
                gtmEvent.LOADER_GAME_BUY_FREEGAME_BET();
                getEventManager().emit(Game.BUY_FREEGAME_SPIN, null);
            } else {
                this._stopSpinAnimate();
            }
        });
    }

    // 切換快速模式
    public onFastBtnPressed(): void {
        this.switchTurboMode();
        gtmEvent.LOADER_MAIN_TURBO_SWITCH(commonStore.storeState.isTurbo);
    }

    public switchTurboMode(): void {
        const isOn = !commonStore.storeState.isTurbo;
        this._betCountForFastSpinAlert = 5;
        this.fastOnBtn.active = isOn;
        this.fastOffBtn.active = !isOn;
        commonStore.storeMutation.setData('isTurbo', isOn);
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.turboOnBtn });
    }

    // 打開/關閉自動遊玩頁面
    public onBetAutoBtnPressed(): void {
        Logger.debug('onBetAutoBtnPressed');
        this._toggleAutoSet();
        this._toggleBetSet(false);
        this.spinBtn.setMaxAutoSpinCount(this._isAutoSetOn ? this._tempMaxAutoSpinCount : 0);
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.autoSetBtn });
        gtmEvent.LOADER_MAIN_AUTO_SWITCH_CLICK(this.spinBtn.getMaxAutoSpinCount(), this.commAutoSetNode.active);
    }

    // 切換自動遊玩局數
    public onAutoPlayRoundToggle(toggle: Toggle, data: number): void {
        this._tempMaxAutoSpinCount = data;
        if (toggle.isChecked && this.spinBtn.getMaxAutoSpinCount() != this._tempMaxAutoSpinCount) {
            this.spinBtn.setMaxAutoSpinCount(this._tempMaxAutoSpinCount);
            getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.autoBtn });
            // 要先等資料更新完才送GTM以免送錯
            gtmEvent.LOADER_MAIN_AUTO_SWITCH(this.spinBtn.getMaxAutoSpinCount());
        }

    }

    // 調整注額，增加
    public addBet(): void {
        GTLoaderCommStore.getInstance().setData('amountTarget', GTLoaderButtonType.increaseBetBtn);
        gtmEvent.LOADER_MAIN_ADDBET_CLICK();
        this._commBetSetScript.addIndex();
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.increaseBetBtn });
    }

    // 調整注額，減少
    public minusBet(): void {
        GTLoaderCommStore.getInstance().setData('amountTarget', GTLoaderButtonType.decreaseBetBtn);
        gtmEvent.LOADER_MAIN_MINUSBET_CLICK();
        this._commBetSetScript.minusIndex();
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.decreaseBetBtn });
    }

    // 切換賭注列表
    public onBetScoreBtnPressed(): void {
        GTLoaderCommStore.getInstance().setData('amountTarget', GTLoaderButtonType.betSetBtn);
        gtmEvent.LOADER_MAIN_BETSWITCH_CLICK(this.commBetSetNode.active);

        if (this._isAutoSetOn) {
            this._toggleAutoSet(false);
            this.spinBtn.setMaxAutoSpinCount(this._isAutoSetOn ? this._tempMaxAutoSpinCount : 0);
        }
        this._toggleBetSet(!this._isBetSetOn);
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.betSetBtn });
    }

    // 設置下注 '-' 按鈕狀態
    private _setDecreaseBetBtnActive(flag: boolean = true): void {
        this.lessBetBtn.interactable = flag && this._canDecreaseBet();
    }

    // 設置下注 '+' 按鈕狀態
    private _setIncreaseBetBtnActive(flag: boolean = true): void {
        this.addBetBtn.interactable = flag && this._canIncreaseBet();
    }

    // 檢查是否可以減少注額
    private _canDecreaseBet(): boolean {
        return this._getBetIndex() > 0;
    }

    // 檢查是否可以增加注額
    private _canIncreaseBet(): boolean {
        return this._getBetIndex() < commonStore.storeState.betCreditList.length - 1;
    }

    // 取得目前注額在注額列表內的index值
    private _getBetIndex(): number {
        return commonStore.storeState.betCreditList.indexOf(commonStore.storeState.totalBet);
    }

    // 啟用所有控制按鈕
    private _enableAllControlButtons(): void {
        this._setButtonsInteractable(true);
        this._setDecreaseBetBtnActive();
        this._setIncreaseBetBtnActive();
    }

    // 禁用所有控制按鈕
    private _disableAllControlButtons(keepSpinInteractable: boolean = false): void {
        this._setButtonsInteractable(false);
        this._setSpinInteractable(keepSpinInteractable);
    }

    private _setSpinInteractable(interactable: boolean): void {
        let tempFlag = commonStore.storeState.isReSpin ? false : interactable;
        tempFlag ? this.spinBtn.setInteractableTrue() : this.spinBtn.setInteractableFalse();
    }

    // 設定按鈕可交互狀態
    private _setButtonsInteractable(interactable: boolean): void {
        const buttons = [this.autoSetBtn, this.betSetBtn, this.addBetBtn, this.lessBetBtn, this.settingBtn, this.exchangeBtn];
        buttons.forEach(btn => {
            btn.interactable = interactable;
            const opacity = btn.getComponent(UIOpacity);
            if (opacity) {
                tween(opacity)
                    .to(0.2, { opacity: interactable ? 255 : 80 })
                    .start();
            }
        });
        this._setDecreaseBetBtnActive(interactable);
        this._setIncreaseBetBtnActive(interactable);
        this._disableAllToggle();

        if (this._onReadySpinBtnInteractable.settingPanelBtn) this.settingBtn.interactable = true;
        if (this._onReadySpinBtnInteractable.exchangeBtn) this.exchangeBtn.interactable = true;
        if (!commonStore.storeState.customConfig.canExchange) this.exchangeBtn.interactable = false;
    }

    private _showCreditNotEnoughAlert(): void {
        const canExchange = commonStore.storeState.customConfig.canExchange;
        const alert: GTAlertPram = {
            type: canExchange ? GTAlertType.BASIC : GTAlertType.BASIC_NONE,
            title: 'SYSTEM_MESSAGE',
            content: 'NOT_ENOUGH_CREDIT_2023',
            cancelBtnText: '',
            confirmBtnText: 'GAME_EXCHANGE',
            confirmCallback: canExchange ? () => {
                // 為彈窗的確認按鈕加上獨立的防連點
                if (this._isActionDebounced('exchangeFromAlert', 1000)) {
                    return;
                }
                getEventManager().emit(Comm.PREPARE_EXCHANGE);
            } : undefined
        };
        getEventManager().emit(Comm.SHOW_ALERT, alert);
    }

    private _disableAllToggle() {
        this._toggleAutoSet(false);
        this._toggleBetSet(false);
    }

    // 切換自動設置狀態
    private _toggleAutoSet(state?: boolean): void {
        this._isAutoSetOn = state ?? !this._isAutoSetOn;
        if (!this.spinBtn.isAutoSpin) {
            this.spinBtn.setMaxAutoSpinCount(this._isAutoSetOn ? this._tempMaxAutoSpinCount : 0);
        }
        this.commAutoSetNode.active = this._isAutoSetOn;
    }

    private _toggleBetSet(state?: boolean): void {
        this._isBetSetOn = state ?? !this._isBetSetOn;
        this.commBetSetNode.active = this._isBetSetOn;
    }

    //NEW SPIN FLOW---------------------------------------------\
    private _newShowTurnOnFastAlert(callback: () => void): void {
        this._fastAlertIsShow = true;

        const alert: GTAlertPram = {
            type: GTAlertType.DIALOG,
            title: 'FAST_TURBO',
            content: 'OPEN_FASTWHEEL_ALERT',
            cancelBtnText: 'CONTINUE',
            confirmBtnText: 'GOG_CONFIRM',
            cancelCallback: () => { this._fastAlertIsShow = false; this._fasterAlert = null!; callback(); },
            confirmCallback: () => { this.switchTurboMode(); this._fastAlertIsShow = false; this._fasterAlert = null!; callback(); },
            autoCancel: 8
        };
        this._fasterAlert = alert;
        getEventManager().emit(Comm.SHOW_ALERT, alert);
    }

    private _newCheckBetForFastSpinAlert(): boolean {
        if (!this.controlNode.active || this.spinBtn.isAutoSpin) return false;
        if (this._betCountForFastSpinAlert < 3 && !commonStore.storeState.isTurbo) this._betCountForFastSpinAlert++;
        if (this._betCountForFastSpinAlert === 3) {
            this._betCountForFastSpinAlert++;
            return true;
        }
        return false;
    }

    // 送出下注事件
    private async _sendNormalSpinEvent(): Promise<void> {
        if (this.spinBtn.isSpinning && !this.spinBtn.isAutoSpin) return;

        await this._newPreSpin(commonStore.storeState.bet, (success: boolean) => {
            if (success) {
                this._playSpinAnimate();
                const sendSpinEvent = (): void => {
                    getEventManager().emit(Game.SPIN, null);
                };
                this._newCheckBetForFastSpinAlert() ? this._newShowTurnOnFastAlert(() => sendSpinEvent()) : sendSpinEvent();
                gtmEvent.LOADER_GAME_BET(this.spinBtn.getMaxAutoSpinCount());
            } else {
                if (this.spinBtn.isAutoSpin) {
                    this._stopAutoSpinMode();
                } else {
                    this._stopSpinAnimate();
                }
            }
        });
    }



    private _newPreSpin(specBet: number = commonStore.storeState.bet, callback: (success: boolean) => void): Promise<void> {
        // 如果一個 pre-spin 流程已經在執行中，則直接返回現有的 Promise，讓呼叫者等待它完成
        if (this._preSpinPromise) {
            Logger.warn('_newPreSpin is already in progress, returning existing promise.');
            return this._preSpinPromise;
        }

        // 建立一個新的 Promise 並將其儲存起來，作為「狀態鎖」
        this._preSpinPromise = new Promise(async resolve => {
            try {
                const { gameStatus } = commonStore.storeState;

                if (gameStatus !== GameStatus.OnReady) {
                    callback(false);
                    return; // finally 會被執行
                }

                interface CheckContext {
                    specBet?: number;
                    success: boolean;
                    continue: boolean;
                }

                const context: CheckContext = {
                    specBet,
                    success: false,
                    continue: true
                };

                const steps: Array<(ctx: CheckContext) => Promise<void> | void> = [
                    // STEP 1: Check game status and credit
                    (ctx: CheckContext) => {
                        Logger.debug('STEP 1: Checking game status and credit');
                        if (isCreditEnough(1, ctx.specBet)) {
                            Logger.debug('STEP 1: Success');
                            ctx.success = true;
                            ctx.continue = false;
                        }
                    },

                    // STEP 2: Check auto exchange is possible
                    (ctx: CheckContext) => {
                        if (!ctx.continue) return;
                        Logger.debug('STEP 2: Checking if auto exchange is possible');
                        if (canAutoExchangeCredit()) {
                            Logger.debug('STEP 2: Success');
                            ctx.success = true;
                        } else {
                            Logger.debug('STEP 2: Fail');
                            ctx.success = false;
                            ctx.continue = false;
                        }
                    },

                    // STEP 3: Perform auto exchange (async)
                    async (ctx: CheckContext) => {
                        if (!ctx.continue) return;
                        Logger.debug('STEP 3: Performing auto exchange');
                        const exchangeSuccess = await this._callAutoExchangeCredit();
                        if (exchangeSuccess) {
                            Logger.debug('STEP 3: Success');
                            ctx.success = true;
                            ctx.continue = true;
                        } else {
                            Logger.debug('STEP 3: Fail');
                            ctx.success = false;
                            ctx.continue = false;
                        }
                    }
                ];

                // Execute pipeline
                for (const step of steps) {
                    if (context.continue) {
                        await step(context);
                    }
                }

                // Final logic after pipeline
                if (!context.success) this._showCreditNotEnoughAlert();

                callback(context.success);

            } catch (error) {
                Logger.error('Error during _newPreSpin:', error);
                callback(false); // 確保出錯時也呼叫回呼
            } finally {
                // 無論成功或失敗，最終都要清除 Promise 鎖，並完成 Promise
                this._preSpinPromise = null;
                resolve();
            }
        });

        return this._preSpinPromise;
    }

    private _playSpinAnimate() {
        this._disableAllControlButtons(this.spinBtn.isAutoSpin);
        if (this.controlNode.active) {
            this.spinBtn.startSpin();
        }
    }

    private _stopSpinAnimate() {
        this._disableAllToggle();
        this.spinBtn.resetSpinBtn();
        this._enableAllControlButtons();
        // useGlobalGTEventDispatcher().dispatchEvent(h5GameTools.gtCommEvents.Game.STOP_SPIN);
    }

    private _stopAutoSpinMode() {
        this.spinBtn.resetSpinBtn();
        this._enableAllControlButtons();
    }

    /**
     * 一個通用的防止連點檢查器。
     * @param key 動作的唯一標識符，例如 'spinClick'。
     * @param cooldown 該動作的冷卻時間（毫秒）。
     * @returns 如果動作因為過於頻繁而被阻止，則返回 true。
     */
    private _isActionDebounced(key: string, cooldown: number): boolean {
        const now = Date.now();
        const lastTime = this._debounceTimers[key] || 0;

        if (now - lastTime < cooldown) {
            Logger.log(`Action [${key}] debounced.`);
            return true; // 被阻止
        }

        this._debounceTimers[key] = now;
        return false; // 未被阻止
    }

    // 自動換分邏輯 New版本
    private async _callAutoExchangeCredit(): Promise<boolean> {
        const EXCHANGE_TIMEOUT = 10000; // 設置一個 10 秒的超時時間

        try {
            // 1. 創建我們的換分 Promise
            const exchangePromise = new Promise<boolean>(resolve => {
                const ex_credit = getAutoExchangeCredit();
                getEventManager().emit(Game.EXCHANGE_CREDIT, {
                    exchangeCredit: ex_credit,
                    isManual: false,
                    callback: (success: boolean) => { resolve(success); }
                });
            });

            // 2. 創建一個會在超時後自動失敗的 Promise
            const timeoutPromise = new Promise<boolean>((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Auto exchange timed out after 10 seconds.'));
                }, EXCHANGE_TIMEOUT);
            });

            // 3. 讓這兩個 Promise 賽跑，看誰先完成
            const success = await Promise.race([exchangePromise, timeoutPromise]);

            return success;

        } catch (error) {
            Logger.error('自動換分異常或超時:', error);
            return false;
        }
    }
}
