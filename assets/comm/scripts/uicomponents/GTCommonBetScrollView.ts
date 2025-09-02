import { commonStore } from '@common/h5GameTools/CommonStore';
import { NumberUtils } from '@common/utils/NumberUtils';
import { _decorator, Component, Node, ScrollView, UITransform, Size, Sprite, SpriteFrame, assetManager, Color, Layers, Label, Vec3, Event, sys, tween, UIOpacity, Font } from 'cc';
import { getDecimalPlaces, geti18nTex } from '../comm/GTCommTools';
import { Comm, GTLoaderButtonType } from '@common/h5GameTools/GTCommEvents';
import { getEventManager } from '@common/manager/EventManager';
import { Logger } from '@common/utils/Logger';
import { watch } from '@common/utils/Reactivity';

const { ccclass, property } = _decorator;

@ccclass('GTCommonBetScrollView')
export class GTCommonBetScrollView extends Component {
    @property(Label) public titleLabel: Label = null!;
    @property(Sprite) public bgSprite: Sprite = null!;

    private scrollview: ScrollView = null!;
    private btnBoxUpPic: SpriteFrame = null!;
    private btnBoxDownPic: SpriteFrame = null!;
    private btnBoxHoverPic: SpriteFrame = null!;
    private btnBoxDisPic: SpriteFrame = null!;
    private btnBoxSelectPic: SpriteFrame = null!;
    private contentNode: Node = null!;
    private btnArr: Node[] = [];
    private labelArr: Node[] = [];
    private isCheckedBtn: Node = null!;
    private isCheckedBtnLabel: Node = null!;
    private scrollingFlag: boolean = false;
    private betCreditList: number[] = [];//[1,2,4,6,8,10,20,40,100,200,300,400,500,600,1000];
    private initialPosition: Vec3 = Vec3.ZERO;
    private labelFont: Font = null!;
    private index: number = -1;
    private maxLen: number = -1;
    private isSetWatch: boolean = false;
    private cellTextColorHex: string = 'AA823C'; // 按鈕label的顏色


    public onLoad(): void {
        this.initialPosition = this.node.position.clone();
        this._setupEventListeners();
    }

    public onEnable(): void {
        this.playBounceFadeIn();
        this.setBetChange();
    }

    public onDestroy(): void {
        getEventManager().off(Comm.SET_BET_OPTION_NODE_PARAM, this.setBetOptionNodeParam.bind(this));
    }
    public async initData(): Promise<void> {
        await this.getPicFromBundle();
        // 延遲到下一幀
        await new Promise(resolve => setTimeout(resolve, 0));
        //確保bet值已被設定
        this.scrollview = this.node.getComponent(ScrollView)!;
        this.contentNode = this.node.getChildByName('view')!.getChildByName('content')!;
        this.init();

        if (!this.isSetWatch) {
            this.isSetWatch = true;
            watch(() => commonStore.storeState.totalBet,(_newBet, _oldBet) => {
                    this.setBetChange();
                }
            );
        }
    }
    /**
     * 初始化注額按鈕區
     * @param betArr 注額列
     */
    public init(): void {
        this.betCreditList = commonStore.storeState.betCreditList;
        const len = this.betCreditList.length;
        if (len <= 0) {
            Logger.warn(`no betCreditList !!`);
            return;
        }
        this.clearAllChildern();
        for (let i = 0; i < len; i++) {
            this.addNode(i);
            this.addLabel(i);
        }
        const posY = Math.abs(this.btnArr[len - 1].position.y);
        this.scrollview.content!.getComponent(UITransform)!.setContentSize(950, posY == 0 ? 125 : posY);
        let scrollNode = this.scrollview.node;
        scrollNode.setPosition(scrollNode.position.x, scrollNode.position.y);
        this.maxLen = len - 1;
        this.index = this.getDefaultBetIndex();
        this.setBtnClicked();
    }

