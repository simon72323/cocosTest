import { commonStore } from '@common/h5GameTools/CommonStore';
import { Comm, Game, GTAlertPram, GTAlertType } from '@common/h5GameTools/GTCommEvents';
import { GameStatus } from '@common/h5GameTools/State';
import { getEventManager } from '@common/manager/EventManager';
import { Logger } from '@common/utils/Logger';
import { NumberUtils } from '@common/utils/NumberUtils';
import { disWatchAll, watch } from '@common/utils/Reactivity';
import { urlHelper } from '@common/utils/UrlHelper';
import { _decorator, Component, Node, find, Label, Button, UITransform, resources, JsonAsset, instantiate, EventHandler, assetManager, AssetManager, Prefab } from 'cc';
import { DEV } from 'cc/env';

const { ccclass, property } = _decorator;

@ccclass('GTTestManager')
export class testManager extends Component {
    @property(Label)
    public msgLabel : Label = null!;

    @property(Button)
    public betArrayBtn : Button = null!;

    @property(Node)
    public reloadButton : Node = null!;

    private testData : any = { 'data':{ 'event':true,'Balance':50000,'Base':'1:1','DefaultBase':'1:1','BetCreditList':[1,2,4,6,8,10,20,40,100,200,300,400,500,600,1000],'DefaultBetCredit':2,'Rates':{ '0':[0,0,0,0,0,0],'1':[0,0,0,0,0,0],'2':[0,0,0,10,30,50],'3':[0,0,0,8,24,40],'4':[0,0,0,6,18,30],'5':[0,0,0,4,12,20],'6':[0,0,0,2,6,10],'7':[0,0,0,2,6,10],'8':[0,0,0,1,3,5],'9':[0,0,0,1,3,5],'10':[0,0,0,0,0,0] },'UserAutoExchange':{ 'IsAuto':true,'Credit':50000,'BetBase':'1:1','Record':[] },'Currency':'','LoginName':'Player','AutoExchange':false,'Credit':0,'BetBase':'','isCash':false,'userSetting':{ 'autoCredit':500,'auto':false,'info':{},'rate':'1:1' },'SingleBet':100 },'event':true };

    private UINode : Node = null!;
    private gameTypeArr : any = null!;
    private reloadNode : Node = null!;
    private uiBtnNode : Node = null!;
    private gameTypeName : string = '';
    private gameType : string = '';
    private gameHash : string = '';
    private gameNode : Node = null!;
    private isLoadLoaclBundle : boolean = false;
    private loaclHost: string = 'http://localhost:8000';
    private flagOpen : boolean = false;
    onLoad(): void {
        if( !DEV ) return;
        // 測試用
        // reactivity.watch([() => commonStore.storeState.balance, () => commonStore.storeState.credit], ([newA, newB], [oldA, oldB]) => {
        //     Logger.log('A 或 B 變化了:', newA, newB, oldA, oldB);
        // });
        urlHelper.domain = this.isLoadLoaclBundle ? `http://localhost:8000/dist/luckyAce/assets/${this.getGameNameStr()}` :  'https://bbgp-game1.casinovir999.net';

        this.getGameTypeFromUrl();
        this._watch();
        this._setTestData();
        // this.loadGameTypes(this.getGameType());
        this.uiBtnNode = this.node.getChildByName('uiBtnNode')!;
        this.reloadNode = this.uiBtnNode.getChildByName('reloadNode')!;
        this._addUIBtn();
    }

    /**
     * 設置隨機下注額列表
     */
    public setRandomBetArray():void{
        const len = NumberUtils.getRandomInt(1,20);
        const betArr = [];
        for(let i = 0;i < len;i++){
            betArr.push(NumberUtils.getRandomInt(1,1000));
        }
        const sortArr = betArr.sort();
        commonStore.storeMutation.setData('betCreditList', sortArr);
    }

