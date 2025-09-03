import { _decorator, Component, Vec3, Quat, Animation, Node } from 'cc';


import { ColorID } from '@/games/colorGame/script/enum/CGEnum';
import { CGPathManager } from '@/games/colorGame/script/manager/CGPathManager';
import { CGUtils } from '@/games/colorGame/script/tools/CGUtils';
const { ccclass, property } = _decorator;

@ccclass('CGDiceRunView')
export class CGDiceRunView extends Component {
    //3顆骰子起點位置
    private readonly FIRST_POSITIONS = [
        new Vec3(-1.25, 4.77, -1.83),
        new Vec3(0, 4.77, -1.83),
        new Vec3(1.25, 4.77, -1.83)
    ];

    //骰子子物件顏色方位校正值
    private readonly CHANGE_EULER = [
        [new Vec3(0, 0, 0), new Vec3(-90, 0, 0), new Vec3(0, 0, 90), new Vec3(0, 0, -90), new Vec3(90, 0, 0), new Vec3(180, 0, 0)],
        [new Vec3(90, 0, 0), new Vec3(0, 0, 0), new Vec3(0, -90, 0), new Vec3(0, 90, 0), new Vec3(0, 180, 0), new Vec3(-90, 0, 0)],
        [new Vec3(0, 0, -90), new Vec3(0, 90, 0), new Vec3(0, 0, 0), new Vec3(0, 180, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 90)],
        [new Vec3(0, 0, 90), new Vec3(0, -90, 0), new Vec3(0, 180, 0), new Vec3(0, 0, 0), new Vec3(0, 90, 0), new Vec3(0, 0, -90)],
        [new Vec3(-90, 0, 0), new Vec3(0, 180, 0), new Vec3(0, 90, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 0), new Vec3(90, 0, 0)],
        [new Vec3(180, 0, 0), new Vec3(90, 0, 0), new Vec3(0, 0, -90), new Vec3(0, 0, 90), new Vec3(-90, 0, 0), new Vec3(0, 0, 0)]
    ];

    //骰子子物件起始顏色方位值
    private readonly START_EULER = [
        new Vec3(0, 0, 0), new Vec3(0, 90, 0), new Vec3(0, 180, 0), new Vec3(0, -90, 0),
        new Vec3(-90, 0, 0), new Vec3(-90, 90, 0), new Vec3(-90, 180, 0), new Vec3(-90, -90, 0),
        new Vec3(0, 0, 90), new Vec3(0, 90, 90), new Vec3(0, 180, 90), new Vec3(0, -90, 90),
        new Vec3(0, 0, -90), new Vec3(0, 90, -90), new Vec3(0, 180, -90), new Vec3(0, -90, -90),
        new Vec3(90, 0, 0), new Vec3(90, 90, 0), new Vec3(90, 180, 0), new Vec3(90, -90, 0),
        new Vec3(180, 0, 0), new Vec3(180, 90, 0), new Vec3(180, 180, 0), new Vec3(180, -90, 0)
    ];

    @property([Node])//3顏色骰子
    private dice!: Node[];

    @property(Node)//3D開骰節點
    private frame!: Node;

    /**
     * 初始化骰子方位
     * @startColor 骰子方位參數[](0~23)
     * @controller
     */
    public diceIdle(startColor: number[]) {
        const quat = new Quat();
        Quat.fromEuler(quat, -20, 0, 0); // 將歐拉角轉換為四元數
        this.dice.forEach((dice, i) => {
            dice.setPosition(this.FIRST_POSITIONS[i]);
            dice.setRotation(quat); // 設置骰子的旋轉為四元數
            dice.children[0].setRotationFromEuler(this.START_EULER[startColor[i]]);
            dice.active = true; // 顯示骰子
        });
        this.dice[0].parent!.getComponent(Animation)!.play('DiceReset');
    }

