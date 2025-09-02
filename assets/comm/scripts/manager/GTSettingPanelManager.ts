import { commonStore } from '@common/h5GameTools/CommonStore';
import { _decorator, Component, Node, Label, Toggle, Sprite, tween, v3, Button } from 'cc';
import { getEventManager } from '@common/manager/EventManager';
import { GTWebView, WEBMODE } from '../uicomponents/GTWebView';
import { GTExchangeView } from '../uicomponents/GTExchangeView';
import { GTSettingTogglePanel, GTSettingToggleType, GTSettingTogglePanelDelegate } from '../uicomponents/GTSettingTogglePanel';
import { watch } from '@common/utils/Reactivity';
import { GTLoaderEventType } from '../comm/GTLoaderEventType';
import { NumberUtils } from '@common/utils/NumberUtils';
import { gtLoaderCommStore } from '../comm/GTLoderCommStore';
import { getAutoExchangeCredit, getDecimalPlaces, geti18nTex } from '../comm/GTCommTools';
import { Comm, Game, GTAlertPram, GTAlertType, GTLoaderButtonType } from '@common/h5GameTools/GTCommEvents';
import { Logger } from '@common/utils/Logger';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { urlHelper } from '@common/utils/UrlHelper';
import { slotGameConnector } from '@common/h5GameTools/SlotGameConnector';

const { ccclass, property } = _decorator;

/**
 * GTSettingPanelManager 類別負責管理遊戲設置面板的交互邏輯。
 * 實現了 GTSettingTogglePanelDelegate，處理了切換面板的多種交互模式。
 */
@ccclass('GTSettingPanelManager')
export class GTSettingPanelManager extends Component implements GTSettingTogglePanelDelegate {
    // UI 元件屬性定義
    @property(GTSettingTogglePanel) public togglePanel: GTSettingTogglePanel = null!;
    @property(Sprite) public betIcon: Sprite = null!;
    @property(Label) public betLabel: Label = null!;
    @property(Label) public creditLabel: Label = null!;
    @property(Node) public addCash: Node = null!;
    @property(Label) public addCreditLabel: Label = null!;
    @property(Node) public settingPanel: Node = null!;
    @property(GTExchangeView) public exchangeView: GTExchangeView = null!;
    @property(GTWebView) public webView: GTWebView = null!;
    @property(Label) public versionLabel: Label = null!;
    @property(Node) public creditBtn: Node = null!;
    @property(Button) public betSetBtn: Button = null!;
    // 內部變量
    private _firstLoadFinshed: boolean = false;
    private _firstExchangeFinshed: boolean = false;
    private _helpToggle: Toggle = null!;                   // 幫助開關
    private _tempVersion: string = '1.7.3';             // 默認版本號 
    
    /**
     * 組件加載時的初始化設置。
     */
    protected onLoad(): void {
        this._initDelegates();
        this._setupWatchers();
        this._setVersionLabel();
        this._setupXC();
        Logger.debug(' version = ' + this._tempVersion);
    }

    protected onDisable(): void {
        // 還原資料
        gtLoaderCommStore.setData('isManualTrigger', false);
    }

    protected onDestroy(): void {
        getEventManager().off(GTLoaderEventType.ALERT_IS_SHOW, this._alertIsShowEvent.bind(this));
        getEventManager().off(Comm.SHOW_EXCHANGE_PAGE, this.onOpenExchangeView.bind(this));
    }


    /**
     * 設置監聽者和代理。
     * 將當前實例設置為相關面板的代理。
     */
    private _initDelegates(): void {
        this.togglePanel.setDelegate(this);
        this.exchangeView.setDelegate(this);

        getEventManager().on(GTLoaderEventType.ALERT_IS_SHOW, this._alertIsShowEvent.bind(this));
        getEventManager().on(Comm.SHOW_EXCHANGE_PAGE, this.onOpenExchangeView.bind(this));
        gtLoaderCommStore.setData('isGameReady', false);
    }

