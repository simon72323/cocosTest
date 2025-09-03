import { getAudioManager } from '@common/manager/AudioManager';
import { getPoolManager } from '@common/manager/PoolManager';
import { awaitSleep } from '@common/utils/tools';
import { _decorator, Animation, Color, Component, Label, Node, Prefab, sp, Sprite, tween, UIOpacity, Vec3 } from 'cc';

import { G5279AudioName } from '@/games/catRaider/script/data/G5279AudioEnum';
import { G5279Config } from '@/games/catRaider/script/data/G5279Config';
import { G5279GameState } from '@/games/catRaider/script/data/G5279Enum';
import { G5279SymbolIDs } from '@/games/catRaider/script/data/G5279Enum';
import { SymbolNode } from '@/games/catRaider/script/data/G5279Interface';
import { G5279Resources } from '@/games/catRaider/script/data/G5279Resources';
import { getG5279Model, G5279Time } from '@/games/catRaider/script/model/G5279Model';
import { playAnimFinish, playSpineFinish } from '@/games/catRaider/script/tools/G5279Tools';

const { ccclass, property } = _decorator;

@ccclass('G5279Symbol')
export class G5279Symbol extends Component {
    @property(Node)
    private symLayer: Node = null!;//symbol層

    @property(Node)
    private symWinLayer: Node = null!;//symbol勝利表演層

    @property([Prefab])
    private symChr: Prefab[] = [];

    @property(Node)
    private chrScore: Node = null!;//角色分數

    @property(Node)
    private ratScore: Node = null!;//盜鼠分數

    @property(Prefab)
    private symGem: Prefab = null!;

    @property([Prefab])
    private symItem: Prefab[] = [];

    @property(Prefab)
    private symRat: Prefab = null!;

    @property(Prefab)
    private ratGem: Prefab = null!;

    @property(Prefab)
    private symFxReflash: Prefab = null!;

    @property(G5279Resources)
    private resources: G5279Resources = null!;

    private tempSymChr: SymbolNode[] = [];
    private symChrArrayID: number[] = [1, 2, 3, 4];
    private symItemArrayID: number[] = [51, 52, 53, 54, 55];

    //四個增亮用顏色(紅、黃、綠、藍)
    private symColor: Color[] = [
        new Color(140, 0, 20, 255),
        new Color(150, 100, 0, 255),
        new Color(0, 130, 0, 255),
        new Color(0, 70, 150, 255)
    ];

    //寶石八個階段陰影位置
    private symGemShadowPos: Vec3[] = [
        new Vec3(0, -55, 0),
        new Vec3(0, -55, 0),
        new Vec3(0, -55, 0),
        new Vec3(0, -55, 0),
        new Vec3(0, -60, 0),
        new Vec3(0, -60, 0),
        new Vec3(0, -65, 0),
        new Vec3(0, -65, 0)
    ];

    //寶石八個階段陰影高度
    private symGemShadowScale: Vec3[] = [
        new Vec3(1.8, 0.6, 1),
        new Vec3(1.8, 0.6, 1),
        new Vec3(2, 0.6, 1),
        new Vec3(2.4, 0.6, 1),
        new Vec3(2.4, 1, 1),
        new Vec3(2.4, 1, 1),
        new Vec3(2.8, 1.2, 1),
        new Vec3(3, 1.2, 1)
    ];

    async onLoad() {
        //初始化建立symbol層級
        const reelLength = G5279Config.reelPos.length;
        const maxCount = G5279Config.reelPos[reelLength - 1].length;
        for (let i = 0; i < maxCount; i++) {
            const symLayer = new Node();
            symLayer.setParent(this.symLayer);
            symLayer.name = `symLayer_${i}`;
            symLayer.setSiblingIndex(0);
        }
        for (const symbol of this.symChr) {
            this.tempSymChr.push(getPoolManager().get(symbol) as SymbolNode);
        }
        await awaitSleep(3000);
        for (const symbol of this.tempSymChr) {
            this.runRandomIdle(symbol);//執行角色待機動態
        }
    }

