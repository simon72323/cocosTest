import { getAudioManager } from '@common/manager/AudioManager';
import { Logger } from '@common/utils/Logger';
import { _decorator, Component, Node, Label, Sprite, Toggle, UIOpacity } from 'cc';

import { CGAudioName } from '@/games/colorGame/script/manager/CGAudioName';
import { CGGameData } from '@/games/colorGame/script/model/CGGameData';
import { CGUtils } from '@/games/colorGame/script/tools/CGUtils';

const { ccclass, property } = _decorator;
@ccclass('CGChipSetView')
export class CGChipSetView extends Component {
    @property(Node)//籌碼選擇區
    private touchChip!: Node;

    @property(Node)//籌碼設置按鈕
    private btnChipSet!: Node;

    @property(Node)//籌碼預設按鈕
    private btnDefault!: Node;

    @property(Node)//籌碼確認按鈕
    private btnConfirm!: Node;

    @property(Node)//關閉彈窗按鈕
    private btnClose!: Node;

    @property(Node)//籌碼設置彈窗
    private chipSetPopup!: Node;

    @property(Node)//籌碼Toggle
    private chipToggle!: Node;

    private _chipSetID: number[] = [];//當前紀錄的的籌碼ID
    private _chipSetIDing: number[] = [];//暫存選擇中的籌碼

    /**
     * 設置按鈕事件監聽器
     */
    protected onLoad(): void {
        for (let i = 0; i < this.touchChip.children.length; i++) {
            this.bindToggleEvent(this.touchChip.children[i], 'setTouchChipID', i.toString());//點選的籌碼觸發事件
        }
        const chipToggleChildren = this.chipToggle.children;
        for (let i = 0; i < chipToggleChildren.length; i++) {
            this.bindToggleEvent(chipToggleChildren[i], 'chipSet', i.toString());//選擇籌碼按鈕觸發事件
        }
        this.bindButtonEvent(this.btnChipSet, 'chipSetPopupShow');//顯示彈窗按鈕設置
        this.bindButtonEvent(this.btnConfirm, 'chipSetConfirm');//確認按鈕設置
        this.bindButtonEvent(this.btnDefault, 'chipSetDefault');//預設按鈕設置
        this.bindButtonEvent(this.btnClose, 'chipSetPopupHide');//關閉彈窗按鈕設置
    }

    /**
     * 初始化籌碼設置分數
     */
    public initSetChipCreditList() {
        const betCreditList = CGGameData.getInstance().betCreditList;
        Logger.debug('籌碼額度列表', betCreditList);
        for (let i = 0; i < betCreditList.length; i++) {
            //不能超過籌碼設置上限(介面上限12個)
            if (i < this.chipToggle.children.length) {
                this.chipToggle.children[i].active = true;//設置頁面啟用該籌碼
                this.chipToggle.children[i].getChildByName('Label')!.getComponent(Label)!.string = CGUtils.NumDigitsKM(betCreditList[i]);
            }
        }
        const dataLength = betCreditList.length;//籌碼額度列表長度
        this._chipSetID = Array.from({ length: Math.min(dataLength, 5) }, (_, i) => i);//獲取籌碼最前面1~5筆
        this.updateTouchChip();//更新籌碼設置(籌碼選擇區)
    }

