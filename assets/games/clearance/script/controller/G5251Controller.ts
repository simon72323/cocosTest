import { _decorator, Component, easing, Node } from 'cc';

import { getEventManager } from '@common/manager/EventManager';
import { GameStatus } from '@common/h5GameTools/State';
import { Comm, Game } from '@common/h5GameTools/GTCommEvents';
import { Logger } from '@common/utils/Logger';
import { watch } from '@common/utils/Reactivity';

import { getAudioManager } from '@common/manager/AudioManager';

import { G5251Utils } from '../tools/G5251Utils';
import { NewLines, onBeginGame, onHitJackpot } from '../types/G5251Interface';
import { G5251TopMultiple } from '../view/G5251TopMultiple';
import { REEL_DATA } from '../types/G5251ReelData';
import { G5251FreeGame } from '../view/G5251FreeGame';
import { G5251ScoreBar } from '../view/G5251ScoreBar';
import { G5251BigWin } from '../view/G5251BigWin';
import { G5251TotalWin } from '../view/G5251TotalWin';
import { G5251AudioName } from '../types/G5251AudioEnum';
import { g5251Model } from '../model/G5251Model';
import { G5251SlotMain } from '../view/G5251SlotMain';
import { G5251SlotReady } from '../view/G5251SlotReady';
import { G5251SlotReel } from '../view/G5251SlotReel';
import { G5251SymbolOdds } from '../view/G5251SymbolOdds';
import { commonStore } from '@common/h5GameTools/CommonStore';

const { ccclass, property } = _decorator;

@ccclass('G5251Controller')
export class G5251Controller extends Component {
    //時間
    private readonly RUN_TIME: number = 0.5;//轉動時間
    private readonly SCHEDULE_TIME: number = 0.05;//轉動間隔時間
    private readonly READY_TIME: number = 2;//聽牌轉動時間

    private _isTurbo: boolean = false;//是否為閃電模式
    private _speed: number = 1;//紀錄目前加速倍率

    //遊戲狀態判斷
    private _lineStopSlot: boolean[] = [];//各行slot停止狀態(便於立即停止判斷)
    // private canStop: boolean = false;//是否可以立即停止
    private _isCreateReady: boolean = false;//是否有生成過聽牌
    private _getBeginGameData: boolean = false;//是否獲得beginGame資料
    private _lineScatterPos: number[] = []; //記錄轉動過程中的scatter位置

    @property(Node)
    private handStopBtn: Node = null!;//手動停止按鈕

    //view免費遊戲相關節點
    @property({ type: G5251SlotMain, group: { name: 'View', id: '2' } })
    private slotMainView: G5251SlotMain = null!;//slot轉動層
    @property({ type: G5251SlotReel, group: { name: 'View', id: '2' } })
    private slotReelView: G5251SlotReel = null!;//輪軸層
    @property({ type: G5251TopMultiple, group: { name: 'View', id: '2' } })
    private topMultipleView: G5251TopMultiple = null!;//上方倍率介面
    @property({ type: G5251ScoreBar, group: { name: 'View', id: '2' } })
    private scoreBarView: G5251ScoreBar = null!;//贏得分數介面
    @property({ type: G5251SlotReady, group: { name: 'View', id: '2' } })
    private slotReadyView: G5251SlotReady = null!;//聽牌相關介面
    @property({ type: G5251FreeGame, group: { name: 'View', id: '2' } })
    private freeGameView: G5251FreeGame = null!;//免費遊戲剩餘次數介面
    @property({ type: G5251BigWin, group: { name: 'View', id: '2' } })
    private bigWinView: G5251BigWin = null!;//大獎介面
    @property({ type: G5251TotalWin, group: { name: 'View', id: '2' } })
    private totalWinView: G5251TotalWin = null!;//總贏分介面
    @property({ type: G5251SymbolOdds, group: { name: 'View', id: '2' } })
    private symbolOdds: G5251SymbolOdds = null!;//賠率按鈕介面

    /**
     * 初始化
     */
    public init() {
        this.handStopBtn.active = false;//禁用立即停止按鈕
        this.slotReelView.createSlotReel();//生成slot初始盤面symbol
        this.scoreBarView.showTip();//顯示跑馬燈
        this.setTurbo();
        //監聽閃電模式
        watch(() => commonStore.storeState.isTurbo, () => {
            this.setTurbo();
        });

        //強制加速
        // this.isTurbo = true;
        // this.speed = 2;

        this.freeGameView.showControlButton();//打開spin按鈕
    }