    /**
     * 將角色變化為殭屍
     */
    public changeZombieChr() {
        for (let i = 0; i < this.symLayer.children.length; i++) {
            const childLayer = this.symLayer.children[i]!;
            const symbol = childLayer.children[0]! as SymbolNode;
            if (symbol && symbol.symbolID < 5) {
                const anim = symbol.getComponent(Animation)!;
                anim.getState('zombie')!.speed = getG5279Model().timeScale;
                anim.play('zombie');//變化為殭屍
            }
        }
    }

    /**
     * 設置symbol勝利表演層
     * @param winSymbol 勝利表演symbol
     */
    public symbolToWinLayer(winSymbol: SymbolNode) {
        winSymbol.setParent(this.symWinLayer);//移到symbol勝利表演層
    }

    /**
     * 獲得symbol層級的symbol節點
     * @param posID 位置ID
     * @returns 
     */
    public getSymbolByLayer(posID: number) {
        let symbol = this.symLayer.getChildByName(`symLayer_${posID}`)?.children[0];
        return symbol as SymbolNode;
    }

    /**
     * 設置symbol顯示層級
     * @param symbol 角色symbol
     * @param posID 位置ID
     */
    public setSymbolToLayer(symbol: Node, posID: number) {
        symbol.setParent(this.symLayer.getChildByName(`symLayer_${posID}`)!);
    }

    /**
     * 執行symbol抖動表演
     * @param posID 位置ID
     * @param shakeTime 抖動時間(毫秒)
     */
    public runSymLayerAnim(posID: number, shakeTime: number) {
        const symLayer = this.symLayer.getChildByName(`symLayer_${posID}`)!;
        tween(symLayer)
            .to(shakeTime / 1666, { position: new Vec3(0, 0, 70) }, { easing: 'cubicOut' })
            .to(shakeTime / 1666, { position: new Vec3(0, 0, 0) }, { easing: 'cubicIn' })
            .start();
    }

    /**
     * 盤面symbol退出(等待所有symbol退出)
     */
    public async symbolOut() {
        const reelPos = getG5279Model().getCurrentReelPos();//獲得盤面等級Reel位置
        const isZombieParty = getG5279Model().gameState === G5279GameState.ON_ZOMBIE_PARTY;
        const column = Math.sqrt(reelPos.length);//列數
        const movePromises: Promise<void>[] = [];
        for (let i = this.symLayer.children.length - 1; i >= 0; i--) {
            const symbol = this.symLayer.children[i].children[0] as SymbolNode;
            //如果symbol不存在則跳過
            if (!symbol) continue;

            //僵屍派對模式，角色不移動
            if (symbol.symbolID < 5 && isZombieParty) continue;

            // 將每个symbolMoveOut的Promise添加到數組中
            movePromises.push(this.symbolMoveOut(symbol));
            //正常速度，每行symbol等待，加速模式，不等待
            if (getG5279Model().timeScale === 1 && i % column === 0) {
                await awaitSleep(10 / getG5279Model().timeScale);
            }
        }
        await Promise.all(movePromises);
    }

    /**
     * 盤面symbol退出(直接退出不等待)
     * @param isNextLevel 是否為下一關
     */
    public putSymbolLayer(isNextLevel: boolean) {
        for (let i = this.symLayer.children.length - 1; i >= 0; i--) {
            const symbol = this.symLayer.children[i].children[0] as SymbolNode;
            if (!symbol) continue;//如果symbol不存在則跳過
            //如果是下一關，且是角色符號，則執行角色落下
            if (isNextLevel && symbol.symbolID < 5) {
                this.chrFall(symbol);
            } else {
                this.symbolMoveOut(symbol);
            }
        }
    }

    /**
     * 盤面symbol退出
     * @param symbol 
     */
    private async symbolMoveOut(symbol: SymbolNode): Promise<void> {
        return new Promise(async resolve => {
            const reelPos = getG5279Model().getCurrentReelPos();//獲得盤面等級Reel位置
            const symbolHeight = G5279Config.baseSymbolSize.height;
            const column = Math.sqrt(reelPos.length);
            const moveYPos = symbolHeight * column + symbolHeight;//移動距離
            symbol.setParent(this.symWinLayer);
            const symbolPos = symbol.getPosition();
            const moveToPos = new Vec3(symbolPos.x, symbolPos.y - moveYPos, symbolPos.z);

            const anim = symbol.getComponent(Animation)!;
            if (anim.getState('moveOut')) {
                anim.play('moveOut');
            }
            tween(symbol)
                .to(G5279Time.symbolDownTime / 1000, { position: moveToPos }, { easing: 'sineOut' })
                .call(() => {
                    if (symbol.symbolID < 5)
                        symbol.active = false;//如果是角色要隱藏
                    this.putSymbol(symbol);
                    resolve();
                })
                .start();
        });
    }

