import { Comm } from '@common/h5GameTools/GTCommEvents';
import { getEventManager } from '@common/manager/EventManager';
import { awaitSleep } from '@common/utils/tools';
import { _decorator, Color, Component, Node, ParticleSystem, sp, Sprite, tween, UIOpacity } from 'cc';

import { getG5279Model, G5279Time } from '@/games/catRaider/script/model/G5279Model';
const { ccclass, property } = _decorator;

@ccclass('G5279ZombieParty')
export class G5279ZombieParty extends Component {
    @property(Node)
    private getZombieParty: Node = null!;

    @property(Node)
    private zombiePartyFx: Node = null!;

    @property(Sprite)
    private topBg: Sprite[] = [];

    @property(UIOpacity)
    private back2DBlack: UIOpacity = null!;

    private _zombiePartySpine: Node = null!;
    private _bgFx: Node = null!;
    private _particle: Node = null!;

    onLoad() {
        this._zombiePartySpine = this.getZombieParty.getChildByName('spine')!;
        this._bgFx = this.zombiePartyFx.getChildByName('bgFx')!;
        this._particle = this.zombiePartyFx.getChildByName('particle')!;
    }

    /**
     * 設置節點顯示在公版最上層
     */
    private setTopNode() {
        //設置節點顯示在公版最上層
        getEventManager().emit(Comm.GET_TOPGAMENODE, {
            callback: (topNode: Node) => {
                topNode.addChild(this.getZombieParty);
            }
        });
    }

    /**
     * 顯示進入殭屍派對
     */
    public async showZombieParty(): Promise<void> {
        return new Promise(async resolve => {
            this.setTopNode();
            const opacityTime = 0.3 / getG5279Model().timeScale;

            //背景特效
            this.zombiePartyFx.active = true;
            const bgFxUIOpacity = this._bgFx.getComponent(UIOpacity)!;
            bgFxUIOpacity.opacity = 0;
            tween(bgFxUIOpacity).to(opacityTime, { opacity: 255 }).start();

            this._particle.getComponent(ParticleSystem)!.play();

            //殭屍派對動畫
            const spineUIOpacity = this._zombiePartySpine.getComponent(UIOpacity)!;
            spineUIOpacity.opacity = 0;
            this.getZombieParty.active = true;
            tween(spineUIOpacity).to(opacityTime, { opacity: 255 }).start();
            const skeleton = this._zombiePartySpine.getComponent(sp.Skeleton)!;
            skeleton.timeScale = (0.5 + 0.5 * getG5279Model().timeScale);//加速加一半
            skeleton.setAnimation(0, 'animation', false);

            await awaitSleep(G5279Time.zombiePartyTime);

            //背景顏色變化
            for (let i = 0; i < this.topBg.length; i++) {
                tween(this.topBg[i]).to(opacityTime, { color: new Color(128, 128, 128, 255) }).start();
            }
            this.back2DBlack.opacity = 0;
            tween(this.back2DBlack).to(opacityTime, { opacity: 128 }).start();

            tween(spineUIOpacity).to(opacityTime, { opacity: 0 }).call(() => {
                this.getZombieParty.active = false;
                resolve();
            }).start();
        });
    }

    /**
     * 隱藏殭屍派對
     */
    public hideZombieParty() {
        const bgFxUIOpacity = this._bgFx.getComponent(UIOpacity)!;
        tween(bgFxUIOpacity).to(0.2, { opacity: 0 }).call(() => {
            this.zombiePartyFx.active = false;
        }).start();

        this._particle.getComponent(ParticleSystem)!.stop();

        //背景顏色回歸
        for (let i = 0; i < this.topBg.length; i++) {
            tween(this.topBg[i]).to(0.3, { color: new Color(255, 255, 255, 255) }).start();
        }
        tween(this.back2DBlack).to(0.3, { opacity: 0 }).start();
    }
}