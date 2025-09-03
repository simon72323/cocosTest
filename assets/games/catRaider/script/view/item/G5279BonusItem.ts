import { getPoolManager } from '@common/manager/PoolManager';
import { awaitSleep } from '@common/utils/tools';
import { _decorator, Animation, Component, Node, Prefab, sp, tween, UIOpacity, Vec3 } from 'cc';

import { G5279Model, G5279Time } from '@/games/catRaider/script/model/G5279Model';

const { ccclass, property } = _decorator;

@ccclass('G5279BonusItem')
export class G5279BonusItem extends Component {
    @property(Prefab)
    private bonusWin: Prefab = null!;

    @property(Node)
    private itemWinLayer: Node = null!;

    @property(Node)
    private bonusUI: Node = null!;

    private bonusPos: Vec3[] = [
        new Vec3(-276, 440, 0),
        new Vec3(-93, 440, 0),
        new Vec3(90, 440, 0)
    ];

    private bonusAmount: number = 0;//bonus蒐集數量

    /**
     * 重置bonus
     */
    public resetBonusUI() {
        this.bonusAmount = 0;
        for (const bonusUI of this.bonusUI.children) {
            bonusUI.active = false;
        }
    }

    /**
     * 顯示獲得bonus
     * @param showTime 時間
     */
    public async getBonusItem(): Promise<void> {
        return new Promise(async resolve => {
            const timeScale = G5279Model.getInstance().timeScale;
            const bonusWin = getPoolManager().get(this.bonusWin);
            bonusWin.setParent(this.itemWinLayer);
            const sym = bonusWin.getChildByName('sym')!;
            bonusWin.setPosition(Vec3.ZERO);
            bonusWin.getComponent(UIOpacity)!.opacity = 0;
            bonusWin.setScale(0.7, 0.7, 1);
            bonusWin.active = true;
            const anim = bonusWin.getComponent(Animation)!;
            anim.getState('bonusWin').speed = timeScale;
            anim.play('bonusWin');
            const skeleton = sym.getComponent(sp.Skeleton)!;
            skeleton.timeScale = timeScale;
            skeleton.setAnimation(0, 'show', false);

            //如果bonusAmount等於3，就純表演不蒐集
            if (this.bonusAmount === 3) {
                await awaitSleep(G5279Time.itemShowTime);
                getPoolManager().put(bonusWin);
                resolve();
            } else {
                await awaitSleep(G5279Time.itemShowTime * 0.7);
                tween(bonusWin)
                    .to(G5279Time.itemShowTime * 0.3 / 1000, { position: this.bonusPos[this.bonusAmount], scale: new Vec3(0.25, 0.25, 1) }, { easing: 'sineOut' })
                    .call(() => {
                        const bonusUI = this.bonusUI.children[this.bonusAmount];
                        bonusUI.getComponent(UIOpacity)!.opacity = 0;
                        bonusUI.active = true;
                        bonusUI.getComponent(Animation)!.play('bonusGet');//獲得
                        getPoolManager().put(bonusWin);
                        this.bonusAmount++;
                        (this.bonusAmount === 3) && this.getFullBonus();
                        resolve();
                    })
                    .start();
            }
        });
    }

    /**
     * 播放bonus集滿
     */
    private getFullBonus() {
        for (const bonusUI of this.bonusUI.children) {
            bonusUI.getComponent(Animation)!.play('bonusWin');//播放bonus集滿
        }
    }
}