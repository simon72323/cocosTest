import { _decorator, Component, Node, CCString, Vec2, Button, PolygonCollider2D, EventTouch, Intersection2D, UITransform, Vec3, Toggle } from 'cc';
import { getEventManager } from '@common/manager/EventManager';
import { Logger } from '@common/utils/Logger';
const { ccclass, property } = _decorator;

@ccclass('CGButtonEvent')
export default class CGButtonEvent extends Component {
    @property(Node)
    public target: Node = null!;
    @property(CCString)
    public param: string = '';

    private eventEmitter: EventManager = null!;

    onLoad() {
        this.eventEmitter = getEventManager().getInstance();
    }

    public start(): void {
        const polygon = this.getComponent(PolygonCollider2D);
        const toggle = this.getComponent(Toggle);
        const button = this.getComponent(Button);

        if (polygon) {
            polygon.enabled = false;
            if (button)
                this.node.on(Node.EventType.TOUCH_END, this.onPolygonTouchEnd, this);
        } else if (toggle)
            this.node.on(Node.EventType.TOUCH_END, this.onToggleTouchEnd, this);
        else if (button)
            this.node.on(Node.EventType.TOUCH_END, this.onButtonTouchEnd, this);
        else
            Logger.debug('ButtonEvent:腳本:未找到相關屬性');
        
    }

    public onPolygonTouchEnd(event: EventTouch): void {
        const tPos = event.getUILocation();//滑鼠點擊的位置
        const nodePos: Vec2 = event.target.getComponent(UITransform)!.node.getWorldPosition(new Vec3());
        const subPos = new Vec2(tPos.x - nodePos.x, tPos.y - nodePos.y);
        if (this.hitTest(subPos)) {
            if (this.getComponent(Button)!.interactable) {
                // Logger.debug("Polygon點擊 ")
                this.getEventManager().emit('OnButtonEventPressed', this.param);
            } else
                this.getEventManager().emit('OnButtonEventPressFailed', this.param);
        }
    }

    public onToggleTouchEnd(event: EventTouch): void {
        if (this.getComponent(Toggle)!.interactable) {
            // Logger.debug("Toggle點擊 ")
            this.getEventManager().emit('OnButtonEventPressed', this.param);
        } else
            this.getEventManager().emit('OnButtonEventPressFailed', this.param);
    }

    public onButtonTouchEnd(event: EventTouch): void {
        if (this.getComponent(Button)!.interactable) {
            // Logger.debug("Button點擊 ")
            this.getEventManager().emit('OnButtonEventPressed', this.param);
        } else
            this.getEventManager().emit('OnButtonEventPressFailed', this.param);
    }

    private hitTest(point: Vec2): boolean {
        const polygonCollider = this.getComponent(PolygonCollider2D)!;
        // Logger.debug("PolygonCollider2D點擊區域 ", polygonCollider.points)
        return Intersection2D.pointInPolygon(point, polygonCollider.points);
    }
}