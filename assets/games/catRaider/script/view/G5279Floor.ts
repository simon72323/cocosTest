import { getAudioManager } from '@common/manager/AudioManager';
import { getEventManager } from '@common/manager/EventManager';
import { getPoolManager } from '@common/manager/PoolManager';
import { NumberUtils } from '@common/utils/NumberUtils';
import { awaitSleep } from '@common/utils/tools';
import { _decorator, Animation, Component, Font, instantiate, Label, Material, Node, ParticleSystem, ParticleSystem2D, Prefab, Size, SkeletalAnimation, SkinnedMeshRenderer, Sprite, SpriteFrame, tween, UIOpacity, UITransform, Vec3 } from 'cc';

import { G5279AudioName } from '@/games/catRaider/script/data/G5279AudioEnum';
import { G5279Config } from '@/games/catRaider/script/data/G5279Config';


import { G5279SymbolIDs } from '@/games/catRaider/script/data/G5279Enum';
import { G5279Event } from '@/games/catRaider/script/data/G5279Event';


import { floors, SymbolNode } from '@/games/catRaider/script/data/G5279Interface';
import { getG5279Model, G5279Time } from '@/games/catRaider/script/model/G5279Model';


import { playAnimFinish, runScore } from '@/games/catRaider/script/tools/G5279Tools';

const { ccclass, property } = _decorator;

@ccclass('G5279Floor')
export class G5279Floor extends Component {
    @property(Node)
    private floorLayer: Node = null!;

    @property(Prefab)
    private floor: Prefab = null!;

    @property([Material])
    private floorMaterial: Material[] = [];

    @property(Node)
    private floorFxLayer: Node = null!;

    @property(Prefab)
    private floorFxLastOne: Prefab = null!;


    //------------------地面symbol相關--------------
    @property(Node)
    private floorSymLayer: Node = null!;//地板symbol層

    @property(Prefab)
    private sym101: Prefab = null!;

    @property(Prefab)
    private sym102: Prefab = null!;

    @property(Prefab)
    private symCoin: Prefab = null!;

    @property(Node)
    private symCoinWin: Node = null!;//金幣表演層

    @property(Prefab)
    private coinScore: Prefab = null!;//金幣大獎主節點

    @property([Prefab])
    private coins: Prefab[] = [];//大獎金幣

    @property([SpriteFrame])
    private coinSF: SpriteFrame[] = [];//金幣貼圖，4=暗化灰階

    @property([Font])
    private coinFont: Font[] = [];//金幣數字，4=暗化灰階

    //金幣符號位置
    private readonly coinSymPos = [
        new Vec3(108, 108, 0),
        new Vec3(216, 216, 0),
        new Vec3(324, 324, 0),
        new Vec3(756, 756, 0)
    ];

    //金幣尺寸大小
    private readonly coinSize = [
        new Size(432, 432),
        new Size(648, 648),
        new Size(864, 864),
        new Size(1728, 1728)
    ];

    //金幣倍率尺寸大小
    private readonly coinOddSize = [
        new Size(380, 220),
        new Size(570, 300),
        new Size(780, 400),
        new Size(1540, 700)
    ];

    //金幣閃光尺寸大小
    private readonly coinLightSize = [
        new Size(520, 520),
        new Size(780, 780),
        new Size(1040, 1040),
        new Size(2080, 2080)
    ];

    private readonly coinFontSizeHeight = [200, 260, 300, 480];//金幣數字大小與高度
    private readonly coinPos = {
        //金幣win的X軸偏移位置左(同時中2顆金幣以上才會用到)
        left: [
            new Vec3(-180, 0, 0),
            new Vec3(-160, 0, 0),
            new Vec3(-140, 0, 0),
            new Vec3(-120, 0, 0)
        ],
        //金幣win的X軸偏移位置右(同時中2顆金幣以上才會用到)
        right: [
            new Vec3(180, 0, 0),
            new Vec3(160, 0, 0),
            new Vec3(140, 0, 0),
            new Vec3(120, 0, 0)
        ]
    };

