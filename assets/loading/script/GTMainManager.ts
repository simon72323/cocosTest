import boot from '@common/h5GameTools/Boot';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { Comm, Game } from '@common/h5GameTools/GTCommEvents';
import { GameStatus, SiteType } from '@common/h5GameTools/State';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { getEventManager } from '@common/manager/EventManager';
import { Logger } from '@common/utils/Logger';
import { disWatchAll, watch } from '@common/utils/Reactivity';
import { urlHelper } from '@common/utils/UrlHelper';
import { _decorator, Component, Sprite, Node, ProgressBar, Label, screen, find } from 'cc';
import { DEV } from 'cc/env';

import { GTStyleManager } from '@/comm/scripts/manager/GTStyleManager';

import { GTLoadingCommTool as CommTool } from '@/loading/script/comm/GTLoadingCommTool';
import { GTLoadingTool, LoadType } from '@/loading/script/comm/GTLoadingTool';


/**
 * GTMainManager 類別
 *
 * 負責管理遊戲的主要流程，包括載入遊戲資源、設置適配策略、處理視窗大小變化等。
 * 此類別還負責初始化遊戲的樣式管理器和載入相關的資源。
 * 主要核心方法是 mainStep()，它負責載入遊戲資源並更新進度條。
 */
const { ccclass, property } = _decorator;

@ccclass('GTMainManager')
export class GTMainManager extends Component {
    @property(Node)
    public loadingBarNode : Node = null!;

    @property(ProgressBar)
    public loadBar : ProgressBar = null!;

    @property(Label)
    public loadPercent : Label = null!;

    @property(Node)
    public gameNode : Node = null!;

    @property(Node)
    public loadingNode : Node = null!;

    @property(Node)
    public logoNode : Node = null!;

    @property(Sprite)
    public logoSprite : Sprite = null!;

    @property(Node)
    public alertNode : Node = null!;

    @property(Node)
    public leftBG : Node = null!;

    @property(Node)
    public rightBG : Node = null!;

    @property(Node)
    public topBG : Node = null!;

    @property(Node)
    public bottomBG : Node = null!;

    private loadNode: Node = null!;
    private pubVersionNode : Node = null!;
    private gameCoreNode : Node = null!;
    private _nodeOriginY: { [uuid: string]: number } = {};


    private gameSetupReadyPromise: Promise<void> = null!;
    private resolveGameSetupReady: () => void = null!;

    private loaclHost: string = 'http://localhost:8000';
    // private testModeDomain : string = 'https://casino1.bb-in555.com/'; //開發站
    // private testDemoModeDomain : string = 'https://demo.casinovir999.net/';//測試站
    private testModeDomain : string = 'https://bbgp-game2.casinovir999.net/';//測試站
    // private testModeDomain : string = 'https://dowincasino-test.com/';//LM測試站

    private isLoadLoaclBundle : boolean = false;


    private progressMap: Map<LoadType, number> = new Map();
    private progressWeights: Map<LoadType, number> = new Map([
        [LoadType.PubVersion, 30],
        [LoadType.LoadingScene, 10],
        [LoadType.GameScene, 40],
        [LoadType.LoadingLangRes, 10],
        [LoadType.GameCoreLangRes, 10]
    ]);

    onGetControlToSettingNodeBind : (data: any) => void = null!;
    onGetSettingToBottomNodeBind : (data: any) => void = null!;
    onGetTopGameNodeBind : (data: any) => void = null!;
    onGetUnderSettingPanelNodeBind : (data: any) => void = null!;
    onRestartGameBind: () => void = null!;
    onScreenResizeBind: () => void = null!;
    onOrientationchangeBind: () => void = null!;

    public onLoad(): void {
        Logger.warn('GTMainManager onLoad');
        gtmEvent.LOADER_START();

        this.setup();
        this.setupWatcher();
        this.setupListener();
    }

    public start(): void {
        Logger.debug('GTMainManager start');
        this.mainStep();
    }

