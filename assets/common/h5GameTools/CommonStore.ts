import { getEventManager } from '@common/manager/EventManager';
import { SlotGameEvent } from '@common/h5GameTools/SlotGameConnector';
import { reactive } from '@common/utils/Reactivity';
import { useMutations } from '@common/h5GameTools/Mutations';
import { getBaseStoreState, useStoreState } from '@common/h5GameTools/State';

/**
 * 通用存儲類
 * 管理遊戲狀態、事件監聽和數據模式
 */
export class CommonStore {
    private _storeState: any;
    public readonly storeState: any;
    public storeMutation: any;
    public storeGetter: any;
    public i18n: any;
    public static _instance: CommonStore | null = null;

    constructor() {
        this._storeState = useStoreState();
        this.storeState = this._storeState;
        this.storeMutation = useMutations(this._storeState);
        this.storeGetter = reactive({});

        // 創建 i18n 代理
        this.i18n = new Proxy({}, {
            get: (_, prop: string | symbol) => {
                const propKey = String(prop);
                return commonStore.storeState.i18n[propKey] || propKey;
            }
        });
    }

    /**
     * 獲取共享實例 (單例模式)
     */
    public static getInstance(): CommonStore {
        if (!CommonStore._instance) {
            CommonStore._instance = new CommonStore();
        }
        return CommonStore._instance;
    }

    /**
     * 添加事件監聽器
     */
    public addListeners(): void {
        const eventHandlers: [string, Function][] = [
            [SlotGameEvent.LOGIN, this.storeMutation.onLogin],
            [SlotGameEvent.TAKE_MACHINE, this.storeMutation.onTakeMachine],
            [SlotGameEvent.LOAD_INFO, this.storeMutation.onOnLoadInfo],
            [SlotGameEvent.GET_MACHINE_DETAIL, this.storeMutation.onGetMachineDetail],
            [SlotGameEvent.CREDIT_EXCHANGE, this.storeMutation.onCreditExchange],
            [SlotGameEvent.BALANCE_EXCHANGE, this.storeMutation.onBalanceExchange],
            [SlotGameEvent.HIT_JACKPOT, this.storeMutation.onHitJackpot],
            [SlotGameEvent.END_GAME, this.storeMutation.onEndGame],
            [SlotGameEvent.BEGIN_GAME, this.storeMutation.onBeginGame],
            [SlotGameEvent.DOUBLE_GAME, this.storeMutation.onDoubleGame],
            [SlotGameEvent.KEEP_MACHINE_STATUS, this.storeMutation.onKeepMachineStatus],
            [SlotGameEvent.UPDATE_JP, this.storeMutation.onUpdateJP],
            [SlotGameEvent.UPDATE_MARQUEE, this.storeMutation.onUpdateMarquee]
        ];

        eventHandlers.forEach(([eventName, handler]) => {
            getEventManager().on(eventName, (param: any) => {
                if (param.event) {
                    handler.bind(this.storeMutation)(param.data);
                }
            });
        });
    }

    /**
     * 插入存儲數據模式
     * @param keyWithPattern 帶模式的鍵
     * @returns 處理後的數據
     */
    public insertStoreDataPattern(keyWithPattern: any): any {
        // 簡化版本，移除 React 依賴
        return this.processPattern(keyWithPattern);
    }

    /**
     * 處理數據模式 (簡化版本)
     */
    private processPattern(keyWithPattern: any): any {
        if (typeof keyWithPattern === 'string') {
            // 簡單的字符串替換
            return keyWithPattern.replace(/\{(\w+)\}/g, (match: string, key: string) => {
                return this.storeGetter[key] || match;
            });
        }
        return keyWithPattern;
    }

    /**
     * 啟動存儲
     */
    public boot(): void {
        this.addListeners();
    }

    /**
     * 重置存儲狀態
     */
    public resetStoreStateState(): void {
        const baseState = getBaseStoreState();
        Object.keys(baseState).forEach((key) => {
            (this._storeState as any)[key] = (baseState as any)[key];
        });
    }

    /**
     * 獲取存儲狀態
     * @returns 存儲狀態
     */
    public getStoreState(): any {
        return this.storeState;
    }

    /**
     * 獲取存儲變更器
     * @returns 存儲變更器
     */
    public getStoreMutation(): any {
        return this.storeMutation;
    }

    /**
     * 獲取存儲獲取器
     * @returns 存儲獲取器
     */
    public getStoreGetter(): any {
        return this.storeGetter;
    }

    /**
     * 檢查存儲是否已初始化
     * @returns 是否已初始化
     */
    public isInitialized(): boolean {
        return !!(this._storeState && this.storeMutation && this.storeGetter);
    }

    /**
     * 清理存儲
     */
    public cleanup(): void {
        // 清理事件監聽器
        const eventHandlers: [string, Function][] = [
            [SlotGameEvent.LOGIN, this.storeMutation.onLogin],
            [SlotGameEvent.TAKE_MACHINE, this.storeMutation.onTakeMachine],
            [SlotGameEvent.LOAD_INFO, this.storeMutation.onOnLoadInfo],
            [SlotGameEvent.GET_MACHINE_DETAIL, this.storeMutation.onGetMachineDetail],
            [SlotGameEvent.CREDIT_EXCHANGE, this.storeMutation.onCreditExchange],
            [SlotGameEvent.BALANCE_EXCHANGE, this.storeMutation.onBalanceExchange],
            [SlotGameEvent.HIT_JACKPOT, this.storeMutation.onHitJackpot],
            [SlotGameEvent.END_GAME, this.storeMutation.onEndGame],
            [SlotGameEvent.BEGIN_GAME, this.storeMutation.onBeginGame],
            [SlotGameEvent.DOUBLE_GAME, this.storeMutation.onDoubleGame],
            [SlotGameEvent.KEEP_MACHINE_STATUS, this.storeMutation.onKeepMachineStatus],
            [SlotGameEvent.UPDATE_JP, this.storeMutation.onUpdateJP],
            [SlotGameEvent.UPDATE_MARQUEE, this.storeMutation.onUpdateMarquee]
        ];

        eventHandlers.forEach(([eventName, handler]) => {
            getEventManager().off(eventName, handler as any);
        });
    }

    /**
     * 銷毀實例
     */
    public destroy(): void {
        this.cleanup();
        CommonStore._instance = null;
    }
}

// 創建全局實例
export const commonStore = new Proxy({} as CommonStore, {
    get(target, prop: string | symbol) {
        // 檢查是否已有實例，如果有則直接返回，沒有才創建
        if (!CommonStore._instance) {
            CommonStore._instance = CommonStore.getInstance();
        }
        
        // 返回實例的屬性或方法
        const instance = CommonStore._instance;
        return instance[prop as keyof CommonStore];
    }
});