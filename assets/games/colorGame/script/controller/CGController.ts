import { _decorator, Button, Component, Node, Animation, sys } from 'cc';
import { Game } from '@common/h5GameTools/GTCommEvents';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { Logger } from '@common/utils/Logger';
import { urlHelper } from '@common/utils/UrlHelper';
import { NumberUtils } from '@common/utils/NumberUtils';
import { getEventManager } from '@common/manager/EventManager';

import { CGView } from '../view/CGView';
import { CGModel } from '../model/CGModel';
import { CGZoomView } from '../view/CGZoomView';
import { CGChipDispatcher } from '../view/CGChipDispatcher';
import { CGRoundView } from '../view/CGRoundView';
import { CGChipSetView } from '../view/CGChipSetView';
import { CGDiceRunView } from '../view/CGDiceRunView';
import { CGRoadView } from '../view/CGRoadView';
import { BetInfoList, beginGame, creditExchange, joinGame, loadInfo, player, update, PayInfo, updateCredit } from '../enum/CGInterface';
import { CGRankView } from '../view/CGRankView';
import { CGUtils } from '../tools/CGUtils';
import { CGAudioName } from '../manager/CGAudioName';
import { BetType, GameState, RebetState } from '../enum/CGEnum';
import { CGGameData } from '../model/CGGameData';
import { CGTipMessage } from '../view/CGTipMessage';
import { colorGameConnector } from '../connector/CGGameConnector';
import { getAudioManager } from '@common/manager/AudioManager';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { GameStatus } from '@common/h5GameTools/State';


const { ccclass, property } = _decorator;

@ccclass('CGController')
export class CGController extends Component {
    @property(Node)
    public gameView!: Node;//view節點
    @property(Node)
    private waitConnect!: Node;//等待連線
    @property(Node)
    private waitNewRound!: Node;//等待派獎畫面
    @property(Node)
    private betArea!: Node;//押注區

    //view腳本
    public view!: CGView;//基本介面
    public zoomView!: CGZoomView;//骰子視角
    public chipDispatcher!: CGChipDispatcher;//籌碼表演
    public roundView!: CGRoundView;//回合流程
    public chipSetView!: CGChipSetView;//籌碼設置
    public diceRunView!: CGDiceRunView;//開骰表演
    public roadView!: CGRoadView;//路紙
    public rankView!: CGRankView;//排名
    public tipMessage!: CGTipMessage;//小提示訊息

    public betCredits: number[] = [];//暫存押注注區注額
    public onBetCount: number = 0;//等待押注資料回傳的數量

    private _joinGameNewRound: boolean = false;//joingame是否呼叫了新局開始
    private _userPayoff: number = 0;//紀錄本地玩家贏分(派彩時如果換分，會先把可用分數減去派彩分數，表演完後會加回可用分數並清空贏分)
    private _stopRunExchange: boolean = false;//是否停止表演換分(倒數時間為0時先暫時不表演換分)
    private _betType: BetType = BetType.NEW_BET;//押注類型
    private _loginNum: number = 1;//登入線路
    private _isBeginGame: boolean = false;//是否開始押注
    private _canUpdateCredit: boolean = false;//是否可以更新UpdateCredit

    /**
     * 配置view腳本
     */
    public onLoad(): void {
        this.view = this.gameView.getComponentInChildren(CGView)!;
        this.zoomView = this.gameView.getComponentInChildren(CGZoomView)!;
        this.chipDispatcher = this.gameView.getComponentInChildren(CGChipDispatcher)!;
        this.roundView = this.gameView.getComponentInChildren(CGRoundView)!;
        this.chipSetView = this.gameView.getComponentInChildren(CGChipSetView)!;
        this.diceRunView = this.gameView.getComponentInChildren(CGDiceRunView)!;
        this.roadView = this.gameView.getComponentInChildren(CGRoadView)!;
        this.rankView = this.gameView.getComponentInChildren(CGRankView)!;
        this.tipMessage = this.gameView.getComponentInChildren(CGTipMessage)!;
        //紀錄目前多開登入人數
        let loginNumArray = JSON.parse(sys.localStorage.getItem('colorGameLogInNum') || '[1, 2, 3, 4]');//讀取目前登入線路數量
        if (loginNumArray.length > 4)
            loginNumArray = [1, 2, 3, 4];
        if (loginNumArray.length > 0) {
            const randomIndex = Math.floor(Math.random() * loginNumArray.length);
            this._loginNum = loginNumArray[randomIndex];
            loginNumArray.splice(randomIndex, 1);
        } else
            this._loginNum = 5;
        sys.localStorage.setItem('colorGameLogInNum', JSON.stringify(loginNumArray));
        //頁面關閉後退出
        window.onbeforeunload = () => {
            this.exitLogin();//還原登入線路紀錄
        };
    }