    private _setupEventListeners(): void {
        getEventManager().on(Comm.SET_BET_OPTION_NODE_PARAM, this.setBetOptionNodeParam.bind(this));
    }

    private setBetOptionNodeParam(obj:any): void {
        if (!obj) return;
        if (obj.title && obj.title.length > 0) {
            this.titleLabel.string = obj.title;
        } else {
            this.titleLabel.string = geti18nTex('BET_OPTION');
        }

        if (obj.startPos) {
            this.initialPosition = new Vec3(obj.startPos.x, obj.startPos.y);
        }

        this.bgSprite.getComponent(UIOpacity)!.opacity = obj.maskOpacity ?? 255;

    }

    private clearAllChildern(): void {
        this.contentNode.destroyAllChildren();
        this.contentNode.removeAllChildren();
        this.btnArr = [];
        this.labelArr = [];
    }

    private getDefaultBetIndex(): number {
        const len = this.maxLen + 1;
        let tempNum = 0;
        //20250411,修正只有第一次進入時候會用bet來尋找betCreditList內的index
        if (this.index != -1) {
            if (this.betCreditList[this.index]) {
                return this.index;
            } else {
                return 0;
            }
        }
        for (let i = 0; i < len; i++) {
            if (commonStore.storeState.bet == this.betCreditList[i]) {
                tempNum = i;
            }
        }
        return tempNum;
    }
    /**
     * 當 + 按鈕按下
     */
    public addIndex(): void {
        this.index += 1;
        if (this.index > this.maxLen) {
            this.index = this.maxLen;
        }
        this.setBtnClicked();
    }
    /**
     * 當 - 按鈕按下
     */
    public minusIndex(): void {
        this.index -= 1;
        if (this.index <= 0) {
            this.index = 0;
        }
        this.setBtnClicked();
    }
    /**
     * 取得目前的index
     * @returns 當前index
     */
    public getIndex(): number {
        return this.index;
    }
    /**
     * 取得目前最大注額長度
     * @returns 目前最大注額長度
     */
    public getMaxLen(): number {
        return this.maxLen;
    }
    /**
     * 依bet值變動時,直接設置版面
     */
    public setBetChange(): void {
        if (!this.betCreditList || this.betCreditList.length <= 0) return;
        let nowBet = commonStore.storeState.totalBet;
        let currentIndex = 0;
        for (let i = 0; i < this.betCreditList.length; i++) {
            if (nowBet == this.betCreditList[i]) {
                currentIndex = i;
                break;
            }
        }
        if (currentIndex == this.index) {
            return;
        }
        this.saveIndex(currentIndex);
        this.setBtnClicked();
    }
    /**
     * 增加按鈕
     * @param count 第幾個按鈕
     */
    private addNode(count: number): void {
        const tempNode = new Node(`node-${count}`);
        tempNode.addComponent(UITransform).setContentSize(new Size(280, 120));
        tempNode.layer = Layers.Enum.UI_2D;
        let tempSpriteFrame = tempNode.addComponent(Sprite);
        tempSpriteFrame.spriteFrame = this.btnBoxUpPic;
        tempSpriteFrame.color = this.hexToColor('FFFFFF');
        this.contentNode.addChild(tempNode);
        tempNode.setPosition(this.getBtnPos(count));
        this.addListener(tempNode);
        this.btnArr.push(tempNode);
    }
    /**
     * 增加該按鈕的標籤
     * @param count 第幾個按鈕
     */
    private addLabel(count: number): void {
        const tempNode = new Node(`lable-${count}`);
        const label = tempNode.addComponent(Label);
        tempNode.layer = Layers.Enum.UI_2D;
        this.setLabelColor(label, this.cellTextColorHex);
        const param = {
            formatValue: this.betCreditList[count], // 要格式化的數值，字串形式
            roundCount: this.getKFormatDecimalPlaces(this.betCreditList[count]),// 四捨五入到小數點後幾位
            thousandth: true,           // 使用千位分隔符
            keepDecimal: false,         // 為0的小數位數是否要保留 true => '100.10', false => '100.1' */
            isKFormat: true            // 使用"K"格式顯示
        };
        label.string = NumberUtils.formatNumber(param);
        this.labelArr.push(tempNode);
        this.contentNode.addChild(tempNode);
        tempNode.setPosition(this.getBtnPos(count));
        label.font = this.labelFont;
        label.fontSize = 72;
        label.lineHeight = 44;
    }
    /**
     * 轉化Ｋ格式保留小數點
     */
    private getKFormatDecimalPlaces(num: number): number {
        let tempNum = num;
        //轉化Ｋ模式
        if (num > 1e5) {
            tempNum = NumberUtils.accMul(num, 1e-3);
        }
        const tempNum2 = getDecimalPlaces(tempNum);
        return tempNum2;
    }

