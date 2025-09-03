import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { getAudioManager } from '@common/manager/AudioManager';
import { getLanguageManager } from '@common/manager/LanguageManager';
import { getPoolManager } from '@common/manager/PoolManager';
import { Logger } from '@common/utils/Logger';
import { NumberUtils } from '@common/utils/NumberUtils';
import { _decorator, Component, Node, tween, Vec3, Label, Sprite, UITransform, Button, Prefab, SpriteFrame, Animation, UIOpacity } from 'cc';

import { BetType, RebetState } from '@/games/colorGame/script/enum/CGEnum';
import { RebetData } from '@/games/colorGame/script/enum/CGInterface';
import { CGAudioName } from '@/games/colorGame/script/manager/CGAudioName';


import { CGGameData } from '@/games/colorGame/script/model/CGGameData';
import { CGUtils } from '@/games/colorGame/script/tools/CGUtils';

const { ccclass, property } = _decorator;

//生成籌碼屬性設置
interface ChipNode extends Node {
    ChipID: number;//籌碼額度ID
    UserPosID: number;//籌碼是誰的(0=本地，1~3=前三名，4=其他玩家)
    BetID: number;//下在哪個注區(0~5)
    CallChip: boolean;//是否是跟注籌碼
}

//暫存押注籌碼
interface TempBetData {
    betCredits: number[];//各注區的總押注額
    // betInfos: BetInfo[];//各注區的總押注額
    callBet: number;//跟注額度
    userBet: number;//用戶押注額度
    total: number;//暫存押注總金額
    betChips: Node[];//暫存的押注籌碼
    betChipCredits: number[];//暫存的籌碼額度
}

@ccclass('CGChipDispatcher')
export class CGChipDispatcher extends Component {
    @property(Node)
    private chipDispatcher!: Node;//籌碼派發層

    @property(Node)//籌碼選擇區
    private touchChip!: Node;

    @property([Node])
    private btnCall!: Node[];//跟注按鈕(3顆)

    @property([Node])
    private btnStopCall!: Node[];//取消跟注按鈕(3顆)

    @property([Node])
    private callFx!: Node[];//跟注特效

    @property(Node)
    private btnRebet!: Node;//續押按鈕

    @property(Node)
    private btnAuto!: Node;//自動投注按鈕

    @property(Node)
    private btnAutoStop!: Node;//停止自動投注按鈕

    @property(Label)
    private rebetCreditLable!: Label;//續押額度

    @property(Node)
    private betTopBtns!: Node;//押注按鈕區

    @property(Node)//用戶位置
    private userPos!: Node;

    @property([Node])
    private addBetCredit: Node[] = [];//新增押注額分數節點(分數右側)

    @property([SpriteFrame])
    private chipSF: SpriteFrame[] = [];//押注籌碼貼圖

    @property(SpriteFrame)
    private chipReBetSF: SpriteFrame = null!;//續押籌碼貼圖

    @property(Prefab)
    private betChipBlack: Prefab = null!;//其他用戶押注籌碼

    @property(Prefab)
    private betChipColor: Prefab = null!;//本地用戶押注籌碼

    public isStartBet: boolean = false;//是否開始押注

    private _rebetData!: RebetData;//本地續押資料
    private _tempBetData!: TempBetData;//本地暫存押注資料

    // private isBetTime: boolean = false;//是否是押注時間

    /**
     * 設置按鈕事件監聽器
     */
    protected onLoad(): void {
        for (let i = 0; i < this.btnCall.length; i++) {
            this.bindButtonEvent(this.btnCall[i], 'btnCallDown', i.toString());//跟注按鈕事件
        }
        for (let i = 0; i < this.btnStopCall.length; i++) {
            this.bindButtonEvent(this.btnStopCall[i], 'btnStopCallDown', i.toString());//停止跟注按鈕事件件
        }
        this.bindButtonEvent(this.betTopBtns.getChildByName('BtnBetUndo')!, 'betUndo');//返回上一步按鈕事件
        this.bindButtonEvent(this.betTopBtns.getChildByName('BtnBetClear')!, 'clearTempBetChip');//清除押注按鈕事件
        //初始化參數
        this._rebetData = { betCredits: Array(6).fill(0), total: 0, state: RebetState.INIT };
        this._tempBetData = { betCredits: Array(6).fill(0), callBet: 0, userBet: 0, total: 0, betChips: [], betChipCredits: [] };
        this.initializeChipPool();//預先生成pool
    }

