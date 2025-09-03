import { commonStore } from '@common/h5GameTools/CommonStore';
// import { Comm } from '@common/h5GameTools/GTCommEvents';
import { getAudioManager } from '@common/manager/AudioManager';
import { getEventManager } from '@common/manager/EventManager';
import { NumberUtils } from '@common/utils/NumberUtils';
import { awaitSleep } from '@common/utils/tools';
import { _decorator, Component, Node, Animation, ParticleSystem, UIOpacity, Label, tween, Vec3, Tween, sp } from 'cc';


import { G5279AudioName } from '@/games/catRaider/script/data/G5279AudioEnum';
import { G5279Config } from '@/games/catRaider/script/data/G5279Config';
import { G5279Event } from '@/games/catRaider/script/data/G5279Event';

import { formatNumberRound2, playSpineFinish } from '@/games/catRaider/script/tools/G5279Tools';


const { ccclass, property } = _decorator;

@ccclass('G5279BigWin')
export class G5279BigWin extends Component {
    //子節點
    @property(Node)
    private bigWin: Node = null!;

    private bigWinScore: Node = null!;
    private finishFx: Node = null!;
    private spine: sp.Skeleton = null!;

    private coinParticle: ParticleSystem = null!;
    private gemRedParticle: ParticleSystem = null!;
    private gemYellowParticle: ParticleSystem = null!;
    private gemGreenParticle: ParticleSystem = null!;
    private gemBlueParticle: ParticleSystem = null!;
    private coinParticle2: ParticleSystem = null!;
    private starParticleS: ParticleSystem = null!;
    private starParticleB: ParticleSystem = null!;
    private lineParticle: ParticleSystem = null!;
    private finishCoinParticle: ParticleSystem = null!;

    //變數
    private _runScore: { Score: number } = { Score: 0 };

    private _bigWinBool: boolean[] = [false, false, false, false, false];
    private _bigWinScore: number[] = [0, 0, 0, 0, 0];
    private _animName: string[] = ['bigwin', 'megawin', 'superwin', 'epicwin', 'catwin'];
    private runingID: number = 0;//正在跑的動畫ID

    private _payTotal: number = 0;//總贏分
    private _soundName: string = '';//音效名稱

    private _bigWinFinishCallback: () => void = null!;//bigWin結束回傳callback

    onLoad() {
        // getEventManager().emit(Comm.GET_SETTINGTOBOTTOMNODE, {
        //     callback: (getNode:Node) => {
        //         this.bigWin.parent = getNode;//設置在bottomNode層之下
        //     }
        // });
    }

    onEnable() {
        //配置節點
        this.coinParticle = this.bigWin.getChildByName('coinParticle')!.getComponent(ParticleSystem)!;
        this.gemRedParticle = this.bigWin.getChildByName('gemRedParticle')!.getComponent(ParticleSystem)!;
        this.gemYellowParticle = this.bigWin.getChildByName('gemYellowParticle')!.getComponent(ParticleSystem)!;
        this.gemGreenParticle = this.bigWin.getChildByName('gemGreenParticle')!.getComponent(ParticleSystem)!;
        this.gemBlueParticle = this.bigWin.getChildByName('gemBlueParticle')!.getComponent(ParticleSystem)!;
        this.coinParticle2 = this.bigWin.getChildByName('coinParticle2')!.getComponent(ParticleSystem)!;
        this.starParticleS = this.bigWin.getChildByName('starParticleS')!.getComponent(ParticleSystem)!;
        this.starParticleB = this.bigWin.getChildByName('starParticleB')!.getComponent(ParticleSystem)!;
        this.lineParticle = this.bigWin.getChildByName('lineParticle')!.getComponent(ParticleSystem)!;
        this.finishCoinParticle = this.bigWin.getChildByName('finishCoinParticle')!.getComponent(ParticleSystem)!;
        this.bigWinScore = this.bigWin.getChildByName('bigWinScore')!;
        this.finishFx = this.bigWin.getChildByName('finishFx')!;
        this.spine = this.bigWin.getChildByName('spine')!.getComponent(sp.Skeleton)!;
    }

