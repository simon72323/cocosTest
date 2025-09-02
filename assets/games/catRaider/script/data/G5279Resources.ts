import { _decorator, Component, SpriteFrame } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('G5279Resources')
export class G5279Resources extends Component {
    //symbol素材
    @property([SpriteFrame])
    public symSF: SpriteFrame[] = []!;//symbol圖
    @property([SpriteFrame])
    public symBlurSF: SpriteFrame[] = []!;//symbol模糊圖

    public symArrayID: number[] = [
        1, 2, 3, 4,
        11, 12, 13, 14, 15, 16, 17, 18,
        21, 22, 23, 24, 25, 26, 27, 28,
        31, 32, 33, 34, 35, 36, 37, 38,
        41, 42, 43, 44, 45, 46, 47, 48,
        51, 52, 53, 54, 55, 56
    ];

    /**
     * 釋放資源
     */
    private release(): void {
        this.symSF = [];
        this.symBlurSF = [];
    }

    protected onDestroy(): void {
        this.release();//釋放資源
    }
}