    /**
     * 清除物件池
     */
    // public clearPool() {
    //     getPoolManager().clear(); // 清除池
    // }

    /**
     * 按鈕事件設置
     * @param touchNode 觸發節點 
     * @param handler 函數名稱
     * @param customData 自定義事件數據?
     */
    private bindButtonEvent(touchNode: Node, handler: string, customData?: string) {
        const componentName = this.name.match(/<(.+)>/)?.[1] || '';
        CGUtils.bindButtonEvent(this.node, componentName, touchNode, handler, customData);
    }

    /**
     * 預先生成pool
     */
    private initializeChipPool() {
        const tempPool: Node[] = [];
        for (let i = 0; i < 300; i++) {
            tempPool.push(getPoolManager().get(this.betChipBlack));
            i > 100 && tempPool.push(getPoolManager().get(this.betChipColor));
        }
        tempPool.forEach(chip => getPoolManager().put(chip));
    }

    /**
     * 跟注按鈕按下
     */
    private btnCallDown(event: Event, customEventData: string) {
        // getAudioManager().playOnceAudio(AudioName.BtnOpen);
        getAudioManager().playSound(CGAudioName.LockBet);
        const id = parseInt(customEventData);
        this.updateBetCallUI(id, true);//啟用跟注
        gtmEvent.CORE_GAME_CALLBET_CLICK();//【公版】發送跟注點擊的 GTM 事件
    }

    /**
     * 取消跟注按鈕按下
     */
    private btnStopCallDown(event: Event, customEventData: string) {
        getAudioManager().playOnceSound(CGAudioName.BtnClose);
        const id = parseInt(customEventData);
        this.updateBetCallUI(id, false);//停用跟注
    }

    /**
     * 判斷是否跟注該玩家
     * @param posID 玩家位置ID
     * @returns 
     */
    public testCall(posID: number) {
        return this.btnStopCall[posID].active;
    }

    /**
     * 判斷是否跟注狀態，如果是則停用跟注
     * @returns 
     */
    public isCallStateAndStopCall() {
        const hasActiveCall = this.btnStopCall.some(btn => btn.active);
        if (hasActiveCall) {
            for (let i = 0; i < 3; i++) {
                if (this.btnStopCall[i].active) {
                    this.updateBetCallUI(i, false);//停用跟注
                }
            }
        }
        return hasActiveCall;
    }

    /**
     * 更新跟注介面
     * @param id 按鈕ID
     * @param isActive 是否啟用
     */
    private updateBetCallUI(id: number, isActive: boolean) {
        this.btnCall[id].active = !isActive;
        this.btnStopCall[id].active = isActive;
        this.callFx[id].active = isActive;
    }

    /**
     * 返回上一步按下
     */
    private betUndo() {
        getAudioManager().playOnceSound(CGAudioName.BtnClose);
        const lastChip = this._tempBetData.betChips.pop()!;// 刪除最後一個籌碼
        const betID = (lastChip as ChipNode).BetID;
        const callChip = (lastChip as ChipNode).CallChip;
        getPoolManager().put(lastChip);
        const chipCredit = this._tempBetData.betChipCredits.pop()!;// 刪除最後一個額度

        //押注區額度扣回
        this._tempBetData.betCredits[betID] = NumberUtils.accSub(this._tempBetData.betCredits[betID], chipCredit);
        if (this._tempBetData.betCredits[betID] <= 0) {
            this.addBetCredit[betID].active = false;
        } else {
            this.addBetCredit[betID].active = true;
            this.addBetCredit[betID].getComponent(Label)!.string = '+' + CGUtils.NumDigits(this._tempBetData.betCredits[betID]);
        }
        //判斷退回的籌碼是否是跟注籌碼
        if (callChip) {
            this._tempBetData.callBet = NumberUtils.accSub(this._tempBetData.callBet, chipCredit);//跟注額度扣回
        } else {
            this._tempBetData.userBet = NumberUtils.accSub(this._tempBetData.userBet, chipCredit);//用戶押注額度扣回
        }
        this._tempBetData.total = NumberUtils.accSub(this._tempBetData.total, chipCredit);//總額度扣回
        this._tempBetData.total <= 0 ? this.clearTempBetData() : this.updateTempBetUI();
    }

    /**
     * 停止押注
     */
    public betStop() {
        this.setRebetInteractable(false);//禁用續押
    }

