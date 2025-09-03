import { AESCrypto } from '@common/core/crypto/AESCrypto';
import { WebSocketCore } from '@common/core/network/WebSocketCore';
import { WebSocketEvent } from '@common/core/network/WebSocketEvent';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { Comm, GTAlertType } from '@common/h5GameTools/GTCommEvents';
import { getEventManager } from '@common/manager/EventManager';
import { DetectDevice } from '@common/utils/DetectDevice';
import { Logger } from '@common/utils/Logger';
import { urlHelper } from '@common/utils/UrlHelper';

import { loadingInfo, TimeLabelKeys } from '@/common/h5GameTools/userAnalysis/LoadingInfo';


/**
 * 老虎机游戏事件枚举
 */
export enum SlotGameEvent {
    CLOSE = 'slotGameEvent_close',
    CONNECTED = 'slotGameEvent_connected',
    RECONNECTED = 'slotGameEvent_reconnected',
    READY = 'slotGameEvent_ready',
    UPDATE_JP = 'slotGameEvent_updateJP',
    UPDATE_MARQUEE = 'slotGameEvent_updateMarquee',
    LOGIN = 'slotGameEvent_onLogin',
    TAKE_MACHINE = 'slotGameEvent_onTakeMachine',
    LOAD_INFO = 'slotGameEvent_onOnLoadInfo2',
    GET_MACHINE_LIST = 'slotGameEvent_onGetMachineList',
    GET_MACHINE_DETAIL = 'slotGameEvent_onGetMachineDetail',
    CREDIT_EXCHANGE = 'slotGameEvent_onCreditExchange',
    BALANCE_EXCHANGE = 'slotGameEvent_onBalanceExchange',
    HIT_JACKPOT = 'slotGameEvent_onHitJackpot',
    BEGIN_GAME = 'slotGameEvent_onBeginGame',
    DOUBLE_GAME = 'slotGameEvent_onDoubleGame',
    END_GAME = 'slotGameEvent_onEndGame',
    HIT_BONUS = 'slotGameEvent_onHitBonus',
    END_BONUS = 'slotGameEvent_onEndBonus',
    KEEP_MACHINE_STATUS = 'slotGameEvent_onKeepMachineStatus',
    MACHINE_LEAVE = 'slotGameEvent_machineLeave',
    ON_ERROR = 'slotGameEvent_onError',
    SAVE_USER_AUTO_EXCHANGE = 'slotGameEvent_onSaveUserAutoExchange'
}

/**
 * 事件参数接口
 */
interface EventParam {
    eventName: string;
    event: boolean;
    data?: any;
}

/**
 * 错误提示参数接口
 */
interface ErrorAlertParam {
    message: string;
    errorKey?: string;
}

/**
 * WebSocket 设置参数接口
 */
interface WsSetupParam {
    protocolMap?: {
        BINARY: string;
        STRING: string;
    };
    useCrypto?: AESCrypto;
    useEncryption?: boolean;
}

/**
 * 游戏开始参数接口
 */
interface BeginGameParam {
    [key: string]: any;
}

/**
 * 老虎机游戏连接器
 */
export class SlotGameConnector {
    public wsCore: WebSocketCore = null!;
    private closeConnectionByUser: boolean = false;
    private useEncryption: boolean = false;
    private static _instance: SlotGameConnector | null = null;

    constructor() {
        this.init();
    }

    /**
     * 获取共享实例
     */
    static getInstance(): SlotGameConnector {
        if (!SlotGameConnector._instance) {
            SlotGameConnector._instance = new SlotGameConnector();
        }
        return SlotGameConnector._instance;
    }

    /**
     * 获取 WebSocket 断开状态
     */
    get wsIsDisConnect(): boolean {
        // 暂时返回 false，需要根据实际的 WebSocketCore 实现来调整
        return false;
    }

