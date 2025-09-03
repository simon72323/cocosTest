
import { commonStore } from '@common/h5GameTools/CommonStore';
import { Comm } from '@common/h5GameTools/GTCommEvents';
import { getEventManager } from '@common/manager/EventManager';
import { _decorator, Component } from 'cc';

import { GTMarquee } from '@/comm/scripts/uicomponents/GTMarquee';

interface MarqueeData {
    marquee: {
        name: string;
        jpType: string;
        jpPayoff: string;
    };
}
const { ccclass, property } = _decorator;
/**
 * GTMarqueePanelManager 類別
 *
 * 負責管理遊戲中的跑馬燈面板。
 * 它包含一個跑馬燈組件，用於顯示遊戲中的跑馬燈效果。
 */
@ccclass('GTMarqueePanelManager')
export class GTMarqueePanelManager extends Component {
    @property(GTMarquee)
    public marquee: GTMarquee = null!;

    setMarqueeBind!: (data: any) => void;
    protected onLoad(): void {
        // 初始化
        this.marquee.stop();
        this.setMarqueeBind = this.setMarquee.bind(this);
        getEventManager().on(Comm.SET_MARQUEE, this.setMarqueeBind);

    }

    public onDestroy(): void {
        getEventManager().off(Comm.SET_MARQUEE, this.setMarqueeBind);
    }

    public setMarquee(data: MarqueeData) {
        try {
            // 檢查資料是否完整
            if (!data?.marquee?.name ||
                !data?.marquee?.jpType ||
                !data?.marquee?.jpPayoff) {
                console.warn('跑馬燈資料不完整，取消顯示');
                return;
            }

            const str = commonStore.storeState.i18n['MARQUEE_WINJP'];
            const tempData = str
                .replace('user', data.marquee.name)
                .replace('JPType', data.marquee.jpType)
                .replace('JPPayoff', data.marquee.jpPayoff);

            this.marquee.addText(tempData);
            this.marquee.run();
        } catch (error) {
            console.error('設置跑馬燈時發生錯誤：', error);
        }
    }
}