    /**
     * 表演老鼠分數
     * @param ratScore 分數
     * @param position 位置
     */
    public async showRatScore(ratScore: number, position: Vec3) {
        !this.ratScore.active && (this.ratScore.active = true);
        this.ratScore.setPosition(position);
        this.ratScore.children[0]!.getComponent(Label)!.string = ratScore.toString();
        const anim = this.ratScore.getComponent(Animation)!;
        anim.getState('ratScoreAdd')!.speed = getG5279Model().timeScale;
        await playAnimFinish(anim, 'ratScoreAdd');
        this.ratScore.active = false;
    }

    /**
     * 顯示角色分數
     * @param nextScore 分數
     */
    public showChrScore(nextScore: number) {
        !this.chrScore.active && (this.chrScore.active = true);
        this.chrScore.children[0]!.getComponent(Label)!.string = nextScore.toString();
        const anim = this.chrScore.getComponent(Animation)!;
        anim.getState('chrScoreAdd')!.speed = getG5279Model().timeScale;
        anim.play('chrScoreAdd');
    }

    /**
     * 隱藏角色分數
     */
    public hideChrScore() {
        this.chrScore.active = false;
    }

    /**
     * 蒐集寶石
     * @param gemSymbol 寶石symbol
     */
    public gemCollect(gemSymbol: SymbolNode) {
        const gemAnim = gemSymbol.getComponent(Animation)!;
        gemAnim.getState('collect').speed = getG5279Model().timeScale;
        gemAnim.play('collect');
    }

    /**
     * 老鼠收集
     * @param rat 老鼠
     */
    public ratCollect(rat: Node) {
        const ratAnim = rat.getComponent(Animation)!;
        ratAnim.getState('collect').speed = getG5279Model().timeScale;
        ratAnim.play('collect');
        const skeleton = rat.getChildByName('sym')!.getComponent(sp.Skeleton)!;
        skeleton.timeScale = getG5279Model().timeScale;
        skeleton.setAnimation(0, 'collect', false);
    }

    /**
     * 角色移動
     * @param chrSymbol 角色symbol
     * @param currentPos 當前位置
     * @param nextPos 下一個位置
     * @param winSymID 中獎symbolID
     */
    public async chrMove(chrSymbol: Node, currentPos: Vec3, nextPos: Vec3, winSymID: number): Promise<void> {
        return new Promise(async resolve => {
            const isZombieParty = getG5279Model().gameState === G5279GameState.ON_ZOMBIE_PARTY;
            const chrSym = isZombieParty ? chrSymbol.getChildByName('symZombie')! : chrSymbol.getChildByName('sym')!;
            const skeleton = chrSym.getComponent(sp.Skeleton)!;
            let moveTime = 0;
            if (currentPos.x !== nextPos.x) {
                // 角色朝向?右:左
                currentPos.x < nextPos.x ? chrSymbol.setScale(1, 1, 1) : chrSymbol.setScale(-1, 1, 1);
            }
            if (winSymID === G5279SymbolIDs.rat) {
                skeleton.timeScale = getG5279Model().timeScale;//擊殺加速
                skeleton.setAnimation(0, 'step', false);//角色擊殺老鼠
                moveTime = 400 / getG5279Model().timeScale;
            } else {
                const animName = skeleton?.animation;
                (animName && animName !== 'move') && skeleton.setAnimation(0, 'move', true);//播放角色移動
                moveTime = G5279Time.chrMoveTime;
            }

            //加速時間大於2倍，角色極速移動
            if (getG5279Model().timeScale > 2) {
                this.chrScore.setPosition(nextPos);
                chrSymbol.setPosition(nextPos);
                resolve();
            } else {
                tween(this.chrScore).to(moveTime / 1000, { position: nextPos }).start();
                tween(chrSymbol).to(moveTime / 1000, { position: nextPos }).call(() => {
                    resolve();
                }).start();
            }
        });
    }