    public onDestroy(): void {
        Logger.debug('GTMainManager onDestroy');
        this.clearListener();
    }

    private async setup(): Promise<void> {
        Logger.debug('GTMainManager _setup');

        this.switchBG();
        if (CommTool.isMacRetina()) {
            window.devicePixelRatio = 1;
        }
        if (DEV) {
            urlHelper.domain = this.testModeDomain;
        }
        this.onResize();
        CommTool.judgeLang();
        boot();
        this.clearProgress();
        this.showGlobalMask(false, 0);

        // 針對16:9-16:9.4特殊的進行loadingBar位置往上移動
        if(CommTool.checkNeedRefixNode() && CommTool.canAutoFix()){
            const canvasSize = CommTool.getCanvas()!;
            const aspectRatio = canvasSize.height / canvasSize.width;
            const minRatio = 16 / 9.4;
            const maxRatio = 16 / 9;
            if(aspectRatio >= minRatio && aspectRatio < maxRatio){
                this.loadingBarNode.setPosition(this.loadingBarNode.position.x, this.loadingBarNode.position.y + CommTool.getFixY()/2);
            }
        }
    }

    private setupListener():void {
        this.onGetControlToSettingNodeBind = this.onGetControlToSettingNode.bind(this);
        this.onGetSettingToBottomNodeBind = this.onGetSettingToBottomNode.bind(this);
        this.onGetTopGameNodeBind = this.onGetTopGameNode.bind(this);
        this.onGetUnderSettingPanelNodeBind = this.onGetUnderSettingPanelNode.bind(this);
        this.onRestartGameBind = this.restartGameListener.bind(this);

        getEventManager().on(Comm.GET_CONTROLTOSETTINGNODE,this.onGetControlToSettingNodeBind);
        getEventManager().on(Comm.GET_SETTINGTOBOTTOMNODE,this.onGetSettingToBottomNodeBind);
        getEventManager().on(Comm.GET_TOPGAMENODE,this.onGetTopGameNodeBind);
        getEventManager().on(Comm.GET_UNDERSETTINGPANELNODE,this.onGetUnderSettingPanelNodeBind);
        getEventManager().on(Game.RESTART_GAME, this.onRestartGameBind);

        this.onOrientationchangeBind = () => {
            CommTool.handleWindowResize();
            setTimeout(CommTool.handleWindowResize.bind(this), 100);
        };
        this.onScreenResizeBind = () => {
            // 針對16:9的手機版行去做特別處理
            if(CommTool.checkNeedRefixNode() && CommTool.canAutoFix()){
                CommTool.setNodeFade(this.topBG, false);
                CommTool.setNodeFade(this.bottomBG, false);
            }

            this.onResize();
            setTimeout(this.onResize.bind(this), 100);
        };

        window.addEventListener('resize', this.onScreenResizeBind);
        // parent.window.addEventListener('orientationchange', this.onOrientationchangeBind);
        screen.on('window-resize',this.onScreenResizeBind, this);
    }

    private restartGameListener(): void{
        this.reLoadGame();
    }

    private setupWatcher():void {
        this.gameSetupReadyPromise = new Promise(resolve => {
            this.resolveGameSetupReady = resolve;
        });

        const disWatch = watch(()=> commonStore.storeState.gameStatus,
            (newStatus, _oldStatus) => {
                if(newStatus === GameStatus.OnGameSetupReady){
                    this.resolveGameSetupReady();
                    disWatch();
                }
            });

    }

