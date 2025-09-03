
import boot from '@common/h5GameTools/Boot';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { GTLoaderButtonType,Comm, Game, GTAlertPram, GTAlertType } from '@common/h5GameTools/GTCommEvents';
import { slotGameConnector,SlotGameEvent } from '@common/h5GameTools/SlotGameConnector';
import { GameStatus } from '@common/h5GameTools/State';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { getAudioManager } from '@common/manager/AudioManager';
import { getEventManager } from '@common/manager/EventManager';
import { LanguageManager } from '@common/manager/LanguageManager';
import { Logger } from '@common/utils/Logger';

import { WorkOnBlurManager } from '@common/utils/WorkOnBlurManager';
import { WorkTimerManager } from '@common/utils/WorkTimerManager';

import { _decorator, Camera, CCBoolean, Component, find } from 'cc';

import { G5251Controller } from '@/games/clearance/script/controller/G5251Controller';

import { G5251AudioName } from '@/games/clearance/script/types/G5251AudioEnum';

import { beginGameData } from '@/games/clearance/script/types/G5251FakeDate';
import { onBeginGame, onCreditExchange, onGetMachineDetail, onHitJackpot, onOnLoadInfo, UpdateJPData } from '@/games/clearance/script/types/G5251Interface';


const { ccclass, property } = _decorator;
@ccclass('G5251GameMain')
export class G5251GameMain extends Component {
    @property(CCBoolean)
    public useFakeData: boolean = false;//模擬資料

    @property(G5251Controller)
    private controller: G5251Controller = null!;//控制器

    private _patternExchangeCallback: (success: boolean) => void = null!;//換分callback
    private _isFirstInGame: boolean = true;// 是否是第一次進遊戲
    private _freeGameCountForGTM: number = 0;// 總免費遊戲次數統計(for GTM)


    protected onLoad() {
        //啟用後台運行(針對動畫、tween、schedule、spine等動畫)
        WorkOnBlurManager.getInstance();
        WorkTimerManager.getInstance();

        LanguageManager.initialize('clearance');//設置語系資源(遊戲名稱)
        commonStore.storeMutation.setData('gameStatus', GameStatus.OnGameInit);//初始化遊戲狀態
    }

    protected async start() {
        const camera = find('Canvas/Camera');
        if (camera) camera.getComponent(Camera)!.far = 2000;//調整攝影機可視距離

        await boot();//執行這個公版才會讀到語系
        this.addEventListeners();//註冊監聽事件
        this.controller.init();//初始化(配置好盤面)
        if (!this.useFakeData) {
            this.linkWs();//與GS連線
        } else {
            this.runFakeData();//執行假資料表演
        }

        await getAudioManager().initialize('clearance');//加載音效資源(bundle名稱)
        getAudioManager().playMusic(G5251AudioName.BgmMg);//播放背景音樂
    }