    private setLabelColor(tempLabel: Label, colorStr: String): void {
        tempLabel.color = this.hexToColor(colorStr as string);
    }
    /**
     * 從bundle取得按鈕圖
     */
    private async getPicFromBundle(): Promise<void> {

        const [
            btnBoxUpPic,
            btnBoxDownPic,
            btnBoxHoverPic,
            btnBoxDisPic,
            btnBoxSelectPic,
            labelFont
        ] = await Promise.all([
            this.loadPicFromBundle('/btn_box_up/spriteFrame'),
            this.loadPicFromBundle('/btn_box_down/spriteFrame'),
            this.loadPicFromBundle('/btn_box_hover/spriteFrame'),
            this.loadPicFromBundle('/btn_box_disable/spriteFrame'),
            this.loadPicFromBundle('/btn_box_selected/spriteFrame'),
            this.loadFontFromBundle('fonts/arial60'),
        ]);

        this.btnBoxUpPic = btnBoxUpPic;
        this.btnBoxDownPic = btnBoxDownPic;
        this.btnBoxHoverPic = btnBoxHoverPic;
        this.btnBoxDisPic = btnBoxDisPic;
        this.btnBoxSelectPic = btnBoxSelectPic;
        this.labelFont = labelFont;
    }
    /**
     * 取得該按鈕要在哪個位置
     * @param count 第幾個按鈕
     * @returns 
     */
    private getBtnPos(count: number): Vec3 {
        const tempNum = count % 3;
        const floorY = Math.floor(count / 3) < 1 ? 0 : Math.floor(count / 3);
        let x = 0;
        let y = -85 + (floorY * -170); //-85是因為按鈕 anchorpoint 0.5,0.5 170是高
        switch (tempNum) {
            case 0:
                x = -330;
                break;
            case 1:
                x = 0;
                break;
            case 2:
                x = 330
                break;
            default:
                break;
        }
        return new Vec3(x, y);
    }

    private async loadPicFromBundle(url: string): Promise<SpriteFrame> {
        const resourcePath = 'gameCore/resources/Comm';
        const orginSourcePath = 'textures/ui';

        return new Promise((resolve, reject) => {
            const bundleName = 'comm';
            const bundle = assetManager.getBundle(bundleName);
            if (bundle) {
                bundle.load(resourcePath + url, SpriteFrame, (err, spriteFrame) => {
                    if (err) {
                        bundle.load(orginSourcePath + url, SpriteFrame, (err, spriteFrame) => {
                            if (err) {
                                Logger.error(`load ${url} fail~~~!`);
                                reject(err)
                            }
                            resolve(spriteFrame)
                        });
                    } else {
                        resolve(spriteFrame)
                    }
                });
            }
        });
    }

    private async loadFontFromBundle(url: string): Promise<Font> {
        return new Promise((resolve, reject) => {
            const bundleName = 'comm';
            const bundle = assetManager.getBundle(bundleName);
            if (bundle) {
                bundle.load(url, Font, (err, font) => {
                    if (err) {
                        Logger.error(`load ${url} fail~~~!`);
                        reject(err)
                    }
                    if (err) {
                        reject(err)
                    }
                    resolve(font)
                });
            }

        });
    }

