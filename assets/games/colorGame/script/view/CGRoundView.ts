import { getAudioManager } from '@common/manager/AudioManager';
import { urlHelper } from '@common/utils/UrlHelper';
import { _decorator, Component, Label, SpriteFrame, Sprite, Animation, UIOpacity, tween, Node, ParticleSystem } from 'cc';

import { ColorID } from '@/games/colorGame/script/enum/CGEnum';

import { CGAudioName } from '@/games/colorGame/script/manager/CGAudioName';
import { CGUtils } from '@/games/colorGame/script/tools/CGUtils';

const { ccclass, property } = _decorator;

@ccclass('CGRoundView')
export class CGRoundView extends Component {
    @property(Node)
    private gameUI!: Node;//遊戲全部介面

    @property(Node)
    private bgLight!: Node;//背景燈光

    @property(Node)
    private betInfo!: Node;//押注區資訊

    @property(Node)
    private result!: Node;//結算

    @property(Node)
    private stageTitle!: Node;//狀態標題

    @property(Node)
    private betWin!: Node;//押注勝利顯示區

    @property(Node)
    private betLight!: Node;//押注提示光區

    @property(Node)
    private countdown!: Node;//押注倒數時間

    @property(Node)
    private localWinFx!: Node;//本地用戶贏分特效

    @property(Node)
    private infoWin!: Node;//贏分資訊面板

    @property(Node)
    private infoTip!: Node;//提示訊息面板

    @property(Node)
    private bigWin!: Node;//大贏節點

    @property(Node)
    private winCredit!: Node;//本地贏分節點

    @property(Node)
    private coinWinParticle!: Node;//贏分金幣粒子

    @property([SpriteFrame])
    private winOddSF: SpriteFrame[] = [];//倍率貼圖

    @property([SpriteFrame])
    private resultColorSF: SpriteFrame[] = [];//結算顏色貼圖

    /**
     * 新局開始
     * @controller
     */
    public async newRound() {
        this.betWin.active = false;
        for (const child of this.betWin.children) {
            child.active = false;
        }
        this.result.active = false;
        this.infoTip.active = true;//顯示遊戲訊息跑馬燈
        this.infoWin.active = false;//隱藏贏分
        this.bgLight.getComponent(Animation)!.play('BgLightIdle');
        for (let child of this.betInfo.children) {
            child.getComponent(UIOpacity)!.opacity = 255;
        }
        this.betStart();
    }

    /**
     * 執行押注倒數
     * @param time 剩餘押注時間
     * @param betTotalTime 總押注時間
     * @controller
     * @returns 
     */
    public async setCountdown(countdown: number, betTotalTime: number) {
        let tempCountdown = countdown;
        let tempBetTotalTime = betTotalTime;
        tempCountdown -= 1;//gs最後一秒不能押注，所以秒數-1
        tempBetTotalTime -= 1;//gs最後一秒不能押注，所以秒數-1
        const countdownNode = this.countdown;
        const labelNode = countdownNode.getChildByName('Label')!;
        const comLabel = labelNode.getComponent(Label)!;
        comLabel.string = tempCountdown.toString();//顯示秒數
        countdownNode.active = true;
        if (tempCountdown <= 0) {
            getAudioManager().playSound(CGAudioName.TimeUp);
            countdownNode.getComponent(Animation)!.play('CountdownLast');
            await CGUtils.Delay(1.5);
            countdownNode.active = false;
        } else {
            if (tempCountdown <= 5) {
                getAudioManager().playSound(CGAudioName.Countdown);
                countdownNode.getComponent(Animation)!.play('CountdownRapid');
            }
            else {
                // getAudioManager().playAudio(AudioName.CountdownBefore);
                countdownNode.getComponent(Animation)!.play('CountdownNormal');
            }
            const frameSprite = countdownNode.getChildByName('Frame')!.getComponent(Sprite)!;
            frameSprite.fillRange = tempCountdown / tempBetTotalTime;
            tween(frameSprite).to(1, { fillRange: (tempCountdown - 1) / tempBetTotalTime }).start();//進度條倒數
        }
    }

    /**
     * 停止押注
     * @controller
     */
    public betStop() {
        this.stageTitle.children[1].getComponent(Animation)!.play();
        getAudioManager().playSound(CGAudioName.TitleStopBet);
    }

    /**
     * 開始押注
     * @controller
     */
    public betStart() {
        this.stageTitle.children[0].getComponent(Animation)!.play();
        getAudioManager().playSound(CGAudioName.TitleStartBet);
        this.betLight.active = true;//押注提示光
    }

