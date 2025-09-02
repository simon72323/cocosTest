import { _decorator, Component, assetManager, screen, find, AssetManager, view, macro, sys, director, Asset, Sprite, SpriteFrame, resources, JsonAsset, Vec3 } from 'cc';
import { hierarchyMgr, loadingState } from './hierarchyMgr';
import { urlHelper } from '@common/utils/UrlHelper';
import { DEV } from 'cc/env';
import { Logger } from '@common/utils/Logger';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { gameTypes } from '../../resources/gameType';
import { SiteType } from '@common/h5GameTools/State';
const { ccclass } = _decorator;

@ccclass('loadingMgr')
export class loadingMgr extends Component {
    public onPreloadSceneCB: ((gameType: number) => void) | null = null;
    public onReadyRunSceneCB: (() => void) | null = null;
    public hierarchyMgr: hierarchyMgr = null!;
    private loaclHost: string = 'http://localhost:8000';
    private gameType : string = '';
    private gifContainer : HTMLDivElement = null!;
    private bgSprite : Sprite = null!;
    private gameHash : string = '';
    // private testModeDomain : string = 'https://casino1.bb-in555.com/'; //開發站
    private testModeDomain : string = 'https://demo.casinovir999.net/';//測試站
    private gameTypeName : string = '';
    //---本地開遊戲時是否要讀取本地遊戲bundle,否為讀取測試站的遊戲bundle
    private isLoadLoaclBundle : boolean = false;
    //---
    windowResizeBind! : (data: any) => void;
    public onLoad(): void {
        
        gtmEvent.LOADER_START();
        
        this.hierarchyMgr = find('Canvas/hierarchyMgr')!.getComponent(hierarchyMgr)!;
        this.bgSprite = find('Canvas/PubLoading/Logo')!.getComponent(Sprite)!;
        this.judgeLang();
        this.windowResizeBind = this.windowResize.bind(this);
        this.switchBG();
        if (this.isMacRetina()) {
            //@ts-ignore
            window.devicePixelRatio = 1;
            Logger.debug('This is a Mac with a Retina display.');
        } 
        if (DEV) {
            urlHelper.domain = this.testModeDomain;
        }
        
        this.onResize();
        screen.on('window-resize', ()=>{
            this.onResize();
        }, this);
        
        window.addEventListener('resize', this.windowResizeBind);
        this.getGameTypeFromUrl();
    }

    public onDestroy():void{
        window.removeEventListener('resize',this.windowResizeBind);
        screen.off('window-resize');
    }
    /**
     * 判別語系
     */
    private judgeLang():void{
        let lang = '';
        switch (urlHelper.lang) {
            case "zh_tw":
            case "zh-tw":
            case "tw":
                lang = 'tw';
                break;
            case "zh_cn":
            case "zh-cn":
            case "cn":
            case "ug":
                lang = 'cn'
                break;
            default:
                lang = 'en';
                break;
        }
        urlHelper.rawLang = lang;
        urlHelper.lang = urlHelper.identifyLang(urlHelper.rawLang, 'BB');
        urlHelper.rdaLang = urlHelper.identifyLang(urlHelper.rawLang, 'RD');
    }

    private windowResize():void{
        this.onResize();
            if(sys.platform !== sys.Platform.DESKTOP_BROWSER){
                if(!this.isPortrait()){
                    this.showPortraitGif();
                }else{
                    this.hidePortraitGif();
                }
            }
    }

    private onResize():void{
        const isDesktop = sys.platform === sys.Platform.DESKTOP_BROWSER;
        const updateAdaptResult = ()=>{
            if (isDesktop) {
                director.root!.resize(screen.windowSize.width,screen.windowSize.height);
                const w = view.getDesignResolutionSize().width;
                const h = view.getDesignResolutionSize().height;
                view.setDesignResolutionSize(w,h,view.getResolutionPolicy());
                view.emit('canvas-resize');
                view.emit('design-resolution-changed');
            }
        };

        if (!isDesktop) {
            view.setOrientation(macro.ORIENTATION_PORTRAIT);
        }
        updateAdaptResult();
    }
    
