import { _decorator, Component, Vec3, tween, Tween } from 'cc';
const { ccclass } = _decorator;

@ccclass('CGChipTweenOnEnable')
export class CGChipTweenOnEnable extends Component {

    public onEnable(): void {
        this.node.setScale(new Vec3(1, 1, 1));
        const time = 0.15;
        tween(this.node).to(time, { scale: new Vec3(1.1, 1.1, 1) }, { easing: 'cubicOut' }).start();
        tween(this.node.parent!.getChildByName('Label')!).to(time, { scale: new Vec3(1, 1.1, 1) }, { easing: 'cubicOut' }).start();
    }

    public onDisable(): void {
        Tween.stopAllByTarget(this.node);
        Tween.stopAllByTarget(this.node.parent!.getChildByName('Label')!);
        this.node.setScale(new Vec3(1, 1, 1));
        this.node.parent!.getChildByName('Label')!.setScale(new Vec3(0.9, 1, 1));
    }
}