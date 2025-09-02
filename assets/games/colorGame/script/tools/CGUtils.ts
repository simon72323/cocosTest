import { Animation, Node, Button, director, UITransform, sp, EventHandler, Toggle, Director } from "cc";
import { ColorID } from "../enum/CGEnum";
import { BetInfo } from "../enum/CGInterface";
import { commonStore } from "@common/h5GameTools/CommonStore";
import { NumberUtils } from "@common/utils/NumberUtils";

export class CGUtils {
    /**
     * 延遲事件
     * @param duration 單位：秒
    */
    public static Delay(duration: number = 0): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // setTimeout(() => resolve(), duration * 1000);
            let scene = director.getScene()!;
            let rootNode: Node = scene.children[0];
            if (!rootNode.getComponent(UITransform))
                rootNode.addComponent(UITransform)
            // this.scheduleOnce(() => resolve(), duration);
            rootNode.getComponent(UITransform)!.scheduleOnce(() => resolve(), duration);
        });
    }
    static scheduleOnce(arg0: () => void, duration: number) {
        throw new Error("Method not implemented.");
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

    // /**
    //  * 規格化數值(KM顯示)
    //  * @param num 數值
    //  * @returns 
    //  */
    // public static NumDigitsKM(num: number): string {
    //     // 檢查 num 是否為有效的數字
    //     if (num === undefined || num === null || isNaN(num)) {
    //         return num.toString(); // 或者根據需要返回其他值
    //     }
    //     //是否顯示小數點後2位，不顯示的話同步不顯示KM
    //     if (CommonStore.shared.storeState.customConfig.showDecimalPoints) {
    //         if (num >= 1000000) {
    //             const number = numberUtils.accDiv(num, 1000000);//避免出現無限小數點0.49999999999999994
    //             const decimalPlaces = number.toString().split('.')[1]?.length || 0;
    //             return number.toLocaleString('zh', { maximumFractionDigits: decimalPlaces, minimumFractionDigits: 0 }) + 'M';
    //         } else if (num >= 1000) {
    //             const number = numberUtils.accDiv(num, 1000);//避免出現無限小數點0.49999999999999994
    //             const decimalPlaces = number.toString().split('.')[1]?.length || 0;
    //             return number.toLocaleString('zh', { maximumFractionDigits: decimalPlaces, minimumFractionDigits: 0 }) + 'K';
    //         } else {
    //             return num.toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
    //         }
    //     } else {
    //       return this.NumDigits(num);  
    //     }
    // }

    /**
     * 規格化數值(小數點上限2位，尾數遇0自動捨棄)
     * @param num 數值
     * @returns 
     */
    public static NumDigits(num: number): string {
        return NumberUtils.formatNumber({
            formatValue: num,
            roundCount: 2,
            thousandth: true,
            keepDecimal: false,
            isKFormat: false,
        })
        // return number.toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
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
                thousandth: true,
                keepDecimal: true,
                isKFormat: false,
            })
        } else {
            return this.NumDigits(num);
        }
        // return number.toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: minDigits });
    }

    /**
     * 跑分規格化數值(小數點上限2位，尾數遇0強制顯示到2位)，XC版不強制顯示
     * @param num 數值
     * @returns 
     */
    public static RunNumDigits2(num: number): string {
        if (commonStore.storeState.customConfig.showDecimalPoints) {
            return NumberUtils.formatNumber({
                formatValue: num,
                roundCount: 2,
                thousandth: true,
                keepDecimal: true,
                isKFormat: false,
            })
        } else {
            return NumberUtils.formatNumber({
                formatValue: num,
                roundCount: 0,
                thousandth: true,
                keepDecimal: false,
                isKFormat: false,
            })
        }
        // return number.toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: minDigits });
    }


    // /**
    //  * 播放動畫
    //  * @param node 持有動畫 Component 的 Node
    //  * @param animationName 動畫名稱(如果沒給即為預設動畫)
    //  * @returns 
    //  */
    // public static PlayAnim(node: Node, animationName: string): Promise<void> {
    //     return new Promise((resolve) => {
    //         const animationComponent: Animation = node.getComponent(Animation);
    //         animationComponent.play(animationName);
    //         animationComponent.on(Animation.EventType.FINISHED, () => {
    //             animationComponent.stop();
    //             animationComponent.off(Animation.EventType.FINISHED);
    //             resolve();
    //         });
    //     })
    // }

    /**
     * 播完動畫後自動隱藏
     * @param node 持有動畫 Component 的 Node
     * @param animationName 動畫名稱(如果沒給即為預設動畫)
     * @returns 
     */
    public static PlayAnimAutoHide(node: Node, animationName: string) {
        const animationComponent: Animation = node.getComponent(Animation)!;
        animationComponent.play(animationName);
        animationComponent.on(Animation.EventType.FINISHED, () => {
            animationComponent.stop();
            animationComponent.off(Animation.EventType.FINISHED);
            node.active = false;
        });
    }

    /**
    * 播放 Skeleton 動畫
    * @param node 持有 Skeleton Component 的 Node
    * @param trackIndex 動畫通道索引
    * @param animationName 動畫名稱
    * @param loop 是否循環
    * @param awaitFINISHED 是否等待 Complete
    * @returns 
    */
    public static SetSkeletonAnimation(node: Node, trackIndex: number, animationName: string, loop?: boolean, awaitComplete?: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const skeletonComponent: sp.Skeleton = node.getComponent(sp.Skeleton)!;
            skeletonComponent.setAnimation(trackIndex, animationName, loop);
            if (awaitComplete) {
                const onAnimationComplete = () => {
                    skeletonComponent.setCompleteListener(null!);
                    resolve();
                }
                skeletonComponent.setCompleteListener(onAnimationComplete.bind(this));
            } else
                resolve();
        });
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
        node.getChildByName('BtnClose')!.getComponent(Button)!.interactable = true;
        node.getComponent(Animation)!.play('PopupShow');
    }

    /**
     * 彈窗隱藏
     * @param node 彈窗節點
    */
    public static popupHide(node: Node) {
        node.getChildByName('BtnClose')!.getComponent(Button)!.interactable = false;
        node.getComponent(Animation)!.play('PopupHide');
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

    /**
     * 在下一幀更新後執行指定的函數
     * @param callback 要執行的回調函數
     */
    public static nextFrame(callback: () => void): void {
        director.once(Director.EVENT_AFTER_UPDATE, callback);
    }
    //==================【遊戲相關】==================

    /**
     * 陣列注區資料轉BetInfo
     * @param betAreaCredits 各注區注額
     * @returns 
     */
    public static arrayToBetInfo(betAreaCredits: number[]): BetInfo[] {
        const result: BetInfo[] = [];
        for (let i = 0; i < betAreaCredits.length; i++) {
            if (betAreaCredits[i] > 0) {
                result.push({
                    color: ColorID[i],
                    betCredit: betAreaCredits[i]
                });
            }
        }
        return result;
    }

    /**
     * BetInfo資料轉陣列注區資料
     * @param betInfo 押注資料
     * @returns 
     */
    public static betInfoToArray(betInfo: BetInfo[]): number[] {
        const betCredits: number[] = [];
        for (let i = 0; i < betInfo.length; i++) {
            const colorIndex = ColorID[betInfo[i].color as keyof typeof ColorID];
            betCredits[colorIndex] = betInfo[i].betCredit;
        }
        return betCredits;
    }

    /**
     * 控制遊戲速度
     * @param speed 加速倍數，1 為正常速度
     */
    private static originalTick: Function | null = null;
    public static timeScale(speed: number = 1) {
        if (!this.originalTick) {
            this.originalTick = director.tick;
        }
        director.tick = (dt: number) => {
            this.originalTick!.call(director, dt *= speed);
        }
    }
}