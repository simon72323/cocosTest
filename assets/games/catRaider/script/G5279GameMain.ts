import boot from '@common/h5GameTools/Boot';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { GTLoaderButtonType, Comm, Game, GTAlertPram, GTAlertType } from '@common/h5GameTools/GTCommEvents';
import { GameStatus } from '@common/h5GameTools/State';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { getAudioManager } from '@common/manager/AudioManager';
import { getEventManager } from '@common/manager/EventManager';
import { LanguageManager } from '@common/manager/LanguageManager';
import { awaitNextTick } from '@common/utils/ccTools';
import { Logger } from '@common/utils/Logger';
import { NumberUtils } from '@common/utils/NumberUtils';
import { urlHelper } from '@common/utils/UrlHelper';
import { WorkOnBlurManager } from '@common/utils/WorkOnBlurManager';
import { WorkTimerManager } from '@common/utils/WorkTimerManager';
import { _decorator, Camera, Component, director, find, Layers } from 'cc';
import { DEV } from 'cc/env';

import { g5279Connector } from '@/games/catRaider/script/connector/G5279Connector';
import { SlotConnectorEvent } from '@/games/catRaider/script/connector/G5279ConnectorEvent';
import { G5279MainController } from '@/games/catRaider/script/controller/G5279MainController';
import { G5279ReelController } from '@/games/catRaider/script/controller/G5279ReelController';
import { G5279AudioName } from '@/games/catRaider/script/data/G5279AudioEnum';
import { G5279Config } from '@/games/catRaider/script/data/G5279Config';
import { G5279BetState } from '@/games/catRaider/script/data/G5279Enum';
import { onBeginGame, onCreditExchange, onGetMachineDetail, onHitJackpot, onOnLoadInfo, updateJPData } from '@/games/catRaider/script/data/G5279Interface';
import { G5279Setting } from '@/games/catRaider/script/G5279Setting';
import { getG5279Model } from '@/games/catRaider/script/model/G5279Model';

const { ccclass, property } = _decorator;
@ccclass('G5279GameMain')
export class G5279GameMain extends Component {
    @property(G5279MainController)
    private mainController: G5279MainController = null!;//控制器

    @property(G5279ReelController)
    private reelController: G5279ReelController = null!;//輪軸控制器

    private _patternExchangeCallback: (success: boolean) => void = null!;//換分callback
    private _isFirstInGame: boolean = true;// 是否是第一次進遊戲

    @property(G5279Setting)
    private setting: G5279Setting = null!;//遊戲假資料設置

    /**
     * 加載資源並初始化遊戲
     */
    protected onLoad() {
        LanguageManager.loadLanguageBundle('catRaider');//設置語系資源(遊戲名稱)
        console.warn('初始化語系');
        //啟用後台運行(針對動畫、tween、schedule、spine等動畫)
        WorkOnBlurManager.getInstance();
        WorkTimerManager    .getInstance();

        commonStore.storeMutation.setData('gameStatus', GameStatus.OnGameInit);//初始化遊戲狀態
    }

    /**
     * 啟動遊戲 
     */
    protected async start() {
        // 調整公版場景的環境配置
        director.getScene()!.scene.globals.postSettings.toneMappingType = 1;//修改【公版】渲染模式為Linear
        const camera = find('Canvas/Camera');
        //修改【公版】攝影機參數
        if (camera) {
            camera.getComponent(Camera)!.priority = 2;
            camera.getComponent(Camera)!.visibility = Layers.Enum.UI_2D;
            camera.getComponent(Camera)!.clearFlags = Camera.ClearFlag.DEPTH_ONLY;
        }
        await getAudioManager().loadBundleAudios(G5279Config.bundleName);//加載音效資源(bundle名稱)
        getAudioManager().playMusic(G5279AudioName.bgmMg);//播放背景音樂

        await boot();//執行這個公版才會讀到語系
        this.addEventListeners();//註冊監聽事件
        this.linkWs();//與GS連線

        // 【測試用】只在開發測試環境啟用功能
        const testDomains = [
            'dowincasino-dev.com',
            'dowincasino-test.com'
        ];
        if (DEV || testDomains.includes(urlHelper.domain)) {
            //將測試方法暴露到全局 window 對象
            (window as any).beginGame = this.beginGame.bind(this);
            Logger.debug('【測試】測試功能已啟用，使用: window.beginGame(data)');
        }
    }

