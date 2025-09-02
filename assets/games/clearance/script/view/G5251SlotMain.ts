import { _decorator, Component, Node, UITransform, Prefab, tween, Vec3, Tween, Animation, UIOpacity, Sprite, ParticleSystem, TweenEasing } from 'cc';
import { getPoolManager } from '@common/manager/PoolManager';
import { G5251SymbolSetting } from '../view/prefab/G5251SymbolSetting';
import { REEL_DATA } from '../types/G5251ReelData';
import { getAudioManager } from '@common/manager/AudioManager';
import { G5251AudioName } from '../types/G5251AudioEnum';
import { NewLines } from '../types/G5251Interface';
import { G5251Utils } from '../tools/G5251Utils';
import { G5251Resources } from '../controller/G5251Resources';
import { g5251Model } from '../model/G5251Model';

const { ccclass, property } = _decorator;

@ccclass('G5251SlotMain')
export class G5251SlotMain extends Component {
    //遊戲節點
    @property(Node)
    private slotReel: Node = null!;//輪軸層
    @property(Node)
    private slotWin: Node = null!;//symbol勝利動畫層
    @property(Node)
    private allBlack: Node = null!;//所有遮黑
    @property(Node)
    private fgBg: Node = null!;//fg背景

    //預置體
    @property({ type: Prefab, group: { name: 'Prefab', id: '1' } })
    private scatterReady: Prefab = null!;//scatter聽牌預置體
    @property({ type: Prefab, group: { name: 'Prefab', id: '1' } })
    private normalWin: Prefab = null!;//一般symble中獎
    @property({ type: Prefab, group: { name: 'Prefab', id: '1' } })
    private goldWin: Prefab = null!;//金牌symble中獎
    @property({ type: Prefab, group: { name: 'Prefab', id: '1' } })
    private wildWin: Prefab = null!;//wildsymble中獎
    @property({ type: Prefab, group: { name: 'Prefab', id: '1' } })
    private scatterWin: Prefab = null!;//scatter中獎

    private _isReadyLoop = false;//是否執行聽牌loop
    private _endSlotRunCallback: () => void = null!;//slotRun結束回傳callback

    //--------------------slot轉動--------------------
    /**
     * 等待slot結束
     */
    public waitSlotEnd(): Promise<void> {
        return new Promise(async (resolve) => {
            this._endSlotRunCallback = resolve;
        });
    }

    /**
     * 停止轉動
     * @param slotLine 哪行slot
     */
    public stotTween(slotLine: number) {
        Tween.stopAllByTarget(this.slotReel.children[slotLine]);
    }

    /**
     * 開始轉動slot
     * @param slotLine 哪行slot
     * @param runTime 轉動時間
     */
    public startRun(slotLine: number, runTime: number) {
        const slotRunNode = this.slotReel.children[slotLine];//該行slotRun
        const tempSymbols = slotRunNode.children[0];
        const mainSymbols = slotRunNode.children[1];
        const xPos = REEL_DATA.reelPosition[slotLine].x;
        const height = slotRunNode.getComponent(UITransform)!.contentSize.height;//行高
        const symbolAmount = mainSymbols.children.length;//該行symbol數量
        tempSymbols.position = new Vec3(0, height, 0);//TempSymbols節點移到上面
        const randomSymbolNum = g5251Model.getRandomLineSymbol(symbolAmount, slotLine);
        this.setSlotSymbol(tempSymbols, randomSymbolNum);//設置tempSymbol圖案(隨機),讓每次起始轉動時上方節點都隨機
        this.blurSFShow(slotRunNode);//顯示模糊貼圖

        //循環轉動
        const loopRun = () => {
            const randomSymbolNum = g5251Model.getRandomLineSymbol(symbolAmount, slotLine);
            this.setSlotSymbol(mainSymbols, randomSymbolNum);//設置正symbol圖案(隨機)
            slotRunNode.position = new Vec3(xPos, height, 0);//節點移到上面
            tempSymbols.position = new Vec3(0, -height, 0);//TempSymbols節點移到下面
            tween(slotRunNode)
                .to(runTime / 2, { position: new Vec3(xPos, 0, 0) })
                .call(() => {
                    const randomSymbolNum = g5251Model.getRandomLineSymbol(symbolAmount, slotLine);
                    this.setSlotSymbol(tempSymbols, randomSymbolNum);//設置tempSymbol圖案(隨機)
                    tempSymbols.position = new Vec3(0, height, 0);//TempSymbols節點移到上面
                })
                .to(runTime / 2, { position: new Vec3(xPos, -height, 0) })
                .call(() => {
                    loopRun();//持續轉動
                }).start();
        }

        //起始轉動後持續循環轉動
        tween(slotRunNode).to(runTime, { position: new Vec3(xPos, -height, 0) }, { easing: "sineIn" })
            .call(() => {
                loopRun();//執行循環轉動
            }).start();
    }

