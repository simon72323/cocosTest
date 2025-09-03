import { getPoolManager } from '@common/manager/PoolManager';
import { awaitSleep } from '@common/utils/tools';
import { _decorator, Component, tween, Node, Vec3, Prefab, Material, MeshRenderer, ParticleSystem, UIOpacity, Color, Tween } from 'cc';

import { G5279Config } from '@/games/catRaider/script/data/G5279Config';
import { getG5279Model, G5279Time } from '@/games/catRaider/script/model/G5279Model';
const { ccclass, property } = _decorator;

@ccclass('G5279Ground')
export class G5279Ground extends Component {
    //reel盤面縮放比例
    private reelScale = [
        new Vec3(1, 1, 1),
        new Vec3(5 / 6, 5 / 6, 5 / 6),
        new Vec3(5 / 7, 5 / 7, 5 / 7),
        new Vec3(5 / 8, 5 / 8, 5 / 8)
    ];

    private colorArray: Color[] = [
        new Color(255, 0, 150, 255),
        new Color(255, 200, 0, 255),
        new Color(90, 255, 0, 255),
        new Color(0, 150, 255, 255)
    ];

    @property(Node)
    private reel: Node = null!;

    @property(Node)
    private groundLayer: Node = null!;

    @property(Node)
    private sceneBlack: Node = null!;

    @property(ParticleSystem)
    private groundSmoke: ParticleSystem = null!;

    @property(Prefab)
    private ground: Prefab = null!;

    @property([Material])
    private groundMaterial: Material[] = [];

    private partyMaterialTween: Tween<any> = null!;  // 存儲tween引用

    /**
     * 預先生成地面pool
     */
    public async initGroundPool() {
        const reelPos = G5279Config.reelPos;
        for (let i = 0; i < reelPos.length; i++) {
            const groundLvNode = new Node();
            groundLvNode.setParent(this.groundLayer);
            groundLvNode.name = `groundLv${i}`;
            groundLvNode.active = false;
            const column = Math.sqrt(reelPos[i].length);//列數
            for (let j = 0; j < reelPos[i].length; j++) {
                const tempGroundPool = getPoolManager().get(this.ground);
                tempGroundPool.setPosition(reelPos[i][j]);
                tempGroundPool.setParent(groundLvNode);
                const meshRenderer = tempGroundPool.getComponent(MeshRenderer)!;
                if (i === 3) {
                    this.setGroundLv3Material(meshRenderer, column, j);
                } else
                    meshRenderer.material = this.groundMaterial[i];
            }
        }
        this.groundReset();//地面重置
    }

    /**
     * 獲得地面父節點
     * @returns 地面父節點
     */
    private getGroundParent() {
        return this.groundLayer.children[getG5279Model().currentLv];
    }

    // 地面掉落位置
    private groundDropPos = Array.from({ length: 4 }, (_, i) =>
        this.createGroundPositions(i, -6000, -3000)
    );

    // 地面上升位置
    private groundUpPos = Array.from({ length: 4 }, (_, i) =>
        this.createGroundPositions(i, 700, 1400)
    );

    // 地面回歸的起始位置
    private groundPosReset = Array.from({ length: 4 }, (_, i) =>
        this.createGroundPositions(i, -4000, -2000)
    );

    /**
     * 創建地面位置數組
     * @param level 關卡編號(0-3)
     * @param minZ 最小Z軸位置
     * @param maxZ 最大Z軸位置
     */
    private createGroundPositions(level: number, minZ: number, maxZ: number): Vec3[] {
        const positions: Vec3[] = [];
        const reelPos = G5279Config.reelPos;
        const amount = reelPos[level].length;
        for (let i = 0; i < amount; i++) {
            positions.push(new Vec3(
                reelPos[level][i].x,
                reelPos[level][i].y,
                Math.random() * (maxZ - minZ) + minZ
            ));
        }
        return positions;
    }

