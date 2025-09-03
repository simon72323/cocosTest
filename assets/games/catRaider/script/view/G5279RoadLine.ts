import { getPoolManager } from '@common/manager/PoolManager';
import { _decorator, Color, Component, Node, Prefab, Sprite, tween, UIOpacity, Vec3 } from 'cc';

import { SymbolNode } from '@/games/catRaider/script/data/G5279Interface';
import { getG5279Model } from '@/games/catRaider/script/model/G5279Model';
import { G5279Floor } from '@/games/catRaider/script/view/G5279Floor';
const { ccclass, property } = _decorator;

@ccclass('G5279RoadLine')
export class G5279RoadLine extends Component {
    @property(Prefab)
    private roadLine: Prefab = null!;

    @property(Node)
    private roadLineLayer: Node = null!;

    @property({ type: G5279Floor, group: { name: 'View', id: '1' } })
    private floorView: G5279Floor = null!;//地板介面

    //四個路線顏色(紅、黃、綠、藍)
    private lineColor: Color[] = [
        new Color(255, 0, 50, 180),
        new Color(255, 170, 0, 180),
        new Color(0, 200, 0, 180),
        new Color(0, 130, 255, 180)
    ];

    /**
     * 生成道路線條
     * @param chrID 角色ID
     * @param pos 所有中線位置
     * @param posID 所有中線位置ID
     */
    public createRoadLine(chrID: number, pos: Vec3[], posID: number[]) {
        for (let i = 0; i < pos.length; i++) {
            const roadLine = getPoolManager().get(this.roadLine) as SymbolNode;
            roadLine.setParent(this.roadLineLayer);
            const colorID = chrID - 1;
            roadLine.getComponent(Sprite)!.color = this.lineColor[colorID];
            roadLine.posID = posID[i];

            if (this.floorView.checkFloorBroken(posID[i])) {
                roadLine.setPosition(pos[i]);
            } else {
                //如果地板未破碎則道路線提高
                roadLine.setPosition(new Vec3(pos[i].x, pos[i].y, 30));
            }
        }
        const uiOpacity = this.roadLineLayer.getComponent(UIOpacity)!;
        tween(uiOpacity).to(0.2 / getG5279Model().timeScale, { opacity: 255 }).start();
    }

    /**
     * 調整中獎路線高度
     * @param floorPosID 地板位置ID
     */
    public setLineHeight(floorPosID: number) {
        //調整中獎路線高度
        for (const roadLine of this.roadLineLayer.children) {
            const roadLineNode = roadLine as SymbolNode;
            if (roadLineNode.posID === floorPosID) {
                roadLineNode.setPosition(roadLineNode.position.x, roadLineNode.position.y, 0);
                break;
            }
        }
    }

    /**
     * 執行路線抖動表演
     * @param posID 位置ID
     * @param shakeTime 抖動時間(毫秒)
     */
    public runRoadLineAnim(posID: number, shakeTime: number) {
        for (const roadLine of this.roadLineLayer.children) {
            const roadLineNode = roadLine as SymbolNode;
            if (roadLineNode.posID === posID) {
                const position = roadLineNode.position.clone();
                tween(roadLineNode)
                    .to(shakeTime / 1666, { position: new Vec3(position.x, position.y, position.z + 50) }, { easing: 'cubicOut' })
                    .to(shakeTime / 1666, { position }, { easing: 'cubicIn' })
                    .start();
                break;
            }
        }
    }

    /**
     * 移除所有道路線條
     */
    public putRoadLine() {
        const uiOpacity = this.roadLineLayer.getComponent(UIOpacity)!;
        tween(uiOpacity).to(0.2 / getG5279Model().timeScale, { opacity: 0 }).call(() => {
            while (this.roadLineLayer.children.length > 0) {
                getPoolManager().put(this.roadLineLayer.children[0]);
            }
        }).start();
    }
}