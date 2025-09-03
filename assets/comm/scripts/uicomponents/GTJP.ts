import { commonStore } from '@common/h5GameTools/CommonStore';
import { Comm, GTCommEventMap, GTLoaderButtonType } from '@common/h5GameTools/GTCommEvents';
import { GameStatus, SiteType } from '@common/h5GameTools/State';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { getEventManager } from '@common/manager/EventManager';
import { Logger } from '@common/utils/Logger';
import { NumberUtils } from '@common/utils/NumberUtils';
import { watch } from '@common/utils/Reactivity';
import { _decorator, Component, Node, tween, v3, easing, Vec3, Sprite, SpriteFrame, Label, sp, AudioSource, screen, Tween } from 'cc';

import { GTLoaderCommStore } from '@/comm/scripts/comm/GTLoderCommStore';
const { ccclass, property } = _decorator;

@ccclass('GTJP')
export class GTJP extends Component {
    @property(SpriteFrame)
    grandBG : SpriteFrame = null!;

    @property(SpriteFrame)
    majorBG : SpriteFrame = null!;

    @property(SpriteFrame)
    minorBG : SpriteFrame = null!;

    @property(SpriteFrame)
    miniBG : SpriteFrame = null!;

    @property(AudioSource)
    audioSource: AudioSource = null!;

    @property(Node)
    public jpNode : Node = null!;

    @property(sp.SkeletonData)
    public winJP_No_RMB : sp.SkeletonData = null!;

    @property(sp.SkeletonData)
    public winJP_RMB : sp.SkeletonData = null!;

    private bg : Sprite = null!;
    private startPosition : Vec3 = null!;
    private bgIndex : number = 0;
    private bgArray : SpriteFrame[] = [];
    private jpPanel : Node = null!;
    private grandLB_P : Label = null!;
    private majorLB_P : Label = null!;
    private minorLB_P : Label = null!;
    private miniLB_P : Label = null!;
    private miniPic : Node = null!;
    private jpScoreLB : Label = null!;
    private jpData : string[] = ['100.00','200','300','10000000000'];
    private activeJp : boolean = false;
    private jpAmount : number = 55655555555.56;
    private runScoreLB : Label = null!;
    private winJPNode : Node = null!;
    private jpSkeleton : sp.Skeleton = null!;
    private finishJpCB : any = null!;
    private hasMini : boolean = false;
    private isSpining : boolean = false;
    private jpType : string = null!;
    private repeatJpTween : Tween = null!;
    hitJPBind! : (data: any) => void;
    onScreenResizeBind!: () => void;

    start() {
        this.jpPanel = this.node.getChildByName('jpPanel')!;
        this.bg = this.jpNode.getChildByName('BG')?.getComponent(Sprite)!;
        this.grandLB_P = this.jpPanel.getChildByName('grandLB')!.getComponent(Label)!;
        this.majorLB_P = this.jpPanel.getChildByName('majorLB')!.getComponent(Label)!;
        this.minorLB_P = this.jpPanel.getChildByName('minorLB')!.getComponent(Label)!;
        this.miniLB_P = this.jpPanel.getChildByName('miniLB')!.getComponent(Label)!;
        this.miniPic = this.jpPanel.getChildByName('miniPic')!;
        this.jpScoreLB = this.jpNode.getChildByName('score')!.getComponent(Label)!;
        this.winJPNode = this.node.getChildByName('winJP')!;
        this.runScoreLB = this.winJPNode.getChildByName('score')!.getComponent(Label)!;
        this.jpSkeleton = this.winJPNode.getChildByName('bg')!.getComponent(sp.Skeleton)!;
        this.hitJPBind = this.hitJP.bind(this);
        this.hideMini();
        this.startPosition = this.jpNode.position;
        this.bgArray = [this.grandBG,this.majorBG,this.minorBG,this.miniBG];
        this.setAudioVolume(commonStore.storeState.effectAudioOn? 1 : 0);
        this.playRepeatTweenAni();
        this.jpNode.on(Node.EventType.MOUSE_MOVE,()=>{
            this.unscheduleAllCallbacks();
        });
        this.jpNode.on(Node.EventType.MOUSE_LEAVE,()=>{
            this.scheduleOnce(()=>{
                this.playRepeatTweenAni();
            },2);
        });
        this.jpNode.on(Node.EventType.MOUSE_DOWN,()=>{
            this.showJPPanel();
        });
        this.jpNode.on(Node.EventType.TOUCH_START,()=>{
            this.showJPPanel();
        });

        this.closeJP();

        this._setupReactivityWatcher();
        this._setupEventListeners();
        this.switchWinJPMod();
    }

    onDestroy():void{
        getEventManager().off(Comm.HIT_JACKPOT,this.hitJPBind);
    }