    /**
     * 設置對 CommonStore 屬性變化的監視。
     * 設置狀態變化時的反應方法。
     */
    private _setupWatchers(): void {
        watch(() => commonStore.storeState.gameCoreVersion, (newV, oldV) => {
            this._setVersionLabel();
        });

        watch(() => commonStore.storeState.totalBet, (newBet, oldBet) => {
            this._formatAndDisplayBetLabel();
            if (this._firstLoadFinshed) {
                if (urlHelper.gameType != '5278') {
                    gtmEvent.LOADER_MAIN_BETAMOUNT_SWITCH(oldBet, newBet, gtLoaderCommStore.getData('amountTarget'));
                }
                this.playJumpScoreAni(this.betLabel);
            }
            this._firstLoadFinshed = true;
        });
        watch(() => commonStore.storeState.credit, (newCredit, oldCredit) => {
            this._formatAndDisplayCreditLabel();
            this.creditLabel.updateRenderData();
        });
        this._formatAndDisplayBetLabel();
        this._formatAndDisplayCreditLabel();
        getEventManager().on(GTLoaderEventType.SHOW_ADD_CREDIT_ANIMATION, this._handleCreditExchange.bind(this));
    }

    /**
     * 設定遊戲版本標籤。
     */
    private _setVersionLabel(): void {
        this.versionLabel.string = `H ${this._tempVersion}\nG ${commonStore.storeState.gameCoreVersion}`;
    }

    /**
     * 設定XC相關調整
     * 不顯示錢幣符號
     */
    private async _setupXC(): Promise<void>{
        if ( commonStore.storeState.customConfig.showCoinSymbol ) return;

        const creditBtn = this.creditBtn.getComponent(Button)!;
        const normalCreditSprite = creditBtn.normalSprite;
        creditBtn.disabledSprite = normalCreditSprite ;
        creditBtn.interactable = false;
    }

    /**
     * 更新並格式化Credit顯示標籤。
     */
     private _formatAndDisplayCreditLabel(): void {
        this.creditLabel.string = NumberUtils.formatNumber({
            formatValue: commonStore.storeState.credit.toString(),
            roundCount: commonStore.storeState.customConfig.showDecimalPoints?2:0, //XC不能顯示小數點後兩位
            thousandth: true,
            keepDecimal: true,
            isKFormat: false
        });
        this.creditLabel.updateRenderData();
    }

    /**
     * 更新並格式化Bet注額顯示標籤。
     */
     private _formatAndDisplayBetLabel(): void {
        const num = commonStore.storeState.totalBet;
        const numLen = getDecimalPlaces(num);
        this.betLabel.string = NumberUtils.formatNumber({
            formatValue: num.toString(),
            roundCount: commonStore.storeState.customConfig.showDecimalPoints?numLen:0, //XC不能顯示小數點後兩位
            thousandth: true,
            keepDecimal: true,
            isKFormat: false
        });
        this.betLabel.updateRenderData();
    }

    private playJumpScoreAni(label : Label):void{
        this.scheduleOnce(()=>{
            tween(label.node)
            .to(0.1, { position: v3(label.node.position.x, 20 , label.node.position.z) })
            .to(0.1, { position: v3(label.node.position.x, 0, label.node.position.z) })
            .start();
        },0);
    }

