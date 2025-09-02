declare module 'gsap/dist/MotionPathPlugin.js';

declare const Editor: any;

type GameSceneType = 'mainNormalGame' | 'freeNormalGame' | 'mainBonusGame' | 'freeBonusGame';
type VerticalAlign = 'top' | 'topLeft' | 'topRight' |
        'bottom' | 'bottomLeft' | 'bottomRight' |
        'center' | 'none';
type LoaderNodeType = 'controlToSetting' | 'settingToBottom' | 'allTop' | 'underSettingPanel' |'none';

type Direction = 'P' | 'L';

type Vector2 = {
    x: number;
    y: number;
}

type FromTo = {
    from: number;
    to?: number;
}

interface Size {
    width: number;
    height: number;
}

interface WaitAnimationResult {
    stop: boolean;
    complete: boolean;
}

interface Bounds {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

interface GameObjectInfo extends Bounds {
    localWidth: number;
    localHeight: number;
    centerX: number;
    centerY: number;
}

interface PositionParam {
    /** 不管對齊方式，直接設定X軸 */
    x?: number;
    /** 不管對齊方式，直接設定Y軸 */
    y?: number;
    /** X軸置中對齊 */
    xCenter?: number;
    /** 左邊界對齊 */
    left?: number;
    /** 右邊界對齊 */
    right?: number;
    /** Y軸置中對齊 */
    yCenter?: number;
    /** 上邊界對齊 */
    top?: number;
    /** 下邊界對齊 */
    bottom?: number;
}

interface WaitAnimation {
    stop: () => void;
    complete: () => void;
    promise: Promise<WaitAnimationResult>;
}

interface Window {
    clearAllInterval: () => void;
    clearAllTimeout: () => void;
    devData?: any;
    goFreeGame?: boolean;
    goAddFree?: boolean;
}

interface LineLike {
    Grids: number[];
    GridNum?: number;
    Element?: number[];
    BrickNum?: number[];
    ElementID?: number;
    Payoff: number;
    LineID?: number;
    LineCount?: number;
    DoubleTime?: number;
}

interface BetInfo {
    BetCredit: number;
    ExtraBet: boolean;
    HitFree: boolean;
    BetLevel: number;
    BetBase: string;
}