    /**
     * 重新讀取遊戲
     * @param event 
     * @param customEventData 
     */
    public reloadGame(event: Event, customEventData: string):void{
        const gameTypeName = this.gameTypeArr.find((item: any) => item.type === customEventData).name;
        this.setGameName(gameTypeName);

        if(this.gameNode){
            this.gameNode.destroy();
            disWatchAll();
            this._watch();
        }
        this.msgLabel.string = `start loading ${gameTypeName}`;
        this.scheduleOnce(()=>{
            this.loadGameHash();
        },0.1);
    }

    /**
     * ui測試按鈕選項頁開關
     */
    public settingBtnClick():void{
        this.uiBtnNode.active = !this.uiBtnNode.active;

    }

    /**
     * 新增watch 變數
     */
    private _watch():void{
        watch(
            () => commonStore.storeState.gameStatus,
            (newStatus, oldStatus) => {
                Logger.debug('GameStatus 變化了:', newStatus, oldStatus);
                this.msgLabel.string = (newStatus);
            }
        );
    }

    /**
    * 取得gameType從URL
    */
    private getGameTypeFromUrl():void{
        let currentUrl = window.location.href;
        const params = new URLSearchParams(new URL(currentUrl).search);

        // 確認是否有 GameType 並取得值
        if (params.has('GameType')) {
            const gameType = params.get('GameType');
            this.setGameType(gameType!);
            Logger.debug('GameType 存在，其值為:', gameType);
        } else {
            Logger.warn('GameType 不存在');
        }
    }

    /**
    * 設置測試用loadingInfo資料
    */
    private _setTestData():void{
        const msg = this.testData;
        commonStore.storeMutation.setData('balance', msg.data.Balance);
        commonStore.storeMutation.setData('betCreditList', msg.data.BetCreditList);
        commonStore.storeMutation.setData('currency', msg.data.Currency);
        commonStore.storeMutation.setData('userName', msg.data.LoginName);
        commonStore.storeMutation.setData('credit', msg.data.Credit);
        commonStore.storeMutation.setData('isCash', msg.data.isCash);
        commonStore.storeMutation.setData('bet', msg.data.DefaultBetCredit);
        commonStore.storeMutation.setData('totalbet',msg.data.DefaultBetCredit);//parseFloat(betNumStr.replace(/,/g, ''))

        commonStore.storeMutation.setData('exchangeCredit', 1000);
        commonStore.storeMutation.setData('exchangeAll', false);
        commonStore.storeMutation.setData('autoExchange', false);

        this._addListener();
        commonStore.storeMutation.setData('gameStatus', GameStatus.OnGameSetupReady);
        getEventManager().emit(Comm.PREPARE_EXCHANGE);
    }