    /**
     * 設置賠率表
     * @param rates 
     */
    public setRates(rates: { [key: string]: number[] }) {
        if (rates) {
            this.symbolOdds.setRates(rates);
            this.symbolOdds.createOddsNode();//生成賠率節點
        }
    }

    /**
     * 設置閃電模式
     */
    private setTurbo() {
        this._isTurbo = commonStore.storeState.isTurbo;//是否為閃電模式
        this._speed = this._isTurbo ? 2 : 1;
    }

    /**
     * 開始轉動slot(按鈕按下就執行)
     */
    public async startSlotRun() {
        this._lineStopSlot = new Array(REEL_DATA.reelPosition.length).fill(false);//初始化各行slot停止狀態
        this._isCreateReady = false;//紀錄未生成過聽牌
        this.slotMainView.resetSlotReel();//重置輪軸symbol顯示
        this.symbolOdds.nodeActive(false);//隱藏賠率按鈕
        getAudioManager().playSound(G5251AudioName.BtnSpin);//播放spin音效
        const isFreeMode = g5251Model.getFreeMode();
        this.topMultipleView.multipleReSet(isFreeMode);//重置倍率
        if (!isFreeMode) {
            this.scoreBarView.showTip();//非免費模式才顯示回跑馬燈
        }
        this.slotRun();//開始轉動
    }

    /**
     * 處理 onBeginGame
     * @param beginGameMsg // 下注結果資料
     * @param jackpotMsg // 彩金表演資料
     */
    public async handleBeginGame(beginGameMsg: onBeginGame, jackpotMsg?: onHitJackpot) {
        Logger.debug('onBeginGame msg', beginGameMsg)
        this._getBeginGameData = true;//紀錄已獲得beginGame資料
        getEventManager().emit('getBeginGameData');//通知獲得beginGame資料
        g5251Model.setBeginGameData(beginGameMsg);//設定表演資料
        const isFreeMode = g5251Model.getFreeMode();
        if (isFreeMode) {
            const freeGameTime = g5251Model.getInitFreeGameTime();//初始計算剩餘免費遊戲次數(因為這邊會顯示已經加過再次獲得免費遊戲次數)
            this.freeGameView.updateFreeGameTime(freeGameTime);//更新免費遊戲次數
        }

        //監聽等待slotRunOver
        await new Promise<void>((resolve) => {
            const onSlotRunOver = () => {
                getEventManager().off('slotRunOver', onSlotRunOver);
                resolve();
            };
            getEventManager().on('slotRunOver', onSlotRunOver);
        });
        await this.slotResult();//執行slot轉動結果(包含免費遊戲轉完)
        const endCards = g5251Model.getEndCards();//最後一局symbol資料
        this.symbolOdds.setEndSymbolID(endCards);//設置最後一局symbolID列表
        this.symbolOdds.nodeActive(true);//顯示賠率按鈕
        if (jackpotMsg) {
            await this.handleJackpot(jackpotMsg);//【公版】等待彩金表演完
        }
        commonStore.storeMutation.setData('gameStatus', GameStatus.OnReady);// 遊戲狀態設成 onReady
    }

    /**
     * 立即停止
     */
    public forceStop() {
        if (!this.handStopBtn.active) return;//確保立即停止按鈕有啟用才觸發(避免【公版】直接觸發的立即停止)
        this.handStopBtn.active = false;//停用立即停止按鈕
        this.unscheduleAllCallbacks();//停止所有計時器
        for (let i = 0; i < this._lineStopSlot.length; i++) {
            if (!this._lineStopSlot[i]) {
                this._lineStopSlot[i] = true;//設定該行已執行停止轉動
                this.slotMainView.stotTween(i);//停止該行動畫
                const runTime = this.RUN_TIME * 0.8 / this._speed;
                const backTime = this.RUN_TIME * 0.2;
                const stopSymbols = g5251Model.getStopSymbols(i);
                const useCurrentPos = this.slotReadyView.testReadyLine(i);//如果此行聽牌有出現就使用當前位置停止
                this.slotMainView.stopRun(i, runTime, stopSymbols, backTime, easing.cubicOut, useCurrentPos);//重新執行停止slot轉動
            }
        }
        this.slotReadyView.hideAllReady();//隱藏聽牌物件
    }

