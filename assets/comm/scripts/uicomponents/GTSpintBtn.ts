import { _decorator, Animation, EventTouch, Label, Node, Sprite, sp, UIOpacity, tween } from 'cc';
import { GTCustomButton } from './GTCustomButton';
import { GTLoaderEventType } from '../comm/GTLoaderEventType';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { Logger } from '@common/utils/Logger';
import { NumberUtils } from '@common/utils/NumberUtils';
import { watch } from '@common/utils/Reactivity';
import { urlHelper } from '@common/utils/UrlHelper';
import { getEventManager } from '@common/manager/EventManager';
import { GameStatus } from '@common/h5GameTools/State';
import { Game } from '@common/h5GameTools/GTCommEvents';


const { ccclass, property } = _decorator;

// 定義 Spine 動畫狀態的枚舉
enum SpineStatus {
    Press = 0,  // 按下狀態
    Hover = 1,  // 懸停狀態
    Idle = 2,   // 閒置狀態
}

@ccclass('GTSpintBtn')
export class GTSpintBtn extends GTCustomButton {
    // --- 場景中綁定的屬性 ---
    @property(Sprite) public rotateSprite: Sprite = null!;       // 旋轉圖標
    @property(Sprite) public autoStopSprite: Sprite = null!;     // 自動停止圖標
    @property(Sprite) public infiniteSprite: Sprite = null!;     // 無限次數圖標
    @property(Label) public autoLabel: Label = null!;            // 自動下注次數標籤
    @property(Node) public loopFx: Node = null!;                 // 循環特效節點
    @property(sp.Skeleton) public spinSpine: sp.Skeleton = null!;// Spine 動畫組件

    // --- 狀態變數 ---
    public isSpinning: boolean = false;                         // 是否正在旋轉

    // --- 私有變數 ---
    private _maxAutoSpinCount: number = 0;                      // 自動下注的最大次數
    private _spineStatus: SpineStatus = SpineStatus.Idle;       // 當前 Spine 動畫狀態
    private _btnOpacity: UIOpacity = null!;                     // 按鈕透明度組件

    // --- 非同步狀態鎖 ---
    /** 用於鎖定和等待重置動畫的 Promise。如果不是 null，表示正在重置中。 */
    private _resettingPromise: Promise<void> | null = null;

    // --- 屬性 getter ---
    /** 是否處於自動旋轉模式 */
    get isAutoSpin(): boolean {
        return this._maxAutoSpinCount !== 0;
    }

    // --- 生命週期方法 ---
    protected onLoad(): void {
        this._btnOpacity = this.node.getComponent(UIOpacity)!;
        this._setupReactivityWatcher();
    }

    private _setupReactivityWatcher(): void {
        watch(() => commonStore.storeState.isTurbo, (newStatus, oldStatus) => {
            Logger.debug('GameStatus 變化了:', newStatus, oldStatus);
            if (this.isSpinning == false && commonStore.storeState.gameStatus == GameStatus.OnReady){
                this._spinAnimation(false);
            }
        });

    }

    // --- 公共方法 ---
    /**
     * 設置 Spine 骨骼數據
     * @param data Spine 骨骼數據
     */
    public setSpinSpineSkeletonData(data: sp.SkeletonData): void {
        this.spinSpine.skeletonData = data;
    }

    /**
     * 設置按鈕為可交互狀態
     */
    public setInteractableTrue(): void {
        this.interactable = true;
        this.showBtnOpacity();
    }

    /**
     * 設置按鈕為不可交互狀態
     */
    public async setInteractableFalse(): Promise<void> {
        this.interactable = false;
        this.hideBtnOpacity();
    }

    /**
     * 設置自動下注的最大次數
     * @param count 自動下注次數
     */
    public setMaxAutoSpinCount(count: number): void {
        this._maxAutoSpinCount = count;
        this._updateAutoLabel(count);
        this._updateInfiniteSprite();
    }

    /**
     * 獲取自動下注的最大次數
     * @returns 自動下注次數
     */
    public getMaxAutoSpinCount(): number {
        return this._maxAutoSpinCount;
    }