    /**
     * 停止轉動
     * @param slotLine 哪行slot
     * @param runTime 轉動時間
     * @param stopSymbols 停止後的symbol資料(包含前後的symbol)
     * @param backTime 回彈時間
     * @param easing 緩動類型
     * @param useCurrentPos 使用當前位置停止
     */
    public async stopRun(slotLine: number, runTime: number, stopSymbols: number[], backTime: number, easing: (t: number) => number, useCurrentPos: boolean): Promise<void> {
        return new Promise(async (resolve) => {
            const slotRunNode = this.slotReel.children[slotLine];//該行slotRun
            this.stotTween(slotLine);//停止該行轉動
            const tempSymbols = slotRunNode.children[0];
            const mainSymbols = slotRunNode.children[1];
            const xPos = REEL_DATA.reelPosition[slotLine].x;
            const height = slotRunNode.getComponent(UITransform)!.height;//行高
            if (this._isReadyLoop)
                useCurrentPos = false;//如果是聽牌loop強制false

            //這邊是計算中途停止時校正symbol圖片內容
            if (!useCurrentPos) {
                const symbolHeight = REEL_DATA.baseSymbolSize.height;//symbol高度

                //紀錄上一次的symbol
                const allSymbolsData: number[] = [];//上次tempSymbols和mainSymbols的symbolID
                for (let i = 0; i < tempSymbols.children.length; i++) {
                    allSymbolsData.push(tempSymbols.children[i].getComponent(G5251SymbolSetting)!.symID);
                }
                for (let i = 0; i < mainSymbols.children.length; i++) {
                    allSymbolsData.push(mainSymbols.children[i].getComponent(G5251SymbolSetting)!.symID);
                }

                const slotYPos = slotRunNode.position.y;//目前高度
                const tempSymbolLength = tempSymbols.children.length;
                let newTempSymbolsData: number[] = new Array(tempSymbols.children.length).fill(0);//新tempSymbolsData

                // 計算起始索引
                const startIndex = Math.floor((slotYPos + height) / symbolHeight);

                // 填充新的symbol數據
                for (let i = 0; i < tempSymbolLength; i++) {
                    const index = (startIndex + i) % allSymbolsData.length;
                    newTempSymbolsData[i] = allSymbolsData[index];
                }
                this.setSlotSymbol(tempSymbols, newTempSymbolsData);//設置中途的tempSymbol圖案
            }

            //根據目前Y軸位置判斷是否需要重最上面掉落
            const downPosY = -20;//slot下移位置
            let currentPosY = useCurrentPos ? slotRunNode.position.y : downPosY - 1;//是否使用當前位置停止
            if (currentPosY < downPosY) {
                slotRunNode.position = new Vec3(xPos, height, 0);//slot回歸到上面
                tempSymbols.position = new Vec3(0, -height, 0);//TempSymbols節點移到下面
            }
            this.setSlotSymbol(mainSymbols, stopSymbols);//設置symbol圖案(結果)
            // const blurTime = (runTime > 0.3) ? 0.3 : runTime;
            this.blurSFHide(slotRunNode);//模糊貼圖隱藏
            tween(slotRunNode)
                .to(runTime, { position: new Vec3(xPos, downPosY, 0) }, { easing })
                .call(() => {
                    getAudioManager().playOnceSound(G5251AudioName.ReelStop);//播放回彈音效
                })
                .to(backTime, { position: new Vec3(xPos, 0, 0) })
                .call(() => {
                    this.slotEnd(slotLine, stopSymbols);//結束slot轉動時執行(哪行slot)
                    resolve();//結束slot轉動
                }).start();
        });
    }

