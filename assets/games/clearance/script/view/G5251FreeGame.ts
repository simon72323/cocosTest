import { Comm } from '@common/h5GameTools/GTCommEvents';
import { getEventManager } from '@common/manager/EventManager';
import { _decorator, Component, Label, Animation, UIOpacity, tween, Node } from 'cc';


import { G5251Utils } from '@/games/clearance/script/tools/G5251Utils';

const { ccclass, property } = _decorator;

@ccclass('G5251FreeGame')
export class G5251FreeGame extends Component {
    @property(Node)
    private freeSpins: Node = null!;//免費遊戲剩餘次數介面

    @property(Node)
    private freeGameGet: Node = null!;//免費遊戲獲得介面

    @property(Node)
    private freeGameAdd: Node = null!;//免費遊戲獲得增加介面

    @property(Node)
    private finished: Node = null!;//免費遊戲表演結束介面(免費遊戲0分時顯示)

    private _totalFreeGameTime: number = 0;//總免費遊戲次數

    onLoad() {
        getEventManager().emit(Comm.GET_TOPGAMENODE, {
            callback: (getNode: Node) => {
                this.freeGameGet.parent = getNode;//設置在最上層
            }
        });
    }


    /**
     * 更新免費遊戲次數
     * @param freeGameTime 剩餘免費次數
     */
    public updateFreeGameTime(freeGameTime: number) {
        const endFreeSpinCount = this._totalFreeGameTime - freeGameTime;//已旋轉次數
        const spinsLabel = this.freeSpins.getChildByName('spins')!.getChildByName('label')!.getComponent(Label)!;
        spinsLabel.string = endFreeSpinCount.toString() + '/' + this._totalFreeGameTime.toString();//更新目前免費遊戲次數
    }

    /**
     * 顯示免費遊戲次數增加動態
     * @param msg 表演資料
     */
    public async showFreeGameAdd(addFreeGameTime: number, freeGameTime: number): Promise<void> {
        return new Promise(async resolve => {
            const label = this.freeGameAdd.getChildByName('ball')!.getChildByName('label')!.getComponent(Label)!;
            label.string = '+' + addFreeGameTime.toString();
            this.freeGameAdd.active = true;//顯示免費遊戲中途增加，有掛腳本動態播完會自動隱藏
            this.freeSpins.getComponent(Animation)!.play('freeSpinsAdd');
            this._totalFreeGameTime += addFreeGameTime;//更新總次數
            this.updateFreeGameTime(freeGameTime);
            await G5251Utils.PlayAnimResolve(this.freeGameAdd);
            this.freeGameAdd.active = false;
            resolve();
        });
    }

    /**
     * 顯示免費遊戲獲得動態
     * @param msg 表演資料
     */
    public async showFreeGameGet(addFreeGameTime: number): Promise<void> {
        return new Promise(async resolve => {
            const label = this.freeGameGet.getChildByName('count')!.getChildByName('label')!.getComponent(Label)!;
            label.string = addFreeGameTime.toString();
            this.freeGameGet.active = true;//顯示獲得免費遊戲，有掛腳本動態播完會自動隱藏
            this.hideControlButton();//隱藏下注按鈕
            await G5251Utils.Delay(1);
            this.freeSpins.getComponent(UIOpacity)!.opacity = 0;
            this.freeSpins.active = true;//顯示免費遊戲次數
            tween(this.freeSpins.getComponent(UIOpacity)!).to(0.3, { opacity: 255 }).start();//淡入
            this.freeSpins.getComponent(Animation)!.play('freeSpinsAdd');
            this._totalFreeGameTime += addFreeGameTime;//更新總次數
            this.updateFreeGameTime(addFreeGameTime);
            await G5251Utils.Delay(2);//等待動畫表演結束
            resolve();
        });
    }

    /**
     * 隱藏免費遊戲次數
     */
    public freeSpinsHide() {
        this._totalFreeGameTime = 0;//總次數回歸
        tween(this.freeSpins.getComponent(UIOpacity)!).to(0.3, { opacity: 0 })
            .call(() => {
                this.freeSpins.active = false;//隱藏免費遊戲次數
                this.showControlButton();//開啟下注按鈕
            }).start();//淡出
    }

    /**
     * 顯示免費遊戲表演結束介面
     */
    public async showFinished(): Promise<void> {
        return new Promise(async resolve => {
            this.finished.active = true;
            await G5251Utils.PlayAnimResolve(this.finished);
            this.finished.active = false;
            resolve();
        });
    }

    /**
     * 隱藏下注按鈕
     */
    public hideControlButton(): void {
        getEventManager().emit(Comm.SET_PUBLIC_GAME_PANEL_SWITCH, {
            controlPanelIsOpen: false,
            userSettingPanelIsOpen: true,
            bottomButtonPanelIsOpen: true
        });
    }

    /**
     * 顯示下注按鈕
     */
    public showControlButton(): void {
        getEventManager().emit(Comm.SET_PUBLIC_GAME_PANEL_SWITCH, {
            controlPanelIsOpen: true,
            userSettingPanelIsOpen: true,
            bottomButtonPanelIsOpen: true
        });
    }

}