    //地面符號位置ID判斷，如果位置ID消除了就要清除該ID，當ID只剩下一個時，地板就會閃爍
    private nextLevelFloorID: number[] = [];//過關洞的地板ID分布(2*2)
    private coinsFloorID: number[][] = [];//地面金幣ID分布(2*2~8*8)，最多2組
    private coinsFloor: SymbolNode[] = [];//地面金幣節點

    private brokenFloorID: number[] = [];//紀錄地板破碎的posID

    /**
     * 預先生成地板pool
     */
    public async initFloorPool() {
        for (let i = 0; i < G5279Config.reelPos.length; i++) {
            const floorLvNode = new Node();
            floorLvNode.setParent(this.floorLayer);
            floorLvNode.name = `floorLv${i}`;
            floorLvNode.active = false;
            for (let j = 0; j < G5279Config.reelPos[i].length; j++) {
                const floorPool = getPoolManager().get(this.floor);
                floorPool.setPosition(G5279Config.reelPos[i][j]);
                floorPool.setScale(Vec3.ZERO);
                floorPool.setParent(floorLvNode);
                const floor = floorPool.children[0];
                const floorSplit = floor.getChildByName('box')!.getChildByName('floorSplit')!;
                floorSplit.getComponent(SkinnedMeshRenderer)!.material = this.floorMaterial[i];
            }
        }
        await awaitSleep(16);
        await this.sceneFloorReset();
    }

    /**
     * 地板重置(全部地板重置)
     */
    public async sceneFloorReset() {
        const floorParent = this.getFloorParent();
        const reelPos = getG5279Model().getCurrentReelPos();//獲得盤面等級Reel位置
        const column = Math.sqrt(reelPos.length);

        //先隱藏所有地板子節點第一個
        for (let i = 0; i < floorParent.children.length; i++) {
            this.brokenFloorID.push(i);//設置所有地板已破碎
            floorParent.children[i].children[0].active = false;
        }

        floorParent.active = true;//顯示地板層
        for (let i = 0; i < column; i++) {
            for (let j = 0; j < column; j++) {
                const posID = i * column + j;
                const floor = floorParent.children[posID];
                this.floorShow(floor, posID);
            }
            await awaitSleep(50 / getG5279Model().timeScale);
        }
        this.brokenFloorID = [];//重置破碎地板ID
    }

    /**
     * 執行地板破碎判斷
     * @param posID 地板位置ID
     * @returns 是否是最後一個地板破碎
     */
    public handleFloorBroken(posID: number) {
        //如果地板未破碎則進行破碎
        if (!this.checkFloorBroken(posID)) {
            getAudioManager().playSound(G5279AudioName.floorBroken);
            this.floorBroken(posID);//觸發地板破碎
            const isLastFloor = this.isFloorLastOne();
            if (isLastFloor) {
                //執行最後一個地板破碎表演
                getAudioManager().playSound(G5279AudioName.lastOneFloorFx);
                this.showFloorLastOne(posID);
            }
            return isLastFloor;
        }
        return false;
    }

    /**
     * 檢查地板是否已破碎
     * @param posID 地板位置ID
     * @returns 地板是否已破碎
     */
    public checkFloorBroken(posID: number) {
        return this.brokenFloorID.includes(posID);
    }

    /**
     * 執行地板破
     * @param floorPosID 地板位置ID
     */
    private floorBroken(posID: number) {
        const floorParent = this.getFloorParent();
        const floor = floorParent.children[posID];

        this.brokenFloorID.push(posID);//設置地板已破碎狀態
        floor.getChildByName('smoke')!.getComponent(ParticleSystem2D)!.resetSystem();
        const floor3D = floor.children[0];
        floor3D.getChildByName('shadow')!.active = false;//隱藏影子
        this.updateFloorRectPosID(posID);//更新過關洞與金幣範圍的位置ID分布狀況
        this.lastFloorLight();//剩下最後一個地板時要閃爍(只限前3關)

        const anim = floor3D.getChildByName('box')!.getComponent(SkeletalAnimation)!;
        anim.play('floorSplit');//播放破碎特效
        anim.once(SkeletalAnimation.EventType.FINISHED, () => {
            floor3D.active = false;
        });
    }

