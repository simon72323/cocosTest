import { Animation, Button, Component, Label, Node, sp, Toggle, tween } from 'cc';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { NumberUtils } from '@common/utils/NumberUtils';

/**
 * 規格化數值(顯示KM)
 * @param num
 */
export function formatNumberKM(num: number): string {
    if (typeof num === 'undefined' || num === null || isNaN(num)) {
        return '0';
    }
    // 如果config有開啟小數點，才顯示KM
    if (commonStore.storeState.customConfig.showDecimalPoints) {
        return NumberUtils.formatNumber({
            formatValue: num,
            roundCount: 3,
            thousandth: true,
            keepDecimal: false,
            isKFormat: true
        });
    } else {
        return formatNumberInt(num);
    }
}

/**
 * 規格化數值(整數)
 * @param num
 */
export function formatNumberInt(num: number): string {
    return NumberUtils.formatNumber({
        formatValue: num,
        roundCount: 0,
        thousandth: true,
        keepDecimal: false,
        isKFormat: false
    });
}

/**
 * 規格化數值(強制顯示小數點到第2位)
 * @param num
 */
export function formatNumberRound2(num: number): string {
    // 如果config有開啟小數點，才顯示小數點到第2位
    if (commonStore.storeState.customConfig.showDecimalPoints) {
        return NumberUtils.formatNumber({
            formatValue: num,
            roundCount: 2,
            thousandth: true,
            keepDecimal: true,
            isKFormat: false
        });
    } else {
        return formatNumberInt(num);
    }
}

/**
 * 陣列數值加總
 * @param array
 */
export function sumArray(array: number[]): number {
    return array.reduce((a, b) => NumberUtils.accAdd(a, b), 0);
}

/**
 * 打亂數組內容
 * @param array
 */
export function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * 播放 animation 動畫並等待播放完成
 * @param animation
 * @param anim 動畫名稱
 */
export function playAnimFinish(animation: Animation, anim: string): Promise<void> {
    return new Promise((resolve) => {
        if (!animation) {
            resolve();
            return;
        }

        animation.play(anim);
        const state = animation.getState(anim);

        if (!state) {
            resolve();
            return;
        }

        const duration = state.duration / state.speed;

        setTimeout(() => {
            resolve();
        }, duration * 1000);
    });
}

/**
 * 播放 spine 動畫並等待播放完成
 * @param skeleton
 * @param anim 動畫名稱
 */
export function playSpineFinish(skeleton: sp.Skeleton, anim: string): Promise<void> {
    return new Promise((resolve) => {
        if (!skeleton) {
            resolve();
            return;
        }

        const trackEntry = skeleton.setAnimation(0, anim, false);
        if (!trackEntry) {
            resolve();
            return;
        }

        const animationDuration = trackEntry.animationEnd - trackEntry.animationStart;
        const timeScale = skeleton.timeScale || 1;
        const duration = animationDuration / timeScale;

        setTimeout(() => {
            resolve();
        }, duration * 1000);
    });
}

/**
 * 等待下一個 frame
 */
// export function waitNextFrame(): Promise<void> {
//     return new Promise<void>((resolve) => {
//         director.once(Director.EVENT_AFTER_UPDATE, resolve);
//     });
// }


/**
 * 添加button事件監聽器
 * @param target 目標節點
 * @param component 組件名稱
 * @param button 按鈕
 * @param handler 處理器
 * @param eventData 事件數據
 */
export function addButtonClickEvent(target: Node, component: string, button: Button, handler: string, eventData?: string) {
    const eventHandler = new Component.EventHandler();
    eventHandler.target = target;
    eventHandler.component = component;
    eventHandler.handler = handler;
    if (eventData) eventHandler.customEventData = eventData;
    button.clickEvents.push(eventHandler);
}

/**
 * 添加Toggle事件監聽器
 * @param target 目標節點
 * @param component 組件名稱
 * @param toggle Toggle
 * @param handlerName 事件名稱
 */
export function addToggleClickEvent(target: Node, component: string, toggle: Toggle, handlerName: string, eventData?: string) {
    const eventHandler = new Component.EventHandler();
    eventHandler.target = target;
    eventHandler.component = component;
    eventHandler.handler = handlerName;
    if (eventData) eventHandler.customEventData = eventData;
    toggle.clickEvents.push(eventHandler);
}

/**
 * 分數跑分動畫
 * @param time 動畫時間(秒)
 * @param startScore 起始分數
 * @param endScore 結束分數
 * @param label 分數 label
 */
export function runScore(time: number, startScore: number, endScore: number, label: Label): Promise<void> {
    return new Promise((resolve) => {
        const runScore = { score: startScore };//設置起始分
        tween(runScore).to(time, { score: endScore }, {
            onUpdate: () => {
                label.string = formatNumberRound2(runScore.score);//更新分數
            }
        }).call(() => {
            label.string = formatNumberRound2(endScore);//更新分數
            resolve();
        }).start();
    });
}