    /**
     * 清除暫存押注資料
     */
    private async clearTempBetData(betSuccess: boolean = false) {
        Logger.debug('清除暫存押注資料,關閉押注介面');
        //可下注階段且續押值大於0，則啟用續押
        if (this.isStartBet && this._rebetData.total > 0) {
            this.setRebetInteractable(true);//啟用續押
        }

        getAudioManager().playOnceSound(CGAudioName.BtnClose);
        this._tempBetData.total = 0;
        this._tempBetData.callBet = 0;
        this._tempBetData.userBet = 0;
        this._tempBetData.betCredits = Array(6).fill(0);//清空
        for (let i = 0; i < this.addBetCredit.length; i++) {
            this.addBetCredit[i].active = false;
        }
        this._tempBetData.betChipCredits = [];//清空
        this._tempBetData.betChips = [];
        this.updateTempBetUI();
        this.lockBetTopBetns(true);//禁用押注按鈕介面
        if (betSuccess) {
            this.betTopBtns.getComponent(Animation)!.play('BetTopBtnsActionHide');
        } else {
            this.betTopBtns.getComponent(Animation)!.play('BetTopBtnsHide');
        }
        await CGUtils.Delay(0.1);
        if (this.betTopBtns.getChildByName('LockBtn')!.active) {
            this.betTopBtns.active = false;//隱藏押注按鈕介面
        }
    }


    public lockBetTopBetns(isLock: boolean) {
        this.betTopBtns.getChildByName('LockBtn')!.active = isLock;
    }

    /**
     * 清除暫存籌碼
     */
    public clearTempBetChip() {
        while (this._tempBetData.betChips.length > 0) {
            const chip = this._tempBetData.betChips.pop()!;
            getPoolManager().put(chip); // 退還所有
        }
        this.clearTempBetData();//清除暫存押注資料
    }

    /**
     * 押注成功
     * @param type 押注類型
     * @param betTotal 目前押注總額
     */
    public betSuccess(type: BetType, betTotal: number) {
        this._rebetData.total = betTotal;
        this.rebetCreditLable.string = CGUtils.NumDigits(this._rebetData.total);//續押額度更新
        getAudioManager().playSound(CGAudioName.ChipBet);
        switch (type) {
            case BetType.NEW_BET:
                //新增的籌碼縮放
                for (let chip of this._tempBetData.betChips) {
                    chip.getComponent(UIOpacity)!.opacity = 255;
                    this.chipScale(chip);//新押注的籌碼縮放
                }
                this.clearTempBetData(true);//清除暫存押注資料
                if (this._rebetData.state === RebetState.INIT) {
                    this.updateRebetUI(RebetState.ONCE_BET);
                }
                break;
            case BetType.RE_BET:
                if (this._rebetData.state !== RebetState.AUTO_BET) {
                    this.updateRebetUI(RebetState.ONCE_BET);
                }
                for (let i = 0; i < this._rebetData.betCredits.length; i++) {
                    this.betChip(i, this._rebetData.betCredits[i], BetType.RE_BET);// 籌碼派發
                }
                break;
        }
    }

    /**
     * 暫存押注額度更新
     */
    private async updateTempBetUI() {
        const languageData = await getLanguageManager().getLanguageData('gameCore');
        const betInfo = this.betTopBtns.getChildByName('BetInfo');
        const betInfoLabel = betInfo!.getChildByName('Label')!;
        const betInfoCallLabel = betInfo!.getChildByName('CallLabel')!;
        betInfoLabel.getComponent(Label)!.string = languageData['TotalBet'] + ' : ' + CGUtils.NumDigits(this._tempBetData.total);
        //是否顯示跟注說明額度
        if (this._tempBetData.callBet > 0) {
            betInfoCallLabel.active = true;
            const userBetString = languageData['Bet'] + ' : ' + CGUtils.NumDigits(this._tempBetData.userBet);
            const callBetString = ' (' + languageData['Call'] + ' : ' + CGUtils.NumDigits(this._tempBetData.callBet) + ')';
            betInfoCallLabel.getComponent(Label)!.string = userBetString + callBetString;
        } else {
            betInfoCallLabel.active = false;
        }
    }

    /**
     * 取得暫存押注資料
     */
    public getTempBetData() {
        return this._tempBetData;
    }