    /**
     * 【測試用】控制台調用 BeginGame 方法
     * 在瀏覽器 F12 控制台中輸入: window.beginGame(data) 即可測試
     * @param testData 測試用的 onBeginGame 數據
     */
    private beginGame(testData: any) {
        this.reelController.handleSpinDown();//處理當spin按下時
        this.setting.hideFakePanel();//隱藏假資料面板
        const mockData: onBeginGame = { event: true, data: testData };
        this.onBeginGame(mockData);
    }

    /**
     * 註冊監聽事件
     */
    private addEventListeners() {
        // 註冊server監聽事件
        getEventManager().on(SlotConnectorEvent.LOAD_INFO, this.onLoadInfo.bind(this));
        getEventManager().on(SlotConnectorEvent.CREDIT_EXCHANGE, this.onCreditExchange.bind(this));
        getEventManager().on(SlotConnectorEvent.BEGIN_GAME, this.onBeginGame.bind(this));
        getEventManager().on(SlotConnectorEvent.HIT_JACKPOT, this.onHitJackpot.bind(this));
        getEventManager().on(SlotConnectorEvent.CLOSE, this.onDisconnect.bind(this));
        getEventManager().on(SlotConnectorEvent.GET_MACHINE_DETAIL, this.onGetMachineDetail.bind(this));
        getEventManager().on(SlotConnectorEvent.UPDATE_JP, this.onUpdateJP.bind(this));
        // 註冊【公版】監聽事件
        getEventManager().on(Game.SPIN, this.spin.bind(this));// spin按鈕事件
        getEventManager().on(Game.BUY_FREEGAME_SPIN, this.onBuyFreeGameSpin.bind(this));// spin按鈕事件
        // getEventManager().on(Game.STOP_SPIN, this.stopSpin.bind(this));// stopSpin按鈕事件
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
        getEventManager().off(SlotConnectorEvent.LOAD_INFO, this.onLoadInfo.bind(this));
        getEventManager().off(SlotConnectorEvent.CREDIT_EXCHANGE, this.onCreditExchange.bind(this));
        getEventManager().off(SlotConnectorEvent.BEGIN_GAME, this.onBeginGame.bind(this));
        getEventManager().off(SlotConnectorEvent.HIT_JACKPOT, this.onHitJackpot.bind(this));
        getEventManager().off(SlotConnectorEvent.CLOSE, this.onDisconnect.bind(this));
        getEventManager().off(SlotConnectorEvent.GET_MACHINE_DETAIL, this.onGetMachineDetail.bind(this));
        getEventManager().off(SlotConnectorEvent.UPDATE_JP, this.onUpdateJP.bind(this));
        //移除【公版】監聽事件
        getEventManager().off(Game.SPIN, this.spin.bind(this));
        getEventManager().off(Game.BUY_FREEGAME_SPIN, this.onBuyFreeGameSpin.bind(this));
        // getEventManager().off(Game.STOP_SPIN, this.stopSpin.bind(this));
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
        //使用本地連線功能
        if (g5279Connector.wsIsDisConnect) {
            g5279Connector.reconnect();
        } else {
            g5279Connector.connect();
        }
        // if (SlotGameConnector.shared.wsIsDisConnect) {
        //     SlotGameConnector.shared.reconnect();
        // } else {
        //     SlotGameConnector.shared.connect();
        // }
    }

