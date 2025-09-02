import { _decorator, Component, Node, find, assetManager, Prefab, instantiate, Label, ProgressBar, SpriteFrame, Sprite} from 'cc';
import { loadingMgr } from './loadingMgr';
import { disWatchAll, watch } from '@common/utils/Reactivity';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { urlHelper } from '@common/utils/UrlHelper';
import { Logger } from '@common/utils/Logger';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { NumberUtils } from '@common/utils/NumberUtils';
import { GameStatus } from '@common/h5GameTools/State';
import { Comm, Game } from '@common/h5GameTools/GTCommEvents';
import { getEventManager } from '@common/manager/EventManager';

const { ccclass, property } = _decorator;
export enum loadingState {
    pubVersion = 0,
    GameLoading = 1,
    Game = 2
}
@ccclass('hierarchyMgr')
export class hierarchyMgr extends Component {
    @property(Node)
    public loadBarNode : Node = null!;
    public loadingMgr: loadingMgr = null!;
    private gameNode: Node = null!;
    private addSceneNode: Node = null!;
    private pubVersionNode: Node = null!;
    private loadingNode: Node = null!;
    private loadinglabel: Label = null!;
    private loadingBar: ProgressBar = null!;
    private leftBg : Node = null!;
    private rightBg : Node = null!;
    private topBg : Node = null!;
    private bottomBg : Node = null!;
    private bgLeft : boolean = false;
    private bgRight : boolean = false;
    private bgTop : boolean = false;
    private bgBottom : boolean = false;
    private pubLoadingNode : Node = null!;
    private gameLoadingNode : Node = null!;
    private loadingGameProgressNum : number = 0;
    private gameLangProgressNum : number = 0;
    private loadingPagePressNum : number = 0;
    private pubProgressNum : number = 0;

    private pubVersionDLTime : number = 0;
    private loadSceneDLTime : number = 0;
    private gameSceneDLTime : number = 0;

    onGetControlToSettingNodeBind! : (data: any) => void;
    onGetSettingToBottomNodeBind! : (data: any) => void;
    onGetTopGameNodeBind! : (data: any) => void;
    onGetUnderSettingPanelNodeBind! : (data: any) => void;
    public onLoad(): void {
        this.loadingMgr = find('Canvas/loadingMgr')!.getComponent(loadingMgr)!;
        this.pubLoadingNode = find('Canvas/PubLoading')!;
        this.loadingBar = this.loadBarNode.getChildByName('loadBar')!.getComponent(ProgressBar)!;
        this.loadinglabel =  this.loadBarNode.getChildByName('labelPercent')!.getComponent(Label)!;
        this.loadingMgr.onPreloadSceneCB = this.onPreloadSceneCB.bind(this);
        this.onGetControlToSettingNodeBind = this.onGetControlToSettingNode.bind(this);
        this.onGetSettingToBottomNodeBind = this.onGetSettingToBottomNode.bind(this);
        this.onGetTopGameNodeBind = this.onGetTopGameNode.bind(this);
        this.onGetUnderSettingPanelNodeBind = this.onGetUnderSettingPanelNode.bind(this);
        this.setListenerToGetNode();
    }
    public start(): void {
        this.startLoadPubVersionBundle();
    }

