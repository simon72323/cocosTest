import { G5251Utils } from '@/games/clearance/script/tools/G5251Utils';
import { onBeginGame, NewLines } from '@/games/clearance/script/types/G5251Interface';
import { REEL_DATA } from '@/games/clearance/script/types/G5251ReelData';

export class G5251Model {
    private static _instance: G5251Model;
    public static getInstance(): G5251Model {
        if (!G5251Model._instance) {
            G5251Model._instance = new G5251Model();
        }
        return G5251Model._instance;
    }

    private _beginGameData: onBeginGame = null!;
    private _newLines: NewLines[] = [];//表演用Line資料
    private _topSymbols: number[][] = [];//表演用上方預掉落symbol資料
    private _freeMode: boolean = false;//紀錄免費模式

    /**
     * 設置BeginGame資料
     * @param msg 
     */
    public setBeginGameData(msg: onBeginGame) {
        this._beginGameData = msg;
        this.changeBeginGameData();
    }

    //---------------------轉換後的表演資料---------------------
    /**
     * 轉換表演用BeginGame資料
     * @returns 
     */
    private changeBeginGameData() {
        //提取Lines的資料用於表演使用{中獎位置，移除位置，中獎金額，倍數}
        const lines = this._beginGameData.data.Lines;
        const cards = this._beginGameData.data.Cards;
        this._newLines = [];//表演用Line資料
        for (let i = 0; i < lines.length - 1; i++) {
            const flattenGrids = lines[i].flatMap(item => item.Grids);// 使用 flatMap 展平獲取所有中獎連線
            const uniqueGrids = [...new Set(flattenGrids)];// 使用 Set 去重複值
            const sortedGrids = uniqueGrids.sort((a, b) => a - b);// 重新排序
            const gridData = sortedGrids.map(n => n - 1);//獲得line所有中獎位置

            //將中獎位置一維陣列改成二維陣列
            let newGrids: number[][] = [];
            for (let j = 0; j < REEL_DATA.symbolPosID.length; j++) {
                const row = REEL_DATA.symbolPosID[j];//單行表演位置索引
                const filterPos = gridData.filter(n => row.includes(n));//獲得該行中獎的位置索引
                const rowPos = filterPos.map(n => n - row[0]);//將中獎位置索引轉換為表演用位置
                newGrids.push(rowPos);
            }
            //獲得表演用位置的symbolID
            const posSymbolIDData = newGrids.map(() => [] as number[]);
            // const removePosData = [];
            for (let j = 0; j < newGrids.length; j++) {
                for (let k = 0; k < newGrids[j].length; k++) {
                    const pos = newGrids[j][k];
                    const symbolID = cards[i][j][pos];
                    posSymbolIDData[j].push(symbolID);
                }
            }
            // 每行的贏分
            const payoffData = lines[i].map(item => item.Payoff);
            // 計算出該line表演用的資料
            const playLinesData = {
                Grids: newGrids,//中獎的位置索引
                SymID: posSymbolIDData,//根據中獎位置對應symbolID
                Payoff: G5251Utils.sumArray(payoffData),//中獎的金額
                DoubleTime: lines[i][0].DoubleTime//中獎的倍數
            } as NewLines;
            this._newLines.push(playLinesData);
        }

        //提取每行預掉落的symbol [每行待掉落symbol資料]/[symbol資料]
        this._topSymbols = Array(cards[0].length).fill([]).map(() => []);
        for (let i = 0; i < cards.length; i++) {
            for (let j = 0; j < cards[i].length; j++) {
                if (i < cards.length - 1) {
                    // const winPos = PlayLines[i].Pos;
                    let lineNum = 0;//各行要移除的位置數量
                    for (let k = 0; k < this._newLines[i].SymID[j].length; k++) {
                        const symbolID = this._newLines[i].SymID[j][k];
                        if (symbolID < 9 || symbolID > 16)
                            lineNum++;
                    }
                    for (let k = lineNum; k > 0; k--) {
                        this._topSymbols[j].push(cards[i + 1][j][k - 1]);
                    }
                } else {
                    this._topSymbols[j].push(this.getRandomSymbolID(j));//最後一行沒有掉落symbol，則設置隨機上方symbol
                }
            }
        }
        // return { newLines, topSymbols };
    }

    /**
     * 回傳表演用上方預掉落symbol資料
     * @returns 表演用上方預掉落symbol資料
     */
    public getTopSymbols() {
        return this._topSymbols;
    }

    /**
     * 回傳表演用Line資料
     * @returns 表演用Line資料
     */
    public getNewLines() {
        return this._newLines;
    }

    /**
     * 取得停止盤面後的新symbol資料
     * @param slotLine 哪行slot
     * @returns 停止盤面後的symbol資料
     */
    public getStopSymbols(slotLine: number) {
        const randomSymbolID = this.getRandomSymbolID(slotLine);
        const lineSymbols = this._beginGameData.data.Cards[0][slotLine];//該行停止的symbol
        //該行symbol停止編號，包含上方預掉落symbol與下方隨機symbol
        const stopSymbols = [this._topSymbols[slotLine][0], ...lineSymbols, randomSymbolID];
        return stopSymbols;
    }