    //收到 onLoadInfo 要做的事
    private async onLoadInfo(loadInfoMsg: onOnLoadInfo) {
        Logger.debug('接收到server登入訊息', JSON.stringify(loadInfoMsg));
        const { balance, currency, userId, betCreditList, defaultBetCredit } = loadInfoMsg.data.common;
        const { gameCode, userName } = loadInfoMsg.data.vendor;
        getG5279Model().setLoadInfo(loadInfoMsg);//設置onLoadInfo資料

        // 【公版】設置遊戲資料
        commonStore.storeMutation.setData('betCreditList', betCreditList);
        commonStore.storeMutation.setData('defaultBase', defaultBetCredit);//預設下注欄位
        commonStore.storeMutation.setData('balance', balance);
        commonStore.storeMutation.setData('Currency', currency);
        commonStore.storeMutation.setData('UserId', userId);
        commonStore.storeMutation.setData('bet', defaultBetCredit);
        commonStore.storeMutation.setData('credit', balance);//這款沒有換分
        // const canExchange = commonStore.storeState.customConfig.canExchange;
        // commonStore.storeMutation.setData('credit', canExchange ? credit : balance);

        // commonStore.storeMutation.setData('Rates', rates);
        commonStore.storeMutation.setData('GameCode', gameCode);
        commonStore.storeMutation.setData('UserName', userName);
        // commonStore.storeMutation.setData('BetBase', msg.data.betBase);
        // commonStore.storeMutation.setData('userSetting', msg.data.userSetting);
        // commonStore.storeMutation.setData('SingleBet', msg.data.singleBet);

        await awaitNextTick();
        this.reelController.hideControlButton();//隱藏下注按鈕
        commonStore.storeMutation.setData('gameStatus', GameStatus.OnGameSetupReady);//【公版】遊戲準備好了(這時會關閉載入頁)
        await this.reelController.init();//初始化盤面
        getEventManager().emit(Comm.SHOW_EXCHANGE_PAGE);//【公版】通知開啟換分
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
    private async onBeginGame(beginGameMsg: onBeginGame, jackpotMsg?: onHitJackpot) {
        Logger.debug('收到下注結果:', JSON.stringify(beginGameMsg));
        // 下注失敗處理(公版會跳提示，前端return不做處理)
        if (!beginGameMsg.event) return;

        // 發送派彩的 GTM 事件
        gtmEvent.CORE_GAME_PAYOFF(beginGameMsg.data.totalPay);//【公版】發送派彩 GTM 事件

        //---------------【奪寶奇喵沒有slotGame的免費遊戲邏輯】---------------
        // 發送主要免費遊戲開始的 GTM 事件
        // if (beginGameMsg.data.FreeGame.HitFree && beginGameMsg.data.RollerNumber === 0) {
        //     GTMEvent.shared.CORE_GAME_FG_START();
        // }
        // // // 發送主要免費遊戲結束的 GTM 事件
        // if (beginGameMsg.data.FreeGame.HitFree) {
        //     this._freeGameCountForGTM += beginGameMsg.data.FreeGame.FreeGameTime;
        // }
        // if (beginGameMsg.data.RollerNumber === 1 && beginGameMsg.data.FreeGameSpin.FreeGameTime === 0) {
        //     GTMEvent.shared.CORE_GAME_FG_END(this._freeGameCountForGTM);
        // }
        //---------------【奪寶奇喵沒有slotGame的免費遊戲邏輯】---------------

        commonStore.storeMutation.setData('gameStatus', GameStatus.OnGetBeginGameResult);//【公版】獲得遊戲下注結果
        await this.reelController.waitSpinDown();//等待盤面symbol下移清除完畢
        commonStore.storeMutation.setData('credit', beginGameMsg.data.credit);//更新餘額
        // console.log("確認盤面清除")
        await this.mainController.handleBeginGame(beginGameMsg, jackpotMsg);//處理遊戲下注結果
        commonStore.storeMutation.setData('gameStatus', GameStatus.OnReady);// 遊戲狀態設成 onReady

    }

    /**
     * 收到 onUpdateJP 要做的事
     * @param msg 
     */
    private onUpdateJP(msg: updateJPData): void {
        Logger.debug('收到jackpot更新訊息:', JSON.stringify(msg));
    }

    /**
     * 收到 CreditExchange 換分結果要做的事
     * @param msg 
     */
    private onCreditExchange(msg: onCreditExchange): void {
        Logger.debug('onCreditExchange:', JSON.stringify(msg));
        commonStore.storeMutation.setData('balance', msg.data.balance);
        commonStore.storeMutation.setData('credit', msg.data.credit);
        if (this._patternExchangeCallback) {
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnReady);//【公版】準備spin狀態
            this._patternExchangeCallback(msg.event);
        }
    }

