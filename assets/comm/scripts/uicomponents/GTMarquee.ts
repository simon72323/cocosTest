import { _decorator, Component, Label, UITransform, ccenum } from 'cc';
// import { log } from '../include';
const { ccclass, property, menu } = _decorator;

export enum MarqueeDirection { LEFT, RIGHT }
ccenum(MarqueeDirection)

@ccclass('GTMarquee')
@menu('Generic/GTMarquee')
export class GTMarquee extends Component {
    @property({ type: Label })
    protected textField: Label = null!;
    protected queue: string[] = [];
    private running: boolean = false;
    // public get running(): boolean { return this._running; }

    // @property( { type: CCFloat, visible: false } )
    private speed: number = 1.5;
    // @property( { type: CCFloat, tooltip: "速度", slide: true } )
    // public get speed(): number { return this._speed; }
    // public set speed(value: number) { this._speed = value; }

    // @property({ type: MarqueeDirection, tooltip: "方向" })
    // public readonly direction: MarqueeDirection = MarqueeDirection.LEFT;
    
    start() {
    }
    /** 更新 */
    update(deltaTime: number) {
        if (this.running) this.moveLeft();
    }

    /**
     * 設定顯示的內容
     * @param    str 顯示的內容
     */
    public addText(data: string) {
        this.queue.push(data);
    }
    /**
     * 開始跑馬燈
     */
    public run() {
        if (!this.node.active) {
            this.shiftQueue();
            this.node.active = true;
            this.running = true;
        }
    }
    /** 停止 */
    public stop() {
        this.running = false;
        this.node.active = false;
    }
    /** 暫停 */
    public pause() {
        this.running = false
    }
    /** 暫停:恢復 */
    public resume() {
        this.running = true;
    }
    /** 移動 */
    private moveLeft() {
        const { node } = this.textField;
        const { x, y } = node.position;
        const { width, anchorPoint } = this.getComponent(UITransform)!;
        const textWidth = node.getComponent(UITransform)!.width;

        let now: number = x + ((textWidth + width) * anchorPoint.x);
        const margin: number = -10;

        if (now < margin * this.speed) {
            this.checkQueue();
        } else {
            node.setPosition(x - this.speed, node.position.y);
        }
    }
    /**
     * 檢查queue
     */
    private checkQueue() {
        if (!this.queue.length) {
            this.stop();
        } else {
            this.shiftQueue();
        }
    }
    /**
     * 移除queue中的第一個元素
     * @returns { boolean }
     */
    private shiftQueue(): boolean {
        if (!this.queue.length) return false;
        const nodeWidth = this.getComponent(UITransform)!.width;
        this.textField.string = this.queue.shift()!;
        this.textField.updateRenderData(true);
        const textWidth = this.textField.getComponent(UITransform)!.width;
        this.textField.node.setPosition((nodeWidth + textWidth) / 2, this.textField.node.position.y);
        return true;
    }
}