    /**
     * 執行假資料表演
     */
    private async runFakeData() {
        commonStore.storeMutation.setData('gameStatus', GameStatus.OnGameSetupReady);//【公版】遊戲準備好了(這時會關閉載入頁)
        const fakeData = beginGameData.Instance;
        for (let i = 10; i < fakeData.data.length; i++) {
            this.controller.startSlotRun();//開始輪軸轉動
            await this.controller.handleBeginGame(fakeData.data[i]);
            Logger.debug('表演結束');
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnReady);// 遊戲狀態設成 onReady
        }
    }

    /**
     * 註冊監聽事件
     */
    private async addEventListeners() {
        // 註冊server監聽事件
        getEventManager().on(SlotGameEvent.LOAD_INFO, this.onLoadInfo.bind(this));
        getEventManager().on(SlotGameEvent.CREDIT_EXCHANGE, this.onCreditExchange.bind(this));
        getEventManager().on(SlotGameEvent.BEGIN_GAME, this.onBeginGame.bind(this));
        getEventManager().on(SlotGameEvent.HIT_JACKPOT, this.onHitJackpot.bind(this));
        getEventManager().on(SlotGameEvent.CLOSE, this.onDisconnect.bind(this));
        getEventManager().on(SlotGameEvent.GET_MACHINE_DETAIL, this.onGetMachineDetail.bind(this));
        getEventManager().on(SlotGameEvent.UPDATE_JP, this.onUpdateJP.bind(this));
        // 註冊【公版】監聽事件
        getEventManager().on(Game.SPIN, this.spin.bind(this));// spin按鈕事件
        getEventManager().on(Game.STOP_SPIN, this.stopSpin.bind(this));// stopSpin按鈕事件
        getEventManager().on(Game.EXCHANGE_CREDIT, this.exchangeCredit.bind(this));// 換分按鈕事件
        getEventManager().on(Comm.LOADER_BUTTON_CLICK, this.onCommBtnClick.bind(this)); // 公版按鈕通知
        getEventManager().on(Comm.PREPARE_EXCHANGE, this.onPrepareExchange.bind(this)); // 公版開啟換分介面通知
        getEventManager().on(Comm.CALL_STORE_EXRECORD, this.onCallStoreExrecord.bind(this)); // 公版
    }

    /**
     * 銷毀
     */
    protected onDestroy(): void {
        //移除server監聽事件
        getEventManager().off(SlotGameEvent.LOAD_INFO, this.onLoadInfo.bind(this));
        getEventManager().off(SlotGameEvent.CREDIT_EXCHANGE), this.onCreditExchange.bind(this);
        getEventManager().off(SlotGameEvent.BEGIN_GAME, this.onBeginGame.bind(this));
        getEventManager().off(SlotGameEvent.HIT_JACKPOT, this.onHitJackpot.bind(this));
        getEventManager().off(SlotGameEvent.CLOSE, this.onDisconnect.bind(this));
        getEventManager().off(SlotGameEvent.GET_MACHINE_DETAIL, this.onGetMachineDetail.bind(this));
        getEventManager().off(SlotGameEvent.UPDATE_JP, this.onUpdateJP.bind(this));
        //移除【公版】監聽事件
        getEventManager().off(Game.SPIN, this.spin.bind(this));
        getEventManager().off(Game.EXCHANGE_CREDIT, this.exchangeCredit.bind(this));
        getEventManager().off(Comm.LOADER_BUTTON_CLICK, this.onCommBtnClick.bind(this));
        getEventManager().off(Comm.PREPARE_EXCHANGE, this.onPrepareExchange.bind(this));
        getEventManager().off(Comm.CALL_STORE_EXRECORD, this.onCallStoreExrecord.bind(this));
    }

    //==================【接收server訊息】==================
    /**
     * GS連線
     */
    private linkWs() {
        Logger.debug('與GS連線...');
        if (slotGameConnector.wsIsDisConnect) {
            slotGameConnector.reconnect();
        } else {
            slotGameConnector.connect();
        }
    }

    //收到 onLoadInfo 要做的事
    private async onLoadInfo(msg: onOnLoadInfo) {
        Logger.debug('接收到server登入訊息', JSON.stringify(msg));
        this.controller.setRates(msg.data.Rates);//設置賠率表

        // 【公版】設置遊戲資料
        // commonStore.storeMutation.setData('balance', msg.data.Balance);
        // commonStore.storeMutation.setData('base', msg.data.Base);
        commonStore.storeMutation.setData('defaultBase', msg.data.DefaultBase);
        // commonStore.storeMutation.setData('betCreditList', msg.data.BetCreditList);
        // commonStore.storeMutation.setData('defaultBetCredit', msg.data.DefaultBetCredit);
        commonStore.storeMutation.setData('Rates', msg.data.Rates);
        // commonStore.storeMutation.setData('userAutoExchange', msg.data.UserAutoExchange);
        // commonStore.storeMutation.setData('currency', msg.data.Currency);
        // commonStore.storeMutation.setData('userName', msg.data.LoginName);
        // commonStore.storeMutation.setData('autoExchange', msg.data.UserAutoExchange.IsAuto);
        // commonStore.storeMutation.setData('credit', CommonStore.shared.storeState.customConfig.canExchange ? msg.data.Balance : msg.data.Credit);
        commonStore.storeMutation.setData('BetBase', msg.data.BetBase);
        // commonStore.storeMutation.setData('isCash', msg.data.isCash);
        commonStore.storeMutation.setData('userSetting', msg.data.userSetting);
        commonStore.storeMutation.setData('SingleBet', msg.data.SingleBet);
        // commonStore.storeMutation.setData('exchangeCredit', msg.data.UserAutoExchange.Credit);

        this.scheduleOnce(() => {
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnGameSetupReady);//【公版】遊戲準備好了(這時會關閉載入頁)
            getEventManager().emit(Comm.SHOW_EXCHANGE_PAGE);//【公版】通知開啟換分
        }, 0);
    }

    /**
     * 收到中jackpot要做的事
     * @param jackpotMsg // 彩金表演資料
     */
    private onHitJackpot(jackpotMsg: onHitJackpot) {
        Logger.debug('收到jackpot結果:', JSON.stringify(jackpotMsg));
        if (!jackpotMsg.event) return;
        this.onBeginGame(jackpotMsg.data.beginGameResult, jackpotMsg);//處理下注結果
    }

    /**
     * 收到 onbeginGame要做的事
     * @param beginGameMsg // 下注結果資料
     * @param jackpotMsg // 彩金表演資料
     */
    private onBeginGame(beginGameMsg: onBeginGame, jackpotMsg?: onHitJackpot) {
        Logger.debug('收到下注結果:', JSON.stringify(beginGameMsg));
        // 下注失敗處理(公版會跳提示，前端return不做處理)
        if (!beginGameMsg.event) return;

        // 發送派彩的 GTM 事件
        gtmEvent.CORE_GAME_PAYOFF(beginGameMsg.data.PayTotal);//【公版】發送派彩 GTM 事件

        // 發送主要免費遊戲開始的 GTM 事件
        if (beginGameMsg.data.FreeGame.HitFree && beginGameMsg.data.RollerNumber === 0) {
            gtmEvent.CORE_GAME_FG_START();
        }

        // 發送主要免費遊戲結束的 GTM 事件
        if (beginGameMsg.data.FreeGame.HitFree) {
            this._freeGameCountForGTM += beginGameMsg.data.FreeGame.FreeGameTime;
        }
        if (beginGameMsg.data.RollerNumber === 1 && beginGameMsg.data.FreeGameSpin.FreeGameTime === 0) {
            gtmEvent.CORE_GAME_FG_END(this._freeGameCountForGTM);
        }

        commonStore.storeMutation.setData('gameStatus', GameStatus.OnGetBeginGameResult);//【公版】獲得遊戲下注結果
        this.controller.handleBeginGame(beginGameMsg, jackpotMsg);//處理遊戲下注結果
        commonStore.storeMutation.setData('credit', beginGameMsg.data.Credit);//更新餘額
    }

    /**
     * 收到 onUpdateJP 要做的事
     * @param msg 
     */
    private onUpdateJP(msg: UpdateJPData): void {
        Logger.debug('收到jackpot更新訊息:', JSON.stringify(msg));
    }

    //==================【接收server訊息】==================


    //==================【接收公版事件/發送訊息給server】==================
    /**
     * 收到【公版】spin事件
     */
    public spin(): void {
        Logger.debug('收到spin...');
        this.controller.startSlotRun();//開始輪軸轉動
        slotGameConnector.callBeginGame(
            { 'action': 'beginGame4', 'betInfo': { 'BetCredit': commonStore.storeState.bet } });
    }

    /**
     * 收到【公版】停止spin事件
     */
    public stopSpin(): void {
        Logger.debug('收到stopSpin...');
        this.controller.forceStop();//立即停止
    }

    /**
     * 收到【公版】通知準備開啟換分面板
     */
    private onPrepareExchange(): void {
        slotGameConnector.callGetMachineDetail();
    }

    /**
     * 收到【公版】通知存玩家換分設定
     */
    private onCallStoreExrecord(): void {
        slotGameConnector.callStoreExREcord();
    }

    /**
     * 收到【公版】換分事件
     * @param exchange 換分
     * @param callback 換分完成後的callback
     */
    private async exchangeCredit(msg: any): Promise<void> {
        Logger.debug('exchangeCredit: ', JSON.stringify(msg));
        const { exchangeCredit, callback } = msg;//換分數值，是否手動換分
        const base: string = commonStore.storeState.base;
        this._patternExchangeCallback = callback;
        //換分額度大於0才執行換分
        if (exchangeCredit !== 0) {
            slotGameConnector.callCreditExchange(Number(base), exchangeCredit);
        }
        // 第一次進入遊戲，判斷是否遊戲開始spin
        if (this._isFirstInGame) {
            this.firstOnReady();
        }
    }

    /**
     * 收到【公版】按鈕事件，播放音效
     * @param type 
     */
    private onCommBtnClick(param: { type: GTLoaderButtonType }): void {
        getAudioManager().playOnceSound(G5251AudioName.BtnClick);
        // 設置面板關閉且第一次進入遊戲，判斷是否遊戲開始spin
        if ((param.type === GTLoaderButtonType.settingPanelCloseBtn) && this._isFirstInGame) {
            this.firstOnReady();
        }
    }

    /**
     * 第一次進入遊戲，判斷是否遊戲開始spin
     */
    private firstOnReady(): void {
        this._isFirstInGame = false;//設置為非第一次進入遊戲
        //延遲一個frame
        this.scheduleOnce(() => {
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnReady);// 遊戲狀態設成 onReady
        }, 0);
    }

    /**
     * 收到【公版】換分結果要做的事
     * @param msg 
     */
    private onCreditExchange(msg: onCreditExchange): void {
        Logger.debug('onCreditExchange:', JSON.stringify(msg));
        commonStore.storeMutation.setData('balance', msg.data.Balance);
        commonStore.storeMutation.setData('credit', msg.data.Credit);
        if (this._patternExchangeCallback) {
            this._patternExchangeCallback(msg.event);
        }
    }

    /**
     * 收到【公版】斷線要做的事
     */
    private onDisconnect(obj: Object): void {
        Logger.debug('onDisconnect:', JSON.stringify(obj));
        const alert: GTAlertPram = {
            type: GTAlertType.RECONNECT,
            title: commonStore.storeState.i18n.SYSTEM_MESSAGE,
            content: commonStore.storeState.i18n.DISCONNECT,
            cancelBtnText: '',
            confirmBtnText: commonStore.storeState.i18n.RECONNECT,
            cancelCallback: () => {
            },
            confirmCallback: () => {
                getEventManager().emit(Game.RESTART_GAME);//呼叫【公版】重新連線
            }
        };
        getEventManager().emit(Comm.SHOW_ALERT, alert);//通知【公版】顯示斷線提示
    }

    /**
     * 收到【公版】通知取得機台資料
     * @param msg 
     */
    private onGetMachineDetail(msg: onGetMachineDetail): void {
        Logger.debug('onGetMachineDetail: ', JSON.stringify(msg));

        // 設置【公版】機台資料
        if (msg.data.event) {
            commonStore.storeMutation.setData('currency', msg.data.Currency);
            commonStore.storeMutation.setData('balance', msg.data.Balance);
            commonStore.storeMutation.setData('base', msg.data.Base);
            commonStore.storeMutation.setData('defaultBase', msg.data.DefaultBase);
            commonStore.storeMutation.setData('credit', msg.data.Credit);
            commonStore.storeMutation.setData('betbase', msg.data.BetBase);
            // commonStore.storeMutation.setData('wagersID', msg.data.WagersID.toString());
        }

        getEventManager().emit(Comm.SHOW_EXCHANGE_PAGE);//通知【公版】開換分UI
    }
    //==================【接收公版事件/發送訊息給server】==================
}