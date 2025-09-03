import { Comm } from '@common/h5GameTools/GTCommEvents';
import { getAudioManager } from '@common/manager/AudioManager';
import { getEventManager } from '@common/manager/EventManager';
import { _decorator, Component, Node, Animation, ParticleSystem, UIOpacity, Label, tween, Vec3, Tween } from 'cc';

import { G5251Utils } from '@/games/clearance/script/tools/G5251Utils';
import { G5251AudioName } from '@/games/clearance/script/types/G5251AudioEnum';


const { ccclass, property } = _decorator;

@ccclass('G5251TotalWin')
export class G5251TotalWin extends Component {
    private readonly RUN_SCORE_TIME: number = 2;//跑分時間

    //子節點
    @property(Node)
    private finishFx: Node = null!;

    @property(Node)
    private scoreFinishFx: Node = null!;

    @property(Node)
    private scoreLabel: Node = null!;

    @property(Node)
    private particleCoin3D: Node = null!;

    @property(Node)
    private particleStarB3D: Node = null!;

    //變數
    private _runScore: { Score: number } = { Score: 0 };
    private _payTotal: number = 0;//總贏分

    private resolveCallback: () => void = null!;//回傳callback

    onLoad() {
        getEventManager().emit(Comm.GET_SETTINGTOBOTTOMNODE, {
            callback: (getNode: Node) => {
                this.node.parent = getNode;//設置在bottomNode層之下
            }
        });
    }

    /**
     * 執行跑分
     * @param payTotal 總贏分
     */
    public runTotalWin(payTotal: number): Promise<void> {
        return new Promise<void>(async resolve => {
            this.resolveCallback = resolve;
            this._payTotal = G5251Utils.accAdd(payTotal, 0);//電子數字格式化
            this.node.getComponent(UIOpacity)!.opacity = 0;
            this.node.active = true;
            this.node.getComponent(Animation)!.play();
            this.particleCoin3D.getComponent(ParticleSystem)!.play();
            this.particleStarB3D.getComponent(ParticleSystem)!.play();
            this.node.on(Node.EventType.TOUCH_END, this.touchFinish, this);
            this.scoreLabel.scale = new Vec3(0.2, 0.2, 1);
            tween(this.scoreLabel)
                .to(0.2, { scale: new Vec3(1.1, 1.1, 1) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .start();
            getAudioManager().playSound(G5251AudioName.WinTotal);//播放背景音
            //開始跑分
            this._runScore.Score = 0;//起跑分
            getAudioManager().playSound(G5251AudioName.WinCount, true);//播放跑分音效
            const scoreLabel = this.scoreLabel.getComponent(Label)!;
            tween(this._runScore).to(this.RUN_SCORE_TIME, { Score: this._payTotal }, {
                onUpdate: () => {
                    scoreLabel.string = G5251Utils.NumDigits2(this._runScore.Score);
                }
            }).call(async () => {
                await this.totalWinFinish();
                resolve();
            }).start();
        });
    }

    /**
     * 立即跑分完成
     */
    private async touchFinish() {
        await this.totalWinFinish();
        this.resolveCallback();//回傳totalWin結束callback
    }

    /**
     * 贏分表演結束
     */
    private async totalWinFinish(): Promise<void> {
        return new Promise<void>(async resolve => {
            getAudioManager().stopSound(G5251AudioName.WinCount);//停止跑分音效
            this.node.off(Node.EventType.TOUCH_END, this.touchFinish, this);
            Tween.stopAllByTarget(this._runScore);
            this.node.scale = new Vec3(1, 1, 1);
            tween(this.node)
                .to(0.1, { scale: new Vec3(1.1, 1.1, 1) })
                .to(0.2, { scale: new Vec3(1, 1, 1) })
                .start();
            tween(this.scoreLabel)
                .to(0.1, { scale: new Vec3(1.3, 1.3, 1) })
                .to(0.2, { scale: new Vec3(1, 1, 1) })
                .start();
            this.scoreLabel.getComponent(Label)!.string = G5251Utils.NumDigits2(this._payTotal);
            this.scheduleOnce(() => {
                getAudioManager().playSound(G5251AudioName.WinStop);//分數完成
            }, 0.1);
            this.finishFx.active = true;
            this.scoreFinishFx.active = true;
            getAudioManager().stopSound(G5251AudioName.WinTotal);//停止背景音
            await G5251Utils.Delay(1);
            this.particleCoin3D.getComponent(ParticleSystem)!.stopEmitting();
            this.particleStarB3D.getComponent(ParticleSystem)!.stopEmitting();
            await G5251Utils.Delay(0.5);
            tween(this.node.getComponent(UIOpacity)!).to(0.3, { opacity: 0 })
                .call(() => {
                    this.node.active = false;
                    resolve();
                }).start();
        });
    }
}