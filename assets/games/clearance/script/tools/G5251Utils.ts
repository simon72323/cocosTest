import { Animation, Node, Button, director, UITransform, EventHandler, Toggle } from "cc";
import { commonStore } from '@common/h5GameTools/CommonStore';
import { NumberUtils } from "@common/utils/NumberUtils";

export class G5251Utils {
    /**
     * 延遲事件
     * @param duration 單位：秒
    */
    public static Delay(duration: number = 0): Promise<void> {
        return new Promise<void>((resolve) => {
            // setTimeout(() => resolve(), duration * 1000);
            const scene = director.getScene();
            const rootNode = scene!.children[0];
            const transform = rootNode.getComponent(UITransform) || rootNode.addComponent(UITransform);
            transform.scheduleOnce(() => resolve(), duration);
        });
    }

    /**
     * 規格化數值(公版K顯示)
     * @param num 數值
     * @returns 
     */
    public static NumDigitsKM(num: number): string {
        // 檢查 num 是否為有效的數字
        if (typeof num === 'undefined' || num === null || isNaN(num)) {
            return num.toString(); // 或者根據需要返回其他值
        }
        //是否顯示小數點後2位，不顯示的話同步不顯示KM
        if (commonStore.storeState.customConfig.showDecimalPoints) {
            return NumberUtils.formatNumber({
                formatValue: num,
                roundCount: 3,
                thousandth: true,
                keepDecimal: false,
                isKFormat: true,
            })
        } else {
            return this.NumDigits(num);
        }
    }

    /**
     * 規格化數值(去除小數點)
     * @param num 數值
     * @returns 
     */
    public static NumDigits(num: number): string {
        return NumberUtils.formatNumber({
            formatValue: num,
            roundCount: 0,
            thousandth: true,
            keepDecimal: false,
            isKFormat: false,
        })
    }

    /**
     * 規格化數值(小數點上限2位，尾數遇0強制顯示到2位)，XC版不強制顯示
     * @param num 數值
     * @returns 
     */
    public static NumDigits2(num: number): string {
        if (commonStore.storeState.customConfig.showDecimalPoints) {
            return NumberUtils.formatNumber({
                formatValue: num,
                roundCount: 2,
                thousandth: true,// 是否使用千分位分隔符（例如：1,234,567）
                keepDecimal: true,// 是否強制保留小數位數（true：即使是整數也會顯示.00）
                isKFormat: false,// 是否使用K/M/B等單位縮寫格式（例如：1.5K, 1.2M）
            })
        } else {
            return this.NumDigits(num);
        }
    }


    /**
     * 播放動畫結束並返回
     * @param node 持有動畫 Component 的 Node
     * @param animationName 動畫名稱(如果沒給即為預設動畫)
     * @returns //動畫播完後回傳
     */
    public static PlayAnimResolve(node: Node, animationName?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const anim: Animation = node.getComponent(Animation)!;
            if (!animationName) {
                if (anim.defaultClip) {
                    animationName = anim.defaultClip.name; //優先播放默認動態
                } else if (anim.clips.length > 0) {
                    animationName = anim.clips[0]!.name;
                } else {
                    reject(new Error('沒有可用的動畫片段'));
                    return;
                }
            }
            anim.getState(animationName).setTime(0);
            anim.play(animationName);
            anim.on(Animation.EventType.FINISHED, () => {
                anim.stop();
                anim.off(Animation.EventType.FINISHED);
                resolve();
            });
        })
    }

    /**
     * 綁定按鈕事件
     * @param target 事件處裡目標
     * @param component 組件/腳本名稱
     * @param touchNode 觸發節點
     * @param handler 函數名稱
     * @param customData 自定義事件數據?
     */
    public static bindButtonEvent(target: Node, component: string, touchNode: Node, handler: string, customData?: string) {
        const eventHandler = new EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        if (customData)
            eventHandler.customEventData = customData;
        touchNode.getComponent(Button)!.clickEvents.push(eventHandler);
    }

    /**
     * 綁定Toggle事件
     * @param target 事件處裡目標
     * @param component 組件/腳本名稱
     * @param touchNode 觸發節點
     * @param handler 函數名稱
     * @param customData 自定義事件數據?
     */
    public static bindToggleEvent(target: Node, component: string, touchNode: Node, handler: string, customData?: string) {
        const eventHandler = new EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        if (customData)
            eventHandler.customEventData = customData;
        touchNode.getComponent(Toggle)!.clickEvents.push(eventHandler);
    }

    /**
     * 彈窗顯示
     * @param node 彈窗節點
    */
    public static popupShow(node: Node) {
        node.active = true;
        node.getChildByName('btnClose')!.getComponent(Button)!.interactable = true;
        node.getComponent(Animation)!.play('popupShow');
    }

    /**
     * 彈窗隱藏
     * @param node 彈窗節點
    */
    public static popupHide(node: Node) {
        node.getChildByName('btnClose')!.getComponent(Button)!.interactable = false;
        node.getComponent(Animation)!.play('popupHide');
        setTimeout(() => {
            node.active = false;
        }, 200)
    }

    /**
     * 陣列數值加總
     * @param array 
     * @returns 
     */
    public static sumArray(array: number[]): number {
        return array.reduce((a, b) => NumberUtils.accAdd(a, b), 0);
    }

    /**
     * 數值加總
     * @param a 
     * @param b 
     * @returns 
     */
    public static accAdd(a: number, b: number) {
        return NumberUtils.accAdd(a, b);
    }

    /**
     * 數值減法
     * @param a 
     * @param b 
     * @returns 
     */
    public static accSub(a: number, b: number) {
        return NumberUtils.accSub(a, b);
    }

    /**
     * 數值乘法
     * @param a 
     * @param b 
     * @returns 
     */
    public static accMul(a: number, b: number) {
        return NumberUtils.accMul(a, b);
    }

    /**
     * 數值除法
     * @param a 
     * @param b 
     * @returns 
     */
    public static accDiv(a: number, b: number) {
        return NumberUtils.accDiv(a, b);
    }

    /**
     * 打亂數組內容
     * @param array 
     * @returns 
     */
    public static shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // 随机索引
            // 交换元素
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    //==================【遊戲相關】==================

    /**
     * 控制遊戲速度
     * @param speed 加速倍數，1 為正常速度
     */
    private static originalTick: Function | null = null;
    public static timeScale(speed: number = 1) {
        this.originalTick = this.originalTick || director.tick;
        director.tick = (dt: number) => {
            this.originalTick?.call(director, dt *= speed);
        }
    }
}