    /**
     * 開始讀取公版bundle
     **/
    public startLoadPubVersionBundle(): void {
        const disWatch = watch(
            () => commonStore.storeState.gameStatus,
            (newStatus, oldStatus) => {
                if(newStatus === GameStatus.OnGameSetupReady){
                    gtmEvent.LOADER_GAME_SETUP_READY(NumberUtils.accAdd(NumberUtils.accAdd( this.pubVersionDLTime, this.loadSceneDLTime), this.gameSceneDLTime));
                    this.closeloadingPage();
                    disWatch();
                }
            }
        );
        //監聽重新連線
        getEventManager().on(Game.RESTART_GAME,()=>{
            this.reLoadGame();
        });
        this.loadingMgr.loadPubVersionScene();
    }
    /**
     * 開始讀取遊戲的bundle
     **/
    public startLoadGameBundle(): void {
        this.addSceneNode = find('Canvas/PubVersion/Portrait/GameNode')!;
        this.gameLoadingNode = find('Canvas/PubVersion/Portrait/loadingNode')!;
        this.loadingMgr.loadGameHash();
    }
    /**
     * 開始讀取遊戲prefab
     */
    public startLoadGamePrefab(): void {
        this.onPreloadSceneCB(loadingState.Game);
    }
    /**
     * 讀取場景
     **/
    private onPreloadSceneCB(state: number): void {
        let prefabNode;
        const sceneNode = find(`Canvas`)!;
        switch (state) {
            case loadingState.pubVersion:
                //讀取公版prefab加至場景
                prefabNode = this.getPrefab('prefab/PubVersion', 'comm')!.then(
                    Node => {
                        sceneNode.addChild(Node);
                        Node.setSiblingIndex(3);
                        Node.active = true;
                        this.pubVersionNode = Node;
                        //開始讀取遊戲bundle
                        this.startLoadGameBundle();

                        gtmEvent.LOADER_PUBVERSION_FINSHED(this.pubVersionDLTime);
                    }
                ).catch(err => { alert(err + '-onPreloadSceneCB pubVersion') });

                break;
            case loadingState.GameLoading:
                //從遊戲bundle取得loadingScene prefab
                prefabNode = this.getPrefab(`prefab/loadingScene`, this.loadingMgr.getGameNameStr()).then(
                    Node => {
                        Node.active = false;
                        this.gameLoadingNode.addChild(Node);
                        this.loadingNode = Node;
                        this.getGameBg();
                        getEventManager().emit('UPDATE_STYLE_RESOURCE');
                        
                        gtmEvent.LOADER_LOADINGSCENE_FINSHED(this.loadSceneDLTime);
                    }
                ).catch(err => { alert(err + '-onPreloadSceneCB luckyLoading') });
                break;
            case loadingState.Game:
                //從遊戲bundle取得gameScene prefab
                prefabNode = this.getPrefab(`prefab/gameScene`, `${this.loadingMgr.getGameNameStr()}`).then(
                    Node => {
                        this.gameNode = Node;
                        const bundleName = `${this.loadingMgr.getGameNameStr()}`;
                        const lang = urlHelper.lang;
                        this.loadGameLangSource(bundleName,lang);

                        gtmEvent.LOADER_GAMESCENE_FINSHED(this.gameSceneDLTime);
                    }
                ).catch(err => { alert(err + '-onPreloadSceneCB GameLoading') });
                break;
            default:
                Logger.debug('unknow gameType');
                break;
        }

    }
    /**
     * 關閉公版ＵＩ與公版讀取頁，開啟遊戲讀取頁並讀取遊戲prefab
     */
    public closePubLoading(): void {
        const pubNode = find('Canvas/PubVersion');
        if (pubNode){
            pubNode.active = true;
        }
        if (this.pubLoadingNode){
            this.pubLoadingNode.active = false;
        }
        this.activeGameLoadingNode();
        this.startLoadGamePrefab();
    }
    /**
     * 刪除遊戲node,重新跑抓bundle流程開啟遊戲
     */
    public reLoadGame():void{
        disWatchAll();
        this.clearListener();
        this.resetLoading();
        this.pubVersionNode.destroy();
        this.loadingNode.destroy();
        this.gameNode.destroy();
        this.setListenerToGetNode();
        this.pubLoadingNode.active = true;
        this.showLoadingNode();
        //開始讀取遊戲bundle
        this.startLoadPubVersionBundle();
    }

    public setLoadingBar():void{
        let sum = this.pubProgressNum + this.loadingPagePressNum + this.loadingGameProgressNum + this.gameLangProgressNum;
        this.loadinglabel.string = sum.toString() + '%';
        this.loadingBar.progress = sum * 0.01;
    }
    /**
     * 當語系資源讀取完成,掛上遊戲節點使之開始init
     */
    private gameLangLoadComplete():void{
        gtmEvent.LOADER_GAME_ALL_RESOURCE_FINISHED?.();

        this.addSceneNode.addChild(this.gameNode);
        this.gameNode.active = true;
    }
    /**
     * 重置
     */
    private resetLoading():void{
        this.loadingGameProgressNum = 0;
        this.gameLangProgressNum = 0;
        this.loadingPagePressNum = 0;
        this.pubProgressNum = 0;
        this.leftBg.active = false;
        this.rightBg.active = false;
        this.topBg.active = false;
        this.bottomBg.active = false;
    }

    /**
     * 開啟遊戲Loading頁
     */
    private activeGameLoadingNode():void{
        this.loadingNode.active = true;
    }

