//遊戲內共同交互的參數
export class CGGameData {
    private static _instance: CGGameData;
    public static getInstance(): CGGameData {
        if (!CGGameData._instance) {
            CGGameData._instance = new CGGameData();
        }
        return CGGameData._instance;
    }

    public userID: number = 0;//用戶ID
    public betCreditList: number[] = [];//押注額度列表
    public touchChipID: number = 0;//點選的籌碼ID
    public touchChipPosID: number = 0;//點選的籌碼位置ID

    private constructor() {
        this.init();
    }

    /**
     * 初始化
     */
    public init() {
        this.betCreditList = [];
        this.touchChipID = 0;
        this.touchChipPosID = 0;
    }

    /**
     * 設置籌碼ID與位置ID
     */
    public setTouchChip(chipID: number, posID: number) {
        this.touchChipID = chipID;
        this.touchChipPosID = posID;
    }

    /**
     * 取得籌碼額度
     */
    public getChipCredit() {
        return this.betCreditList[this.touchChipID];
    }
}