/**
 * 【LocalizedSpineSkeleton 使用說明】
 * 
 * 功能說明：
 * - 自動根據設定的 spineName 從 LanguageManager 獲取對應的多語言spineSkeletonData
 * - 如果勾選isLoading，則會從 loadingPage 資料夾中獲取spineSkeletonData，否則從 gameCore 資料夾中獲取spineSkeletonData
 * 
 * 使用步驟：
 * 1. 將此組件直接掛載在包含 cc.sp.Skeleton 組件的節點上
 * 2. 在屬性檢查器中設置對應的spineName
 * 3. 確保 LanguageManager 中已經載入了對應的spineSkeleton資源
 * 
 * 注意事項：
 * - spineName 不能為空
 * - 節點必須包含 cc.sp.Skeleton 組件
 * - 依賴 LanguageManager 的正確初始化
 */
import { _decorator, Component, sp } from 'cc';
import { LanguageManager } from '@common/manager/LanguageManager';
const { ccclass, property } = _decorator;

@ccclass('LocalizedSpineSkeleton')
export class LocalizedSpineSkeleton extends Component {
    @property({ tooltip: 'spineName' })
    public spineName: string = '';
    @property({ tooltip: 'loadingPage' })
    public isLoading: boolean = false;

    onEnable() {
        this.setSpineSkeleton();//啟動時設置spine語系
    }

    //設置spine資源，由LanguageManager觸發
    public async setSpineSkeleton() {
        if (this.spineName === '') {
            // console.error('spineName is empty');
            return;
        }
        const skeleton = this.getComponent(sp.Skeleton);
        if (skeleton) {
            const folderName = this.isLoading ? 'loadingPage' : 'gameCore';
            skeleton.skeletonData = await LanguageManager.getSkeletonData(this.spineName, folderName);
        }
    }
}