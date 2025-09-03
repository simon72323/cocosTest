import { Logger } from '@common/utils/Logger';
import { NumberUtils } from '@common/utils/NumberUtils';

import { ColorID } from '@/games/colorGame/script/enum/CGEnum';
import { BetInfo, BetInfoList, ColorBetInfo, joinGame, PayInfo, PlayerData, RoadMapRate } from '@/games/colorGame/script/enum/CGInterface';


export class CGModel {
    private static _instance: CGModel;
    public static getInstance(): CGModel {
        if (!CGModel._instance) {
            CGModel._instance = new CGModel();
        }
        return CGModel._instance;
    }

    public rebetTotal: number = 0;//單局續押總金額
    public betTotalTime: number = 0;//單局押注時間
    public roundSerial: number = 0;//局號
    public betMax: number = 0;//下注上限
    public localBetCredits: number[] = [];//該用戶各注區目前押注額
    public totalBetCredits: number[] = [];//目前各注區的押注額
    public credit: number = 0;//餘額
    public roadMap: string[] = [];//前10局開獎顏色紀錄
    //用戶資料
    public userData: PlayerData = {
        avatarID: 0,
        displayName: '',
        enterID: 0
    } as PlayerData;

    public startColor: number[] = [];//起始骰子顏色
    public countdown: number = 0;//剩餘秒數

    //前100局開獎顏色數量
    private roadMapRate: RoadMapRate = {
        Blue: 0,
        Green: 0,
        Grey: 0,
        Purple: 0,
        Red: 0,
        Yellow: 0
    } as RoadMapRate;

    public playerList: PlayerData[] = [];//紀錄目前玩家資料
    public rankings: PlayerData[] = [];//前三名用戶資料，如果ID是本地用戶，不表演籌碼並取消跟注
    public liveCount: number = 0;//目前線上人數
    public pathID: number = 0;//路徑ID
    public winDice: string = '';//開獎顏色

    private constructor() {
        this.init();
    }

    /**
     * 初始化
     */
    public init() {
        this.rankings = [];
        this.playerList = [];
        this.userData = { avatarID: 0, displayName: '', enterID: 0 };
    }

    /**
     * 更新路紙資料
     */
    public updateRoadMap() {
        this.roadMap.pop();//刪除最後一個路紙
        this.roadMap.unshift(this.winDice);//添加新路紙到第一個
    }

    /**
     * 押注資料初始化
     */
    public initBetData(): void {
        this.rebetTotal = 0;
        this.localBetCredits = Array(6).fill(0);
        this.totalBetCredits = Array(6).fill(0);
    }

    /**
     * 設置路紙率
     * @param roadmapRate 路紙率
     */
    public setRoadMapRate(roadmapRate: RoadMapRate): void {
        this.roadMapRate = {
            Blue: roadmapRate.Blue || 0,
            Green: roadmapRate.Green || 0,
            Grey: roadmapRate.Grey || 0,
            Purple: roadmapRate.Purple || 0,
            Red: roadmapRate.Red || 0,
            Yellow: roadmapRate.Yellow || 0
        };
    }

    /**
     * 獲取路紙率
     * @returns 路紙率
     */
    public getRoadMapRate(): RoadMapRate {
        return this.roadMapRate;
    }