    /**
     * 銷毀
     */
    protected onDestroy() {
        this.unscheduleAllCallbacks();//停止所有計時器
        if (this.chipDispatcher) {
            this.chipDispatcher.clearPool();//清除預置體
        }
        this.exitLogin();//還原登入線路紀錄
        window.onbeforeunload = null;// 移除頁面關閉事件監聽
        CGModel.getInstance().init();
        CGGameData.getInstance().init()
    }

    /**
     * 還原登入線路紀錄
     */
    private exitLogin() {
        if (!this.isValid || this._loginNum === 5) {
            return;
        }
        const loginNumArray = JSON.parse(sys.localStorage.getItem('colorGameLogInNum'));
        if (loginNumArray) {
            loginNumArray.push(this._loginNum);
            sys.localStorage.setItem('colorGameLogInNum', JSON.stringify(loginNumArray));
        } else {
            sys.localStorage.setItem('colorGameLogInNum', '[1, 2, 3, 4]');
        }
    }

    /**
     * 開始執行遊戲
     */
    public startController() {
        const model = CGModel.getInstance();
        getAudioManager().playMusic(CGAudioName.Bgm);//播放背景音
        this.chipSetView.initSetChipCreditList();//初始化籌碼列表

        //如果非XC版本，則顯示排名介面
        if (urlHelper.site !== 'XC')
            this.rankView.showRankView();

        this.roadView.updateRoadMap(model.roadMap, model.getRoadMapRate());//更新路紙
        this.rankView.updateRanks(model.rankings, model.userData);//更新排名，同時判斷跟注狀態
        this.rankView.updateLiveCount(model.liveCount);//更新線上人數
        this.diceRunView.diceIdle(model.startColor);//初始化骰子(隨機顏色)
        this.betBtnInteratable(false);//禁用注區按鈕
        model.initBetData();//初始化參數
        getEventManager().on('OnButtonEventPressed', this.betAreaPressed.bind(this));
    }

    //=============【處理遊戲流程】=============
    /**
     * 新局開始
     * @param startColor 開始顏色編號
     */
    private runNewRound() {
        const model = CGModel.getInstance();
        model.initBetData();//初始化參數
        CGUtils.PlayAnimAutoHide(this.waitNewRound, 'WaitNewRoundHide');//隱藏等待新局畫面
        model.setRankings();//更新前三名資料
        this.rankView.updateRanks(model.rankings, model.userData);//更新排名，同時判斷跟注狀態
        this.view.updateTotalBetArea(model.totalBetCredits);//更新總注區額度
        commonStore.storeMutation.setData('totalBet', 0);//更新公版押注總額
        this.view.updateUserBetArea(model.localBetCredits);//更新本地用戶注額
        this.zoomView.zoomShowing();//放大鏡功能顯示
        this.diceRunView.diceIdle(model.startColor);//初始化骰子(隨機顏色)
        this.roundView.newRound();//開始執行遊戲回合
    }

    /**
     * 開始押注
     * @param betInfo 押注資料
     */
    private runBeginGame(betInfo: BetInfoList[]) {
        const model = CGModel.getInstance();
        if (betInfo && betInfo.length > 0) {
            // Logger.debug("添加押注資料", betInfo)
            const { rankerBetCredits, otherBetCredits } = model.addBetInfoToPlayerList(betInfo);//添加押注資料到玩家列表(返回新增的押注資料)
            this.userBet(rankerBetCredits, otherBetCredits);
        }
        this.roundView.setCountdown(model.countdown, model.betTotalTime);//表演時間倒數
        //gs最後一秒不能押注，因此表演提早一秒結束
        if (model.countdown <= 1) {
            this.betBtnInteratable(false);//禁用注區按鈕
            this.roundView.betStop();//停止押注
            this.chipDispatcher.betStop();//停止押注
            if (this.onBetCount <= 0)
                this.chipDispatcher.clearTempBetChip();//如果沒有等待押注回傳中，就清除暫存籌碼(避免server回傳的下注比較慢)
        }
    }