    /**
     * 剩下最後一個地板時要閃爍(只限前3關)
     */
    private lastFloorLight() {
        const floorParent = this.getFloorParent();
        const currentLv = getG5279Model().currentLv;
        const length = floorParent.children.length;
        if (this.brokenFloorID.length === length - 1 && currentLv < 3) {
            const allID = Array.from({ length }, (_, index) => index);
            const missingID = allID.find(id => !this.brokenFloorID.includes(id));
            (missingID! >= 0) && this.floorLight(missingID!);
        }
    }

    /**
     * 判斷是否為最後一個地板(只限前3關)
     * @returns 是否為最後一個地板
     */
    private isFloorLastOne() {
        const floorParent = this.getFloorParent();
        const currentLv = getG5279Model().currentLv;
        const length = floorParent.children.length;
        return this.brokenFloorID.length === length && currentLv < 3;
    }

    /**
     * 顯示最後一個地板特效
     * @param posID 地板位置ID
     */
    private async showFloorLastOne(posID: number) {
        const floorParent = this.getFloorParent();
        const floorFxLastOne = getPoolManager().get(this.floorFxLastOne) as Node;
        const lastFloor = floorParent.children[posID];
        floorFxLastOne.setParent(this.floorFxLayer);
        floorFxLastOne.setPosition(lastFloor.position);
        floorFxLastOne.active = true;
        const anim = floorFxLastOne.getComponent(Animation)!;
        await playAnimFinish(anim, 'floorFxLastOne');
        getPoolManager().put(floorFxLastOne);
    }

    /**
     * 隱藏當前等級地板
     */
    public hideCurrentFloor() {
        const floorParent = this.getFloorParent();
        floorParent.active = false;//隱藏當前等級地板
    }

    /**
     * 地板回歸(只回歸破碎的地板)
     */
    public async floorReset() {
        const floorParent = this.getFloorParent();
        for (let i = 0; i < floorParent.children.length; i++) {
            const floor = floorParent.children[i];
            this.floorShow(floor, i);
        }
        this.brokenFloorID = [];//重置破碎地板ID
        await awaitSleep(G5279Time.floorDropTime);
        this.removeFloorSymbol();
    }

    /**
     * 地板顯示
     * @param floor 地板節點
     */
    private floorShow(floor: Node, posID: number) {
        //如果地板未破碎直接播放初始化
        if (!this.checkFloorBroken(posID)) {
            floor.getComponent(Animation)!.play('floorIdle');//播放初始化(重置閃爍地板狀態)
            return;
        }

        const floor3D = floor.children[0];
        floor3D.getChildByName('shadow')!.active = true;//顯示影子
        const floorAnim = floor.getComponent(Animation)!;
        floorAnim.getState('floorDrop')!.speed = getG5279Model().timeScale;
        floorAnim.play('floorDrop');
        floor.setScale(Vec3.ONE);

        const anim = floor3D.getChildByName('box')!.getComponent(SkeletalAnimation)!;
        anim.off(SkeletalAnimation.EventType.FINISHED);//結束破碎時的動畫監聽
        anim.play('floorIdle');//破碎回歸正常
        floor3D.active = true;
    }

    /**
     * 地板閃爍
     * @param floorPosID 地板位置ID
     */
    private floorLight(floorPosID: number) {
        const floorParent = this.getFloorParent();
        const floor = floorParent.children[floorPosID];
        floor.getComponent(Animation)!.play('floorShake');
    }

    /**
     * 獲得地板父節點
     * @returns 地板父節點
     */
    private getFloorParent() {
        return this.floorLayer.children[getG5279Model().currentLv];
    }
    //------------------地面symbol揭露與表演--------------