    /**
     * 打開或自動觸發的操作視圖。
     * @param isManual 是否手動觸發
     */
    public onOpenExchangeView(): void {
        //xc 不開啟換分頁面
        if( commonStore.storeState.customConfig.canExchange == false ){
            //確保流程正確,發送換零分 LuckyAce還是需要送一次換分，要觸發他進遊戲動畫。
            getEventManager().emit(Game.EXCHANGE_CREDIT, {
                exchangeCredit: 0,
                isManual:false,
                callback: (success: boolean) => {
                    gtLoaderCommStore.setData('isGameReady', true);
                }
            });
            return;
        }
        Logger.debug("Exchange View Toggled.");
        const { autoExchange, balance } = commonStore.storeState;
        let isManualTrigger = gtLoaderCommStore.getData('isManualTrigger');
        let e_credit = getAutoExchangeCredit();

        //如果是自動觸發，並且有開自動兌換，可用分數不可為0 。
        if( isManualTrigger == false && autoExchange && Math.floor(balance) >= e_credit && e_credit > 0){
            let exchange = getAutoExchangeCredit();
            this._sendExchangeCreditEvent(exchange, isManualTrigger);
        }else{
            // 因為是先更新餘額後才去開啟開分頁面，為了防止第二次呼叫，要先加開關
            gtLoaderCommStore.setData('isPrepareExchange', true);
            this.togglePanel.checkByType(GTSettingToggleType.EXCHANGE);
            if(this.settingPanel.active){
                this.togglePanel.onEnable();
            }
            this.toggleSettingPanel(true);
            this._updatePanel();
            //完成開分頁面後要把它設定回false
            gtLoaderCommStore.setData('isPrepareExchange', false);
        }
    }

