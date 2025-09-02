/**
 * GTLoaderCommStore 的設置介面，定義了所有可用的屬性
 * 使用範例
 * const store = GTLoaderCommStore.getInstance();  
 * store.setData('isManualTrigger', true);
 * console.log(store.getData('isManualTrigger')); // true
 * store.removeData('isManualTrigger');
 * console.log(store.getData('isManualTrigger')); // undefined
 */

interface GTLoaderCommStoreSettings {
    /**
     * 用於在儲存換分時玩家狀態，需要跟GS說是不是手動觸發換分的，
     * 如果是手動點擊畫面上的按鈕時，必須要把它設定為true，程式自動觸發的一率為false。
     */
    isManualTrigger: boolean;
    /**
     * 用於prepareExchange狀態時，要防止ExchangeToggle 把它設定成isCheck時重複觸發事件。
     * 這個參數會影響ExchangeToggle的開啟，務必謹慎
     */
    isPrepareExchange: boolean;
    /**
     * 換分最大限額
     */
    exchangeCreditLimit: number;
    /**
     * 用於遊戲真的進入等待狀態準備可以spin,自動換分完或是關閉了換分頁面
     */
    isGameReady: boolean;
    /**
     * 初始化時間（單位：秒）
     */
    initTime: number;
    isAutoSpin: boolean;

    /**
     * GTM BETAMOUNTSWITCH使用
     */
    amountTarget: string;
}

export class GTLoaderCommStore {
    private static instance: GTLoaderCommStore;
    private settings: Map<keyof GTLoaderCommStoreSettings, GTLoaderCommStoreSettings[keyof GTLoaderCommStoreSettings]>;

    /**
     * 私有建構子，防止外部實例化
     */
    private constructor() {
        this.settings = new Map();
        this.initializeDefaults();
    }

    /**
     * 初始化預設值
     */
    private initializeDefaults(): void {
        this.settings.set('isManualTrigger', false);
        this.settings.set('isPrepareExchange', false);
        this.settings.set('exchangeCreditLimit', 500000000);
        this.settings.set('isGameReady', false);
        this.settings.set('initTime', new Date().getTime() / 1000); // 初始化時設置當前時間
        this.settings.set('isAutoSpin', false);
        this.settings.set('amountTarget', 'none');
    }

    /**
     * 獲取單例實例
     */
    public static getInstance(): GTLoaderCommStore {
        if (!GTLoaderCommStore.instance) {
            GTLoaderCommStore.instance = new GTLoaderCommStore();
        }
        return GTLoaderCommStore.instance;
    }

    /**
     * 設置指定鍵的值
     * @param key GTLoaderCommStoreSettings 的有效鍵
     * @param value 對應鍵的值
     */
    public setData<K extends keyof GTLoaderCommStoreSettings>(key: K, value: GTLoaderCommStoreSettings[K]): void {
        this.settings.set(key, value);
    }

    /**
     * 獲取指定鍵的值
     * @param key GTLoaderCommStoreSettings 的有效鍵
     * @returns 對應鍵的值，若不存在則返回 undefined
     */
    public getData<K extends keyof GTLoaderCommStoreSettings>(key: K): GTLoaderCommStoreSettings[K] | undefined {
        return this.settings.get(key) as GTLoaderCommStoreSettings[K] | undefined;
    }

    /**
     * 移除指定鍵
     * @param key GTLoaderCommStoreSettings 的有效鍵
     */
    public removeData<K extends keyof GTLoaderCommStoreSettings>(key: K): void {
        this.settings.delete(key);
    }
}

export const gtLoaderCommStore = GTLoaderCommStore.getInstance();

