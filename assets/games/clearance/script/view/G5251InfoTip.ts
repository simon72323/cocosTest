import { _decorator, Component, UITransform, tween, Vec3, Node, UIOpacity } from 'cc';
const { ccclass } = _decorator;

@ccclass('G5251TipView')
export class G5251TipView extends Component {
    private readonly STOP_TIME = 5;//tip文字小於顯示範圍停留時間
    private readonly WAIT_RUN_TIME = 3;//tip文字大於顯示範圍時，等待移動的時間

    private _runTipId = 0;//紀錄執行中的tip編號(0開頭)
    /**
     * 先隱藏所有tip
     */
    protected start(): void {
        for (let i = 0; i < this.node.children.length; i++) {
            this.node.children[i].active = false;
        }
        // this.runTipId++;//重新進入後跳下一個執行的編號
        this.runTip();//執行
    }

    /**
     * 顯示時淡入
     */
    protected onEnable(): void {
        this.node.getComponent(UIOpacity)!.opacity = 0;
        tween(this.node.getComponent(UIOpacity)!).to(0.2, { opacity: 255 }).start();//淡入
    }

    /**
     * tip跑動
     * @controller
     */
    private async runTip() {
        this._runTipId = this._runTipId < this.node.children.length ? this._runTipId : 0;//判斷執行中的tipId
        const tipNode = this.node.children[this._runTipId];
        tipNode.getComponent(UIOpacity)!.opacity = 0;
        tween(tipNode.getComponent(UIOpacity)!).to(0.2, { opacity: 255 }).start();//淡入
        tipNode.active = true;
        await this.runningTip(tipNode);
        tipNode.active = false;
        this._runTipId++;//下一個執行的編號
        this.runTip();
    }

    /**
     * 提示節點顯示與移動
     * @param tipNode 提示節點
     */
    private runningTip(tipNode: Node): Promise<void> {
        return new Promise(async resolve => {
            const maskHalfWidth = this.node.getComponent(UITransform)!.width / 2;
            const tipHalfWidth = tipNode.getComponent(UITransform)!.width / 2;
            const startXPos = tipHalfWidth - maskHalfWidth + 20;
            if (startXPos < 0) {
                //如果起點座標小於0(代表該提示長度在顯示範圍內，等待5秒後切換下一條)
                tipNode.position = new Vec3(0, 0, 0);
                tween(tipNode).delay(this.STOP_TIME).call(() => {
                    resolve();
                }).start();
            } else {
                //長度超過顯示範圍，會移動到退出畫面外
                tipNode.position = new Vec3(startXPos, 0, 0);
                // tween(tipNode).delay(3).call(() => {
                // if (tipNode.isValid) {
                const exitXPos = tipHalfWidth + maskHalfWidth + 50;
                const runTime = (startXPos + exitXPos) / 100;//計算移動時間(每秒移動100單位)
                tween(tipNode).delay(this.WAIT_RUN_TIME).to(runTime, { position: new Vec3(-exitXPos, 0, 0) })
                    .call(() => resolve()).start();
                // }
                // }).start();
            }
            tipNode.active = true;//顯示該tip
        });
    }

    /**
     * 關閉時停止遊戲跑馬燈
     */
    // protected onDisable() {
    //     for (let tipNode of this.node.children) {
    //         Tween.stopAllByTarget(tipNode);
    //     }
    // }
}