    /**
     * 收到 Disconnect 斷線要做的事
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
     * 收到 GetMachineDetail 通知取得機台資料
     * @param msg 
     */
    private onGetMachineDetail(msg: onGetMachineDetail): void {
        Logger.debug('onGetMachineDetail: ', JSON.stringify(msg));

        // 設置【公版】機台資料
        if (msg.data.event) {
            commonStore.storeMutation.setData('currency', msg.data.currency);
            commonStore.storeMutation.setData('balance', msg.data.balance);
            commonStore.storeMutation.setData('base', msg.data.base);
            commonStore.storeMutation.setData('defaultBase', msg.data.defaultBase);
            commonStore.storeMutation.setData('credit', msg.data.credit);
            commonStore.storeMutation.setData('betbase', msg.data.betBase);
            // commonStore.storeMutation.setData('wagersID', msg.data.wagersID.toString());
        }
        getEventManager().emit(Comm.SHOW_EXCHANGE_PAGE);//通知【公版】開換分UI
    }
    //==================【接收server訊息】==================


    //==================【接收公版事件/發送訊息給server】==================
    /**
     * 收到【公版】spin事件
     * @param betRate 押注倍率
     */
    public spin() {
        Logger.debug('收到spin...');
        this.reelController.handleSpinDown();//處理當spin按下時
        this.setting.hideFakePanel();
        const fakeData = this.setting.runFakeData();
        if (fakeData) {
            this.onBeginGame(fakeData);
        } else {
            //這款前端送betCredit時需要乘以押注倍率(購買免費遊戲時的押注倍率會不一樣)
            const betRate = getG5279Model().getBetRate();//獲得押注倍率
            const betCredit = NumberUtils.accMul(commonStore.storeState.bet, betRate);
            Logger.debug('下注額度', betCredit, '下注狀態', getG5279Model().betState);
            g5279Connector.callBeginGame(betCredit, getG5279Model().betState);
        }
    }

    /**
     * 收到【公版】確認購買免費遊戲事件
     */
    private onBuyFreeGameSpin(): void {
        Logger.debug('確認購買免費遊戲');
        this.spin();

        //恢復下注狀態
        getEventManager().emit('updateBetState', G5279BetState.NORMAL);
    }

    /**
     * 收到【公版】停止spin事件(奪寶奇喵沒有立即停止)
     */
    // public stopSpin(): void {
    //     Logger.debug('收到stopSpin...');
    //     // this.controller.forceStop();//立即停止
    // }

    /**
     * 收到【公版】通知準備開啟換分面板
     */
    private onPrepareExchange(): void {
        g5279Connector.callGetMachineDetail();
        // SlotGameConnector.shared.callGetMachineDetail();
    }

    /**
     * 收到【公版】通知存玩家換分設定
     */
    private onCallStoreExrecord(): void {
        g5279Connector.callStoreExREcord();
        // SlotGameConnector.shared.callStoreExREcord();
    }

    /**
     * 收到【公版】換分事件
     * @param exchange 換分
     * @param callback 換分完成後的callback
     */
    private async exchangeCredit(msg: any): Promise<void> {
        Logger.debug('收到公版換分exchangeCredit: ', JSON.stringify(msg));
        const { exchangeCredit, callback } = msg;//換分數值，是否手動換分
        const base: string = commonStore.storeState.base;
        this._patternExchangeCallback = callback;
        //換分額度大於0才執行換分
        if (exchangeCredit !== 0) {
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnNotEnough);//【公版】下注額不夠(換分狀態)
            g5279Connector.callCreditExchange(base, exchangeCredit.toString());
            // SlotGameConnector.shared.callCreditExchange(base, exchangeCredit.toString());
        }
        // 第一次進入遊戲，判斷是否遊戲開始spin
        if (this._isFirstInGame) this.firstOnReady();
    }

    /**
     * 收到【公版】按鈕事件，播放音效
     * @param type 
     */
    private onCommBtnClick(param: { type: GTLoaderButtonType }): void {
        getAudioManager().playOnceSound(G5279AudioName.btnClick);
        // 透過設置面板關閉時(關閉換分介面)，需要檢測是否第一次進入遊戲，判斷是否遊戲開始spin
        if ((param.type === GTLoaderButtonType.settingPanelCloseBtn) && this._isFirstInGame) {
            this.firstOnReady();
        }
    }

    /**
     * 第一次進入遊戲，判斷是否遊戲開始spin
     */
    private async firstOnReady() {
        this._isFirstInGame = false;//設置為非第一次進入遊戲
        await awaitNextTick();
        commonStore.storeMutation.setData('gameStatus', GameStatus.OnReady);//【公版】準備spin狀態
    }
    //==================【接收公版事件/發送訊息給server】==================
}