    /**
     * 初始化
     */
    private init(): void {
        this.wsCore = new WebSocketCore();
        this.wsCore.setupWs({
            protocolMap: {
                BINARY: 'casino.bin',
                STRING: 'casino.op'
            }
        });
        this.wsCore.on(WebSocketEvent.NETWORK_STATUS, (e: any) => this.wsStatusHandler(e));
    }

    /**
     * 获取事件分发器
     */
    // private getEventDispatcher(): EventManager {
    //     return getEventManager().getInstance();
    // }

    /**
     * WebSocket 状态处理器
     */
    private wsStatusHandler(event: any): void {
        Logger.log(`[NetStatus]::${event.status}`);
        switch (event.status) {
            case 'open':
                loadingInfo.push(TimeLabelKeys.WS);
                getEventManager().emit(SlotGameEvent.CONNECTED, { event: true });
                this.wsCore.on(WebSocketEvent.NETWORK_RESULT, (e: any) => this.wsResultHandler(e));
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
     * WebSocket 结果处理器
     */
    private wsResultHandler(event: any): void {
        const eventResult = event.result;
        if (eventResult?.NetStatusEvent) {
            Logger.debug('[NetStatusEvent]', eventResult);
            return;
        }

        if (eventResult?.action) {
            const eventParam: EventParam = {
                eventName: `slotGameEvent_${eventResult.action}`,
                event: true
            };

            if (!eventResult.result) {
                this.dispatchConnectorEvent(eventParam);
                return;
            }

            if (eventResult.result.event == null) {
                if (eventResult.result.error != null && eventResult.result.error != '' || eventResult.result.falutCode != null) {
                    eventParam.event = false;
                } else {
                    eventParam.event = true;
                }
            } else {
                eventParam.event = eventResult.result.event;
            }

            if (eventResult.result.data == null) {
                eventParam.data = eventResult.result;
            } else {
                eventParam.data = eventResult.result.data;
            }

            if (eventResult.data) {
                eventParam.data = eventResult.data;
            }

            this.dispatchConnectorEvent(eventParam);
        }
    }

    /**
     * 分发断开连接事件
     */
    private dispatchDisconnectEvent(): void {
        if (this.closeConnectionByUser) {
            urlHelper.exitGame();
            return;
        }
        getEventManager().emit(SlotGameEvent.CLOSE, { manual: false });
    }

    /**
     * 分发连接器事件
     */
    private dispatchConnectorEvent(eventObject: EventParam): void {
        getEventManager().emit(eventObject.eventName, {
            data: eventObject.data,
            event: eventObject.event
        });

        if (eventObject.event) {
            switch (eventObject.eventName) {
                case SlotGameEvent.READY:
                    this.callLoginBySid();
                    break;
                case SlotGameEvent.TAKE_MACHINE:
                    loadingInfo.push(TimeLabelKeys.TAKE_MACHINE);
                    this.callLoadInfo();
                    break;
            }
        } else {
            this.handleConnectorFailEvent(eventObject);
        }
    }

    /**
     * 处理连接器失败事件
     */
    private handleConnectorFailEvent(eventObject: EventParam): void {
        Logger.warn(`[SlotConnector] handleConnectorFailEvent [${eventObject.eventName}]`, eventObject.data);
        const errorDictString = eventObject.data?.error || eventObject.data?.errCode || 'SYSTEM_BUSY_55670144';
        const errorId = eventObject.data?.ErrorID;

        if (errorId) {
            switch (errorId) {
                case '5550000141':
                case '5554000510':
                case '5554000290':
                    this.showErrorAlert({
                        message: `${commonStore.i18n['DUPLICATE_ERROR']}（${errorDictString}）（${errorId}）`,
                        errorKey: 'DUPLICATE_ERROR'
                    });
                    break;
                default:
                    this.showErrorAlert({ message: errorDictString });
                    break;
            }
        } else {
            const showAlert = () => {
                if (errorDictString === 'ACCUMULATION_NOT_EXIST') {
                    this.showErrorAlert({
                        message: `${commonStore.i18n[errorDictString]}（${eventObject.data?.errCode}）`,
                        errorKey: errorDictString
                    });
                } else {
                    this.showErrorAlert({ message: errorDictString });
                }
            };

            switch (eventObject.eventName) {
                case SlotGameEvent.LOGIN:
                    showAlert();
                    break;
                case SlotGameEvent.TAKE_MACHINE:
                    showAlert();
                    break;
                case SlotGameEvent.CREDIT_EXCHANGE:
                    if (errorDictString !== 'TRANSFER_FAILED') this.callGetMachineDetail();
                    showAlert();
                    break;
                default:
                    showAlert();
                    break;
            }
        }
    }

    /**
     * 显示错误提示
     */
    private showErrorAlert(param: ErrorAlertParam): void {
        const { message, errorKey } = param;
        const content = commonStore.i18n[message] || message;

        getEventManager().emit(Comm.SHOW_ALERT, {
            type: GTAlertType.ERROR,
            title: commonStore.i18n['SYSTEM_MESSAGE'],
            content,
            cancelBtnText: '',
            confirmBtnText: '',
            cancelCallback: () => {
                urlHelper.exitByError(errorKey || message);
            }
        });
    }

    /**
     * 连接 WebSocket
     */
    async connect(wsHost?: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const wsPath = await urlHelper.getWsUrl(wsHost);
            Logger.log(`[SlotGameConnector] >> Start connect to :${wsPath} , sid:${urlHelper.sid} `);

            if (this.useEncryption) {
                this.wsCore.setupWs({
                    useCrypto: new AESCrypto('OTNlODQ0YTkzNGQ3MWU4ODY3Yjg3NWI4NjVkN2U0ODcuODMwMGU1YjQ5MTdjMjhmNw')
                });
            }

            this.wsCore.connect(wsPath);
            getEventManager().once(SlotGameEvent.CONNECTED, () => resolve());
            getEventManager().once(SlotGameEvent.CLOSE, () => reject());
        });
    }

