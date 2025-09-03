import { Comm } from '@common/h5GameTools/GTCommEvents';
import { getAudioManager } from '@common/manager/AudioManager';
import { getEventManager } from '@common/manager/EventManager';
import { awaitSleep } from '@common/utils/tools';
import { _decorator, Animation, Component, sp, tween, Vec3 } from 'cc';

import { G5279AudioName } from '@/games/catRaider/script/data/G5279AudioEnum';
import { G5279Config } from '@/games/catRaider/script/data/G5279Config';

import { G5279GameState } from '@/games/catRaider/script/data/G5279Enum';
import { G5279SymbolIDs } from '@/games/catRaider/script/data/G5279Enum';
import { G5279Event } from '@/games/catRaider/script/data/G5279Event';

import { floors, lines, SymbolNode } from '@/games/catRaider/script/data/G5279Interface';
import { getG5279Model, G5279Time } from '@/games/catRaider/script/model/G5279Model';

import { playAnimFinish, playSpineFinish } from '@/games/catRaider/script/tools/G5279Tools';
import { G5279BigWin } from '@/games/catRaider/script/view/G5279BigWin';
import { G5279Bonus } from '@/games/catRaider/script/view/G5279Bonus';
import { G5279BuyFreeGame } from '@/games/catRaider/script/view/G5279BuyFreeGame';
import { G5279Chance } from '@/games/catRaider/script/view/G5279Chance';

import { G5279Floor } from '@/games/catRaider/script/view/G5279Floor';
import { G5279Ground } from '@/games/catRaider/script/view/G5279Ground';
import { G5279RoadLine } from '@/games/catRaider/script/view/G5279RoadLine';
import { G5279SceneChange } from '@/games/catRaider/script/view/G5279SceneChange';
import { G5279ScoreBar } from '@/games/catRaider/script/view/G5279ScoreBar';
import { G5279Symbol } from '@/games/catRaider/script/view/G5279Symbol';
import { G5279SymbolInfo } from '@/games/catRaider/script/view/G5279SymbolInfo';
import { G5279ZombieParty } from '@/games/catRaider/script/view/G5279ZombieParty';
import { G5279BombItem } from '@/games/catRaider/script/view/item/G5279BombItem';
import { G5279BonusItem } from '@/games/catRaider/script/view/item/G5279BonusItem';
import { G5279EnergyBallItem } from '@/games/catRaider/script/view/item/G5279EnergyBallItem';
import { G5279LevelUpItem } from '@/games/catRaider/script/view/item/G5279LevelUpItem';


const { ccclass, property } = _decorator;

@ccclass('G5279ReelController')
export class G5279ReelController extends Component {
    @property({ type: G5279Symbol, group: { name: 'View', id: '1' } })
    private symbolView: G5279Symbol = null!;//symbol視圖

    @property({ type: G5279Chance, group: { name: 'View', id: '1' } })
    private chanceView: G5279Chance = null!;//機會卡介面

    @property({ type: G5279ScoreBar, group: { name: 'View', id: '1' } })
    private scoreBarView: G5279ScoreBar = null!;//分數條介面

    @property({ type: G5279RoadLine, group: { name: 'View', id: '1' } })
    private roadLineView: G5279RoadLine = null!;//路線介面

    @property({ type: G5279Floor, group: { name: 'View', id: '1' } })
    private floorView: G5279Floor = null!;//地板介面

    @property({ type: G5279Ground, group: { name: 'View', id: '1' } })
    private groundView: G5279Ground = null!;//地面介面

    @property({ type: G5279BonusItem, group: { name: 'View', id: '1' } })
    private bonusItemView: G5279BonusItem = null!;//bonus介面

    @property({ type: G5279EnergyBallItem, group: { name: 'View', id: '1' } })
    private energyBallItemView: G5279EnergyBallItem = null!;//能量球介面

    @property({ type: G5279BombItem, group: { name: 'View', id: '1' } })
    private bombItemView: G5279BombItem = null!;//炸彈介面

    @property({ type: G5279LevelUpItem, group: { name: 'View', id: '1' } })
    private levelUpItemView: G5279LevelUpItem = null!;//寶石升級介面

    @property({ type: G5279ZombieParty, group: { name: 'View', id: '1' } })
    private zombiePartyView: G5279ZombieParty = null!;//僵屍派對介面

    @property({ type: G5279SceneChange, group: { name: 'View', id: '1' } })
    private sceneChangeView: G5279SceneChange = null!;//場景切換介面

    @property({ type: G5279BuyFreeGame, group: { name: 'View', id: '1' } })
    private buyFreeGameView: G5279BuyFreeGame = null!;//購買免費遊戲介面