    /**
     * 重置資料
     */
    private resetData() {
        this.nextLevelFloorID = [];//重置過關洞地板ID分布
        this.coinsFloorID = [];//重置地面金幣ID分布
        this.coinsFloor = [];//重置地面金幣節點
    }

    /**
     * 生成地面symbol
     * @param floorData 地板資料
     */
    public createFloorSymbol(floorData: floors) {
        const { grids, symbolIDs, payoff } = floorData;
        const reelPos = getG5279Model().getCurrentReelPos();//獲得盤面等級Reel位置
        const column = Math.sqrt(reelPos.length);//每行符號數量
        this.resetData();//重置資料
        for (let i = 0; i < grids.length; i++) {
            const symID = symbolIDs![i];
            const posID = grids![i];
            const coinPayoff = payoff![i];

            const floorSymbol = getPoolManager().get(this.getPrefabBySymID(symID)) as SymbolNode;

            floorSymbol.symbolID = symID;
            floorSymbol.posID = posID;
            floorSymbol.setParent(this.floorSymLayer);
            floorSymbol.setPosition(reelPos[posID]);

            if (symID === 101) {
                floorSymbol.getComponent(Animation)!.play('sym101Idle');
            }

            //如果是金幣(111~120)
            if (symID > 110) {
                this.setCoin(floorSymbol, symID, coinPayoff);
            }

            //設置地板符號位置ID分布
            this.setFloorRectPosID(symID, posID, column);
        }

        //調整鼠洞顯示在最上層
        const floorLength = this.floorSymLayer.children.length;
        for (let i = 0; i < floorLength; i++) {
            const floorSym = this.floorSymLayer.children[i] as SymbolNode;
            if (floorSym.symbolID === 102) {
                floorSym.setSiblingIndex(floorLength - 1);
                break;
            }
        }
        this.setCoinCover();//設置金幣是否被蓋住
    }

    /**
     * 設置金幣
     * @param floorSymbol 地板符號節點
     * @param symID 符號ID
     * @param coinPayoff 金幣中獎金額
     */
    private setCoin(floorSymbol: SymbolNode, symID: number, coinPayoff: number) {
        //設置金幣上面的倍率數值
        const sym = floorSymbol.getChildByName('sym')!;
        const odds = sym.getChildByName('odds')!;
        const light = sym.getChildByName('light')!;
        const payTable = getG5279Model().getPayTable();
        const coinOdds = payTable[`${symID}`][0];
        odds.getComponent(Label)!.string = `${coinOdds}x`;//設置金幣倍率
        odds.getComponent(Label)!.customMaterial = null;

        //設置金幣參數
        const coinIndex = symID <= 113 ? 0 : symID <= 116 ? 1 : symID <= 119 ? 2 : 3;
        sym.setPosition(this.coinSymPos[coinIndex]);
        sym.getComponent(Sprite)!.spriteFrame = this.coinSF[coinIndex];
        sym.getComponent(UITransform)!.setContentSize(this.coinSize[coinIndex]);
        odds.getComponent(UITransform)!.setContentSize(this.coinOddSize[coinIndex]);
        light.getComponent(UITransform)!.setContentSize(this.coinLightSize[coinIndex]);
        odds.getComponent(Label)!.font = this.coinFont[coinIndex];
        odds.getComponent(Label)!.fontSize = this.coinFontSizeHeight[coinIndex];
        odds.getComponent(Label)!.lineHeight = this.coinFontSizeHeight[coinIndex];

        floorSymbol.payoff = coinPayoff;//設置地板符號中獎金額
        floorSymbol.isCoinCover = false;//設置是否被上層金幣蓋住(預設false)
        this.coinsFloor.push(floorSymbol);//紀錄金幣節點
        floorSymbol.getComponent(Animation)!.play('symCoinIdle');
    }