    /**
     * 地面處理
     * @param isLevelUp 是否升級
     */
    public async handleGround(isLevelUp: boolean) {
        if (isLevelUp) {
            await this.groundDrop();
        } else {
            await this.groundUp();
        }
    }

    /**
     * 地面掉落
     * @returns
     */
    private async groundDrop() {
        const currentLv = getG5279Model().currentLv;

        //地面煙霧
        this.groundSmoke.stop();
        this.groundSmoke.play();

        this.groundColor(true);//地面顏色變暗
        const dropTime = G5279Time.groundDropTime;

        //地面掉落
        const groundParent = this.getGroundParent();
        for (let i = 0; i < groundParent.children.length; i++) {
            const ground = groundParent.children[i];
            tween(ground)
                .to(dropTime / 1000, { position: this.groundDropPos[currentLv][i] }, { easing: 'cubicIn' })
                .start();
        }

        await awaitSleep(dropTime);
        groundParent.active = false;//隱藏地面
    }

    /**
     * 地面上升
     * @returns
     */
    private groundUp(): Promise<void> {
        return new Promise<void>(async resolve => {
            const currentLv = getG5279Model().currentLv;
            const upTime = G5279Time.groundUpTime;

            //地面上升
            const groundParent = this.getGroundParent();
            for (let i = 0; i < groundParent.children.length; i++) {
                const ground = groundParent.children[i];
                tween(ground)
                    .to(upTime / 1000, { position: this.groundUpPos[currentLv][i] }, { easing: 'cubicIn' })
                    .start();
            }
            const blackTime = 200 / getG5279Model().timeScale;
            await awaitSleep(upTime - blackTime);

            //等待畫面變暗
            const blackOpacity = this.sceneBlack.getComponent(UIOpacity)!;
            tween(blackOpacity).to(blackTime / 1000, { opacity: 255 }).call(() => {
                groundParent.active = false;//隱藏地面
                tween(blackOpacity).to(blackTime / 1000, { opacity: 0 }).start();
                resolve();
            }).start();
        });
    }

    /**
     * 地面重置
     */
    public async groundReset() {
        const currentLv = getG5279Model().currentLv;
        this.reel.setScale(this.reelScale[currentLv]);//設置縮放比例

        this.groundColor(false);//地面顏色變亮

        //地面回歸
        const reelPos = getG5279Model().getCurrentReelPos();
        const amount = reelPos.length;
        const column = Math.sqrt(amount);//列數
        const groundParent = this.getGroundParent();
        groundParent.active = true;//顯示地面
        const resetTime = G5279Time.groundDropTime;
        for (let i = 0; i < amount; i++) {
            const child = groundParent.children[i];
            const meshRenderer = child.getComponent(MeshRenderer)!;
            if (currentLv === 3)
                this.setGroundLv3Material(meshRenderer, column, i);
            else
                meshRenderer.material = this.groundMaterial[currentLv];
            child.setPosition(this.groundPosReset[currentLv][i]);//設置起始位置
            tween(child)
                .to(resetTime / 1000, { position: reelPos[i] }, { easing: 'cubicOut' })
                .start();
        }
        await awaitSleep(resetTime / 2);
    }

    /**
     * 設置等級3的地面材質
     * @param meshRenderer 地面材質
     * @param column 列數
     * @param index 索引
     */
    private setGroundLv3Material(meshRenderer: MeshRenderer, column: number, index: number) {
        //配置棋盤交錯材質
        const columnID = Math.floor(index / column) % 2 === 0 ? 1 : 0;//判斷哪一列
        const materialID = index % 2 === columnID ? 4 : 3;
        meshRenderer.material = this.groundMaterial[materialID];
    }