    public _setupEventListeners():void{
        getEventManager().on(Comm.HIT_JACKPOT,this.hitJPBind);
        this.onScreenResizeBind = () => {
            this.onCanvasResize();
            // setTimeout(this.onCanvasResize.bind(this), 500);
        };

        window.addEventListener('resize', this.onScreenResizeBind);
        screen.on('window-resize',this.onScreenResizeBind, this);
    }

    public _setupReactivityWatcher():void{
        watch(
            () => commonStore.storeState.jackpot,
            (newStatus, oldStatus) => {
                Logger.debug('jackpot 變化了:', newStatus, oldStatus);
                this.jpData = newStatus as string[];
                this.updateJPPanel();
                this.updateJPScoreLB();
                //有JP,開啟jp顯示，XC不能顯示JP
                if( !this.activeJp && commonStore.storeState.enableJP ){
                    this.activeJp = true;
                    this.activeJP();
                }
            }
        );
        watch(
            () => commonStore.storeState.effectAudioOn,
            (newStatus, oldStatus) => {
                Logger.debug('effectAudioOn 變化了:', newStatus, oldStatus);
                this.setAudioVolume(newStatus ? 1 : 0);
            }
        );

        watch(
            () => commonStore.storeState.gameStatus,
            (newStatus, _oldStatus) => {
                this._reloadBtnStateByGameStatus(newStatus);
            }
        );
    }

    public onCanvasResize():void{
        this.unscheduleAllCallbacks();
        this.scheduleOnce(()=>{
            this.startPosition = this.jpNode.position;
            this.playRepeatTweenAni();
        },0.5);
    }

    /**
     * 關閉JP面板
     */
    public closeJPPanel():void{
        gtmEvent.LOADER_GAME_JP_CLOSE_CLICK();
        this.scheduleOnce(()=>{
            this.setJPPanelFalse();
            this.playClickAudio();
        },0);

    }

    /**
     * 設置中獎金額
     * @param num 中獎金額
     */
    public setJPAmount(num : number):void{
        this.jpAmount = num;
    }

    /**
     * 設置JP獎項
     * @param type JP獎項
     */
    public setJPType(type : number):void{
        let tempType = '';
        switch (type) {
            case 1:
                tempType = 'grand';
                break;
            case 2:
                tempType = 'major';
                break;
            case 3:
                tempType = 'minor';
                break;
            default:
            case 4:
                tempType = 'mini';
                break;
        }
        this.jpType = tempType;
        this.jpSkeleton.setSkin(tempType);
        this.jpSkeleton.setAnimation(1,'02');
    }

    /**
     * 開啟JP中獎動畫Node
     */
    public showWinJP():void{
        this.winJPNode.active = true;
    }

    /**
     * JP中獎跑分
     */
    public runScroe():void{
        this.runScoreLB.string = '0';
        let counter = { value: 0 };

        tween(counter)
            .to(5, { value: this.jpAmount }, {
                easing: 'sineInOut',
                progress: (start, end, current, ratio) => {
                    const interpolatedValue = start + (end - start) * ratio;
                    this.runScoreLB.string = interpolatedValue.toFixed(2);
                    return interpolatedValue;
                }
            })
            .call(() => {
                //最後直接塞值
                this.runScoreLB.string = this.jpAmount.toFixed(2);
                //2秒後關閉winJP動畫
                this.scheduleOnce(()=>{
                    this.closeWinJP();
                    this.finishJpCB();
                    this.stopAudio();
                },2);
            })
            .start();

    }

    /**
     * 依平台切換JP動畫設置,有無ＲＭＢ
     */
    private switchWinJPMod():void{
        const siteType = commonStore.storeState.siteType;
        switch (siteType) {
            case SiteType.LM:
                this.jpSkeleton.skeletonData = this.winJP_No_RMB;
                break;
            case SiteType.XC:
                this.jpSkeleton.skeletonData = this.winJP_No_RMB;
                break;
            default:
                this.jpSkeleton.skeletonData = this.winJP_RMB;
                break;
        }
    }

    private setJPPanelTrue():void{
        this.jpPanel.active = true;
    }

    private setJPPanelFalse():void{
        this.jpPanel.active = false;
    }

    private hitJP(msg:GTCommEventMap[Comm.HIT_JACKPOT]):void{
        gtmEvent.LOADER_GAME_JP_PAYOFF(msg.jpAmount,this.jpType);

        this.showWinJP();
        this.setJPAmount(msg.jpAmount);
        this.setJPType(msg.jpType);
        this.runScroe();
        this.playAudio();
        this.finishJpCB = msg.callback;
    }

