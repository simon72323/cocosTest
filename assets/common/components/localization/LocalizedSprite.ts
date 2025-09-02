/**
 * 【LocalizedSprite 使用說明】
 * 
 * 功能說明：
 * - 自動根據設定的 spriteName 從 LanguageManager 獲取對應的多語言圖片
 * - 如果勾選isLoading，則會從 loadingPage 資料夾中獲取圖片，否則從 gameCore 資料夾中獲取圖片
 * 
 * 使用步驟：
 * 1. 將此組件直接掛載在包含 cc.Sprite 組件的節點上
 * 2. 在屬性檢查器中設置對應的圖片名稱
 * 3. 確保 LanguageManager 中已經載入了對應的圖片資源
 * 
 * 注意事項：
 * - spriteName 不能為空
 * - 節點必須包含 cc.Sprite 組件
 * - 依賴 LanguageManager 的正確初始化
 */
import { _decorator, Component, Sprite } from 'cc';
import { LanguageManager } from '@common/manager/LanguageManager';
const { ccclass, property } = _decorator;

@ccclass('LocalizedSprite')
export class LocalizedSprite extends Component {
    @property({ tooltip: 'spriteName' })
    public spriteName: string = '';
    @property({ tooltip: 'loadingPage' })
    public isLoading: boolean = false;

    onEnable() {
        console.warn("啟動時設置圖片語系")
        this.setSpriteFrame();//啟動時設置圖片語系
    }

    //設置sprite資源，LanguageManager會觸發
    public async setSpriteFrame() {
        if (this.spriteName === '') {
            // console.error('Sprite name is empty');
            return;
        }
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            const folderName = this.isLoading ? 'loadingPage' : 'gameCore';
            sprite.spriteFrame = await LanguageManager.getSpriteFrame(this.spriteName, folderName);
        }
    }
}