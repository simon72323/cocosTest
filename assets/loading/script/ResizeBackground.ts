import { _decorator, Component, Vec3, view } from 'cc';
const { ccclass } = _decorator;

@ccclass('ResizeBackground')
export class ResizeBackground extends Component {
    start() {
        this.onCanvasResize();//第一次執行
        view.on('canvas-resize', this.onCanvasResize, this);
    }

    /**
     * 更新背景尺寸
     */
    private onCanvasResize() {
        // Logger.debug("canvas 尺寸變化")
        const canvas = document.getElementsByTagName('canvas')[0];
        const imageWidth = 1200;//最小寬度
        const imageHeight = 500;//最小高度
        if (canvas.width > canvas.height) {
            // 鎖定高
            const resizeWidth = Math.max((canvas.width * (1920 / canvas.height) - 1080) / 2, imageWidth);
            const scale = new Vec3(resizeWidth / imageWidth, resizeWidth / imageWidth, 1);
            this.node.getChildByName('BG_LEFT')!.setScale(scale);
            this.node.getChildByName('BG_RIGHT')!.setScale(scale);
        } else {
            // 鎖定寬
            const resizeHeight = Math.max((canvas.height * (1080 / canvas.width) - 1920) / 2, imageHeight);
            const scale = new Vec3(resizeHeight / imageHeight, resizeHeight / imageHeight, 1);
            this.node.getChildByName('BG_TOP')!.setScale(scale);
            this.node.getChildByName('BG_BOTTOM')!.setScale(scale);
        }
    }

    onDestroy() {
        view.off('canvas-resize', this.onCanvasResize, this);
    }
}