
import { commonStore } from '@common/h5GameTools/CommonStore';
import { watch } from '@common/utils/Reactivity';
import { urlHelper } from '@common/utils/UrlHelper';
import { _decorator, Component, Label, find } from 'cc';
const { ccclass } = _decorator;

@ccclass('GTBottomNode')
export class GTBottomNode extends Component {
    private userID: Label = null!;
    private gameType: Label = null!;
    private wagerID: Label = null!;
    public onLoad(): void {
        const userIDNode = find('Canvas/gameNode/PubVersion/Portrait/BottomNode/UserID');
        const gameTypeNode = find('Canvas/gameNode/PubVersion/Portrait/BottomNode/GameType');
        const wagerIDNode = find('Canvas/gameNode/PubVersion/Portrait/BottomNode/WagerID/Label');

        if (userIDNode) {
            this.userID = userIDNode.getComponent(Label)!;
            this.userID.node.active = !urlHelper.isDemo;
        }

        if (gameTypeNode) {
            this.gameType = gameTypeNode.getComponent(Label)!;
        }

        if (wagerIDNode) {
            this.wagerID = wagerIDNode.getComponent(Label)!;
            this.wagerID.node.active = !urlHelper.isDemo;
        }
    }
    start() {
        watch(() => commonStore.storeState.userID, (_newA, _oldA) => {
            this._setUserID();
        });
        watch(() => commonStore.storeState.wagersID, (_newA, _oldA) => {
            this._setWagerID();
        });
        this._setGameType();
        this._setUserID();
    }
    /**
     * 設定userID
     */
    private _setUserID(): void {
        if (!this.userID) return;
        let userID = commonStore.storeState.userID.toString();
        const tempId = userID.split(':');
        userID = tempId.length > 1 ? tempId[1] : userID;
        this.userID.string = (userID === '0') ? '' : userID;
    }
    /**
     * 設定gameType
     */
    private _setGameType(): void {
        if (!this.gameType) return;
        this.gameType.string = urlHelper.gameType;
    }
    /**
     * 設定WagerID
     */
    private _setWagerID(): void {
        if (!this.wagerID) return;
        let wagersId = commonStore.storeState.wagersID;
        this.wagerID.string = (wagersId === '0') ? '' : wagersId;
    }
}

