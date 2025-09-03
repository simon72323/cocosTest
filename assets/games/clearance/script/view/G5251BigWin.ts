import { Comm } from '@common/h5GameTools/GTCommEvents';
import { getAudioManager } from '@common/manager/AudioManager';
import { getEventManager } from '@common/manager/EventManager';
import { _decorator, Component, Node, Animation, ParticleSystem, UIOpacity, Label, tween, Vec3, Tween } from 'cc';



import { G5251Utils } from '@/games/clearance/script/tools/G5251Utils';
import { G5251AudioName } from '@/games/clearance/script/types/G5251AudioEnum';
import { REEL_DATA } from '@/games/clearance/script/types/G5251ReelData';


const { ccclass, property } = _decorator;

@ccclass('G5251BigWin')
export class G5251BigWin extends Component {
    //子節點
    @property(Node)
    private scoreLabel: Node = null!;

    @property(Node)
    private finishFx: Node = null!;

    @property(Node)
    private scoreFinishFx: Node = null!;

    @property(Node)
    private particleCoin3D: Node = null!;

    @property(Node)
    private particleLine3D: Node = null!;

    @property(Node)
    private particleStarA3D: Node = null!;

    @property(Node)
    private particleStarB3D: Node = null!;

    //變數
    private _runScore: { Score: number } = { Score: 0 };
    private _megaBool = false;
    private _superBool = false;
    private _payTotal: number = 0;//總贏分
    private _megaWinScore: number = 0;//mega贏分
    private _superWinScore: number = 0;//super贏分
    private _soundName: string = '';//音效名稱

    private _resolveCallback: () => void = null!;//回傳callback

    onLoad() {
        getEventManager().emit(Comm.GET_SETTINGTOBOTTOMNODE, {
            callback: (getNode: Node) => {
                this.node.parent = getNode;//設置在bottomNode層之下
            }
        });
    }

    /**
     * 執行跑分
     * @param bet 投注分數
     * @param payTotal 總贏分
     */
    public runBigWin(bet: number, payTotal: number): Promise<void> {
        return new Promise<void>(async resolve => {
            this._resolveCallback = resolve;
            this._megaWinScore = G5251Utils.accMul(bet, REEL_DATA.bigWinRange[1]);
            this._superWinScore = G5251Utils.accMul(bet, REEL_DATA.bigWinRange[2]);
            this._payTotal = G5251Utils.accAdd(payTotal, 0);//電子數字格式化
            this._megaBool = false;
            this._superBool = false;
            this.node.getComponent(UIOpacity)!.opacity = 0;
            this.node.active = true;
            this.node.getComponent(Animation)!.play('winBig');
            this.particleCoin3D.getComponent(ParticleSystem)!.play();
            this.particleStarA3D.getComponent(ParticleSystem)!.play();
            let runScoreTime = 0;//跑分時間
            if (this._payTotal > this._superWinScore) {
                this._soundName = G5251AudioName.WinSuper;
                runScoreTime = 9;
            } else if (this._payTotal > this._megaWinScore) {
                this._soundName = G5251AudioName.WinMega;
                runScoreTime = 6;
            } else {
                this._soundName = G5251AudioName.WinBig;
                runScoreTime = 3;
            }
            getAudioManager().playSound(this._soundName);//播放大獎背景音
            this.scoreLabel.scale = new Vec3(0.2, 0.2, 1);
            tween(this.scoreLabel)
                .to(0.2, { scale: new Vec3(1.1, 1.1, 1) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .to(runScoreTime - 0.3, { scale: new Vec3(1.1, 1.1, 1) })
                .start();
            //開始跑分
            this._runScore.Score = 0;//起跑分
            getAudioManager().playSound(G5251AudioName.WinCount, true);
            this.node.on(Node.EventType.TOUCH_END, this.touchFinish, this);//註冊點擊事件
            const scoreLabel = this.scoreLabel.getComponent(Label)!;
            tween(this._runScore).to(runScoreTime, { Score: this._payTotal }, {
                onUpdate: () => {
                    if (this._runScore.Score >= this._megaWinScore && !this._megaBool) {
                        getAudioManager().playSound(G5251AudioName.WinImpact);//播放大獎切換音效
                        this.changeMegaWinAnim();
                    }
                    if (this._runScore.Score >= this._superWinScore && !this._superBool) {
                        getAudioManager().playSound(G5251AudioName.WinImpact);//播放大獎切換音效
                        this.changeSuperWinAnim();
                    }
                    scoreLabel.string = G5251Utils.NumDigits2(this._runScore.Score);
                }
            }).call(async () => {
                await this.bigWinFinish();
                resolve();
            }).start();
        });
    }

    /**
     * 立即跑分完成
     */
    private async touchFinish() {
        await this.bigWinFinish();
        this._resolveCallback();//回傳bigWin結束callback
    }

    /**
     * 贏分表演結束
     */
    private async bigWinFinish(): Promise<void> {
        return new Promise<void>(async resolve => {
            getAudioManager().stopSound(G5251AudioName.WinCount);//停止跑分音效
            this.node.off(Node.EventType.TOUCH_END, this.touchFinish, this);
            Tween.stopAllByTarget(this._runScore);
            Tween.stopAllByTarget(this.scoreLabel);
            if (this._payTotal >= this._superWinScore && !this._superBool) {
                this.changeSuperWinAnim();
            } else if (this._payTotal >= this._megaWinScore && !this._megaBool) {
                this.changeMegaWinAnim();
            }
            this.node.scale = new Vec3(1, 1, 1);
            tween(this.node)
                .to(0.08, { scale: new Vec3(1.08, 1.08, 1) })
                .to(0.2, { scale: new Vec3(1, 1, 1) })
                .start();
            tween(this.scoreLabel)
                .to(0.08, { scale: new Vec3(1.3, 1.3, 1) })
                .to(0.2, { scale: new Vec3(1, 1, 1) })
                .start();
            this.scoreLabel.getComponent(Label)!.string = G5251Utils.NumDigits2(this._payTotal);

            getAudioManager().stopSound(this._soundName);//停止大獎背景音
            getAudioManager().playSound(G5251AudioName.WinStop);//分數完成
            this.finishFx.active = true;
            this.scoreFinishFx.active = true;
            await G5251Utils.Delay(1);//分數停留1秒
            this.particleCoin3D.getComponent(ParticleSystem)!.stopEmitting();
            this.particleLine3D.getComponent(ParticleSystem)!.stopEmitting();
            this.particleStarA3D.getComponent(ParticleSystem)!.stopEmitting();
            this.particleStarB3D.getComponent(ParticleSystem)!.stopEmitting();
            await G5251Utils.Delay(0.5);
            tween(this.node.getComponent(UIOpacity)!).to(0.3, { opacity: 0 })
                .call(() => {
                    this.node.active = false;
                    resolve();
                }).start();
        });
    }

    /**
     * 變更mega贏分動畫
     */
    changeMegaWinAnim() {
        this._megaBool = true;//記錄播放過動畫
        this.node.getComponent(Animation)!.play('winMega');
        this.particleStarB3D.getComponent(ParticleSystem)!.play();
    }

    /**
     * 變更super贏分動畫
     */
    changeSuperWinAnim() {
        this._superBool = true;//記錄播放過動畫
        this.node.getComponent(Animation)!.play('winSuper');
        this.particleLine3D.getComponent(ParticleSystem)!.play();
    }
}