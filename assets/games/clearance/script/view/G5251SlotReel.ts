import { getPoolManager } from '@common/manager/PoolManager';
import { _decorator, Component, Node, UITransform, Prefab } from 'cc';

import { REEL_DATA } from '@/games/clearance/script/types/G5251ReelData';
import { G5251SymbolSetting } from '@/games/clearance/script/view/prefab/G5251SymbolSetting';

const { ccclass, property } = _decorator;

@ccclass('G5251SlotReel')
export class G5251SlotReel extends Component {
    //預置體
    @property(Prefab)
    private symbolRun: Prefab = null!;//symbolRun預置體

    /**
     * 生成slot初始盤面symbol
     */
    public createSlotReel() {
        //配置節點
        const reelSymbolID = REEL_DATA.initSymbolID;//獲得初始symbolID
        const symbolSizeWidth = REEL_DATA.baseSymbolSize.width;//獲得symbol寬度
        const symbolSizeHeight = REEL_DATA.baseSymbolSize.height;//獲得symbol高度
        const reelPosition = REEL_DATA.reelPosition;//獲得reel位置
        //生成slot節點與symbol
        for (let i = 0; i < reelSymbolID.length; i++) {
            const slotRunNode = new Node(`slotRun${i}`);
            slotRunNode.addComponent(UITransform);
            slotRunNode.getComponent(UITransform)!.setContentSize(symbolSizeWidth, reelPosition[i].height);
            slotRunNode.parent = this.node;
            slotRunNode.setPosition(reelPosition[i].x, 0, 0);
            const TempSymbolsNode = new Node('tempSymbols');
            TempSymbolsNode.addComponent(UITransform);
            TempSymbolsNode.parent = slotRunNode;
            TempSymbolsNode.setPosition(0, reelPosition[i].height, 0);
            const MainSymbolsNode = new Node('mainSymbols');
            MainSymbolsNode.addComponent(UITransform);
            MainSymbolsNode.parent = slotRunNode;
            MainSymbolsNode.setPosition(0, 0, 0);
            for (let j = 0; j < reelSymbolID[i].length; j++) {
                const symbolID = reelSymbolID[i][j];
                const yPos = reelPosition[i].y - symbolSizeHeight * j;
                //生成tempSymbol
                const tempSymbol = getPoolManager().get(this.symbolRun);
                tempSymbol.parent = TempSymbolsNode;
                tempSymbol.setPosition(0, yPos, 0);//設置symbol位置
                tempSymbol.getComponent(G5251SymbolSetting)!.setSymbolImage(symbolID);//設置symbol圖案
                //生成mainSymbol

                const mainSymbol = getPoolManager().get(this.symbolRun);
                mainSymbol.parent = MainSymbolsNode;
                mainSymbol.setPosition(0, yPos, 0);//設置symbol位置
                mainSymbol.getComponent(G5251SymbolSetting)!.setSymbolImage(symbolID);//設置symbol圖案
                if (symbolID === REEL_DATA.scatterID) {
                    mainSymbol.getComponent(G5251SymbolSetting)!.scatterIdle();
                }
            }
        }
    }
}