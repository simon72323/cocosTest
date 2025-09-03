import { _decorator, Component, Toggle, Node, input, Input, EventKeyboard, KeyCode } from 'cc';

import { G5279FakeData } from '@/games/catRaider/script/data/G5279FakeDate';
const { ccclass, property } = _decorator;

@ccclass('G5279Setting')
export class G5279Setting extends Component {
    @property(Node)
    private toggleGroup: Node = null!;

    @property(Node)
    private fakePanel: Node = null!;//設置面板

    onLoad() {
        // 註冊鍵盤事件
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDestroy() {
        // 移除鍵盤事件監聽
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    /**
     * 鍵盤按下事件處理
     */
    private onKeyDown(event: EventKeyboard) {
        // 檢查是否按下 S 鍵
        if (event.keyCode === KeyCode.KEY_S) {
            this.node.children[0].active = !this.node.children[0].active;
        }
    }

    /**
     * 切換設置面板顯示狀態
     */
    public toggleFakePanel() {
        if (this.fakePanel)
            this.fakePanel.active = !this.fakePanel.active;
    }

    /**
     * 隱藏假資料面板
     */
    public hideFakePanel() {
        this.fakePanel.active = false;
    }

    /**
     * 運行假資料
     */
    public runFakeData() {
        for (let i = 0; i < this.toggleGroup.children.length; i++) {
            const toggle = this.toggleGroup.children[i].getComponent(Toggle)!;
            if (toggle.isChecked) {
                const fakeData = G5279FakeData.Instance.fakeData[i];
                if (!fakeData) return null;
                const beginGameMsg = { 'event': true, 'data': fakeData };
                return beginGameMsg;
            }
        }
        return null;
    }
}