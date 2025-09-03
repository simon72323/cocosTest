import { getEventManager } from '@common/manager/EventManager';
import { _decorator, Component, tween, Node, Vec3, Animation, SpriteFrame, Sprite, sp, ParticleSystem, UIOpacity } from 'cc';

import { G5279Event } from '@/games/catRaider/script/data/G5279Event';
import { getG5279Model } from '@/games/catRaider/script/model/G5279Model';
const { ccclass, property } = _decorator;

@ccclass('G5279SceneChange')
export class G5279SceneChange extends Component {

    @property(Node)
    private back2D: Node = null!;

    @property(Node)
    private top2D: Node = null!;

    @property(Node)
    private camera3D: Node = null!;

    @property(Node)
    private energyUI: Node = null!;

    @property(ParticleSystem)
    private leftParticle: ParticleSystem = null!;

    @property(ParticleSystem)
    private dustParticle: ParticleSystem = null!;

    @property({ type: [SpriteFrame], group: { name: 'SpriteFrame', id: '1' } })
    private bgTopSF: SpriteFrame[] = [];

    @property({ type: [SpriteFrame], group: { name: 'SpriteFrame', id: '1' } })
    private energySF: SpriteFrame[] = [];

    @property({ type: [SpriteFrame], group: { name: 'SpriteFrame', id: '1' } })
    private energyMaskSF: SpriteFrame[] = [];

    private backBgAfter: Node = null!;
    private backBgBefore: Node = null!;
    private topBgAfter: Node = null!;
    private topBgBefore: Node = null!;

    onLoad() {
        getEventManager().on(G5279Event.shake, () => this.viewShake(G5279Event.shake));
        getEventManager().on(G5279Event.shakeBig, () => this.viewShake(G5279Event.shakeBig));
        this.backBgAfter = this.back2D.getChildByName('bg')!.getChildByName('after')!;
        this.backBgBefore = this.back2D.getChildByName('bg')!.getChildByName('before')!;
        this.topBgAfter = this.top2D.getChildByName('bg')!.getChildByName('after')!;
        this.topBgBefore = this.top2D.getChildByName('bg')!.getChildByName('before')!;
    }

    onDestroy() {
        getEventManager().off(G5279Event.shake, () => this.viewShake(G5279Event.shake));
        getEventManager().off(G5279Event.shakeBig, () => this.viewShake(G5279Event.shakeBig));
    }

    /**
     * 畫面大震動
     */
    private viewShake(animName: string) {
        const back2DAnim = this.back2D.getComponent(Animation)!;
        const top2DAnim = this.top2D.getComponent(Animation)!;
        const camera3DAnim = this.camera3D.getComponent(Animation)!;
        back2DAnim.stop();
        top2DAnim.stop();
        camera3DAnim.stop();
        back2DAnim.play(animName);
        top2DAnim.play(animName);
        camera3DAnim.play();
    }

    /**
     * 背景UI切換
     * @param nextLv 下一個等級
     */
    public bgUIChange(nextLv: number) {
        const currentLv = getG5279Model().currentLv;
        const afterIndex = currentLv > nextLv ? currentLv : nextLv;
        const beforeIndex = currentLv > nextLv ? nextLv : currentLv;

        const afterBgSpine = this.backBgAfter.getChildByName('bg')!.getComponent(sp.Skeleton)!;
        afterBgSpine.setAnimation(0, `lv${afterIndex + 1}_bg`, true);
        const afterBgCatSpine = this.backBgAfter.getChildByName('bgCat')!.getComponent(sp.Skeleton)!;
        afterBgCatSpine.setAnimation(0, `lv${afterIndex + 1}_cat_show`, true);

        const beforeBgSpine = this.backBgBefore.getChildByName('bg')!.getComponent(sp.Skeleton)!;
        beforeBgSpine.setAnimation(0, `lv${beforeIndex + 1}_bg`, true);
        const beforeBgCatSpine = this.backBgBefore.getChildByName('bgCat')!.getComponent(sp.Skeleton)!;
        beforeBgCatSpine.setAnimation(0, `lv${beforeIndex + 1}_cat_show`, true);

        this.topBgAfter.getComponent(Sprite)!.spriteFrame = this.bgTopSF[afterIndex];
        this.topBgBefore.getComponent(Sprite)!.spriteFrame = this.bgTopSF[beforeIndex];

        //判斷背景zoomIn或zoomOut
        currentLv > nextLv ? this.bgZoomOut() : this.bgZoomIn();

        //場景前景粒子播放控制(等級0落葉粒子，等級1~3塵埃粒子)
        if (nextLv === 0) {
            this.leftParticle.play();
            this.dustParticle.stop();
        } else {
            this.leftParticle.stop();
            this.dustParticle.play();
        }

        this.energyUI.setPosition(new Vec3(0, 30, 0));
        const bgChangeTime = 0.4 / getG5279Model().timeScale;
        tween(this.energyUI).to(bgChangeTime, { position: new Vec3(0, 0, 0) }).start();
        const energyBg = this.energyUI.getChildByName('energyBg')!;
        energyBg.getComponent(Sprite)!.spriteFrame = this.energySF[nextLv];
        const maskEnergy = this.energyUI.getChildByName('energyBar')!.getChildByName('topMask')!;
        maskEnergy.getComponent(Sprite)!.spriteFrame = this.energyMaskSF[nextLv];
    }

