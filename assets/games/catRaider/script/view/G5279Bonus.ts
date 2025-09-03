import { Comm } from '@common/h5GameTools/GTCommEvents';
import { getAudioManager } from '@common/manager/AudioManager';
import { getEventManager } from '@common/manager/EventManager';
import { awaitSleep } from '@common/utils/tools';
import { _decorator, Animation, Component, Label, Node, sp, tween, UIOpacity } from 'cc';

import { G5279AudioName } from '@/games/catRaider/script/data/G5279AudioEnum';
import { lines } from '@/games/catRaider/script/data/G5279Interface';



import { getG5279Model, G5279Time } from '@/games/catRaider/script/model/G5279Model';
import { formatNumberRound2, playAnimFinish, playSpineFinish } from '@/games/catRaider/script/tools/G5279Tools';

const { ccclass, property } = _decorator;

@ccclass('G5279Bonus')
export class G5279Bonus extends Component {
    @property(Node)
    private getBonusNode: Node = null!;

    @property(Node)
    private bonusFinished: Node = null!;

    @property(Node)
    private bonusGameUI: Node = null!;

    @property(Label)
    private bonusTime: Label = null!;

    @property(Label)
    private bonusTotalTime: Label = null!;

    @property(Node)
    private bonusTotalWin: Node = null!;

    /**
     * 設置節點顯示在公版最上層
     */
    private setTopNode() {
        //設置節點顯示在公版最上層
        getEventManager().emit(Comm.GET_TOPGAMENODE, {
            callback: (topNode:Node) => {
                topNode.addChild(this.getBonusNode);
                topNode.addChild(this.bonusTotalWin);
            }
        });
    }

    /**
     * 更新bonus次數
     * @param line 線資料
     */
    public updateBonusCount(line: lines) {
        const { freeGameTotal, freeGameTimes } = line;
        this.bonusGameUI.getChildByName('freeDrops')!.active = (freeGameTimes! !== 0);
        this.bonusGameUI.getChildByName('lastFreeDrops')!.active = (freeGameTimes! === 0);
        this.bonusTime.string = (freeGameTotal! - freeGameTimes!).toString();
        this.bonusTotalTime.string = freeGameTotal!.toString();
    }

    /**
     * 顯示bonus遊戲
     */
    public async showBonusGame() {
        const showTime = G5279Time.bonusGameTime * 0.93;
        const exitTime = G5279Time.bonusGameTime * 0.07;
        this.setTopNode();
        const bonusUIOpacity = this.getBonusNode.getComponent(UIOpacity)!;
        bonusUIOpacity.opacity = 0;
        this.getBonusNode.active = true;//獲得bonus滿版畫面
        const spine = this.getBonusNode.getChildByName('spine')!;
        const skeleton = spine.getComponent(sp.Skeleton)!;
        skeleton.timeScale = (0.5 + 0.5 * getG5279Model().timeScale);//加速加一半
        skeleton.setAnimation(0, 'animation', false);

        tween(bonusUIOpacity).to(exitTime / 1000, { opacity: 255 }).start();
        await awaitSleep(showTime);
        tween(bonusUIOpacity).to(exitTime / 1000, { opacity: 0 }).start();
        await awaitSleep(exitTime);
        this.getBonusNode.active = false;

        //顯示bonus次數(如果已顯示就不再淡入)
        if (!this.bonusGameUI.active) {
            this.bonusGameUI.active = true;
            const bonusGameUIOpacity = this.bonusGameUI.getComponent(UIOpacity)!;
            bonusGameUIOpacity.opacity = 0;
            tween(bonusGameUIOpacity).to(0.2, { opacity: 255 }).start();
        }
    }

    /**
     * 處理totalWin表演
     * @param totalWin 總贏分
     */
    public async showTotalWin(totalWin: number): Promise<void> {
        return new Promise(async resolve => {
            getAudioManager().lowerMusic();//背景音變小
            //totalWin介面顯示
            this.bonusTotalWin.active = true;
            const bonusTotalWinOpacity = this.bonusTotalWin.getComponent(UIOpacity)!;
            bonusTotalWinOpacity.opacity = 0;
            tween(bonusTotalWinOpacity).to(0.1, { opacity: 255 }).start();

            //更新totalWin分數顯示
            const totalScore = this.bonusTotalWin.getChildByName('totalScore')!;
            const totalScoreLabel = totalScore.getChildByName('label')!;
            totalScoreLabel.getComponent(Label)!.string = formatNumberRound2(totalWin);
            totalScore.getComponent(Animation)!.play();
            getAudioManager().playSound(G5279AudioName.totalWin);

            this.playTotalWinSpine();//播放spine表演

            //等待totalWin表演時間
            await awaitSleep(G5279Time.totalWinShowTime);

            this.hideBonusGameUI();
            tween(bonusTotalWinOpacity).to(0.3, { opacity: 0 }).call(() => {
                this.bonusTotalWin.active = false;
                resolve();
            }).start();
        });
    }

    /**
     * 播放totalWin spine表演
     */
    private async playTotalWinSpine() {
        const spine = this.bonusTotalWin.getChildByName('spine')!;
        const skeleton = spine.getComponent(sp.Skeleton)!;
        await playSpineFinish(skeleton, 'show');
        skeleton.setAnimation(0, 'loop', true);
    }

    /**
     * 顯示finished表演
     */
    public async showFinished(): Promise<void> {
        return new Promise(async resolve => {
            getAudioManager().lowerMusic();//背景音變小
            getAudioManager().playSound(G5279AudioName.finished);
            this.bonusFinished.active = true;
            const anim = this.bonusFinished.getComponent(Animation)!;
            await playAnimFinish(anim, 'finished');
            this.bonusFinished.active = false;
            this.hideBonusGameUI();
            resolve();
        });
    }

    /**
     * 隱藏bonus遊戲介面，回歸mg背景音樂
     */
    private hideBonusGameUI() {
        const bonusGameUIOpacity = this.bonusGameUI.getComponent(UIOpacity)!;
        tween(bonusGameUIOpacity).to(0.3, { opacity: 0 }).call(() => {
            this.bonusGameUI.active = false;
            getAudioManager().playMusic(G5279AudioName.bgmMg);//播放mg背景音樂
        }).start();
    }
}