    @property({ type: G5279Bonus, group: { name: 'View', id: '1' } })
    private bonusView: G5279Bonus = null!;//bonus介面

    @property({ type: G5279BigWin, group: { name: 'View', id: '1' } })
    private bigWinView: G5279BigWin = null!;//大獎介面

    @property({ type: G5279SymbolInfo, group: { name: 'View', id: '1' } })
    private symbolInfoView: G5279SymbolInfo = null!;//符號資訊介面

    private spinDownPromise: Promise<void> | null = null;

    /**
     * 初始化，前段動態表演
     */
    public async init() {
        await this.groundView.initGroundPool();//生成地面
        await this.floorView.initFloorPool();//生成地板
        await this.createReel(G5279Config.initSymbolID[0]);//生成初始盤面
        this.setReelSymbol(G5279Config.initSymbolID[0]);//設置盤面符號資料

    }

    /**
     * 設置盤面符號資料
     * @param cards 盤面符號資料
     */
    public setReelSymbol(cards: number[]) {
        this.symbolInfoView.setReelSymbolID(cards);
        this.showControlButton();//顯示下注按鈕
        getG5279Model().isBuyFreeEnabled() && this.buyFreeGameView.showFreeBtn();//顯示免費遊戲按鈕
    }

    /**
     * 初始化盤面資料
     */
    public initReel() {
        this.scoreBarView.showTip();
        this.scoreBarView.resetSaveScore();//重置贏得分數加總
        this.bonusItemView.resetBonusUI();//重置bonusUI
        getG5279Model().ratGemIDs = [];//重置老鼠蒐集的寶石ID
        this.chanceView.initChanceCards();//初始化機會卡資料
    }

    /**
     * 生成盤面與補牌
     * @param cards 新的盤面symbolID
     * @param dropCards 上局掉落後的盤面symbolID
     */
    private async createReel(cards: number[], dropCards: number[] = []) {
        const reelPos = getG5279Model().getCurrentReelPos();//獲得盤面等級Reel位置
        const amount = cards.length;
        const column = Math.sqrt(reelPos.length);
        const isZombieParty = getG5279Model().gameState === G5279GameState.ON_ZOMBIE_PARTY;
        const promise: Promise<void>[] = [];
        for (let posID = 0; posID < amount; posID++) {
            if (dropCards.length > 0 && dropCards[posID] > 0) continue;//已有symbol在場則跳過
            const symID = cards[posID];
            if (symID < 10 && isZombieParty) continue;//殭屍party跳過角色

            const symbol = this.symbolView.getSymbol(symID, posID);//獲得symbol
            this.symbolView.setSymbolToLayer(symbol, posID);
            symbol.setPosition(reelPos[posID]);

            //symbol掉落表演
            if (symID < 10) {
                promise.push(this.symbolView.chrDrop(symbol));
                this.chrDropFloorBroken(posID);//執行角色掉落後的地板破碎表演
            }
            else if (symID < 50) {
                promise.push(this.symbolView.gemDrop(symbol));
            } else if (symID < 60) {
                promise.push(this.symbolView.itemDrop(symbol));
            }

            //正常速度，每個symbol都等待，加速模式，每行symbol才等待
            if (getG5279Model().timeScale === 1 || posID % column === 0) {
                this.playDropAudio();
                await awaitSleep(16);
            }
        }
        await Promise.all(promise);//等待所有掉落完成
        getG5279Model().movedCards = [...cards];//建立新的紀錄移動中的Grids值(盤面變化過程用)

        await this.handleShowCoins();//判斷並等待金幣揭露表演(因為有可能落下就揭露金幣)
    }

    /**
     * 等待角色掉落後的地板破碎表演
     * @param posID 位置ID
     */
    private async chrDropFloorBroken(posID: number) {
        await awaitSleep(400 / getG5279Model().timeScale);
        this.floorView.handleFloorBroken(posID);
    }

    /**
     * 播放symbol掉落音效
     */
    private async playDropAudio() {
        await awaitSleep(200);
        getAudioManager().playOnceSound(G5279AudioName.symDropEnd);
    }

