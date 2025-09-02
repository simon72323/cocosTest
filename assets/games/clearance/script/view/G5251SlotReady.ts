import { _decorator, Component, UIOpacity, tween, Node, Prefab, Animation } from 'cc';
import { getPoolManager } from '@common/manager/PoolManager';
import { REEL_DATA } from '../types/G5251ReelData';
const { ccclass, property } = _decorator;

@ccclass('G5251SlotReady')
export class G5251SlotReady extends Component {
    @property(Node)
    private readyBlack: Node = null!;//聽牌遮黑
    @property(Prefab)
    private slotReadyFx: Prefab = null!;//聽牌特效
    
    protected onLoad() {
        //生成聽牌節點
        for (let i = 0; i < REEL_DATA.reelPosition.length; i++) {
            const slotReadyFx = getPoolManager().get(this.slotReadyFx);//獲得聽牌特效
            slotReadyFx.setParent(this.node);//設置父節點
            slotReadyFx.setPosition(REEL_DATA.reelPosition[i].x, 0, 0);//設置位置
        }
    }

    /**
     * 聽牌特效淡入顯示(哪行slot)
     * @param slotLine 哪行slot
     */
    public showReady(slotLine: number) {
        //生成並顯示聽牌特效
        const slotReadyFx = this.node.children[slotLine];
        slotReadyFx.getComponent(UIOpacity)!.opacity = 0;
        slotReadyFx.active = true;
        slotReadyFx.getComponent(Animation)!.play();//播放特效
        tween(slotReadyFx.getComponent(UIOpacity)!).to(0.2, { opacity: 255 }).start();//淡入

        //顯示遮黑
        const readyBlack = this.readyBlack.children[slotLine];
        readyBlack.getComponent(UIOpacity)!.opacity = 0;
        readyBlack.active = true;
        tween(readyBlack.getComponent(UIOpacity)!).to(0.2, { opacity: 255 }).start();//淡入
    }

    /**
     * 聽牌特效淡出(哪行slot)
     * @param slotLine 哪行slot
     */
    public hideReady(slotLine: number) {
        //隱藏聽牌特效
        const slotReadyFx = this.node.children[slotLine];
        if (slotReadyFx.active) {
            tween(slotReadyFx.getComponent(UIOpacity)!).to(0.2, { opacity: 0 }).call(() => {
                slotReadyFx.active = false;//隱藏聽牌特效
            }).start();//淡出
        }
        //隱藏遮黑
        const readyBlack = this.readyBlack.children[slotLine];
        if (readyBlack.active) {
            tween(readyBlack.getComponent(UIOpacity)!).to(0.2, { opacity: 0 }).call(() => {
                readyBlack.active = false;//隱藏遮黑
            }).start();//淡出
        }
    }

    /**
     * 隱藏所有聽牌特效
     */
    public hideAllReady() {
        for (let i = 0; i < this.node.children.length; i++) {
            this.hideReady(i);//聽牌特效淡出(slotLine)
        }
    }

    /**
     * 測試此行是否出現聽牌
     * @param slotLine 哪行slot
     * @returns 是否聽牌
     */
    public testReadyLine(slotLine: number) {
        return this.node.children[slotLine].active
    }
}