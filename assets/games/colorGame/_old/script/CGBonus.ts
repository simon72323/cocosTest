// import { _decorator, Component, Node, instantiate, tween, Vec3, Tween, Animation, UIOpacity, Label, SpriteFrame, Sprite, Vec2, UITransform, Layers } from 'cc';
// import { CGUtils } from '../tools/CGUtils';
// import { Logger } from '@gt-npm/gt-lib-ts/es/logger';
// const { ccclass, property } = _decorator;

// @ccclass('CGBonus')
// export class CGBonus extends Component {
//     @property({ type: Node, tooltip: "要噴的節點" })
//     private coin: Node[] = [];
//     @property({ type: Node, tooltip: "要噴的父階層" })
//     private coinParent: Node = null;
//     @property({ type: Node, tooltip: "額度" })
//     private bonusCredit: Node = null;
//     @property({ type: Node, tooltip: "亮燈" })
//     private bulbLight: Node = null;
//     @property({ type: Node, tooltip: "slot節點" })
//     private slotNode: Node = null;
//     @property({ type: [SpriteFrame], tooltip: "勝利倍率貼圖" })
//     private bonusWinSF: SpriteFrame[] = [];
//     private spinBool: Boolean = false;//是否轉動階段
//     private txCount: number = 20;//彩金滾動張數

//     start() {
//         this.scheduleOnce(() => {
//             this.showBonus(2000, 3, () => { });
//         }, 1)
//     }

//     //顯示彩金(贏分，彩金結果id)callback
//     public async showBonus(winCredit: number, id: number, callback: any) {
//         this.creatBonusTx(id);//生成彩金節點(結果編號)
//         this.node.getComponent(UIOpacity).opacity = 0;
//         this.node.getComponent(Animation).play('BonusShow');
//         await CGUtils.Delay(0.8);
//         //開始轉動
//         this.spinBool = true;
//         tween(this.node).to(4, { scale: new Vec3(1.15, 1.15, 1) }, { easing: 'sineIn' }).start();
//         this.boxShark(this.node.getChildByName('Box'));//Box抖動
//         tween(this.slotNode.children[0]).to(4.2, { position: new Vec3(0, -110 * (this.txCount - 1), 0) }, { easing: 'cubicInOut' }).start();//執行slot轉動
//         this.lightBlink();//燈光閃爍
//         await CGUtils.Delay(4);
//         //停止轉動
//         this.spinBool = false;
//         tween(this.node).to(0.2, { scale: new Vec3(1, 1, 1) }).start();
//         this.schedule(() => {
//             this.chipRunAndDistroy(60, new Vec2(1000, 400));//噴金幣(每次噴發生成60顆金幣，xy噴發區間，噴發持續時間)
//         }, 1.2, 1, 0.01)
//         this.node.getComponent(Animation).play('BonusHide');
//         const label = this.bonusCredit.getChildByName('Label').getComponent(Label);
//         label.string = '0';
//         this.bonusCredit.active = true;
//         CGUtils.runCredit(1.7, winCredit, label);//跑分
//         await CGUtils.Delay(3);
//         //bonus退場
//         tween(this.node.getComponent(UIOpacity)).to(0.2, { opacity: 0 }).call(() => {
//             this.slotNode.children[0].destroyAllChildren();
//             this.node.active = false;
//         }).start();
//         callback();
//     }

//     //生成彩金貼圖(彩金結果id)
//     private creatBonusTx(id: number) {
//         for (let i = 0; i < this.txCount; i++) {
//             const winTx = new Node();
//             winTx.parent = this.slotNode.children[0];
//             winTx.setPosition(new Vec3(0, 110 * i, 0));
//             winTx.addComponent(UITransform);
//             winTx.addComponent(Sprite);
//             if (i === 0)
//                 winTx.getComponent(Sprite).spriteFrame = this.bonusWinSF[3];//結果圖
//             else if (i === this.txCount - 1)
//                 winTx.getComponent(Sprite).spriteFrame = this.bonusWinSF[id];//結果圖
//             else
//                 winTx.getComponent(Sprite).spriteFrame = this.bonusWinSF[Math.floor(Math.random() * 4)];//隨機圖
//             winTx.layer = Layers.Enum.UI_2D;
//         }
//     }

//     //box抖動
//     private boxShark(node: Node) {
//         node.setRotationFromEuler(new Vec3(0, 0, 3 - Math.random() * 6));
//         requestAnimationFrame(() => {
//             if (this.spinBool)
//                 this.boxShark(node);
//         });
//     }

//     //燈泡閃爍
//     private async lightBlink() {
//         this.bulbLight.getComponent(UIOpacity).opacity = 0;
//         await CGUtils.Delay(0.08);
//         this.bulbLight.getComponent(UIOpacity).opacity = 255;
//         await CGUtils.Delay(0.08);
//         if (this.spinBool)
//             this.lightBlink();
//     }

//     //生成噴金幣
//     private chipRunAndDistroy(count: number, size: Vec2) {
//         for (let i = 0; i < count; i++) {
//             this.scheduleOnce(() => {
//                 const instCoin = instantiate(this.coin[Math.floor(Math.random() * this.coin.length)]);
//                 const chipParent = new Node();
//                 instCoin.parent = chipParent;
//                 instCoin.setPosition(new Vec3(0, 0, 0));
//                 instCoin.active = true;
//                 chipParent.parent = this.coinParent;
//                 Tween.stopAllByTarget(chipParent);
//                 Tween.stopAllByTarget(instCoin);
//                 chipParent.setPosition(new Vec3(0, 0, 0));
//                 instCoin.setPosition(new Vec3(0, 0, 0));
//                 let moveX = size.x - Math.random() * size.x * 2;
//                 let moveY = size.y + Math.random() + 100;
//                 //越靠中間，y軸噴越高
//                 if (moveX > -size.x / 2 && moveX < size.x / 2) {
//                     moveY += (size.x / 2 - Math.abs(moveX)) / 2;
//                 }
//                 //水平移動
//                 const moveTime = 0.8 + Math.random() * 0.2;
//                 tween(chipParent).to(moveTime, { position: new Vec3(moveX, 0, 0) }, { easing: 'sineOut' }).call(() => {
//                     instCoin.destroy();
//                     Logger.debug("移除金幣")
//                 }).start();
//                 tween(instCoin).to(moveTime / 2, { position: new Vec3(0, moveY, 0) }, { easing: 'sineOut' }).then(
//                     tween(instCoin).to(moveTime / 2, { position: new Vec3(0, 0, 0) }, { easing: 'sineIn' })).start();
//             }, Math.random() * 1.2)
//         }
//     }
// }