    private async reLoadGame():Promise<void>{
        this.pubVersionNode.active = false;
        this.alertNode.active = false;
        await CommTool.setNodeFade( this.logoNode, true);

        this.showGlobalMask(false);
        this.clearProgress();
        CommTool.setNodeFade(this.loadingBarNode, true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        disWatchAll();
        this.clearListener();
        await this.alertNode.destroyAllChildren();
        await this.loadNode.destroy();
        await this.pubVersionNode.destroy();
        await this.gameCoreNode.destroy();

        await new Promise(resolve => setTimeout(resolve, 100));
        this.setupWatcher();
        this.setupListener();
        this.mainStep();
    }

    private clearListener():void{
        getEventManager().off(Game.RESTART_GAME, this.onRestartGameBind);
        getEventManager().off(Comm.GET_CONTROLTOSETTINGNODE,this.onGetControlToSettingNodeBind);
        getEventManager().off(Comm.GET_SETTINGTOBOTTOMNODE,this.onGetSettingToBottomNodeBind);
        getEventManager().off(Comm.GET_TOPGAMENODE,this.onGetTopGameNodeBind);
        getEventManager().off(Comm.GET_UNDERSETTINGPANELNODE,this.onGetUnderSettingPanelNodeBind);
        window.removeEventListener('resize', this.onScreenResizeBind);
        window.removeEventListener('orientationchange', this.onOrientationchangeBind);
        screen.off('window-resize', this.onScreenResizeBind, this);
    }

    private clearProgress():void{
        this.progressMap.set(LoadType.PubVersion, 0);
        this.progressMap.set(LoadType.LoadingScene, 0);
        this.progressMap.set(LoadType.GameScene, 0);
        this.progressMap.set(LoadType.LoadingLangRes, 0);
        this.progressMap.set(LoadType.GameCoreLangRes, 0);

        // 直接、強制地更新 UI 元件，繞過 updateLoadingBar 的檢查
        this.loadBar.progress = 0;
        this.loadPercent.string = '0%';
    }

    private onResize(){
        if( CommTool.checkNeedRefixNode() && CommTool.canAutoFix() ){
            if (this._nodeOriginY[this.loadingBarNode.uuid] === undefined) {
                this._nodeOriginY[this.loadingBarNode.uuid] = this.loadingBarNode.position.y;
            }
            let loadbarPos = this.loadingBarNode.position;
            this.loadingBarNode.setPosition(loadbarPos.x, this._nodeOriginY[this.loadingBarNode.uuid] + CommTool.getFixY()/2);
        }
        CommTool.handleWindowResize();
        CommTool.onResize();
    }

    /**
     * 主要下載流程
     */
    private async mainStep():Promise<void>{
        try {
            const downloadTime = new Date().getTime();
            const gameHash = await GTLoadingTool.GETGameHashJson(this.getGameSettingJson()); // 等待 gameHash 獲取完成
            const gameBundle = await GTLoadingTool.LoadAssetManagerBundle(this.getGameBundleURL(), gameHash); // 等待 bundle 載入完成
            const commBundle = await GTLoadingTool.LoadAssetManagerBundle('comm','');

            // 步驟 1: 先建立語言包的 Promise
            const loadingLangPromise =
             GTLoadingTool.LoadLangSource(LoadType.LoadingLangRes, gameBundle.name, urlHelper.lang, this.updateProgress.bind(this));
            const gameLangPromise = GTLoadingTool.LoadLangSource(LoadType.GameCoreLangRes, gameBundle.name, urlHelper.lang, this.updateProgress.bind(this));

            // 步驟 2: 等待兩個語言包都載入完成
            await Promise.all([loadingLangPromise, gameLangPromise]);

            // 步驟 3: 語言包載入後，才開始載入其他資源
            const loadingScenePromise = GTLoadingTool.LoadBundleByPrefabType(LoadType.LoadingScene, gameBundle.name, this.updateProgress.bind(this));
            const pubversionNodePromise = GTLoadingTool.LoadBundleByPrefabType(LoadType.PubVersion, commBundle.name, this.updateProgress.bind(this));
            const gameScenePromise = GTLoadingTool.LoadBundleByPrefabType(LoadType.GameScene, gameBundle.name, this.updateProgress.bind(this));


            // 設定蓋板遮罩
            await this.loadGlobalMask();
            await loadingScenePromise.then(Node => {
                this.loadingNode.addChild(Node);
                Node.active = true;
                this.loadNode = Node;
                CommTool.setNodeFade(this.loadingNode, true);
            });
            // 打開第一個覆蓋背景畫面
            await CommTool.setNodeFade( this.logoNode, false, 0);

            await pubversionNodePromise.then(async Node => {
                this.gameNode.addChild(Node);
                Node.active = true;
                this.pubVersionNode = Node;

                // 1. 動態 import GTStyleManager
                // const { GTStyleManager } = await import('../../comm/scripts/manager/GTStyleManager');

                // 2. 找到節點並獲取元件
                const gamePanelManagerNode = find('Canvas/gameNode/PubVersion/GamePanelManager');
                if (gamePanelManagerNode) {
                    const styleManager = gamePanelManagerNode.getComponent(GTStyleManager);
                    if (styleManager) {
                        // 3. 直接呼叫並等待換圖流程完成
                        await styleManager.updateStyle();
                    } else {
                        Logger.error('GTStyleManager component not found on GamePanelManager node!');
                    }
                } else {
                    Logger.error('GamePanelManager node not found!');
                }
            });

            await gameScenePromise.then(Node => {
                const gameNode = this.pubVersionNode!.getChildByName('Portrait')!.getChildByName('GameNode')!;
                gameNode.addChild(Node);
                Node.active = true;
                this.gameCoreNode = Node;
            });

            // 等待所有場景資源和 gameSetupReadyPromise 完成
            await Promise.all([
                Promise.all([loadingScenePromise, pubversionNodePromise, gameScenePromise]),
                this.gameSetupReadyPromise
            ]);

            gtmEvent.LOADER_GAME_ALL_RESOURCE_FINISHED?.();
            gtmEvent.LOADER_GAME_SETUP_READY(new Date().getTime() - downloadTime);

            // 針對16:9的手機版行去做特別處理
            if(CommTool.checkNeedRefixNode() && CommTool.canAutoFix()){
                CommTool.setNodeFade(this.topBG, false);
                CommTool.setNodeFade(this.bottomBG, false);
            }

            //遊戲準備完成關閉Loading頁面
            Logger.debug('GTMainManager mainStep: Game setup ready, closing loading page');
            CommTool.setNodeFade(this.loadingNode, false);
            CommTool.setNodeFade(this.loadingBarNode, false);

        } catch (error) {
            Logger.error('Failed to load game bundle or get game hash:', error);
            // 在這裡處理載入失敗的邏輯，例如顯示錯誤訊息給用戶
        }

    }

    private updateProgress(progress: number, type?: LoadType) {
        if (type !== undefined) {
            this.progressMap.set(type, progress);
        }

        let totalProgress = 0;
        for (const [loadType, weight] of this.progressWeights.entries()) {
            const progress = this.progressMap.get(loadType) || 0;
            totalProgress += (progress / 100) * weight;
        }

        this.updateLoadingBar(Math.floor(totalProgress));
    }

    public updateLoadingBar( progress: number, msg?: string):void{
        // 防止部分遊戲進度條會出現不明震盪
        if(this.loadBar.progress/ 0.01 > progress) return;
        this.loadPercent.string = msg??progress.toString() + '%';
        this.loadBar.progress = progress * 0.01;
    }

    /**
     * 抓取遊戲bundle url
     * @returns 遊戲bundle url
     */
    public getGameBundleURL(): string {
        const gameObj = CommTool.getGameTypeObject(urlHelper.gameType);
        if (!gameObj) return '';
        const gameTypeName = gameObj.name;
        return this.isLoadLoaclBundle
            ? `${this.loaclHost}/dist/${gameTypeName}/assets/${gameTypeName}`
            : `${urlHelper.domain}/bundle/assets/${gameTypeName}`;
    }

    /**
     *  抓取setting.json
     * @returns setting.json
     */
    private getGameSettingJson(): string {
        const gameObj = CommTool.getGameTypeObject(urlHelper.gameType);
        if (!gameObj) return '';
        const gameTypeName = gameObj.name;
        return this.isLoadLoaclBundle
            ? `${this.loaclHost}/dist/${gameTypeName}/src/settings.json`
            : `${urlHelper.domain}/bundle/src/settings.json?timestamp=${new Date().getTime()}`;
    }

    /**
     * 更換loading Logo
     */
    private switchBG():void{
        const isDemo = urlHelper.isDemo;
        const siteType = commonStore.storeState.siteType;

        switch (siteType) {
            case SiteType.LM:
                this.setBGLogoToLM();
                break;
            case SiteType.XC:
                this.setBGLogoToXC();
                break;
            default:
                if(isDemo){
                    this.setBGLogoToDemo();
                }else{
                    this.setBGLogoToBB();
                }
                break;
        }
    }

    private async loadGlobalMask(): Promise<void>{
        const bgs = [
            { node:this.leftBG, url:'texture/bg/bg_vague_left/spriteFrame' },
            { node:this.rightBG, url:'texture/bg/bg_vague_right/spriteFrame' },
            { node:this.topBG, url:'texture/bg/bg_vague_top/spriteFrame' },
            { node:this.bottomBG, url:'texture/bg/bg_vague_bottom/spriteFrame' }
        ];

        const gameObj = CommTool.getGameTypeObject(urlHelper.gameType);
        if (!gameObj) return;
        const gameTypeName = gameObj.name;

        for (const bg of bgs) {
            try {
                const spriteFrame = await GTLoadingTool.LoadSpriteFrameBundle(bg.url, gameTypeName);
                if (spriteFrame) {
                    bg.node!.getComponent(Sprite)!.spriteFrame = spriteFrame;
                }
            } catch (error) {
                Logger.error(`Failed to load global mask asset: ${bg.url}`, error);
            }
        }
        this.showGlobalMask(true);
    }

    private showGlobalMask(show: boolean, duration: number = 0.3):void{
        let bgs = [this.leftBG, this.rightBG, this.topBG, this.bottomBG];
        if(CommTool.checkNeedRefixNode() && CommTool.canAutoFix()){
            bgs = [this.leftBG, this.rightBG];
            this.topBG.active = false;
            this.bottomBG.active = false;
        }
        bgs.forEach(bg => {
            CommTool.setNodeFade(bg, show, duration);
        });
    }

    /**
     * 更換logo為BB
     */
    private async setBGLogoToBB():Promise<void>{
        this.logoSprite.spriteFrame = await CommTool.loadPicFromRes('BBINLoading');
    }

    /**
     * 更換logo為試玩
     */
    private async setBGLogoToDemo():Promise<void>{
        this.logoSprite.spriteFrame = await CommTool.loadPicFromRes('demoLoading2');
    }

    /**
     * 更換logo為XC
     */
    private async setBGLogoToXC():Promise<void>{
        CommTool.setBGLogoTwoPic(this.logoSprite, 'xcLoadingLand','xcLoading');
    }

    /**
     * 更換logo為LM
     */
    private async setBGLogoToLM():Promise<void>{
        CommTool.setBGLogoTwoPic(this.logoSprite, 'lmLoadingLand','lmLoadingPort');
    }

    /**
     * 提供給GameCore拿取Node的方法
     * @param msg 
     */
    private onGetControlToSettingNode(msg : any):void{
        const tempNode = find('Canvas/gameNode/PubVersion/Portrait/ControlToSettingNode');
        msg.callback(tempNode);
    }

    private onGetSettingToBottomNode(msg : any):void{
        const tempNode = find('Canvas/gameNode/PubVersion/Portrait/SettingToBottomNode');
        msg.callback(tempNode);
    }

    private onGetTopGameNode(msg : any):void{
        const tempNode = find('Canvas/gameNode/PubVersion/Portrait/TopGameNode');
        msg.callback(tempNode);
    }

    private onGetUnderSettingPanelNode(msg : any):void{
        const tempNode = find('Canvas/gameNode/PubVersion/Portrait/UnderSettingPanelNode');
        msg.callback(tempNode);
    }
}