    /**
     * 是否啟用押注區按鈕
     * @param isActive 是否啟用
     */
    private betBtnInteratable(isActive: boolean) {
        this.chipDispatcher.isStartBet = isActive;
        for (let i = 0; i < this.betArea.children.length; i++) {
            this.betArea.children[i].getComponent(Button)!.interactable = isActive;
        }
    }

    /**
     * 判斷續押額度
     * @param betCredits 續押各注區額度
     */
    private async isRunRebet(betCredits: number[]) {
        if (!betCredits)
            return;
        const newBetCredit = CGUtils.sumArray(betCredits);//續押總額度
        if (this.checkOverMaxBet(newBetCredit)) {//判斷總押注是否在限額範圍內
            this._betType = BetType.RE_BET;//設置押注類型
            this.betCredits = betCredits;//設置續押注區注額
            if (await this.checkCreditEnough(newBetCredit)) {
                return;
            }
        }
        this.chipDispatcher.setRebet(RebetState.INIT);//續押狀態初始化
    }

    /**
     * 處理開骰流程
     * @param payInfo 派彩資料
     */
    private async runOpening(payInfo: PayInfo[]) {
        const model = CGModel.getInstance();
        this.chipDispatcher.updateRebetData(model.rebetTotal, model.localBetCredits);//更新上局續押金額
        Logger.debug('贏分資料', payInfo);
        let getUserPayoff = model.addPayToPlayerList(payInfo);//獲得本地玩家贏分資料(有可能是null)
        if (getUserPayoff) {
            this._userPayoff = getUserPayoff;//添加贏分資訊到所有玩家資料，並獲取本地玩家贏分
            gtmEvent.CORE_GAME_PAYOFF(this._userPayoff);//【公版】發送派彩的 GTM 事件
        }

        this._stopRunExchange = false;//恢復表演換分
        setTimeout(() => {
            if (!this.isValid) return;
            getAudioManager().playSound(CGAudioName.DiceRotate);
        }, 100);

        await this.diceRunView.diceStart(model.pathID, model.winDice);//骰子表演
        if (!this.isValid) return;
        this.roundView.showResult(model.winDice);//顯示結算彈窗
        this.roadView.updateRoadMap(model.roadMap, model.getRoadMapRate());//更新路紙
        //派彩
        const { localWinArea, betOdds, winNum } = model.calculateWinData();//計算表演所需參數
        this.roundView.endRound(localWinArea, betOdds, winNum, this._userPayoff)//表演開獎結果

        await CGUtils.Delay(1.4);
        if (!this.isValid) return;
        for (let i = 0; i < betOdds.length; i++) {
            betOdds[i] === 0 && this.chipDispatcher.recycleChip(i);//回收未中獎的籌碼 
        }

        await CGUtils.Delay(1);
        if (!this.isValid) return;

        await this.chipDispatcher.payChipToBetArea(betOdds);//派發籌碼
        if (!this.isValid) return;
        //本地玩家加分
        if (this._userPayoff > 0) {
            getAudioManager().playSound(CGAudioName.AddPay);
            this.roundView.showAddCredit(this._userPayoff);//顯示加分
            model.addCredit(this._userPayoff);//用戶可用分數更新
            this._userPayoff = 0;//清空贏分
            commonStore.storeMutation.setData('credit', model.credit);//更新公版可用分數
        }
        this.rankView.updateRankerWin(model.playerList);//更新排名玩家分數
    }

    /**
     * 判斷是否在押注限額內
     * @param newBetCredit 新增押注額度
     * @returns 是否在押注限額內
     */
    private checkOverMaxBet(newBetCredit: number) {
        const model = CGModel.getInstance();
        const betLimit = model.getRemainingBetLimit();
        if (betLimit >= newBetCredit) {
            return true;
        } else {
            //彈出超出限額訊息
            getAudioManager().playOnceSound(CGAudioName.Error);
            this.tipMessage.showTipMessage('OverMaxBet');
            return false;
        }
    }


