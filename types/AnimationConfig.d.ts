declare namespace AnimationConfig {
    interface ForcedVisible {
        freeGame: string;
        mainGame: string;
    }

    interface FadeIn {
        enable: boolean;
        duration: number;
    }

    interface AnimatedSprite {
        animated?: boolean;
        framerate?: number;
        prefix: string;
        from: number;
        to: number;
    }

    interface SpineSetting {
        timeScale?: number;
        scale?: Vector2;
        angle?: number;
    }

    interface AnimationConfigBase<E extends Elements = Elements> {
        elements: E;
        postDelay?: number;
        specialContainer?: LoaderNodeType;
    }

    interface AnimationConfigWithoutDevice<E extends Elements = Elements> extends AnimationConfigBase<E> {
        pc?: undefined;
        mobile?: undefined;
        landscape?: undefined;
        portrait?: undefined;
    }

    interface PosAnimationConfigWithoutDevice<S extends SharedConfig = SharedConfig, E extends Elements = Elements> extends MakePropertyOptional<AnimationConfigBase<E>, 'elements'> {
        posType?: 'none' | 'position' | 'row' | 'column' | 'grid';
        sharedConfig?: S;
        hideSymbol?: boolean;
        keepHideSymbol?: boolean;
        hideGrids?: string;
        accordingSymbol?: boolean;
        excludeHideGrids?: string;
    }

    interface AnimationConfigWithBoth<Config extends AnimationConfigWithoutDevice> {
        elements?: undefined;
        pc: Config;
        mobile: Config | {
            landscape: Config;
            portrait?: undefined;
        } | {
            landscape?: undefined;
            portrait: Config;
        } | {
            landscape: Config;
            portrait: Config;
        };
    }
    interface AnimationConfigWithPc<Config extends AnimationConfigWithoutDevice> {
        elements?: undefined;
        pc: Config;
        mobile?: undefined;
    }

    interface AnimationConfigWithMobile<Config extends AnimationConfigWithoutDevice> {
        elements?: undefined;
        pc?: undefined;
        mobile: AnimationConfigWithBoth<Config>['mobile'];
    }

    type AnimationHubConfig<Config extends AnimationConfigWithoutDevice = AnimationConfigWithoutDevice<Elements>> =
        | Config
        | AnimationConfigWithBoth<Config>
        | AnimationConfigWithPc<Config>
        | AnimationConfigWithMobile<Config>;

    type TriggerAnimationConfig = AnimationHubConfig & {
        trigger: string;
        sync: boolean;
        zIndex: number;
        layerContainer: string;
    };

    type PosAnimationConfig<E extends SharedConfig = SharedConfig> = PosAnimationConfigWithoutDevice<E>;
    interface GridAnimationConfig<E extends SharedConfig = SharedConfig> extends PosAnimationConfig<E> {
        sharedConfig: E;
    }

    interface Elements {
        [key: `spine_${any}`]: ElementSpine;
        [key: `effectSpine_${any}`]: ElementSpine;
        [key: `pixi-particle_${any}`]: ElementPixiParticle;
        [key: `sound_${any}`]: ElementSound;
        [key: `movieClip_${any}`]: ElementMovieClip;
        [key: `text_${any}`]: ElementText;
        [key: `bg_${any}`]: ElementBg;

        [key: string]: ElementItem;
    }

    interface SharedConfig {
        [key: string]: ShardConfigItem;
    }

    type CovertShardConfig<T> = { [K in keyof T]?: T[K] };

    type ShardConfigItem =
        | CovertShardConfig<ElementPixiParticle>
        | CovertShardConfig<ElementBg>
        | CovertShardConfig<ElementImage>
        | CovertShardConfig<ElementSpine>
        | CovertShardConfig<ElementSound>
        | CovertShardConfig<ElementMovieClip>
        | CovertShardConfig<ElementText>
        | CovertShardConfig<ElementCountAnimate>
        | CovertShardConfig<ElementWildDrop>
        | CovertShardConfig<ElementWinSpine>

    type ElementItem =
        | ElementPixiParticle
        | ElementBg
        | ElementImage
        | ElementSpine
        | ElementSound
        | ElementMovieClip
        | ElementText
        | ElementCountAnimate
        | ElementWildDrop
        | ElementWinSpine

    interface ElementSound {
        type: 'sound';
        output?: boolean;
        loop?: boolean;
        time?: FromTo;
        name?: string;
        namePattern?: string;
        skipCheckStatus?: boolean;
    }

    interface ElementAnimation {
        type: string;
        output?: boolean;
        loop?: boolean;
        x?: number;
        y?: number;
        blendMode?: string;
        verticalAlign?: VerticalAlign;
        globalVertical?: boolean;
        alignGrid?: string;
        alignRow?: string;
        alignColumn?: string;
        zIndex?: number;
        time?: FromTo;
        fadeIn?: FadeIn;
        fadeOut?: FadeIn;
        accordingSymbol?: boolean;
    }

    interface ElementPixiParticleBase {
        type: 'pixi-particle';
        dataKey?: string;
        animatedSprite?: AnimatedSprite;
        loop?: boolean;
        lX?: number;
        lY?: number;
        pX?: number;
        pY?: number;
    }
    interface ElementPixiParticle extends ElementPixiParticleBase, ElementAnimation {
        type: 'pixi-particle';
    }

    interface ElementBgBase {
        type: 'bg';
        zIndex?: number;
        fadeIn?: FadeIn;
        fadeOut?: FadeIn;
        originAlpha?: number;
    }
    interface ElementBg extends ElementBgBase, ElementAnimation {
        type: 'bg';
    }

    interface ElementImageBase {
        type: 'image';
        imageName?: string;
        specialContainer?: string;
        useBgScale?: boolean;
        isTint?: boolean;
        imageScale?: number;
    }
    interface ElementImage extends ElementImageBase, ElementAnimation {
        type: 'image';
    }

    interface ElementCountAnimateBase {
        type: 'countAnimate';

        mode?: '1' | '2' | '3';
        align?: 'right' | 'left' | 'center';
        alignX?: number;
        alignY?: number;
        duration?: number;
        fontName?: string;
    }
    interface ElementCountAnimate extends ElementCountAnimateBase, ElementAnimation {
        type: 'countAnimate';
    }

    interface ElementMovieClipBase {
        type: 'movieClip';
        animatedSprite?: AnimatedSprite;
        loop?: boolean;
        spriteSpeed?: number;
        scale?: number;
    }
    interface ElementMovieClip extends ElementMovieClipBase, ElementAnimation {
        type: 'movieClip';
    }

    interface ElementTextBase {
        type: 'text';
        fontName?: string;
        thousandth?: 'true' | 'false' | 'none';
        testNum?: string;
        size?: number;
        anchorX?: number;
        anchorY?: number;
        shiftX?: { landscape?: number; portrait?: number; both?: number; };
        shiftY?: { landscape?: number; portrait?: number; both?: number; };
        spacingX?: number;
        contentPattern?: string;
        rwdWidth?: number;
        /** 強制小數位數 */
        forceRoundCount?: number;
        /** 是否為動態上升數字 */
        animationCountUp?: boolean;
        /** 數字跑動時間 */
        countUpDuration?: number;
        /** 是否需要zoomIn效果 */
        zoomIn?: boolean;
        /** zoomIn時間 */
        zoomInDuration?: number;
        /** '當成純文字，不做數字處理' */
        rawText?: boolean
    }
    interface ElementText extends ElementTextBase, ElementAnimation {
        type: 'text';
    }

    interface ElementWildDropBase {
        type: 'wildDrop';
        bounce?: boolean;
        dropTime?: number;
        delay?: number;
        sequence?: string;
        dataKey?: string;
        skinKey?: string;
        animateKey?: string;
    }
    interface ElementWildDrop extends ElementWildDropBase, ElementAnimation {
        type: 'wildDrop';
    }

    interface ElementSpineBase {
        type: 'spine' | 'effectSpine' | 'winSpine';
        dataKey?: string;
        skinKey?: string;
        animateKey?: string;
        loop?: boolean;
        aniKeyPattern?: string;
        skinKeyPattern?: string;
        specialContainer?: string;
        spineSetting?: SpineSetting;
        blockEvent?: boolean;
        enableBatch?: boolean;
        premultipliedAlpha?: boolean;
        /** 用global的預乘設定 */
        useGlobalPremultipliedAlpha?: boolean;
        cacheMode?: import('cc').sp.AnimationCacheMode;
    }
    interface ElementSpine extends ElementSpineBase, ElementAnimation {
        type: 'spine' | 'effectSpine' | 'winSpine';
    }

    interface ElementWinSpineBase {
        type: 'winSpine';
        dataKey?: string;
        skinKey?: string;
        inKey?: string;
        loopKey?: string;
        outKey?: string;
        inKeyPattern?: string;
        loopKeyPattern?: string;
        outKeyPattern?: string;
        spineSetting?: SpineSetting;
        blockEvent?: boolean;
    }
    interface ElementWinSpine extends ElementWinSpineBase, ElementAnimation {
        type: 'winSpine';
    }
}