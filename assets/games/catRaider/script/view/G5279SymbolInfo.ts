import { LocalizedSprite } from '@common/components/localization/LocalizedSprite';
import { getAudioManager } from '@common/manager/AudioManager';
import { getPoolManager } from '@common/manager/PoolManager';
import { _decorator, Component, Label, Node, Prefab, Sprite, Vec3, UIOpacity, Button, tween, Tween } from 'cc';

import { G5279AudioName } from '@/games/catRaider/script/data/G5279AudioEnum';
import { G5279GameState } from '@/games/catRaider/script/data/G5279Enum';
import { G5279Resources } from '@/games/catRaider/script/data/G5279Resources';
import { getG5279Model } from '@/games/catRaider/script/model/G5279Model';

const { ccclass, property } = _decorator;

@ccclass('G5279SymbolInfo')
export class G5279SymbolInfo extends Component {
    @property(Prefab)
    private infoChrItem: Prefab = null!;//符號資訊

    @property(Prefab)
    private infoGem: Prefab = null!;//寶石賠率

    @property([Node])
    private symbolBtns: Node[] = [];//5x5資訊按鈕

    @property(Node)
    private btnInfoClose: Node = null!;//資訊返回按鈕

    @property(Node)
    private showSymbolInfoNode: Node = null!;//顯示賠率節點

    @property(Node)
    private infoBlack: Node = null!;//黑色遮黑

    @property(G5279Resources)
    private resources: G5279Resources = null!;

    private chrSpriteName: string[] = [
        'tx_odds_sym1',
        'tx_odds_sym2',
        'tx_odds_sym3',
        'tx_odds_sym4'
    ];

    private itemSpriteName: string[] = [
        'tx_odds_sym51',
        'tx_odds_sym52',
        'tx_odds_sym53',
        'tx_odds_sym54',
        'tx_odds_sym55',
        'tx_odds_sym56'
    ];

    //四個關卡的左側位置，用來判斷資訊是否要水平翻轉
    private leftPos: number[][] = [
        [0, 1, 2, 5, 6, 7, 10, 11, 12, 15, 16, 17, 20, 21, 22],
        [0, 1, 2, 6, 7, 8, 12, 13, 14, 18, 19, 20, 24, 25, 26, 30, 31, 32],
        [0, 1, 2, 3, 7, 8, 9, 10, 14, 15, 16, 17, 21, 22, 23, 24, 28, 29, 30, 31, 35, 36, 37, 38, 42, 43, 44, 45],
        [0, 1, 2, 3, 8, 9, 10, 11, 16, 17, 18, 19, 24, 25, 26, 27, 32, 33, 34, 35, 40, 41, 42, 43, 48, 49, 50, 51, 56, 57, 58, 59]
    ];

    private _symbolInfoNode: Node = null!;//紀錄目前顯示的賠率節點
    private _reelSymbolID: number[] = [];//當前盤面符號ID

    protected onEnable(): void {
        this.setInfoBtns();//設置符號按鈕
    }

    /**
     * 設置當前盤面符號ID
     * @param reelSymbolID 
     */
    public setReelSymbolID(reelSymbolID: number[]) {
        this._reelSymbolID = reelSymbolID;
        this.activeInfoBtn();
    }

    /**
     * 設置符號按鈕
     */
    private setInfoBtns() {
        for (let i = 0; i < this.symbolBtns.length; i++) {
            const symbolBtns = this.symbolBtns[i];
            for (let j = 0; j < symbolBtns.children.length; j++) {
                const eventHandler = new Component.EventHandler();
                eventHandler.target = this.node;
                eventHandler.component = 'G5279SymbolInfo';
                eventHandler.handler = 'showSymbolInfo';
                eventHandler.customEventData = j.toString();
                symbolBtns.children[j].getComponent(Button)!.clickEvents.push(eventHandler);
            }
        }
        const eventHandler = new Component.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = 'G5279SymbolInfo';
        eventHandler.handler = 'exitSymbolInfo';
        this.btnInfoClose.getComponent(Button)!.clickEvents.push(eventHandler);
    }

    /**
     * 啟用按鈕資訊
     */
    private activeInfoBtn() {
        //有資料才顯示
        const currentLv = getG5279Model().currentLv;
        this.symbolBtns[currentLv].active = true;//啟用相應按鈕資訊
    }

    /**
     * 禁用按鈕資訊
     */
    private disableInfoBtn() {
        for (let i = 0; i < this.symbolBtns.length; i++) {
            const symbolBtns = this.symbolBtns[i];
            symbolBtns.active = false;
        }
    }

    /**
     * 隱藏點擊資訊
     */
    protected onDisable(): void {
        this.resetOdds();
    }

