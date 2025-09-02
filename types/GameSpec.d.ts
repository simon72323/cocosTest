declare namespace GameSpecData {
    type UnpackSpec = {
        [K in keyof Spec]?: NonNullable<Spec[K]> extends DirectionSpec<infer U> ? U : Spec[K];
    }

    interface Spec {
        /** spine是否要預乘alpha */
        premultipliedAlpha?: boolean;

        /** 是否啟用symbol動畫物件池 */
        symbolSpinePool?: boolean;

        /** 第一個grid的值，預設是1 */
        firstGrid?: number;

        /** win跑分 */
        win?: Win;

        /** 滾軸 */
        slotReel?: Record<string, SlotReel>;

        /** 線 & 框 */
        lineAndFrame?: LineAndFrame;

        /**
         * 貼symbol動畫，轉動時
         * @目前沒用到
         */
        pasteSymbolWhenSpin?: PasteSymbolWhenSpin;

        /**
         * 貼symbol動畫，停止後
         * @目前沒用到
         */
        pasteSymbolWhenStop?: AnimationConfig.AnimationHubConfig;

        /**
         * 鎖定物件動畫
         * @目前沒用到
         */
        reelKeepSymbol?: ReelKeepSymbol;

        /**
         * longSymbol動畫呈現
         * @目前沒用到
         */
        columnAnimate?: ColumnAnimate;

        /**
         * longSymbol整軸移動
         * @目前沒用到
         */
        longSymbolMove?: LongSymbolMove;

        /**
         * 背景倍數乘倍
         * @目前沒用到
         */
        bgShowDouble?: BgShowDouble;

        /**
         * 連消乘倍
         * @目前沒用到
         */
        crushMultiple?: CrushMultiple;

        /** FG基數乘倍區塊 */
        freeGameBaseScore?: FreeGameBaseScore;

        /** symbol蒐集 */
        symbolCollect?: SymbolCollect;

        /** symbol延展 */
        expandSymbol?: ExpandSymbol;

        /** 額外得分 */
        extraCredit?: ExtraCredit;

        /** 長symbol */
        longSymbol?: LongSymbol;

        scatterSymbol?: ScatterSymbol;

        /**
         * symbolId對應的grid格數與群組
         * @note e.g. 忍者必須消(1000108)
         */
        symbolInfo?: Record<string, SymbolInfo>;

        /** 中線後準備跑分時，symbol的動畫設定 */
        runScoreSymbol?: RunScoreSymbol;

        /** 掉落區設定 */
        fallingBoard?: Record<string, FallingBoard>;

        /** show分元件設定，type1是顯示數字後往上飄淡出 */
        showScoreType1?: ShowScoreType1;

        /** show分元件設定，type2是顯示元件數量與得分後直接淡出 */
        showScoreType2?: DirectionSpec<ShowScoreType2>;

        /**
         * 強制free轉場延遲 (ms)
         *
         * 一般會在轉場動畫結束後進入/離開freeGame
         *
         * 這個設定可以自訂進入/離開freeGame的時間點
         */
        forceTransFreeGame?: ForceTransFreeGame;

        /**
         * 強制freeGame加局改變局數時間 (ms)
         *
         * 一般會在加局動畫結束後改變局數
         *
         * 這個設定可以自訂改變局數的時間點
         */
        forceAddFreeGameTimesChangeTiming?: number;

        /** bigWin門檻設定 */
        winLimit?: {
            bigWin?: number;
            megaWin?: number;
            superWin?: number;
        };

        /** 分數等級門檻設定 */
        scoreLevelLimit?: ScoreLevelLimit & {
            onlyMainGame?: (keyof ScoreLevelLimit)[];
            onlyFreeGame?: (keyof ScoreLevelLimit)[];
        };
    }

    interface ScoreLevelLimit {
        lv2?: number;
        lv3?: number;
        lv4?: number;
    }

    interface ScatterSymbol {
        /**
         * 如果scatter有分數，並且該局不是bigWin的話
         *
         * 在freeGame轉場前symbol的win表演會把scatter的分數加上
         *
         * 這時要配合表演調整加分的時間點，跟後續進freeGame的延遲
         */
        scoreDelay?: {
            /**
             * 加分前延遲(ms)
             *
             * 看分數要在win動畫的哪個時間點加
             */
            before: number;
            /**
             * 加分後延遲(ms)
             *
             * 轉場動畫會在win動畫與afterDelay結束後開始播
             *
             * 如果加分動畫比win動畫還長，就要加大此數值讓轉場延遲播放 */
            after: number;
        }

        /** freeGame得分時的動畫key(消除類才有用) */
        freeGameScoreKey?: {
            mainGame: string;
            freeGame?: string;
        }

        /** 進freeGame之前的scatter動畫key */
        freeGameSymbolKey?: {
            mainGame: string;
            freeGame?: string;
        }

        /** 播放FreeGameSymbol時是否要持續隱藏symbol(後續需要自己手動把symbol解除隱藏) */
        keepHideOnFreeGameSymbol?: boolean;
    }

    interface ForceTransFreeGame {
        enter?: number;
        leave?: ForceTransFreeGameLeave;
    }

    interface ForceTransFreeGameLeave {
        totalWin?: number;
        finish?: number;
    }

    interface ShowScoreType1 {
        /** 增加動畫開始前的delay */
        beforeDelay?: {
            normal?: number;
            scatter?: number;
        };
        /** 位置，預設 (0,0) */
        position?: Optional<Vector2>;
        /** 背景圖片 */
        bgImage?: import('commonJs/base/sprite').SpriteParams;
        /** 背景動畫 */
        bgAnimation?:  AnimationConfig.Elements;
        /** 分數文字 */
        scoreText: import('commonJs/base/label').LabelOption;
        /** 乘倍文字 */
        multipleText?: import('commonJs/base/label').LabelOption;
        /** 乘倍文字融入文字時的動畫 */
        multipleHitScoreAnimation?: AnimationConfig.Elements;
        /** 多個乘倍時，乘倍文字相融動畫 */
        multipleHitMultipleAnimation?: AnimationConfig.Elements;
    }

    interface ShowScoreType2 {
        /** 增加動畫開始前的delay */
        beforeDelay?: {
            normal?: number;
            scatter?: number;
        };
        /** 位置，預設 (0,0) */
        position?: Optional<Vector2>;
        /** 動畫 */
        animation?:  AnimationConfig.Elements;
    }

    interface GameObject {
        /**
         * symbol圖片的基準大小
         * @usage symbolPayTable的點擊區域、betLine的浮動範圍基準、掉落類的grid大小
         */
        baseSymbolSize: Size;

        /**
         * 設定的symbol會在停止時嘗試播放show動畫
         *
         * @note 呼叫createSpineSymbol時會判斷symbolId有在endShowSpine或spineSymbol裡面才執行
         */
        endShowSpine?: string[];

        /**
         * 設定的symbol在修改symbolId時會嘗試播放stay動畫
         *
         * @note 呼叫createSpineSymbol時會判斷symbolId有在endShowSpine或spineSymbol裡面才執行
         */
        spineSymbol?: string[];

        /**
         * 區塊的左右順序
         *
         * @note L>R表示左邊會蓋右邊，反之
         */
        sortDirection: 'L>R' | 'R>L';

        /**
         * symbol的縮放設定
         *
         * @note 可以設定一個數字，也可以逐reel(1+)設定
         */
        symbolScale?: number | Record<string, number>;

        /**
         * 該顯示在最上面的symbol
         *
         * @note 老虎機只會在軸帶內
         */
        topSymbol?: string[];

        /**
         * topSymbol排序
         */
        orderTopSymbol?: Record<string, number>;

        /**
         * 反灰時的symbol顏色
         *
         * default: 0x656565
         */
        tintColor?: number;
    }

    interface FallingBoard extends GameObject {
        /** 每軸的位置設定 */
        reelPosition: ReelPosition[];
        fallingConfig: FallingConfigs;
        /** symbol間是否有碰撞 */
        enableSymbolCollide: boolean;
        /**
         * 清牌的方式
         *
         * dropOut => 向下掉出
         *
         * fadeOut => 淡出
         *
         * spread => 外拋掉出 ex.連環奪寶
         *
         */
        clearType: 'dropOut' | 'fadeOut' | 'spread';
        /**
         * 清除結果牌的時機
         *
         * before => spin後先清牌才掉牌，也就是掉落區會留著上一局的結果
         *
         * after => resultEvent結束後就清牌，掉落區會是空的
         *
         */
        clearTiming: 'before' | 'after' | 'none';
        /**
         * 清牌時symbol移動的下邊界，所有symbol在移動到該位置時就是清牌結束時間
         *
         * 值為fallingBoard裡面的位置
         *
         * default: 世界座標(0, 0)
         */
        clearBoundaryY?: number;
        /** 掉落起始位置 */
        dropPositionY: number;
        /**
         * 掉落起始位置類型
         *
         * relative => symbol.y + dropPositionY ， symbol從不同高度掉落
         *
         * fixed => reel.y + dropPositionY ， symbol從相同高度掉落
         *
         * */
        dropPositionType: 'relative' | 'fixed';
        /** 掉落順序(左右) */
        dropOrderX: 'left' | 'right' | 'random';
        /** 掉落順序(上下) */
        dropOrderY: 'top' | 'bottom' | 'random';
        /**
         * 遮罩類型(只有y軸的差異，x軸都是全部顯示)
         *
         * fit => 切合整個掉落區
         *
         * hideTop => 擋住掉落區上面
         *
         * hideBottom => 擋住掉落區下面
         *
         */
        maskType: 'fit' | 'hideTop' | 'hideBottom' | 'none';
        /**
         * grid的計算方式
         *
         * column：
         *
         *        | 1 4 7 |
         *
         *        | 2 5 8 |
         *
         *        | 3 6 9 |
         * row：
         *
         *        | 1 2 3 |
         *
         *        | 4 5 6 |
         *
         *        | 7 8 9 |
         *
         */
        gridDirection: 'column' | 'row';

        /** 消除後的掉落是否不理會eachXYDelay，改為同時掉落 */
        crushDropNoXYDelay: boolean;

        /** 消除後的掉落是否不理會設定的y0座標，改為從第一個grid的上一格開始掉落 */
        crushDropStartOnTop: boolean;
    }

    interface RunScoreSymbol {
        /** 如果沒有跑分動畫的話，symbol輪播幾次後跳到下個階段 */
        loopTimes?: number;
        /** 關閉的話跑分時symbol不會跟著播動畫 */
        enable: boolean;
        /** bigWin後，symbol動畫改成用delay(ms)而不是次數 */
        bigWinRunSymbolDelay?: number;
    }

    interface GameSetting {
        mainToFreeChangeCards?: boolean;
        freeToMainChangeCards?: boolean;
        commonSymbol: number[];
        freeGameSymbol: number[];
        wildSymbol?: number[];
        freeAddTimesList?: number[];
        freeDoubleList?: number[];
        lineList?: Record<string, string[]>;
        gameType?: 'slot' | 'slotCrush' | 'crush';
        /** 總關卡數 */
        totalLevel?: number;
        /** 每關的磚頭數 */
        eachLevelBrick?: number;
        /** 切換MG/FG時更新遮罩外的symbol，symbol長度會超過1格的遊戲才有需要 */
        updateOutSideCardsWhenChangeStage?: boolean;
    }

    interface SymbolInfo {
        height: number;
        group: number;
    }

    interface ExpandSymbol {
        showOn: 'beforeFreeGame' | 'afterFreeGame';
        fullReelsAnimation?: FullReelsAnimation;
        expandAnimation: AnimationConfig.PosAnimationConfig;
    }

    interface FullReelsAnimation {
        triggerReels: string;
        config: AnimationConfig.AnimationHubConfig;
    }

    interface SymbolCollect {
        isEnable: boolean;
        symbolId: string;
        enableSceneSpine: boolean;
        levelInterval: string;
        returnPattern: string;
        maxBefore: boolean;
        hideSymbol?: boolean;
    }

    interface FreeGameBaseScore {
        landscapeY: number;
        portraitY: number;
        maxCounts: number;
        eachRowCount: number;
        rowPadding: number;
        rowItemPadding: number;
    }

    interface BgShowDouble {
        visible: boolean;
        fontName: string;
        x: number;
        y: number;
        interval: number;
        p_x: number;
        p_y: number;
        p_interval: number;
        longSize: number;
        defaultSize: number;
        letterSpacing?: number;
    }

    interface CrushMultipleWrap {
        wrapX: number;
        wrapY: number;
        backgroundImage?: string;
        textX?: number;
        textY?: number;
        fontSize: number;
        textPadding?: number | { mainGame: number; freeGame: number };
        visible?: { mainGame: boolean; freeGame: boolean };
        textLetterSpacing?: number;
        direction?: 'L' | 'P';
        order?: 'asc' | 'desc';
    }

    interface CrushMultiple extends CrushMultipleWrap {
        fontName: string;
        template?: string;
        defaultValue?: number;
        multipleArray?: number[] | { mainGame: number[]; freeGame: number[] };
        landscape?: CrushMultipleWrap;
        portrait?: CrushMultipleWrap;
    }

    interface LongSymbolMove {
        gridTime: number;
        gridDelay: number;
        ease: string;
        shakeEnter: boolean;
        shakeMove: boolean;
        shakeTime: number;
        shakefrequency: number;
        shakeLevel: number;
    }

    interface ColumnAnimate {
        columnAnimateName: string;
        hide: boolean;
        playStatus: string;
    }

    interface ReelKeepSymbol {
        gridMode: boolean;
        winShowSingle: string;
        columnMode: string;
        columnAnimationName: string;
        hideSymbol: boolean;
        winShow: string;
        priority: string;
        hideSymbolScroll: boolean;
        endMode: string;
        endTime: number;
        showTiming: string;
        key?: string;
    }

    interface PasteSymbolWhenSpin {
        shake: boolean;
        delay: number;
        randomAniSuffix: string[];
        hasHideAnimation?: boolean;
    }

    interface LineAndFrame {
        enable: boolean;
        /** 框的類型 */
        frameType: 'none' | 'image' | 'spine';
        frameImage?: string;
        aniConfig?: AnimationConfig.PosAnimationConfigWithoutDevice<LineAndFrameElements>;
        /** 中獎線輪播的類型 */
        frameAnimateType: 'line' | 'frame' | 'lineAndFrame';
        /** 秀全部中獎線的類型 */
        showAllType: 'none' | 'line' | 'frame' | 'lineAndFrame';
        tinySymbol?: ShiftConfig & {
            landscape?: ShiftConfig;
            portrait?: ShiftConfig;
        };
    }

    interface TinySymbolConfig {
        shiftX?: number;
        shiftY?: number;
    }

    interface ShiftConfig {
        shiftX?: number;
        shiftY?: number;
    }

    interface LineAndFrameElements extends AnimationConfig.Elements {
        symbolFrame: AnimationConfig.ElementSpine;
    }

    interface SlotReel extends GameObject {
        /** 是否為獨立軸帶 */
        singleReel?: boolean;
        /** 同一軸的每個column是否使用不同的軸帶位置 */
        reelColumnsWithDifferentCardIndex?: boolean;
        /** 是否將軸帶間的延遲平均分配到軸帶內每個column中 */
        reelColumnsSplitDuration?: boolean;
        spinConfig: SpinConfigs;

        reelPosition: ReelPosition[];
        /**
         * symbol上的文字樣式，symbol有額外分數時會壓在上面
         * @note e.g. 爆利金剛(1000055)
         */
        symbolText?: Text;
        /**
         * 每一軸的初始index，沒設定的話就是隨機
         * @note e.g. 虎虎虎(1000077)
         */
        initReelIndex?: Record<string, number>;
        /**
         * 滾軸群組，一般情況滾軸是一軸一軸轉，設定群組的話群組的滾軸會一起轉，起始值為1
         * @note e.g. 富貴成雙(1000073)
         */
        reelGroups?: ReelGroups;

        /** 是否使用軸帶遮罩，一般只會有整個滾軸的遮罩 */
        useColumnMask?: boolean;
        /** 軸帶遮罩設定，沒設定的話會用intervalY與baseSymbolSize計算大小來畫 */
        columnMask?: ReelMask;

        /** 是否使用滾軸區遮罩 */
        useReelMask?: boolean;
        /** 滾軸區遮罩設定，有這設定的話就會用Graphics畫遮罩，而不是嘗試拿sprite */
        reelMask?: ReelMasks;
        /** 切換MG與FG時是否要亂數取index，預設會把index改成0 */
        randomReelIndexWhenToggleFreeGame?: boolean;
    }

    interface ReelPosition {
        x: number;
        y: number;
        /** symbol間距，如果是獨立滾軸，則會是滾軸的間距 */
        intervalY: number;
        /** 如果是獨立滾軸時，滾軸的間距與symbol間距不同時才需要設定 */
        intervalSymbolY?: number;
        /** 消除類才有用，預備牌的位置 */
        prepareY?: number;
        /** 消除類才有用，預備牌的長度 */
        prepareLength?: number;
    }

    interface Text {
        fontName: string;
        size: number;
        x: number;
        y: number;
        letterSpacing?: number;
        rwdWidth?: number;
    }

    interface ReelMasks {
        mainGame: ReelMask;
        freeGame?: ReelMask;
    }

    interface ReelMask {
        width: number;
        height: number;
        x: number;
        y: number;
    }

    interface SpinConfig {
        /** 旋轉時間，即非手動停止的話過多久會自動呼叫停止 */
        spinTime?: number;
        /** 旋轉時間(MG且自動開始時) */
        autoSpinTimeMG?: number;
        /** 旋轉時間(FG且自動開始時) */
        autoSpinTimeFG?: number;
        /** 每一軸的旋轉延遲 */
        spinDuration?: number;
        /** 每一軸的停止延遲 */
        stopDuration?: number;
        /** 旋轉速度(一個symbol滾走所需的時間ms) */
        spinSpeed?: number;
        /** 彈性停止 */
        elasticStop?: boolean;
        /** 彈性停止的等級 */
        elasticLevel?: number;
        /** 自動開始時，自動開始下一局前的延遲 */
        restartDelay?: number;
        /** 是否要等前一軸呼叫停止才能執行停止(快速旋轉恆為false，因此這個設定只會影響一般模式) */
        needWaitPreStop?: boolean;
    }

    interface SpinConfigs {
        normal: SpinConfig;
        turbo?: SpinConfig;
        freeGame?: SpinConfig;
    }

    interface FallingConfig {
        /** 初速度 */
        v0?: number;
        /** 加速度 */
        gravityA?: number;
        clearDelay?: number;
        /** 地板反彈比例 */
        kRateGround?: number;
        /** symbol碰撞反彈比例 */
        kRateSymbol?: number;
        /** 每個x軸群組的掉落延遲(x相同的symbol為同一個群組) */
        eachDelayX?: number | number[];
        /** 每個y軸群組的掉落延遲(y相同的symbol為同一個群組) */
        eachDelayY?: number | number[];
        /** 自動開始時執行下一局的延遲 */
        restartDelay?: number;
    }

    interface FallingConfigs {
        normal: FallingConfig;
        turbo?: FallingConfig;
        freeGame?: FallingConfig;
    }

    interface ReelGroups {
        common?: number[][];
        mainGame?: number[][];
        freeGame?: number[][];
    }

    interface ExtraCredit {
        mainGame?: ExtraCreditByScene;
        freeGame?: ExtraCreditByScene;
        score?: ExtraCreditItem;
        collect?: ExtraCreditItem;
        collectInfo?: CollectInfo;
    }

    interface CollectInfo {
        bgSpine?: AnimationConfig.ElementSpine;
        scoreText?: Text;
    }

    interface ExtraCreditByScene {
        showCollectScore?: boolean;
    }

    interface ExtraCreditItem {
        showMode: 'single' | 'together';
        /** spine播放前收縮symbol動畫 */
        symbolScaleAnimate: boolean;
        symbolGridAnimate?: string;
        animationConfig: AnimationConfig.PosAnimationConfig;
        /**
         * 額外得分動畫大多是一道光飛到贏得分數然後加分，
         * 每個遊戲動畫時長可能不同，需要在這邊設定
         */
        scoreChangeTiming?: number;
    }

    interface LongSymbol {
        freeGame?: LongSymbolConfig[];
        mainGame?: LongSymbolConfig[];
    }

    interface LongSymbolConfigAnimationSharedConfig extends AnimationConfig.SharedConfig {
        symbol: AnimationConfig.CovertShardConfig<AnimationConfig.ElementSpine>;
    }

    interface LongSymbolConfig {
        symbolId: string;
        needLength: number;
        imageName: string;
        animation: AnimationConfig.PosAnimationConfig<LongSymbolConfigAnimationSharedConfig>;
    }

    interface ReelMask {
        width: number;
        height: number;
        x: number;
        y: number;
    }

    interface Win {
        /**
         * win動畫時間點(老虎機遊戲才有)
         *
         * beforeFeature => 在遊戲特色表演之前
         *
         * afterFeature => 在遊戲特色表演之後(非win跑分的時間點)
         *
         */
        winTiming?: 'beforeFeature' | 'afterFeature';
        /** 在遊戲特色表演之前播放bigWin後延遲時間 */
        beforeFeatureBigWinDelay?: number;
        /** win動畫設定 */
        winAnimation: AnimationConfig.Elements;
        /** win分數文字設定 */
        winScoreText: import('commonJs/base/label').LabelOption;
        /** 一般跑分動畫設定 */
        normalWinAnimation?: AnimationConfig.Elements;
        /** 一般跑分分數文字設定 */
        normalWinScoreText?: import('commonJs/base/label').LabelOption;
        /** totalWin動畫設定 */
        totalWinAnimation?: AnimationConfig.Elements;
        /** totalWin分數文字設定 */
        totalWinScoreText?: import('commonJs/base/label').LabelOption;
        /**
         * win動畫的時間軸
         * @note 時間格式為sec
         */
        winTimeline: WinTimeline;
        /**
         * win跑分時的效果音名稱map
         * - 在winTimeline裡用effectSound設定每一段動畫需要哪種效果音
         **/
        winEffectSound?: {
            score?: string;
            coin?: string;
        };
        /**
         * countEnd callback的觸發點
         * - 數字的話是時間，afterAnimation則是跑分動畫結束
         * - countEnd時預設會把分數加到可用分數裡
         * - ‼️注意‼️ 如果countEndTrigger設定得太久，導致在resultEvent執行結束後才執行的話，會有分數錯誤的情況出現
         * @note 時間格式為ms
         **/
        countEndTrigger?: {
            win?: number | 'afterAnimation';
            normal?: number | 'afterAnimation';
            totalWin?: number | 'afterAnimation';
        }
        /**
         * 跑分到目標分數後，要停留多久才把win動畫結束
         * @note 格式為ms
         **/
        endDelay?: number;
        /**
         * 跑分到目標分數後，要停留多久才把win動畫結束(skip時)
         * @note 格式為ms
         **/
        skipEndDelay?: number;
        /**
         * 跑分到目標分數後，要停留多久才把win動畫結束(非skip時)
         * @note 格式為ms
         **/
        normalEndDelay?: number;
        /**
         * bigwin跑分結束後，是否要跳過更新餘額
         * @note
         **/
        skipAddScore?: boolean;
    }

    interface ScoreText {
        y?: number;
        fontName: string;
        fontSize: number;
        rwdWidth?: number;
        spacingX?: number;
    }

    interface WinTimelineConfig<T> {
        /** 動畫的音樂名稱 */
        bgm?: string;
        /** 音樂是否loop */
        bgmLoop?: boolean;
        /**
         * 音樂播放時機
         * - countStart - 在整段動畫開始時播，每階段動畫切換時，bgm都不會改變
         * - animationPlay - 在每個階段動畫開始時播，bgm會隨著每階段動畫切換
         */
        bgmTiming?: 'countStart' | 'animationPlay';
        /** 動畫的音效名稱 */
        sound?: string;
        /** 動畫用到的效果音 */
        effectSound?: ('score' | 'coin')[];
        /**
         * 每階段的時間設定
         * @note 時間格式為sec
         */
        timeline: T;
    }

    interface WinTimeline {
        normal?: {
            /**
             * 跑分時間或延遲時間
             * @note 時間格式為sec
             */
            duration: number;
            fadeOut?: boolean;
            /**
             * 只延遲，沒有動畫與跑分數字
             *
             * 讓中線symbol播放動畫到延遲結束
             */
            justDelay?: boolean;
        };
        // totalWin?: {
        //     /**
        //      * 跑分時間
        //      * @note 時間格式為sec
        //      */
        //     duration: number;
        //     /** 動畫的音樂名稱 */
        //     bgm?: string;
        //     /** 音樂是否loop */
        //     bgmLoop?: boolean;
        //     /** 結束音效 */
        //     endSound?: string;
        //     /** 播放動畫後延遲多久才出現數字開始跑分 */
        //     startRunDelay?: number;
        // };
        totalWin?: WinTimelineConfig<{ totalWin: number; }> & {
            beforeDelay?: number;
            skipEndDelay?: number;
            normalEndDelay?: number;
            endSound?: string;
        };
        big: WinTimelineConfig<{ big: number; }>;
        mega: WinTimelineConfig<{ big: number; mega: number; }>;
        super: WinTimelineConfig<{ big: number; mega: number; super: number; }>;
    }
}