    /**
     * 執行聽牌loop依序減速並停止轉動(哪行slot)
     * @param slotLine 哪行slot
     * @param readyTime 聽牌時間
     */
    public async readyLoopRun(slotLine: number, readyTime: number): Promise<void> {
        return new Promise(async (resolve) => {
            this._isReadyLoop = true;//紀錄聽牌loop
            const slotRunNode = this.slotReel.children[slotLine];//該行slotRun
            this.stotTween(slotLine);//停止該行轉動
            const tempSymbols = slotRunNode.children[0];
            const mainSymbols = slotRunNode.children[1];
            const xPos = REEL_DATA.reelPosition[slotLine].x;
            const height = slotRunNode.getComponent(UITransform)!.height;//行高
            const symbolAmount = mainSymbols.children.length;//該行symbol數量
            slotRunNode.position = new Vec3(xPos, height, 0);//每次循環時會回到上面
            tempSymbols.position = new Vec3(0, -height, 0);//TempSymbols節點移到下面
            const randomSymbolNum = g5251Model.getRandomLineSymbol(symbolAmount, slotLine);
            this.setSlotSymbol(mainSymbols, randomSymbolNum);//設置正symbol圖案(隨機)
            this.blurSFHide(slotRunNode);//模糊貼圖隱藏
            tween(slotRunNode).to(readyTime * 0.5, { position: new Vec3(xPos, 0, 0) })
                .call(() => {
                    const randomSymbolNum = g5251Model.getRandomLineSymbol(symbolAmount, slotLine);
                    this.setSlotSymbol(tempSymbols, randomSymbolNum);//設置上symbol圖案(隨機一致)
                    tempSymbols.position = new Vec3(0, height, 0);//TempSymbols節點移到上面
                })
                .to(readyTime * 0.5, { position: new Vec3(xPos, -height, 0) })
                .call(() => {
                    this._isReadyLoop = false;//紀錄聽牌loop
                    resolve();//聽牌loop結束
                }).start();
        });
    }

    /**
     * 結束slot(哪行slot)
     * @param slotLine 哪行slot
     * @param stopSymbols 停止後的symbol資料(包含前後的symbol)
     */
    private async slotEnd(slotLine: number, stopSymbols: number[]) {
        const slotRunNode = this.slotReel.children[slotLine];//該行slotRun
        const mainSymbols = slotRunNode.children[1];
        //判斷此行的symbol是否有需要提前出現的動態(扣掉前後的symbol)
        for (let i = 1; i < stopSymbols.length - 1; i++) {
            mainSymbols.children[i].getComponent(G5251SymbolSetting)!.showWildOrScatter();//如果是wild或scatter編號，顯示動態
            stopSymbols[i] === REEL_DATA.scatterID && getAudioManager().playOnceSound(G5251AudioName.ScatterGet);
        }
        //如果是最後一段停止，執行結果判斷
        if (slotLine === this.slotReel.children.length - 1) {
            //bug有可能聽牌軸還未停止，就執行結束
            // await G5251Utils.Delay(1.2);
            await G5251Utils.Delay(0.1);
            this._endSlotRunCallback();//轉動結束
        }
    }
    //--------------------slot轉動--------------------


    //--------------------slot中獎表演--------------------
    /**
     * 中獎symbol表演
     */
    public async symbolWin(): Promise<void> {
        return new Promise(async (resolve) => {
            for (const symbol of this.slotWin.children) {
                symbol.getComponent(Animation)!.play('win');
            }
            await G5251Utils.Delay(0.4);//等待win動態表演0.5秒後
            this.node.getComponent(Animation)!.play('slotShark');//盤面抖動
            await G5251Utils.Delay(0.6);//等待win動態表演1秒後
            resolve();

        });
    }

