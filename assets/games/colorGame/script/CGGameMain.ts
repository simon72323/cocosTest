import { AutoPlayAnim } from '@common/components/AutoPlayAnim';
import boot from '@common/h5GameTools/Boot';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { Comm, Game, GTAlertPram, GTAlertType } from '@common/h5GameTools/GTCommEvents';
import { GameStatus } from '@common/h5GameTools/State';
import { getAudioManager } from '@common/manager/AudioManager';
import { getEventManager } from '@common/manager/EventManager';
import { LanguageManager } from '@common/manager/LanguageManager';
import { Logger } from '@common/utils/Logger';
import { urlHelper } from '@common/utils/UrlHelper';
import { WorkOnBlurManager } from '@common/utils/WorkOnBlurManager';
import { WorkTimerManager } from '@common/utils/WorkTimerManager';
import { _decorator, Camera, CCBoolean, Component, director, find } from 'cc';



import { colorGameConnector } from '@/games/colorGame/script/connector/CGGameConnector';
import { SlotGameEvent } from '@/games/colorGame/script/connector/CGSlotGameEvent';

import { CGController } from '@/games/colorGame/script/controller/CGController';
import { loadInfo } from '@/games/colorGame/script/enum/CGInterface';


import { CGAudioName } from '@/games/colorGame/script/manager/CGAudioName';
import { CGPathManager } from '@/games/colorGame/script/manager/CGPathManager';


const { ccclass, property } = _decorator;
@ccclass('CGGameMain')
export class CGGameMain extends Component {
    @property(CCBoolean)
    public isSimulate: boolean = false;//模擬資料

    private _controller: CGController = null!;

    /** 確保相關組件被打包 */
    private ensureDependencies() {
        // 這個方法永遠不會被調用，只是為了建立依賴關係
        return {
            script: AutoPlayAnim
        };
    }

    protected async onLoad(): Promise<void> {
        //啟用後台運行(針對動畫、tween、schedule、spine等動畫)
        WorkOnBlurManager.getInstance();
        WorkTimerManager.getInstance();
        LanguageManager.loadLanguageBundle('colorGame');//設置語系資源(遊戲名稱)
        await CGPathManager.getInstance().init();//等待路徑加載完成
        commonStore.storeMutation.setData('gameStatus', GameStatus.OnGameInit);//初始化遊戲狀態
        this.setPublicConfig();//配置公版
        this._controller = this.node.getComponentInChildren(CGController)!;
        await this.linkWs();
        Logger.debug('GS連線成功...');
    }

    /**
     * 配置公版
     */
    private async setPublicConfig() {
        await boot();//執行這個公版才會讀到語系
        // 關閉公版slotGame公版按鈕
        getEventManager().emit(Comm.SET_PUBLIC_GAME_PANEL_SWITCH, {
            'controlPanelIsOpen': false,
            'userSettingPanelIsOpen': true,
            'bottomButtonPanelIsOpen': true
        });
        // 調整公版場景的環境配置
        director.getScene()!.scene.globals.postSettings.toneMappingType = 1;
        director.getScene()!.scene.globals.shadows.enabled = true;
        director.getScene()!.scene.globals.shadows.type = 1;
        director.getScene()!.scene.globals.shadows.maxReceived = 4;
        director.getScene()!.scene.globals.shadows.shadowMapSize = 1024;
        //調整公版Canvas的攝影機可見層參數
        const Camera2D = find('Canvas/Camera');
        Camera2D!.getComponent(Camera)!.visibility = 33554432;

        // 註冊serverConnector監聽事件
        getEventManager().on(SlotGameEvent.LOGIN, this.onLogIn.bind(this));
        getEventManager().on(SlotGameEvent.LOAD_INFO, this.onLoadInfo.bind(this));
        getEventManager().on(SlotGameEvent.JOIN_GAME, this.onJoinGame.bind(this));
        getEventManager().on(SlotGameEvent.CLOSE, this.onDisconnect.bind(this));
        getEventManager().on(SlotGameEvent.UPDATE, this.onUpdate.bind(this));
        getEventManager().on(SlotGameEvent.PLAYER, this.onPlayer.bind(this));
        getEventManager().on(SlotGameEvent.UPDATE_CREDIT, this.onUpdateCredit.bind(this));
        //監聽spin事件(公版告知下注成功)
        // 註冊公版事件
        getEventManager().on(Game.EXCHANGE_CREDIT, this.exchangeCredit.bind(this));// 換分按鈕事件
        getEventManager().on(Comm.LOADER_BUTTON_CLICK, this.onCommBtnClick.bind(this)); // 公版按鈕通知
        getEventManager().on(Comm.PREPARE_EXCHANGE, this.onPrepareExchange.bind(this)); // 公版開啟換分介面通知
        getEventManager().on(Comm.CALL_STORE_EXRECORD, this.onCallStoreExRecord.bind(this)); // 公版通知儲存換分
        // useGlobalGTEventDispatcher().addEventListener(Game.SPIN, this.onSpinBet.bind(this));//公版告知下注成功
    }