    /**
     * 設置續押按鈕
     * @param isActive 是否啟用
     */
    private setRebetInteractable(isActive: boolean) {
        // Logger.debug('設置續押按鈕', isActive);
        if (this.btnRebet.active) {
            let opacity = isActive ? 255 : 128;
            this.rebetCreditLable.node.parent!.getComponent(UIOpacity)!.opacity = opacity;//續押金額透明度
        }
        this.btnRebet.getComponent(Button)!.interactable = isActive;
    }

    /**
     * 本地用戶押注
     * @param betID 注區ID
     * @param chipCredit 押注額度
     * @param betType 押注類型
     * @param callBool 是否是跟注
     * @controller
     */
    public betChip(betID: number, chipCredit: number, betType: BetType, callBool: boolean = false) {
        if (chipCredit <= 0)
            return;
        this.setRebetInteractable(false);//禁用續押
        const gameData = CGGameData.getInstance();
        const chipID = gameData.betCreditList.indexOf(chipCredit);
        const poolBetChip = getPoolManager().get(this.betChipColor) as ChipNode;
        poolBetChip.BetID = betID;
        poolBetChip.ChipID = chipID;
        poolBetChip.UserPosID = 0;//本地用戶節點位置為0
        poolBetChip.CallChip = callBool; //是否是跟注籌碼
        poolBetChip.children[0].getComponent(Label)!.string = CGUtils.NumDigitsKM(chipCredit);//設置籌碼額度
        const betChipPos = this.chipDispatcher.getChildByName('MainUser')!.children[betID];//押注區節點
        poolBetChip.parent = betChipPos;
        let opacity = 150;
        let spriteFrame = this.chipSF[chipID];
        let startNode = this.touchChip.children[gameData.touchChipPosID];
        if (betType === BetType.RE_BET) {
            opacity = 255;
            spriteFrame = this.chipReBetSF;
            startNode = this.btnRebet;
        }
        poolBetChip.getComponent(UIOpacity)!.opacity = opacity;
        poolBetChip.getComponent(Sprite)!.spriteFrame = spriteFrame;
        poolBetChip.position = startNode.getWorldPosition().subtract(betChipPos.worldPosition);
        this.chipMove(betChipPos, poolBetChip);
        if (betType === BetType.NEW_BET) {
            //更新暫存資料
            if (this._tempBetData.total === 0) {
                getAudioManager().playOnceSound(CGAudioName.BtnOpen);
                this.betTopBtns.active = true;//顯示投注區操作按鈕
                this.betTopBtns.getComponent(Animation)!.play('BetTopBtnsShow');
                this.lockBetTopBetns(false);//啟用押注按鈕介面
            }
            if (callBool) {
                this._tempBetData.callBet = NumberUtils.accAdd(this._tempBetData.callBet, chipCredit);//跟注額度增加
            } else {
                this._tempBetData.userBet = NumberUtils.accAdd(this._tempBetData.userBet, chipCredit);//用戶押注額度增加
            }
            this._tempBetData.total = NumberUtils.accAdd(this._tempBetData.total, chipCredit);//押注總額增加
            this._tempBetData.betCredits[betID] = NumberUtils.accAdd(this._tempBetData.betCredits[betID], chipCredit);
            this.addBetCredit[betID].active = true;
            this.addBetCredit[betID].getComponent(Label)!.string = '+' + CGUtils.NumDigits(this._tempBetData.betCredits[betID]);
            this._tempBetData.betChips.push(poolBetChip);//添加到暫存籌碼
            this._tempBetData.betChipCredits.push(chipCredit);
            this.updateTempBetUI();
        }
    }

    /**
     * 其他用戶押注
     * @param betID 注區ID
     * @param userPosID 用戶區域位置ID
     * @param chipCredit 押注的籌碼額度
     * @controller
     */
    public otherUserBetChip(betID: number, userPosID: number, chipCredit: number) {
        const poolBetChip = getPoolManager().get(this.betChipBlack) as ChipNode;
        poolBetChip.ChipID = -1;//其他用戶id為-1
        poolBetChip.UserPosID = userPosID;//用戶區域位置ID
        poolBetChip.children[0].getComponent(Label)!.string = CGUtils.NumDigitsKM(chipCredit);//設置籌碼額度
        const betChipPos = this.chipDispatcher.getChildByName('OtherUser')!.children[betID];//押注區節點
        poolBetChip.parent = betChipPos;
        this.userPos!.children[userPosID].getComponent(Animation)!.play('RankerBetMove');
        const startPos = this.userPos!.children[userPosID].getWorldPosition();
        poolBetChip.position = startPos.subtract(betChipPos.worldPosition);
        getAudioManager().playSound(CGAudioName.ChipBet);
        this.chipMove(betChipPos, poolBetChip);
    }