    /**
     * 隨機切換角色待機動態
     * @param symbol 
     */
    private async runRandomIdle(symbol: Node) {
        await awaitSleep(Math.random() * 5000 + 5000);//隨機等待5~15秒切換待機動態
        const chrSkeleton = symbol.getChildByName('sym')!.getComponent(sp.Skeleton)!;
        const chrZombieSkeleton = symbol.getChildByName('symZombie')!.getComponent(sp.Skeleton)!;
        const isZombieParty = getG5279Model().gameState === G5279GameState.ON_ZOMBIE_PARTY;
        const animID = Math.ceil(Math.random() * 3);
        if (isZombieParty) {
            if (chrZombieSkeleton.animation === 'idle') {
                await playSpineFinish(chrZombieSkeleton, `idle_random${animID}`);
            }
        } else {
            if (chrSkeleton.animation === 'idle') {
                await playSpineFinish(chrSkeleton, `idle_random${animID}`);
            }
        }
        if (isZombieParty) {
            if (chrZombieSkeleton.animation.includes('idle_')) {
                chrZombieSkeleton.setAnimation(0, 'idle', true);//回歸正常待機狀態
            }
        } else {
            if (chrSkeleton.animation.includes('idle_')) {
                chrSkeleton.setAnimation(0, 'idle', true);//回歸正常待機狀態
            }
        }
        this.runRandomIdle(symbol);//繼續執行
    }

    /**
     * 取得symbol
     * @param symID 符號ID
     */
    public getSymbol(symID: number, posID: number) {
        let symPool: SymbolNode;
        switch (true) {
            case symID < 10:
                const symPos = this.symChrArrayID.indexOf(symID);
                symPool = this.tempSymChr[symPos];
                // symPool.active = true;
                break;
            case symID < 50:
                symPool = getPoolManager().get(this.symGem) as SymbolNode;
                const sym = symPool.getChildByName('sym')!;
                const shadowID = Math.floor(symID % 10) - 1;
                const shadow = symPool.getChildByName('shadow')!;
                shadow.setPosition(this.symGemShadowPos[shadowID]);
                shadow.setScale(this.symGemShadowScale[shadowID]);
                //設置貼圖
                const symGemPos = this.resources.symArrayID.indexOf(symID);
                sym.getComponent(Sprite)!.spriteFrame = this.resources.symSF[symGemPos];
                sym.getChildByName('symAdd')!.getComponent(Sprite)!.spriteFrame = this.resources.symSF[symGemPos];
                sym.getChildByName('blur')!.getComponent(Sprite)!.spriteFrame = this.resources.symBlurSF[symGemPos];
                //設置色系
                const colorID = Math.floor(symID / 10) - 1;
                const circle = symPool.getChildByName('circle')!;
                circle.children[0]!.getComponent(Sprite)!.color = this.symColor[colorID];
                circle.children[1]!.getComponent(Sprite)!.color = this.symColor[colorID];
                const fxLevelUp = symPool.getChildByName('fxLevelUp')!;
                fxLevelUp.children[1]!.getComponent(Sprite)!.color = this.symColor[colorID];
                break;
            case symID < 56:
                const itemPos = this.symItemArrayID.indexOf(symID);
                symPool = getPoolManager().get(this.symItem[itemPos]) as SymbolNode;
                symPool.getComponent(Animation)!.play('idle');
                const skeleton = symPool.getChildByName('sym')!.getComponent(sp.Skeleton)!;
                this.scheduleOnce(() => {
                    skeleton.setAnimation(0, 'idle', true);
                    symID === G5279SymbolIDs.wild && skeleton.setSkin('00');
                }, 0);
                break;
            case symID === G5279SymbolIDs.rat:
                symPool = getPoolManager().get(this.symRat) as SymbolNode;
                break;
        }

        symPool!.symbolID = symID;
        symPool!.posID = posID;
        symPool!.isWin = false;//設置為未中獎狀態
        return symPool!;
    }

