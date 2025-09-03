import { G5279Config, G5279TimeConfig } from '@/games/catRaider/script/data/G5279Config';
import { G5279BetState, G5279GameState } from '@/games/catRaider/script/data/G5279Enum';
import { onBeginGame, onOnLoadInfo } from '@/games/catRaider/script/data/G5279Interface';

// 创建当前时间配置的副本（用于动态调整）
export const G5279Time: G5279TimeConfig = { ...G5279Config.timeConfig };

export class G5279Model {
    public static _instance: G5279Model;
    public static getInstance(): G5279Model {
        if (!G5279Model._instance) {
            G5279Model._instance = new G5279Model();
        }
        return G5279Model._instance;
    }

    //==================== 時間相關 ====================
    /**
     * 獲得當前時間倍率
     */
    private _timeScale: number = 1;//時間倍率
    get timeScale() {
        return this._timeScale;
    }

    set timeScale(scale: number) {
        this._timeScale = scale;
        this.updateScaleTime();//更新時間倍率
    }

    /**
     * 更新時間倍率(totalWinShowTime與zombiePartyTime不變)
     */
    public updateScaleTime() {
        if (this.timeScale <= 0) {
            console.warn('timeScale 不能小於或等於 0，使用預設值 1');
            this.timeScale = 1;
        }

        G5279Time.chrMoveTime = G5279Config.timeConfig.chrMoveTime / this.timeScale;
        G5279Time.waitNextLineTime = G5279Config.timeConfig.waitNextLineTime / this.timeScale;
        G5279Time.symbolDropTime = G5279Config.timeConfig.symbolDropTime / this.timeScale;
        G5279Time.groundDropTime = G5279Config.timeConfig.groundDropTime / this.timeScale;
        G5279Time.groundUpTime = G5279Config.timeConfig.groundUpTime / this.timeScale;
        G5279Time.ratCollectTime = G5279Config.timeConfig.ratCollectTime / this.timeScale;
        G5279Time.ratScoreWaitTime = G5279Config.timeConfig.ratScoreWaitTime / this.timeScale;
        G5279Time.chanceSlotTime = G5279Config.timeConfig.chanceSlotTime / this.timeScale;
        G5279Time.itemShowTime = G5279Config.timeConfig.itemShowTime / this.timeScale;
        G5279Time.waitBombTime = G5279Config.timeConfig.waitBombTime / this.timeScale;
        G5279Time.floorDropTime = G5279Config.timeConfig.floorDropTime / this.timeScale;
        G5279Time.symbolDownTime = G5279Config.timeConfig.symbolDownTime / (0.5 + 0.5 * this.timeScale);//加速加一半
        G5279Time.bonusGameTime = G5279Config.timeConfig.bonusGameTime / (0.5 + 0.5 * this.timeScale);//加速加一半
        G5279Time.zombiePartyTime = G5279Config.timeConfig.zombiePartyTime / (0.5 + 0.5 * this.timeScale);//加速加一半

        //以下不受速度影響

        // G5279Time.totalWinShowTime = G5279Config.timeConfig.totalWinShowTime / this.timeScale;
    }

    /**
     * 重置時間配置到預設值
     */
    public resetTimeConfig() {
        Object.assign(G5279Time, G5279Config.timeConfig);
    }
    //==================== 時間相關 ====================


    //==================== 遊戲資料相關 ====================
    //設置OnLoadInfo資料
    private _loadInfo: onOnLoadInfo = null!;
    public setLoadInfo(info: onOnLoadInfo) {
        this._loadInfo = info;
    }

    /**
     * 設置BeginGame資料
     */
    private _beginGameData: onBeginGame = null!;
    public setBeginGameData(msg: onBeginGame) {
        this._beginGameData = msg;
    }

    /**
     * 獲得當前等級
     */
    private _currentLv: number = 0;//當前關卡等級(0,1,2,3)
    get currentLv() {
        return this._currentLv;
    }

    set currentLv(lv: number) {
        this._currentLv = lv;
    }

    /**
     * 獲得當前遊戲狀態
     */
    private _gameState: G5279GameState = G5279GameState.ON_READY;//初始為準備狀態
    get gameState() {
        return this._gameState;
    }

    set gameState(state: G5279GameState) {
        this._gameState = state;
    }

    /**
     * 獲得當前下注類型
     */
    private _betState: G5279BetState = G5279BetState.NORMAL;
    get betState() {
        return this._betState;
    }

    set betState(state: G5279BetState) {
        this._betState = state;
    }

    /**
     * 獲得移動後的盤面卡片數據
     */
    private _movedCards: number[] = [];//移動後的盤面卡片
    get movedCards() {
        return this._movedCards;
    }

    set movedCards(cards: number[]) {
        this._movedCards = [...cards];
    }

    /**
     * 紀錄老鼠蒐集的寶石ID
     */
    private _ratGemIDs: number[] = [];
    get ratGemIDs() {
        return this._ratGemIDs;
    }

