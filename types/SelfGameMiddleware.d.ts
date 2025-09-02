interface SelfGameMiddleware<
    BeginGameData = any,
    AnalysisResult = any
> {
    readyOnEditor?: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<boolean>;

    gameRoot_beforeSetupReady?(): Promise<void>;

    commonEventHandler_callBeginGame?(betInfo: BetInfo): void;

    // gameStage_replaceUnits?(gameStage: import('commonJs/component/gameStage').default): Promise<void>;
    store_overwrite_loginInfo?(data: BBApi.LoginInfoData): void;

    useSymbolInfo_injectInfoObject?(symbolInfo: import('commonJs/core/useSymbolInfo').SymbolInfo): void;

    useGridSymbolAnimationInfo_overwriteSymbolConfigBeforeCheck?(param: SelfGameMiddleware.OverwriteSymbolConfigParam): void;
    useGridSymbolAnimationInfo_overwriteSymbolConfig?(symbolId: string, symbolConfig: AnimationConfig.ElementSpine, action: string): void;
    useGridSymbolAnimationInfo_overwriteSymbolConfig2?(param: SelfGameMiddleware.OverwriteSymbolConfigParam): void;

    slotReel_transformDoingReels?(
        reels: import('slotJs/components/slotReel').ReelItem[][]
    ): import('slotJs/components/slotReel').ReelItem[][];
    slotReel_doingBeforeSpin?(): Promise<void>;
    slotReel_doingBeforeStop?(): Promise<void>;
    slotReel_doingWhenStop?(): Promise<void>;
    slotReel_playSlotStartSound?(): void;
    /** 播放每一條中線時要做的事 */
    slotReel_doingWhenPlaySingleLine?(lineLink: WebSocketSlot.AnalysisResult.PayoffObject): void;
    /** 客製化 FG slotReel，採礦飛車 MG slotReel 是 3X5，FG slotReel 是 4X5 */
    slotReel_doCustomFreeSlotReel?(): Promise<void>;

    fallingBoard_crushSymbol?(line: LineLike): Promise<string[]>;
    fallingBoard_setMask_overwriteMaskSize?(rect: { x: number; y: number; w: number; h: number; }): void;
    fallingBoard_crushSymbolStopTick?(symbol: import('crushJs/components/symbol').Symbol, type?: string): Promise<void>;
    fallingBoard_playShowSpine?(symbol: import('crushJs/components/symbol').Symbol): void;

    symbol_changeSymbolSpineParent?(symbol: import('crushJs/components/symbol').Symbol): void;
    symbol_setTextBox?(symbol: import('crushJs/components/symbol').Symbol, param?: Optional<import('commonJs/components/symbol').ChangeSymbolParam>): void;

    /**
     * 檢查是不是有一部分在軸帶外面的長symbol
     * @param reelIndex 軸帶編號[0+]
     */
    slotColumn_checkLongSymbolWhenPartLongSymbol?(reelIndex: number): boolean | undefined;

    slotColumn_onReelStartTick?(slotColumn: import('slotJs/components/slotReel/slotColumn').SlotColumn): void;
    slotColumn_onStopReelStartTick?(slotColumn: import('slotJs/components/slotReel/slotColumn').SlotColumn, diff: number): void;
    slotColumn_reelTicking_onSymbolsGoTop?(slotColumn: import('slotJs/components/slotReel/slotColumn').SlotColumn, goTopCount: number): void;
    slotColumn_stopReelStopTick_beforeElasticStop?(slotColumn: import('slotJs/components/slotReel/slotColumn').SlotColumn): void;
    slotColumn_stopReelStopTick_afterElasticStop?(slotColumn: import('slotJs/components/slotReel/slotColumn').SlotColumn): void;

    symbolFrame_showFrame_filterGrids?(gris: string[]): string[];

    crushSymbolAnimation_doingFallOff?(param: SelfGameMiddleware.DoingFallOffParam): Promise<void>;

    crushSymbolAnimation_beforeFallOff?():  Promise<void>;

    waitSingleReel?(reelIndex : number): Promise<void>;

    slotReel_replaceTallyCore?(
        slotReel: import('slotJs/components/slotReel').SlotReel,
        param?: import('slotJs/components/slotReel/slotReelCore/tallyCore').TallyCoreParam
    ): import('slotJs/components/slotReel/slotReelCore/tallyCore').TallyCore;

    symbolPayTable_createContent_overwriteSymbol?(symbol: import('commonJs/components/symbol').Symbol): {
        /** 覆寫的symbolId */
        symbolId?: string;
        /** 需不需要繼承原本symbol上的TextBox */
        inheritTextBox?: boolean;
        /** 覆寫的顯示圖片名稱,ex: symbol1 */
        overWriteSpriteFrameName?:string;
    } | void;

    resultEvent_selfGameFeature_1?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_45?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_50?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_70?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_140?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_170?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_250?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_300?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_375?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_440?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_650?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_750?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_950?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_selfGameFeature_998?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;

    resultEvent_crushSymbol_beforeCrushSymbol?(addScore: () => void, param: SelfGameMiddleware.CrushSymbolParam): Promise<void>;
    resultEvent_crushSymbol_onCrushSymbol?(addScore: () => void, param: SelfGameMiddleware.CrushSymbolParam): Promise<void>;
    resultEvent_crushSymbol_afterCrushSymbol?(addScore: () => void, param: SelfGameMiddleware.CrushSymbolParam): Promise<void>;
    resultEvent_crushSymbol_beforeDropSymbol?(): Promise<void>;
    resultEvent_crushSymbol_afterDropSymbol?(): Promise<void>;
    resultEvent_crushSymbol_doingCrush?(param: SelfGameMiddleware.CrushSymbolParam): Promise<void>;

    resultEvent_runScore_changeAddScore?(originScore: number): number;

    resultEvent_freeGameEyeCatch?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_freeGameEyeCatch_onStart?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;

    resultEvent_freeGameAddTimes?(param: {
        isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>;
        addTimes: number;
        newTotalFreeTimes: number;
        newFreeSpinTimes: number;
    }): Promise<void>;

    resultEvent_freeGameSymbol?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;
    resultEvent_freeGameSymbol_onStartRun?(isBreak: import('@gt-npm/gt-lib-ts/es/utils/reactivity').Ref<Boolean>): Promise<void>;

    resultEvent_freeGameTotalWin_playEndFreeGameAnimation?(): Promise<void>;

    resultEvent_showAllLines_beforeShowAllType?(): Promise<void>;

    spineControl_start?(spineControl: import('commonJs/toolControl/spineControl').SpineControl): Promise<void>;

    /** 轉換beginGameData，會在analysisBeginGameResult的最開始執行 */
    webSocketCenter_transformBeginGameData?(beginGameData: BeginGameData): void;

    /** 分析遊戲玩法需要的資料(不分freeGame或mainGame) */
    analysisBeginGameResult_setCommonGameInfo?(result: BeginGameData, analysisResult: AnalysisResult): void;

    /** 分析聽牌 */
    analysisBeginGameResult_setTally?(result: BeginGameData, analysisResult: AnalysisResult): void;

    /** 分析需要忽略不動畫的grid */
    analysisBeginGameResult_setIgnoreGrids?(result: BeginGameData, analysisResult: AnalysisResult): void;

    /** 設定遊戲特色玩法需要的參數 */
    analysisBeginGameResult_setGameFeature?(result: BeginGameData, analysisResult: AnalysisResult): void;

    /** 根據BB的beginGame轉換beginGameData */
    webSocketBB_transformBBBeginGameData?(bbGameData: BeginGameData, resultGameData: BeginGameData): void;

    useReelCore_stopReelArrayFakePreCard?(baseArray: string[], reelIndex: number): void;
    useReelCore_stopReelArrayAddCardCheckValidSymbolId?(symbolId: string, reelIndex: number): string;

    symbolAnimation_override_generateColumnAnimationConfigs?(gridsArray: string[]): {
        ignoreGrids: Set<string>;
        needPlayColumn: import('commonJs/components/animationController/columnAnimation').ColumnAnimationConfig[];
    } | undefined;
}


declare namespace SelfGameMiddleware {
    interface OverwriteSymbolConfigParam {
        symbolId: string;
        symbolConfig: AnimationConfig.ElementSpine;
        action: string;
        grid: string;
    }

    interface CrushSymbolParam {
        allLinesPayoff: number;
        allLinesGrids: string[]
    }

    interface DoingFallOffParam {
        doingFallTop: (() => Promise<void>)[],
        doingFallBottom: (() => Promise<void>)[],
        doingFallByColumn: (() => Promise<void>)[][][]
    }
}