    /**
     * 回傳該行隨機symbol圖案編號(要隨機產生的編號數量)
     * @param amount 要隨機產生的編號數量
     * @param slotLine 哪行slot
     * @returns 該行隨機symbol圖案編號
     */
    public getRandomLineSymbol(amount: number, slotLine: number) {
        let result: number[] = [];//要回傳的隨機編號陣列
        for (let i = 0; i < amount; i++) {
            const randomID = this.getRandomSymbolID(slotLine);
            result.push(randomID);//隨機symbolID
        }
        return result;//回傳該行隨機symbol圖案編號
    }

    /**
     * 回傳隨機symbol圖案編號
     * @param slotLine 哪行slot
     * @returns 隨機symbol圖案編號
     */
    public getRandomSymbolID(slotLine: number) {
        let randomID = 0;//隨機編號
        const random = Math.random();//隨機數
        if (random > 0.95) randomID = REEL_DATA.scatterID;
        if (slotLine === 0 || slotLine === REEL_DATA.reelPosition.length - 1) {
            randomID = Math.ceil(Math.random() * 8);// 95% 機率出現一般 symbol (1-8)
        } else {
            if (random > 0.75) {
                randomID = 8 + Math.ceil(Math.random() * 8);// 20% 機率出現特殊 symbol (9-16)
            } else {
                randomID = Math.ceil(Math.random() * 8);// 75% 機率出現一般 symbol (1-8)
            }
        }
        return randomID;
    }

    /**
     * 取得所有scatter節點位置
     * @returns scatter節點位置
     */
    public getLineScatterPos(slotLine: number) {
        const lineScatterPos: number[] = [];
        const lineSymbol = this._beginGameData.data.Cards[0][slotLine];
        lineSymbol.forEach((symbol, index) => {
            if (symbol === REEL_DATA.scatterID) {
                lineScatterPos.push(slotLine * lineSymbol.length + index);//儲存scatter節點位置
            }
        });
        return lineScatterPos;
    }
    //---------------------轉換後的表演資料---------------------


    //---------------------beginGame資料---------------------
    /**
     * 回傳該行symbol資料
     * @param line 該回合cards資料
     * @returns 該行symbol資料
     */
    public getCards(line: number) {
        return this._beginGameData.data.Cards[line];
    }

    /**
     * 回傳最後一局symbol資料
     * @returns 最後一局symbol資料
     */
    public getEndCards() {
        const cards = this._beginGameData.data.Cards;
        const endCards = cards[cards.length - 1].flat();
        return endCards;
    }

    /**
     * 回傳免費模式
     * @returns 免費模式
     */
    public getFreeMode() {
        return this._freeMode;
    }

    /**
     * 設置免費模式
     * @param freeMode 免費模式
     */
    public setFreeMode(freeMode: boolean) {
        this._freeMode = freeMode;
    }

    /**
     * 回傳是否為免費最後一局
     * @returns 是否為免費最後一局
     */
    public isFreeLastGame() {
        const { RollerNumber, FreeGameSpin } = this._beginGameData.data;
        return RollerNumber === 1 && FreeGameSpin.FreeGameTime === 0;
    }

    /**
     * 回傳增加的免費遊戲次數
     * @returns 增加的免費遊戲次數
     */
    public getAddFreeGameTime() {
        return this._beginGameData.data.FreeGame.FreeGameTime;
    }

    /**
     * 回傳剩餘的免費遊戲次數
     * @returns 剩餘的免費遊戲次數
     */
    public getFreeGameTime() {
        return this._beginGameData.data.FreeGameSpin.FreeGameTime;
    }

    /**
     * 回傳結果分數
     * @returns 贏得分數(包含Credit_End與PayTotal)
     */
    public getResultScore() {
        const { Credit_End, PayTotal, FreeGameSpin, FreeGame } = this._beginGameData.data;
        const creditEnd = Credit_End;//可用餘額更新
        const payTotal = PayTotal;//該回合贏得分數
        const freeGamePayTotal = FreeGameSpin.FreeGamePayoffTotal;//免費遊戲總贏分
        const scatterPayOff = FreeGame.FreeGamePayoffTotal;//scatter贏得分數
        return { creditEnd, payTotal, freeGamePayTotal, scatterPayOff };
    }

    /**
     * 回傳初始計算剩餘免費遊戲次數
     * @returns 初始計算剩餘免費遊戲次數
     */
    public getInitFreeGameTime() {
        const hitFreeGameTime = this.getAddFreeGameTime();//獲得免費遊戲次數
        let freeGameTime = this.getFreeGameTime();//剩餘免費次數
        if (freeGameTime >= hitFreeGameTime) {
            freeGameTime -= hitFreeGameTime;//如果剩餘免費次數大於獲得免費遊戲次數，則減去獲得免費遊戲次數
        }
        return freeGameTime;
    }

    /**
     * 回傳是否為免費hit
     * @returns 是否為免費hit
     */
    public isFreeHit() {
        return this._beginGameData.data.FreeGame.HitFree;
    }

    /**
     * 回傳scatter節點位置
     * @returns scatter節點位置
     */
    public getWinScatterPos() {
        return this._beginGameData.data.Scatter.Grids!.map(n => n - 1);
    }

    /**
     * 回傳免費遊戲贏得分數
     * @returns 免費遊戲贏得分數
     */
    // public getFreeGamePayoffTotal() {
    //     return this.beginGameData.data.FreeGameSpin.FreeGamePayoffTotal;
    // }
    //---------------------beginGame資料---------------------
}

export const g5251Model = G5251Model.getInstance();