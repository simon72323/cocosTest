import { _decorator, Component, Node } from 'cc';
import { G5251Utils } from '../tools/G5251Utils';
const { ccclass, property } = _decorator;

@ccclass('G5251TopMultiple')
export class G5251TopMultiple extends Component {
    @property(Node)
    private mainBg: Node = null!;
    @property(Node)
    private mainMultiple: Node = null!;
    @property(Node)
    private freeBg: Node = null!;
    @property(Node)
    private freeMultiple: Node = null!;

    /**
     * 初始化倍率動態
     * @param isFreeMode 是否為免費模式
     */
    public multipleReSet(isFreeMode: boolean) {
        if (isFreeMode) {
            this.freeMultiple.children.forEach((child, i) => {
                child.active = i === 0; // 只有第一個倍率激活
                this.mainBg.children[i].active = false;
                this.freeBg.children[i].active = true;
                this.mainMultiple.children[i].active = false;
            });
        } else {
            this.mainMultiple.children.forEach((child, i) => {
                child.active = i === 0; // 只有第一個倍率激活
                this.mainBg.children[i].active = true;
                this.freeBg.children[i].active = false;
                this.freeMultiple.children[i].active = false;
            });
        }
    }

    /**
     * 倍率切換
     * @param isFreeMode 是否為免費模式
     * @param multipleIndex 倍率層級
     */
    public multipleChange(isFreeMode: boolean, multipleIndex: number) {
        multipleIndex += 1;//顯示下一個倍率
        const doubleArray = isFreeMode ? [2, 4, 6, 10] : [1, 2, 3, 5];
        if (multipleIndex > doubleArray.length - 1)
            multipleIndex = doubleArray.length - 1;
        if (isFreeMode) {
            if (multipleIndex > 0 && !this.freeMultiple.children[multipleIndex].active) {
                this.freeMultiple.children[multipleIndex].active = true;
                this.freeMultiple.children[multipleIndex - 1].active = false;//上一個隱藏
            }
        } else {
            if (multipleIndex > 0 && !this.mainMultiple.children[multipleIndex].active) {
                this.mainMultiple.children[multipleIndex].active = true;
                this.mainMultiple.children[multipleIndex - 1].active = false;//上一個隱藏
            }
        }
    }

    /**
     * 倍率切換Free動態
     * @returns 
     */
    public async multipleChangeFree(): Promise<void> {
        return new Promise(async (resolve) => {
            for (const child of this.mainMultiple.children) {
                child.active = false;//隱藏main倍率
            }
            for (const child of this.freeMultiple.children) {
                child.active = false;//隱藏free倍率
            }
            for (let i = 0; i < this.freeMultiple.children.length; i++) {
                this.freeMultiple.children[i].active = true;//顯示free倍率
                this.mainBg.children[i].active = false;//隱藏main倍率背景
                this.freeBg.children[i].active = true;//顯示free倍率背景
                await G5251Utils.Delay(0.3);
                this.freeMultiple.children[i].active = false;//隱藏free倍率
                if (i === this.freeMultiple.children.length - 1) {
                    this.freeMultiple.children[0].active = true;//顯示回free第一個倍率
                    await G5251Utils.Delay(0.3);
                }
            }
            resolve();
        });
    }
}