    //------------------------處理beginGame表演事件------------------------
    /**
     * 處理line表演
     * @param lines 中獎線
     */
    public async handleLineResult(lines: lines) {
        const { grids, symbolIDs, payoff } = lines;
        const reelPos = getG5279Model().getCurrentReelPos();//獲得盤面等級Reel位置
        const chrID = symbolIDs![0];//獲得角色ID
        const gridsLength = grids!.length;
        const startPosID = grids![0];
        const chrPos = reelPos[startPosID];

        const winPos: Vec3[] = [];
        const winPosID: number[] = [];
        for (let i = 0; i < gridsLength; i++) {
            const currentPosID = grids![i];
            const currentPos = reelPos[currentPosID];
            if (!winPos.some(p => p.equals(currentPos))) {
                winPos.push(currentPos);//中獎線
                winPosID.push(currentPosID);//中獎線位置ID
            }

            //所有中獎symbol切換成中獎動態
            const currentSymID = symbolIDs![i];
            if (i > 0 && currentSymID > 0) {
                const winSymbol = this.symbolView.getSymbolByLayer(currentPosID);
                if (winSymbol) {
                    const ratDir = currentPos.x > chrPos.x ? -1 : 1;//判斷老鼠方向(位於左側是正常，右側是反向)
                    await this.symbolView.playSymWin(winSymbol, currentSymID, chrID, ratDir);
                }
            }
        }

        this.roadLineView.createRoadLine(chrID, winPos, winPosID);//生成中獎路線

        const chrSymbol = this.symbolView.getSymbolByLayer(startPosID)!;//獲得要移動的角色symbol
        const isZombieParty = getG5279Model().gameState === G5279GameState.ON_ZOMBIE_PARTY;
        const chrSym = isZombieParty ? chrSymbol.getChildByName('symZombie')! : chrSymbol.getChildByName('sym')!;

        // 添加安全检查，确保 skeleton 组件存在
        const chrSkeleton = chrSym.getComponent(sp.Skeleton)!;

        //如果路徑上有盜鼠，角色需要表演驚喜
        const hasRat = symbolIDs!.indexOf(G5279SymbolIDs.rat) >= 0;
        if (hasRat) {
            getAudioManager().playSound(G5279AudioName.catYeah);
            chrSkeleton.timeScale = getG5279Model().timeScale;
            await playSpineFinish(chrSkeleton, 'surprise');//角色驚喜
        }

        for (let i = 0; i < gridsLength - 1; i++) {
            const currentPosID = grids![i];
            const nextPosID = grids![i + 1];
            const winSymID = symbolIDs![i + 1];
            //角色移動(角色symbol，當前位置，下一個位置)
            getAudioManager().playSound(G5279AudioName.catMove);
            await this.symbolView.chrMove(chrSymbol, reelPos[currentPosID], reelPos[nextPosID], winSymID);
            this.symbolView.setSymbolToLayer(chrSymbol, nextPosID);//設置角色symbol顯示層級
            this.roadLineView.setLineHeight(nextPosID);//調整中獎路線高度

            const isLastFloor = this.floorView.handleFloorBroken(nextPosID);//執行地板破碎判斷
            //是否是最後一個地板破碎
            if (isLastFloor) {
                chrSkeleton && chrSkeleton.setAnimation(0, 'win', false);
                await this.runConcentricAnim(nextPosID);//執行同心圓表演
            }

            getG5279Model().movedCards[currentPosID] = 0;//原位置Cards變0

            //顯示分數
            const nextScore = payoff![i + 1];
            if (nextScore > payoff![i]) {
                this.symbolView.showChrScore(nextScore);
            }

            //播放symbol消除動畫
            if (winSymID > 0) {
                let winSymbol = this.symbolView.getSymbolByLayer(nextPosID);
                this.symbolView.symbolToWinLayer(winSymbol);//移到symbol勝利表演層
                if (winSymID === G5279SymbolIDs.rat) {
                    getAudioManager().playSound(G5279AudioName.ratHit);
                    // chrSkeleton.timeScale = getG5279Model().timeScale;//擊殺加速
                    this.symbolView.ratRemove(winSymbol, reelPos, getG5279Model().ratGemIDs);
                    getEventManager().emit(G5279Event.shake);//播放震動
                    this.floorView.removeRatHole();//移除老鼠洞
                    //等待角色擊殺後
                    await new Promise<void>(resolve => {
                        chrSkeleton.setCompleteListener(() => {
                            chrSkeleton.setCompleteListener(null!);
                            resolve();
                        });
                    });
                    chrSkeleton.timeScale = 1;//動作速度回歸
                } else {
                    //如果是道具，角色要表演勝利動態
                    if (winSymID > 50) {
                        getAudioManager().playSound(G5279AudioName.getSpecialSym);
                        chrSkeleton.timeScale = getG5279Model().timeScale;//獲得道具動作加速
                        chrSkeleton.setAnimation(0, 'win', false);
                    } else {
                        getAudioManager().playSound(G5279AudioName.getSym);
                        chrSkeleton.setAnimation(0, 'idle', true);
                    }
                    await this.symRemove(winSymbol, winSymID, chrID);
                }
            }
            chrSkeleton.timeScale = 1;//動作加速回歸
            if (i === gridsLength - 2 && chrSkeleton.animation !== 'idle') {
                chrSkeleton.setAnimation(0, 'idle', true);
            }

            await this.handleShowCoins();//判斷並等待金幣揭露表演
        }

        const lastPosID = grids![gridsLength - 1];//獲得最後一個位置ID
        chrSymbol.posID = lastPosID;//更新角色symbol位置ID
        getG5279Model().movedCards[lastPosID] = symbolIDs![0];//更新移動後的角色Cards變化
        const waitNextLineTime = G5279Time.waitNextLineTime;
        this.scoreBarView.showWinAddScore(payoff![gridsLength - 1]);//顯示加分
        this.roadLineView.putRoadLine();//移除道路線條
        await awaitSleep(waitNextLineTime);
        this.symbolView.hideChrScore();//隱藏角色分數
    }

