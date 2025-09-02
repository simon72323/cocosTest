import { _decorator } from 'cc';
import { Logger } from '@common/utils/Logger';
import { WebSocketCore } from '@common/core/network/WebSocketCore';
import { WebSocketEvent } from '@common/core/network/WebSocketEvent';
import { AESCrypto } from '@common/core/crypto/AESCrypto';
import { urlHelper } from '@common/utils/UrlHelper';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { Comm, GTAlertType } from '@common/h5GameTools/GTCommEvents';
import { eventEmitter} from '@common/core/event/EventManager';
import { loadingInfo, TimeLabelKeys } from '@common/h5GameTools/userAnalysis/LoadingInfo';
import { DetectDevice } from '@common/utils/DetectDevice';

const { ccclass, property } = _decorator;

@ccclass('CGGameConnector')
export class CGGameConnector {
    private static _instance: CGGameConnector | null = null;
    private _wsCore: WebSocketCore = null!;
    private _closeConnectionByUser: boolean = false;
    private _useEncryption: boolean = false;

    private _wsIsDisConnect: boolean = false; // 是否斷線
    public get wsIsDisConnect(): boolean {
        return this._wsIsDisConnect;
    }
    public set wsIsDisConnect(value: boolean) {
        this._wsIsDisConnect = value;
    }

    private constructor() {
        this.init();
        // 私有構造函數，防止外部直接實例化
    }
    public static getInstance(): CGGameConnector {
        if (!CGGameConnector._instance) {
            CGGameConnector._instance = new CGGameConnector();
        }
        return CGGameConnector._instance;
    }

    /**
       * 初始化 WebSocket 連接
       * 設置協議並綁定狀態處理器
       */
    init() {
        this._wsCore = new WebSocketCore();
        this._wsCore.setupWs({
            protocolMap: {
                BINARY: "casino.bin",
                STRING: "casino.op"
            }
        });
        this._wsCore.on(WebSocketEvent.NETWORK_STATUS, (e: any) => this.wsStatusHandler(e));
    }

    /**
     * WebSocket 狀態處理器
     * 處理連接、斷開等狀態變化
     */
    wsStatusHandler(event: any) {
        Logger.log(`[NetStatus]::${event.status}`);
        switch (event.status) {
            case "open":
                loadingInfo.push(TimeLabelKeys.WS);
                getEventManager().emit("connected" /* CONNECTED */, {
                    event: true
                });
                this._wsCore.on(WebSocketEvent.NETWORK_RESULT, (e: any) => this.wsResultHandler(e));
                break;
            case "error":
            case "close":
                Logger.log("Disconnected, try again.");
                this._wsCore.off(WebSocketEvent.NETWORK_RESULT);
                this.dispatchDisconnectEvent();
                break;
        }
    }