    /**
     * 金色變成wild
     * @param newLine 該次中獎資料
     */
    public goldToWildSymbol(newLine: NewLines) {
        for (let i = 0; i < newLine.Grids.length; i++) {
            for (let j = 0; j < newLine.Grids[i].length; j++) {
                const winSymID = newLine.SymID[i][j];
                if (winSymID > 8 && winSymID < REEL_DATA.wildID) {
                    const mainSymbols = this.slotReel.children[i].children[1];
                    const pos = newLine.Grids[i][j];
                    mainSymbols.children[pos + 1].active = true;//顯示靜態symbol
                    mainSymbols.children[pos + 1].getComponent(G5251SymbolSetting)!.showWild();//顯示為wild
                }
            }
        }
    }

    /**
     * 重新設置symbol排序
     */
    public resetSymbolSiblingIndex() {
        for (let i = 0; i < this.slotReel.children.length; i++) {
            const mainSymbols = this.slotReel.children[i].children[1];//該行主要symbol節點
            //先重新排列已顯示的symbol排序
            let showSymbolAmount = 0;
            const length = mainSymbols.children.length - 2;
            //排除最下層symbol,重新調整symbol位置
            for (let j = length; j >= 0; j--) {
                const symbol = mainSymbols.children[j];
                if (symbol.active) {
                    showSymbolAmount++;
                    symbol.setSiblingIndex(length - showSymbolAmount + 1);
                }
            }
        }
    }

    /**
     * 重新設置symbol
     * @param nextCards 下回合symbol資料
     * @param topSymbols 上方預掉落symbol資料(會直接修改model)
     */
    public async resetSymbol(nextCards: number[][], topSymbols: number[][]): Promise<void> {
        return new Promise(async (resolve) => {
            for (let i = 0; i < this.slotReel.children.length; i++) {
                let hideSymbolAmount = 0;//該行隱藏symbol數量
                const mainSymbols = this.slotReel.children[i].children[1];//該行主要symbol節點
                const length = mainSymbols.children.length - 2;
                for (let j = length; j >= 0; j--) {
                    const symbol = mainSymbols.children[j];
                    if (!symbol.active) {
                        hideSymbolAmount++;//隱藏數量+1
                        symbol.position = new Vec3(0, REEL_DATA.reelPosition[i].y + REEL_DATA.baseSymbolSize.height * hideSymbolAmount, 0);//重新調整symbol位置
                        symbol.active = true;//顯示靜態symbol
                        topSymbols[i].shift();//移除該行預掉落symbol資料
                        const symbolID = j === 0 ? topSymbols[i][0] : nextCards[i][j - 1];
                        symbol.getComponent(G5251SymbolSetting)!.setSymbolImage(symbolID);//設置下局symbol圖案
                    }
                }
            }
            resolve();
        });
    }

    /**
     * 執行symbol掉落補牌
     * @param isTurbo 是否為閃電模式
     */
    public async symbolDrop(isTurbo: boolean): Promise<void> {
        return new Promise(async (resolve) => {
            const length = this.slotReel.children.length;
            let dropAmount = 0;//落下的symbol數量
            //從後面開始掉
            for (let i = length - 1; i >= 0; i--) {
                if (!isTurbo)
                    await G5251Utils.Delay(0.05);
                const mainSymbols = this.slotReel.children[i].children[1];//該行主要symbol節點
                const length = mainSymbols.children.length - 2;
                let delayTime = 0;
                for (let j = length; j >= 0; j--) {
                    const symbol = mainSymbols.children[j];
                    const moveYPos = REEL_DATA.reelPosition[i].y - REEL_DATA.baseSymbolSize.height * j;
                    //尚未歸位的symbol執行掉落(彈跳)
                    if (moveYPos !== symbol.position.y) {
                        const subYPos = symbol.position.y - moveYPos;//距離
                        dropAmount++;
                        delayTime += 0.05;
                        const dropTime = 0.25 + subYPos / (REEL_DATA.baseSymbolSize.height / 0.05);
                        tween(symbol)
                            .delay(delayTime)//每顆球間隔掉落時間
                            //根據距離決定掉落時間
                            .to(dropTime, { position: new Vec3(0, moveYPos - 12, 0) }, { easing: 'cubicIn' }).call(() => {
                                getAudioManager().playOnceSound(G5251AudioName.SymbolDrop);
                            })
                            .to(0.08, { position: new Vec3(0, moveYPos + 3, 0) })
                            .to(0.04, { position: new Vec3(0, moveYPos, 0) })
                            .call(() => {
                                dropAmount--;
                                //判斷是否為scatter，且symbol在slot範圍內
                                if (symbol.getComponent(G5251SymbolSetting)!.symID === REEL_DATA.scatterID && j > 0)
                                    symbol.getComponent(G5251SymbolSetting)!.showScatter();//顯示獲得scatter
                                if (dropAmount === 0)
                                    resolve();
                            })
                            .start();
                    }
                }
            }
        });
    }

