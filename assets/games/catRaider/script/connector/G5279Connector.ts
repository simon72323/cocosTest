import { AESCrypto } from '@common/core/crypto/AESCrypto';
import { WebSocketCore } from '@common/core/network/WebSocketCore';
import { WebSocketEvent } from '@common/core/network/WebSocketEvent';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { Comm, GTAlertType } from '@common/h5GameTools/GTCommEvents';
import { loadingInfo, TimeLabelKeys } from '@common/h5GameTools/userAnalysis/LoadingInfo';
import { getEventManager } from '@common/manager/EventManager';
import { DetectDevice } from '@common/utils/DetectDevice';
import { Logger } from '@common/utils/Logger';
import { urlHelper } from '@common/utils/UrlHelper';
import { _decorator } from 'cc';

import { SlotConnectorEvent } from '@/games/catRaider/script/connector/G5279ConnectorEvent';


const { ccclass } = _decorator;

@ccclass('G5279Connector')
export class G5279Connector {
    private static _instance: G5279Connector | null = null;
    private wsCore: WebSocketCore = null!;
    private closeConnectionByUser: boolean = false;
    private useEncryption: boolean = false;
    // private eventEmitter: EventManager = null!

    private _wsIsDisConnect: boolean = false; // 是否斷線
    public get wsIsDisConnect(): boolean {
        return this._wsIsDisConnect;
    }

    public set wsIsDisConnect(value: boolean) {
        this._wsIsDisConnect = value;
    }

    private constructor() {
        this.init();
    }

    public static getInstance(): G5279Connector {
        if (!G5279Connector._instance) {
            G5279Connector._instance = new G5279Connector();
        }
        return G5279Connector._instance;
    }

    /**
     * 初始化 WebSocket 連接
     * 設置協議並綁定狀態處理器
     */
    init() {
        this.wsCore = new WebSocketCore();
        // this.wsCore.setupWs({
        //     protocolMap: {
        //         BINARY: 'casino.bin',
        //         STRING: 'casino.op'
        //     }
        // });
        //監聽連線變化
        this.wsCore.on(WebSocketEvent.NETWORK_STATUS, (e: any) => this.wsStatusHandler(e));
    }

    /**
     * WebSocket 狀態處理器
     * 處理連接、斷開等狀態變化
     */
    wsStatusHandler(event: any) {
        Logger.log(`[NetStatus]::${event.status}`);
        switch (event.status) {
            case 'open':
                loadingInfo.push(TimeLabelKeys.WS);
                getEventManager().emit(SlotConnectorEvent.CONNECTED, { event: true });
                this.wsCore.on(WebSocketEvent.NETWORK_RESULT, (e: any) => this.wsResultHandler(e));
                this.callLogin();//新架構變成前端登入後要先傳login
                break;
            case 'error':
            case 'close':
                Logger.log('Disconnected, try again.');
                this.wsCore.off(WebSocketEvent.NETWORK_RESULT);
                this.dispatchDisconnectEvent();
                break;
        }
    }

    /**
     * WebSocket 結果處理器
     * 處理從伺服器接收到的消息
     */
    wsResultHandler(event: any) {
        const eventData = event.result;
        //過濾網路狀態消息
        if (eventData && eventData.NetStatusEvent) {
            Logger.debug('[NetStatusEvent]', eventData);
            return;
        }
        this.dispatchConnectorEvent(eventData);
    }

    /**
     * 處理斷開連接事件
     * 如果由用戶主動關閉連接，則退出遊戲
     */
    dispatchDisconnectEvent() {
        if (this.closeConnectionByUser) {
            urlHelper.exitGame();
            return;
        }
        getEventManager().emit(SlotConnectorEvent.CLOSE, { manual: false });
    }

    /**
     * 分發事件
     * 觸發事件並處理相關邏輯
     */
    dispatchConnectorEvent(eventData: any) {
        getEventManager().emit(eventData.action, eventData);
        if (eventData.errorCode || eventData.data?.errorCode) {
            this.handleConnectorFailEvent(eventData);
        }
    }

    /**
     * 處理連接器失敗事件
     * 顯示錯誤提示並處理錯誤
     */
    handleConnectorFailEvent(eventData: any) {
        const data = eventData.data;
        Logger.warn(`[SlotConnector] handleConnectorFailEvent [${eventData.action}]`, data);
        this.showErrorAlert({ message: data.message, errCode: data.errorCode, traceID: data.traceID });
    }

