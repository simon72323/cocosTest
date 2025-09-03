/**
 * 【LocalizedSpriteButton 使用說明】
 * 
 * 功能說明：
 * - 自動根據設定的 spriteName 從 LanguageManager 獲取對應的多語言圖片
 * - 支援按鈕的四種狀態圖片：
 *   1. 一般狀態 (Normal)：滑鼠未互動時的狀態
 *   2. 按下狀態 (Pressed)：
 *      - 滑鼠在按鈕區域內按下：顯示按下圖片
 *      - 滑鼠在按鈕區域外按下：在一般和按下狀態間切換
 *   3. 懸停狀態 (Hover)：滑鼠懸停在按鈕上的狀態
 *   4. 禁用狀態 (Disabled)：按鈕被禁用時的狀態
 * - 支援從 loadingPage 或 gameCore 資料夾中獲取圖片
 * 
 * 使用步驟：
 * 1. 將此組件掛載在包含 Sprite 組件的節點上
 * 2. 在屬性檢查器中設置：
 *    - upSpriteName: 一般狀態圖片名稱
 *    - downSpriteName: 按下狀態圖片名稱
 *    - hoverSpriteName: 懸停狀態圖片名稱
 *    - disableSpriteName: 禁用狀態圖片名稱
 *    - button: 需要控制的按鈕組件
 *    - isLoading: 是否從 loadingPage 資料夾讀取圖片
 * 
 * 注意事項：
 * - 必須設置 upSpriteName（一般狀態圖片）
 * - 需要確保 LanguageManager 已正確初始化
 * - 圖片資源必須已在 LanguageManager 中載入
 */
import { getLanguageManager } from '@common/manager/LanguageManager';
import { _decorator, Button, CCString, Component, NodeEventType, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LocalizedButtonSprite')
export class LocalizedButtonSprite extends Component {
    @property(CCString)
    public upSpriteName: string = '';

    @property(CCString)
    public downSpriteName: string = '';

    @property(CCString)
    public hoverSpriteName: string = '';

    @property(CCString)
    public disableSpriteName: string = '';

    @property({ type: Button, tooltip: '主要按鈕' })
    public button: Button = null!;

    @property({ tooltip: 'loadingPage' })
    public isLoading: boolean = false;

    private isPressed: boolean = false;//紀錄是否按下狀態
    private originalUpdateState: (() => void) | null = null; // 添加這個屬性來存儲原始函數

    protected onEnable() {
        this.updateSpriteFrame();//初始化圖片
        this.originalUpdateState = this.button['_updateState'].bind(this.button);//保存原始的 _updateState
        //重寫 _updateState
        const updateStateWrapper = () => {
            if (this.originalUpdateState) {
                this.originalUpdateState();
                this.updateSpriteFrame();
            }
        };
        this.button['_updateState'] = updateStateWrapper;//重寫 _updateState
        // 添加滑鼠進入事件監聽
        this.button.node.on(NodeEventType.MOUSE_ENTER, this.updateSpriteFrame.bind(this));
        this.button.node.on(NodeEventType.MOUSE_LEAVE, this.updateSpriteFrame.bind(this));
    }

    protected onDisable() {
        this.button.node.off(NodeEventType.MOUSE_ENTER, this.updateSpriteFrame.bind(this));
        this.button.node.off(NodeEventType.MOUSE_LEAVE, this.updateSpriteFrame.bind(this));
        //恢復原始的 _updateState
        if (this.originalUpdateState) {
            this.button['_updateState'] = this.originalUpdateState;
            this.originalUpdateState = null;
        }
    }

    /**
     * 當按鈕狀態改變時，設置sprite資源
     */
    public updateSpriteFrame() {
        const button = this.button as any;
        if (!this.button.interactable) {
            // 禁用狀態
            this.setSpriteFrame(this.disableSpriteName);
        } else if (button._pressed) {
            // 按下狀態
            if (button._hovered) {
                // 在按鈕區內
                this.setSpriteFrame(this.downSpriteName);
            } else {
                // 在按鈕區外(如果回到按鈕區，要再判斷是否處於按下階段)
                const name = this.isPressed ? this.downSpriteName : this.upSpriteName;
                this.setSpriteFrame(name);
                this.isPressed = !this.isPressed;
            }
        } else if (button._hovered) {
            // 懸停狀態
            this.setSpriteFrame(this.hoverSpriteName);
        } else {
            // 一般狀態
            this.setSpriteFrame(this.upSpriteName);
            this.isPressed = false;
        }
    }

    /**
     * 設置sprite資源
     */
    private async setSpriteFrame(spriteName: string) {
        if (spriteName === '') {
            // console.error('Sprite name is empty');
            return;
        }
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            const folderName = this.isLoading ? 'loadingPage' : 'gameCore';
            sprite.spriteFrame = await getLanguageManager().getSpriteFrame(spriteName, folderName);
        }
    }
}