    /**
     * symbol聽牌抖動
     * @param isTurbo 是否為閃電模式
     * 看需要是否要開啟
     */
    // public async symbolReadyShark(isTurbo: boolean): Promise<void> {
    //     return new Promise(async (resolve) => {
    //         const tweens: Tween<Node>[] = [];
    //         let completedTweens = 0;
    //         let totalTweens = 0;
    //         for (let i = 0; i < this.slotReel.children.length; i++) {
    //             const mainSymbols = this.slotReel.children[i].children[1];
    //             for (let j = 0; j < mainSymbols.children.length; j++) {
    //                 const symbol = mainSymbols.children[j];
    //                 if (symbol.active) {
    //                     const originalPos = new Vec3(symbol.position.x, symbol.position.y, symbol.position.z);
    //                     const repeat = isTurbo ? 15 : 30;//抖動次數
    //                     const t = tween(symbol)
    //                         .repeat(repeat,
    //                             tween()
    //                                 .call(() => {
    //                                     symbol.position = new Vec3(
    //                                         originalPos.x + 3 - Math.random() * 6,
    //                                         originalPos.y + 3 - Math.random() * 6,
    //                                         0);
    //                                 })
    //                                 .delay(0.03)
    //                         )
    //                         .call(() => {
    //                             symbol.position = originalPos;
    //                             completedTweens++;
    //                             if (completedTweens === totalTweens)
    //                                 resolve();
    //                         })
    //                         .start();
    //                     tweens.push(t);
    //                     totalTweens++;
    //                 }
    //             }
    //         }
    //     })
    // }

    /**
     * 生成中獎symbol並設置相關參數
     * @param slotLine 哪行slot
     * @param symSubIndex 哪個位置
     * @param winSymID 中獎symbolID
     */
    public async instSymbolWin(slotLine: number, symSubIndex: number, winSymID: number) {
        const symbolWin = winSymID < 9 ? this.normalWin : winSymID < REEL_DATA.wildID ? this.goldWin : this.wildWin;
        const instSymbolWin = getPoolManager().get(symbolWin);//生成中獎symbol物件池內容
        //symbolWin需要更新的節點
        const symNode = instSymbolWin.getChildByName('sym')!;
        const numberNode = symNode!.getChildByName('number')!;
        const symNumberNode = numberNode!.getChildByName('symNumber')!;
        const symNumberBlurNode = symNumberNode!.getChildByName('symNumberBlue')!;
        if (winSymID < REEL_DATA.wildID) {
            //部分symbol的數字有傾斜，所以需判斷
            if (winSymID < 5 || winSymID < 13 && winSymID > 8)
                numberNode.eulerAngles = new Vec3(0, 0, 16);
            else
                numberNode.eulerAngles = new Vec3(0, 0, 0);
            const resources = G5251Resources.getInstance();
            symNode.getComponent(Sprite)!.spriteFrame = resources.symbolWinBgSF[winSymID - 1];
            symNumberNode!.getComponent(Sprite)!.spriteFrame = resources.symbolWinNumSF[winSymID - 1];
            symNumberBlurNode.getComponent(Sprite)!.spriteFrame = resources.symbolWinNumBlurSF[winSymID - 1];
        }
        const mainSymbols = this.slotReel.children[slotLine].children[1];
        mainSymbols.children[symSubIndex + 1].active = false;//隱藏靜態symbol
        const xPos = REEL_DATA.reelPosition[slotLine].x;
        const yPos = mainSymbols.children[symSubIndex + 1].position.y;//該節點Y軸位置
        instSymbolWin.parent = this.slotWin;//設置父節點
        instSymbolWin.position = new Vec3(xPos, yPos, 0);//設置位置
        //加速版
        // if (winSymID < reelData.scatterID) {
        //     const anim = instSymbolWin.getComponent(Animation)!;
        //     anim.getState('show').speed = this.isTurbo ? 1.5 : 1; //動畫速度
        //     anim.play('show');
        // }
        if (winSymID < REEL_DATA.scatterID) {
            instSymbolWin.getComponent(Animation)!.play('show');
        }

    }
    //--------------------slot中獎表演--------------------