    set ratGemIDs(ids: number[]) {
        this._ratGemIDs = [...ids];
    }
    //==================== 遊戲資料相關 ====================


    //==================== 資料獲取與換算 ====================
    /**
     * 根據目前下注狀態獲得押注倍率
     * @returns 押注倍率
     */
    public getBetRate() {
        switch (this.betState) {
            case G5279BetState.NORMAL:
                return 1;
            case G5279BetState.BUY_BONUS_GAME:
                return this._loadInfo.data.extra.buyFreeRatio[0];
            case G5279BetState.BUY_FEATURE_L3:
                return this._loadInfo.data.extra.buyFreeRatio[1];
        }
    }

    /**
     * 是否啟用購買免費遊戲
     */
    public isBuyFreeEnabled() {
        return this._loadInfo.data.extra.buyFree;
    }

    /**
     * 獲得賠率資料
     */
    public getPayTable() {
        return this._loadInfo.data.game.payTable;
    }

    /**
     * 獲得機會卡資料
     */
    public getChanceCards() {
        return this._beginGameData.data.chanceCards;
    }

    /**
     * 獲得最大能量
     */
    public getMaxEnergy() {
        return this._loadInfo.data.extra.maxEnergy;
    }

    /**
     * 回傳當前用ReelPos資料
     * @returns 當前用ReelPos資料
     */
    public getCurrentReelPos() {
        return G5279Config.reelPos[this.currentLv];
    }

    /**
     * 回傳最後一局symbol資料
     * @returns 最後一局symbol資料
     */
    public getEndCards() {
        const cards = this._beginGameData.data.cards;
        const endCards = cards[cards.length - 1].flat();
        return endCards;
    }

    /**
     * 獲得購買免費遊戲下注倍率
     */
    public getBuyFreeRate(index: number) {
        return this._loadInfo.data.extra.buyFreeRatio[index];
    }

    /**
     * 回傳開始等級
     * @param cards 表演用Cards資料
     * @returns 開始等級
     */
    public getStartLevel(cards: number[][][]) {
        const length = cards[0].length;
        const levelCount = [5, 6, 7, 8];
        const startLevel = levelCount.indexOf(length);
        if (startLevel === -1) {
            return 0;
        }
        return startLevel;
    }

    /**
     * 取得9宮格範圍地板ID(已排除邊緣與角落的ID)
     * @param posID 位置ID
     * @returns 爆炸的9宮格範圍位置ID數組
     */
    public getBomb9Grid(posID: number) {
        const reelPos = this.getCurrentReelPos();
        const column = Math.sqrt(reelPos.length);//該等級的列數
        const row = Math.floor(posID / column);
        const col = posID % column;
        const result: number[] = [];

        // 檢查八個方向
        const directions = [
            [-1, -1], [-1, 0], [-1, 1], // 上排
            [0, -1], [0, 1],  // 中排
            [1, -1], [1, 0], [1, 1]   // 下排
        ];

        // 加入中心點
        result.push(posID);

        // 檢查周圍八個位置
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            const newPosID = newRow * column + newCol;

            // 檢查是否在有效範圍內
            if (newRow >= 0 && newRow < column &&
                newCol >= 0 && newCol < column) {
                result.push(newPosID);
            }
        }
        return result;
    }

    /**
     * 獲取同心圓表演資料
     * @param posID 位置ID
     * @returns 同心圓表演資料
     */
    public getConcentricData(posID: number) {
        const reelPos = this.getCurrentReelPos();
        const column = Math.sqrt(reelPos.length);//該等級的列數
        const row = Math.floor(posID / column);
        const col = posID % column;
        const maxNum = column ** 2;
        const result: number[][] = [];
        const usedPositions = new Set<number>();

        // 第一層：只包含中心點
        result.push([posID]);
        usedPositions.add(posID);

        // 從距離1開始擴散
        for (let distance = 1; distance < column; distance++) {
            const borderPositions: number[] = [];

            // 計算當前邊框的範圍
            const minRow = Math.max(0, row - distance);
            const maxRow = Math.min(column - 1, row + distance);
            const minCol = Math.max(0, col - distance);
            const maxCol = Math.min(column - 1, col + distance);

            // 收集邊框上的所有位置
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    // 只收集邊框位置（四個邊）
                    if (r === minRow || r === maxRow || c === minCol || c === maxCol) {
                        const currentPosID = r * column + c;
                        if (currentPosID < maxNum && !usedPositions.has(currentPosID)) {
                            borderPositions.push(currentPosID);
                            usedPositions.add(currentPosID);
                        }
                    }
                }
            }

            // 如果這一層有位置，則加入結果
            if (borderPositions.length > 0) {
                result.push(borderPositions);
            }
        }
        return result;
    }
    //==================== 資料獲取與換算 ====================
}
// 使用 Proxy 實現懶加載
export const getG5279Model = () => G5279Model.getInstance();