    /**
     * 顯示賠率資訊
     * @param event 
     * @param data 按鈕位置資訊
     */
    private async showSymbolInfo(event: Event, data: string) {
        // 如果遊戲狀態不是準備狀態，則不顯示賠率資訊(保險)
        if (getG5279Model().gameState !== G5279GameState.ON_READY)
            return;
        const currentLv = getG5279Model().currentLv;
        const posID = parseInt(data);
        await this.resetOdds();//重置賠率節點
        this.btnInfoClose.active = true;
        if (!this.infoBlack.active) { this.showBlack(); }

        const symID = this._reelSymbolID[posID];
        const SFID = this.resources.symArrayID.indexOf(symID);
        if (symID > 10 && symID < 50) {
            this._symbolInfoNode = getPoolManager().get(this.infoGem);
            const payTable = getG5279Model().getPayTable();
            const odds = payTable[`${symID}`][0];
            this._symbolInfoNode.getChildByName('odds')!.getComponent(Label)!.string = odds.toFixed(2);

        } else {
            this._symbolInfoNode = getPoolManager().get(this.infoChrItem);
            const localSprite = this._symbolInfoNode.getChildByName('tx')!.getComponent(LocalizedSprite)!;
            if (symID < 5) {
                localSprite.spriteName = this.chrSpriteName[symID - 1];
            } else {
                localSprite.spriteName = this.itemSpriteName[symID - 51];
            }
            localSprite.setSpriteFrame();//更新語系貼圖
        }

        //設置符號圖片
        this._symbolInfoNode.getChildByName('sym')!.getComponent(Sprite)!.spriteFrame = this.resources.symSF[SFID];
        this._symbolInfoNode.parent = this.showSymbolInfoNode;
        const position = this.symbolBtns[currentLv].children[posID];
        this._symbolInfoNode.setPosition(position.getPosition());
        getAudioManager().playSound(G5279AudioName.btnClick);

        //背景水平翻轉
        const isLeftPos = this.leftPos[currentLv].includes(posID);
        const horizontalScale = isLeftPos ? new Vec3(1, 1, 1) : new Vec3(-1, 1, 1);
        const lvScale = [1, 0.91, 0.83, 0.75];
        const infoScale = horizontalScale.clone().multiplyScalar(lvScale[currentLv]);

        this._symbolInfoNode.setScale(infoScale);
        this._symbolInfoNode.children[0].setScale(horizontalScale);
        this._symbolInfoNode.children[1].setScale(horizontalScale);

        //彈出動態
        const scaleSmall = infoScale.clone().multiplyScalar(0.5);
        const scaleBig = infoScale.clone().multiplyScalar(1.05);

        this._symbolInfoNode.setScale(scaleSmall);
        tween(this._symbolInfoNode).to(0.1, { scale: scaleBig }).to(0.1, { scale: infoScale }).start();
        tween(this._symbolInfoNode.getComponent(UIOpacity)!).to(0.1, { opacity: 255 }).start();

        //添加離開按鈕事件
        const button = this._symbolInfoNode.getComponent(Button)!;
        if (button.clickEvents.length === 0) {
            const eventHandler = new Component.EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = 'G5279SymbolInfo';
            eventHandler.handler = 'exitSymbolInfo';
            button.clickEvents.push(eventHandler);
        }
    }

    /**
     * 重置賠率節點
     */
    private async resetOdds() {
        if (this._symbolInfoNode) {
            // getAudioManager().getInstance().playSound(G5279AudioName.btnEnd);//有賠付介面才播放音效
            Tween.stopAllByTarget(this._symbolInfoNode);
            this._symbolInfoNode.getComponent(UIOpacity)!.opacity = 0;
            getPoolManager().put(this._symbolInfoNode);//回收節點
            this._symbolInfoNode = null!;
            this.btnInfoClose.active = false;
        }
    }

    /**
     * 退出賠率顯示
     */
    public async exitSymbolInfo() {
        if (this._symbolInfoNode) {
            this.resetOdds();
            this.hideBlack();
        }
        // 如果遊戲狀態為準備狀態，則啟用符號按鈕
        const onReady = getG5279Model().gameState === G5279GameState.ON_READY;
        onReady ? this.activeInfoBtn() : this.disableInfoBtn();
    }

    /**
     * 隱藏遮黑
     */
    private hideBlack() {
        tween(this.infoBlack.getComponent(UIOpacity)!).to(0.1, { opacity: 0 })
            .call(() => {
                this.infoBlack.active = false;//隱藏遮黑
            }).start();//淡出
    }

    /**
     * 顯示遮黑
     */
    private showBlack() {
        Tween.stopAllByTarget(this.infoBlack);
        this.infoBlack.active = true;//顯示遮黑
        tween(this.infoBlack.getComponent(UIOpacity)!).to(0.1, { opacity: 255 }).start();//淡入
    }
}