    /**
     * 判斷並等待金幣揭露表演
     */
    private async handleShowCoins() {
        const coinPayoff = await this.floorView.showCoins();
        if (coinPayoff > 0) {
            getAudioManager().playSound(G5279AudioName.runScoreCat);
            await this.scoreBarView.showWinAddScore(coinPayoff);
        }
    }

    /**
     * 處理老鼠表演
     * @param lines 中獎線
     */
    public async handleRatResult(lines: lines) {
        const { grids, symbolIDs, ratScore } = lines;
        const reelPos = getG5279Model().getCurrentReelPos();//獲得盤面等級Reel位置
        const ratID = symbolIDs![0];
        const startPosID = grids![0];
        const ratStartPos = reelPos[startPosID];

        //檢查該位置上是否有老鼠
        let rat = null;
        const currentSymbol = this.symbolView.getSymbolByLayer(startPosID) as SymbolNode;
        //如果該位置上已有老鼠
        if (currentSymbol && currentSymbol.symbolID === G5279SymbolIDs.rat) {
            rat = currentSymbol;
        } else {
            rat = this.symbolView.getSymbol(ratID, startPosID);
            const skeleton = rat.getChildByName('sym')!.getComponent(sp.Skeleton)!;
            // await this.awaitNextTick();//要等待一個frame，spine動畫才能正常播放
            this.symbolView.setSymbolToLayer(rat, startPosID);
            rat.setPosition(ratStartPos);
            skeleton.timeScale = getG5279Model().timeScale * 1.5;//盜鼠up動作再加快1.5倍

            //如果該位置上有角色，角色後退
            this.chrSymBackAndForward(startPosID, 'back');

            getAudioManager().playSound(G5279AudioName.ratComeIn);
            rat.getComponent(Animation)!.play('idle');//老鼠回歸正常狀態
            await playSpineFinish(skeleton, 'up');//老鼠出現
        }

        //表演老鼠蒐集寶石(有寶石才表演蒐集)
        const collectTime = G5279Time.ratCollectTime;
        const ratSkeleton = rat.getChildByName('sym')!.getComponent(sp.Skeleton)!;
        let ratCollectGems = [];//紀錄該回合老鼠蒐集的寶石
        //大於2代表有寶石可蒐集
        if (grids!.length > 2) {
            for (let i = 1; i < grids!.length - 1; i++) {
                getG5279Model().movedCards[grids![i]] = 0;//原位置Cards變0
                const gemSymbol = this.symbolView.getSymbolByLayer(grids![i])!;
                getG5279Model().ratGemIDs.push(gemSymbol.symbolID);//紀錄老鼠目前蒐集到的寶石
                this.symbolView.gemCollect(gemSymbol);
                ratCollectGems.push(gemSymbol);
                tween(gemSymbol).
                    to((collectTime / 1000) - 0.1, { position: ratStartPos }, { easing: 'expoIn' })
                    .call(() => {
                        this.symbolView.putSymbol(gemSymbol);//移除寶石
                    }).start();
            }
            //老鼠蒐集動作表演
            getAudioManager().playSound(G5279AudioName.ratCollect);
            this.symbolView.ratCollect(rat);
            await awaitSleep(collectTime);
        }

        //蒐集完畢
        ratSkeleton.timeScale = getG5279Model().timeScale * 1.5;//老鼠down動作再加快1.5倍
        getAudioManager().playSound(G5279AudioName.ratGoOut);
        await playSpineFinish(ratSkeleton, 'down');//老鼠鑽入

        //如果該位置上有角色，角色回到前面
        this.chrSymBackAndForward(startPosID, 'forward');

        const endPosID = grids![grids!.length - 1];

        const isLastFloor = this.floorView.handleFloorBroken(endPosID);//執行地板破碎判斷
        //是否是最後一個地板破碎
        if (isLastFloor) await this.runConcentricAnim(endPosID);//執行同心圓表演

        const gemSymbol = this.symbolView.getSymbolByLayer(endPosID)!;
        //老鼠目標位置是寶石，則表演寶石收集
        if (gemSymbol && gemSymbol.symbolID < 50 && gemSymbol.symbolID > 10) {
            this.symbolView.symbolToWinLayer(gemSymbol);
            getG5279Model().ratGemIDs.push(gemSymbol.symbolID);//紀錄老鼠目前蒐集到的寶石
            this.symbolView.gemCollect(gemSymbol);
            ratCollectGems.push(gemSymbol);
        }

        //老鼠跑到指定位置
        this.symbolView.setSymbolToLayer(rat, endPosID);
        const endPos = reelPos[endPosID];
        rat.setPosition(endPos);
        rat.posID = endPosID;//更新老鼠位置ID
        ratSkeleton.timeScale = getG5279Model().timeScale * 1.5;//老鼠up動作再加快1.5倍
        this.floorView.moveRatHole(endPos);//移動老鼠洞
        this.showRatScore(ratScore!, endPos);//顯示老鼠分數
        getAudioManager().playSound(G5279AudioName.ratComeIn);
        await playSpineFinish(ratSkeleton, 'up');//老鼠出現
        //移除該回合老鼠蒐集的寶石
        for (const gem of ratCollectGems) {
            this.symbolView.putSymbol(gem);
        }
        getG5279Model().movedCards[endPosID] = symbolIDs![0];//老鼠位置更新
        ratSkeleton.timeScale = 1;//動作回歸
        ratSkeleton.setAnimation(0, 'idle', true);//老鼠待機

        await this.handleShowCoins();//判斷並等待金幣揭露表演
    }