    /**
     * 執行跑分
     * @param collectPayTotal 收集贏分
     */
    public runBigWin(collectPayTotal: number): Promise<void> {
        return new Promise<void>(async resolve => {
            const bet = commonStore.storeState.bet;//當前下注額度
            //如果贏分小於最小大獎贏分，則直接返回
            const bigWinScore = NumberUtils.accMul(bet, G5279Config.bigWinRange[0]);
            if (collectPayTotal < bigWinScore) {
                resolve();
                return;
            }
            getAudioManager().lowerMusic();//背景音變小
            this._bigWinFinishCallback = resolve;
            for (let i = 0; i < this._bigWinScore.length; i++) {
                this._bigWinScore[i] = NumberUtils.accMul(bet, G5279Config.bigWinRange[i]);
                this._bigWinBool[i] = false;
            }
            this._payTotal = NumberUtils.accAdd(collectPayTotal, 0);//電子數字格式化

            const bigWinUIOpacity = this.bigWin.getComponent(UIOpacity)!;
            bigWinUIOpacity.opacity = 0;
            this.bigWin.active = true;
            tween(bigWinUIOpacity).to(0.1, { opacity: 255 }).start();
            this.playSpineAnim(0);
            this.coinParticle.rateOverTime.constant = 40;
            this.coinParticle.play();
            this.starParticleS.play();
            this.gemBlueParticle.play();

            if (this._payTotal >= this._bigWinScore[4]) {
                this._soundName = G5279AudioName.catWin;
            } else if (this._payTotal >= this._bigWinScore[3]) {
                this._soundName = G5279AudioName.epicWin;
            } else if (this._payTotal >= this._bigWinScore[2]) {
                this._soundName = G5279AudioName.superWin;
            } else if (this._payTotal >= this._bigWinScore[1]) {
                this._soundName = G5279AudioName.megaWin;
            } else {
                this._soundName = G5279AudioName.bigWin;
            }
            getAudioManager().playSound(this._soundName);//播放大獎背景音
            this.bigWinScore.getComponent(Animation)!.play('bigWinScoreShow');//顯示分數
            //開始跑分
            this._runScore.Score = 0;//起跑分
            getAudioManager().playSound(G5279AudioName.winCount, true);
            getAudioManager().playSound(G5279AudioName.coinLoop, true);
            this.bigWin.on(Node.EventType.TOUCH_END, this.touchFinish, this);//註冊點擊事件

            const winLevels = [
                { score: this._bigWinScore[1], changeAnim: () => this.changeMegaWinAnim() },
                { score: this._bigWinScore[2], changeAnim: () => this.changeSuperWinAnim() },
                { score: this._bigWinScore[3], changeAnim: () => this.changeEpicWinAnim() },
                { score: this._bigWinScore[4], changeAnim: () => this.changeCatWinAnim() }
            ];

            if (this._payTotal >= this._bigWinScore[4]) {
                for (let i = 0; i < 4; i++) {
                    await this.runScore(winLevels[i].score);
                    winLevels[i].changeAnim();
                }
            } else if (this._payTotal >= this._bigWinScore[3]) {
                for (let i = 0; i < 3; i++) {
                    await this.runScore(winLevels[i].score);
                    winLevels[i].changeAnim();
                }
            } else if (this._payTotal >= this._bigWinScore[2]) {
                for (let i = 0; i < 2; i++) {
                    await this.runScore(winLevels[i].score);
                    winLevels[i].changeAnim();
                }
            } else if (this._payTotal >= this._bigWinScore[1]) {
                await this.runScore(winLevels[0].score);
                winLevels[0].changeAnim();
            }
            await this.runScore(this._payTotal);//分數跑到結尾
            await this.bigWinFinish();
            resolve();
        });
    }

    /**
     * 執行跑分
     * @param endScore 結束分數
     */
    private runScore(endScore: number): Promise<void> {
        return new Promise<void>(async resolve => {
            const scoreLabel = this.bigWinScore.getChildByName('label')!.getComponent(Label)!;
            let tweenInstance: Tween<any>;

            tweenInstance = tween(this._runScore).to(3, { Score: endScore }, {
                onUpdate: () => {
                    scoreLabel.string = formatNumberRound2(this._runScore.Score);
                    if (this._runScore.Score >= this._payTotal - 0.01) {
                        tweenInstance.stop();
                        resolve();
                    }
                }
            }).call(() => {
                resolve();
            }).start();
        });
    }

    /**
     * 跑分動畫
     * @param id 動畫ID
     */
    private async playSpineAnim(id: number) {
        if (id > 0)
            getAudioManager().playSound(G5279AudioName.winImpact);//播放大獎切換音效
        this.delayShake();
        this.runingID = id;//紀錄正在跑的動畫ID
        this._bigWinBool[id] = true;//記錄播放過動畫
        const name = this._animName[id];
        await playSpineFinish(this.spine, `${name}_in`);
        if (this.runingID === id) {
            this.spine.setAnimation(0, `${name}_loop`, true);
        }
    }

    /**
     * 延遲震動(搭配bigWin出現動畫)
     */
    private async delayShake() {
        await awaitSleep(100);
        getEventManager().emit(G5279Event.shake);
    }