    /**
     * 關閉遊戲Loading頁，開啟公版ＵＩ
     */
    private closeloadingPage(): void {
        this.loadingNode.active = false;
        this.closeLoadingNode();
        // this.pubVersionNode.active = true;
    }

    /**
     * 取得prefab
     * @param bundleName
     */
    private async getPrefab(prefabPath: string, bundleName: string): Promise<Node> {
        const bundle = assetManager.getBundle(bundleName);
        let startTime = new Date();
        return new Promise((resolve, reject) => {
            if (bundle) {
                bundle.load(prefabPath, Prefab,
                    (finished, total, item) => {
                        let loadingNum = 0;
                        switch (prefabPath) {
                            case 'prefab/gameScene':
                                this.gameSceneDLTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
                                loadingNum = Math.floor((finished / total) * 70);
                                this.loadingGameProgressNum = Math.max(this.loadingGameProgressNum, loadingNum);
                                break;
                            case 'prefab/loadingScene':
                                this.loadSceneDLTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
                                loadingNum = Math.floor((finished / total) * 5);
                                this.loadingPagePressNum = Math.max(this.loadingPagePressNum, loadingNum);
                                break;
                            case 'prefab/PubVersion':
                                this.pubVersionDLTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
                                loadingNum = Math.floor((finished / total) * 10);
                                this.pubProgressNum = Math.max(this.pubProgressNum, loadingNum);
                                break;
                            default:
                                break;
                        }
                        this.setLoadingBar();
                    }, function (err, prefab) {
                        if (err) {
                            reject(err)
                        }
                        let newNode = instantiate(prefab);
                        resolve(newNode)
                    });
            }
        });
    }

    /**
     * 取得遊戲背景圖
     */
    private getGameBg():void{
        if(this.bgLeft && this.bgRight && this.bgTop && this.bgBottom){
            this.setBG();
            return;
        }
        const bgNode = this.node.parent!.getChildByName('BG')!;
        this.loadSpriteFromBundle('texture/bg/bg_vague_left/spriteFrame',`${this.loadingMgr.getGameNameStr()}`).then((data)=>{
            if (data) {
                this.leftBg = bgNode.getChildByName('BG_LEFT')!;

                this.leftBg.getComponent(Sprite)!.spriteFrame = data;
                this.bgLeft = true;
                this.checkBGDownLoad();
            }
        });
        this.loadSpriteFromBundle('texture/bg/bg_vague_right/spriteFrame',`${this.loadingMgr.getGameNameStr()}`).then((data)=>{
            if (data) {
                this.rightBg = bgNode.getChildByName('BG_RIGHT')!;
                this.rightBg.getComponent(Sprite)!.spriteFrame = data;
                this.bgRight = true;
                this.checkBGDownLoad();
            }
        });
        this.loadSpriteFromBundle('texture/bg/bg_vague_bottom/spriteFrame',`${this.loadingMgr.getGameNameStr()}`).then((data)=>{
            if (data) {
                this.bottomBg = bgNode.getChildByName('BG_BOTTOM')!;
                this.bottomBg.getComponent(Sprite)!.spriteFrame = data;
                this.bgBottom = true;
                this.checkBGDownLoad();
            }
        });
        this.loadSpriteFromBundle('texture/bg/bg_vague_top/spriteFrame',`${this.loadingMgr.getGameNameStr()}`).then((data)=>{
            if (data) {
                this.topBg = bgNode.getChildByName('BG_TOP')!;
                this.topBg.getComponent(Sprite)!.spriteFrame = data;
                this.bgTop = true;
                this.checkBGDownLoad();
            }
        });
    }
    /**
     * 設置背景圖,塞至html
     */
    private setBG():void{
        if(this.bgLeft && this.bgRight && this.bgTop && this.bgBottom){
            //背景讀取完成
            this.loadingMgr.gameBGLoadingComplete();
            this.leftBg.active = true;
            this.rightBg.active = true;
            this.topBg.active = true;
            this.bottomBg.active = true;
        }
    }


    /**
     * 確認遊戲背景圖讀取完成
     */
    private checkBGDownLoad():void{
        if(this.bgLeft && this.bgRight && this.bgTop && this.bgBottom){
            this.setBG();
        }
    }