    /**
     * 開始轉動slot
     */
    private async slotRun() {
        const runTime = this.RUN_TIME / this._speed;
        for (let i = 0; i < REEL_DATA.reelPosition.length; i++) {
            this.slotMainView.startRun(i, runTime);
            // this.isTurbo ? await G5251Utils.Delay(0) : await G5251Utils.Delay(this.scheduleTime);//閃電模式間隔一個frame
            // if (i < reelData.reelPosition.length - 1)
            !this._isTurbo && await G5251Utils.Delay(this.SCHEDULE_TIME);//閃電模式無間隔
        }
        //等待獲得beginGame資料
        if (!this._getBeginGameData) {
            await new Promise<void>((resolve) => {
                const onGetBeginGameData = () => {
                    getEventManager().off('getBeginGameData', onGetBeginGameData);
                    resolve();
                };
                getEventManager().on('getBeginGameData', onGetBeginGameData);
            });
        }
        this._getBeginGameData = false;//重置beginGame供下次使用
        //啟用立即停止
        this.scheduleOnce(() => {
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnReadyToStop);//【公版】啟用立即停止
            this.handStopBtn.active = true;//啟用立即停止按鈕
        }, 0.1)

        await G5251Utils.Delay(runTime);//等待一個轉動時間
        this.stopSlot(0);//停止轉動(第0行)
        await this.slotMainView.waitSlotEnd();//等待slot結束

        //停用立即停止
        this.handStopBtn.active = false;
        commonStore.storeMutation.setData('gameStatus', GameStatus.OnReelAllStop);//【公版】所有轉輪停止