    /**
     * 顯示老鼠分數
     * @param ratScore 老鼠分數
     * @param endPos 老鼠位置
     */
    private async showRatScore(ratScore: number, endPos: Vec3) {
        await awaitSleep(G5279Time.ratScoreWaitTime);
        this.symbolView.showRatScore(ratScore, endPos);
    }

    /**
     * 處理下一關卡表演
     * @param floor 地板symbolID
     * @param nextCards 下一組牌
     */
    public async handleNextLevel(floor: floors, nextCards: number[]) {
        const nextLv = getG5279Model().currentLv + 1;//下一關卡等級
        await this.resetReelAndCreate(nextLv, floor, nextCards);//重置盤面並生成
    }

    /**
     * 處理機會卡表演
     * @param nextCards 下一組牌
     */
    public async handleChanceResult(nextCards: number[]) {
        this.chanceView.useChanceItem();//使用機會卡

        const changeSymbols: Array<{ index: number, newSymID: number }> = [];
        for (let i = 0; i < getG5279Model().movedCards.length; i++) {
            const currentSymID = getG5279Model().movedCards[i];
            const newSymID = nextCards[i];
            //如果盤面寶石有變化
            if (currentSymID !== newSymID) {
                changeSymbols.push({ index: i, newSymID });
            }
        }

        //盤面寶石進行更新
        const symbolChangePromises = changeSymbols.map(change =>
            this.symbolView.symbolChange(change.index, change.newSymID)
        );
        //等待所有寶石轉換完成
        await Promise.all(symbolChangePromises);

        //更新盤面寶石
        for (const change of changeSymbols) {
            getG5279Model().movedCards[change.index] = change.newSymID;
        }
    }

    /**
     * 處理僵屍派對表演
     * @param nextCards 下一組牌
     */
    public async handlePartyResult(nextCards: number[]) {
        getG5279Model().gameState = G5279GameState.ON_ZOMBIE_PARTY;
        await this.symbolView.symbolOut();//盤面symbol退出
        getAudioManager().lowerMusic();//背景音變小
        getAudioManager().playSound(G5279AudioName.zombiePartyPage);
        await this.zombiePartyView.showZombieParty();//顯示僵屍派對
        getAudioManager().playMusic(G5279AudioName.bgmZpg);
        this.groundView.runPartyGround();//運行派對地面顏色變化
        this.symbolView.changeZombieChr();//角色變身殭屍
        await this.createReel(nextCards);//生成新盤面
    }

