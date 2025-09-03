export const REEL_DATA = {
    reelPosition: [
        {
            x: -396,//X軸位置
            y: 490,//最上方的symbol位置
            height: 1176//該行高度(包含非連線區的上下symbol)
            // intervalY: 196//每個symbol的間距
            //未來需要判斷水平或垂直(有些是垂直)
        },
        {
            x: -198,
            y: 490,
            height: 1176
            // intervalY: 196
        },
        {
            x: 0,
            y: 490,
            height: 1176
            // intervalY: 196
        },
        {
            x: 198,
            y: 490,
            height: 1176
            // intervalY: 196
        },
        {
            x: 396,
            y: 490,
            height: 1176
            // intervalY: 196
        }
    ],
    //symbol尺寸
    baseSymbolSize: {
        width: 196,
        height: 196
    },
    //位置ID座標分布(位置座標從0開始)，左至右(第一層)，上至下(第二層)
    symbolPosID: [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
        [16, 17, 18, 19]
    ],
    //初始化symbol圖案ID(包含頭尾顯示層id)，左至右(第一層)，上至下(第二層)
    initSymbolID: [
        [8, 8, 8, 7, 7, 7],
        [6, 9, 4, 3, 9, 6],
        [4, 10, 18, 18, 10, 3],
        [6, 9, 2, 1, 9, 6],
        [6, 6, 6, 5, 5, 5]
    ],
    //symbol總數
    symbolID: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],//總symbolID
    wildID: 17,
    scatterID: 18,
    scatterReadyAmount: 2,//scatter聽牌數量(設置幾張就要出現聽牌)
    bigWinRange: [20, 50, 100]//大獎切換範圍(贏分倍率)
    // topSymbol: ['1', '10'],
    // endShowSpine: ['1', '10'],
    // tintColor: 0xFFFFFF80
};
