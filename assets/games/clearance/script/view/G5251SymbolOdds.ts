import { _decorator, Component, Label, Node, Prefab, UITransform, Sprite, Vec3, UIOpacity, Button, tween, Tween } from 'cc';
import { REEL_DATA } from '../types/G5251ReelData';
import { getPoolManager } from '@common/manager/PoolManager';
import { G5251Resources } from '../controller/G5251Resources';
import { getAudioManager } from '@common/manager/AudioManager';
import { G5251AudioName } from '../types/G5251AudioEnum';
const { ccclass, property } = _decorator;

@ccclass('G5251SymbolOdds')
export class G5251SymbolOdds extends Component {
    @property(Prefab)
    private oddsSymbol: Prefab = null!;//賠率符號
    @property(Prefab)
    private oddsWild: Prefab = null!;//賠率Wild
    @property(Prefab)
    private oddsScatter: Prefab = null!;//賠率Scatter
    @property(Node)
    private allBlack: Node = null!;//所有黑色節點

    private _oddNode: Node = null!;//紀錄目前顯示的賠率節點
    private _endSymbolID: number[] = [];//最後一局symbol位置ID列表
    private _closeOdds: Node = null!;//關閉賠率按鈕
    private _oddsBtns: Node = null!;//賠率按鈕主節點
    private _oddsShow: Node = null!;//賠率顯示節點
    private _rates: { [key: string]: number[] } = {};//賠率表

    protected onEnable(): void {
        this._closeOdds = this.node.getChildByName('closeOdds')!;
        this._oddsBtns = this.node.getChildByName('oddsBtns')!;
        this._oddsShow = this.node.getChildByName('oddsShow')!;
    }

    /**
     * 設置賠率表
     * @param rates 
     */
    public setRates(rates: { [key: string]: number[] }) {
        this._rates = rates;
    }

    /**
     * 生成賠率節點
     */
    public createOddsNode() {
        //配置節點
        const reelSymbolID = REEL_DATA.initSymbolID;//獲得初始symbolID
        const symbolSizeWidth = REEL_DATA.baseSymbolSize.width;//獲得symbol寬度
        const symbolSizeHeight = REEL_DATA.baseSymbolSize.height;//獲得symbol高度
        const reelPosition = REEL_DATA.reelPosition;//獲得reel位置
        //生成symbolBtn
        for (let i = 0; i < reelSymbolID.length; i++) {
            const length = reelSymbolID[i].length - 2;
            for (let j = 1; j < reelSymbolID[i].length - 1; j++) {
                const posID = i * length + (j - 1);
                const symbolID = reelSymbolID[i][j];
                this._endSymbolID.push(symbolID);
                const symbolBtn = new Node(`symbolBtn${posID}`);
                symbolBtn.addComponent(UITransform);
                symbolBtn.getComponent(UITransform)!.setContentSize(symbolSizeWidth, symbolSizeHeight);
                symbolBtn.parent = this._oddsBtns;
                symbolBtn.setPosition(reelPosition[i].x, reelPosition[i].y - symbolSizeHeight * j, 0);//設置symbol位置
                symbolBtn.addComponent(Button);
                const eventHandler = new Component.EventHandler();
                eventHandler.target = this.node;
                eventHandler.component = "G5251SymbolOdds";
                eventHandler.handler = "showOddsInfo";
                eventHandler.customEventData = posID.toString();
                symbolBtn.getComponent(Button)!.clickEvents.push(eventHandler);
            }
        }
        this.nodeActive(true);
    }

    /**
     * 設置節點顯示
     * @param active 
     */
    public nodeActive(active: boolean) {
        if (!this._rates) return;//無資料則不執行
        if (!active) this.exitOdds();//如果關閉，則退出賠率
        this.node.active = active;
    }

    /**
     * 隱藏點擊資訊
     */
    public onDisable(): void {
        this.resetOdds();
    }

    /**
     * 設置symbol位置ID(遊戲過程帶入)
     * @param symbolPosID 
     */
    public setEndSymbolID(endSymbolID: number[]) {
        this._endSymbolID = endSymbolID;
    }

