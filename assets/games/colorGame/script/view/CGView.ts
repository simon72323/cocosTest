import { _decorator, Component, Node, Label, UITransform } from 'cc';
import { CGUtils } from '../tools/CGUtils';

const { ccclass, property } = _decorator;
@ccclass('CGView')
export class CGView extends Component {
    @property(Node)//押注區資訊
    private betInfo!: Node;
    @property(Label)//限額資訊
    private limitInfo!: Label;

    /**
     * 更新總注區額度
     * @param totalBetAreaCredits 所有注區的總投注額
     * @contorller
     */
    public updateTotalBetArea(totalBetAreaCredits: number[]) {
        for (let i = 0; i < 6; i++) {
            const node = this.betInfo.children[i];
            node.getChildByName('TotalCredit')!.getChildByName('Label')!.getComponent(Label)!.string = CGUtils.NumDigits(totalBetAreaCredits[i]);//更新所有注區注額
        }
        const total = CGUtils.sumArray(totalBetAreaCredits);
        totalBetAreaCredits.forEach((credit, i) => {
            const per = total === 0 ? '0' : (credit / total * 100).toFixed(2).replace(/\.?0+$/, '');
            const percentNode = this.betInfo.children[i].getChildByName('Percent')!;
            percentNode.getChildByName('Label')!.getComponent(Label)!.string = `${per}%`;
            percentNode.getChildByName('PercentBar')!.getComponent(UITransform)!.width = parseFloat(per);
        });
    }

    /**
     * 更新本地用戶注額
     * @param betTotal 用戶總投注額
     * @param userBetAreaCredits 該用戶各注區目前押注額
     * @contorller
     */
    public updateUserBetArea(userBetAreaCredits: number[]) {
        //本地用戶注額更新
        for (let i = 0; i < this.betInfo.children.length; i++) {
            const node = this.betInfo.children[i];
            const betCreditNode = node.getChildByName('BetCredit')!;
            betCreditNode.getChildByName('LabelAdd')!.active = false;//關閉新增分數顯示
            betCreditNode.getChildByName('Label')!.getComponent(Label)!.string = CGUtils.NumDigits(userBetAreaCredits[i]);//更新本地注區的注額
        }
    }

    /**
     * 更新限額資訊
     * @param min 最小押注額度
     * @param max 最大押注額度
     * @contorller
     */
    public setLimitInfo(min: number, max: number) {
        this.limitInfo.string = `${CGUtils.NumDigits(min)}~${CGUtils.NumDigits(max)}`;
    }
}