    /**
     * 開始旋轉
     */
    public async startSpin(): Promise<void> {
        Logger.debug("開始旋轉");
        this.isSpinning = true;
        this._spinAnimation(true);
        this._resetSpinSpine();
        await this._playSpinSpinePress();
        if (this.isAutoSpin) {
            this._handleAutoSpin();
            await this._playSpinSpineRun();
        }
    }

    /**
     * 進入可以立即停止的狀態
     */
    public canStopImmediately(): void {
        const delayTime = 0.3; // 延遲時間，可根據需求調整
        this.scheduleOnce(() => {
            this._spinAnimation(true);
            this._playSpinSpineRun();
        }, delayTime);
    }

    /**
     * 停止自動旋轉
     */
    public stopAutoSpin(): void {
        Logger.debug("關閉自動旋轉");
        this._maxAutoSpinCount = 0;
        this._updateAutoLabel(0);
        this._updateInfiniteSprite();
        commonStore.storeMutation.setData('isAutoPlay', false);
    }

    /**
     * 停止旋轉
     */
    public stopSpin(): void {
        this._maxAutoSpinCount = 0;
        getEventManager().emit(Game.STOP_SPIN);
    }

    /**
     * 重置旋轉按鈕狀態
     */
    public async resetSpinBtn(): Promise<void> {
        this.isSpinning = false;
        this.enabled = true;
        this._maxAutoSpinCount = 0;
        this.rotateSprite.node.active = true;
        this.autoStopSprite.node.active = false;

        this.setInteractableTrue();
        this._spinAnimation(false);
        
        await this._resetSpinSpine();
        this._playSpinSpineIdle();

        commonStore.storeMutation.setData('isAutoPlay', false);
    }

    // --- 事件處理 ---
    /**
     * 處理按下旋轉按鈕的邏輯
     * @param event 觸摸事件
     */
    protected _onTouchEnded(event?: EventTouch): void {
        Logger.debug(`按下按鈕 --- GTSpintBtn, 可交互: ${this.interactable}`);
        if (this.interactable) {
            getEventManager().emit(GTLoaderEventType.SPIN_BTN_CLICK, this);
        }
    }

    /**
     * 滑鼠移入事件
     */
    protected async _onMouseMoveIn(): Promise<void> {
        super._onMouseMoveIn();
        this._spineStatus = SpineStatus.Hover;
        this.unscheduleAllCallbacks();
        await this._resetSpinSpine();
        this._playSpinSpineHover();
    }

    /**
     * 滑鼠移出事件
     */
    protected async _onMouseMoveOut(): Promise<void> {
        super._onMouseMoveOut();
        if (!this.isSpinning) {
            this._spineStatus = SpineStatus.Idle;
            await this._resetSpinSpine();
            this._playSpinSpineIdle();
        }
    }

    // --- Spine 動畫控制 ---
    /**
     * 播放 Spine 按下動畫
     */
    private async _playSpinSpinePress(): Promise<void> {
        await this._resettingPromise;
        if (!this.spinSpine.skeletonData || this.isAutoSpin) return;
        this._spineStatus = SpineStatus.Press;
        this.spinSpine.loop = false;
        this._setSpineAnimation('down');
    }

    /**
     * 重置 Spine 動畫狀態。
     * 這個方法現在是線程安全的，可以防止多個重置動畫同時播放。
     */
    private _resetSpinSpine(): Promise<void> {
        if (this._resettingPromise) {
            return this._resettingPromise;
        }
        if (!this.spinSpine.skeletonData || this.isSpinning) {
            return Promise.resolve();
        }

        this._resettingPromise = new Promise<void>(async (resolve) => {
            try {
                const uiOpacity = this.spinSpine.getComponent(UIOpacity)! || this.spinSpine.addComponent(UIOpacity)!;

                await new Promise<void>(tweenResolve => {
                    tween(uiOpacity)
                        .to(0.3, { opacity: 0 })
                        .call(() => tweenResolve())
                        .start();
                });

                this.spinSpine.loop = false;
                this.spinSpine.animation = null!;
                this.spinSpine.enabled = false;
                uiOpacity.opacity = 255;
                
                resolve();
            } catch (error) {
                Logger.error("Error during _resetSpinSpine:", error);
                resolve();
            } finally {
                this._resettingPromise = null;
            }
        });

        return this._resettingPromise;
    }


