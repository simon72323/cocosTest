
import { _decorator, Component, Node, Slider, Toggle, EventTouch, Label, ProgressBar, Button, NodeEventType } from 'cc';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { GTSelectCreditBtn } from './GTSelectCreditBtn';
import { NumberUtils } from '@common/utils/NumberUtils';
import { getEventManager } from '@common/manager/EventManager';
import { Comm, GTAlertType } from '@common/h5GameTools/GTCommEvents';
import { GTLoaderCommStore } from '../comm/GTLoderCommStore';
import { geti18nTex } from '../comm/GTCommTools';
import { GTLoaderButtonType } from '@common/h5GameTools/GTCommEvents';
import { Logger } from '@common/utils/Logger';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { GTCustomButton } from './GTCustomButton';

const { ccclass, property } = _decorator;

export interface GTExchangeViewDelegate {
    gtExchangeView_onStartGame(isAuto: boolean, exchangeCredit: number, exchangeAll: boolean): void;
}

@ccclass('GTExchangeView')
export class GTExchangeView extends Component {
    @property(Label) public titleLabel: Label = null!;
    @property(Label) public exchangeScoreTitleLabel: Label = null!;
    @property(Slider) public creditSlider: Slider = null!;
    @property(ProgressBar) public creditProgressBar: ProgressBar = null!;
    @property(Button) public sliderHandle: Button = null!;
    @property(Toggle) public autoExchangeToggle: Toggle = null!;
    @property(Node) public tipInfoNode: Node = null!;
    @property(Node) public warnNode: Node = null!;
    @property(Label) public creditLabel: Label = null!;
    @property(Label) public exchangeCreditLabel: Label = null!;
    @property(Label) public balanceLabel: Label = null!;
    @property(Button) public resetExchangeBtn: Button = null!;
    @property(GTSelectCreditBtn) public selectBtnA: GTSelectCreditBtn = null!;
    @property(GTSelectCreditBtn) public selectBtnB: GTSelectCreditBtn = null!;
    @property(GTCustomButton) public exchangeBtn: GTCustomButton = null!;
    @property(Toggle) public exchangeAllToggle: Toggle = null!;

    // 常量定義
    private readonly _maxExchangeLimit: number = GTLoaderCommStore.getInstance().getData('exchangeCreditLimit')!;
    private readonly _quickExchangeMap: Record<string, number[]> = {
        "RMB": [100, 500],
        "GBP": [10, 50],
        "IDR": [100000, 500000],
        "KRW": [1000, 5000],
        "SGD": [10, 50],
        "TWD": [100, 500],
        "VND": [100000, 500000],
        "EUR": [10, 50],
        "HKD": [100, 500],
        "JPY": [1000, 5000],
        "MYR": [10, 50],
        "THB": [100, 500],
        "USD": [10, 50],
        "USDT": [10, 50],
        "INR": [1000, 5000],
        "AUD": [10, 50],
        "PHP": [100, 500],
        "KIDR": [100, 500],
        "KVND": [100, 500],
        "MMK": [10000, 50000],
        "BRL": [100, 500],
        "PKR": [1000, 5000],
        "KHR": [10000, 50000]
    };

    // 狀態和屬性
    private _actualLimit: number = 0;
    private _exchangeCredit: number = 0;
    private _currentBalance: number = 0;
    private _currentCredit: number = 0;
    private _isAutoExchange: boolean = false;
    private _delegate: GTExchangeViewDelegate = null!;
    private _isSliderTouch: boolean = false;
    
    private _setupFinshed: boolean = false;

    protected onLoad(): void {
        this.titleLabel.string = geti18nTex('GAME_EXCHANGE');
        this._initEventLisenter();
    }

    public onEnable(): void {
        this._initializeExchange();
        this.exchangeScoreTitleLabel.string = `${geti18nTex('EXCHANGE_SCORE')} (${commonStore.storeState.base})`;
        this.exchangeBtn.enabled = true;
    }