    /**
     * WebSocket 結果處理器
     * 處理從伺服器接收到的消息
     */
    wsResultHandler(event: any) {
        const eventResult = event.result;
        if (eventResult == null ? void 0 : eventResult.NetStatusEvent) {
            Logger.debug("[NetStatusEvent]", eventResult);
            return;
        }
        if (eventResult.event == null) {
            if (eventResult.data) {
                eventResult.event = !(eventResult.error || eventResult.falutCode || eventResult.errCode);
            } else {
                eventResult.event = true;
            }
        }
        this.dispatchConnectorEvent(eventResult);
    }
    /**
     * 處理斷開連接事件
     * 如果由用戶主動關閉連接，則退出遊戲
     */
    dispatchDisconnectEvent() {
        if (this._closeConnectionByUser) {
            urlHelper.exitGame();
            return;
        }
        getEventManager().emit("close" /* CLOSE */, { manual: false });
    }
    /**
     * 分發事件
     * 觸發事件並處理相關邏輯
     */
    dispatchConnectorEvent(eventObject: any) {
        getEventManager().emit(eventObject.action, eventObject);
        if (eventObject.event && eventObject.error == null) {
            switch (eventObject.action) {
                case "ready" /* READY */:
                    this.callLogin();
                    break;
                case "takeMachine" /* TAKE_MACHINE */:
                    this.callLoadInfo();
                    break;
                case "onLoadInfo" /* LOAD_INFO */:
                    this.callJoinGame();
                    break;
            }
        } else {
            this.handleConnectorFailEvent(eventObject);
        }
    }
    /**
     * 處理連接器失敗事件
     * 顯示錯誤提示並處理錯誤
     */
    handleConnectorFailEvent(eventObject: any) {
        var _a: any, _b: any, _c: any;
        Logger.warn(`[SlotConnector] handleConnectorFailEvent [${eventObject.action}]`, eventObject.data);
        const errorDictString = ((_a = eventObject) == null ? void 0 : _a.error) || "SYSTEM_BUSY_55670144";
        const errorCode = ((_b = eventObject) == null ? void 0 : _b.errCode).toString();
        const errorId = (_c = eventObject) == null ? void 0 : _c.ErrorID;
        if (errorId) {
            switch (errorId) {
                case "5550000141":
                case "5554000510":
                case "5554000290":
                    this.showErrorAlert({
                        message: `${commonStore.i18n.DUPLICATE_ERROR}\uFF08${errorDictString}\uFF09\uFF08${errorId}\uFF09`,
                        errorKey: "DUPLICATE_ERROR"
                    });
                    break;
                default:
                    this.showErrorAlert({ message: errorDictString });
                    break;
            }
        } else {
            const showAlert = () => {
                var _a2: any;
                switch (errorDictString) {
                    case "ACCUMULATION_NOT_EXIST":
                        this.showErrorAlert({
                            message: `${commonStore.i18n[errorDictString]}\uFF08${(_a2 = eventObject) == null ? void 0 : _a2.errCode}\uFF09`,
                            errorKey: errorDictString,
                            errCode: errorCode
                        });
                        break;
                    case "SYSTEM_BUSY_55670144":
                    case "BET_CREDIT_FAILED":
                    case "BET_FAILED":
                    case "BET_OVER_MAX":
                        this.showErrorAlert({ message: errorDictString, errCode: errorCode, exitGame: false });//關閉彈窗時不退出遊戲
                        break;
                    default:
                        this.showErrorAlert({ message: errorDictString, errCode: errorCode });
                        break;
                }
            };
            switch (eventObject.action) {
                case "login" /* LOGIN */:
                    showAlert();
                    break;
                case "takeMachine" /* TAKE_MACHINE */:
                    showAlert();
                    break;
                case "creditExchange" /* CREDIT_EXCHANGE */:
                    // if (errorDictString !== "TRANSFER_FAILED") this.callGetMachineDetail();//不需要加這行，因為遊戲內會自動開啟換分介面呼叫
                    showAlert();
                    break;
                default:
                    showAlert();
                    break;
            }
        }
    }
    /**
     * 顯示錯誤提示
     * 處理錯誤並觸發退出遊戲
     */
    showErrorAlert(param: any) {
        const { message, errorKey, errCode, exitGame = true } = param;
        let content = commonStore.i18n[message];
        if (errCode) {
            if (content.includes('(')) {
                content = content.replace(/\([\d]+\)/, `(${errCode})`);
            } else {
                content += ` (${errCode})`;
            }
        }
        //翻譯沒有的話就顯示
        getEventManager().emit(Comm.SHOW_ALERT, {
            type: exitGame ? GTAlertType.ERROR : GTAlertType.BASIC_NONE,
            title: commonStore.i18n.SYSTEM_MESSAGE,
            content,
            cancelBtnText: "",
            confirmBtnText: "",
            cancelCallback: () => {
                if (exitGame) {
                    urlHelper.exitByError(errorKey != null ? errorKey : message);
                }
            }
        });
    }
    /**
     * 連接 WebSocket
     * 返回 Promise 以處理連接過程
     */
    connect(wsHost?: any) {
        try {
            return new Promise<void>((resolve, reject) => {  // 移除多餘的 async
                if (window.location.hostname === 'localhost') {
                    wsHost = 'fxcasino1.bb-in555.com';//BB開發站
                    // wsHost = 'fx8ec8.casinovir999.net';//BB測試站
                    // wsHost = 'fx8ec8.dowincasino-dev.com';//XC開發站
                    // wsHost = 'fx8ec8.dowincasino-test.com';//XC測試站
                }
                Logger.log("wsHost", wsHost);
                // 使用 then/catch 處理 Promise
                urlHelper.getWsUrl(wsHost)
                    .then((wsPath: any) => {
                        Logger.log(`[SlotGameConnector] >> Start connect to :${wsPath} , sid:${urlHelper.sid} `);

                        if (this._useEncryption) {
                            this._wsCore.setupWs({
                                useCrypto: new AESCrypto("OTNlODQ0YTkzNGQ3MWU4ODY3Yjg3NWI4NjVkN2U0ODcuODMwMGU1YjQ5MTdjMjhmNw")
                            });
                        }

                        this._wsCore.connect(wsPath);
                        getEventManager().once("connected", () => resolve());
                        getEventManager().once("close", () => reject());
                    })
                    .catch(error => {
                        console.error('Failed to get WebSocket URL:', error);
                        reject(error);
                    });
            });
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.wsIsDisConnect = true;
            throw error;
        }
    }
    /**
     * 重新連接 WebSocket
     * 返回 Promise 以處理重新連接過程
     */
    reconnect() {
        return new Promise<void>(async (resolve, reject) => {
            this._wsCore.reconnect();
            getEventManager().once("connected" /* CONNECTED */, () => resolve());
            getEventManager().once("close" /* CLOSE */, () => reject());
        });
    }
    /**
     * 關閉 WebSocket 連接
     * 處理退出遊戲邏輯
     */
    close() {
        // this.callLeaveMachine();呼叫斷線會自動離開機器
        this._closeConnectionByUser = true;
        this._wsCore.close();
    }
    /**
     * 設置 WebSocket 配置
     * 處理加密設置
     */
    setupWs(param: any) {
        this._wsCore.setupWs(param);
        param.useEncryption !== void 0 && (this._useEncryption = param.useEncryption);
    }