    /**
     * 更新onJoinGame資料
     * @param msg 
     */
    public async updateOnJoinGame(msg: joinGame): Promise<void> {
        const { roundSerial, roomInfo, countdown, betTotalTime, roadmap, roadmapRate, dice, startColor } = msg.data;
        this.roundSerial = roundSerial;
        this.roadMap = roadmap;
        this.betTotalTime = betTotalTime;
        this.countdown = countdown;
        this.setRoadMapRate(roadmapRate);
        this.startColor = startColor;
        this.liveCount = roomInfo.playerList.length;
        Logger.debug('玩家列表', roomInfo.playerList);
        this.playerList = roomInfo.playerList;

        //將玩家資料betInfo資料轉換生成新的betCredits資料
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i].betCredits = await this.betInfoToBetCredits(this.playerList[i].betInfo!);
        }

        this.setRankings();//更新前三名資料
        if (dice) {
            this.winDice = dice;
        }
    }

    /**
     * 將玩家資料betInfo資料轉換生成新的betCredits資料
     */
    // public async playerListBetInfoToBetCredits(): Promise<void> {
    //     return new Promise((resolve) => {
    //         for (let i = 0; i < this.playerList.length; i++) {
    //             const betCredits = Array(6).fill(0);
    //             for (const color in this.playerList[i].betInfo) {
    //                 const colorIndex = ColorID[color]; // 獲取顏色的索引
    //                 betCredits[colorIndex] = this.playerList[i].betInfo[color].BetCredit; // 設置對應的 BetCredit
    //             }
    //             this.playerList[i].betCredits = betCredits;//轉換後的資料寫入betCredits
    //         }
    //         resolve();
    //     });
    // }

    /**
     * 將玩家資料betInfo資料轉換生成新的betCredits(數字陣列)資料
     * @param betInfo 玩家資料
     * @returns 
     */
    public async betInfoToBetCredits(betInfo: ColorBetInfo): Promise<number[]> {
        const betCredits = Array(6).fill(0);
        for (const color of Object.keys(betInfo)) {
            const colorIndex = ColorID[color as keyof typeof ColorID]; // 獲取顏色的索引
            betCredits[colorIndex] = betInfo[color]?.BetCredit ?? 0; // 獲取顏色的押注額度
        }
        return betCredits;
    }


    /**
     * 添加玩家資料到玩家列表
     * @param playerList 玩家資料
     */
    public addPlayerList(enterPlayerList: PlayerData[]) {
        for (let i = 0; i < enterPlayerList.length; i++) {
            enterPlayerList[i].betInfo = {};
            enterPlayerList[i].betCredits = Array(6).fill(0);
            this.playerList.push(enterPlayerList[i]);
        }
        this.liveCount = this.playerList.length;//更新人數
    }

    /**
     * 根據enterID移除玩家列表
     * @param enterIDs
     */
    public removePlayerList(enterIDs: number[]): void {
        this.playerList = this.playerList.filter(player => enterIDs.indexOf(player.enterID) === -1);
        this.liveCount = this.playerList.length;//更新人數
    }

    /**
     * 設置玩家押注注區額度(這個只有針對onJoinGame第一次表演用)
     * @param rankerBetCredits 前三名用戶押注注區額度
     * @param otherBetCredits 其他用戶押注注區額度
     * @returns 
     */
    public setBetAreaCredit(): { rankerBetCredits: number[][], otherBetCredits: number[][] } {
        let rankerBetCredits: number[][] = Array.from({ length: 3 }, () => Array(6).fill(0));
        let otherBetCredits: number[][] = [];
        for (let i = 0; i < this.playerList.length; i++) {
            const betCredits = this.playerList[i].betCredits!;

            const rankingIndex = this.rankings.findIndex(ranking => ranking.enterID === this.playerList[i].enterID);
            if (rankingIndex !== -1) {
                rankerBetCredits[rankingIndex].forEach((bet, index) => {
                    rankerBetCredits[rankingIndex][index] = NumberUtils.accAdd(rankerBetCredits[rankingIndex][index], betCredits[index]); // 正確更新 rankerBetCredits
                });
            } else {
                otherBetCredits.push(betCredits);
            }
        }
        return { rankerBetCredits, otherBetCredits };
    }

    /**
     * 計算勝利表演所需用參數
     * @param winColor 開獎顏色編號
     * @returns 
     */
    public calculateWinData(): { localWinArea: number[], betOdds: number[], winNum: Set<number> } {
        let betOdds: number[] = Array(6).fill(0);//勝利注區與倍率
        let winColorCount: number[] = Array(6).fill(0);//每個注區的開獎數量
        let localWinArea: number[] = [];//本地勝利注區
        const winColor = this.winDice.split('-').map(color => ColorID[color as keyof typeof ColorID]);
        const winNum = new Set(winColor);//過濾重複數字
        for (let i of winColor) {
            winColorCount[i]++;
        }
        //判斷勝利注區
        for (let i = 0; i < winColorCount.length; i++) {
            const count = winColorCount[i];
            if (count > 0) {
                if (this.localBetCredits[i] > 0)//如果用戶該區有押注
                    localWinArea.push(i);
                betOdds[i] = count === 3 ? 14 : count;//設置賠率
            }
        }
        return { localWinArea, betOdds, winNum };
    }

    /**
     * 更新其他玩家押注注區額度
     * @param betCredits 注區額度
     */
    public updateTotalBetArea(betCredits: number[]) {
        for (let i = 0; i < 6; i++) {
            this.totalBetCredits[i] = NumberUtils.accAdd(this.totalBetCredits[i], betCredits[i]);
        }
    }

    /**
     * 更新本地押注注區額度
     * @param betCredits 本地押注注區額度
     * @param credit 餘額
     */
    public updateBetCredit(betInfo: BetInfo[], credit: number) {
        this.credit = credit;
        for (let i = 0; i < 6; i++) {
            const betCredit = betInfo.find(item => item.color === ColorID[i]);
            if (betCredit) {
                this.localBetCredits[i] = NumberUtils.accAdd(this.localBetCredits[i], betCredit.betCredit);
                this.totalBetCredits[i] = NumberUtils.accAdd(this.totalBetCredits[i], betCredit.betCredit);
                this.rebetTotal = NumberUtils.accAdd(this.rebetTotal, betCredit.betCredit);
            }
        }
    }

    /**
     * 添加贏分到所有玩家資料
     * @param payInfo 贏分資料
     */
    public addPayToPlayerList(payInfo: PayInfo[]) {
        if (!payInfo)
            return null;
        payInfo.forEach(payData => {
            const player = this.playerList.find(player => player.enterID === payData.enterID);
            if (player) {
                player.pay = NumberUtils.accAdd(player.pay!, payData.pay);
            }
        });
        const userPay = payInfo.find(info => info.enterID === this.userData.enterID);
        Logger.debug('更新贏分後的玩家列表', this.playerList);
        return userPay ? userPay.pay : null;
    }

    /**
     * 添加押注資料到玩家列表(並返回新增的押注資料)
     * @param betInfoList 押注資料
     * @returns 新增的押注資料
     */
    public addBetInfoToPlayerList(betInfoList: BetInfoList[]): { rankerBetCredits: number[][], otherBetCredits: number[][] } {
        let rankerBetCredits: number[][] = Array.from({ length: 3 }, () => Array(6).fill(0));
        let otherBetCredits: number[][] = [];

        for (let i = 0; i < betInfoList.length; i++) {
            if (betInfoList[i].enterID === this.userData.enterID)
                continue;//跳過
            let addBetCredits: number[] = Array(6).fill(0);
            const player = this.playerList.find(player => player.enterID === betInfoList[i].enterID);
            const betInfo = betInfoList[i];

            // 更新玩家的押注額度
            betInfo.betInfo.forEach(bet => {
                const colorID = ColorID[bet.color as keyof typeof ColorID];
                addBetCredits[colorID] = NumberUtils.accAdd(addBetCredits[colorID], bet.betCredit);
                if (player) {
                    player.betCredits![colorID] = NumberUtils.accAdd(player.betCredits![colorID], bet.betCredit);//更新到玩家押注資料內
                }
            });

            // 檢查是否為排名玩家
            const rankingIndex = this.rankings.findIndex(ranking => ranking.enterID === betInfo.enterID);
            if (rankingIndex !== -1) {
                rankerBetCredits[rankingIndex] = [...addBetCredits];
            } else {
                otherBetCredits.push([...addBetCredits]);
            }
        }
        return { rankerBetCredits, otherBetCredits };
    }

    /**
     * 計算前三名
     */
    public setRankings() {
        this.rankings = this.playerList
            .filter(player => player.pay! > 0)//找到pay大於0的資料
            .sort((a, b) => b.pay! - a.pay!) // 按pay值降序排序
            .slice(0, 3); // 取前三名
    }

    /**
     * 增加可用分數
     * @param credit 可用分數
     */
    public addCredit(credit: number) {
        this.credit = NumberUtils.accAdd(this.credit, credit);
    }

    /**
     * 計算剩餘押注上限
     * @returns 剩餘押注上限
     */
    public getRemainingBetLimit() {
        return NumberUtils.accSub(this.betMax, this.rebetTotal);
    }
}

export const colorGameModel = CGModel.getInstance();