    /**
     * 背景zoomIn動畫
     */
    private bgZoomIn() {
        //上層背景zoomIn
        const topBgAfterUIOpacity = this.topBgAfter.getComponent(UIOpacity)!;
        topBgAfterUIOpacity.opacity = 0;
        tween(topBgAfterUIOpacity).to(0.6 / getG5279Model().timeScale, { opacity: 255 }).start();
        this.topBgAfter.scale = new Vec3(0.8, 0.8, 1);
        tween(this.topBgAfter).to(0.6 / getG5279Model().timeScale, { scale: new Vec3(1, 1, 1) }, { easing: 'cubicOut' }).start();
        const topBgBeforeUIOpacity = this.topBgBefore.getComponent(UIOpacity)!;
        topBgBeforeUIOpacity.opacity = 255;
        tween(topBgBeforeUIOpacity).to(0.6 / getG5279Model().timeScale, { opacity: 0 }).start();
        this.topBgBefore.scale = new Vec3(1, 1, 1);
        tween(this.topBgBefore).to(0.6 / getG5279Model().timeScale, { scale: new Vec3(3, 3, 1) }).start();

        //下層背景zoomIn
        const backBgAfterUIOpacity = this.backBgAfter.getComponent(UIOpacity)!;
        backBgAfterUIOpacity.opacity = 0;
        tween(backBgAfterUIOpacity).to(0.6 / getG5279Model().timeScale, { opacity: 255 }).start();
        this.backBgAfter.scale = new Vec3(0.8, 0.8, 1);
        tween(this.backBgAfter).to(0.6 / getG5279Model().timeScale, { scale: new Vec3(1, 1, 1) }, { easing: 'cubicOut' }).start();
        const backBgBeforeUIOpacity = this.backBgBefore.getComponent(UIOpacity)!;
        backBgBeforeUIOpacity.opacity = 255;
        tween(backBgBeforeUIOpacity).to(0.6 / getG5279Model().timeScale, { opacity: 0 }).start();
        this.backBgBefore.scale = new Vec3(1, 1, 1);
        tween(this.backBgBefore).to(0.6 / getG5279Model().timeScale, { scale: new Vec3(3, 3, 1) }).start();
    }

    /**
     * 背景zoomOut動畫
     */
    private bgZoomOut() {
        //上層背景zoomOut
        const topBgAfterUIOpacity = this.topBgAfter.getComponent(UIOpacity)!;
        topBgAfterUIOpacity.opacity = 0;
        this.topBgAfter.scale = new Vec3(0.8, 0.8, 1);
        const topBgBeforeUIOpacity = this.topBgBefore.getComponent(UIOpacity)!;
        topBgBeforeUIOpacity.opacity = 0;
        tween(topBgBeforeUIOpacity).to(0.75 / getG5279Model().timeScale, { opacity: 255 }).start();
        this.topBgBefore.scale = new Vec3(3, 3, 1);
        tween(this.topBgBefore).to(0.75 / getG5279Model().timeScale, { scale: new Vec3(1, 1, 1) }, { easing: 'cubicOut' }).start();

        //下層背景zoomOut
        const backBgAfterUIOpacity = this.backBgAfter.getComponent(UIOpacity)!;
        backBgAfterUIOpacity.opacity = 0;
        this.backBgAfter.scale = new Vec3(0.8, 0.8, 1);
        const backBgBeforeUIOpacity = this.backBgBefore.getComponent(UIOpacity)!;
        backBgBeforeUIOpacity.opacity = 0;
        tween(backBgBeforeUIOpacity).to(0.75 / getG5279Model().timeScale, { opacity: 255 }).start();
        this.backBgBefore.scale = new Vec3(3, 3, 1);
        tween(this.backBgBefore).to(0.75 / getG5279Model().timeScale, { scale: new Vec3(1, 1, 1) }, { easing: 'cubicOut' }).start();
    }
}