    /**
     * 處理hitFree表演
     * @param lineData 線資料
     * @param floor 地板symbolID
     * @param nextCards 下一組牌
     */
    public async handleHitFreeResult(lineData: lines, floor: floors, nextCards: number[]) {
        if (lineData.hitFree) {
            getG5279Model().gameState = G5279GameState.ON_BONUS;
            this.hideControlButton();//隱藏下注按鈕
            getG5279Model().isBuyFreeEnabled() && this.buyFreeGameView.hideFreeBtn();//隱藏免費遊戲按鈕
            getAudioManager().lowerMusic();//背景音變小
            getAudioManager().playSound(G5279AudioName.bonusGamePage);
            this.bonusItemView.resetBonusUI();//重置bonusUI
            await this.bonusView.showBonusGame();//顯示bonus遊戲

            getAudioManager().playMusic(G5279AudioName.bgmBg);
        }
        this.bonusView.updateBonusCount(lineData);
        getAudioManager().playSound(G5279AudioName.runNumer);

        await this.downReelSymbol();//盤面下移清除

        //生成新盤面
        this.floorView.createFloorSymbol(floor);
        await this.createReel(nextCards);
    }

    /**
     * 處理贏分結果，大獎表演與總贏得分停留
     * @param totalPay 總贏分
     */
    public async handleScoreResult(totalPay: number) {
        await this.bigWinView.runBigWin(totalPay);//判斷是否表演大獎
        this.scoreBarView.showTotalWinScore(totalPay);
        await awaitSleep(500 / getG5279Model().timeScale);//總贏得分停留時間
    }

    /**
     * 處理totalWin表演
     * @param totalPay 總贏分
     */
    public async handleTotalWin(totalPay: number) {
        if (totalPay > 0) {
            await this.bonusView.showTotalWin(totalPay);
        } else {
            await this.bonusView.showFinished();
        }
        getG5279Model().gameState = G5279GameState.ON_BEGIN_GAME;
    }
    //------------------------處理beginGame表演事件------------------------

    /**
     * 寶石升級表演
     * @param chrID 角色ID
     * @param showTime 表演時間
     */
    private async gemLevelUp(chrID: number) {
        const levelUpSymbols: SymbolNode[] = [];//要升級的寶石
        for (let i = 0; i < getG5279Model().movedCards.length; i++) {
            const index = i;//每次循環創建新變數(避免下方await出現閉包問題)
            if (Math.floor(getG5279Model().movedCards[i] / 10) === chrID) {
                levelUpSymbols.push(this.symbolView.getSymbolByLayer(index)!);
            }
        }
        await Promise.all(
            levelUpSymbols.map(symbol => this.levelUpItemView.symbolLevelUp(symbol))
        );
    }

    /**
     * 播放symbol消除動畫(後隱藏)
     * @param symbol 符號節點
     * @param symID 符號ID
     * @param chrID 角色ID
     */
    private async symRemove(symbol: SymbolNode, symID: number, chrID: number) {
        if (symID < 50) {
            this.runGemRemove(symbol);
            await this.chanceView.addEnergy();//增加能量
        } else {
            const symAnim = symbol.getComponent(Animation)!;
            symAnim.getState('remove').speed = getG5279Model().timeScale;
            symAnim.play('remove');
            switch (symID) {
                case G5279SymbolIDs.wild:
                    await awaitSleep(G5279Time.itemShowTime);
                    break;
                case G5279SymbolIDs.bonus:
                    await this.bonusItemView.getBonusItem();
                    break;
                case G5279SymbolIDs.bomb:
                    await awaitSleep(G5279Time.waitBombTime);
                    getAudioManager().playSound(G5279AudioName.bombExplosion);
                    getEventManager().emit(G5279Event.shake);//播放震動
                    const symbolPos = symbol.getPosition();
                    this.bombItemView.createFxBomb(symbolPos);
                    //獲得爆炸到的地板ID
                    const bombFloorID = getG5279Model().getBomb9Grid(symbol.posID);
                    //爆炸到的地板ID執行破碎，並判斷是否閃爍
                    for (const posID of bombFloorID) {
                        const isLastFloor = this.floorView.handleFloorBroken(posID);//執行地板破碎判斷
                        if (isLastFloor) await this.runConcentricAnim(posID);//執行同心圓表演
                    }
                    await awaitSleep(G5279Time.itemShowTime - G5279Time.waitBombTime);
                    await this.handleShowCoins();//判斷並等待金幣揭露表演
                    break;
                case G5279SymbolIDs.gemLevelUp:
                    getAudioManager().playSound(G5279AudioName.levelUpLineFx);
                    await this.gemLevelUp(chrID);
                    break;
                case G5279SymbolIDs.enertyFull:
                    await this.energyBallItemView.getEnergyBallItem();
                    await this.chanceView.addEnergy(true);//增加能量(全滿)
                    break;
            }
            this.symbolView.putSymbol(symbol);
        }
    }

