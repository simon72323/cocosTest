import { _decorator, Button, Component, Node, tween, UIOpacity } from 'cc';
import { addButtonClickEvent } from '../tools/G5279Tools';
import { getEventManager } from '@common/manager/EventManager';
import { G5279Model } from '../model/G5279Model';
import { Comm } from '@common/h5GameTools/GTCommEvents';
const { ccclass, property } = _decorator;

@ccclass('G5279SkipController')
export class G5279SkipController extends Component {
    @property(Node)
    private skipBtn: Node = null!;
    @property(Node)
    private blockInput: Node = null!;

    private skipSpeed: number = 20;//跳過速度
    private model: G5279Model = null!;
    private skiping: boolean = false;

    onLoad() {
        this.model = G5279Model.getInstance();
    }

    start() {
        const scriptName = 'G5279SkipController';
        const btn = this.skipBtn.getComponent(Button)!;
        addButtonClickEvent(this.node, scriptName, btn, 'clickSkipBtn');

        //設置節點顯示在公版最上層
        getEventManager().emit(Comm.GET_TOPGAMENODE, {
            callback: (topNode: Node) => {
                topNode.addChild(this.blockInput);
            }
        });
        this.stopSkip();//初始禁用
    }

    /**
     * 是否執行跳過中
     */
    public isSkiping() {
        return this.skiping;
    }

    /**
     * 顯示跳過按鈕
     */
    public showSkipBtn() {
        this.skipBtn.getComponent(Button)!.interactable = true;
        this.skipBtn.active = true;
    }

    /**
     * 禁用跳過按鈕
     */
    public stopSkip() {
        this.skiping = false;
        this.skipBtn.active = false;
        this.blockInput.active = false;
    }

    /**
     * 按下跳過事件
     */
    private clickSkipBtn() {
        this.skiping = true;
        this.skipBtn.active = false;
        this.model.timeScale = this.skipSpeed;
        const uiopacity = this.blockInput.getComponent(UIOpacity)!
        uiopacity.opacity = 0;
        tween(uiopacity).to(0.2, { opacity: 255 }, { easing: 'linear' }).start()
        this.blockInput.active = true;//顯示禁止點擊區域
    }
}