    /**
     * 顯示結算彈窗
     * @param winDice 
     * @controller
     */
    public showResult(winDice: string) {
        this.bgLight.getComponent(Animation)!.play('BgLightOpen');//背景燈閃爍
        const colors = winDice.split('-');
        const winColor = colors.map(color => ColorID[color as keyof typeof ColorID]);
        //顯示結算彈窗
        this.result.active = true;
        getAudioManager().playSound(CGAudioName.Result);
        for (let i = 0; i < 3; i++) {
            this.result.getChildByName(`Dice${i}`)!.getComponent(Sprite)!.spriteFrame = this.resultColorSF[winColor[i]];
        }
        this.betWin.active = true;
        const winNum = new Set(winColor);//過濾重複數字
        for (let i of winNum) {
            this.betWin.children[i].active = true;
        }
    }

    /**
     * 回合結束
     * @param winDice //開獎顏色
     * @param localWinArea //本地勝利注區
     * @param betOdds //各注區賠率
     * @param payoff 本地用戶派彩
     * @controller
     */
    public async endRound(localWinArea: number[], betOdds: number[], winNum: Set<number>, payoff: number) {
        for (let i = 0; i < betOdds.length; i++) {
            if (betOdds[i] > 0) {
                if (localWinArea.indexOf(i) !== -1) {
                    const winFx = this.localWinFx.children[i];
                    winFx.active = true;

                    //判斷倍率貼圖顯示
                    const winOddSFID = (betOdds[i] > 2 && urlHelper.site === 'XC') ? 3 :
                        (betOdds[i] > 2) ? 2 : betOdds[i] - 1;

                    winFx.children[0].getComponent(Sprite)!.spriteFrame = this.winOddSF[winOddSFID];
                }
            } else
                this.betInfo.children[i].getComponent(UIOpacity)!.opacity = 100;
        }
        //本地用戶勝利設置
        if (payoff > 0) {
            //size===1代表開骰3顆骰子同一個id
            if (winNum.size === 1) {
                getAudioManager().playSound(CGAudioName.BigWin);
                this.gameUI.getComponent(Animation)!.play('GameShake');//畫面震動
                await this.runBigWin(payoff);//大獎顯示
            }
            getAudioManager().playSound(CGAudioName.BetWin);
            this.gameUI.getComponent(Animation)!.play('GameScale');//畫面震動
            const WinCreditLabel = this.infoWin.getChildByName('WinCredit')!.getChildByName('Label')!;
            WinCreditLabel.getComponent(Label)!.string = CGUtils.NumDigits2(payoff);
            this.infoTip.active = false;
            this.infoWin.active = true;
            // this.coinWinParticle.active = true;
            this.coinWinParticle.getComponent(ParticleSystem)!.play();
        }
    }

    /**
     * 顯示本地勝利派彩
     * @param payoff 派彩
     * @controller
     */
    public showAddCredit(payoff: number) {
        this.winCredit.getChildByName('Win')!.getComponent(Label)!.string = '+' + CGUtils.NumDigits2(payoff);
        this.winCredit.active = true;
    }

    /**
     * 運行大獎動畫並顯示獲勝金額
     * @param winCredit - 獲勝的金額
     * @returns 動畫完成後 resolve
     */
    private runBigWin(winCredit: number): Promise<void> {
        this.bigWin.active = true;
        return new Promise<void>(async resolve => {
            this.bigWin.getComponent(UIOpacity)!.opacity = 0;
            this.bigWin.getComponent(Animation)!.play('BigWinShow');
            this.bigWin.getChildByName('CoinWinParticle')!.getComponent(ParticleSystem)!.stop();
            this.bigWin.getChildByName('CoinWinParticle')!.getComponent(ParticleSystem)!.play();
            const label = this.bigWin.getChildByName('WinCredit')!.getChildByName('Label')!.getComponent(Label)!;
            label.string = '0';
            this.runCredit(1.7, winCredit, label);
            // this.chipRunAndDistroy(30, new Vec2(500, 300));//噴籌碼
            await CGUtils.Delay(1.6);
            this.bigWin.getComponent(Animation)!.play('BigWinHide');
            await CGUtils.Delay(0.5);
            this.scheduleOnce(() => {
                this.bigWin.active = false;
                this.bigWin.getChildByName('CoinWinParticle')!.getComponent(ParticleSystem)!.clear();
            }, 0.2);
            resolve();
        });
    }

    /**
     * 跑分
     * @param runTime 跑分時間
     * @param endCredit 最終分數
     * @param label 分數節點(Label)
     */
    private runCredit(runTime: number, endCredit: number, label: Label) {
        const runCredit = { Credit: Number(label.string.replace(/,/gi, '')) };//設置起始分
        tween(runCredit).to(runTime, { Credit: endCredit }, {
            onUpdate: () => {
                label.string = CGUtils.RunNumDigits2(runCredit.Credit);
            }
        }).call(() => {
            label.string = CGUtils.NumDigits2(endCredit);
        }).start();
    }
}