    /**
     * 顯示開分頁
     */
    private _showExchangeUI():void{
        this.scheduleOnce(()=>{
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnExchangeCredit);
        },5);
    }

    /**
     * 註冊公版事件  
     */
    private _addListener():void{
        //         
        getEventManager().on(Game.EXCHANGE_CREDIT, this._onCreditExchange.bind(this));// 換分按鈕事件
        //getEventManager().on(Game.PRE_SPIN, this._onPreSpin.bind(this));
        //getEventManager().on(Game.PRE_BUY_FREEGAME_SPIN, this._onPreBuyFreeGameSpin.bind(this));
        getEventManager().on(Game.SPIN, this._spin.bind(this));// spin按鈕事件
        getEventManager().on(Game.BUY_FREEGAME_SPIN, this._onBuyFreeGameSpin.bind(this));// spin按鈕事件
        getEventManager().on(Game.RESTART_GAME, this._onRestartGame.bind(this));
        getEventManager().on(Game.STOP_SPIN, this._stopSpin.bind(this));

        getEventManager().on(Comm.SET_ONREADY_SPIN_BTN_INTERACTABLE, this._onSetOnreadySpinBtnInteractable.bind(this));
        //getEventManager().on(Comm.SET_MARQUEE, this._onSetMarquee.bind(this));
        //getEventManager().on(Comm.SHOW_ALERT, this._onShowAlert.bind(this));
        //getEventManager().on(Comm.SET_PUBLIC_GAME_PANEL_SWITCH, this._onSetPublicGamePanelSwitch.bind(this));
        //getEventManager().on(Comm.LOADER_BUTTON_CLICK, this._onCommBtnClick); // 公版按鈕通知
        getEventManager().on(Comm.PREPARE_EXCHANGE, this._onPrepareExchange.bind(this)); // 公版按鈕通知
        getEventManager().on(Comm.SHOW_EXCHANGE_PAGE, this._onShowExchangePage.bind(this));
        getEventManager().on(Comm.CALL_STORE_EXRECORD, this._onCallStoreExrecord.bind(this));

    }

    private _onPrepareExchange():void{
        this.scheduleOnce(()=>{
            getEventManager().emit(Comm.SHOW_EXCHANGE_PAGE);
        },0.1);
    }

    private _onCreditExchange(msg: any):void{
        const { credit, balance } = commonStore.storeState;
        const exchangeCredit = msg.exchangeCredit?msg.exchangeCredit:0;
        const callback = msg.callback;
        commonStore.storeMutation.setData('balance', NumberUtils.accSub(balance, exchangeCredit));
        commonStore.storeMutation.setData('credit', NumberUtils.accAdd(credit, exchangeCredit));

        commonStore.storeMutation.setData('gameStatus', GameStatus.OnReady);
        callback(true);
    }

    private _onDispatchPreSpin():void{
        getEventManager().emit(Game.PRE_SPIN,{
            callback: (_success: boolean) => {

            }, preBet:2000
        });
    }

    private _onDispatchPreBuyFreeGameSpin():void{
        getEventManager().emit(Game.PRE_BUY_FREEGAME_SPIN,{
            gameRate: 1000,
            callback: (_success: boolean) => void{}
        });
    }

    private _onPreBuyFreeGameSpin():void{
        console.log('wee pre buy free game');
    }

    private _onDispatchBuyFreeGameSpin():void{

    }

    private _onBuyFreeGameSpin():void{
        this._buyFreeSpin();
    }

    private _onDispatchRestartGame():void{
        getEventManager().emit(Game.RESTART_GAME,null);
    }

    private _onRestartGame():void{

    }

    private _stopSpin():void{
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnReelAllStop);
        }, 0.8);
        this.scheduleOnce(() => {
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnReady);
        }, 1);
    }

    private _onDispatchSetOnreadySpinBtnInteractable():void{
        getEventManager().emit(Comm.SET_ONREADY_SPIN_BTN_INTERACTABLE,{
            settingPanelBtn: true,
            exchangeBtn: true
        });
    }

    private _onSetOnreadySpinBtnInteractable():void{

    }

    private _onSetStyle1ControlpanelSpriteFrame():void{

    }

    private _onSetSpinSpine():void{

    }

    private _onDispatchSetMarquee():void{
        getEventManager().emit(Comm.SET_MARQUEE, { marquee: 'Lester 取消了Alert' });
    }

    private _onSetMarquee():void{

    }

    private _onDispatchShowAlert():void{
        // commonStore.storeMutation.setData('isXC', true);
        const alert: GTAlertPram = {
            type: GTAlertType.RECONNECT,
            title: '系統訊息',
            content: 'Lester測試Lester測試',
            cancelBtnText: '',
            confirmBtnText: '衝呀',
            cancelCallback: () => {
            },
            confirmCallback: () => {
            }
        };
        getEventManager().emit(Comm.SHOW_ALERT, alert);
    }

    private _onShowAlert():void{

    }

    private _onDispatchSetPublicGamePanelSwitch():void{
        getEventManager().emit(Comm.SET_PUBLIC_GAME_PANEL_SWITCH, {
            'controlPanelIsOpen': false,
            'userSettingPanelIsOpen': false,
            'bottomButtonPanelIsOpen': false
        });
    }

    private _onSetPublicGamePanelSwitch():void{

    }

    private _onShowExchangePage():void{

    }

    private _onCallStoreExrecord():void{

    }

    private _onDisconnect():void{

    }

    private _buyFreeSpin():void{
        const { credit ,exchangeCredit } = commonStore.storeState;
        commonStore.storeMutation.setData('credit', NumberUtils.accSub(credit, exchangeCredit));
        this.scheduleOnce(() => {
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnGetBeginGameResult);
        }, 0.2);
        this.scheduleOnce(() => {
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnReady);
        }, 2);
    }

    private _spin():void{
        const { credit, bet } = commonStore.storeState;
        commonStore.storeMutation.setData('credit', NumberUtils.accSub(credit, bet));
        this.scheduleOnce(() => {
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnGetBeginGameResult);
        }, 0.2);
        if(!commonStore.storeState.isAutoPlay){
            this.scheduleOnce(() => {
                commonStore.storeMutation.setData('gameStatus', GameStatus.OnReadyToStop);
            }, 0.2);
        }
        this.scheduleOnce(() => {
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnReelAllStop);
        }, 1.8);
        this.scheduleOnce(() => {
            commonStore.storeMutation.setData('gameStatus', GameStatus.OnReady);
        }, 2);
    }

    /**
     * 新增讀取各遊戲封包按鈕
     */
    private addReloadGameButton():void{
        for(let i = 0;i < this.gameTypeArr.length;i++){
            const reloadButton = instantiate(this.reloadButton);
            reloadButton.active = true;
            reloadButton.name = this.gameTypeArr[i].type;
            reloadButton.getChildByName('Label')!.getComponent(Label)!.string = this.gameTypeArr[i].name;
            const clickEventHandler = this._createEventHandle('reloadGame',reloadButton.name);
            reloadButton.getComponent(Button)!.clickEvents.push(clickEventHandler);
            reloadButton.setPosition(0,reloadButton.getComponent(UITransform)!.contentSize.y * i);
            this.reloadNode.addChild(reloadButton);
        }
    }

    /**
     * 創建點擊組件
     * @param cb 按鈕cb
     * @param param 按鈕點擊帶入的參數
     * @returns 
     */
    private _createEventHandle(cb : string,param : string):EventHandler{
        const clickEventHandler = new EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = 'GTTestManager';
        clickEventHandler.handler = cb;
        clickEventHandler.customEventData = param;
        return clickEventHandler;
    }

    /**
     * 新增UI案鈕
     */
    private _addUIBtn():void{
        //--preSPIN
        this.createBtn('preSPIN','_onDispatchPreSpin',1);
        //-buyFreeGame
        this.createBtn('preBuyFreeGame','_onDispatchPreBuyFreeGameSpin',2);
        //-SetOnreadySpinBtnInteractable
        this.createBtn('SetInteractable','_onDispatchSetOnreadySpinBtnInteractable',3);
        //-_onDispatchSetPublicGamePanelSwitch
        this.createBtn('SetSwitch','_onDispatchSetPublicGamePanelSwitch',4);
        //-setMarquee
        this.createBtn('SetMarquee','_onDispatchSetMarquee',5);
        //-setAlert
        this.createBtn('SetAlert','_onDispatchShowAlert',6);
    }

    /**
     * 創建按鈕
     * @param name 
     * @param handle 
     * @param index 
     */
    private createBtn(name : string,handle : string,index : number):void{
        const reloadButton = instantiate(this.reloadButton);
        reloadButton.active = true;
        reloadButton.name = name;
        reloadButton.getChildByName('Label')!.getComponent(Label)!.string = name;
        const clickEventHandler = this._createEventHandle(handle,'');
        reloadButton.getComponent(Button)!.clickEvents.push(clickEventHandler);
        reloadButton.setPosition(0,reloadButton.getComponent(UITransform)!.contentSize.y * index);
        this.uiBtnNode.addChild(reloadButton);
    }

    /**
     * 抓取遊戲名稱
     * @param gameType 
     * @returns 
     */
    private async loadGameTypes(gameType: string): Promise<string> {
        return new Promise((resolve, reject) => {
            resources.load('gameTypes',JsonAsset, (err, jsonAsset) => {
                if (err) {
                    reject(err);
                }
                let gameTypesData;
                // 解析 JSON 數據
                gameTypesData = jsonAsset.json!;

                this.gameTypeArr = gameTypesData.gameTypes;
                const gameTypeInfo = gameTypesData.gameTypes.find((item: any) => item.type === gameType);
                this.addReloadGameButton();
                resolve(gameTypeInfo ? gameTypeInfo.name : 'undefind');
            });
        });
    }

    /**
     * 讀取遊戲bundle
     */
    private loadGameBundle(): void {
        Logger.debug('LoadGameLoadingBundle');
        let url = this.getGameBundleURL();
        this.loadLoading(url);
    }

    private getGameBundleURL() {
        let url = `${urlHelper.domain}/bundle/assets/${this.getGameNameStr()}`;
        if(this.isLoadLoaclBundle){
            url = url = `${this.loaclHost}/dist/${this.getGameNameStr()}/assets/${this.getGameNameStr()}`;
        }
        return url;
    }

    private setGameName(name : string):void{
        this.gameTypeName = name;
    }

    private getGameNameStr():string{
        return this.gameTypeName;
    }

    /**
     * 設置gameType
     */
    public setGameType(num : string):void{
        this.gameType = num;
    }

    public getGameType():string{
        return this.gameType ;
    }

    /**
     * 讀取遊戲 Bundle
     * @param url 
     * @param state 
     */
    private loadLoading(url: string): void {
        this.loadBundle(url).then(
            bundle => {
                Logger.debug('遊戲bundle 讀取成功');
                const gameNode = find('Canvas/PubVersion/Portrait/GameNode')!;
                const self = this;
                bundle.load('prefab/gameScene', Prefab,
                    (finished, total) => {
                        //finished: number, total: number, item: RequestItem
                        const loadingNum = Math.floor((finished / total) * 100);
                        this.msgLabel.string = `loading : ${loadingNum}%`;
                    }, function (err, prefab) {

                        self.gameNode = instantiate(prefab);
                        gameNode.addChild(self.gameNode);
                    });
            }
        ).catch(err => {
            alert(err + ': Gamebundle');
        });
    }

    /**
     * 讀取bundle
     * @param url 
     */
    private async loadBundle(url: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(url,{ version : this.gameHash }, (err: Error | null, bundle: AssetManager.Bundle) => {
                if (err) {
                    reject(err);
                }
                resolve(bundle);
            });
        });
    }

    /**
     * 抓取遊戲的hash值
     */
    public async loadGameHash(){
        await fetch(this.getGameSettingJson())
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch JSON: ' + response.statusText);
                }
                return response.json(); // 解析 JSON 内容
            })
            .then(jsonData => {
                Logger.debug('Loaded JSON Data:', jsonData);

                // 读取 JSON 中的某个字段
                const value:string = jsonData.assets.bundleVers[this.getGameNameStr()];
                this.gameHash = value;
                Logger.debug('Value of exampleKey:', value);
                this.loadGameBundle();
            })
            .catch(err => {
                console.error(err);
            });
    }

    private getGameSettingJson():string{
        let url = `${urlHelper.domain}/bundle/src/settings.json?timestamp=${new Date().getTime()}`;
        if(this.isLoadLoaclBundle){
            url = 'http://localhost:8000/dist/luckyAce/src/settings.json';
        }
        return url;
    }
}