    //--------------------其他--------------------
    /**
     * 退還symbolWin節點下的pool
     */
    public async putSymbolWin(): Promise<void> {
        return new Promise(async (resolve) => {
            while (this.slotWin.children.length > 0) {
                const symbolWin = this.slotWin.children[0];
                getPoolManager().put(symbolWin);
            }
            resolve();
        });
    }

    /**
     * 生成scatter中獎物件
     * @param winScatterPos scatter位置
     */
    public createScatterWin(winScatterPos: number[]) {
        for (let i = 0; i < winScatterPos.length; i++) {
            const line = REEL_DATA.symbolPosID.findIndex(row => row.includes(winScatterPos[i]));//哪行
            const pos = REEL_DATA.symbolPosID[line].findIndex(col => col === winScatterPos[i]);//哪個位置
            const mainSymbol = this.slotReel.children[line].children[1];
            mainSymbol.children[pos + 1].active = false;//隱藏靜態symbol節點
            const xPos = REEL_DATA.reelPosition[line].x;
            const yPos = mainSymbol.children[pos + 1].position.y;//該節點Y軸位置
            const instScatterWin = getPoolManager().get(this.scatterWin);//生成中獎scatter物件
            instScatterWin.parent = this.slotWin;//設置父節點
            instScatterWin.position = new Vec3(xPos, yPos, 0);//設置位置
            instScatterWin.getComponent(Animation)!.play('win');
        }
    }

    /**
     * 重置輪軸symbol顯示
     */
    public resetSlotReel() {
        for (let i = 0; i < this.slotReel.children.length; i++) {
            const mainSymbols = this.slotReel.children[i].children[1];
            for (let j = 0; j < mainSymbols.children.length; j++) {
                mainSymbols.children[j].active = true;
            }
        }
        this.putSymbolWin();//退還中獎symbol
    }

    /**
     * 顯示免費遊戲背景
     */
    public showFg() {
        this.fgBg.getComponent(UIOpacity)!.opacity = 0;
        this.fgBg.active = true;
        tween(this.fgBg.getComponent(UIOpacity)!).to(0.2, { opacity: 255 }).start();
        const particleLine3D = this.fgBg.getChildByName('particleLine3D')!;
        particleLine3D.getComponent(ParticleSystem)!.play();
    }

    /**
     * 隱藏免費遊戲背景
     */
    public hideFg() {
        tween(this.fgBg.getComponent(UIOpacity)!).to(0.2, { opacity: 0 })
            .call(() => {
                this.fgBg.active = false;
                const particleLine3D = this.fgBg.getChildByName('particleLine3D')!;
                particleLine3D.getComponent(ParticleSystem)!.stopEmitting();
            }).start();
    }

    /**
     * 模糊貼圖顯示
     * @param slotRunNode 哪行slotRunNode
     * @param blurTime 模糊時間
     */
    private blurSFShow(slotRunNode: Node) {
        for (const symbols of slotRunNode.children) {
            for (const symbol of symbols.children) {
                symbol.getComponent(G5251SymbolSetting)!.blurShow();
            }
        }
    }

