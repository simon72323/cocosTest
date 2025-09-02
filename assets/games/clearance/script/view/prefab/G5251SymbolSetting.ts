import { _decorator, Component, Sprite, tween, UIOpacity, Animation, Node, Tween } from 'cc';
import { G5251Resources } from '../../controller/G5251Resources';
import { REEL_DATA } from '../../types/G5251ReelData';
const { ccclass } = _decorator;
//設置symbol上的符號圖案


@ccclass('G5251SymbolSetting')
export class G5251SymbolSetting extends Component {
    public symID: number = 0;//紀錄本symID

    private _normal!: Node;
    private _blur!: Node;
    private _wild!: Node;
    private _scatter!: Node;
    private _scatterIsShow: boolean = false;//紀錄scatter是否已經顯示

    protected onLoad() {
        this._normal = this.node.getChildByName('normal')!;
        this._blur = this.node.getChildByName('blur')!;
        this._wild = this.node.getChildByName('wild')!;
        this._scatter = this.node.getChildByName('scatter')!;
    }

    /**
     * 初始化symbol顯示
     * @param symID 符號編號
     */
    private resetSymbol(symID?: number) {
        this._normal.active = true;//顯示靜態symbol
        // this.blur.active = true;//顯示模糊symbol
        this._scatter.active = false;//隱藏scatter
        this._wild.active = false;//隱藏wild
    }

    /**
     * 設置symbol圖示(symID)
     * @param symID 符號編號
     */
    public setSymbolImage(symID: number) {
        const resources = G5251Resources.getInstance();
        const symbolSF = resources.symbolSF;
        const symbolBlurSF = resources.symbolBlurSF;
        this.resetSymbol();
        this._scatterIsShow = false;//初始化scatter是否已經顯示
        this.symID = symID;//設置本symID
        this._normal.getComponent(Sprite)!.spriteFrame = symbolSF[symID - 1];;//正常貼圖
        this._blur.getComponent(Sprite)!.spriteFrame = symbolBlurSF[symID - 1];;//模糊貼圖
    }

    /**
     * 模糊淡入
     */
    public blurShow() {
        Tween.stopAllByTarget(this._blur);
        this._blur.getComponent(UIOpacity)!.opacity = 0;
        this._blur.active = true;
        tween(this._blur.getComponent(UIOpacity)!).to(0.2, { opacity: 255 }, { easing: "cubicIn" }).start();
    }

    /**
     * 模糊淡出
     */
    public blurHide() {
        Tween.stopAllByTarget(this._blur);
        tween(this._blur.getComponent(UIOpacity)!).to(0.2, { opacity: 0 })
            .call(() => {
                this._blur.active = false;
                this._blur.getComponent(UIOpacity)!.opacity = 0;
            }).start();
    }

    /**
     * 顯示wild或scatter
     */
    public showWildOrScatter() {
        switch (this.symID) {
            case REEL_DATA.wildID://wild
                this.showWild();
                break;
            case REEL_DATA.scatterID://scatter
                this.showScatter();
                break;
        }
    }

    /**
     * 顯示wild
     */
    public showWild() {
        this.symID = REEL_DATA.wildID;
        this._blur.active = false;
        this._scatter.active = false;//隱藏scatter
        this._normal.active = false;//隱藏靜態symbol
        this._wild.active = true;//顯示wild
        this._wild.getComponent(Animation)!.play('idle');//播放idle動態
    }

    /**
     * 顯示scatter
     */
    public showScatter() {
        //顯示過獲得動態了就不再顯示
        if (this._scatterIsShow)
            return;
        this._scatterIsShow = true;
        this.symID = REEL_DATA.scatterID;
        this._blur.active = false;
        this._wild.active = false;//隱藏wild
        this._normal.active = false;//隱藏靜態symbol
        this._scatter.active = true;//顯示scatter
        const anim = this._scatter.getComponent(Animation)!;
        anim.once(Animation.EventType.FINISHED, () => {
            anim.play('idle');
        });
        anim.play('get');
    }

    /**
     * 播放scatter待機動態
     */
    public scatterIdle() {
        this._blur.active = false;
        this._wild.active = false;//隱藏wild
        this._normal.active = false;//隱藏靜態symbol
        this._scatter.active = true;//顯示scatter
        this._scatter.getComponent(Animation)!.play('idle');
    }
}