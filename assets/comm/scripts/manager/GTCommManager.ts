
import { Game } from '@common/h5GameTools/GTCommEvents';
import { getEventManager } from '@common/manager/EventManager';
import { Logger } from '@common/utils/Logger';
import { urlHelper } from '@common/utils/UrlHelper';
import { _decorator, Component, view, Node, UITransform } from 'cc';

import { GTLoadingCommTool as CommTool } from '@/loading/script/comm/GTLoadingCommTool';

const { ccclass, property } = _decorator;

@ccclass('GTCommManager')
export class GTCommManager extends Component {
    @property(Node) targetUI: Node = null!;  // 要調整大小的 UI Node

    private readonly BASE_HEIGHT = 1920;


    onExitGameBind! : (data: any) => void;

    protected onLoad(): void {
        Logger.debugSwitch = CommTool.checkIsTestMode();
        this.onExitGameBind = this._onExitGame.bind(this);
        this._setupEventListener();
    }

    start() {
        const screenHeight = view.getVisibleSize().height;

        if (this.targetUI && screenHeight > this.BASE_HEIGHT) {
            const uiTransform = this.targetUI.getComponent(UITransform);
            if (uiTransform) {
                uiTransform.height = screenHeight;
            }
        }
    }

    public onDestroy():void{
        getEventManager().off(Game.EXIT_GAME,this.onExitGameBind);
    }


    private _setupEventListener(){
        getEventManager().on(Game.EXIT_GAME, this.onExitGameBind);
    }

    private _onExitGame() {
        urlHelper.exitGame('exit');
    }
}

