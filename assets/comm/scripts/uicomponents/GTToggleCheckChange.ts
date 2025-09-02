import { Logger } from "@common/utils/Logger";
import { _decorator, Component, EventHandler, Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GTToggleCheckChange')
export class GTToggleCheckChange extends Component {
    onLoad() {
        const eventHandler = new EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = 'GTToggleCheckChange';
        eventHandler.handler = 'onToggleChange';
        Logger.debug(' GTToggleCheckChange ');
        //添加check事件 
        this.node.getComponent(Toggle)!.checkEvents.push(eventHandler);
        // Logger.debug('EventHandler pushed:', eventHandler);
        // Logger.debug('Current checkEvents:', this.node.getComponent(Toggle).checkEvents);
        
        // 確保 handler 名稱正確
        Logger.debug('Handler name:', eventHandler.handler);
        
       
    }

    private onToggleChange() {
        //判斷isChecked如為true，則隱藏Sprite，反之顯示
        Logger.debug("onToggleChange ");
        this.node.getChildByName('Sprite')!.active = !this.node.getComponent(Toggle)!.isChecked;
    }
}