    /**
     * 顯示賠率資訊
     * @param posID 
     */
    private showOddsInfo(event: Event, posID: number) {
        this.resetOdds();//重置賠率節點
        if (!this.allBlack.active) {
            this.showBlack();
        }
        const symbolID = this._endSymbolID[posID];//1開頭
        const resources = G5251Resources.getInstance();
        switch (symbolID) {
            case REEL_DATA.wildID:
                this._oddNode = getPoolManager().get(this.oddsWild);
                this._oddNode.getChildByName('info')!.position = posID > 11 ? new Vec3(-285, 0, 0) : new Vec3(285, 0, 0);
                break;
            case REEL_DATA.scatterID:
                this._oddNode = getPoolManager().get(this.oddsScatter);
                this._oddNode.getChildByName('info')!.position = posID > 11 ? new Vec3(-285, 0, 0) : new Vec3(285, 0, 0);
                break;
            default:
                this._oddNode = getPoolManager().get(this.oddsSymbol);
                const oddsArray = this._rates[(symbolID - 1) % 8 + 1].slice(-3).reverse(); // 從後面取3個數值並反序
                const formattedOdds = oddsArray.map(odds => `x${odds}`); // 為每個數字加上 'x' 前綴
                const oddsString = formattedOdds.join('\n'); // 使用換行符號連接
                this._oddNode.getChildByName('info')!.getChildByName('odds')!.getComponent(Label)!.string = oddsString;
                this._oddNode.getChildByName('info')!.position = posID > 11 ? new Vec3(-230, 0, 0) : new Vec3(230, 0, 0);
                this._oddNode.getChildByName('symbol')!.getComponent(Sprite)!.spriteFrame = resources.symbolSF[symbolID - 1];
        }
        getAudioManager().playSound(G5251AudioName.BtnClick);
        //背景水平翻轉
        this._oddNode.getChildByName('btn')!.scale = posID > 11 ? new Vec3(-1, 1, 1) : new Vec3(1, 1, 1);
        this._oddNode.parent = this._oddsShow;
        this._oddNode.position = this._oddsBtns.children[posID].position;
        
        //彈出動態
        this._oddNode.scale = new Vec3(0.9, 0.9, 1);
        this._oddNode.getComponent(UIOpacity)!.opacity = 0;
        tween(this._oddNode).to(0.1, { scale: new Vec3(1.05, 1.05, 1) }).to(0.05, { scale: new Vec3(1, 1, 1) }).start();
        tween(this._oddNode.getComponent(UIOpacity)!).to(0.1, { opacity: 255 }).start();

        //添加按鈕事件
        const button = this._oddNode.getChildByName('btn')!.getComponent(Button)!;
        if (button.clickEvents.length === 0) {
            const eventHandler = new Component.EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = "G5251SymbolOdds";
            eventHandler.handler = "exitOdds";
            button.clickEvents.push(eventHandler);
        }
    }

    /**
     * 重置賠率節點
     */
    public resetOdds() {
        if (this._oddNode) {
            Tween.stopAllByTarget(this._oddNode);
            //確保透明度還原(cocosBug，UIOpacity如果漸變到一半後put，子節點_uiProps._localOpacity透明度會被固定住)
            this._oddNode.getComponent(UIOpacity)!.opacity = 255;
            getPoolManager().put(this._oddNode);//回收節點
            this._oddNode = null!;
        }
    }

    /**
     * 退出賠率顯示
     */
    public async exitOdds() {
        if (this._oddNode)
            getAudioManager().playSound(G5251AudioName.BtnEnd);//有賠付介面才播放音效
        this.resetOdds();
        this._oddsBtns.active = false;
        this._closeOdds.active = false;
        await this.hideBlack();
        this._oddsBtns.active = true;
        this._closeOdds.active = true;
    }

    /**
     * 隱藏遮黑
     */
    private async hideBlack(): Promise<void> {
        return new Promise((resolve) => {
            tween(this.allBlack.getComponent(UIOpacity)!).to(0.1, { opacity: 0 })
                .call(() => {
                    this.allBlack.active = false;//隱藏遮黑
                    resolve();
                }).start();//淡出
        });
    }

    /**
     * 顯示遮黑
     */
    private showBlack() {
        this.allBlack.getComponent(UIOpacity)!.opacity = 0
        this.allBlack.active = true;//顯示遮黑
        tween(this.allBlack.getComponent(UIOpacity)!).to(0.1, { opacity: 255 }).start();//淡入
    }
}