    /**
     * 生成老鼠蒐集的寶石
     * @param ratGems 老鼠蒐集的寶石ID
     * @param ratSymbol 老鼠符號節點
     */
    private async createRatGem(ratGems: number[], ratSymbol: Node) {
        for (const gemID of ratGems) {
            const ratGem = getPoolManager().get(this.ratGem);
            const sym = ratGem.getChildByName('sym')!;
            const gemPos = this.resources.symArrayID.indexOf(gemID);
            sym.getComponent(Sprite)!.spriteFrame = this.resources.symSF[gemPos];
            ratGem.setParent(this.symWinLayer);
            const ratPos = ratSymbol.getPosition();
            ratGem.setPosition(ratPos);
            const randomX = Math.random() * 600 - 300;
            const randomY = Math.random() * 400 - 150;
            const movePos = new Vec3(ratPos.x + randomX, ratPos.y + randomY, 0);
            getAudioManager().playOnceSound(G5279AudioName.getSym);
            const uiOpacity = ratGem.getComponent(UIOpacity)!;
            uiOpacity.opacity = 255;
            await awaitSleep(3);
            const moveYPos = new Vec3(0, 200 + Math.random() * 250, 0);
            tween(sym).to(0.15, { position: moveYPos }, { easing: 'sineOut' }).call(() => {
                tween(sym).to(0.55, { position: new Vec3(0, 10, 0) }, { easing: 'bounceOut' }).start();
            }).start();
            tween(ratGem).to(0.7, { position: movePos }, { easing: 'sineOut' }).call(() => {
                tween(uiOpacity).to(0.2, { opacity: 0 }).call(() => {
                    getPoolManager().put(ratGem);
                }).start();
            }).start();
        }
    }

    /**
     * 播放symbol勝利動畫(針對寶石跟道具，符號11~60)
     * @param symbol 符號節點
     * @param symID 符號ID
     * @param chrID 角色ID
     * @param ratDir 老鼠方向(1:左，-1:右)
     */
    public async playSymWin(symbol: SymbolNode, symID: number, chrID: number, ratDir: number = 1) {
        symbol.isWin = true;//設置為中獎狀態
        const sym = symbol.getChildByName('sym')!;

        if (symID === G5279SymbolIDs.rat) {
            const skeleton = sym.getComponent(sp.Skeleton)!;
            symbol.setScale(ratDir, 1, 1);//老鼠左右方向
            getAudioManager().playSound(G5279AudioName.ratShock);
            skeleton.setAnimation(0, 'scare', true);//老鼠害怕動態
            return;
        }

        symbol.getComponent(Animation)!.play('win');

        //寶石星星動態切換
        if (symID < 50) {
            const animName = symID % 10 < 5 ? 'star1' : 'star2';
            sym.getChildByName('star')!.getComponent(Animation)!.play(animName);
        }

        if (symID === G5279SymbolIDs.wild) {
            const skeleton = sym.getComponent(sp.Skeleton)!;
            skeleton.setSkin(`0${chrID}`);
            skeleton.setAnimation(0, 'win', true);
        } else if (symID === G5279SymbolIDs.gemLevelUp) {
            const skeleton = sym.getComponent(sp.Skeleton)!;
            skeleton.setAnimation(0, 'win', true);
        }
    }

    /**
     * 老鼠受擊飛出
     * @param symbol 符號節點
     * @param reelPos 盤面位置
     * @param ratGemIDs 老鼠蒐集的寶石ID
     */
    public async ratRemove(symbol: SymbolNode, reelPos: Vec3[], ratGemIDs: number[]) {
        this.createRatGem(ratGemIDs, symbol);
        const podID = symbol.posID;
        const column = Math.sqrt(reelPos.length);//該等級的列數
        const dir = podID % column < (column / 2) ? 1 : -1;//判斷盜鼠擊飛的方向(位於左側是正常，右側是反向)
        symbol.getComponent(Animation)!.play('remove');
        symbol.setScale(dir, 1, 1);//老鼠左右方向
        const ratSkeleton = symbol.getChildByName('sym')!.getComponent(sp.Skeleton)!;
        await playSpineFinish(ratSkeleton, 'hit');//老鼠受擊飛出
        this.putSymbol(symbol);
    }