    /**
     * 籌碼移動
     * @param betPos 目標押注位置
     * @param poolBetChip 移動的籌碼
     */
    private chipMove(betChipPos: Node, poolBetChip: Node) {
        const betChipHeight = betChipPos.getComponent(UITransform)!.height;
        const betChipWidth = betChipPos.getComponent(UITransform)!.width;
        const movePos = new Vec3(betChipWidth / 2 - Math.random() * betChipWidth, betChipHeight / 2 - Math.random() * betChipHeight, 0);//籌碼移動位置
        tween(poolBetChip).to(0.3, { position: movePos }, { easing: 'sineOut' })
            .call(() => {
                this.chipScale(poolBetChip);//籌碼縮放動態
            }).start();
        poolBetChip.setScale(new Vec3(1.8, 1.8, 1));
        tween(poolBetChip).to(0.3, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    /**
     * 籌縮放動態
     * @param chip 籌碼
     */
    private chipScale(chip: Node) {
        tween(chip).to(0.03, { scale: new Vec3(1.1, 1.1, 1) })
            .then(tween(chip).to(0.15, { scale: new Vec3(1, 1, 1) }))
            .start();
    }

    /**
     * 回收籌碼
     * @param betID 注區ID
     */
    public recycleChip(betID: number) {
        //回收籌碼到莊家位置並清除
        getAudioManager().playSound(CGAudioName.ChipBack);
        for (let i = 0; i < 2; i++) {
            const betPos = this.chipDispatcher.children[i].children[betID];//押注區節點
            const savePos = betPos.getPosition();
            const bankWorldPos = this.chipDispatcher.getChildByName('BankerPos')!.getWorldPosition();
            const movePos = bankWorldPos.subtract(betPos.getWorldPosition()).add(savePos);
            tween(betPos).to(0.5, { position: movePos }, { easing: 'sineOut' })
                .call(() => {
                    while (betPos.children.length > 0) {
                        getPoolManager().put(betPos.children[0]);//退還所有子節點
                    }
                    betPos.setPosition(savePos);//回到原位置
                }).start();
        }
    }

    /**
     * 生成派獎籌碼到注區
     * @param betOdds 注區倍率(生成籌碼數量)
     * @controller
     */
    public async payChipToBetArea(betOdds: number[]): Promise<void> {
        return new Promise(resolve => {
            for (let i = 0; i < betOdds.length; i++) {
                if (betOdds[i] > 0) {
                    for (let user = 0; user < 2; user++) {
                        const betChipPos = this.chipDispatcher.children[user].children[i];//押注區籌碼父節點
                        if (betChipPos.children.length > 0) {
                            if (betOdds.filter(odds => odds > 0).length === 1)
                                getAudioManager().playSound(CGAudioName.ChipPayMany);
                            else
                                getAudioManager().playSound(CGAudioName.ChipPayLess);
                            const payChip = new Node();
                            //生成派獎籌碼(會根據倍率生成數量不同)
                            for (let j = 0; j < betOdds[i]; j++) {
                                betChipPos.children.forEach(child => {
                                    const poolBetChip = getPoolManager().get(user === 0 ? this.betChipBlack : this.betChipColor) as ChipNode;//生成新籌碼
                                    if (user === 1)
                                        poolBetChip.getComponent(UIOpacity)!.opacity = 255;
                                    const referChip = child as ChipNode;
                                    poolBetChip.parent = payChip;
                                    poolBetChip.ChipID = referChip.ChipID;
                                    poolBetChip.UserPosID = referChip.UserPosID;
                                    poolBetChip.getComponent(Sprite)!.spriteFrame = referChip.getComponent(Sprite)!.spriteFrame;
                                    if (j < betOdds[i] - 1) {
                                        poolBetChip.children[0].getComponent(Label)!.string = '';//低於第一個籌碼之後的籌碼不顯示數字
                                    } else {
                                        poolBetChip.children[0].getComponent(Label)!.string = referChip.children[0].getComponent(Label)!.string;
                                    }
                                    const chipPos = referChip.position;
                                    poolBetChip.setPosition(new Vec3(chipPos.x, chipPos.y + (j + 1) * (user === 0 ? 5 : 6), chipPos.z));//籌碼疊高
                                });
                            }
                            payChip.parent = betChipPos;
                            const bankWorldPos = this.chipDispatcher.getChildByName('BankerPos')!.getWorldPosition();
                            payChip.position = bankWorldPos.subtract(betChipPos.getWorldPosition());
                            payChip.setScale(Vec3.ZERO);
                            tween(payChip)
                                .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' })
                                .delay(0.5)
                                .call(() => {
                                    getAudioManager().playSound(CGAudioName.ChipDrop); // 播放聲音
                                })
                                .to(0.5, { position: Vec3.ZERO }, { easing: 'sineOut' })
                                .call(async () => {
                                    // 將所有子節點移到betChipPos
                                    while (payChip.children.length > 0) {
                                        payChip.children[0].parent = betChipPos;
                                    }
                                    payChip.destroy();
                                    this.chipScale(betChipPos);//籌碼縮放動態
                                    await CGUtils.Delay(0.5);
                                    //注區籌碼派彩給用戶
                                    if (!this.isValid) return;
                                    getAudioManager().playSound(CGAudioName.ChipBack);
                                    betChipPos.children.forEach(chip => {//判斷籌碼數量
                                        const startNode = this.userPos.children[(chip as ChipNode).UserPosID];
                                        const movePos = startNode.getWorldPosition().subtract(betChipPos.getWorldPosition());
                                        // Logger.debug("派發給玩家", (chip as ChipNode).UserPosID)
                                        tween(chip)
                                            .to(0.5, { position: movePos }, { easing: 'sineOut' })
                                            .call(() => getPoolManager().put(chip))
                                            .start();
                                    });
                                    await CGUtils.Delay(0.5);
                                    resolve();
                                }).start();
                        }
                    }
                }
            }
        });
    }

    /**
     * 更新寫入續押資料
     * @param betTotal 該用戶目前總押注額
     * @param userBetAreaCredits 該用戶各注區目前押注額
     * @controller
     * @returns 
     */
    public updateRebetData(betTotal: number, userBetAreaCredits: number[]) {
        if (betTotal <= 0) return;
        this._rebetData.betCredits = [...userBetAreaCredits];//更新籌碼資料
        this._rebetData.total = betTotal;
        this.rebetCreditLable.string = CGUtils.NumDigits(this._rebetData.total);
    }

    /**
     * 設置續押狀態
     * @param state 續押觸發狀態
     * @param credit 用戶餘額
     * @controller
     */
    public setRebet(state: RebetState, _credit?: number) {
        this._rebetData.state = state;
        this.updateRebetUI(state);
        switch (this._rebetData.state) {
            case RebetState.INIT://未續押狀態
                if (this._rebetData.total > 0)
                    this.setRebetInteractable(true);//續押狀態
                break;
            case RebetState.ONCE_BET://單次續押狀態
                getAudioManager().playOnceSound(CGAudioName.BtnOpen);
                return this._rebetData.betCredits;//返回押注資料
            case RebetState.AUTO_STOP://停止自動續押
                getAudioManager().playOnceSound(CGAudioName.BtnClose);
                break;
            case RebetState.AUTO_BET://自動續押狀態
                getAudioManager().playOnceSound(CGAudioName.BtnOpen);
        }
    }

    /**
     * 更新續押UI
     * @param state 續押狀態
     */
    private updateRebetUI(state: RebetState) {
        // 預設所有按鈕隱藏
        const buttonStates = {
            [RebetState.INIT]: { rebet: true, auto: false, autoStop: false },
            [RebetState.ONCE_BET]: { rebet: false, auto: true, autoStop: false },
            [RebetState.AUTO_BET]: { rebet: false, auto: false, autoStop: true },
            [RebetState.AUTO_STOP]: { rebet: false, auto: true, autoStop: false }
        };
        const { rebet, auto, autoStop } = buttonStates[state];
        let opacity = rebet ? 128 : 255;
        this.rebetCreditLable.node.parent!.getComponent(UIOpacity)!.opacity = opacity;//續押金額透明度
        this.btnRebet.active = rebet;
        this.btnAuto.active = auto;
        this.btnAutoStop.active = autoStop;
    }

    /**
     * 新局開始時，判斷是否執行續押
     * @returns 
     */
    public getRebetBetCredits() {
        if (this._rebetData.state === RebetState.AUTO_BET) {
            return this._rebetData.betCredits;
        } else {
            this.setRebet(RebetState.INIT);//初始化
            return null;
        }
    }
}