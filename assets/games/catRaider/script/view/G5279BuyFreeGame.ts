import { _decorator, Animation, Button, Component, Label, Node, sp, Toggle } from 'cc';
import { getEventManager } from '@common/manager/EventManager';
import { watch } from '@common/utils/Reactivity';

import { getG5279Model } from '../model/G5279Model';
import { getAudioManager } from '@common/manager/AudioManager';
import { G5279AudioName } from '../data/G5279AudioEnum';
import { addButtonClickEvent, addToggleClickEvent, playAnimFinish, playSpineFinish } from '../tools/G5279Tools';
import { Logger } from '@common/utils/Logger';
import { G5279BetState } from '../data/G5279Enum';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { Comm, Game } from '@common/h5GameTools/GTCommEvents';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { NumberUtils } from '@common/utils/NumberUtils';

const { ccclass, property } = _decorator;

@ccclass('G5279BuyFreeGame')
export class G5279BuyFreeGame extends Component {
    @property(Node)
    private buyFreeGameNode: Node = null!;
    @property(Button)
    private buyFreeBtn: Button = null!;

    private _buyFreeRate: number = 0;
    private _totalBuyAmountLabel: Label = null!;
    private _betLabel: Label = null!;
    private _btnCancel: Button = null!;
    private _btnConfirm: Button = null!;
    private _btnPlus: Button = null!;
    private _btnMinus: Button = null!;
    private _blockInputEvent: Node = null!;
    private _toggleBuyFree1: Toggle = null!;
    private _toggleBuyFree2: Toggle = null!;

    protected onLoad() {
        this._totalBuyAmountLabel = this.buyFreeGameNode.getChildByName('totalBuyAmount')!.getComponent(Label)!;
        this._betLabel = this.buyFreeGameNode.getChildByName('bet')!.getComponent(Label)!;
        this._btnCancel = this.buyFreeGameNode.getChildByName('btnCancel')!.getComponent(Button)!;
        this._btnConfirm = this.buyFreeGameNode.getChildByName('btnConfirm')!.getComponent(Button)!;
        this._btnPlus = this.buyFreeGameNode.getChildByName('btnPlus')!.getComponent(Button)!;
        this._btnMinus = this.buyFreeGameNode.getChildByName('btnMinus')!.getComponent(Button)!;
        this._blockInputEvent = this.buyFreeGameNode.getChildByName('blockInputEvent')!;
        this._toggleBuyFree1 = this.buyFreeGameNode.getChildByName('selectBuyToggle')!.getChildByName('toggleBuyFree1')!.getComponent(Toggle)!;
        this._toggleBuyFree2 = this.buyFreeGameNode.getChildByName('selectBuyToggle')!.getChildByName('toggleBuyFree2')!.getComponent(Toggle)!;
    }

    start() {
        const scriptName = 'G5279BuyFreeGame';
        addButtonClickEvent(this.node, scriptName, this.buyFreeBtn, 'openBuyFreeGameUI');
        addButtonClickEvent(this.node, scriptName, this._btnCancel, 'cancelBuyFreeGame');
        addButtonClickEvent(this.node, scriptName, this._btnConfirm, 'clickConfirm');
        addButtonClickEvent(this.node, scriptName, this._btnPlus, 'clickBetChange', 'plus');
        addButtonClickEvent(this.node, scriptName, this._btnMinus, 'clickBetChange', 'minus');

        addToggleClickEvent(this.node, scriptName, this._toggleBuyFree1, 'clickBuyFree', '0');
        addToggleClickEvent(this.node, scriptName, this._toggleBuyFree2, 'clickBuyFree', '1');

        this._toggleBuyFree1.isChecked = true;//初始預設為購買freeGame1

        watch(
            () => commonStore.storeState.betCreditList.indexOf(commonStore.storeState.bet),
            _newIndex => {
                this.updateButtonStatus();
            }
        );
        //設置節點顯示在公版最上層
        getEventManager().emit(Comm.GET_TOPGAMENODE, {
            callback: (topNode:Node) => {
                topNode.addChild(this.buyFreeGameNode);
            }
        });
    }

    /**
     * 隱藏購買免費遊戲按鈕
     */
    public hideFreeBtn() {
        this.buyFreeBtn.node.active = false;
    }

    /**
     * 顯示購買免費遊戲按鈕
     */
    public showFreeBtn() {
        this.buyFreeBtn.node.active = true;
        this.enableFreeBtn();
    }

    /**
     * 禁用購買免費遊戲按鈕
     */
    public disableFreeBtn() {
        this.buyFreeBtn.interactable = false;
    }

