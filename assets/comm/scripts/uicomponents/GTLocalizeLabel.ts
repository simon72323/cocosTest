import { CCString, _decorator, Label } from 'cc';
import { geti18nTex } from '../comm/GTCommTools';
const { ccclass, property } = _decorator;

@ccclass('GTLabel')
export class GTLabel extends Label {
    @property(CCString)
    public localizeString = '';
    
    onLoad():void{
        this.string = geti18nTex(this.localizeString);
        // Logger.debug(`qqqqq : ${this.string} / ${this.localizeString}`);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}