    /**
     * 從bundle讀取圖
     * @param url
     * @param bundleName
     * @returns
     */
     private async loadSpriteFromBundle(url : string,bundleName : string): Promise<SpriteFrame> {
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(bundleName)!;
            bundle.load(url,SpriteFrame, (err, spriteFrame)=>{
                if(err){
                    Logger.error(`load ${url} fail~~~!`);
                    reject(err)
                }
                if (err) {
                    reject(err)
                }
                resolve(spriteFrame)
            });
        });
    }
    /**
     * 依語系從bundle讀取loading頁語系圖資源
     * @param bundleName 遊戲bundle
     * @param lang 語系
     * @returns
     */
    public async loadGameLoadingLangSource(bundleName : string,lang : string):Promise<void>{
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(bundleName)!;
            bundle.loadDir(`langResources/loadingPage/${lang}`,null,(finished, total, item)=>{

            }, (err, data)=>{
                if(err || !data.length){
                    Logger.error(`loading page ${lang} data fail~~~!`);
                    Logger.error(`start load en lang`);
                    if (lang !== 'en') {
                        this.loadGameLoadingLangSource(bundleName,'en');
                    } else {
                        this.closePubLoading();
                    }
                    return;
                }
                this.closePubLoading();
            });
        });
    }
    /**
     * 依語系從bundle讀取遊戲語系圖資源
     * @param bundleName 遊戲bundle
     * @param lang 語系
     * @returns
     */
     private async loadGameLangSource(bundleName : string,lang : string):Promise<void>{
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(bundleName)!;
            bundle.loadDir(`langResources/gameCore/${lang}`,null,(finished, total, item)=>{
                const loadingNum = Math.floor((finished / total) * 10) ;
                this.gameLangProgressNum = Math.max(this.gameLangProgressNum,loadingNum);
                this.setLoadingBar();
            }, (err, data)=>{
                if(err || !data.length){
                    Logger.error(`game ${lang} data fail~~~!`);
                    if (lang !== 'en') {
                        Logger.error(`start load en lang`);
                        this.loadGameLangSource(bundleName,'en');
                    } else {
                        this.gameLangProgressNum = 15;
                        this.setLoadingBar();
                        this.gameLangLoadComplete();
                    }
                    return;
                }
                this.gameLangProgressNum = 15;
                this.setLoadingBar();
                this.gameLangLoadComplete();
            });
        });
    }
    /**
     * 設置監聽,遊戲取得公版層級結點
     */
    private setListenerToGetNode():void{
        getEventManager().on(Comm.GET_CONTROLTOSETTINGNODE,this.onGetControlToSettingNodeBind);

        getEventManager().on(Comm.GET_SETTINGTOBOTTOMNODE,this.onGetSettingToBottomNodeBind);

        getEventManager().on(Comm.GET_TOPGAMENODE,this.onGetTopGameNodeBind);

        getEventManager().on(Comm.GET_UNDERSETTINGPANELNODE,this.onGetUnderSettingPanelNodeBind);
    }

    private onGetControlToSettingNode(msg : any):void{
        const tempNode = find('Canvas/PubVersion/Portrait/ControlToSettingNode');
        msg.callback(tempNode);
    }
    private onGetSettingToBottomNode(msg : any):void{
        const tempNode = find('Canvas/PubVersion/Portrait/SettingToBottomNode');
        msg.callback(tempNode);
    }
    private onGetTopGameNode(msg : any):void{
        const tempNode = find('Canvas/PubVersion/Portrait/TopGameNode');
        msg.callback(tempNode);
    }
    private onGetUnderSettingPanelNode(msg : any):void{
        const tempNode = find('Canvas/PubVersion/Portrait/UnderSettingPanelNode');
        msg.callback(tempNode);
    }

    private clearListener():void{
        getEventManager().off(Comm.GET_CONTROLTOSETTINGNODE,this.onGetControlToSettingNodeBind);
        getEventManager().off(Comm.GET_SETTINGTOBOTTOMNODE,this.onGetSettingToBottomNodeBind);
        getEventManager().off(Comm.GET_TOPGAMENODE,this.onGetTopGameNodeBind);
        getEventManager().off(Comm.GET_UNDERSETTINGPANELNODE,this.onGetUnderSettingPanelNodeBind);
    }


    /**
     * 關閉loadingbar條與進度顯示
     */
    private closeLoadingNode():void{
        this.loadBarNode.active = false;
    }
    /**
     * 秀出loadingbar條與進度顯示
     */
    private showLoadingNode():void{
        this.loadBarNode.active = true;
    }
}