    /**
     * 重新连接
     */
    async reconnect(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            this.wsCore.reconnect();
            getEventManager().once(SlotGameEvent.CONNECTED, () => resolve());
            getEventManager().once(SlotGameEvent.CLOSE, () => reject());
        });
    }

    /**
     * 关闭连接
     */
    close(): void {
        this.callLeaveMachine();
        this.closeConnectionByUser = true;
        this.wsCore.close();
    }

    /**
     * 设置 WebSocket
     */
    setupWs(param: WsSetupParam): void {
        this.wsCore.setupWs(param);
        if (param.useEncryption !== undefined) {
            this.useEncryption = param.useEncryption;
        }
    }

    /**
     * 等待 API 结果
     */
    async awaitApiResult(eventName: string): Promise<any> {
        return await new Promise(resolve => {
            getEventManager().once(eventName, (e: any) => {
                resolve(e);
            });
        });
    }

    /**
     * 调用 WebSocket
     */
    callWs(param: any): void {
        this.wsCore.callServer(param);
    }

    /**
     * 加载游戏信息
     */
    async callLoadInfo(): Promise<any> {
        this.wsCore.callServer({
            action: 'onLoadInfo2'
        });
        const result = await this.awaitApiResult(SlotGameEvent.LOAD_INFO);
        loadingInfo.push(TimeLabelKeys.LOAD_INFO);
        return result;
    }

    /**
     * 通过 SID 登录
     */
    async callLoginBySid(): Promise<any> {
        const param: any = {
            action: 'loginBySid',
            sid: urlHelper.sid,
            gtype: urlHelper.gameType,
            lang: urlHelper.lang,
            dInfo: DetectDevice.getDeviceInfo()
        };

        if (urlHelper.hallId) {
            param.hallID = urlHelper.hallId;
        }
        if (urlHelper.userId) {
            param.userID = urlHelper.userId;
        }

        this.wsCore.callServer(param);
        const result = await this.awaitApiResult(SlotGameEvent.LOGIN);
        loadingInfo.push(TimeLabelKeys.LOGIN);
        return result;
    }

    /**
     * 获取机器详情
     */
    async callGetMachineDetail(): Promise<any> {
        loadingInfo.push(TimeLabelKeys.MACHINE_DETAIL_START);
        this.wsCore.callServer({
            action: 'getMachineDetail'
        });
        const result = await this.awaitApiResult(SlotGameEvent.GET_MACHINE_DETAIL);
        loadingInfo.push(TimeLabelKeys.MACHINE_DETAIL_END);
        return result;
    }

    /**
     * 离开机器
     */
    async callLeaveMachine(): Promise<any> {
        this.wsCore.callServer({
            action: 'leaveMachine'
        });
        const result = await this.awaitApiResult(SlotGameEvent.MACHINE_LEAVE);
        return result;
    }

    /**
     * 双倍游戏
     */
    async callDoubleGame(wagersID: string): Promise<any> {
        this.wsCore.callServer({
            action: 'doubleGame',
            sid: urlHelper.sid,
            wagersID
        });
        return this.awaitApiResult(SlotGameEvent.DOUBLE_GAME);
    }

    /**
     * 开始游戏
     */
    async callBeginGame(param: BeginGameParam): Promise<any> {
        this.wsCore.callServer({
            action: 'beginGame4',
            ...param
        });
        return this.awaitApiResult(SlotGameEvent.BEGIN_GAME);
    }

    /**
     * 积分兑换
     */
    async callCreditExchange(rate: number, credit: number): Promise<any> {
        this.wsCore.callServer({
            action: 'creditExchange',
            rate,
            credit
        });
        return this.awaitApiResult(SlotGameEvent.CREDIT_EXCHANGE);
    }

    /**
     * 余额兑换
     */
    async callBalanceExchange(): Promise<any> {
        this.wsCore.callServer({
            action: 'balanceExchange'
        });
        return this.awaitApiResult(SlotGameEvent.BALANCE_EXCHANGE);
    }

    /**
     * 保持机器状态
     */
    async callKeepMachineStatus(): Promise<any> {
        this.wsCore.callServer({
            action: 'keepMachineStatus',
            sid: urlHelper.sid
        });
        return this.awaitApiResult(SlotGameEvent.KEEP_MACHINE_STATUS);
    }

    /**
     * 结束游戏
     */
    async callEndGame(wagersID: string, creditEnd?: number): Promise<any> {
        if (creditEnd != null) {
            this.dispatchConnectorEvent({
                eventName: SlotGameEvent.END_GAME,
                event: true,
                data: { Credit: creditEnd }
            });
        } else {
            this.wsCore.callServer({
                action: 'endGame',
                sid: urlHelper.sid,
                wagersID
            });
            return this.awaitApiResult(SlotGameEvent.END_GAME);
        }
    }

    /**
     * 更新用户分析
     */
    callUpdateUserAnalysis(data: any): void {
        this.wsCore.callServer({
            action: 'updateUserAnalysis',
            data
        });
    }

    /**
     * 保存换分记录
     */
    async callStoreExREcord(data?: any): Promise<void> {
        const useData = data || {
            autoEx: commonStore.storeState.autoExchange,
            autoValue: commonStore.storeState.exchangeAll ? -1 : commonStore.storeState.exchangeCredit,
            autoRate: commonStore.storeState.base,
            lastInput: commonStore.storeState.exchangeRecord
        };

        this.wsCore.callServer({
            action: 'saveUserAutoExchange',
            exchangeRecord: useData
        });

        await this.awaitApiResult(SlotGameEvent.SAVE_USER_AUTO_EXCHANGE);
    }
}
export const slotGameConnector = SlotGameConnector.getInstance();


