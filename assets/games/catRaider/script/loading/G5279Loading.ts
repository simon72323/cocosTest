import { urlHelper } from '@common/utils/UrlHelper';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { _decorator, Component, Label } from 'cc';
import { getLanguageManager, LanguageManager } from '@common/manager/LanguageManager';
import { G5279Config } from '../data/G5279Config';
import { LocalizedSprite } from '@common/components/localization/LocalizedSprite';

const { ccclass } = _decorator;

@ccclass('G5279Loading')
export class G5279Loading extends Component {
    async onEnable() {
        commonStore.storeMutation.setData('gameCoreVersion', '1.0.0');
        LanguageManager.loadLanguageBundle(G5279Config.bundleName);//設置語系資源(遊戲名稱)
        const languageData = await getLanguageManager().getLanguageData('loadingPage');
        const loadingTips = urlHelper.site === 'XC' ? languageData.XCLoadingTips : languageData.LoadingTips;
        const randomIndex = Math.ceil(Math.random() * 3);
        const loadingTx = this.node.getChildByName('loadingTx')!;
        loadingTx.getComponent(LocalizedSprite)!.spriteName = `tx_loading_${randomIndex}`;
        loadingTx.getComponent(LocalizedSprite)!.isLoading = true;
        loadingTx.getComponent(LocalizedSprite)!.setSpriteFrame();

        if (loadingTips.length > 0) {
            const loadLabel = loadingTips[Math.floor(Math.random() * loadingTips.length)]; //隨機獲得提示語系
            this.node.getChildByName('loadingTip')!.getComponent(Label)!.string = loadLabel;
        }
    }
}