import { _decorator, Animation, Component, instantiate, Node, Prefab, ProgressBar, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { SymbolNode } from '../data/G5279Interface';
import { awaitSleep } from '@common/utils/tools';
import { G5279AudioName } from '../data/G5279AudioEnum';
import { getAudioManager } from '@common/manager/AudioManager';
import { getG5279Model, G5279Time } from '../model/G5279Model';
import { playAnimFinish } from '../tools/G5279Tools';
const { ccclass, property } = _decorator;

@ccclass('G5279Chance')
export class G5279Chance extends Component {
    //機會道具的排列位置
    private chancePos: Vec3[] = [
        new Vec3(-340, 795, 0),
        new Vec3(-210, 795, 0),
        new Vec3(-80, 795, 0),
    ];

    private chanceGetPos: Vec3 = new Vec3(285, 623, 0);//生成起點

    @property(Node)
    private chanceRun: Node = null!;
    @property(Node)
    private energyBar: Node = null!;
    @property(Node)
    private chanceFxWin: Node = null!;

    @property([SpriteFrame])
    private chanceSprite: SpriteFrame[] = [];
    @property([SpriteFrame])
    private energyBarSprite: SpriteFrame[] = [];

    @property(Node)
    private chanceTempLayer: Node = null!;
    @property(Node)
    private chanceWinLayer: Node = null!;

    @property([Prefab])
    private chanceItem: Prefab[] = [];

    private currentEnergy: number = 0; //紀錄該回合已累積的能量
    private chanceIndex: number = 0;//紀錄該回合執行的機會卡編號

    onLoad() {
        this.createChanceSlotNode();
    }

    /**
     * 初始化機會卡資料
     * @param chanceCards 機會卡資料
     */
    public initChanceCards() {
        const chanceCards = getG5279Model().getChanceCards();
        this.chanceIndex = 0;
        const progressBar = this.energyBar.children[0]!.getComponent(ProgressBar)!;
        progressBar.progress = 0;
        this.runChanceSlot(chanceCards[0]);//轉動第一張機會卡

    }

    /**
     * 生成機會卡轉輪節點
     */
    private createChanceSlotNode() {
        for (let i = 0; i < 2; i++) {
            const instSprite = new Node();
            instSprite.setParent(this.chanceRun);
            instSprite.setPosition(new Vec3(0, 155 * i, 0));
            const sprite = instSprite.addComponent(Sprite);
            const random = Math.floor(Math.random() * 3);
            sprite.spriteFrame = this.chanceSprite[random];
            sprite.sizeMode = Sprite.SizeMode.RAW;
        }
    }

    /**
     * 獲得機會卡並轉動下一張機會卡
     */
    private getChanceCards() {
        getAudioManager().playSound(G5279AudioName.getChance);
        const chanceCards = getG5279Model().getChanceCards();
        const currentChanceID = chanceCards[this.chanceIndex];
        this.getChanceItem(currentChanceID);//獲得機會卡
        this.chanceIndex++;//下一個機會卡index
        const nextChanceID = chanceCards[this.chanceIndex];
        this.runChanceSlot(nextChanceID);//轉動下一個機會卡
    }

    /**
     * 運行轉輪
     * @param symID 符號ID
     */
    private runChanceSlot(symID: number) {
        getAudioManager().playSound(G5279AudioName.runSlot);
        this.currentEnergy = 0;
        const length = this.chanceRun.children.length;
        const winIndex = (symID % 200) - 1;
        for (let i = 1; i < length; i++) {
            const sprite = this.chanceRun.children[i].getComponent(Sprite)!;
            if (i === length - 1) {
                sprite.spriteFrame = this.chanceSprite[winIndex];//指定結果圖
            } else {
                const random = Math.floor(Math.random() * 3);
                sprite.spriteFrame = this.chanceSprite[random];
            }
        }
        const endPos = new Vec3(0, -155 * (length - 1), 0);
        tween(this.chanceRun)
            .to(G5279Time.chanceSlotTime / 1000, { position: endPos }, { easing: 'quartInOut' })
            .call(() => {
                this.chanceRun.setPosition(new Vec3(0, 0, 0));//回歸原點
                const energyBar = this.energyBar.children[0].children[0]!;
                energyBar.getComponent(Sprite)!.spriteFrame = this.energyBarSprite[winIndex];
                this.chanceRun.children[0].getComponent(Sprite)!.spriteFrame = this.chanceSprite[winIndex];
            })
            .start();
    }

    /**
     * 增加能量
     * @param num 增加的能量
     */
    public async addEnergy(isFull: boolean = false): Promise<void> {
        return new Promise<void>(async (resolve) => {
            //如果已集滿3個就不累積
            if (this.chanceTempLayer.children.length >= 3) {
                resolve();
                return;
            }

            const maxEnergy = getG5279Model().getMaxEnergy();
            if (isFull) {
                this.currentEnergy = maxEnergy;
            } else {
                this.currentEnergy++;
            }

            const progressBar = this.energyBar.children[0]!.getComponent(ProgressBar)!;
            const progress = this.currentEnergy / maxEnergy;
            tween(progressBar).to(0.2, { progress: progress }).start();

            if (this.currentEnergy === maxEnergy) {
                const anim = this.energyBar.getComponent(Animation)!;
                anim.getState('fxEnergyFull')!.speed = getG5279Model().timeScale;
                anim.play('fxEnergyFull');
                this.getChanceCards();//獲得機會卡
                await awaitSleep(G5279Time.chanceSlotTime);//等待slot轉動完畢
                progressBar.progress = 0;
                this.energyBar.getComponent(Animation)!.play('fxEnergyIdle');
            }
            resolve();
        });
    }

    /**
     * 獲得機會道具
     * @param symID 符號ID
     */
    private async getChanceItem(symID: number) {
        this.chanceFxWin.getComponent(Animation)!.play();
        const index = (symID % 200) - 1;
        const chanceItem = instantiate(this.chanceItem[index]) as SymbolNode;
        chanceItem.symbolID = symID;
        const childrenLength = this.chanceTempLayer.children.length;
        chanceItem.setParent(this.chanceTempLayer);
        chanceItem.setPosition(this.chanceGetPos);
        const anim = chanceItem.getComponent(Animation)!;
        const animName = `chanceIcon${symID}_idle`;
        anim.getState(animName)!.speed = getG5279Model().timeScale;
        anim.play(animName);
        const endPos = this.chancePos[childrenLength];
        chanceItem.setScale(0, 0, 0);
        tween(chanceItem).to(0.3 / getG5279Model().timeScale, { scale: new Vec3(1, 1, 1) }, { easing: 'cubicOut' }).start();
        await awaitSleep(100 / getG5279Model().timeScale);
        tween(chanceItem).to(0.5 / getG5279Model().timeScale, { position: endPos }, { easing: 'cubicInOut' }).start();
    }

    /**
     * 使用機會道具(會從第一個開始演)
     */
    public async useChanceItem() {
        getAudioManager().playSound(G5279AudioName.useChance);
        const chanceItem = this.chanceTempLayer.children[0] as SymbolNode;
        chanceItem.setParent(this.chanceWinLayer);//移到表演層
        tween(chanceItem).to(0.3 / getG5279Model().timeScale, { position: new Vec3(0, 250, 0) }, { easing: 'cubicOut' }).start();
        //剩餘的機會道具重新調整位置
        for (let i = 0; i < this.chanceTempLayer.children.length; i++) {
            const chanceItem = this.chanceTempLayer.children[i];
            tween(chanceItem).to(0.3 / getG5279Model().timeScale, { position: this.chancePos[i] }, { easing: 'cubicOut' }).start();
        }
        const symID = chanceItem.symbolID;
        const anim = chanceItem.getComponent(Animation)!;
        const animName = `chanceIcon${symID}_win`;
        anim.getState(animName)!.speed = getG5279Model().timeScale;
        await playAnimFinish(anim, animName);
        chanceItem.destroy();
    }
}