    /**
     * 讀取遊戲bundle
     */
    private loadGameBundle(): void {
        Logger.debug('LoadGameLoadingBundle');
        let url = this.getGameBundleURL();
        const state = loadingState.GameLoading;
        this.loadLoading(url, state);
    }
    /**
     * 抓取遊戲的hash值
     */
    public async loadGameHash(){
        await fetch(this.getGameSettingJson())
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch JSON: ' + response.statusText);
            }
            return response.json(); // 解析 JSON 内容
        })
        .then((jsonData) => {
            Logger.debug('Loaded JSON Data:', jsonData);

            // 读取 JSON 中的某个字段
            const value:string = jsonData.assets.bundleVers[this.getGameNameStr()];
            this.gameHash = value;
            Logger.debug('Value of exampleKey:', value);
            this.loadGameBundle();
        })
        .catch((err) => {
            console.error(err);
        });
    }
    /**
     * 抓取遊戲bundle url
     * @returns 遊戲bundle url
     */
    public getGameBundleURL() {
        let url = '';
        if(this.isLoadLoaclBundle){
            url = `${this.loaclHost}/dist/${this.getGameNameStr()}/assets/${this.getGameNameStr()}`;
        }else{
            url = `${urlHelper.domain}/bundle/assets/${this.getGameNameStr()}`
        }
        return url;

    }
    /**
     *  抓取setting.json
     * @returns setting.json
     */
    private getGameSettingJson():string{
        let url = '';
        if(this.isLoadLoaclBundle){
            url = `${this.loaclHost}/dist/${this.getGameNameStr()}/src/settings.json`;
        }else{
            url = `${urlHelper.domain}/bundle/src/settings.json?timestamp=${new Date().getTime()}`;
        }
        return url;

    }

    /**
     * 讀取公版bundle
     */
    public async loadPubVersionScene(): Promise<void> {
        const url = 'comm';
        const state = loadingState.pubVersion;
        this.gameTypeName = this.getGameTypeFromResource(this.getGameType());
        this.loadPubversion(url, state);
    }
    /**
     * 遊戲背景圖讀取完成CB
     */
    public gameBGLoadingComplete():void{
        this.hierarchyMgr.loadGameLoadingLangSource(`${this.getGameNameStr()}`,urlHelper.lang);
    }
    /**
     * 設置gameType
     */
    public setGameType(num : string):void{
        this.gameType = num;
    }
    /**
     * 取得gameType
     */
    public getGameType():string{
        return this.gameType;
    }
    /**
     * 依gameType取得遊戲名稱
     */
    public getGameNameStr():string{
        return this.gameTypeName;
    }
    /**
     * 讀取PubVersion Bundle
     * @param url 
     * @param state 
     */
    private loadPubversion(url: string, state: number): void {
        this.pubLoadBundle(url).then(
            () => {
                Logger.debug('Pubversion 讀取成功');
                if (this.onPreloadSceneCB) {
                    this.onPreloadSceneCB(state);
                }
                this.scheduleOnce(()=>{
                    this.loadAssetFromBundle('textures/gif/portrait','comm');
                },0.2);
                
            }
        ).catch(err => { alert(err + ': Pubversion') });
    }
    
    private getGameTypeFromResource(gameType: string):string{
        let name = 'undefind';
        gameTypes.forEach((data)=>{
            if(data.type == gameType){
                name = data.name;
                return name;
            }
        });
        return name;
    }

    /**
     * 讀取Loading Bundle
     * @param url 
     * @param state 
     */
    private loadLoading(url: string, state: number): void {
        this.loadBundle(url).then(
            () => {
                Logger.debug(`遊戲bundle 讀取成功`);
                if (this.onPreloadSceneCB) {
                    this.onPreloadSceneCB(state);
                }
            }
        ).catch(err => {
            alert(err + ': Gamebundle')
        });
    }
  
    /**
     * 讀取公版bundle
     * @param url 
     */
    private async pubLoadBundle(url: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(url, (err: Error | null, bundle: AssetManager.Bundle) => {
                if (err) {
                    reject(err)
                }
                resolve(bundle)
            });
        });
    }

    /**
     * 讀取bundle,有帶hash值
     * @param url 
     */
    private async loadBundle(url: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(url,{version : this.gameHash}, (err: Error | null, bundle: AssetManager.Bundle) => {
                if (err) {
                    reject(err)
                }
                resolve(bundle)
            });
        });
    }

    /**
     * 取得gameType從URL
     */
    private getGameTypeFromUrl():void{
        let currentUrl = window.location.href;
        const params = new URLSearchParams(new URL(currentUrl).search);

        // 確認是否有 GameType 並取得值
        if (params.has("GameType")) {
            const gameType = params.get("GameType")!;
            this.setGameType(gameType);
            Logger.debug("GameType 存在，其值為:", gameType);
        } else {
            Logger.warn("GameType 不存在");
        }
    }
    
    /**
     * 創建一個gif檔塞在html上
     * @param src gif檔路徑
     */
    private createPortraitTipGif(src : string):void{
        // 創建一個新的 div 元素
        this.gifContainer = document.createElement('div');

        // 設置 div 的樣式，例如絕對定位，大小和位置
        this.gifContainer.style.position = 'fixed';
        this.gifContainer.style.top = '50%'; // 可根據需要調整位置
        this.gifContainer.style.left = '50%';
        this.gifContainer.style.transform = 'translate(-50%, -50%)'; // 使用 transform 來置中
        this.gifContainer.style.width = '100%'; // 設置寬度
        this.gifContainer.style.height = '100%'; // 設置高度
        this.gifContainer.style.backgroundColor = 'black'; // 設定底圖顏色（例如黑色）
        this.gifContainer.style.pointerEvents = 'none'; // 設置為非交互性，避免影響遊戲操作
        this.gifContainer.style.overflow = 'visible';
        this.gifContainer.style.backgroundPosition = 'center';

        // 創建 img 標籤並加載 GIF 圖片
        const gifImage = document.createElement('img');
        gifImage.src = src; // 替換為 GIF 的路徑
        gifImage.style.width = '100%'; // 讓圖片充滿 div
        gifImage.style.height = '100%';
        gifImage.style.objectFit = 'contain';

        // 將 img 添加到 div
        this.gifContainer.appendChild(gifImage);

        // 將 div 插入到頁面的 body 中
        document.body.appendChild(this.gifContainer);

        this.hidePortraitGif();
    }
    /**
     * 秀出提示'請翻轉手機'
     */
    private showPortraitGif():void{
        // 顯示 GIF
        if(this.gifContainer){
            this.gifContainer.style.display = 'block';
        }
    }
    /**
     * 關閉提示'請翻轉手機'
     */
    private hidePortraitGif():void{ 
        // 隱藏 GIF
        if(this.gifContainer){
            this.gifContainer.style.display = 'none';
        }
    }

    /**
     * 從bundle讀取Asset
     * @param url 
     * @param bundleName 
     * @returns 
     */
     private async loadAssetFromBundle(url : string,bundleName : string): Promise<Asset> {
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(bundleName)!;
            bundle.load(url,Asset, (err, asset)=>{
                if(err){
                    Logger.error(`load ${url} fail~~~!`);
                    reject(err)
                }
                if (err) {
                    reject(err)
                }
                this.createPortraitTipGif(asset.nativeUrl);
                resolve(asset)
            });
        });
    }
    /**
     * 判斷是否直屏
     */
    private isPortrait() {
        return window.innerHeight > window.innerWidth;
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
    /**
     * 更換logo為試玩
     */
    private async setBGLogoToDemo():Promise<void>{
        this.bgSprite.spriteFrame = await this.loadPicFromRes('demoLoading');
    }
    /**
     * 更換logo為XC
     */
    private async setBGLogoToXC():Promise<void>{
        this.setBGLogoTwoPic('xcLoadingLand','xcLoading');
    }
    
    /**
     * 更換logo為LM
     */
     private async setBGLogoToLM():Promise<void>{
        this.setBGLogoTwoPic('lmLoadingLand','lmLoadingPort');
    }

    /**
     * 更換logo為有兩張，直板與橫版的
     */
     private async setBGLogoTwoPic(landPicStr : string,portPicStr : string):Promise<void>{
        const canvas = document.getElementsByTagName('canvas')[0];
        const imageWidth = 1920;//最小寬度
        if (canvas.width > canvas.height) {
            // 橫板
            this.bgSprite.spriteFrame = await this.loadPicFromRes(landPicStr);
            const resizeWidth = Math.max((canvas.width * (1920 / canvas.height)), imageWidth);
            const scale = new Vec3(resizeWidth / imageWidth, resizeWidth / imageWidth, 1);
            this.bgSprite.node.setScale(scale);
        }else{
            // 直板
            this.bgSprite.spriteFrame = await this.loadPicFromRes(portPicStr);
        }
    }

    /**
     * 更換logo為BB
     */
     private async setBGLogoToBB():Promise<void>{
        this.bgSprite.spriteFrame = await this.loadPicFromRes('BBINLoading');
    }
    /**
     * 判斷目前螢幕是否mac retina
     * @returns 是否mac retina
     */
    private isMacRetina() {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isRetina = window.devicePixelRatio > 1;
    
        return isMac && isRetina;
    }

    private async loadPicFromRes(picName : string):Promise<SpriteFrame>{
        return new Promise((resolve, reject) => {
            resources.load(`texture/logo/${picName}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
                if(err){
                    Logger.error(`load logoPic fail~~~!`);
                    reject(err)
                }
                if (err) {
                    reject(err)
                }
                resolve(spriteFrame)
            });
        });
    }
}