    /**
     * 地面顏色變化
     * @param black 是否變暗
     */
    private groundColor(black: boolean) {
        const dropTime = G5279Time.groundDropTime;
        for (const material of this.groundMaterial) {
            let colorScale = black ? new Vec3(1, 1, 1) : new Vec3(0, 0, 0);
            material.setProperty('colorScale', colorScale);
            tween(colorScale)
                .to(dropTime / 1000, { x: black ? 0 : 1, y: black ? 0 : 1, z: black ? 0 : 1 }, {
                    easing: 'sineOut',
                    onUpdate: () => material.setProperty('colorScale', colorScale)
                })
                .start();
        }
    }

    //------------------派對地面相關------------------
    /**
     * 執行地面抖動表演
     * @param posID 位置ID
     * @param shakeTime 抖動時間(毫秒)
     */
    public async runGroundAnim(posID: number, shakeTime: number) {
        this.groundMaterial[5].setProperty('color', this.colorArray[0]);
        this.groundMaterial[6].setProperty('color', this.colorArray[3]);
        const groundLayer = this.getGroundParent();
        const currentLv = getG5279Model().currentLv;
        const reelPos = getG5279Model().getCurrentReelPos();
        const column = Math.sqrt(reelPos.length);//列數

        const ground = groundLayer.children[posID];
        const position = new Vec3(ground.position.x, ground.position.y, 0);
        tween(ground)
            .to(shakeTime / 1666, { position: new Vec3(position.x, position.y, 50) }, { easing: 'cubicOut' })
            .to(shakeTime / 1666, { position }, { easing: 'cubicIn' })
            .start();
        const meshRenderer = ground.getComponent(MeshRenderer)!;
        const isEvenRow = Math.floor(posID / column) % 2 === 0;//判斷是否為偶數行
        const isEvenCol = posID % 2 === 0;

        let materialID = 0;
        if (currentLv === 1 && !isEvenRow) {
            isEvenCol ? materialID = 6 : materialID = 5;
        } else {
            isEvenCol ? materialID = 5 : materialID = 6;
        }
        meshRenderer.material = this.groundMaterial[materialID];
    }

    /**
     * 運行派對地面顏色變化
     */
    public runPartyGround() {
        const time = 0.2;
        const color = { color1: this.colorArray[0], color2: this.colorArray[3] };
        const material1 = this.groundMaterial[5];
        const material2 = this.groundMaterial[6];

        this.partyMaterialTween = tween(color)
            .sequence(
                tween().to(time, { color1: this.colorArray[1] }, {
                    easing: 'cubicIn',
                    onUpdate: () => material1.setProperty('color', color.color1)
                }),
                tween().to(time, { color2: this.colorArray[0] }, {
                    easing: 'cubicIn',
                    onUpdate: () => material2.setProperty('color', color.color2)
                }),
                tween().to(time, { color1: this.colorArray[2] }, {
                    easing: 'cubicIn',
                    onUpdate: () => material1.setProperty('color', color.color1)
                }),
                tween().to(time, { color2: this.colorArray[1] }, {
                    easing: 'cubicIn',
                    onUpdate: () => material2.setProperty('color', color.color2)
                }),
                tween().to(time, { color1: this.colorArray[3] }, {
                    easing: 'cubicIn',
                    onUpdate: () => material1.setProperty('color', color.color1)
                }),
                tween().to(time, { color2: this.colorArray[2] }, {
                    easing: 'cubicIn',
                    onUpdate: () => material2.setProperty('color', color.color2)
                }),
                tween().to(time, { color1: this.colorArray[0] }, {
                    easing: 'cubicIn',
                    onUpdate: () => material1.setProperty('color', color.color1)
                }),
                tween().to(time, { color2: this.colorArray[3] }, {
                    easing: 'cubicIn',
                    onUpdate: () => material2.setProperty('color', color.color2)
                })
            )
            .repeatForever()
            .start();
    }

    /**
     * 停止派對地面顏色變化
     */
    public stopPartyGround() {
        this.partyMaterialTween.stop();
    }
    //------------------派對地面相關------------------
}