import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Animation } from 'cc';
import { CGUtils } from '../tools/CGUtils';
import { CGAudioName } from '../manager/CGAudioName';
import { RoadMapRate } from '../enum/CGInterface';
import { ColorID } from '../enum/CGEnum';
import { Logger } from '@common/utils/Logger';
import { getAudioManager } from '@common/manager/AudioManager';

const { ccclass, property } = _decorator;

@ccclass('CGRoadView')
export class CGRoadView extends Component {
    @property(Node)//走勢
    private roadMap!: Node;
    @property(Node)//走勢彈窗
    private roadMapPopup!: Node;
    @property(Node)//關閉彈窗按鈕
    private btnClose!: Node;
    @property([SpriteFrame])//路紙區骰子顏色
    private roadColorSF!: SpriteFrame[];

    /**
     * 設置按鈕事件監聽器
     */
    protected onLoad(): void {
        this.bindButtonEvent(this.roadMap, 'roadMapPopupShow'); //顯示彈窗按鈕設置
        this.bindButtonEvent(this.btnClose, 'roadMapPopupHide'); //關閉彈窗按鈕設置
    }

    /**
     * 按鈕事件設置
     * @param touchNode 觸發節點 
     * @param handler 函數名稱
     * @param customData 自定義事件數據?
     */
    private bindButtonEvent(touchNode: Node, handler: string, customData?: string) {
        const componentName = this.name.match(/<(.+)>/)?.[1] || '';
        CGUtils.bindButtonEvent(this.node, componentName, touchNode, handler, customData);
    }

    /**
     * 更新路紙
     * @contorller
     * @param roadMap 前100局路紙
     * @param roadMapRate 路紙率Ｆ
     */
    public updateRoadMap(roadMap: string[], roadMapRate: RoadMapRate) {
        const colorMap = this.roadMap.getChildByName('ColorMap')!;
        const popupColorMap = this.roadMapPopup.getChildByName('ColorMap')!;
        // Logger.debug("roadMapRate", roadMapRate);
        let colorCount: number[] = [roadMapRate.Yellow, roadMapRate.Grey, roadMapRate.Purple, roadMapRate.Blue, roadMapRate.Red, roadMapRate.Green];
        let totalCount = CGUtils.sumArray(colorCount);
        for (let i = 0; i < colorCount.length; i++) {
            const percentage = (colorCount[i] / totalCount * 100).toFixed(2);
            colorMap.children[i].getComponent(Label)!.string = `${percentage}%`;
            popupColorMap.children[i].getComponent(Label)!.string = `${percentage}\n%`;
        }
        this.updateLastColors(roadMap);// 更新上局顏色
        // Logger.debug(colorCount, colorMap, popupColorMap);
        this.updateHotColdValues(colorCount, colorMap, popupColorMap);// 更新冷熱值
    }

    /**
     * 更新路紙，上局顏色
     * @param roadMap 前10局路紙
     */
    private updateLastColors(roadMap: string[]) {
        if (!roadMap || roadMap.length === 0) {
            Logger.debug('暫無開獎紀錄');
            return;
        }
        const lastColor = this.roadMap.getChildByName('LastColor')!;
        const popupLastColor = this.roadMapPopup.getChildByName('LastColor')!;
        this.colorMapUpdate(roadMap[0], lastColor);
        lastColor.getComponent(Animation)!.play();//最新路紙更新動態
        const roadmapLength = Math.min(roadMap.length, 10)
        for (let i = 0; i < roadmapLength; i++) {
            if (!popupLastColor.children[i].active)
                popupLastColor.children[i].active = true;
            this.colorMapUpdate(roadMap[i], popupLastColor.children[i]);
        }
    }

    /**
     * 更新路紙貼圖
     * @param colorName 上局顏色
     * @param node 路紙節點
     */
    private colorMapUpdate(colorName: string, node: Node) {
        for (let i = 0; i < 3; i++) {
            const colorID = colorName.split('-').map(color => ColorID[color as keyof typeof ColorID]);
            node.children[i].getComponent(Sprite)!.spriteFrame = this.roadColorSF[colorID[i]];
        }
    }

    /**
     * 更新路紙，冷熱值
     * @param colorCount 前100局各顏色出現次數
     * @param colorMap 顏色路紙節點
     * @param popupColorMap 彈窗顏色路紙節點
     */
    private updateHotColdValues(colorCount: number[], colorMap: Node, popupColorMap: Node) {
        const updateElement = (type: 'Hot' | 'Freeze') => {
            const value = type === 'Hot' ? Math.max(...colorCount) : Math.min(...colorCount);
            const index = colorCount.indexOf(value);
            [colorMap, popupColorMap].forEach(node => {
                const element = node.getChildByName(type)!;
                element.active = colorCount.lastIndexOf(value) === index;
                element.active && element.setPosition(node.children[index].getPosition());
            });
        };
        updateElement('Hot');//更新熱值
        updateElement('Freeze');//更新冷值
    }

    /**
     * 路紙視窗顯示
     */
    private roadMapPopupShow() {
        getAudioManager().playSound(CGAudioName.BtnOpen);
        CGUtils.popupShow(this.roadMapPopup);
    }

    /**
     * 路紙視窗關閉
     */
    private roadMapPopupHide() {
        getAudioManager().playSound(CGAudioName.BtnClose);
        CGUtils.popupHide(this.roadMapPopup);
    }
}