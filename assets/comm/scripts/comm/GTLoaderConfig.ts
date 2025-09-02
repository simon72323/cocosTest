import { BUILD } from "cc/env";
import { Component, _decorator, ccenum } from "cc";
import { Logger } from "@common/utils/Logger";

const { ccclass, property, menu, } = _decorator;

enum GameSiteCategories { Default, XC };
ccenum(GameSiteCategories)

@ccclass('PlayerConfig')
@menu('Mahjong/PlayerConfig')
export class PlayerConfig extends Component {

    @property({ tooltip: '使用自訂資料' })
    public loginOption = false;

    // @property({ type: CCString, visible: function () { return this.loginOption; } })
    // public get hostname(): string { return this._hostname; };
    // public set hostname(value: string) {
    //     this._hostname = value;
    //     this.wsUrl = `wss://${value}/fxcasino/fxLB?gameType=${this.gameType}`;
    // };
    // public _hostname: string = '127.0.0.1';

    @property({ tooltip: '自訂連線位址', displayName: 'wsUrl', visible: true })
    public wsUrl = `wss://fx8ec8.casinovir999.net/fxcasino/fxLB?gameType=5276`;
    @property({
        tooltip: '測試:登入Session',
        displayName: '🧪 Session',
        visible: function (this: PlayerConfig) { return this.loginOption; }
    })
    public session = 'bb0433b883db775484203db0e6018397a55cfb3611';

    @property({ 
        tooltip: '測試:遊戲編號', 
        displayName: '🧪 GameType', 
        visible: function (this: PlayerConfig) { return this.loginOption; } })
    public gameType = '5276';

    @property({ tooltip: '顯示重新連線' })
    public alertConnectRetries = false;

    @property({ tooltip: '關閉多國語言' })
    public nonLocalizable = false;

    @property({ tooltip: '使用自訂資料' })
    public standalone = true;

    @property({ type: GameSiteCategories, tooltip: '個平台測試' })
    public site: GameSiteCategories = GameSiteCategories.Default;

    protected async onLoad(): Promise<void> {
        if (BUILD) this.loginOption = false;
        if (this.loginOption) {
            // await localization.reload();
            // localization.nonLocalizable = this.nonLocalizable;
            if (this.site === GameSiteCategories.XC) {
                (globalThis as any)['Site'] = GameSiteCategories[GameSiteCategories.XC];
            }
            Logger.debug(`Loading override settings parent.Site: ${(globalThis as any)['Site']}`);
        }
    }
}