    /**
     * 獲得符號節點
     * @param symID 符號ID
     * @returns 符號節點
     */
    private getPrefabBySymID(symID: number): Prefab {
        if (symID === 101) return this.sym101;
        if (symID === 102) return this.sym102;
        return this.symCoin;
    }

    /**
     * 設置金幣是否被蓋住(只有下層金幣需判斷)
     */
    private setCoinCover() {
        if (this.coinsFloorID.length < 2) return;
        //有兩顆金幣才設置
        const arr1 = this.coinsFloorID[0];
        const arr2 = this.coinsFloorID[1];
        const set1 = new Set(arr1);
        if (arr2.some(item => set1.has(item))) {
            this.coinsFloor[0].isCoinCover = true;//記錄該金幣被蓋住
        }
    }

    /**
     * 設置地板符號位置ID數組
     * @param symID 符號ID
     * @param posID 位置ID
     * @param column 列數
     */
    public setFloorRectPosID(symID: number, posID: number, column: number) {
        switch (symID) {
            case 101:
                this.nextLevelFloorID = this.getRectPosIDs(posID, column, 2);
                break;
            case 111:
            case 112:
            case 113:
                this.coinsFloorID.push(this.getRectPosIDs(posID, column, 2));
                break;
            case 114:
            case 115:
            case 116:
                this.coinsFloorID.push(this.getRectPosIDs(posID, column, 3));
                break;
            case 117:
            case 118:
            case 119:
                this.coinsFloorID.push(this.getRectPosIDs(posID, column, 4));
                break;
            case 120:
                const rectPosIDs = this.getRectPosIDs(posID, column, 8);
                const missPosID = new Set([0, 7, 50, 63]);
                // 過濾掉missPosID中的位置(四個角落)
                const filteredPosIDs = rectPosIDs.filter(posID => !missPosID.has(posID));
                this.coinsFloorID.push(filteredPosIDs);
                break;
        }
    }

    /**
     * 計算矩形區域的所有位置ID(獲得該symbol的位置範圍)
     * @param startPosID 起始位置ID
     * @param column 總列數
     * @param rect 矩形數量
     * @returns 位置ID數組
     */
    private getRectPosIDs(startPosID: number, column: number, rect: number): number[] {
        const posIDs: number[] = [];
        for (let row = 0; row < rect; row++) {
            for (let col = 0; col < rect; col++) {
                const posID = startPosID + (row * column) + col;
                posIDs.push(posID);
            }
        }
        return posIDs;
    }

    /**
     * 更新過關洞與金幣範圍的位置ID分布狀況(判斷何時揭露用，只針對過關洞做地板閃爍)
     * @param posID 位置ID
     */
    private updateFloorRectPosID(posID: number) {
        //移除地面金幣ID分布
        for (const coinsFloorID of this.coinsFloorID) {
            const findID = coinsFloorID.indexOf(posID);
            if (findID !== -1) {
                coinsFloorID.splice(findID, 1);
                //如果地板ID分布只剩下一個，則剩下的地板要閃爍
                if (coinsFloorID.length === 1) {
                    this.floorLight(coinsFloorID[0]);
                }
            }
        }

        //移除過關洞地板ID分布
        const index = this.nextLevelFloorID.indexOf(posID);
        if (index !== -1) {
            this.nextLevelFloorID.splice(index, 1);
            //如果地板ID分布只剩下一個，則剩下的地板要閃爍
            if (this.nextLevelFloorID.length === 1) {
                this.floorLight(this.nextLevelFloorID[0]);
            }
            if (this.nextLevelFloorID.length === 0) {
                for (const floorSym of this.floorSymLayer.children) {
                    //判斷過關洞揭露
                    if ((floorSym as SymbolNode).symbolID === G5279SymbolIDs.nextLevel) {
                        getAudioManager().playSound(G5279AudioName.getSceneLevelUp);
                        floorSym.getComponent(Animation)!.play('sym101Win');
                    }
                }
            }
        }
    }

