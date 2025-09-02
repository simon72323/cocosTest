import { _decorator, Button, Sprite, CCFloat, EventTouch, Node, Vec3, tween, UITransform, UIOpacity, SpriteFrame, Color, color, Label, log, EventHandler } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GTCustomButtonScaleArg')
class GTCustomButtonScaleArg {
    @property(Node)
    public target: Node = null!;
    @property(CCFloat)
    public zoomScale: number = 0.9;
    @property(CCFloat)
    public duration: number = 0.1;
}

@ccclass('GTCustomButtonDisableOpacity')
class GTCustomButtonDisableOpacity {
    @property(UIOpacity)
    public uiOpacity: UIOpacity = null!;
    @property(CCFloat)
    public opacity: number = 150;
}

@ccclass('GTCustomButtonSyncSprite')
class GTCustomButtonSyncSprite {
    @property(Node)
    public target: Node = null!;
    @property(SpriteFrame)
    public normalSprite: SpriteFrame = null!;
    @property(SpriteFrame)
    public pressedSprite: SpriteFrame = null!;
    @property(SpriteFrame)
    public hoverSprite: SpriteFrame = null!;
    @property(SpriteFrame)
    public disabledSprite: SpriteFrame = null!;
}

@ccclass('GTCustomButtonSyncLabelColor')
class GTCustomButtonSyncLabelColor {
    @property(Label)
    public target: Label = null!;
    @property(Color)
    public normalColor: Color = new Color(255, 255, 255, 255);
    @property(Color)
    public pressedColor: Color = new Color(255, 255, 255, 255);
    @property(Color)
    public hoverColor: Color = new Color(255, 255, 255, 255);
    @property(Color)
    public disabledColor: Color = new Color(255, 255, 255, 255);
}

@ccclass('GTCustomButton')
export class GTCustomButton extends Button {
    @property([GTCustomButtonSyncSprite])
    private syncSprite: GTCustomButtonSyncSprite[] = [];
    @property([GTCustomButtonSyncLabelColor])
    private syncLabelColor: GTCustomButtonSyncLabelColor[] = [];
    @property([GTCustomButtonScaleArg])
    private scaleArgs: GTCustomButtonScaleArg[] = [];
    @property([Sprite])
    private disabledGray: Sprite[] = [];
    @property([GTCustomButtonDisableOpacity])
    private disabledOpacity: GTCustomButtonDisableOpacity[] = [];
    @property([Node])
    private hoverNode: Node[] = [];
    @property([Node])
    private downNode: Node[] = [];    

    protected _onTouchBegan(event?: EventTouch): void {
        super._onTouchBegan(event);
        
        if (!this._interactable) return;
        // log("按下按鈕--CustomButton")
        for (const data of this.downNode) {
            data.active = true;
            this.scheduleOnce(() => {
                data.active = false;
            }, 1)
        }
        for (const data of this.scaleArgs) {
            data.target.setScale(new Vec3(1, 1, 1));
            tween(data.target)
                .to(0.05, { scale: new Vec3(data.zoomScale, data.zoomScale, 1) }, { easing: 'sineOut' })
                .start()
        }
        
    }
    protected _onTouchEnded(event?: EventTouch): void {
        super._onTouchEnded(event);
        // log("放開按鈕")
        // this._onMouseMoveOut();//滑出
        for (const data of this.hoverNode) {
            data.active = false;
        }
        for (const data of this.scaleArgs) {
            if (data.target.scale.x === 1) return;
            tween(data.target)
                .to(data.duration, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' })
                .start()
        }
    }

    protected _onTouchCancel(event?: EventTouch): void {
        super._onTouchCancel(event);
        // log("取消按鈕(移出)")
        for (const data of this.scaleArgs) {
            tween(data.target)
                .to(data.duration, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' })
                .start()
        }
    }
    protected _onMouseMoveIn(): void {
        super._onMouseMoveIn();
        if (!this._interactable) return;
        // log("滑入")
        for (const data of this.hoverNode) {
            data.active = true;
        }
    }

    protected _onMouseMoveOut(): void {
        super._onMouseMoveOut();
        // log("滑出")
        for (const data of this.hoverNode) {
            data.active = false;
        }
    }


    protected _onTouchMove(event?: EventTouch): void {
        super._onTouchMove(event);
        if (!this._interactable) return;
        // mobile phone will not emit _onMouseMoveOut,
        // so we have to do hit test when touch moving
        // log("滑動")
        if (!event)
            return;
        const touch = (event).touch;
        if (!touch)
            return;
        const hit = this.node.getComponent(UITransform)!.hitTest(touch.getLocation());
        if (hit) {
            for (const data of this.scaleArgs) {
                tween(data.target)
                    .to(0.05, { scale: new Vec3(data.zoomScale, data.zoomScale, 1) }, { easing: 'sineOut' })
                    .start()
            }
        }
        else {
            for (const data of this.scaleArgs) {
                data.target.setScale(new Vec3(1, 1, 1));
            }
        }
        if (event)
            event.propagationStopped = true;
    }

    protected _updateState(): void {
        super._updateState();
        //同步更新sprite圖片四態
        for (const data of this.syncSprite) {
            const key = this._getButtonState();
            data.target.getComponent(Sprite)!.spriteFrame = (data as any)[`${this.getButtonState(key)}Sprite`];
        }
        //同步更新label顏色四態
        for (const data of this.syncLabelColor) {
            const key = this._getButtonState();
            data.target.getComponent(Label)!.color = (data as any)[`${this.getButtonState(key)}Color`]!;
        }
        //禁用時的灰階變化
        for (const data of this.disabledGray) {
            data.grayscale = !this.interactable;
        }
        //禁用時的透明度變化
        for (const data of this.disabledOpacity) {
            if (this.interactable) {
                data.uiOpacity.opacity = 255;
            }
            else {
                data.uiOpacity.opacity = data.opacity;
            }
        }
    }

    public setLabelStrings(text: string) {
        for (const data of this.syncLabelColor) {
            data.target.string = text; // 設定 Label 的字串
        }
    }

    private getButtonState(key : number):String{
        let str = '';
        switch (key) {
            case 0:
                str = 'normal';
                break;
            case 1:
                str = 'hover';
                break;
            case 2:
                str = 'pressed';
                break;
            case 3:
                str = 'disabled';
                break;
            default:
                str = 'normal';
                break;
        }
        return str;
    }
}