import { getPoolManager } from '@common/manager/PoolManager';
import { _decorator, Animation, Component, Node, Prefab, Vec3 } from 'cc';

import { playAnimFinish } from '@/games/catRaider/script/tools/G5279Tools';
const { ccclass, property } = _decorator;

@ccclass('G5279BombItem')
export class G5279BombItem extends Component {
    @property(Prefab)
    private symFxBomb: Prefab = null!;

    @property(Node)
    private floorFxLayer: Node = null!;


    /**
     * 創建爆炸特效
     * @param pos 爆炸位置
     */
    public async createFxBomb(pos: Vec3) {
        const fxBomb = getPoolManager().get(this.symFxBomb);
        fxBomb.setParent(this.floorFxLayer);
        fxBomb.setPosition(pos);
        const anim = fxBomb.getComponent(Animation)!;
        await playAnimFinish(anim, 'fxBomb');
        getPoolManager().put(fxBomb);
    }
}