import { _decorator, Component, UITransform, tween, Vec3, Tween, Node, UIOpacity, Sprite, CCString } from 'cc';
import { urlHelper } from '@common/utils/UrlHelper';
import { LocalizedSprite } from '@common/components/localization/LocalizedSprite';
const { ccclass, property } = _decorator;

@ccclass('CGTipView')
export class CGTipView extends Component {
    private readonly STOP_TIME = 5;//tip文字小於顯示範圍停留時間
    private readonly WAIT_RUN_TIME = 3;//tip文字大於顯示範圍時，等待移動的時間

    private tipId = -1;//紀錄執行中的tip編號
    @property({ type: [CCString] })
    public XCTips: string[] = [];//貼圖檔名名稱
    @property({ type: [CCString] })
    public BBTips: string[] = [];//貼圖檔名名稱
    private tips: string[] = [];
    @property({ tooltip: '是否裁剪貼圖' })
    public trim: boolean = false;

    onLoad() {
        //判斷XC版本提示
        this.tips = urlHelper.site === 'XC' ? this.XCTips : this.BBTips;
        if (!this.node.getComponent(UIOpacity)) {
            this.node.addComponent(UIOpacity).opacity = 0;
        }
        //創建跑馬燈節點
        for (let i = 0; i < this.tips.length; i++) {
            const tipNode = new Node();
            tipNode.layer = this.node.layer;
            tipNode.addComponent(UITransform);
            const sprite = tipNode.addComponent(Sprite);
            sprite.sizeMode = this.trim ? Sprite.SizeMode.RAW : Sprite.SizeMode.TRIMMED;
            sprite.trim = this.trim;
            tipNode.addComponent(UIOpacity);
            tipNode.active = true;
            tipNode.addComponent(LocalizedSprite).spriteName = this.tips[i];
            tipNode.setParent(this.node);
        }
    }

    /**
     * 顯示時淡入
     */
    protected onEnable(): void {
        if (this.tips.length === 0) {
            console.warn('infoTip: tips array is empty');
            return;
        }
        const opacity = this.node.getComponent(UIOpacity)!;
        opacity.opacity = 0;
        tween(opacity).to(0.2, { opacity: 255 }).start();//淡入
        this.showNextTip();//執行
    }

    /**
     * 隱藏時停止運行中的跑馬燈
     */
    protected onDisable(): void {
        Tween.stopAllByTarget(this.node.children[this.tipId]);//停止運行中的跑馬燈
    }

    /**
     * 執行下一個tip
     */
    private showNextTip() {
        for (const tip of this.node.children) { tip.active = false; }//隱藏所有tip
        this.tipId = (this.tipId + 1) % this.node.children.length;//下一個tipId

        const tipNode = this.node.children[this.tipId];
        const opacity = tipNode.getComponent(UIOpacity)!;
        opacity.opacity = 0;
        tipNode.active = true;
        tween(opacity).to(0.2, { opacity: 255 }).start();//淡入

        const maskWidth = this.node.getComponent(UITransform)!.width / 2;
        const tipWidth = tipNode.getComponent(UITransform)!.width / 2;
        const startX = tipWidth - maskWidth + 20;

        if (startX < 0) {
            //如果起點座標小於0(代表該提示長度在顯示範圍內，等待5秒後切換下一條)
            tipNode.position = Vec3.ZERO;
            tween(tipNode)
                .delay(this.STOP_TIME)
                .call(() => this.showNextTip())
                .start();
        } else {
            //長度超過顯示範圍，會移動到退出畫面外
            const exitX = tipWidth + maskWidth + 50;
            const runTime = (startX + exitX) / 100;//計算移動時間(每秒移動100單位)
            tipNode.position = new Vec3(startX, 0, 0);
            tween(tipNode)
                .delay(this.WAIT_RUN_TIME)
                .to(runTime, { position: new Vec3(-exitX, 0, 0) })
                .call(() => this.showNextTip())
                .start();
        }
    }
}