import { LanguageManager } from '@common/manager/LanguageManager';
import { _decorator, Component, Node, Label, Prefab, instantiate } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CGTipMessage')
export class CGTipMessage extends Component {
    @property(Node)
    private tipMessage!: Node;//提示訊息顯示層

    @property(Prefab)
    private tipPrefab: Prefab = null!;//提示訊息

    /**
     * 提示訊息顯示
     * @param key 文字key
     * @param setColor 設置顏色
     */
    public async showTipMessage(key: string, score?: number) {
        const languageData = await LanguageManager.getLanguageData('gameCore');
        const instTip = instantiate(this.tipPrefab);
        const tipLabel = instTip.children[0].getComponent(Label)!;
        instTip.parent = this.tipMessage;
        if (score)
            tipLabel.string = languageData[key] + ':' + score.toString();
        else
            tipLabel.string = languageData[key];
    }
}