    //=================CallServer=================
    /**
     * 等待 API 結果
     * 返回 Promise 以等待特定事件的結果
     */
    async awaitApiResult(eventName: any) {
        return await new Promise((resolve) => {
            getEventManager().once(eventName, (e) => { resolve(e); });
        });
    }

    /**
     * 獲取遊戲資訊
     * 調用伺服器方法並等待結果
     */
    async callLoadInfo() {
        this._wsCore.callServer({
            action: "onLoadInfo",
            gameType: urlHelper.gameType
        });
        const result = await this.awaitApiResult("onLoadInfo" /* LOAD_INFO */);
        loadingInfo.push(TimeLabelKeys.LOAD_INFO);
        return result;
    }

    /**
     * 獲取遊戲資訊
     * 調用伺服器方法並等待結果
     */
    async callJoinGame() {
        this._wsCore.callServer({
            action: "joinGame",
            gameType: urlHelper.gameType
        });
        const result = await this.awaitApiResult("joinGame" /* JOIN_GAME */);
        // LoadingInfo.shared.push(TimeLabelKeys.joinGame);
        return result;
    }

    /**
     * 登入
     * 調用伺服器方法並等待結果
     */
    async callLogin() {
        const param = {
            action: "login",
            gameType: urlHelper.gameType,
            data: {
                sid: urlHelper.sid,
                lang: urlHelper.lang,
                dInfo: DetectDevice.getDeviceInfo(),
                hallID: '',
                userID: '',
            }
        };
        urlHelper.hallId && (param.data.hallID = urlHelper.hallId);
        urlHelper.userId && (param.data.userID = urlHelper.userId);
        this._wsCore.callServer(param);
        const result = await this.awaitApiResult("login" /* LOGIN */);
        loadingInfo.push(TimeLabelKeys.LOGIN);
        return result;
    }
    /**
     * 獲取機器詳細資訊
     * 調用伺服器方法並等待結果
     */
    async callGetMachineDetail() {
        loadingInfo.push(TimeLabelKeys.MACHINE_DETAIL_START);
        this._wsCore.callServer({
            action: "getMachineDetail"
        });
        const result = await this.awaitApiResult("getMachineDetail" /* GET_MACHINE_DETAIL */);
        loadingInfo.push(TimeLabelKeys.MACHINE_DETAIL_END);
        return result;
    }
    /**
     * 離開機器
     * 調用伺服器方法並等待結果
     */
    async callLeaveMachine() {
        this._wsCore.callServer({
            action: "leaveMachine"
        });
        const result = await this.awaitApiResult("machineLeave" /* MACHINE_LEAVE */);
        loadingInfo.push(TimeLabelKeys.TAKE_MACHINE);
        return result;
    }
    /**
     * 雙倍遊戲
     * 調用伺服器方法並等待結果
     */
    async callDoubleGame(wagersID: any) {
        this._wsCore.callServer({
            action: "doubleGame",
            sid: urlHelper.sid,
            wagersID
        });
        return this.awaitApiResult("onDoubleGame" /* DOUBLE_GAME */);
    }
    /**
     * 開始遊戲
     * 調用伺服器方法並等待結果
     */
    async callBeginGame(param: any) {
        this._wsCore.callServer({
            action: "beginGame",
            gameType: urlHelper.gameType,
            data: {
                betInfo: { Cards: param }
            }
        });
        return this.awaitApiResult("beginGame" /* BEGIN_GAME */);
    }
    /**
     * 換分
     * 調用伺服器方法並等待結果
     */
    async callCreditExchange(credit: any) {
        this._wsCore.callServer({
            action: "creditExchange",
            gameType: urlHelper.gameType,
            data: {
                rate: '1:1',
                credit: credit
            }

        });
        return this.awaitApiResult("creditExchange" /* CREDIT_EXCHANGE */);
    }