    /**
     * 播放寶石消除動畫
     * @param symbol 符號節點
     */
    private async runGemRemove(symbol: SymbolNode) {
        const symAnim = symbol.getComponent(Animation)!;
        symAnim.getState('remove').speed = getG5279Model().timeScale;
        await playAnimFinish(symAnim, 'remove');
        this.symbolView.putSymbol(symbol);
    }

    /**
     * 角色symbol前進或後退
     * @param posID 位置ID
     * @param animName 動畫名稱
     */
    private async chrSymBackAndForward(posID: number, animName: string) {
        const symbol = this.symbolView.getSymbolByLayer(posID);//當前位置上的第一個symbol
        if (symbol && symbol.symbolID < 5) {
            const skeleton = symbol.getChildByName('sym')!.getComponent(sp.Skeleton)!;
            const anim = symbol.getComponent(Animation)!;
            skeleton.setAnimation(0, 'move', true);
            await playAnimFinish(anim, animName);
            skeleton.setAnimation(0, 'idle', true);
        } else {
            if (animName === 'forward') {
                //該位置沒角色，所以回到前面後(老鼠蒐集後)，原位置Cards要變0
                getG5279Model().movedCards[posID] = 0;
            }
        }
    }

    /**
     * 執行同心圓表演
     * @param posID 位置ID
     */
    private async runConcentricAnim(posID: number) {
        const concentricData = getG5279Model().getConcentricData(posID);//獲取同心圓表演資料
        const shakeTime = 500 / getG5279Model().timeScale;//抖動時間
        const awaitTime = 50 / getG5279Model().timeScale;//等待時間
        for (let i = 0; i < concentricData.length; i++) {
            for (let j = 0; j < concentricData[i].length; j++) {
                const runPosID = concentricData[i][j];
                this.groundView.runGroundAnim(runPosID, shakeTime);//地面抖動表演
                this.roadLineView.runRoadLineAnim(runPosID, shakeTime);//路線抖動表演
                this.symbolView.runSymLayerAnim(runPosID, shakeTime);//symbol抖動表演
            }
            await awaitSleep(awaitTime);
        }
        await awaitSleep(shakeTime + awaitTime);
    }

    /**
     * 掉落補牌
     * @param nextCards 新牌
     */
    public async dropSymbol(nextCards: number[]) {
        const reelPos = getG5279Model().getCurrentReelPos();//獲得盤面等級Reel位置
        const symbolHeight = G5279Config.baseSymbolSize.height;
        const column = Math.sqrt(reelPos.length);
        const length = getG5279Model().movedCards.length;
        let emptyCount = Array(column).fill(0);
        //調整movedCards排序(補每行空格)
        const dropMovingCards = [...getG5279Model().movedCards];//掉落後的盤面
        const promise: Promise<void>[] = [];
        for (let i = 0; i < length; i++) {
            const symbolID = getG5279Model().movedCards[i];
            const isChrSymbol = symbolID < 5 || symbolID === G5279SymbolIDs.rat;
            if (isChrSymbol) {
                emptyCount[i % column]++;// 紀錄空位置數量
            } else if (emptyCount[i % column] > 0 && !isChrSymbol) {
                let movePosID = i - (emptyCount[i % column] * column);//要移動的目的地posID
                //如果移動的目標位置上有角色，該空格就要-1
                const maxChecks = 5; // 最大檢查次數(包含老鼠)
                for (let check = 0; check < maxChecks; check++) {
                    // 檢查目標位置是否有角色要跳過 (ID 1-4 為主角，56為老鼠)
                    const skipChrID = getG5279Model().movedCards[movePosID] < 5 || getG5279Model().movedCards[movePosID] === G5279SymbolIDs.rat;
                    if (getG5279Model().movedCards[movePosID] > 0 && skipChrID) {
                        emptyCount[i % column]--;
                        movePosID += column; // posID加回一列
                    } else {
                        break; // 如果不是角色，跳出循環
                    }
                }
                const symbol = this.symbolView.getSymbolByLayer(i)!;//獲得symbol
                if (symbol.posID === movePosID) continue;
                // 計算移動位置
                const symPos = symbol.position;
                const moveY = emptyCount[i % column] * symbolHeight;
                const targetPos = new Vec3(symPos.x, symPos.y - moveY, symPos.z);

                // 更新dropMovingCards
                symbol.posID = movePosID;//調整symbol位置ID
                dropMovingCards[symbol.posID] = symbol.symbolID;
                dropMovingCards[i] = 0;
                const anim = symbol.getComponent(Animation)!;
                anim.getState('move').speed = getG5279Model().timeScale;
                anim.play('move');

                // 執行下移動畫
                const movePromise = new Promise<void>(resolve => {
                    tween(symbol)
                        .to(G5279Time.symbolDropTime / 1000, { position: targetPos }, { easing: 'quintOut' })
                        .call(() => {
                            this.symbolView.setSymbolToLayer(symbol, symbol.posID);
                            anim.play('idle');
                            resolve();
                        })
                        .start();
                });
                promise.push(movePromise);
                //正常速度，每行symbol等待，加速模式，每行symbol等待
                if (getG5279Model().timeScale === 1 || i % column === 0) {
                    await awaitSleep(10);
                }

            }
        }
        await Promise.all(promise);
        await this.createReel(nextCards, dropMovingCards);
    }

