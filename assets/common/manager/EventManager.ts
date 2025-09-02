import { _decorator, Component, director, Node } from "cc";
const { ccclass } = _decorator;

// 定義事件監聽器類型
type EventListener = {
    callback: (data?: any) => void;
    once: boolean;
};

@ccclass('EventManager')
export class EventManager extends Component {
    private static _instance: EventManager;
    private eventMap: Map<string, EventListener[]> = new Map();

    /**
     * 獲取實例
     */
    public static getInstance(): EventManager {
        if (!EventManager._instance) {
            const node = new Node('EventManager');
            director.getScene()!.addChild(node);
            EventManager._instance = node.addComponent(EventManager);
        }
        return EventManager._instance!;
    }

    /**
     * 釋放資源
     */
    protected onDestroy(): void {
        if (this !== EventManager._instance) {
            return;
        }
        this.removeAllListeners();
        EventManager._instance = null!;
    }

    /**
     * 註冊事件監聽器
     * @param eventName 事件類型
     * @param callback 回調函數
     */
    public on(eventName: string, callback: (data?: any) => void): void {
        if (!this.eventMap.has(eventName)) {
            this.eventMap.set(eventName, []);
        }
        this.eventMap.get(eventName)!.push({ callback, once: false });
    }

    /**
     * 註冊一次性事件監聽器
     * @param eventName 事件類型
     * @param callback 回調函數
     */
    public once(eventName: string, callback: (data?: any) => void): void {
        if (!this.eventMap.has(eventName)) {
            this.eventMap.set(eventName, []);
        }
        this.eventMap.get(eventName)!.push({ callback, once: true });
    }

    /**
     * 觸發事件
     * @param eventName 事件名稱
     * @param param 事件參數
     */
    public async emit(eventName: string, param?: any): Promise<void> {
        if (!this.eventMap.has(eventName)) return;

        const listeners = this.eventMap.get(eventName);
        if (!listeners) return;

        // 創建副本避免迭代過程中修改數組
        const tempListeners = [...listeners];

        // 先執行所有事件處理函數
        await Promise.all(tempListeners.map(item => item.callback(param)));

        // 執行完畢後，清理 once 監聽器
        const remainingListeners = tempListeners.filter(item => !item.once);
        if (remainingListeners.length === 0) {
            this.eventMap.delete(eventName);
        } else {
            this.eventMap.set(eventName, remainingListeners);
        }
    }

    /**
     * 移除事件監聽器
     * @param eventName 事件名稱
     * @param callback 事件處理函數，如果未提供則移除所有事件監聽器
     */
    public off(eventName: string, callback?: (data?: any) => void): void {
        if (!this.eventMap.has(eventName)) return;

        if (callback) {
            const listeners = this.eventMap.get(eventName)!;
            const index = listeners.findIndex(item => item.callback === callback);
            if (index !== -1) {
                listeners.splice(index, 1);
                if (listeners.length === 0) {
                    this.eventMap.delete(eventName);
                }
            }
        } else {
            this.eventMap.delete(eventName);
        }
    }

    /**
     * 移除所有監聽器
     */
    public removeAllListeners(): void {
        this.eventMap.clear();
    }
}

export const getEventManager = () => {
    return EventManager.getInstance();
}