    protected onDestroy(): void {
        getEventManager().off(SlotGameEvent.LOAD_INFO, this.onLoadInfo.bind(this));
        getEventManager().off(SlotGameEvent.JOIN_GAME, this.onJoinGame.bind(this));
        getEventManager().off(SlotGameEvent.CLOSE, this.onDisconnect.bind(this));
        getEventManager().off(SlotGameEvent.UPDATE, this.onUpdate.bind(this));
        getEventManager().off(SlotGameEvent.PLAYER, this.onPlayer.bind(this));
        getEventManager().off(SlotGameEvent.UPDATE_CREDIT, this.onUpdateCredit.bind(this));
        //移除公版監聽事件
        getEventManager().off(Game.EXCHANGE_CREDIT, this.exchangeCredit.bind(this));// 換分按鈕事件
        getEventManager().off(Comm.LOADER_BUTTON_CLICK, this.onCommBtnClick.bind(this)); // 公版按鈕通知
        getEventManager().off(Comm.PREPARE_EXCHANGE, this.onPrepareExchange.bind(this)); // 公版開啟換分介面通知
        getEventManager().off(Comm.CALL_STORE_EXRECORD, this.onCallStoreExRecord.bind(this)); // 公版通知儲存換分
        // useGlobalGTEventDispatcher().removeEventListener(Game.SPIN, this.onSpinBet.bind(this));//公版告知下注成功
    }

    //模擬斷線
    // private stopConnect() {
    //     CGGameConnector.getInstance().closeConnect();//斷線
    // }

    //==================【server訊息】==================
    /**
     * GS連線
     */
    private async linkWs(): Promise<void> {
        Logger.debug('與GS連線...');
        if (colorGameConnector.wsIsDisConnect) {
            await colorGameConnector.reconnect();
        } else {
            await colorGameConnector.connect();
        }
    }

    private onLogIn(msg: any) {
        Logger.debug('接收到server登入訊息', JSON.stringify(msg));
        commonStore.storeMutation.setData('userID', msg.data.UserID);
        commonStore.storeMutation.setData('hallID', msg.data.HallID);
    }

    //收到登入訊息
    private async onLoadInfo(msg: loadInfo) {
        Logger.debug('接收到server登入訊息', JSON.stringify(msg));
        this._controller.handleLoadInfo(msg);

        // set config data
        commonStore.storeMutation.setData('currency', msg.data.Currency);
        commonStore.storeMutation.setData('userName', msg.data.LoginName);
        commonStore.storeMutation.setData('balance', msg.data.Balance);
        commonStore.storeMutation.setData('base', msg.data.Base);
        // commonStore.storeMutation.setData('betCreditList', msg.data.BetCreditList);//ColorGame不用設這個值，不然BET會被初始化為0.1
        commonStore.storeMutation.setData('credit', commonStore.storeState.customConfig.canExchange ? msg.data.Credit : msg.data.Balance);
        commonStore.storeMutation.setData('defaultBase', msg.data.DefaultBase);
        commonStore.storeMutation.setData('userAutoExchange', msg.data.UserAutoExchange);
        commonStore.storeMutation.setData('BetBase', msg.data.BetBase);
        commonStore.storeMutation.setData('SingleBet', msg.data.SingleBet);
        commonStore.storeMutation.setData('autoExchange', msg.data.UserAutoExchange.IsAuto);
        commonStore.storeMutation.setData('exchangeCredit', msg.data.UserAutoExchange.Credit);
        // commonStore.storeMutation.setData('isCash', msg.data.isCash);
        // commonStore.storeMutation.setData('defaultBetCredit', msg.data.DefaultBetCredit);
        // commonStore.storeMutation.setData('Rates', msg.data.DefaultBetCredit);
        // commonStore.storeMutation.setData('userSetting', msg.data.userSetting);

        //追加設置
        commonStore.storeMutation.setData('exchangeAll', msg.data.UserAutoExchange.Credit === -1);
        if (urlHelper.isDemo) {
            commonStore.storeMutation.setData('autoExchange', true);
            commonStore.storeMutation.setData('exchangeCredit', -1);
            commonStore.storeMutation.setData('exchangeAll', true);
        }

        getEventManager().emit(Comm.SHOW_EXCHANGE_PAGE);//開啟兌換分數介面
        //告知公版設定按鈕與換分按鈕不受spin控制
        getEventManager().emit(Comm.SET_ONREADY_SPIN_BTN_INTERACTABLE, {
            settingPanelBtn: true,
            exchangeBtn: true
        });
        commonStore.storeMutation.setData('gameStatus', GameStatus.OnGameSetupReady);//跟公版說遊戲準備好了
    }