    /**
     * 顯示購買免費遊戲按鈕
     */
    private enableFreeBtn() {
        this.buyFreeBtn.interactable = true;
    }

    /**
     * 點擊加減押注按鈕
     * @param event 事件
     * @param eventData 事件資料
     */
    private clickBetChange(event: Event, eventData: string): void {
        const bet = commonStore.storeState.bet;
        const betList = commonStore.storeState.betCreditList;
        const betIndex = betList.indexOf(bet);//當前選項
        const maxIndex = betList.length - 1;//最大選項
        const newBet = betList[betIndex + (eventData === 'plus' ? 1 : -1)];
        const newBetIndex = betList.indexOf(newBet);
        commonStore.storeMutation.setData('bet', newBet);
        commonStore.storeMutation.setData('totalBet', newBet);
        getAudioManager().playSound(G5279AudioName.btnClick);

        if (eventData === 'plus') {
            //如果是最後一筆list
            if (newBetIndex === maxIndex) {
                this._btnPlus.interactable = false;
                return;
            }
            this._btnMinus.interactable = true;
        } else {
            //如果是第一筆list
            if (newBetIndex === 0) {
                this._btnMinus.interactable = false;
                // return;
            }
            this._btnPlus.interactable = true;
        }
    }

    /**
     * 點擊購買免費遊戲按鈕
     * @param event 事件
     * @param eventData 事件資料
     */
    private clickBuyFree(event: Event, eventData: string): void {
        getAudioManager().playSound(G5279AudioName.btnClick);
        //更新押注倍率
        this._buyFreeRate = getG5279Model().getBuyFreeRate(parseInt(eventData));
        this.updateButtonStatus();
    }

    /**
     * 按下確認按鈕的邏輯
     */
    private clickConfirm() {
        getAudioManager().playSound(G5279AudioName.btnSpin);
        //更新下注狀態
        const betState = this._toggleBuyFree1.isChecked ? G5279BetState.BUY_BONUS_GAME : G5279BetState.BUY_FEATURE_L3;
        getEventManager().emit('updateBetState', betState);
        // 關閉購買視窗
        this.closeBuyFreeGameUI();

        //傳送購買免費遊戲下注資料給公版
        getEventManager().emit(Game.PRE_BUY_FREEGAME_SPIN, {
            gameRate: this._buyFreeRate,//免費遊戲押注倍率
            callback: () => {
                Logger.log('購買免費遊戲下注資料傳送完成');
            }
        });
    }

    /**
     * 開啟購買 FreeGame 視窗
     */
    private async openBuyFreeGameUI() {
        getAudioManager().playSound(G5279AudioName.getBuyFree);
        this._blockInputEvent.active = false;//取消按鈕禁用
        this.buyFreeGameNode.getComponent(Animation)!.play('buyFreePopShow');
        this.disableFreeBtn();// 按鈕變成disable

        //GTM 事件，紀錄點擊免費遊戲購買介面
        gtmEvent.CORE_GAME_BUY_FREEGAME_CLICK();

        // 根據上次選擇狀態更新押注倍率
        this._buyFreeRate = getG5279Model().getBuyFreeRate(this._toggleBuyFree1.isChecked ? 0 : 1);
        this.updateButtonStatus();

        this.buyFreeGameNode.active = true;
        const spine = this.buyFreeGameNode.getChildByName('spine')!.getComponent(sp.Skeleton)!;
        await playSpineFinish(spine, 'show');
        spine.setAnimation(0, 'loop', true);
    }

    /**
     * 取消購買免費遊戲
     */
    private cancelBuyFreeGame() {
        this.enableFreeBtn();
        this.closeBuyFreeGameUI();
    }

    /**
     * 關閉購買 FreeGame 視窗
     */
    private async closeBuyFreeGameUI() {
        this._blockInputEvent.active = true;//恢復按鈕禁用
        getAudioManager().playSound(G5279AudioName.btnClick);
        // GTM 事件，關閉免費遊戲購買介面
        gtmEvent.CORE_GAME_BUY_FREEGAME_CLICK(false);

        const animation = this.buyFreeGameNode.getComponent(Animation)!;
        await playAnimFinish(animation, 'buyFreePopHide');
        this.buyFreeGameNode.active = false;
    }

    /**
     * 更新按鈕狀態
     */
    private updateButtonStatus() {
        // 更新注額
        const bet = commonStore.storeState.bet;
        this._betLabel.string = bet.toString();

        // const betOdds = getG5279Model().getBetOdds();//獲得免費遊戲下注倍率
        const totalBuyAmount = NumberUtils.accMul(bet, this._buyFreeRate);//下注總額
        this._totalBuyAmountLabel.string = totalBuyAmount.toString();
    }
}