    /**
     * 判斷是否表演金幣獲得
     * @returns 金幣表演完
     */
    public async showCoins(): Promise<number> {
        return new Promise(async resolve => {
            const coinNode: SymbolNode[] = [];//要揭露的coin
            //重後面開始判斷，因為最上層要最先揭露
            const length = this.coinsFloorID.length;
            //判斷第一枚金幣
            if (length > 1 && this.coinsFloorID[1].length === 0) {
                const coin = this.coinsFloor[1];
                if (coin) {
                    coinNode.push(coin);//該金幣加入表演陣列內
                    this.coinsFloor[1] = null!;
                }
            }

            //判斷第二枚金幣
            if (length > 0 && this.coinsFloorID[0].length === 0) {
                const coin = this.coinsFloor[0];
                const isUpperCoinRevealed = length > 1 && this.coinsFloorID[1].length === 0;
                //金幣未被覆蓋 或 上層金幣已揭露
                if (coin && (!coin.isCoinCover || isUpperCoinRevealed)) {
                    coinNode.push(coin);//該金幣加入表演陣列內
                    this.coinsFloor[0] = null!;
                }
            }

            //如果沒有金幣揭露就直接返回0分
            if (coinNode.length === 0) {
                resolve(0);
                return;
            }
            const coinPayoff = await this.createCoinScore(coinNode);//生成中獎分數並跑分
            resolve(coinPayoff);
        });
    }

    /**
     * 生成並播放金幣粒子特效(播完後自動移除)
     * @param coinNode 金幣節點
     * @returns 金幣得分
     */
    private async createCoinScore(coinNode: SymbolNode[]): Promise<number> {
        return new Promise(async resolve => {
            //金幣的時間會是1,1.5,2(其他維持1,2,3)
            const timeScale = 0.5 * getG5279Model().timeScale + 0.5;
            const symCoinWinUIOpacity = this.symCoinWin.getComponent(UIOpacity)!;
            symCoinWinUIOpacity.opacity = 255;

            // 黑底淡入
            const black = this.symCoinWin.getChildByName('black')!;
            const blackUIOpacity = black.getComponent(UIOpacity)!;
            blackUIOpacity.opacity = 0;
            tween(blackUIOpacity).to(0.2, { opacity: 128 }, { easing: 'sineOut' }).start();

            //計算揭露金幣的總得分
            let coinPayoff = 0;
            for (const coin of coinNode) {
                coinPayoff = NumberUtils.accAdd(coinPayoff, coin.payoff);
            }
            const coinScore = instantiate(this.coinScore);
            coinScore.setParent(this.symCoinWin);
            coinScore.setPosition(new Vec3(0, -400, 0));

            //播放金幣粒子
            const particle = coinScore.getChildByName('coinParticle')!;
            const particleSystem = particle.getComponent(ParticleSystem)!;
            particleSystem.duration = 1.3;
            particleSystem.simulationSpeed = timeScale;//粒子加速
            particleSystem.play();
            getAudioManager().playSound(G5279AudioName.coinLoop, true);

            //生成金幣大獎節點
            this.createCoinWin(coinNode);

            //表演金幣大獎跑分
            const scoreLabel = coinScore.getChildByName('label')!.getComponent(Label)!;
            runScore(1 / timeScale, 0, coinPayoff, scoreLabel);

            const anim = coinScore.getComponent(Animation)!;
            anim.getState('coinScoreShow')!.speed = timeScale;
            await playAnimFinish(anim, 'coinScoreShow');
            getAudioManager().stopSound(G5279AudioName.coinLoop);//停止金幣loop音效
            anim.getState('coinScoreFinish')!.speed = timeScale;
            anim.play('coinScoreFinish');
            await awaitSleep(700 / timeScale);
            resolve(coinPayoff);
            tween(symCoinWinUIOpacity).to(0.2, { opacity: 0 }, { easing: 'sineOut' }).call(() => {
                coinScore.destroy();
                this.symCoinWin.getChildByName('coinLayer')!.destroyAllChildren();
            }).start();
        });
    }