    /**
     * 收到加入遊戲訊息
     * @param msg 
     */
    private onJoinGame(msg: any) {
        Logger.debug('接收到server加入遊戲訊息', JSON.stringify(msg));
        this._controller.handleJoinGame(msg);//處理加入遊戲訊息
    }

    /**
     * 收到更新訊息
     * @param msg 
     */
    private onUpdate(msg: any) {
        this._controller.handleUpdate(msg);//處理更新訊息
    }

    /**
     * 收到玩家訊息
     * @param msg 
     */
    private onPlayer(msg: any) {
        this._controller.handlePlayer(msg);//處理玩家訊息
    }

    /**
     * 收到更新Credit訊息
     * @param msg 
     */
    private onUpdateCredit(msg: any) {
        this._controller.handleUpdateCredit(msg);//處理更新Credit訊息
    }
    //==================【接收server訊息】==================


    //==================【接收公版事件/發送訊息給server】==================
    /**
     * 收到斷線要做的事
     */
    private onDisconnect(_obj: Object): void {
        colorGameConnector.wsIsDisConnect = true;//斷線
        const alert: GTAlertPram = {
            type: GTAlertType.RECONNECT,
            title: commonStore.storeState.i18n.SYSTEM_MESSAGE,
            content: commonStore.storeState.i18n.DISCONNECT,
            cancelBtnText: null!,
            confirmBtnText: commonStore.storeState.i18n.RECONNECT,
            cancelCallback: () => {
            },
            confirmCallback: () => {
                getEventManager().emit(Game.RESTART_GAME);//呼叫公版重新連線
            }
        };
        getEventManager().emit(Comm.SHOW_ALERT, alert);
    }

    /**
     * 收到公版通知準備開啟換分面板
     */
    private async onPrepareExchange(): Promise<void> {
        Logger.debug('接收到公版通知準備開啟換分面板');
        const msg: any = await colorGameConnector.callGetMachineDetail();
        if (msg.data.event) {
            commonStore.storeMutation.setData('balance', msg.data.Balance);
        }
        //通知公版開換分介面
        getEventManager().emit(Comm.SHOW_EXCHANGE_PAGE);
    }

    /**
     * 收到公版通知儲存換分
     */
    private onCallStoreExRecord(_msg: any) {
        colorGameConnector.callStoreExREcord();
    }

    /**
     * 換洗分
     * @param exchange 換分
     * @param callback 換分完成後的callback
     */
    private async exchangeCredit(msg: any): Promise<void> {
        const { exchangeCredit, callback } = msg;//換分數值，是否手動換分
        //換分額度不等於於0才執行換分(-1等於全額兌換)
        if (exchangeCredit !== 0) {
            const msg: any = await colorGameConnector.callCreditExchange(exchangeCredit);
            //有換分成功才執行
            if (msg.event) {
                callback?.(true);
                Logger.debug('換分完成...');
                this._controller.handleCreditExchange(msg);
            } else {
                Logger.debug('換分失敗...');
                //通知公版開換分介面
                this.onPrepareExchange();//重新開啟換分介面
            }
        }
    }

    /**
     * 處理下注(傳送給server)
     * @param betCredits 各注區新增押注額
     */
    // private async onSpinBet() {
    //     this._controller.onBetCount++;//等待押注回傳數量+1
    //     const betInfos = CGUtils.arrayToBetInfo(this._controller.betCredits);//目前押注注區資料轉換成BetInfo格式
    //     const beginGameMsg: any = await CGGameConnector.getInstance().callBeginGame(betInfos);//傳送押注資料
    //     this._controller.onBetCount--;//等待押注回傳數量-1(回傳成功)
    //     this._controller.handleBeginGame(beginGameMsg);
    // }

    /**
     * 收到公版按鈕事件，播放音效
     * @param type 
     */
    private onCommBtnClick(): void {
        getAudioManager().playOnceSound(CGAudioName.BtnOpen);
    }
    //==================【接收公版事件/發送訊息給server】==================
}