    /**
     * 顯示錯誤提示
     * 處理錯誤並觸發退出遊戲
     */
    showErrorAlert(param: any) {
        const { message, errCode, traceID, exitGame = true } = param;
        let content = commonStore.i18n[errCode];
        const addStr = traceID ? `(${errCode},${traceID})` : `(${errCode})`;
        if (String(content) !== String(errCode)) {
            content += addStr;
        } else if (errCode) {
            content = message + addStr;
        }

        getEventManager().emit(Comm.SHOW_ALERT, {
            type: exitGame ? GTAlertType.ERROR : GTAlertType.BASIC_NONE,
            title: commonStore.i18n.SYSTEM_MESSAGE,
            content,
            cancelBtnText: '',
            confirmBtnText: '',
            cancelCallback: () => {
                if (exitGame) {
                    urlHelper.exitByError(message);
                }
            }
        });
    }

    /**
     * 連接 WebSocket
     * 返回 Promise 以處理連接過程
     */
    connect(_wsHost?: any) {
        return new Promise<void>(async (resolve, reject) => {
            const domain = location.origin;
            const domainUrl = new URL(domain);
            const wsPath = `wss://ws.${domainUrl.hostname}/slotgo`;
            Logger.log(`[SlotGameConnector] >> Start connect to :${wsPath} , sid:${urlHelper.sid} `);
            if (this.useEncryption) {
                this.wsCore.setupWs({
                    useCrypto: new AESCrypto('OTNlODQ0YTkzNGQ3MWU4ODY3Yjg3NWI4NjVkN2U0ODcuODMwMGU1YjQ5MTdjMjhmNw')
                });
            }
            this.wsCore.connect(wsPath);
            getEventManager().once(SlotConnectorEvent.CONNECTED, () => resolve());
            getEventManager().once(SlotConnectorEvent.CLOSE, () => reject());
        });
    }

    /**
     * 重新連接 WebSocket
     * 返回 Promise 以處理重新連接過程
     */
    reconnect() {
        return new Promise<void>(async (resolve, reject) => {
            this.wsCore.reconnect();
            getEventManager().once(SlotConnectorEvent.CONNECTED, () => resolve());
            getEventManager().once(SlotConnectorEvent.CLOSE, () => reject());
        });
    }

    /**
     * 關閉 WebSocket 連接
     * 處理退出遊戲邏輯
     */
    close() {
        this.callLeaveMachine();//呼叫斷線會自動離開機器
        this.closeConnectionByUser = true;
        this.wsCore.close();
    }

    /**
     * 設置 WebSocket 配置
     * 處理加密設置
     */
    setupWs(param: any) {
        this.wsCore.setupWs(param);
        param.useEncryption !== void 0 && (this.useEncryption = param.useEncryption);
    }

    //=================CallServer=================
    /**
     * 等待 API 結果
     * 返回 Promise 以等待特定事件的結果
     */
    async awaitApiResult(eventName: any) {
        return await new Promise(resolve => {
            getEventManager().once(eventName, (e: any) => { resolve(e); });
        });
    }

    /**
     * 獲取遊戲資訊
     * 調用伺服器方法並等待結果
     */
    async callLoadInfo() {
        this.wsCore.callServer({
            action: SlotConnectorEvent.LOAD_INFO,
            gameType: parseInt(urlHelper.gameType)
        });
        const data = await this.awaitApiResult(SlotConnectorEvent.LOAD_INFO);
        loadingInfo.push(TimeLabelKeys.LOAD_INFO);
        return data;
    }

    /**
     * 獲取遊戲資訊
     * 調用伺服器方法並等待結果
     */
    // async callJoinGame() {
    //     this.wsCore.callServer({
    //         action: 'joinGame',
    //         gameType: parseInt(UrlHelper.shared.gameType)
    //     });
    //     const data = await this.awaitApiResult('joinGame' /* JOIN_GAME */);
    //     // loadingInfo.push(TimeLabelKeys.joinGame);
    //     return data;
    // }

    /**
     * 登入
     * 調用伺服器方法並等待結果
     */
    async callLogin() {
        const param = {
            action: SlotConnectorEvent.LOGIN,
            data: {
                sid: urlHelper.sid,
                // sid: '964b9bb9-bf45-421f-92d6-06be5fce2dff',
                lang: urlHelper.lang,
                gameType: parseInt(urlHelper.gameType),
                dInfo: DetectDevice.getDeviceInfo()
            }
        };
        // UrlHelper.shared.hallId && (param.hallID = UrlHelper.shared.hallId);
        // UrlHelper.shared.userId && (param.userID = UrlHelper.shared.userId);
        this.wsCore.callServer(param);
        const data = await this.awaitApiResult(SlotConnectorEvent.LOGIN);
        loadingInfo.push(TimeLabelKeys.LOGIN);
        return data;
    }

