import { _decorator, Component } from 'cc';

import { getEventManager } from '@common/manager/EventManager';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { Logger } from '@common/utils/Logger';
import { watch } from '@common/utils/Reactivity';

import { onBeginGame, onHitJackpot } from '../data/G5279Interface';
import { G5279BetState, G5279GameState } from '../data/G5279Enum';
import { getG5279Model } from '../model/G5279Model';
import { G5279ReelController } from './G5279ReelController';
import { G5279SkipController } from './G5279SkipController';
import { Comm } from '@common/h5GameTools/GTCommEvents';

const { ccclass, property } = _decorator;

@ccclass('G5279MainController')
export class G5279MainController extends Component {
    private timeScaleWatcher: (() => void) | null = null;

    @property(G5279ReelController)
    private reelController: G5279ReelController = null!;//輪軸控制器
    @property(G5279SkipController)
    private skipController: G5279SkipController = null!;//跳過控制器

    protected onLoad() {
        this.setupWatchers();
        this.addEventListeners();
    }

    /**
     * 設置事件監聽器
     */
    private addEventListeners() {
        getEventManager().on('updateBetState', this.onUpdateBetState.bind(this));//更新下注狀態
    }

    /**
     * 銷毀
     */
    protected onDestroy() {
        getEventManager().off('updateBetState', this.onUpdateBetState.bind(this));
    }

    /**
     * 更新下注狀態
     * @param state 下注狀態
     */
    private onUpdateBetState(state: G5279BetState) {
        getG5279Model().betState = state;
    }

    /**
     * 監聽閃電模式變化
     */
    private setupWatchers() {
        watch(() => commonStore.storeState.isTurbo,
            (isTurbo) => this.updateTimeScale(isTurbo)
        );
    }

    // 更新timeScale的方法
    private updateTimeScale(isTurbo: boolean) {
        //如果是skip模式下，不會執行時間調整
        if (this.skipController.isSkiping()) return;
        getG5279Model().timeScale = isTurbo ? 2 : 1;
    }

    /**
     * 處理 onBeginGame
     * @param beginGameMsg // 下注結果資料
     * @param jackpotMsg // 彩金表演資料
     */
    public async handleBeginGame(beginGameMsg: onBeginGame, jackpotMsg?: onHitJackpot) {
        Logger.debug('onBeginGame msg', beginGameMsg)
        const { cards, chanceCards, floors } = beginGameMsg.data;

        //需要等盤面清除完畢
        // this.skipController.showSkipBtn();//顯示跳過按鈕
        getG5279Model().setBeginGameData(beginGameMsg);//設定表演資料

        this.reelController.initReel();//初始化盤面
        const startLevel = getG5279Model().getStartLevel(cards);
        await this.reelController.resetReelAndCreate(startLevel, floors[0], cards[0].flat());//重置盤面並生成
        await this.slotResult(beginGameMsg);//執行slot轉動結果(包含免費遊戲轉完)

        if (jackpotMsg) {
            await this.handleJackpot(jackpotMsg);//【公版】等待彩金表演完
        }

        //設置盤面停止的symbol點擊資訊
        const lastCards = cards[cards.length - 1].flat();
        this.reelController.setReelSymbol(lastCards);//設置盤面符號資料
        getG5279Model().gameState = G5279GameState.ON_READY;//準備狀態

        // commonStore.CommonStore.shared.storeMutation.setData('gameStatus', GameStatus.OnReelAllStop);//【公版】所有轉輪停止
        // console.log("所有轉輪停止OnReelAllStop狀態");
    }

    /**
     * slot轉動結果表演
     */
    private async slotResult(beginGameMsg: onBeginGame) {
        const { totalPay, lines, cards, floors, bonusGame, creditEnd } = beginGameMsg.data;
        if (lines.length > 0) {
            this.skipController.showSkipBtn();//有連線才顯示跳過按鈕
            let runEvent = '';
            let floorIndex = 0;//地板資料index
            //表演中獎流程
            for (let i = 0; i < lines.length; i++) {
                const nextCards2D = cards[i + 1];
                const nextCards = nextCards2D.flat();//攤平2D陣列
                for (let j = 0; j < lines[i].length; j++) {
                    const lineData = lines[i][j];
                    runEvent = lineData.event;
                    switch (lineData.event) {
                        case 'collect':
                            await this.reelController.handleLineResult(lineData);//處理中線表演
                            break;
                        case 'ratCollect':
                            await this.reelController.handleRatResult(lineData);//處理老鼠表演
                            break;
                        case 'nextLevel':
                            floorIndex++;//地板資料index++
                            await this.reelController.handleNextLevel(floors[floorIndex], nextCards);//處理下一關卡表演
                            break;
                        case 'chanceCard':
                            await this.reelController.handleChanceResult(nextCards);//使用機會卡
                            break;
                        case 'party':
                            await this.reelController.handlePartyResult(nextCards)
                            break;
                        case 'hitFree':
                            floorIndex++;//地板資料index++
                            await this.reelController.handleHitFreeResult(lineData, floors[floorIndex], nextCards);
                            break;
                    }
                }
                if (runEvent === 'collect' || runEvent === 'ratCollect') {
                    await this.reelController.dropSymbol(nextCards);//補牌並配置下局盤面
                }
            }

        }
        //回歸遊戲速度
        getG5279Model().timeScale = commonStore.storeState.isTurbo ? 2 : 1;
        this.skipController.stopSkip();//禁用跳過按鈕

        //如果有進入bonusGame就顯示totalWin表演
        if (bonusGame!.status) {
            await this.reelController.handleTotalWin(totalPay);
        }

        if (totalPay > 0) {
            await this.reelController.handleScoreResult(totalPay);//贏分結果，大獎跑分與共贏得
            commonStore.storeMutation.setData('credit', creditEnd);//更新可用分數(分數校正為後端資料)
        }
    }

    //---------------------------------【公版相關】---------------------------------
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
                callback: () => resolve()
            });
        });
    }
    //---------------------------------【公版相關】---------------------------------
}