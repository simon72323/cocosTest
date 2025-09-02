import { urlHelper } from '@common/utils/UrlHelper';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { _decorator, Component, Label } from 'cc';
import { LanguageManager, getLanguageManager } from '@common/manager/LanguageManager';

const { ccclass } = _decorator;

@ccclass('CGLoading')
export class CGLoading extends Component {
    async onEnable() {
        commonStore.storeMutation.setData('gameCoreVersion', '1.2.3');
        LanguageManager.loadLanguageBundle('colorGame');//設置語系資源(遊戲名稱)
        const languageData = await getLanguageManager().getLanguageData('loadingPage');
        const loadingTips = urlHelper.site === 'XC' ? languageData.XCLoadingTips : languageData.LoadingTips;
        if (loadingTips.length > 0) {
            const loadLabel = loadingTips[Math.floor(Math.random() * loadingTips.length)]; //隨機獲得提示語系
            this.node.getChildByName('loadingTip')!.getComponent(Label)!.string = loadLabel;
        }
    }
}