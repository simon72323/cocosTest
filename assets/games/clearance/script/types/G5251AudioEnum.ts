/**
 * 音效名稱
 */
export enum G5251AudioName {
    //背景音
    BgmMg = "bgm_mg",//一般遊戲
    BgmFg = "bgm_fg",//免費遊戲

    //按鈕音效
    BtnSpin = "btn_spin",//spin按下
    BtnClick = "btn_click",//按鈕點擊
    BtnEnd = "btn_end",//按鈕結束

    //輪軸表演
    ReelStop = "reel_stop",//輪軸停止單行
    ReelStopTurbo = "reel_stop_turbo",//輪軸停止(閃電模式)
    ReelDrop = "reel_drop",//輪軸掉落
    ReelReady = "reel_ready",//輪軸聽牌
    ReelTotalWin = "reel_totalWin",//輪軸總贏得
    ReelWin = "reel_win",//輪軸贏得

    //symbol音效
    SymbolHit = "symbol_hit",//symbol擊中
    SymbolWin = "symbol_win",//symbol贏得
    SymbolWinTurbo = "symbol_win_turbo",//symbol贏得(閃電模式)
    SymbolDrop = "symbol_drop",//symbol掉落
    ScatterHit = "scatter_hit",//scatter擊中
    ScatterGet = "scatter_get",//scatter獲得

    //倍率提升
    MultipleUp = "multiple_up",//基礎倍率亮起
    MultipleUp1 = "multiple_up1",//第一階段倍率亮起
    MultipleUp2 = "multiple_up2",//第二階段倍率亮起
    MultipleUp3 = "multiple_up3",//第三階段倍率亮起
    MultipleChangeFg = "multiple_change_fg",//免費遊戲倍率切換

    //免費遊戲相關
    FgTrigger = "fg_trigger",//獲得免費遊戲
    FgRetrigger = "fg_retrigger",//再次獲得免費遊戲
    FgFinished = "fg_finished",//免費遊戲結束

    //大獎與免費遊戲總贏得
    WinBig = "win_big",//bigWin
    WinMega = "win_mega",//megaWin
    WinSuper = "win_super",//superWin
    WinCount = "win_count",//大獎跑分
    WinImpact = "win_impact",//大獎切換
    WinStop = "win_stop",//大獎結束
    WinTotal = "win_total",//免費遊戲總贏得
}