import { _decorator, Animation, Component, Node, Prefab, sp, tween, UIOpacity, Vec3 } from 'cc';
import { awaitSleep } from '@common/utils/tools';
import { G5279Model, G5279Time } from '../../model/G5279Model';
import { getPoolManager } from '@common/manager/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('G5279EnergyBallItem')
export class G5279EnergyBallItem extends Component {
    @property(Prefab)
    private energyWin: Prefab = null!;
    @property(Node)
    private itemWinLayer: Node = null!;

    private energyPos: Vec3 = new Vec3(0, 370, 0);

    /**
     * 顯示獲得bonus
     */
    public async getEnergyBallItem() {
        const showTime = G5279Time.itemShowTime;
        const timeScale = G5279Model.getInstance().timeScale;
        const energyWin = getPoolManager().get(this.energyWin);
        energyWin.setParent(this.itemWinLayer);
        const sym = energyWin.getChildByName('sym')!;
        energyWin.setPosition(Vec3.ZERO);
        energyWin.getComponent(UIOpacity)!.opacity = 0;
        energyWin.setScale(0.7, 0.7, 1);
        energyWin.active = true;
        const anim = energyWin.getComponent(Animation)!;
        anim.getState('energyBallWin').speed = timeScale;
        anim.play('energyBallWin');
        const skeleton = sym.getComponent(sp.Skeleton)!;
        skeleton.timeScale = timeScale;
        skeleton.setAnimation(0, 'show', false);
        await awaitSleep(showTime * 0.7);
        tween(energyWin)
            .to(showTime * 0.3 / 1000, { position: this.energyPos, scale: new Vec3(0.2, 0.2, 1) }, { easing: 'sineOut' })
            .call(() => {
                getPoolManager().put(energyWin);
            })
            .start();
        await awaitSleep(showTime * 0.2);
        skeleton.timeScale = 1;
    }
}