    /**
     * 換錢
     * 調用伺服器方法並等待結果
     */
    async callBalanceExchange() {
        this._wsCore.callServer({
            action: "balanceExchange"
        });
        return this.awaitApiResult("balanceExchange" /* BALANCE_EXCHANGE */);
    }

    /**
     * 保持機器狀態
     * 調用伺服器方法並等待結果
     */
    async callKeepMachineStatus() {
        this._wsCore.callServer({
            action: "keepMachineStatus",
            sid: urlHelper.sid
        });
        return this.awaitApiResult("keepMachineStatus" /* KEEP_MACHINE_STATUS */);
    }
    /**
     * 結束遊戲
     * 調用伺服器方法並等待結果
     */
    async callEndGame(wagersID: any, creditEnd: any) {
        if (creditEnd != null) {
            this.dispatchConnectorEvent({
                eventName: "onEndGame" /* END_GAME */,
                event: true,
                data: { Credit: creditEnd }
            });
        } else {
            this._wsCore.callServer({
                action: "endGame",
                sid: urlHelper.sid,
                wagersID
            });
            return this.awaitApiResult("onEndGame" /* END_GAME */);
        }
    }
    /**
     * 更新用戶分析
     * 調用伺服器方法
     */
    callUpdateUserAnalysis(data: any) {
        this._wsCore.callServer({
            action: "updateUserAnalysis",
            data
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
        this._wsCore.callServer({
            action: "saveUserAutoExchange",
            exchangeRecord: useData
        });
        return this.awaitApiResult("saveUserAutoExchange" /* SAVE_USER_AUTO_EXCHANGE */);
    }

    /**
     * 關閉 WebSocket 連接
     */
    closeConnect() {
        if (this._wsCore) {
            this._wsCore.close();
        }
    }
}

export const colorGameConnector = CGGameConnector.getInstance();