    /**
     * 獲取機器詳細資訊
     * 調用伺服器方法並等待結果
     */
    async callGetMachineDetail() {
        loadingInfo.push(TimeLabelKeys.MACHINE_DETAIL_START);
        this.wsCore.callServer({
            action: SlotConnectorEvent.GET_MACHINE_DETAIL
        });
        const data = await this.awaitApiResult(SlotConnectorEvent.GET_MACHINE_DETAIL);
        loadingInfo.push(TimeLabelKeys.MACHINE_DETAIL_END);
        return data;
    }

    /**
     * 離開機器
     * 調用伺服器方法並等待結果
     */
    async callLeaveMachine() {
        this.wsCore.callServer({
            action: SlotConnectorEvent.MACHINE_LEAVE
        });
        const data = await this.awaitApiResult(SlotConnectorEvent.MACHINE_LEAVE);
        loadingInfo.push(TimeLabelKeys.TAKE_MACHINE);
        return data;
    }

    /**
     * 雙倍遊戲
     * 調用伺服器方法並等待結果
     */
    async callDoubleGame(wagersID: any) {
        this.wsCore.callServer({
            action: SlotConnectorEvent.DOUBLE_GAME,
            sid: urlHelper.sid,
            wagersID
        });
        return this.awaitApiResult(SlotConnectorEvent.DOUBLE_GAME);
    }

    /**
     * 開始遊戲
     * 調用伺服器方法並等待結果
     */
    async callBeginGame(betCredit: number, betType: string) {
        this.wsCore.callServer({
            action: SlotConnectorEvent.BEGIN_GAME,
            gameType: parseInt(urlHelper.gameType),
            data: {
                betInfo: {
                    betCredit,
                    betType
                }
            }
        });
        return this.awaitApiResult(SlotConnectorEvent.BEGIN_GAME);
    }

    /**
     * 換分
     * 調用伺服器方法並等待結果
     */
    async callCreditExchange(rate: any, credit: any) {
        this.wsCore.callServer({
            action: SlotConnectorEvent.CREDIT_EXCHANGE,
            gameType: parseInt(urlHelper.gameType),
            data: {
                rate,
                credit
            }

        });
        return this.awaitApiResult(SlotConnectorEvent.CREDIT_EXCHANGE);
    }

    /**
     * 換錢
     * 調用伺服器方法並等待結果
     */
    async callBalanceExchange() {
        this.wsCore.callServer({
            action: SlotConnectorEvent.BALANCE_EXCHANGE
        });
        return this.awaitApiResult(SlotConnectorEvent.BALANCE_EXCHANGE);
    }

    /**
     * 保持機器狀態
     * 調用伺服器方法並等待結果
     */
    async callKeepMachineStatus() {
        this.wsCore.callServer({
            action: SlotConnectorEvent.KEEP_MACHINE_STATUS,
            sid: urlHelper.sid
        });
        return this.awaitApiResult(SlotConnectorEvent.KEEP_MACHINE_STATUS);
    }

    /**
     * 結束遊戲
     * 調用伺服器方法並等待結果
     */
    async callEndGame(wagersID: any, creditEnd: any) {
        if (creditEnd != null) {
            this.dispatchConnectorEvent({
                eventName: SlotConnectorEvent.END_GAME,
                event: true,
                data: { Credit: creditEnd }
            });
        } else {
            this.wsCore.callServer({
                action: SlotConnectorEvent.END_GAME,
                sid: urlHelper.sid,
                wagersID
            });
            return this.awaitApiResult(SlotConnectorEvent.END_GAME);
        }
    }

    /**
     * 更新用戶分析
     * 調用伺服器方法
     */
    callUpdateUserAnalysis(_data: any) {
        this.wsCore.callServer({
            action: SlotConnectorEvent.UPDATE_USER_ANALYSIS
        });
    }

    /** 儲存換分記錄 */
    async callStoreExREcord(data?: any) {
        const useData = data != null ? data : {
            autoEx: commonStore.storeState.autoExchange,
            autoValue: commonStore.storeState.exchangeAll ? -1 : commonStore.storeState.exchangeCredit,
            autoRate: commonStore.storeState.base,
            lastInput: commonStore.storeState.exchangeRecord
        };
        this.wsCore.callServer({
            action: SlotConnectorEvent.SAVE_USER_AUTO_EXCHANGE,
            exchangeRecord: useData
        });
        return this.awaitApiResult(SlotConnectorEvent.SAVE_USER_AUTO_EXCHANGE);
    }
}

export const g5279Connector = G5279Connector.getInstance();