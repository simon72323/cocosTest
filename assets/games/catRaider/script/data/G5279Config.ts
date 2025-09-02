import { Vec3 } from "cc";

// 时间配置接口
export interface G5279TimeConfig {
    chrMoveTime: number;
    waitNextLineTime: number;
    symbolDropTime: number;
    symbolDownTime: number;
    groundDropTime: number;
    groundUpTime: number;
    ratCollectTime: number;
    ratScoreWaitTime: number;
    chanceSlotTime: number;
    itemShowTime: number;
    waitBombTime: number;
    floorDropTime: number;
    bonusGameTime: number;
    totalWinShowTime: number;
    zombiePartyTime: number;
}

export const G5279Config = {
    bundleName: 'catRaider',

    // 静态配置 - 位置和尺寸
    reelPos: [
        Array(25).fill(null).map((_, i) =>
            new Vec3(108 + (i % 5) * 216, 108 + Math.floor(i / 5) * 216, 0)
        ),
        Array(36).fill(null).map((_, i) =>
            new Vec3(108 + (i % 6) * 216, 108 + Math.floor(i / 6) * 216, 0)
        ),
        Array(49).fill(null).map((_, i) =>
            new Vec3(108 + (i % 7) * 216, 108 + Math.floor(i / 7) * 216, 0)
        ),
        Array(64).fill(null).map((_, i) =>
            new Vec3(108 + (i % 8) * 216, 108 + Math.floor(i / 8) * 216, 0)
        )
    ],

    // defaultRates: {
    //     '11': 0.1, '12': 0.2, '13': 0.3, '14': 0.4, '15': 0.5, '16': 1, '17': 5, '18': 10,
    //     '21': 0.05, '22': 0.15, '23': 0.25, '24': 0.3, '25': 0.45, '26': 0.8, '27': 3, '28': 5,
    //     '31': 0.05, '32': 0.1, '33': 0.2, '34': 0.25, '35': 0.4, '36': 0.6, '37': 1.5, '38': 3,
    //     '41': 0.05, '42': 0.1, '43': 0.15, '44': 0.2, '45': 0.3, '46': 0.5, '47': 1, '48': 2,
    //     '111': 2, '112': 5, '113': 10, '114': 15, '115': 25, '116': 50, '117': 100, '118': 500, '119': 1000, '120': 3000,
    // },

    // symbol尺寸
    baseSymbolSize: {
        width: 216,
        height: 216
    },

    // 初始化symbol圖案ID
    initSymbolID: [
        [1, 41, 41, 41, 2, 31, 31, 31, 31, 31, 51, 52, 53, 54, 55, 21, 21, 21, 21, 21, 3, 11, 11, 11, 4],
        [1, 41, 41, 41, 2, 41, 31, 31, 31, 31, 31, 31, 51, 52, 53, 54, 55, 51, 21, 21, 21, 21, 21, 21, 3, 11, 11, 11, 4, 11, 41, 41, 41, 41, 41, 41],
        [1, 41, 41, 41, 2, 41, 41, 31, 31, 31, 31, 31, 31, 31, 51, 52, 53, 54, 55, 51, 52, 21, 21, 21, 21, 21, 21, 21, 3, 11, 11, 11, 4, 11, 11, 41, 41, 41, 41, 41, 41, 41, 31, 31, 31, 31, 31, 31, 31],
        [1, 41, 41, 41, 2, 41, 41, 41, 31, 31, 31, 31, 31, 31, 31, 31, 51, 52, 53, 54, 55, 51, 52, 53, 21, 21, 21, 21, 21, 21, 21, 21, 3, 11, 11, 11, 4, 11, 11, 11, 41, 41, 41, 41, 41, 41, 41, 41, 31, 31, 31, 31, 31, 31, 31, 31, 21, 21, 21, 21, 21, 21, 21, 21],
    ],
    bigWinRange: [10, 30, 50, 100, 150],//大獎切換範圍(贏分倍率)

    // 默认时间配置
    timeConfig: {
        chrMoveTime: 150,//角色移動時間
        waitNextLineTime: 400, //等待下一條線時間(角色分數停留時間)
        symbolDropTime: 500, //symbol新盤面掉落時間
        symbolDownTime: 500, //symbol盤面下移時間
        groundDropTime: 1000, //地面掉落時間
        groundUpTime: 800, //地面上升時間
        ratCollectTime: 800, //老鼠蒐集寶石時間
        ratScoreWaitTime: 500, //老鼠分數顯示等待時間
        chanceSlotTime: 750, //機會卡轉動時間
        itemShowTime: 800, //item獲得顯示時間
        waitBombTime: 270, //等待炸彈特效出現時間
        floorDropTime: 250, //地板蓋下時間
        bonusGameTime: 3000, //bonus顯示時間
        zombiePartyTime: 3000, //殭屍派對顯示時間
        totalWinShowTime: 3000, //totalWin顯示時間(不受加速影響)
    } as G5279TimeConfig
}