    private _initEventLisenter(){
        this.sliderHandle.node.on(NodeEventType.TOUCH_START, this._onSliderHandleTouchStart.bind(this));
        this.sliderHandle.node.on(NodeEventType.MOUSE_DOWN, this._onSliderHandleTouchStart.bind(this));
        this.sliderHandle.node.on(NodeEventType.TOUCH_END, this._onSliderHandleTouchEnd.bind(this));
        this.sliderHandle.node.on(NodeEventType.TOUCH_CANCEL, this._onSliderHandleTouchEnd.bind(this));
        this.sliderHandle.node.on(NodeEventType.MOUSE_UP, this._onSliderHandleTouchEnd.bind(this));
        
    }

    public setDelegate(delegate: GTExchangeViewDelegate): void {
        this._delegate = delegate;
    }

    public onExchangeBtnPressed(event: EventTouch, data: number): void {
        let credit = this._exchangeCredit;
        if (this._actualLimit === 0) return;

        if (credit >= this._actualLimit) {
            this._showExchangeMaxAlert();
            return;
        }

        switch (Number(data)) {
            case 0:
                credit = NumberUtils.accAdd(credit, this.selectBtnA.getCredit());
                gtmEvent.LOADER_SETTING_EXCHANGE_FASTEXCHGANGE_CLICK(this.selectBtnA.getCredit());
                break;
            case 1:
                credit = NumberUtils.accAdd(credit, this.selectBtnB.getCredit());
                gtmEvent.LOADER_SETTING_EXCHANGE_FASTEXCHGANGE_CLICK(this.selectBtnB.getCredit());
                break;
            default:
                console.warn('未知的按鈕資料:', data);
                return;
        }


        if (credit <= this._actualLimit) {
            this._setExchangeCredit(credit);
        }
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.settingPanelBtn });
    }

    public onExchangeAllToggle(toggle: Toggle): void {

         //全額兌換是-1
        gtmEvent.LOADER_SETTING_EXCHANGE_FASTEXCHGANGE_CLICK(toggle.isChecked?-1:0);
        
        // 如果連最大換分限額都是0的話，基本上不用再跑下面的方法了，只要單純讓他開關
        if(this._actualLimit == 0) return;

        Logger.debug(" exchange all =-= 0 ---> " + toggle.isChecked + '--' + this._isSliderTouch);
        if(toggle.isChecked ){
            this._setExchangeCredit(this._actualLimit);
        }else if(toggle.isChecked == false && this._isSliderTouch == false){
            this._setExchangeCredit(0); 
        }
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.settingPanelBtn });
    }

    public onCleanExchangeCredit(): void {
        this._resetExchange();
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.settingPanelBtn });
        this.exchangeAllToggle.isChecked = false;
    }

    public onOpenTipInfo(): void {
        this.tipInfoNode.active = !this.tipInfoNode.active;
    }

    public onOpenAutoExchange(toggle: Toggle): void {
        this._isAutoExchange = toggle.isChecked;
        this.tipInfoNode.active = false;
        
        if( this._setupFinshed ){
            gtmEvent.LOADER_SETTING_EXCHANGE_AUTOEXCHANGE_CLICK( toggle.isChecked );
        }
        
    }

    public onClickAutoExchange():void{
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.settingPanelBtn });
    }

    public onSliderChange(slider: Slider, customEventData: string): void {
        const sliderProgress = this.creditSlider.progress;
        this.creditProgressBar.progress = slider.progress;
        this._exchangeCredit = Math.floor(sliderProgress * this._actualLimit);
        this._setExchangeCredit(this._exchangeCredit);
    }
    private _onSliderHandleTouchStart(event : any){
        Logger.debug('begin --> ' + event.type);
        this._isSliderTouch = true;
    }
    private _onSliderHandleTouchEnd(event : any){
        Logger.debug('end --> ' + event.type);
        this._isSliderTouch = false;
    }

    public onStartGame(): void {
        this.exchangeBtn.enabled = false;
        if (this._delegate) {
            this._delegate.gtExchangeView_onStartGame(this._isAutoExchange, this._exchangeCredit, this.exchangeAllToggle.isChecked);
        } else {
            console.warn('Delegate 未設定');
        }
        
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.exchangeBtn });
    }

    private _setExchangeCredit(num: number): void {
        num = Math.max(num, 0);

        // 如果設定0的話，必須要把自動兌換分關掉
        if (num === 0 && !commonStore.storeState.autoExchange && commonStore.storeState.credit === 0) {
            this.autoExchangeToggle.isChecked = false;
        }

        const tempBalance = NumberUtils.accSub(this._currentBalance, num); // 計算後再轉換回浮點數
        this._exchangeCredit = num;

        this._updateDisplay(num, tempBalance);
        this._updateExchangeButtons(NumberUtils.accSub(this._actualLimit, num));
    }

    private _updateDisplay(exchangeCredit: number, remainingBalance: number): void {
        this._setDisplayedLabel(this.exchangeCreditLabel, exchangeCredit, 0, false);
        this._setDisplayedLabel(this.balanceLabel, remainingBalance, 2, false);
        this._setDisplayedLabel(this.creditLabel, this._currentCredit, 2, false);

        this.creditProgressBar.progress = this._calculateProgressBarProgress(exchangeCredit, this._actualLimit);
        this.creditSlider.progress = this.creditProgressBar.progress;

        this.resetExchangeBtn.node.active = exchangeCredit !== 0;
        if( exchangeCredit != 0 ) this.exchangeAllToggle.isChecked = exchangeCredit === this._actualLimit;
        
        
    }

    private _setDisplayedLabel(label: Label, value: number, roundCount: number, kFormat: boolean): void {
        label.string = NumberUtils.formatNumber({
            formatValue: value.toString(),
            roundCount: roundCount,
            thousandth: true,
            keepDecimal: true,
            isKFormat: kFormat
        });
    }

    private _calculateProgressBarProgress(exchanged: number, limit: number): number {
        return limit === 0 ? 0 : exchanged / limit;
    }

    private _resetExchange(): void {
        this._exchangeCredit = 0;
        this._setExchangeCredit(this._exchangeCredit);
        this._updateBalanceAndCredit();
    }

    // 初始化交換相關參數和顯示
    private _initializeExchange(): void {
        
        this._resetExchange();
        
        const totalBalance = NumberUtils.accAdd(this._currentBalance, this._currentCredit);
        this._actualLimit = Math.floor(NumberUtils.accSub(Math.min(totalBalance, this._maxExchangeLimit), this._currentCredit));

        const quickExBarValues = this._getQuickExchangeValuesForCurrency(commonStore.storeState.currency);
        this.selectBtnA.setCredit(quickExBarValues[0]);
        this.selectBtnB.setCredit(quickExBarValues[1]);

        this._isAutoExchange = commonStore.storeState.autoExchange;
        this.autoExchangeToggle.isChecked = this._isAutoExchange;
        
        //初始預設要開
        this.tipInfoNode.active = true;

        this._setExchangeCredit(commonStore.storeState.exchangeAll ? this._actualLimit : 0);
        this.exchangeAllToggle.isChecked = commonStore.storeState.exchangeAll;

        this._setupFinshed = true;
    }

    private _getQuickExchangeValuesForCurrency(currency: string): number[] {
        return this._quickExchangeMap[currency] || [100, 500];
    }

    private _showExchangeMaxAlert(): void {
        getEventManager().emit(Comm.SHOW_ALERT, {
            type: GTAlertType.BASIC_NONE,
            title: 'SYSTEM_MESSAGE',
            content: 'MAXIMUN_EXCHANGE',
            confirmBtnText: null,
            cancelBtnText: null
        });
    }

    private _updateBalanceAndCredit(): void {
        this._currentBalance = commonStore.storeState.balance;
        this._currentCredit = commonStore.storeState.credit;
        this._setDisplayedLabel(this.creditLabel, this._currentCredit, 2, false);
    }

    private _updateExchangeButtons(balance: number): void {
        this.selectBtnA.interactable = balance >= this.selectBtnA.getCredit();
        this.selectBtnB.interactable = balance >= this.selectBtnB.getCredit();
    }

}
