import { Logger } from '@common/utils/Logger';
import { _decorator, Component, SpriteFrame } from 'cc';


const { ccclass, property } = _decorator;

@ccclass('G5251Resources')
export class G5251Resources extends Component {
    private static _instance: G5251Resources | null = null;
    //symbol素材
    @property([SpriteFrame])
    public symbolSF: SpriteFrame[] = []!;//symbol圖

    @property([SpriteFrame])
    public symbolBlurSF: SpriteFrame[] = []!;//symbol模糊圖

    @property([SpriteFrame])
    public symbolWinBgSF: SpriteFrame[] = []!;//symbol1~16中獎底圖

    @property([SpriteFrame])
    public symbolWinNumSF: SpriteFrame[] = []!;//symbol1~16中獎數字圖

    @property([SpriteFrame])
    public symbolWinNumBlurSF: SpriteFrame[] = []!;//symbol1~16中獎數字模糊圖   

    /**
     * 載入資源
     */
    protected onLoad() {
        if (G5251Resources._instance) {
            this.destroy();
            return;
        }
        G5251Resources._instance = this;
    }

    /**
     * 獲得資源實例
     * @returns 資源實例
     */
    public static getInstance(): G5251Resources {
        if (!this._instance) {
            Logger.error('請先在場景中添加 G5251Resources 組件');
        }
        return this._instance!;
    }

    /**
     * 釋放資源
     */
    private release(): void {
        this.symbolSF = [];
        this.symbolBlurSF = [];
        this.symbolWinBgSF = [];
        this.symbolWinNumSF = [];
        this.symbolWinNumBlurSF = [];
    }

    protected onDestroy(): void {
        this.release();//釋放資源
        G5251Resources._instance = null;// 清理單例實例
    }
}