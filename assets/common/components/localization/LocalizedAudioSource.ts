/**
 * 【LocalizedAudioSource 使用說明】
 * 
 * 功能說明：
 * - 自動根據設定的 key 值從 LanguageManager 獲取對應的多語言音頻資源
 * - 如果勾選isLoading，則會從 loadingPage 資料夾中獲取音頻，否則從 gameCore 資料夾中獲取音頻
 * 
 * 使用步驟：
 * 1. 將此組件直接掛載在包含 cc.AudioSource 組件的節點上
 * 2. 在屬性檢查器中設置對應的音頻資源 key 值
 * 3. 確保 LanguageManager 中已經載入了對應的音頻配置
 * 
 * 注意事項：
 * - key 值不能為空
 * - 節點必須包含 cc.AudioSource 組件
 * - 依賴 LanguageManager 的正確初始化
 */

import { getLanguageManager } from '@common/manager/LanguageManager';
import { _decorator, AudioSource, Component } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('LocalizedAudioSource')
export class LocalizedAudioSource extends Component {
    @property({ tooltip: 'audioName' })
    public audioName: string = '';

    @property({ tooltip: 'loadingPage' })
    public isLoading: boolean = false;

    onEnable() {
        this.setAudioClip();//啟動時設置音效語系
    }

    //設置audio資源，由LanguageManager觸發
    public async setAudioClip() {
        if (this.audioName === '') {
            // console.error('Audio name is empty');
            return;
        }
        const audioSource = this.getComponent(AudioSource);
        if (audioSource) {
            const folderName = this.isLoading ? 'loadingPage' : 'gameCore';
            audioSource.clip = await getLanguageManager().getAudioClip(this.audioName, folderName);
        }
    }
}