    /**
     * 重置盤面
     * @param nextLv 下一場景等級
     * @param floor 地板symbolID資料
     * @param cards 盤面符號資料
     */
    public async resetReelAndCreate(nextLv: number, floor: floors, cards: number[]) {
        const currentLv = getG5279Model().currentLv;//獲得當前場景等級

        //如果是派對模式，執行結束派對模式
        if (getG5279Model().gameState === G5279GameState.ON_ZOMBIE_PARTY) {
            this.groundView.stopPartyGround();//停止派對地面顏色變化
            this.zombiePartyView.hideZombieParty();//隱藏僵屍派對
            getG5279Model().gameState = G5279GameState.ON_BEGIN_GAME;
            getAudioManager().playMusic(G5279AudioName.bgmMg);//播放背景音樂
        }

        if (currentLv === nextLv) {
            //場景同等
            // await this.downReelSymbol();
            getG5279Model().currentLv = nextLv;//更新場景等級
        } else {
            const isLevelUp = currentLv < nextLv;
            getAudioManager().playSound(G5279AudioName.groundCollapse);
            this.dropReelSymbol(isLevelUp);
            this.floorView.hideCurrentFloor();//隱藏當前等級地板
            await this.groundView.handleGround(isLevelUp);

            this.sceneChangeView.bgUIChange(nextLv);//背景切換
            getG5279Model().currentLv = nextLv;//更新場景等級
            await this.groundView.groundReset();//新地面重置
            await this.floorView.sceneFloorReset();//新地板重置
            await awaitSleep(G5279Time.floorDropTime);
        }
        //生成新盤面
        this.floorView.createFloorSymbol(floor);
        await this.createReel(cards);
    }

    /**
     * 處理當spin按下時
     */
    public async handleSpinDown() {
        getG5279Model().gameState = G5279GameState.ON_BEGIN_GAME;//狀態切換成一般轉動狀態
        getAudioManager().playSound(G5279AudioName.btnSpin);//播放spin音效
        this.symbolInfoView.exitSymbolInfo();//退出賠率資訊功能
        getG5279Model().isBuyFreeEnabled() && this.buyFreeGameView.disableFreeBtn();//禁用免費遊戲按鈕

        this.spinDownPromise = this.downReelSymbol();//盤面symbol下移清除
        await this.spinDownPromise;
        this.spinDownPromise = null;
    }

    /**
     * 等待盤面symbol下移清除完畢
     * @returns 
     */
    public waitSpinDown(): Promise<void> {
        if (this.spinDownPromise) {
            return this.spinDownPromise;
        }
        return Promise.resolve();
    }

    //--------------盤面symbol轉場事件--------------
    /**
     * 盤面symbol下移清除(同場景等級時)
     */
    public async downReelSymbol() {
        const isZombieParty = getG5279Model().gameState === G5279GameState.ON_ZOMBIE_PARTY;
        if (!isZombieParty) {
            this.floorView.floorReset();//非僵屍派對模式，地板回歸
        }
        await this.symbolView.symbolOut();
    }

    /**
     * 盤面symbol下移清除
     * @param isNextLevel 是否為下一關
     */
    public dropReelSymbol(isNextLevel: boolean) {
        this.floorView.removeFloorSymbol();//移除地板symbol
        getEventManager().emit(G5279Event.shakeBig);//播放大震動
        this.symbolView.putSymbolLayer(isNextLevel);
    }

    //--------------盤面symbol轉場事件--------------

    /**
     * 【公版】隱藏下注按鈕
     */
    public hideControlButton(): void {
        getEventManager().emit(Comm.SET_PUBLIC_GAME_PANEL_SWITCH, {
            controlPanelIsOpen: false,
            userSettingPanelIsOpen: true,
            bottomButtonPanelIsOpen: true
        });
    }

    /**
     * 【公版】顯示下注按鈕
     */
    private showControlButton(): void {
        getEventManager().emit(Comm.SET_PUBLIC_GAME_PANEL_SWITCH, {
            controlPanelIsOpen: true,
            userSettingPanelIsOpen: true,
            bottomButtonPanelIsOpen: true
        });
    }
}