    /**
     * Toggle事件設置
     * @param touchNode 觸發節點 
     * @param handler 函數名稱
     * @param customData 自定義事件數據?
     */
    private bindToggleEvent(touchNode: Node, handler: string, customData?: string) {
        const componentName = this.name.match(/<(.+)>/)?.[1] || '';
        CGUtils.bindToggleEvent(this.node, componentName, touchNode, handler, customData);
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
     * 更新籌碼設置
     * 當用戶選擇或取消選擇籌碼時調用此方法
     * @param event 觸發事件
     * @param selectChip 選擇的籌碼ID
     */
    private async chipSet(event: Event, selectChip: string) {
        const id = parseInt(selectChip);
        const isChecked = this.chipToggle.children[id].getComponent(Toggle)!.isChecked;
        if (isChecked && this._chipSetIDing.length > 1) {
            this._chipSetIDing.splice(this._chipSetIDing.indexOf(id), 1);
            getAudioManager().playOnceSound(CGAudioName.BtnClose);
        }
        else if (!isChecked) {
            this._chipSetIDing.push(id);
            getAudioManager().playOnceSound(CGAudioName.BtnOpen);
        }
        CGUtils.nextFrame(() => {
            this.updateChipSet();
        });
    }

    /**
     * 保存當前籌碼設置並更新顯示
     */
    private chipSetConfirm() {
        getAudioManager().playSound(CGAudioName.BtnOpen);
        this._chipSetID = [...this._chipSetIDing];//儲存籌碼配置
        this._chipSetID.sort((a, b) => a - b);//小到大排列
        this.updateTouchChip();//更新籌碼設置(籌碼選擇區)
        this.chipSetPopupHide();//關閉視窗
    }

    /**
     * 籌碼設置使用預設值
     */
    private chipSetDefault() {
        getAudioManager().playSound(CGAudioName.BtnOpen);
        const dataLength = CGGameData.getInstance().betCreditList.length;//籌碼額度列表長度
        this._chipSetIDing = Array.from({ length: Math.min(dataLength, 5) }, (_, i) => i);//儲存最前面1~5筆
        this.updateChipSet();//更新籌碼設置(設置頁面)
    }

    /**
     * 打開籌碼設置視窗
     */
    private chipSetPopupShow() {
        getAudioManager().playSound(CGAudioName.BtnOpen);
        this._chipSetIDing = [...this._chipSetID];
        this.updateChipSet();//更新籌碼設置(設置頁面)
        this.chipSetPopup.getChildByName('LockBtn')!.active = false;
        CGUtils.popupShow(this.chipSetPopup);
    }

    /**
     * 關閉籌碼設置視窗
     */
    private chipSetPopupHide() {
        getAudioManager().playSound(CGAudioName.BtnClose);
        this.chipSetPopup.getChildByName('LockBtn')!.active = true;
        CGUtils.popupHide(this.chipSetPopup);
    }

    /**
     * 更新籌碼設置(設置頁面)
     */
    private updateChipSet() {
        const chipToggleChildren = this.chipToggle.children;
        chipToggleChildren.forEach((child, i) => {
            const isSelected = this._chipSetIDing.indexOf(i) > -1 as boolean;
            const toggle = child.getComponent(Toggle)!;
            const opacity = child.getComponent(UIOpacity)!;
            toggle.isChecked = isSelected;
            if (this._chipSetIDing.length > 4) {
                toggle.interactable = isSelected;
                opacity.opacity = isSelected ? 255 : 80;
            } else if (!toggle.interactable) {
                toggle.interactable = true;
                opacity.opacity = 255;
            }
        });
    }

    /**
     * 設置點選的籌碼位置
     * @param event 觸發事件
     * @param touchPos 被選中籌碼的位置索引
     */
    private setTouchChipID(event: Event, touchPos: string) {
        getAudioManager().playSound(CGAudioName.ChipSelect);
        const posID = parseInt(touchPos);
        CGGameData.getInstance().setTouchChip(this._chipSetID[posID], posID);
    }

    /**
     * 更新點選的籌碼(籌碼選擇區)
     */
    private updateTouchChip() {
        const chipSetID = this._chipSetID;
        const touchChipChildren = this.touchChip.children;
        for (let i = 0; i < touchChipChildren.length; i++) {
            const touchChip = touchChipChildren[i];
            const isActive = i < chipSetID.length;
            touchChip.active = isActive;
            if (isActive) {
                const chipToggleChild = this.chipToggle.children[chipSetID[i]];
                touchChip.getChildByName('Sprite')!.getComponent(Sprite)!.spriteFrame =
                    chipToggleChild.getChildByName('Sprite')!.getComponent(Sprite)!.spriteFrame;
                touchChip.getChildByName('Checkmark')!.getComponent(Sprite)!.spriteFrame =
                    chipToggleChild.getChildByName('Checkmark')!.getComponent(Sprite)!.spriteFrame;
                touchChip.getChildByName('Label')!.getComponent(Label)!.string =
                    CGUtils.NumDigitsKM(CGGameData.getInstance().betCreditList[chipSetID[i]]);
            }
        }
        CGGameData.getInstance().setTouchChip(this._chipSetID[0], 0);
        touchChipChildren[0].getComponent(Toggle)!.isChecked = true;
    }
}