    /**
     * 開骰表演
     * @param pathID 路徑ID
     * @param winDice 獲勝顏色
     * @returns 回傳表演結束
     */
    public async diceStart(pathID: number, winDice: string): Promise<void> {
        return new Promise<void>(async resolve => {
            const dataID = Math.floor(pathID / 100);
            const pathDataID = pathID % 100;
            const pathData = await CGPathManager.getInstance().getPathData(dataID, pathDataID)!;
            const winColor = winDice.split('-').map(color => ColorID[color as keyof typeof ColorID]);
            const diceEuler = this.diceRotate(winColor, pathData.diceNumber);//起始骰子角度
            // 四元數插值轉換(慢慢校正骰子方向)
            const targetRotations = diceEuler.map(euler => {
                const quat = new Quat();
                Quat.fromEuler(quat, euler.x, euler.y, euler.z);
                return quat;
            });
            const currentRotations = this.dice.map(dice => dice.children[0].rotation);

            this.frame.setRotationFromEuler(new Vec3(-90, 180, 0));//初始化翻板動畫
            this.frame!.getComponent(Animation)!.play();//播放翻板動畫
            const frameLength = pathData.pos.length;
            let dataFrame = 0;//播放中的路徑影格
            const diceRunTime = (frameLength / 60) * 1000;//骰子表演時間
            const diceCount = this.dice.length;
            await CGUtils.Delay(0.15);
            let lastTime = performance.now(); // 紀錄上一次更新的時間
            const updateFrame = () => {
                const currentTime = performance.now(); // 獲取當前時間
                const deltaTime = currentTime - lastTime; // 經過時間
                // 根據時間差計算 dataFrame 的增量
                dataFrame = (deltaTime / diceRunTime) * frameLength; // 根據 frameTime 調整增量
                this.dicePlay(pathData, Math.floor(dataFrame), targetRotations, currentRotations, diceCount);

                if (deltaTime >= diceRunTime) {
                    this.dice[0].parent!.getComponent(Animation)!.play('DiceLight');
                    resolve();
                } else {
                    setTimeout(updateFrame, 16.67);
                }
            };
            updateFrame();
        });
    }

    private dicePlay(pathData: any, dataFrame: number, targetRotations: Quat[], currentRotations: Quat[], diceCount: number) {
        if (!pathData.pos || !pathData.pos[dataFrame]) {
            return;
        }
        const posPath = pathData.pos[dataFrame];
        const rotatePath = pathData.rotate[dataFrame];
        const t = Math.min(dataFrame / 100, 1);

        for (let i = 0; i < diceCount; i++) {
            const dice = this.dice[i];
            let newRotation = new Quat();
            Quat.slerp(newRotation, currentRotations[i], targetRotations[i], t);
            dice.children[0].setRotation(newRotation);

            const xAdd = i * 3;
            const yAdd = i * 4;
            dice.position = new Vec3(posPath[xAdd], posPath[xAdd + 1], posPath[xAdd + 2]);
            const rotate = new Quat(rotatePath[yAdd], rotatePath[yAdd + 1], rotatePath[yAdd + 2], rotatePath[yAdd + 3]);
            const moveRotate = this.ensureQuaternionConsistency(dice.rotation, rotate);
            dice.rotation = moveRotate;
        }
    }

    /**
     * 骰子閃光
     */
    private diceLight() {

    }

    /**
     * 確保四元數一致性
     * @param q1 第一個四元數
     * @param q2 第二個四元數
     * @returns 確保一致性後的四元數
     */
    private ensureQuaternionConsistency(q1: Quat, q2: Quat): Quat {
        return Quat.dot(q1, q2) < 0 ? new Quat(-q2.x, -q2.y, -q2.z, -q2.w) : q2;
    }

    /**
     * 計算骰子校正旋轉值
     * @param winColor 開獎顏色編號
     * @param diceNumber 路徑原本的開獎顏色編號
     * @returns 三個骰子子物件的旋轉值陣列
     */
    private diceRotate(winColor: number[], diceNumber: number[]): Vec3[] {
        return [
            this.CHANGE_EULER[diceNumber[0]][winColor[0]],
            this.CHANGE_EULER[diceNumber[1]][winColor[1]],
            this.CHANGE_EULER[diceNumber[2]][winColor[2]]
        ];
    }
}