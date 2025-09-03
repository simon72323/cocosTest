import { _decorator, Component, tween, ParticleSystem, Animation, Label, Node, Vec3 } from 'cc';

import { G5251Utils } from '@/games/clearance/script/tools/G5251Utils';

const { ccclass, property } = _decorator;

@ccclass('G5251ScoreBar')
export class G5251ScoreBar extends Component {
    @property(Node)
    private scoreWin: Node = null!;//贏得分數介面

    @property(Node)
    private infoTip: Node = null!;//tip節點

    @property(Node)
    private winTxNode: Node = null!;//贏得分數

    @property(Node)
    private totalTxNode: Node = null!;//總贏得分數

    @property(Node)
    private particleStar3D: Node = null!;//特效粒子

    @property(Label)
    private scoreWinLabel: Label = null!;//分數欄位

    private _saveScore: number = 0;//保存分數

    /**
     * 顯示遊戲跑馬燈
     */
    public showTip() {
        this.scoreWin.active = false;//隱藏贏得分數介面
        this.infoTip.active = true;//顯示遊戲跑馬燈
    }

    /**
     * 重置累積分數
     * @param score 累積分數
     */
    public resetSaveScore() {
        this._saveScore = 0;
        this.totalTxNode.active = false;//隱藏總贏得分數
        this.winTxNode.active = true;//顯示贏得分數
    }

    /**
     * 顯示贏得分數
     * @param winScore 贏得分數
     */
    public showWinScore(winScore: number) {
        if (this.infoTip.active)
            this.infoTip.active = false;//隱藏遊戲跑馬燈
        const endScore = G5251Utils.accAdd(this._saveScore, winScore);
        const runScore = { score: this._saveScore };//設置起始分
        tween(runScore).to(1, { score: endScore }, {
            onUpdate: () => {
                this.scoreWinLabel.string = G5251Utils.NumDigits2(runScore.score);//更新分數
            }
        }).call(() => {
            this._saveScore = endScore;
            this.scoreWinLabel.string = G5251Utils.NumDigits2(endScore);//更新分數
        }).start();
        if (this._saveScore > 0)
            this.plsyScoreAnim('scoreWinAdd');
        else
            this.plsyScoreAnim('scoreWin');
    }

    /**
     * 文字改變為總贏得
     * @param scatterPayOff scatter贏得分數
     */
    public changeTotalWin(scatterPayOff: number) {
        this.totalTxNode.active = true;//顯示總贏得分數
        this.winTxNode.active = false;//隱藏贏得分數
        this._saveScore = scatterPayOff;
        this.scoreWinLabel.string = G5251Utils.NumDigits2(scatterPayOff);//更新分數
    }

    /**
     * 顯示總贏得分數
     * @param endScore 總贏得分數
     */
    public scoreEnd(endScore: number): Promise<void> {
        return new Promise(async resolve => {
            this.scoreWin.getComponent(Animation)!.play('scoreEnd');
            this.updateScore(endScore);//更新分數
            await G5251Utils.Delay(1);//總分顯示時間
            resolve();
        });
    }

    /**
     * 更新分數
     * @param endScore 總贏得分數
     */
    public updateScore(endScore: number) {
        this.scoreWinLabel.string = G5251Utils.NumDigits2(endScore);//更新分數
    }

    /**
     * 播放贏分動態
     */
    private plsyScoreAnim(animName: string) {
        this.particleStar3D.getComponent(ParticleSystem)!.stopEmitting();//停止
        this.particleStar3D.getComponent(ParticleSystem)!.play();//播放粒子
        this.infoTip.active = false;//隱藏遊戲跑馬燈
        this.scoreWin.active = true;//顯示贏分
        this.scoreWin.getComponent(Animation)!.play(animName);
        tween(this.node).to(0.2, { scale: new Vec3(1.05, 1.05, 1) })
            .to(0.3, { scale: new Vec3(1, 1, 1) })
            .start();
    }
}