    // 轉換 16 進制顏色為 Color 對象
    private hexToColor(hex: string) {
        // 去掉井號符號
        hex = hex.replace('#', '');
        // 轉換為 RGBA
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const a = 255; // 不透明
        return new Color(r, g, b, a);
    }
    /**
     * 增加按鈕屬性
     * @param btn 按鈕
     */
    private addListener(btn: Node): void {
        if (sys.platform !== sys.Platform.DESKTOP_BROWSER) {
            btn.on(Node.EventType.TOUCH_START, (event : any) => {
                // this.onClick(event);
                if (this.isScrolling()) {
                    this.scrollingFlag = true;
                    return;
                }
                //避免按下後滾動結束鬆開滑鼠造成點擊選擇該按鈕
                if (this.scrollingFlag) {
                    return;
                }
                this.releaseLastCheckedBtn();
                this.onPressUp(event);
                this.saveCheckedBtn(event.target);
                this.setLabelColor(this.isCheckedBtnLabel.getComponent(Label)!, 'FFFFFF');
                getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.betSetBtn });
            }, this);
        }
        btn.on(Node.EventType.MOUSE_ENTER, (event: any) => {
            if (this.isScrolling()) {
                this.scrollingFlag = true;
                return;
            }
            if (btn.getComponent(Sprite)!.spriteFrame === this.btnBoxSelectPic) {
                return;
            }
            this.onHover(event);
        }, this);
        btn.on(Node.EventType.MOUSE_DOWN, (event: any) => {
            if (this.isScrolling()) {
                this.scrollingFlag = true;
                return;
            }
            this.scrollingFlag = false;
            this.onPressDown(event);
        }, this);
        btn.on(Node.EventType.MOUSE_UP, (event: any) => {
            if (this.isScrolling()) {
                this.scrollingFlag = true;
                return;
            }
            //避免按下後滾動結束鬆開滑鼠造成點擊選擇該按鈕
            if (this.scrollingFlag) {
                return;
            }
            this.releaseLastCheckedBtn();
            this.onPressUp(event);
            this.saveCheckedBtn(event.target);
            this.setLabelColor(this.isCheckedBtnLabel!.getComponent(Label)!, 'FFFFFF');
            getEventManager().emit(Comm.LOADER_BUTTON_CLICK, { type: GTLoaderButtonType.betSetBtn });
        }, this);
        btn.on(Node.EventType.MOUSE_LEAVE, (event: any) => {
            if (btn.getComponent(Sprite)!.spriteFrame === this.btnBoxSelectPic) {
                return;
            }
            this.onLeave(event);
        }, this);
    }
    /** 
     * 直接設定按鈕被按
    */
    private setBtnClicked(): void {
        //代表沒有betArr資料
        if (this.maxLen == -1) {
            return;
        }
        const btn = this.btnArr[this.index];
        this.releaseLastCheckedBtn();
        this.changeSelectedPic(btn);
        this.saveCheckedBtn(btn);
        this.setLabelColor(this.isCheckedBtnLabel!.getComponent(Label)!, 'FFFFFF');
    }
    /**
     * 點擊該按鈕
     * @param event 
     */
    private onClick(event: Event): void {
        this.changeSelectedPic(event.target);
    }
    /**
     * 按下該按鈕
     * @param event 
     */
    private onPressDown(event: Event): void {
        this.changePressPic(event.target);
    }
    /**
     * 鬆開該按鈕
     * @param event 
     */
    private onPressUp(event: Event): void {
        this.changeSelectedPic(event.target);
    }
    /**
     * 滑入該按鈕
     * @param event 
     */
    private onHover(event: Event): void {
        this.changeHoverPic(event.target);
    }
    /**
     * 離開該按鈕
     * @param event 
     */
    private onLeave(event: Event): void {
        this.changeNormalPic(event.target);
    }
    /**
     * 更換成滑入圖
     * @param btn 被滑入的按鈕
     * @returns 
     */
    private changeHoverPic(btn: Node): void {
        btn.getComponent(Sprite)!.spriteFrame = this.btnBoxHoverPic;
    }
    /**
     * 更換成初始圖
     * @param btn 按鈕
     * @returns 
     */
    private changeNormalPic(btn: Node): void {
        btn.getComponent(Sprite)!.spriteFrame = this.btnBoxUpPic;
    }
    /**
     * 更換成被按下的圖
     * @param btn 被按下的按鈕
     */
    private changePressPic(btn: Node): void {
        let tempSpriteFrame = btn.getComponent(Sprite)!.spriteFrame;
        if (tempSpriteFrame != this.btnBoxSelectPic) {
            tempSpriteFrame = this.btnBoxDownPic;
        }
    }
    /**
     * 更換成選擇圖
     * @param btn 被按下的按鈕
     */
    private changeSelectedPic(btn: Node): void {
        btn.getComponent(Sprite)!.spriteFrame = this.btnBoxSelectPic;
    }
    /**
     * 儲存被選擇的按鈕
     * @param btn 被選擇的按鈕
     */
    private saveCheckedBtn(btn: Node): void {
        this.isCheckedBtn = btn;
        const count = parseInt(btn.name.split('-')[1]);
        this.isCheckedBtnLabel = this.labelArr[count];
        this.saveIndex(count);
        this.saveDataToStoreState();
    }
    /**
     * 儲存被選擇的按鈕index
     * @param count 被選擇的按鈕index
     */
    private saveIndex(count: number): void {
        this.index = count;
    }
    /**
     * 儲存押注值至公版欄位
     * @param count 取得該按鈕label的index
     */
    private saveDataToStoreState(): void {
        const betNum = this.betCreditList[this.index];//this.labelArr[this.index].getComponent(Label).string;
        if (betNum == commonStore.storeState.bet && commonStore.storeState.totalBet == betNum) {
            return;
        }
        commonStore.storeMutation.setData('bet', betNum);//parseFloat(betNumStr.replace(/,/g, ''))
        commonStore.storeMutation.setData('totalBet', betNum);//parseFloat(betNumStr.replace(/,/g, ''))
    }
    /**
     * 還原被選擇的按鈕成初始按鈕圖
     */
    private releaseLastCheckedBtn(): void {
        if (!this.isCheckedBtn) {
            return;
        }
        this.isCheckedBtn.getComponent(Sprite)!.spriteFrame = this.btnBoxUpPic;
        this.setLabelColor(this.isCheckedBtnLabel!.getComponent(Label)!, 'AA823C');
    }
    /**
     * 判斷是否在滾動中
     * @returns 
     */
    private isScrolling(): boolean {
        return this.scrollview.isScrolling();
    }

    private playBounceFadeIn() {
        const nodeOpacity = this.node.getComponent(UIOpacity)!;
        const count = Math.floor(this.maxLen / 3);
        // const limitY = count * 160 + (count * 25) + 400 + 170//400是底部控制區高，100是Title，120是上下空間
        const limitY = (count * 170) + 100 + 400 + 170//400是底部控制區高，100是Title，170是預設高
        // 设置初始状态
        nodeOpacity.opacity = 0; // 透明
        this.node.setPosition(this.initialPosition.x, this.initialPosition.y - limitY, this.initialPosition.z); // 向下偏移

        const moveY = ((this.initialPosition.y + limitY) >= 0) ? 0 : (this.initialPosition.y + limitY);

        // 使用 tween 创建动画
        tween(this.node)
            .to(0.2, { position: new Vec3(this.initialPosition.x, moveY + 10, this.initialPosition.z) }) // 先滑入
            .to(0.1, { position: new Vec3(this.initialPosition.x, moveY, this.initialPosition.z) }) // 弹性效果
            .start();
        tween(nodeOpacity)
            .to(0.3, { opacity: 255 }, { easing: 'cubicOut' }) // 0.5秒内从透明到不透明
            .start();
    }

}