    /**
     * 判斷可用分數是否足夠，不足則檢查是否自動換分，告知公版下注金額
     * @param betCredit 押注額度
     * @returns 
     */
    private checkCreditEnough(betCredit: number): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            Logger.debug("請公版判斷餘額是否足夠", betCredit)
            commonStore.storeMutation.setData('bet', betCredit);//跟公版說下注多少
            getEventManager().emit(Game.PRE_SPIN, {
                callback: async (success: boolean) => {
                    resolve(success);
                    if (success) {
                        this.onBetCount++;//等待押注回傳數量+1
                        const betInfos = CGUtils.arrayToBetInfo(this.betCredits);//目前押注注區資料轉換成BetInfo格式
                        const beginGameMsg: any = await colorGameConnector.callBeginGame(betInfos);//傳送押注資料
                        this.onBetCount--;//等待押注回傳數量-1(回傳成功)
                        this.handleBeginGame(beginGameMsg);
                    } else {
                        this.chipDispatcher.lockBetTopBetns(false);//禁用押注按鈕介面
                        //判斷是否有玩家跟注
                        if (this.chipDispatcher.isCallStateAndStopCall()) {
                            this.tipMessage.showTipMessage('StopCall');//停止跟注
                        }
                    }
                }
            });
        });
    }
    //==================【處理遊戲流程】==================


    //==================【處理押注事件】==================
    /**
     * >>>>>>本地用戶押注區按下(監聽，僅做籌碼移動)<<<<<<
     * @param betID 注區ID
     */
    private async betAreaPressed(betID: string) {
        const chipCredit = CGGameData.getInstance().getChipCredit();//目前選擇的籌碼額度
        const betTempData = this.chipDispatcher.getTempBetData();//目前預先押注的金額
        const newBetCredit = NumberUtils.accAdd(betTempData.total, chipCredit);
        //判斷新增的籌碼分數是否在限額範圍內
        Logger.debug('新增總押注額', newBetCredit, '押注籌碼額度', chipCredit);
        if (this.checkOverMaxBet(newBetCredit)) {
            this.scheduleOnce(() => {
                getAudioManager().playOnceSound(CGAudioName.ChipBetLocal);
            }, 0.25);
            this.chipDispatcher.betChip(parseInt(betID), chipCredit, BetType.NEW_BET);//該籌碼移動至押注區
        }
    }

    /**
     * >>>>>>確認押注按鈕按下(按鈕事件)<<<<<<
     */
    public async btnBetConfirmDown() {
        this.chipDispatcher.lockBetTopBetns(true);//禁用押注按鈕介面
        getAudioManager().playOnceSound(CGAudioName.ChipBetLocal);
        const betTempData = this.chipDispatcher.getTempBetData();//獲取暫存押注資料
        this._betType = BetType.NEW_BET;//設置押注類型
        this.betCredits = betTempData.betCredits;//設置押注注區注額
        this.checkCreditEnough(betTempData.total);//判斷餘額是否足夠
    }

    /**
     * >>>>>>續押按鈕按下(按鈕事件)<<<<<<
     * @param event 
     * @param state 續押狀態
     */
    public btnRebetDown(event: Event, state: string) {
        const rebetState = state as RebetState;
        if (rebetState === RebetState.AUTO_STOP) {
            this.tipMessage.showTipMessage('StopAuto');
        } else if (rebetState === RebetState.AUTO_BET) {
            this.tipMessage.showTipMessage('AutoRebet');
        }
        const betCredits = this.chipDispatcher.setRebet(rebetState)!;//設置續押狀態
        this.isRunRebet(betCredits);//判斷續押額度
    }

    /**
     * 表演其他玩家押注
     * @param rankerBetCredits 前三名玩家新增注區注額
     * @param otherBetCredits 其他玩家新增注區注額
     */
    private userBet(rankerBetCredits: number[][], otherBetCredits: number[][]) {
        for (let i = 0; i < rankerBetCredits.length; i++) {
            this.otherUserDelayBet(i + 1, rankerBetCredits[i]);//前三名玩家新增注區注額(表演隨機延遲押注)
        }
        for (let i = 0; i < otherBetCredits.length; i++) {
            this.otherUserDelayBet(4, otherBetCredits[i]);//其他玩家新增注區注額(表演隨機延遲押注)
        }
    }

    /**
     * 表演其他玩家押注(做延遲效果)
     * @param userPosID 用戶節點位置(0=本地，1~3=前3名4=其他玩家)
     * @param betCredits 注區押注金額分佈
     */
    private async otherUserDelayBet(userPosID: number, betCredits: number[]) {
        const model = CGModel.getInstance();
        const betTotal = CGUtils.sumArray(betCredits);//押注總額
        const chipDispatcher = this.chipDispatcher;
        if (betTotal <= 0)
            return;//無新增注額就不表演
        //模擬延遲0~0.8秒押注
        model.countdown > 1 && await CGUtils.Delay(Math.random() * 0.8);//GS最後一秒不能押注
        if (!this.isValid) return;
        for (let betID = 0; betID < betCredits.length; betID++) {
            if (betCredits[betID] > 0) {

                //如果非XC版本，則表演排名玩家籌碼移動押注，否則統一表演為其他玩家(4)下注
                if (urlHelper.site !== 'XC')
                    chipDispatcher.otherUserBetChip(betID, userPosID, betCredits[betID]);//排名玩家籌碼押注
                else
                    chipDispatcher.otherUserBetChip(betID, 4, betCredits[betID]);//其他玩家籌碼押注

                //判斷是否跟注
                if (userPosID < 4 && chipDispatcher.testCall(userPosID - 1)) {
                    const chipCredit = CGGameData.getInstance().getChipCredit();//目前選擇籌碼額度
                    const betTempData = chipDispatcher.getTempBetData();//目前預先押注的金額
                    const newBetCredit = NumberUtils.accAdd(betTempData.total, chipCredit);
                    //判斷新增的籌碼分數是否在限額範圍內
                    if (this.checkOverMaxBet(newBetCredit)) {
                        //如果押注server回傳判斷值小於等於0且非停止下注狀態，才可以進行跟注
                        if (this.onBetCount <= 0 && this.chipDispatcher.isStartBet)
                            chipDispatcher.betChip(betID, chipCredit, BetType.NEW_BET, true);//該籌碼移動至押注區
                    }
                }
            }
        }
        // await CGUtils.Delay(0.25);//延遲更新分數
        model.updateTotalBetArea(betCredits);//更新注區注額
        this.view.updateTotalBetArea(model.totalBetCredits);//更新總注區額度
    }
    //==================【處理押注事件】==================


    //==================【處理(server)傳送的資料】===================
    /**
     * 處理登入遊戲流程
     * @param msg 用戶登入資料
     * @main
     */
    public handleLoadInfo(msg: loadInfo) {
        const { UserID, Balance, Credit, BetCreditList, BetRange, Currency } = msg.data;
        const gameData = CGGameData.getInstance();
        const model = CGModel.getInstance();
        model.credit = commonStore.storeState.customConfig.canExchange ? Credit : Balance;
        model.betMax = BetRange.Max;
        this.view.setLimitInfo(BetRange.Min, BetRange.Max);//更新限額資訊
        gameData.betCreditList = BetCreditList;
        gameData.userID = UserID;
    }

    /**
     * 處理加入遊戲流程
     * @param msg 加入遊戲資料
     * @main
     */
    public async handleJoinGame(msg: joinGame) {
        const { gameState, dice, playerData, countdown, betTotalTime, roundSerial, betData, BetTotal } = msg.data;
        const model = CGModel.getInstance();
        model.roundSerial = roundSerial;
        commonStore.storeMutation.setData('wagersID', `${roundSerial}`);
        await model.updateOnJoinGame(msg);
        model.countdown = countdown;
        model.userData = playerData;//儲存玩家資料
        this.startController();
        commonStore.storeMutation.setData('gameStatus', GameStatus.OnReady);//通知公版前端表演已結束，可以進行下一局
        switch (gameState) {
            case GameState.NEW_ROUND:
                this.runNewRound();
                this._joinGameNewRound = true;
                setTimeout(() => {
                    this._joinGameNewRound = false;//因為update可能會再次發送newRound，所以需要等2秒關閉狀態，避免重複接收newRound
                }, 2000);
                break;
            case GameState.BEGIN_GAME:
                if (countdown > 0) {
                    this._isBeginGame = true;//紀錄收到第一次beginGame
                    this.runBeginGame([]);
                    if (countdown > 1) {
                        this.roundView.betStart();//開始押注
                        this.betBtnInteratable(true);//啟用注區按鈕
                    }
                    const { rankerBetCredits, otherBetCredits } = model.setBetAreaCredit();//設置玩家押注注區額度
                    this.userBet(rankerBetCredits, otherBetCredits);//其他玩家籌碼派發

                    //如果有押注資料，則進行續押
                    if (betData) {
                        const localBetCredits = await model.betInfoToBetCredits(betData);
                        const betInfo = CGUtils.arrayToBetInfo(localBetCredits);//將數字陣列轉換成BetInfo格式
                        this._betType = BetType.RE_BET;//剛進入的下注類型使用續押籌碼(還原下注籌碼)
                        //模擬server回傳beginGame資料(同局回桌下注)
                        this.handleBeginGame({
                            action: "beginGame",
                            event: true,
                            data: {
                                BetTotal: BetTotal!,
                                Credit: model.credit,
                                betInfo: { Cards: betInfo },//目前押注注區資料轉換成BetInfo格式
                            },
                            gameType: urlHelper.gameType,
                        });
                        //籌碼移動
                        for (let i = 0; i < localBetCredits.length; i++) {
                            if (localBetCredits[i] > 0) {
                                this.chipDispatcher.betChip(i, localBetCredits[i], BetType.RE_BET);//該籌碼移動至押注區
                            }
                        }
                    }
                } else {
                    this.roundView.betStop();//停止押注
                }
                break;
            case GameState.OPENING:
            case GameState.ENDED_GAME:
                this._canUpdateCredit = true;//可以更新updateCredit
                this._isBeginGame = false;//取消beginGame狀態
                // if (dice) {
                commonStore.storeMutation.setData('gameStatus', GameStatus.OnGetBeginGameResult);//禁止下注階段
                this.waitNewRound.active = true;//等待新局開始
                this.waitNewRound.getComponent(Animation)!.play('WaitNewRoundShow');
                // }
                break;
        }

        this.waitConnect.active = false;//等待連線畫面隱藏
    }

    /**
     * 處理信用變換流程
     * @param msg 信用變換資料
     * @main
     */
    public async handleCreditExchange(msg: creditExchange) {
        const model = CGModel.getInstance();
        //如果停止表演換分階段則需先等待
        while (this._stopRunExchange) {
            await CGUtils.Delay(0.1); // 每 0.1 秒檢查一次
        }
        model.credit = NumberUtils.accSub(msg.data.Credit, this._userPayoff);//如果有表演分數需要先減去
        commonStore.storeMutation.setData('credit', model.credit);
        commonStore.storeMutation.setData('balance', msg.data.Balance);
    }

    /**
     * 處理玩家進出流程
     * @param msg 玩家進出資料
     * @main
     */
    public handlePlayer(msg: player) {
        const { enter, leave } = msg.data;
        const model = CGModel.getInstance();
        if (enter && enter.length > 0) {
            model.addPlayerList(enter); // 添加玩家資料並轉換格式
        }
        if (leave && leave.length > 0) {
            model.removePlayerList(leave); // 移除玩家資料
        }
        this.rankView.updateLiveCount(model.liveCount);//更新線上人數
    }

    /**
     * 處理更新流程
     * @param msg 更新資料
     * @main
     */
    public handleUpdate(msg: update) {
        const { state, startColor, countdown, betInfo, position, dice, roadmapRate, payInfo, roundSerial, wagersID } = msg.data;
        const model = CGModel.getInstance();
        model.countdown = countdown!;
        model.startColor = startColor!;
        switch (state) {
            case GameState.NEW_ROUND:
                this._canUpdateCredit = false;//取消更新updateCredit
                commonStore.storeMutation.setData('gameStatus', GameStatus.OnReady);//通知公版前端表演已結束，可以進行下一局
                commonStore.storeMutation.setData('wagersID', `${roundSerial}`);//更新局號
                model.roundSerial = roundSerial!;
                //如果joinGame未呼叫過新局開始，則呼叫新局開始流程(避免重複接收newRound)
                if (!this._joinGameNewRound) { this.runNewRound(); }
                break;
            case GameState.BEGIN_GAME:
                if (countdown! > 0) {
                    //update時判斷是否是第一次beginGame
                    if (!this._isBeginGame) {
                        this._isBeginGame = true;//紀錄收到第一次beginGame
                        //開始押注時間，根據多開數量延遲傳送，過多時改成隨機等待0~.0.3秒才傳送續押
                        let delayTime = (this._loginNum - 1) * 110;
                        if (delayTime > 330 || delayTime < 0) {
                            delayTime = Math.random() * 330;
                        }
                        setTimeout(() => {
                            this.betBtnInteratable(true);//啟用注區按鈕
                            this.isRunRebet(this.chipDispatcher.getRebetBetCredits()!);//判斷是否續押
                            this.runBeginGame(betInfo!);//開始押注
                        }, delayTime);
                    } else {
                        this.runBeginGame(betInfo!);//開始押注
                    }
                } else {
                    this._stopRunExchange = true;//停止表演換分
                }
                break;
            case GameState.OPENING:
                this._isBeginGame = false;//取消beginGame狀態
                commonStore.storeMutation.setData('gameStatus', GameStatus.OnGetBeginGameResult);//禁止下注階段
                if (wagersID && wagersID !== 0) {
                    commonStore.storeMutation.setData('wagersID', `${model.roundSerial}-${wagersID}`);//更新局號跟注單號
                }
                this.zoomView.zoomHideing();//放大鏡功能隱藏
                model.pathID = position!;
                model.winDice = dice!;
                model.setRoadMapRate(roadmapRate!);
                model.updateRoadMap();//更新路紙
                if (!this.waitNewRound.active)
                    this.runOpening(payInfo!);//表演開骰流程(非等待回合畫面才執行)
                else
                    model.addPayToPlayerList(payInfo!);//加分
                break;
            case GameState.ENDED_GAME:
                break;
        }
    }

    /**
     * 處理押注事件
     * @param msg 押注回傳資訊 
     * @main
     */
    public handleBeginGame(msg: beginGame) {
        //發送押注相關的 GTM 事件
        if (msg.event) {
            const tempBetData = this.chipDispatcher.getTempBetData();
            if (tempBetData.callBet > 0) {
                gtmEvent.CORE_GAME_CALLBET();//【公版】發送跟注的 GTM 事件
            }
            //如果有手動下注分數或續押，則發送下注的 GTM 事件
            if (tempBetData.userBet > 0 || this._betType === BetType.RE_BET) {
                gtmEvent.CORE_GAME_BET();//【公版】發送下注的 GTM 事件
            }
        }

        if (!msg.event) {
            getAudioManager().playOnceSound(CGAudioName.Error);
            if (this._betType === BetType.NEW_BET) {
                this.chipDispatcher.clearTempBetChip();//清除暫存籌碼
                getAudioManager().playOnceSound(CGAudioName.Error);
                this.tipMessage.showTipMessage('BetFailed');
            } else {
                this.chipDispatcher.setRebet(RebetState.INIT);//初始化續押狀態
                getAudioManager().playOnceSound(CGAudioName.Error);
                this.tipMessage.showTipMessage('RebetFailed');
            }
            return;
        }
        const { betInfo, Credit, BetTotal, wagersID } = msg.data;
        const model = CGModel.getInstance();
        model.updateBetCredit(betInfo.Cards, Credit);//更新本地押注額度
        if (wagersID && wagersID !== 0) {
            commonStore.storeMutation.setData('wagersID', `${model.roundSerial}-${wagersID}`);//更新局號跟注單號
        }
        this.chipDispatcher.betSuccess(this._betType, BetTotal);
        commonStore.storeMutation.setData('credit', model.credit);//更新公版可用分數
        this.view.updateTotalBetArea(model.totalBetCredits);
        commonStore.storeMutation.setData('totalBet', BetTotal);//更新公版押注總額
        this.view.updateUserBetArea(model.localBetCredits);
    }

    /**
     * 處理更新Credit流程(如果上次離線時的下注有中獎，則會更新Credit)
     * @param msg 更新Credit資料
     * @main
     */
    public handleUpdateCredit(msg: updateCredit) {
        //如果是可更新餘額狀態才更新餘額(因為這款會有籌碼移動到可用分數位置才更新分數表演)
        if (this._canUpdateCredit) {
            CGModel.getInstance().credit = msg.data.credit;//更新可用餘額
            commonStore.storeMutation.setData('credit', msg.data.credit);//更新公版可用分數
            this._canUpdateCredit = false;//第一次進入遊戲執行後，就不再執行
        }
    }
    //==================【處理(server)傳送的資料】==================
}