    /**
     * 生成金幣大獎節點
     * @param coinNode 金幣節點
     */
    private async createCoinWin(coinNode: SymbolNode[]) {
        const timeScale = 0.5 * getG5279Model().timeScale + 0.5;
        const coinWinNode: Node[] = [];//要表演的金幣大獎節點
        const coinWinIndex: number[] = [];//要表演的金幣大獎節點索引

        for (const coin of coinNode) {
            const anim = coin.getComponent(Animation)!;
            anim.getState('symCoinGet')!.speed = timeScale;
            anim.play('symCoinGet');//播放已獲得動態

            //設置金幣數字變暗化灰階
            const odds = coin.getChildByName('sym')!.getChildByName('odds')!;
            coin.getChildByName('sym')!.getComponent(Sprite)!.spriteFrame = this.coinSF[4];
            odds.getComponent(Label)!.font = this.coinFont[4];
        }

        for (let i = 0; i < coinNode.length; i++) {
            getAudioManager().playSound(G5279AudioName.getCoin);
            //生成金幣win
            const symID = coinNode[i].symbolID;
            const index = symID <= 113 ? 0 : symID <= 116 ? 1 : symID <= 119 ? 2 : 3;
            const instCoinWin = instantiate(this.coins[index]);

            //設置賠率貼圖
            const odd = instCoinWin.getChildByName('sym')!.getChildByName('odd')!;
            const payTable = getG5279Model().getPayTable();
            const coinOdds = payTable[`${symID}`][0];
            odd.getComponent(Label)!.string = `${coinOdds}x`;
            const coinLayer = this.symCoinWin.getChildByName('coinLayer')!;
            instCoinWin.setParent(coinLayer);
            instCoinWin.setSiblingIndex(0);
            instCoinWin.setPosition(new Vec3(0, 0, 0));
            const anim = instCoinWin.getComponent(Animation)!;
            anim.getState('coinGet')!.speed = timeScale;
            anim.play('coinGet');//播放金幣金幣獲獎動態
            const starParticle = instCoinWin.getChildByName('starParticle')!;
            const particleSystem = starParticle.getComponent(ParticleSystem)!;
            particleSystem.duration = 1.5;
            // particleSystem.simulationSpeed = timeScale;//粒子加速
            particleSystem.play();

            //紀錄大獎金幣資料
            coinWinNode.push(instCoinWin);
            coinWinIndex.push(index);

            //如果有第二枚金幣，第一枚金幣往右移
            if (i === 1) {
                coinWinNode[1].setPosition(this.coinPos.left[coinWinIndex[1]]);
                tween(coinWinNode[0])
                    .to(0.2 / timeScale, { position: this.coinPos.right[coinWinIndex[0]] }, { easing: 'sineOut' })
                    .start();
            }

            await awaitSleep(200 / timeScale);//表演第二枚金幣揭露等0.2秒
            getEventManager().emit(G5279Event.shake);//大震動
            getAudioManager().playSound(G5279AudioName.showMultiplySym);
        }
    }

    /**
     * 移除地板symbol
     */
    public removeFloorSymbol() {
        while (this.floorSymLayer.children.length > 0) {
            const floorSymbol = this.floorSymLayer.children[0];
            floorSymbol.getComponent(UIOpacity)!.opacity = 255;
            getPoolManager().put(floorSymbol);
        }
    }

    /**
     * 移動老鼠洞
     */
    public moveRatHole(pos: Vec3) {
        const ratHole = this.floorSymLayer.children.find(child =>
            (child as SymbolNode).symbolID === G5279SymbolIDs.ratHole
        );
        ratHole && ratHole.setPosition(pos);
    }

    /**
     * 移除老鼠洞
     */
    public removeRatHole() {
        const ratHole = this.floorSymLayer.children.find(child =>
            (child as SymbolNode).symbolID === G5279SymbolIDs.ratHole
        );
        ratHole && getPoolManager().put(ratHole);
    }
    //------------------地面symbol揭露與表演--------------
}