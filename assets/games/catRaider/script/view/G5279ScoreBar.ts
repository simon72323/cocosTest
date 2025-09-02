import { _decorator, Component, tween, Animation, Label, Node, Sprite, SpriteFrame, sp } from 'cc';
import { formatNumberRound2 } from '../tools/G5279Tools';
import { getAudioManager } from '@common/manager/AudioManager';
import { NumberUtils } from '@common/utils/NumberUtils';

import { G5279Config } from '../data/G5279Config';
import { G5279AudioName } from '../data/G5279AudioEnum';

const { ccclass, property } = _decorator;

@ccclass('G5279ScoreBar')
export class G5279ScoreBar extends Component {
    private scoreWin: Node = null!;//贏得分數介面
    private infoTip: Node = null!;//tip節點
    private winTxNode: Node = null!;//贏得分數
    private totalTxNode: Node = null!;//總贏得分數
    private scoreWinLabel: Label = null!;//分數欄位

    private _saveScore: number = 0;//保存分數
    private scoreLv: number = 0;//分數面板等級
    @property([SpriteFrame])
    public scoreBarMaskSF: SpriteFrame[] = []!;//scoreBar遮罩圖

    onLoad() {
        this.scoreWin = this.node.getChildByName("scoreWin")!;
        this.infoTip = this.node.getChildByName("infoTip")!;
        const scoreNode = this.node.getChildByName("scoreWin")!.getChildByName("score")!;
        this.winTxNode = scoreNode.getChildByName("winTx")!;
        this.totalTxNode = scoreNode.getChildByName("totalTx")!;
        this.scoreWinLabel = scoreNode.getChildByName("label")!.getComponent(Label)!;
    }

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
        this.scoreLv = 0;
        this.totalTxNode.active = false;//隱藏總贏得分數
        this.winTxNode.active = true;//顯示贏得分數
        const skeleton = this.node.getComponent(sp.Skeleton)!
        skeleton.setAnimation(0, 'winFrame1_loop', true);
    }

    /**
     * 顯示贏得分數(加分)
     * @param winScore 贏得分數
     */
    public async showWinAddScore(winScore: number): Promise<void> {
        return new Promise(async (resolve) => {
            const endScore = NumberUtils.accAdd(this._saveScore, winScore);
            if (endScore > 0 && this.infoTip.active) {
                this.infoTip.active = false;//隱藏遊戲跑馬燈
                this.scoreWin.active = true;//顯示贏分
            }
            const runScore = { score: this._saveScore };//設置起始分

            if (endScore > 0 && winScore > 0) {
                const animName = this._saveScore > 0 ? "scoreWinAdd" : "scoreWin";
                this.scoreWin.getComponent(Animation)!.play(animName);
                getAudioManager().playSound(G5279AudioName.addScore);
                this.playSpineAnim(endScore);//播放贏分動畫
            }

            this._saveScore = endScore;//更新起始分
            tween(runScore).to(0.2, { score: endScore }, {
                onUpdate: () => {
                    this.updateScore(runScore.score);//更新分數
                }
            }).call(() => {
                this.updateScore(endScore);//更新分數
                resolve();
            }).start();
        });
    }

    /**
     * 播放贏分動畫
     */
    private async playSpineAnim(totalScore: number) {
        const skeleton = this.node.getComponent(sp.Skeleton)!
        if (totalScore > G5279Config.bigWinRange[1]) {
            if (this.scoreLv === 0) {
                skeleton.setAnimation(0, 'winFrame1up3', false);
            } else if (this.scoreLv === 1) {
                skeleton.setAnimation(0, 'winFrame2up3', false);
            } else {
                skeleton.setAnimation(0, 'winFrame3_win', false);
            }
            this.infoTip.getComponent(Sprite)!.spriteFrame = this.scoreBarMaskSF[2];
            this.scoreLv = 2;
        } else if (totalScore > G5279Config.bigWinRange[0]) {
            if (this.scoreLv === 0) {
                skeleton.setAnimation(0, 'winFrame1up2', false);
            } else {
                skeleton.setAnimation(0, 'winFrame2_win', false);
            }
            this.infoTip.getComponent(Sprite)!.spriteFrame = this.scoreBarMaskSF[1];
            this.scoreLv = 1;
        } else {
            skeleton.setAnimation(0, 'winFrame1_win', false);
            this.infoTip.getComponent(Sprite)!.spriteFrame = this.scoreBarMaskSF[0];
        }
    }

    /**
     * 顯示總贏得分數
     * @param totalScore 總贏得分數
     */
    public showTotalWinScore(totalScore: number) {
        this.totalTxNode.active = true;//顯示總贏得分數
        this.winTxNode.active = false;//隱藏贏得分數
        this.scoreWin.getComponent(Animation)!.play("scoreWinEnd");
        getAudioManager().playSound(G5279AudioName.totalScore);
        this.playSpineAnim(totalScore);//播放贏分動畫
        this.updateScore(totalScore);//更新分數
    }

    /**
     * 更新分數
     * @param score 分數
     */
    public updateScore(score: number) {
        this.scoreWinLabel.string = formatNumberRound2(score);//更新分數
    }
}