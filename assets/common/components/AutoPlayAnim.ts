/**
 * 【使用說明】
 * 使用方式:直接掛在含有Animation的節點上
 * 功能:
 * 1. onEnable時會自動播放動畫
 * 2. 動畫播完後可選擇自動隱藏或銷毀節點(isInLoop為false時生效)
 * 3. isInLoop為true時可配置起始動畫與循環動畫，此功能會在播完起始動畫後自動播放循環動畫
 */
import { _decorator, Component, Animation, error, AnimationClip, UIOpacity, CCBoolean } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AutoPlayAnim')
export class AutoPlayAnim extends Component {
    @property(CCBoolean)
    private autoHide: boolean = false;//[默認]或[第一個]動態播完後自動隱藏此節點

    @property(CCBoolean)
    private autoDestroy: boolean = false;//[默認]或[第一個]動態播完後自動銷毀此節點

    @property(CCBoolean)
    private isInLoop: boolean = false;//是:執行起始+循環動態，否:執行單一動態

    @property({
        type: AnimationClip,
        visible (this: AutoPlayAnim) {
            if (!this.isInLoop)
                this.inAnim = null!;
            return this.isInLoop;
        }
    })
    private inAnim: AnimationClip = null!;//循環起始動態名稱

    @property({
        type: AnimationClip,
        visible (this: AutoPlayAnim) {
            if (!this.isInLoop)
                this.loopAnim = null!;
            return this.isInLoop;
        }
    })
    private loopAnim: AnimationClip = null!;//"循環動態名稱

    public onEnable(): void {
        const uiOpacity = this.getComponent(UIOpacity);
        if (uiOpacity)
            uiOpacity.opacity = 0;
        const anim = this.getComponent(Animation)!;
        if (anim.clips.length === 0) {
            error(`[ERROR] ${this.node.name} has no clip to play!!!`);
            return;
        }
        if (this.isInLoop) {
            const onAnimationFinished = () => {
                anim.off(Animation.EventType.FINISHED, onAnimationFinished.bind(this));
                anim.getState(this.loopAnim.name).setTime(0);
                anim.play(this.loopAnim.name);
            };
            anim.getState(this.inAnim.name).setTime(0);
            anim.play(this.inAnim.name);
            anim.on(Animation.EventType.FINISHED, onAnimationFinished.bind(this));
        } else {
            let name = '';
            if (anim.defaultClip)
                name = anim.defaultClip.name;//優先播放默認動態
            else
                name = anim.clips[0]!.name;
            anim.getState(name).setTime(0);
            anim.play(name);
            if (this.autoHide || this.autoDestroy) {
                const onAnimationFinished = () => {
                    anim.off(Animation.EventType.FINISHED, onAnimationFinished.bind(this));
                    anim.stop();
                    this.autoHide && (this.node.active = false);
                    this.autoDestroy && this.node.destroy();
                };
                anim.on(Animation.EventType.FINISHED, onAnimationFinished.bind(this));
            }
        }
    }

    public onDisable(): void {
        const anim = this.getComponent(Animation)!;
        if (anim.clips.length === 0) {
            return;
        }
        anim.stop();
    }
}