        if (this._isCreateReady) {
            getAudioManager().stopSound(G5251AudioName.ReelReady);//停止聽牌音效
            await this.slotMainView.putScatterReady(this._lineScatterPos);//退還scatter聽牌物件(會還原靜態symbol)
        }
        this._lineScatterPos = [];//清空scatter位置
        getEventManager().emit('slotRunOver');//通知slotRunOver
    }

    /**
     * 停止轉動slot
     * @param slotLine 哪行slot
     */
    private async stopSlot(slotLine: number) {
        if (slotLine >= REEL_DATA.reelPosition.length) return;//最後一行就不再執行
        if (this._lineStopSlot[slotLine]) return;//如果此行已停止就不轉動
        const stopSymbols = g5251Model.getStopSymbols(slotLine);
        //判斷是否聽牌，scatter數量>=聽牌數量時
        if (this._lineScatterPos.length >= REEL_DATA.scatterReadyAmount) {
            if (!this._isCreateReady) {
                await G5251Utils.Delay((this.RUN_TIME - 0.1) / this._speed);
                if (this._lineStopSlot[slotLine]) return;//如果此行已停止就不轉動
                this._isCreateReady = true;//紀錄生成過聽牌
            }
            getAudioManager().playSound(G5251AudioName.ReelReady);//播放聽牌音效
            this.slotMainView.createScatterReady(this._lineScatterPos);//生成scatter聽牌物件
            this.slotReadyView.showReady(slotLine);//聽牌特效淡入顯示(slotLine)
            //非閃電模式才執行聽牌loop
            if (!this._isTurbo) {
                await this.slotMainView.readyLoopRun(slotLine, this.READY_TIME);//執行減速聽牌(哪行slot)
            }
            const runTime = this.READY_TIME * 0.9;
            const backTime = this.READY_TIME * 0.1;//回彈時間
            await this.slotMainView.stopRun(slotLine, runTime, stopSymbols, backTime, easing.sineOut, false);//停止slot轉動(哪行slot)
            this._lineStopSlot[slotLine] = true;//設定該行已執行停止轉動
            this.slotReadyView.hideReady(slotLine);//聽牌特效淡出(slotLine)
        } else {
            const runTime = this.RUN_TIME * 0.8 / this._speed;
            const backTime = this.RUN_TIME * 0.2;
            this.slotMainView.stopRun(slotLine, runTime, stopSymbols, backTime, easing.cubicOut, false);//停止slot轉動(哪行slot)
            this._lineStopSlot[slotLine] = true;//設定該行已執行停止轉動
            // this.isTurbo ? await G5251Utils.Delay(0) : await G5251Utils.Delay(this.scheduleTime);//閃電模式間隔一個frame
            !this._isTurbo && await G5251Utils.Delay(this.SCHEDULE_TIME);//閃電模式無間隔
        }
        //計算聽牌
        const lineScatterPos = g5251Model.getLineScatterPos(slotLine);
        this._lineScatterPos.push(...lineScatterPos);//合併scatter位置資料
        const nextLine = slotLine + 1;//下一行
        this.stopSlot(nextLine);//再次執行遊戲依序停止(下行slot)
    }

    /**
     * slot轉動結果
     */
    private async slotResult(): Promise<void> {
        return new Promise(async (resolve) => {
            const { creditEnd, payTotal, freeGamePayTotal, scatterPayOff } = g5251Model.getResultScore();//結果分數相關資料
            const newLines = g5251Model.getNewLines();//表演用Line資料
            const isFreeMode = g5251Model.getFreeMode();//是否為免費模式
            if (newLines.length > 0) {
                if (!isFreeMode)
                    this.scoreBarView.resetSaveScore();//重置起始計算分數(非免費模式)
                //中獎流程
                for (let i = 0; i < newLines.length; i++) {
                    this.slotMainView.slotBlackShow();//顯示遮黑層
                    await this.createWinSymbol(newLines[i]);//生成中獎symbol與動態轉換
                    getAudioManager().playSound(G5251AudioName.ReelWin);
                    const winScore = newLines[i].Payoff * newLines[i].DoubleTime;//贏得分數
                    this.scoreBarView.showWinScore(winScore);//顯示贏得分數
                    await G5251Utils.Delay(0.3);//等待全部中獎動態顯示完
                    getAudioManager().playSound(G5251AudioName.SymbolWin);
                    await this.slotMainView.symbolWin();//等待中獎表演完
                    this.slotMainView.goldToWildSymbol(newLines[i]);//金色變成wild
                    this.slotMainView.resetSymbolSiblingIndex();//重新設置symbol排序
                    await this.slotMainView.slotBlackHide();//隱藏遮黑層
                    this.slotMainView.putSymbolWin();//退還中獎symbol

                    //聽牌抖動
                    // const currentCards = model.getCards(i);//該回合symbol資料
                    // const scatterCount = currentCards.reduce((count, row) => count + row.filter(id => id === reelData.scatterID).length, 0);
                    // if (scatterCount >= reelData.scatterReadyAmount)
                    //     await this.slotMainView.symbolReadyShark(this.isTurbo);//symbol聽牌抖動

                    const nextCards = g5251Model.getCards(i + 1);//下回合symbol資料
                    const topSymbols = g5251Model.getTopSymbols();
                    await this.slotMainView.resetSymbol(nextCards, topSymbols);//重新設置symbol
                    //判斷升倍表演
                    if (i < 3) {
                        getAudioManager().playSound(`${G5251AudioName.MultipleUp}${i + 1}`);
                        this.topMultipleView.multipleChange(isFreeMode, i);//倍率切換
                    }
                    await this.slotMainView.symbolDrop(this._isTurbo);//執行掉落補牌(加速倍率)
                }
            }
            //該局贏分(分數校正為後端資料)
            if (payTotal > 0) {
                getAudioManager().playSound(G5251AudioName.ReelTotalWin);
                commonStore.storeMutation.setData('credit', creditEnd);//更新可用分數
                if (isFreeMode)
                    this.scoreBarView.updateScore(freeGamePayTotal);//更新總贏得分數(分數校正)
                else
                    await this.scoreBarView.scoreEnd(payTotal);//顯示贏得分數(分數校正)
            }

            await G5251Utils.Delay(0.2 / this._speed);//盤面結果短暫停留
            //是否顯示bigWin
            const bet = commonStore.storeState.bet;//下注分數
            // const bet = 6;//測試
            if (payTotal > 0 && payTotal >= bet * REEL_DATA.bigWinRange[0]) {
                getAudioManager().lowerMusic();//背景音變小
                await this.bigWinView.runBigWin(bet, payTotal);//顯示並等待大獎表演結束
                getAudioManager().restoreMusic();//恢復背景音
            }
            const isFreeHit = g5251Model.isFreeHit();
            //判斷是否中免費遊戲
            if (isFreeHit) {
                const winScatterPos = g5251Model.getWinScatterPos();//scatter位置
                this.slotMainView.createScatterWin(winScatterPos);//生成scatter中獎物件
                getAudioManager().playSound(G5251AudioName.ScatterHit);
                await G5251Utils.Delay(2);//等待語音結束
                this.slotMainView.resetSlotReel();//重置輪軸symbol顯示
                const addFreeGameTime = g5251Model.getAddFreeGameTime();//增加的免費遊戲次數
                const freeGameTime = g5251Model.getFreeGameTime();//剩餘免費次數
                if (isFreeMode) {
                    getAudioManager().playSound(G5251AudioName.FgRetrigger);
                    await this.freeGameView.showFreeGameAdd(addFreeGameTime, freeGameTime);
                } else {
                    getAudioManager().lowerMusic();//背景音變小
                    getAudioManager().playSound(G5251AudioName.FgTrigger);
                    this.scoreBarView.changeTotalWin(scatterPayOff);//"贏得"要改顯示"總贏得"文字
                    if (scatterPayOff === 0)
                        this.scoreBarView.showTip();//scatter沒得分，顯示回跑馬燈
                    await this.freeGameView.showFreeGameGet(addFreeGameTime);
                    g5251Model.setFreeMode(true);//設置免費模式
                    this.slotMainView.showFg();//顯示免費遊戲背景
                    getAudioManager().restoreMusic();//恢復背景音
                    getAudioManager().playMusic(G5251AudioName.BgmFg);//播放fg背景音樂
                    getAudioManager().playSound(G5251AudioName.MultipleChangeFg);
                    await this.topMultipleView.multipleChangeFree();//表演並等待倍率切換Free動態
                }
                getEventManager().emit(Game.SPIN);//自動呼叫spin
                // resolve();//測試表演假資料
            } else {
                if (isFreeMode) {
                    const isFreeLastGame = g5251Model.isFreeLastGame();
                    //判斷是否是免費遊戲最後一局表演結束
                    if (isFreeLastGame) {
                        if (freeGamePayTotal > 0) {
                            getAudioManager().lowerMusic();//背景音變小
                            await this.totalWinView.runTotalWin(freeGamePayTotal);//顯示並等待跑分完畢
                            getAudioManager().restoreMusic();//恢復背景音
                        } else {
                            getAudioManager().playSound(G5251AudioName.FgFinished);
                            await this.freeGameView.showFinished();//顯示免費遊戲表演結束介面
                        }
                        this.freeGameView.freeSpinsHide();//隱藏免費遊戲次數
                        getAudioManager().playMusic(G5251AudioName.BgmMg);//播放mg背景音樂
                        this.slotMainView.hideFg();//隱藏免費遊戲背景
                        g5251Model.setFreeMode(false);//設置非免費模式
                        resolve();
                    } else {
                        getEventManager().emit(Game.SPIN);//自動呼叫spin
                        // resolve();//測試表演假資料
                    }
                } else {
                    resolve();
                }
            }
        });
    }

    /**
     * 【公版】處理彩金流程
     * @param jackpotMsg 
     */
    private async handleJackpot(jackpotMsg: onHitJackpot): Promise<void> {
        return new Promise(async (resolve) => {
            //發送彩金表演
            const { JPAmount, JPType } = jackpotMsg.data;
            getEventManager().emit(Comm.HIT_JACKPOT, {
                jpAmount: JPAmount,
                jpType: JPType,
                callback: () => {
                    const creditEnd = jackpotMsg.data.beginGameResult.data.Credit_End;
                    commonStore.storeMutation.setData('credit', creditEnd);//更新可用分數
                    resolve();
                }
            });
        });
    }

    /**
     * 生成中獎symbol與動態轉換
     * @param newLine 該次中獎資料
     */
    private async createWinSymbol(newLines: NewLines): Promise<void> {
        return new Promise(async (resolve) => {
            const symbolPromises = [];
            for (let i = 0; i < newLines.Grids.length; i++) {
                for (let j = 0; j < newLines.Grids[i].length; j++) {
                    !this._isTurbo && await G5251Utils.Delay(0);//間隔生成中獎symbol
                    const symbolPromise = async () => {
                        getAudioManager().playSound(G5251AudioName.SymbolHit);
                        const symSubIndex = newLines.Grids[i][j];//位置
                        const winSymID = newLines.SymID[i][j];//中獎的symbolID
                        this.slotMainView.instSymbolWin(i, symSubIndex, winSymID);//生成中獎symbol
                    };
                    symbolPromises.push(symbolPromise());
                }
            }
            await Promise.all(symbolPromises);//等待所有symbol動態出現
            resolve();
        });
    }
}