    /**
     * 播放symbol轉換動畫
     * @param posID 位置ID
     * @param newSymID 新符號ID
     */
    public async symbolChange(posID: number, newSymID: number) {
        const symbol = this.getSymbolByLayer(posID);
        const pos = symbol.getPosition();
        const parent = symbol.parent!;

        //播放轉換特效
        this.createFxReflash(pos, parent);

        //播放symbol轉換前動畫
        const anim = symbol.getComponent(Animation)!;
        anim.getState('changeStart')!.speed = getG5279Model().timeScale;
        await playAnimFinish(anim, 'changeStart');
        this.putSymbol(symbol);

        //生成新symbol
        const newSymbol = this.getSymbol(newSymID, posID);
        newSymbol.setParent(parent);
        newSymbol.setSiblingIndex(0);//顯示在最下層
        newSymbol.setPosition(pos);

        //播放symbol轉換後動畫
        const newAnim = newSymbol.getComponent(Animation)!;
        newAnim.getState('change')!.speed = getG5279Model().timeScale;
        await playAnimFinish(newAnim, 'change');
        newAnim.play('idle');
    }

    /**
     * 創建轉換特效
     * @param pos 位置
     * @param parent 父節點
     */
    private async createFxReflash(pos: Vec3, parent: Node) {
        const fxReflash = getPoolManager().get(this.symFxReflash);
        fxReflash.setParent(parent);
        fxReflash.setPosition(pos);
        const anim = fxReflash.getComponent(Animation)!;
        anim.getState('fxReflash')!.speed = getG5279Model().timeScale;
        await playAnimFinish(anim, 'fxReflash');
        getPoolManager().put(fxReflash);
    }

    /**
     * 退回symbol
     * @param symbol 符號節點
     */
    public putSymbol(symbol: Node) {
        //UIOpacity透明度設置會影響到所有子節點。當物件被放回對象池時，需要確保將透明度重置為原始值。
        const uiOpacity = symbol.getComponent(UIOpacity);
        uiOpacity && (uiOpacity.opacity = 255);
        getPoolManager().put(symbol);
    }

    //--------------symbol表演事件--------------
    /**
     * 角色生成下落
     * @param symbol 
     */
    public async chrDrop(symbol: Node) {
        const anim = symbol.getComponent(Animation)!;
        anim.getState('drop').speed = getG5279Model().timeScale;
        anim.play('drop');
        await awaitSleep(200 / getG5279Model().timeScale);
        const skeleton = symbol.getChildByName('sym')!.getComponent(sp.Skeleton)!;
        skeleton.timeScale = getG5279Model().timeScale;
        await playSpineFinish(skeleton, 'land');
        skeleton.timeScale = 1; //spine動態回歸正常
        skeleton.setAnimation(0, 'idle', true);
    }

    /**
     * 寶石掉落
     * @param symbol 
     */
    public async gemDrop(symbol: Node) {
        const anim = symbol.getComponent(Animation)!;
        anim.getState('drop').speed = getG5279Model().timeScale;
        await playAnimFinish(anim, 'drop');
        anim.play('idle');
    }

    /**
     * 道具掉落
     * @param symbol 
     */
    public async itemDrop(symbol: Node) {
        const anim = symbol.getComponent(Animation)!;
        anim.getState('drop').speed = getG5279Model().timeScale;
        anim.play('drop');
    }

    /**
     * 角色掉落表演
     * @param symbol 
     */
    public async chrFall(symbol: Node) {
        const isZombieParty = getG5279Model().gameState === G5279GameState.ON_ZOMBIE_PARTY;
        const sym = isZombieParty ? symbol.getChildByName('symZombie')! : symbol.getChildByName('sym')!;
        const skeleton = sym.getComponent(sp.Skeleton)!;
        skeleton.setAnimation(0, 'fall', true);

        const anim = symbol.getComponent(Animation)!;
        anim.getState('fall').speed = getG5279Model().timeScale;
        await playAnimFinish(anim, 'fall');
        skeleton.timeScale = 1;//spine動態回歸正常
        symbol.active = false;
        this.putSymbol(symbol);//回收symbol
    }
    //--------------symbol表演事件--------------
}