    /**
     * 模糊貼圖隱藏
     * @param slotRunNode 哪行slotRunNode
     * @param blurTime 模糊時間
     */
    private blurSFHide(slotRunNode: Node) {
        for (const symbols of slotRunNode.children) {
            for (const symbol of symbols.children) {
                symbol.getComponent(G5251SymbolSetting)!.blurHide();
            }
        }
    }

    /**
     * 設置symbol圖案(哪行slotNode,該行顯示的symbol編號)
     * @param slotNode 哪行slotNode
     * @param symbolsNumbers 該行顯示的symbol編號
     */
    private setSlotSymbol(slotNode: Node, symbolsNumbers: number[]) {
        const symbolAmount = slotNode.children.length;//該行symbol數量
        for (let i = 0; i < symbolAmount; i++) {
            slotNode.children[i].getComponent(G5251SymbolSetting)!.setSymbolImage(symbolsNumbers[i]);
        }
    }

    /**
     * 生成scatter聽牌物件
     * @param scatterPos scatter位置
     */
    public async createScatterReady(scatterPos: number[]) {
        if (this.slotWin.children.length === scatterPos.length)
            return;
        await this.putSymbolWin();//先退還中獎symbol(避免重複生成)
        for (let i = 0; i < scatterPos.length; i++) {
            const line = REEL_DATA.symbolPosID.findIndex(row => row.includes(scatterPos[i]));//哪行
            const pos = REEL_DATA.symbolPosID[line].findIndex(col => col === scatterPos[i]);//哪個位置
            const mainSymbol = this.slotReel.children[line].children[1];
            mainSymbol.children[pos + 1].active = false;//隱藏靜態symbol節點
            const xPos = REEL_DATA.reelPosition[line].x;
            const yPos = mainSymbol.children[pos + 1].position.y;//該節點Y軸位置
            const instScatterWin = getPoolManager().get(this.scatterReady);//生成中獎scatter物件
            instScatterWin.parent = this.slotWin;//設置父節點
            instScatterWin.position = new Vec3(xPos, yPos, 0);//設置位置
            instScatterWin.getComponent(Animation)!.play('ready');
        }
    }

    /**
     * 退還scatter聽牌物件
     * @param scatterPos scatter位置
     */
    public async putScatterReady(scatterPos: number[]): Promise<void> {
        return new Promise(async (resolve) => {
            for (let i = 0; i < scatterPos.length; i++) {
                const line = REEL_DATA.symbolPosID.findIndex(row => row.includes(scatterPos[i]));//哪行
                const pos = REEL_DATA.symbolPosID[line].findIndex(col => col === scatterPos[i]);//哪個位置
                const mainSymbol = this.slotReel.children[line].children[1];
                mainSymbol.children[pos + 1].active = true;//顯示靜態symbol節點
                mainSymbol.children[pos + 1].getComponent(G5251SymbolSetting)!.scatterIdle();//播放scatter待機動態
            }
            //聽牌動態淡出(避免關閉太突兀)
            tween(this.slotWin.getComponent(UIOpacity)!).to(0.2, { opacity: 0 })
                .call(() => {
                    this.putSymbolWin();//退還中獎symbol
                    this.slotWin.getComponent(UIOpacity)!.opacity = 255;//回歸透明度
                    resolve();
                }).start();//淡出
        });
    }

    /**
     * 遮黑淡入
     */
    public slotBlackShow() {
        this.allBlack.getComponent(UIOpacity)!.opacity = 0;
        this.allBlack.active = true;//顯示遮黑
        tween(this.allBlack.getComponent(UIOpacity)!).to(0.3, { opacity: 255 }).start();//淡入
    }


    /**
     * 遮黑淡出
     */
    public async slotBlackHide(): Promise<void> {
        return new Promise(async (resolve) => {
            tween(this.allBlack.getComponent(UIOpacity)!).to(0.2, { opacity: 0 })
                .call(() => {
                    this.allBlack.active = false;//隱藏遮黑
                    resolve();
                }).start();//淡出
        })
    }
}