    /**
     * 開啟左上顯示ＪＰ視窗
     */
    private activeJP():void{
        this.jpNode.active = true;

    }

    /**
     * 關閉左上顯示ＪＰ視窗
     */
    private closeJP():void{
        this.jpNode.active = false;
    }

    /**
     * 開啟JP面板
     */
    private showJPPanel():void{
        gtmEvent.LOADER_GAME_JP_CLICK();
        const isAutoSpin = commonStore.storeState.isAutoPlay;
        if(this.isSpining || isAutoSpin){
            return;
        }
        this.setJPPanelTrue();
        this.playClickAudio();
    }

    /**
     * 關閉JP中獎動畫Node
     */
    private closeWinJP():void{
        this.winJPNode.active = false;
    }

    private playClickAudio():void{
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.settingPanelBtn });
    }

    /**
     * 播放左上輪播JP視窗
     */
    private playRepeatTweenAni():void{
        if(this.repeatJpTween){
            this.repeatJpTween.stop();
        }
        this.tweenAni();
        this.scheduleOnce(()=>{
            this.playRepeatTweenAni();
        },5);
    }

    /**
     * 更新ＪＰ面板上的數值
     */
    private updateJPPanel():void{
        this.grandLB_P.string = NumberUtils.formatNumber(this.getNum(this.jpData[0]));
        this.majorLB_P.string = NumberUtils.formatNumber(this.getNum(this.jpData[1]));
        this.minorLB_P.string = NumberUtils.formatNumber(this.getNum(this.jpData[2]));
        if(!this.hasMini && parseFloat(this.jpData[3]) > 0){
            this.showMini();
            this.miniLB_P.string = NumberUtils.formatNumber(this.getNum(this.jpData[3]));
        }else{
            this.miniLB_P.string = NumberUtils.formatNumber(this.getNum(this.jpData[3]));
        }
    }

    /**
     * 取到小數後兩位的JP值
     * @param jpStr 
     * @returns 
     */
    private getNum(jpStr : string):any{
        let param = {
            formatValue: jpStr, // 要格式化的數值，字串形式
            roundCount: 2,              // 四捨五入到小數點後兩位
            thousandth: true,           // 使用千位分隔符
            keepDecimal: true,         // 不保留小數部分，轉為整數
            isKFormat: false            // 使用"K"格式顯示
        };
        return param;
    }

    /**
     * 輪播時更換JP樣式
     */
    private switchBG():void{
        this.bgIndex += 1;
        this.bgIndex = this.bgIndex >= 4 ? 0 : this.bgIndex;
        if(!this.hasMini && this.bgIndex == 3){
            this.bgIndex = 0;
        }
        this.bg.spriteFrame = this.bgArray[this.bgIndex];
    }

    /**
     * 輪播時更換該JP數值
     */
    private updateJPScoreLB():void{
        this.jpScoreLB.string = NumberUtils.formatNumber(this.getNum(this.jpData[this.bgIndex]));
    }

    /**
     * 輪播動畫
     */
    private tweenAni():void{
        const isGameReady = GTLoaderCommStore.getInstance().getData('isGameReady');
        if(!isGameReady){
            return;
        }
        console.log(`play this.jpNode.position : ${this.jpNode.position} / this.startPosition : ${this.startPosition} / screen.windowSize.height : ${screen.windowSize.height}`);
        this.repeatJpTween = tween(this.jpNode)
            .to(0.3, { position: v3(this.startPosition.x - 550, this.startPosition.y, this.startPosition.z) }, {
                easing: easing.smooth
            }).call(()=>{
                this.switchBG();
                this.updateJPScoreLB();
            })

            .to(0.3, { position: v3(this.startPosition.x, this.startPosition.y, this.startPosition.z) }, {
                easing: easing.smooth
            })
            .start();
    }

    // 依照遊戲狀態重新設定按鈕狀態
    private _reloadBtnStateByGameStatus(gameStatus: GameStatus): void {
        switch (gameStatus) {
            case GameStatus.OnReady:
                this.isSpining = false;
                break;
            case GameStatus.OnGetBeginGameResult:
                this.isSpining = true;
                this.setJPPanelFalse();
                break;
        }
    }

    private playAudio():void{
        this.audioSource.play();
    }

    private stopAudio():void{
        this.audioSource.stop();
    }

    private setAudioVolume(num : number):void{
        this.audioSource.volume = num;
    }

    /**
     * 關閉mini顯示
     */
    private hideMini():void{
        this.hasMini = false;
        this.miniLB_P.node.active = false;
        this.miniPic.active = false;
    }

    /**
     * 開啟mini顯示
     */
    private showMini():void{
        this.hasMini = true;
        this.miniLB_P.node.active = true;
        this.miniPic.active = true;
    }
}

