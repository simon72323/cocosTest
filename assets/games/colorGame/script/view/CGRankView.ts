import { Logger } from '@common/utils/Logger';
import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Animation } from 'cc';

import { PlayerData } from '@/games/colorGame/script/enum/CGInterface';
import { CGUtils } from '@/games/colorGame/script/tools/CGUtils';

const { ccclass, property } = _decorator;
@ccclass('CGRankView')
export class CGRankView extends Component {
    @property(Node)//用戶位置
    private userPos!: Node;

    @property([SpriteFrame])//頭像貼圖
    private avatarPhoto: SpriteFrame[] = [];

    @property(SpriteFrame)//頭像貼圖
    private nullPhoto: SpriteFrame = null!;

    private _oldRankings: PlayerData[] = Array.from({ length: 3 }, () => ({} as PlayerData));//初始化排名資料

    /**
     * 顯示玩家排名介面
     */
    public showRankView() {
        for (let i = 0; i < 3; i++) {
            this.userPos.children[i + 1].active = true;
        }
    }

    /**
     * 更新排名資料
     * @param newRankings 新排名資料
     * @controller
     */
    public updateRanks(newRankings: PlayerData[], userData: PlayerData) {
        Logger.debug('新排名資料', newRankings);
        for (let i = 0; i < 3; i++) {
            const rankUser = this.userPos.children[i + 1].children[0];
            const betCall = this.userPos.children[i + 1].getChildByName('BtnCall')!;
            const betStopCall = this.userPos.children[i + 1].getChildByName('BtnStopCall')!;
            const callFx = this.userPos.children[i + 1].getChildByName('User')!.getChildByName('CallFx')!;
            const nameLabel = rankUser.getChildByName('Name')!.getComponent(Label)!;
            const scoreLabel = rankUser.getChildByName('Label')!.getComponent(Label)!;
            const avatarSprite = rankUser.getChildByName('Mask')!.children[0].getComponent(Sprite)!;
            if (newRankings[i]) {
                nameLabel.string = newRankings[i].displayName.slice(0, 3) + '***';
                scoreLabel.string = CGUtils.NumDigits(newRankings[i].pay!);
                avatarSprite.spriteFrame = this.avatarPhoto[newRankings[i].avatarID];

                //如果排名玩家變了需播放變更動畫
                if (!this._oldRankings[i] || this._oldRankings[i].enterID !== newRankings[i].enterID) {
                    this.userPos.children[i + 1].getComponent(Animation)!.play('RankerChange');//播放更新動畫
                }
                if (newRankings[i].enterID === userData.enterID) {
                    //如果是本地用戶進排名
                    betCall.active = false;
                    betStopCall.active = false;
                    callFx.active = false;
                    nameLabel.string = '- You -';
                } else {
                    if (!betCall.active && !betStopCall.active)
                        betCall.active = true;
                }
                this._oldRankings[i] = { ...newRankings[i] };//紀錄當局排名資料
            } else {
                nameLabel.string = '';
                scoreLabel.string = '0';
                avatarSprite.spriteFrame = this.nullPhoto;
                betCall.active = false;
                betStopCall.active = false;
                callFx.active = false;
            }
        }
    }

    /**
     * 更新當局排名玩家分數
     * @param playerList 所有玩家最新資料
     */
    public updateRankerWin(playerList: PlayerData[]) {
        // 創建一個 Map 來快速查找玩家數據
        const playerMap = new Map(playerList.map(player => [player.enterID, player]));
        // 只遍歷當前排行榜的玩家
        this._oldRankings.forEach((oldRanking, index) => {
            if (!oldRanking.enterID) return; // 跳過空位置
            const player = playerMap.get(oldRanking.enterID);
            // Logger.debug('更新當局排名玩家，舊分數', oldRanking.enterID, oldRanking.pay, '新分數', player.enterID, player.pay);
            if (player && oldRanking.pay !== player.pay) {
                const rankUser = this.userPos.children[index + 1].children[0];
                const scoreLabel = rankUser.getChildByName('Label')!.getComponent(Label)!;
                scoreLabel.string = CGUtils.NumDigits(player.pay!);
                rankUser.getComponent(Animation)!.play('RankerWin');
            }
        });
    }

    /**
     * 更新線上人數
     * @param liveCount 線上人數
     */
    public updateLiveCount(liveCount: number) {
        this.userPos.children[4].children[0].getChildByName('Label')!.getComponent(Label)!.string = liveCount.toString();
    }
}