    // 從這裡進來的一定都是手動觸發
    public onPrepareOpenExchangeView(): void{

        Logger.debug("onPrepareOpenExchangeView")
        gtLoaderCommStore.setData('isManualTrigger', true);
        getEventManager().emit(Comm.PREPARE_EXCHANGE);
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK,{type: GTLoaderButtonType.settingPanelBtn});
    }

    public onShortCutExchangeBtnPreessed():void {
        gtmEvent.LOADER_MAIN_SHORTCUT_EXCHANGE_CLICK();
        this.onPrepareOpenExchangeView();
    }

    /**
     * 處理設置面板的切換。
     * 當按下設置按鈕時被調用。
     */
    public onSettingPanelPressed(): void {
        Logger.debug("Setting Panel Toggled.");
        gtmEvent.LOADER_MAIN_SETTING();

        if(GTSettingToggleType.RULE == this.togglePanel.panelType){
            this._logButtonClick(GTLoaderButtonType.settingPanelBtn);
        }

        if (!this.settingPanel.active) {
            this.togglePanel.checkByType(GTSettingToggleType.RULE);
            this._unCheckHelpToggle();
        }
        this._updatePanel();
        this.toggleSettingPanel(!this.settingPanel.active);
    }

    /**
     * 關閉設定面板。
     */
    public onSettingPanelClosePressed(): void {
        Logger.debug("Setting Panel Closed.");
        gtmEvent.LOADER_SETTING_EXITSETTING_CLICK();

        this._updatePanel();
        this.toggleSettingPanel(false);
        gtLoaderCommStore.setData('isGameReady', true);
        this._logButtonClick(GTLoaderButtonType.settingPanelCloseBtn);
    }

    /**
     * 處理幫助中心的切換按鈕。
     * @param toggle Toggle 切換狀態
     */
    public onHelpTogglePressed(toggle: Toggle): void {
        Logger.debug("Help Toggle Pressed.");

        if (toggle.isChecked) {
            gtmEvent.LOADER_SETTING_HELP_CLICK();

            this._helpToggle = toggle;
            this._setWebViewContent('GAME_HELP', WEBMODE.HELP);
            getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.none });

        } else {
            this._helpToggle = null!;
            if (this.togglePanel.panelType === GTSettingToggleType.HISTORY) this._setHistoryWebView();
            if (this.togglePanel.panelType === GTSettingToggleType.RULE) this._setRuleWebView();
            this._updatePanel();
        }

    }

    /**
     * 設置 WebView 的內容。
     * @param titleKey 內容標題的鍵值
     * @param url 加載的 URL 地址
     */
    private _setWebViewContent(titleKey: string, mode: WEBMODE): void {
        this.webView.setTitle(geti18nTex(titleKey));
        this.webView.setWebMode(mode);
        this.webView.node.active = true;
        this.exchangeView.node.active = false;
    }

    /**
     * 設置歷史視圖的頁面內容。
     */
    private _setHistoryWebView(): void {
        Logger.debug("_setHistoryWebView");
        this._setWebViewContent('GAME_HISTORY', WEBMODE.HISTORY);
    }

    /**
     * 設置規則視圖的頁面內容。
     */
    private _setRuleWebView(): void {
        Logger.debug("_setRuleWebView");
        this._setWebViewContent('GAME_RULE', WEBMODE.RULE);
    }

    // GTSettingTogglePanelDelegate 所需的方法
    /**
     * 當退出切換被按下時的行為。
     * @param toggle 切換��態
     */
    public gtSettingPanel_onExitToggle(toggle: Toggle): void {
        Logger.debug("Exit Toggle Pressed.");

        const alertParams: GTAlertPram = {
            type: GTAlertType.DIALOG,
            title: 'SYSTEM_MESSAGE',
            content: 'CONFIRM_LEAVE',
            confirmBtnText: 'CONTINUE',
            cancelBtnText: 'EXITBTN',
            confirmCallback: () => {
                if(this.settingPanel.active){
                    this.togglePanel.onEnable();
                }
                this.toggleSettingPanel(true);
                getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.none });
            },
            cancelCallback: () => {
                this.toggleSettingPanel(false);
                urlHelper.exitGame('exit');
                getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.none });
                let time = new Date().getTime() / 1000;
                gtmEvent.LOADER_MAIN_LEAVE(true, NumberUtils.accSub(time, gtLoaderCommStore.getData('initTime')!));
            }
        };

        getEventManager().emit(Comm.SHOW_ALERT, alertParams);

    }

    /**
     * 當聲音切換被按下時的行為。
     * @param toggle 切換狀態
     */
    public gtSettingPanel_onSoundToggle(toggle: Toggle): void {
        Logger.debug("Sound Toggle Pressed.");
        if ( toggle.isChecked ){
            gtmEvent.LOADER_SETTING_SOUNDSET_CLICK();
        }
    }

    /**
     * 當交換切換被按下時的行為。
     * @param toggle 切換狀態
     */
    public gtSettingPanel_onExchangeToggle(toggle: Toggle): void {
        Logger.debug("Exchange Toggle Pressed.");
        // 如果是自動開啟，因為會把畫面叫起來導致Toggle isCheck又觸發一次。
        const isPrepareExchange = gtLoaderCommStore.getData('isPrepareExchange');
        if ( toggle.isChecked && isPrepareExchange == false) {
            gtmEvent.LOADER_SETTING_EXCHANGE_CLICK();
            this.onPrepareOpenExchangeView();

        }
        this._unCheckHelpToggle();
    }

    /**
     * 當歷史切換被按下時的行為。
     * @param toggle 切換狀態
     */
    public gtSettingPanel_onHistoryToggle(toggle: Toggle): void {
        Logger.debug("History Toggle Pressed.");

        if (toggle.isChecked) {
            gtmEvent.LOADER_SETTING_BETHISTORY_CLICK();
            this._setHistoryWebView();
            this._updatePanel();
        }
        this._unCheckHelpToggle();

    }

    /**
     * 當規則切換被按下時的行為。
     * @param toggle 切換狀態
     */
    public gtSettingPanel_onRuleToggle(toggle: Toggle): void {
        Logger.debug("Rule Toggle Pressed.");

        if (toggle.isChecked) {
            gtmEvent.LOADER_SETTING_GAMERULE_CLICK();
            this._setRuleWebView();
            this._updatePanel();
        }
        this._unCheckHelpToggle();

    }

    /**
     * 當開始遊戲時，處理交換信息。
     * @param isAuto 是否自動交換
     * @param exchangeCredit 交換額度
     * @param exchangeAll 是否全部交換
     */
    public gtExchangeView_onStartGame(isAuto: boolean, exchangeCredit: number, exchangeAll: boolean): void {
        Logger.debug("Exchange Game Started with Credit:", exchangeCredit);

        commonStore.storeMutation.setData('autoExchange', isAuto);
        commonStore.storeMutation.setData('exchangeAll', exchangeAll);

        if( exchangeCredit != 0) commonStore.storeMutation.setData('exchangeCredit', exchangeCredit);

        this._sendExchangeCreditEvent(exchangeCredit, true);

    }

    /**
     * 送出交換事件。
     * @param exchangeCredit 交換額度
     * @param isManual 是否手動交換
     */
    private _sendExchangeCreditEvent(ex_Credit: number, isManualTrigger: boolean): void {

        getEventManager().emit(Game.EXCHANGE_CREDIT, {
            exchangeCredit: ex_Credit,
            callback: (success: boolean) => {
                if( this._firstExchangeFinshed ){
                    gtmEvent.LOADER_MAIN_EXCHANGE(success);
                }
                // 處理交換結果的回調，這裡可以添加額外邏輯
                if( success == true ){
                    this._handleCreditExchange(ex_Credit, 0);
                }

                this._firstExchangeFinshed = true;

                gtLoaderCommStore.setData('isGameReady', true);
            }
        });

        const { autoExchange, exchangeCredit} = commonStore.storeState;
        // 手動換分才要儲存狀態
        if(isManualTrigger && exchangeCredit !== 0 ){
            getEventManager().emit(Comm.CALL_STORE_EXRECORD, {
                exchangeCredit,
                autoExchange
            });
        }
        this.scheduleOnce(()=>{
            this.toggleSettingPanel(false);
        },0);

        // 完成換分後要還原狀態
        gtLoaderCommStore.setData('isManualTrigger', false);
    }

    /**
     * 取消幫助切換的選中狀態。
     */
    private _unCheckHelpToggle(): void {
        if (this._helpToggle) this._helpToggle.isChecked = false;
    }

    /**
     * 更新面板的顯示狀態。
     */
    private _updatePanel(): void {
        const panelType = this.togglePanel.panelType;
        this.exchangeView.node.active = panelType === GTSettingToggleType.EXCHANGE;
        this.webView.node.active = panelType !== GTSettingToggleType.EXCHANGE;
    }

    /**
     * 處理分數變化的動畫效果。
     * @param newCredit 新的分數
     * @param oldCredit 老的分數
     */
    private _handleCreditExchange(newCredit: number, oldCredit: number = 0): void {
        this.scheduleOnce(() => {
            const creditDiff = Math.abs(newCredit - oldCredit);
            if (creditDiff <= 0) return;

            this.addCreditLabel.string = `+${NumberUtils.formatNumber({
                formatValue: creditDiff,
                roundCount: 2,
                thousandth: true,
                keepDecimal: true,
                isKFormat: false
            })}`;
            this._playAddCreditAnimation();
        });
    }

    /**
     * 播放加分標籤的動畫。
     */
    private _playAddCreditAnimation(): void {

        this.addCash.active = true;
        this.scheduleOnce(() => {
            this.addCash.active = false;
        },2);

    }

    /**
     * 記錄按鈕點擊事件。
     * @param buttonType 按鈕類型
     */
    private _logButtonClick(buttonType: GTLoaderButtonType): void {
        Logger.debug(`Button clicked: ${buttonType}`);
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: buttonType });
    }

    private _alertIsShowEvent( isShow:boolean ){
        if (this.togglePanel.panelType !== GTSettingToggleType.EXCHANGE || this._helpToggle) {
            if(slotGameConnector.wsIsDisConnect){
                this.webView.node.active = false;
            }
            if(isShow){
                this.webView.node.setPosition(-10000,0);
            }else{
                this.webView.node.setPosition(0,0);
            }

        }
    }

    private toggleSettingPanel(status: boolean) {
        getEventManager().emit(Comm.LOADER_TOGGLE_SETTING_PANEL, { status });
        this.settingPanel.active = status;
    }
}
