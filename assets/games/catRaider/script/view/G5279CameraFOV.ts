import { _decorator, Component, Camera, view, game } from 'cc';
const { ccclass } = _decorator;

@ccclass('G5279CameraFOV')
export class G5279CameraFOV extends Component {
    private camera: Camera = null!;
    private verticalFOV: number = 55;

    onLoad() {
        this.camera = this.node.getComponent(Camera)!;
        this.verticalFOV = this.camera.fov;
        this.adjustFOVAxis();
        view.on('canvas-resize', this.adjustFOVAxis, this);
    }

    /**
     * 計算水平FOV
     * @returns 水平FOV
     */
    private calculateHorizontalFOV(): number {
        return 2 * Math.atan(Math.tan(this.verticalFOV * Math.PI / 360) * (9 / 16)) * 180 / Math.PI;
    }

    /**
     * 調整FOV軸向
     */
    private adjustFOVAxis() {
        const canvas = game.canvas!;
        const gameWidth = canvas.width;
        const gameHeight = canvas.height;
        const aspect = gameWidth / gameHeight;

        if (aspect < 9 / 16) {
            this.camera.fovAxis = Camera.FOVAxis.HORIZONTAL;
            this.camera.fov = this.calculateHorizontalFOV();
        } else {
            this.camera.fovAxis = Camera.FOVAxis.VERTICAL;
            this.camera.fov = this.verticalFOV;
        }
    }

    onDestroy() {
        view.off('canvas-resize', this.adjustFOVAxis, this);
    }
}