    /**
     * 立即跑分完成
     */
    private async touchFinish() {
        await this.bigWinFinish();
        this._bigWinFinishCallback();//回傳bigWin結束callback
    }

    /**
     * 贏分表演結束
     */
    private async bigWinFinish(): Promise<void> {
        return new Promise<void>(async resolve => {
            getAudioManager().stopSound(G5279AudioName.winCount);//停止跑分音效
            this.bigWin.off(Node.EventType.TOUCH_END, this.touchFinish, this);
            Tween.stopAllByTarget(this._runScore);
            if (this._payTotal >= this._bigWinScore[4] && !this._bigWinBool[4]) {
                this.changeCatWinAnim();
            } else if (this._payTotal >= this._bigWinScore[3] && !this._bigWinBool[3]) {
                this.changeEpicWinAnim();
            } else if (this._payTotal >= this._bigWinScore[2] && !this._bigWinBool[2]) {
                this.changeSuperWinAnim();
            } else if (this._payTotal >= this._bigWinScore[1] && !this._bigWinBool[1]) {
                this.changeMegaWinAnim();
            }
            this.bigWin.scale = new Vec3(1, 1, 1);
            tween(this.bigWin)
                .to(0.08, { scale: new Vec3(1.08, 1.08, 1) })
                .to(0.2, { scale: new Vec3(1, 1, 1) })
                .start();
            this.bigWinScore.getComponent(Animation)!.play('bigWinScoreFinish');
            this.finishCoinParticle.play();

            const scoreLabel = this.bigWinScore.getChildByName('label')!.getComponent(Label)!;
            scoreLabel.string = formatNumberRound2(this._payTotal);

            getAudioManager().stopSound(this._soundName);//停止大獎背景音
            getAudioManager().playSound(G5279AudioName.winStop);//分數完成
            getAudioManager().playSound(G5279AudioName.mew01);//分數完成
            this.finishFx.active = true;
            this.finishFx.getComponent(Animation)!.play();
            // this.scoreFinishFx.active = true;
            await awaitSleep(1000);//分數停留1秒
            getAudioManager().stopSound(G5279AudioName.coinLoop);//停止金幣loop音效
            this.coinParticle.stopEmitting();
            this.gemBlueParticle.stopEmitting();
            this.gemGreenParticle.stopEmitting();
            this.gemRedParticle.stopEmitting();
            this.gemYellowParticle.stopEmitting();
            this.coinParticle2.stopEmitting();
            this.starParticleS.stopEmitting();
            this.starParticleB.stopEmitting();
            this.lineParticle.stopEmitting();
            this.finishCoinParticle.stopEmitting();
            await awaitSleep(500);
            const bigWinUIOpacity = this.bigWin.getComponent(UIOpacity)!;
            tween(bigWinUIOpacity).to(0.3, { opacity: 0 })
                .call(() => {
                    this.bigWin.active = false;
                    getAudioManager().restoreMusic();//恢復背景音
                    resolve();
                }).start();
        });
    }

    /**
     * 變更mega贏分動畫
     */
    private changeMegaWinAnim() {
        this.playSpineAnim(1);
        this.gemGreenParticle.play();
        this.coinParticle.rateOverTime.constant = 50;
    }

    /**
     * 變更super贏分動畫
     */
    private changeSuperWinAnim() {
        this.playSpineAnim(2);
        !this.gemGreenParticle.isPlaying && this.gemGreenParticle.play();
        this.gemYellowParticle.play();
        this.starParticleB.play();
        this.coinParticle.rateOverTime.constant = 60;
    }

    /**
     * 變更epic贏分動畫
     */
    private changeEpicWinAnim() {
        this.playSpineAnim(3);
        !this.gemGreenParticle.isPlaying && this.gemGreenParticle.play();
        !this.gemYellowParticle.isPlaying && this.gemYellowParticle.play();
        !this.starParticleB.isPlaying && this.starParticleB.play();
        this.gemRedParticle.play();
        this.coinParticle.rateOverTime.constant = 70;
    }

    /**
     * 變更cat贏分動畫
     */
    private changeCatWinAnim() {
        this.playSpineAnim(4);
        !this.gemGreenParticle.isPlaying && this.gemGreenParticle.play();
        !this.gemYellowParticle.isPlaying && this.gemYellowParticle.play();
        !this.starParticleB.isPlaying && this.starParticleB.play();
        !this.gemRedParticle.isPlaying && this.gemRedParticle.play();
        this.coinParticle2.play();
        this.lineParticle.play();
        this.coinParticle.rateOverTime.constant = 80;
    }
}