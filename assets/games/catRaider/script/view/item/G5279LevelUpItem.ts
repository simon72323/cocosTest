
import { _decorator, Animation, Component, Sprite } from 'cc';
import { awaitSleep } from '@common/utils/tools';
import { getAudioManager } from '@common/manager/AudioManager';

import { SymbolNode } from '../../data/G5279Interface';
import { G5279AudioName } from '../../data/G5279AudioEnum';
import { G5279Resources } from '../../data/G5279Resources';
import { getG5279Model, G5279Time } from '../../model/G5279Model';

const { ccclass, property } = _decorator;

@ccclass('G5279LevelUpItem')
export class G5279LevelUpItem extends Component {
    @property(G5279Resources)
    private resources: G5279Resources = null!;

    /**
     * 播放symbol升級動畫
     * @param symbol 符號節點
     */
    public async symbolLevelUp(symbol: SymbolNode) {
        const showTime = G5279Time.itemShowTime;
        const timeScale = getG5279Model().timeScale;
        await awaitSleep(showTime * 0.1);

        //如果寶石等級小於8，symbolID就會加一級，否則就不加(但還是會跑表演)
        if (symbol.symbolID % 10 < 8) {
            symbol.symbolID++;
        }

        const anim = symbol.getComponent(Animation)!;
        anim.getState('levelUp').speed = timeScale;
        anim.play('levelUp');
        await awaitSleep(showTime * 0.35);//等待升級特效落下後才執行變換
        getAudioManager().playSound(G5279AudioName.symTransform);
        const symGemPos = this.resources.symArrayID.indexOf(symbol.symbolID);
        const sym = symbol.getChildByName('sym')!;
        sym.getComponent(Sprite)!.spriteFrame = this.resources.symSF[symGemPos];
        sym.getChildByName('symAdd')!.getComponent(Sprite)!.spriteFrame = this.resources.symSF[symGemPos];
        sym.getChildByName('blur')!.getComponent(Sprite)!.spriteFrame = this.resources.symBlurSF[symGemPos];
        await awaitSleep(showTime * 0.45);
        const animName = symbol.isWin ? 'win' : 'idle';//中線的回歸win動態，其他idle動態
        anim.play(animName);
    }
}