    /**
     * 設置並播放 Spine 動畫
     * @param aniKey 動畫名稱
     */
    private _setSpineAnimation(aniKey: string): void {
        this.spinSpine.enabled = true;
        this.spinSpine.setAnimation(0, aniKey, this.spinSpine.loop);
    }

    /**
     * 播放 Spine 閒置動畫（隨機播放）
     */
    private async _playSpinSpineIdle(): Promise<void> {
        await this._resettingPromise;
        if (!this.spinSpine.skeletonData) return;
        this.spinSpine.loop = false;

        const startPlay = () => {
            if (this._spineStatus === SpineStatus.Hover) return;
            const delayTime = NumberUtils.getRandomInt(1, 5);
            this.scheduleOnce(() => {
                playRandom1();
            }, delayTime);
        };

        const playRandom1 = () => {
            if (this._spineStatus === SpineStatus.Hover) return;
            this._setSpineAnimation('up');
            startPlay();
        };

        startPlay();
    }

    /**
     * 播放 Spine 懸停動畫
     */
    private async _playSpinSpineHover(): Promise<void> {
        await this._resettingPromise;
        if (!this.spinSpine.skeletonData || this.isSpinning) return;
        this.spinSpine.loop = true;
        this._setSpineAnimation('hover');
    }

    /**
     * 播放 Spine 運行動畫
     */
    private async _playSpinSpineRun(): Promise<void> {
        await this._resettingPromise;
        if (!this.spinSpine.skeletonData || this.spinSpine.animation === 'run') return;
        this.spinSpine.loop = true;
        this._setSpineAnimation('run');
    }

    // --- 輔助方法 ---
    /**
     * 控制旋轉動畫的播放與停止
     * @param play 是否播放
     */
    private _spinAnimation(play: boolean): void {
        const animation = this.node.getComponent(Animation)!;
        const animState = animation?.getState(animation.defaultClip?.name!);
        if (!animState) return;

        this.loopFx.active = play;
        if (play) {
            this.unscheduleAllCallbacks();
            // 因LuckyAce的加速做的方式不同，所以加速倍數要寫死。
            if ( urlHelper.gameType == '5277') {
                animState.speed = 3;
            }else {
                animState.speed = commonStore.storeState.isTurbo ? 9 : 6;
            }
            
            // animation.pause();
            animation.resume();
        } else {
            this.scheduleOnce(() => {
                animState.speed = commonStore.storeState.isTurbo ? 3 : 1;
                // animation.pause();
                animation.resume();
            });
        }
    }

    /**
     * 處理自動旋轉邏輯
     */
    private _handleAutoSpin(): void {
        this.setInteractableTrue();
        this.autoStopSprite.node.active = true;
        this._maxAutoSpinCount--;
        this._updateAutoLabel(this._maxAutoSpinCount);
        commonStore.storeMutation.setData('isAutoPlay', this.isAutoSpin);
        Logger.debug(`剩餘自動遊玩次數: ${this._maxAutoSpinCount}`);
    }

    /**
     * 更新自動下注標籤
     * @param maxCount 自動下注次數
     */
    private _updateAutoLabel(maxCount: number): void {
        if (this._maxAutoSpinCount > 0) {
            this.autoLabel.string = maxCount.toString();
            this.autoLabel.node.active = true;
        } else {
            this.autoLabel.node.active = false;
        }

        if (this.isSpinning) {
            this.autoStopSprite.node.active = this._maxAutoSpinCount !== 0;
            this.rotateSprite.node.active = this._maxAutoSpinCount == 0;
        }
    }

    /**
     * 更新無限次數圖標顯示
     */
    private _updateInfiniteSprite(): void {
        this.infiniteSprite.node.active = this._maxAutoSpinCount == -1;
    }

    /**
     * 顯示按鈕（設置透明度為完全可見）
     */
    private showBtnOpacity(): void {
        tween(this._btnOpacity)
            .to(0.2, { opacity: 255 })
            .start();
    }

    /**
     * 隱藏按鈕（設置透明度為半透明）
     */
    private hideBtnOpacity(): void {
        tween(this._btnOpacity)
            .to(0.2, { opacity: 80 })
            .start();
    }

}