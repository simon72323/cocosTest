import { _decorator, Component, find, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;
import { GTAlert } from '../uicomponents/GTAlert';
import { GTLoaderEventType } from '../comm/GTLoaderEventType';
import { commonStore } from '@common/h5GameTools/CommonStore';
import { getEventManager } from '@common/manager/EventManager';
import { Comm, GTAlertPram, GTAlertType } from '@common/h5GameTools/GTCommEvents';
import { Logger } from '@common/utils/Logger';

/**
 * GTAlertPanelManager 類別
 *
 * 負責管理遊戲中的警告框面板，
 * 根據接收到的警告框類型顯示相應的警告框。
 */
@ccclass('GTAlertPanelManager')
export class GTAlertPanelManager extends Component {
    @property(GTAlert) basicNoneAlert: GTAlert = null!;
    @property(GTAlert) basicAlert: GTAlert = null!;
    @property(GTAlert) dialogAlert: GTAlert = null!;
    @property(GTAlert) iconDialogAlert: GTAlert = null!;
    @property(Node) alertPanel: Node = null!;
    @property(Sprite) maskSprite: Sprite = null!;

    // private globalGTEvent: any;

    showAlertBind!: (data: any) => void;
    closeAlertBind!: (data: any) => void;

    /**
     * 設置顯示和關閉警告框的事件監聽器。
     */
    protected onLoad(): void {
        this.showAlertBind = this.showAlert.bind(this);
        this.closeAlertBind = this._closeAlert.bind(this);

        // 添加事件監聽器
        getEventManager().on(Comm.SHOW_ALERT, this.showAlertBind);
        getEventManager().on(GTLoaderEventType.CLOSE_ALERT, this.closeAlertBind);
    }

    /**
     * 當組件銷毀時移除事件監聽器。
     */
    public onDestroy(): void {
        getEventManager().off(Comm.SHOW_ALERT, this.showAlertBind);
        getEventManager().off(GTLoaderEventType.CLOSE_ALERT, this.closeAlertBind);
    }

    start() {
        // 如果需要，可以在這裡添加其他初始化邏輯

    }

    update(deltaTime: number) {
        // 如果需要，可以在這裡添加每幀更新的邏輯
    }

    /**
     * 根據警告框類型顯示警告框。
     * @param alert - 警告框參數。
     */
    private showAlert(alert: GTAlertPram) {
        console.info(alert);

        // 變更警告窗的節點為最高節點。
        const alertNode = find('Canvas/GTAlertNode');
        if (alertNode) {
            Logger.debug('change Alert Parent');
            this.alertPanel.setParent(alertNode);
            alertNode.active = true;
        }
        // // 关闭当前已经存在的警报
        // this._closeAlert();
        this._resetAlert();
        const processedAlert = this.processAlertCallback(alert);

        this.alertPanel.active = true;

        // 根据不同类型的警报处理
        switch (alert.type) {
            case GTAlertType.BASIC_NONE:
                this.basicNoneAlert.showAlert(processedAlert);
                break;
            case GTAlertType.BASIC:
                this.basicAlert.showAlert(processedAlert);
                break;
            case GTAlertType.DIALOG:
                this.dialogAlert.showAlert(processedAlert);
                break;
            case GTAlertType.ICON_ALERT_DIALOG:
                this.iconDialogAlert.showAlert(processedAlert);
                break;
            case GTAlertType.RECONNECT:
                // XC不需要斷線重連按鈕
                this.basicNoneAlert.closeBtn.node.active = commonStore.storeState.customConfig.canReConnectGS;

                if (!commonStore.storeState.customConfig.canReConnectGS) {
                    this.basicNoneAlert.showAlert(processedAlert);
                } else {

                    alert.type = GTAlertType.BASIC;

                    const originalCallback = alert.confirmCallback;
                    alert.confirmCallback = () => {
                        // GTMEvent.shared.LOADER_MAIN_RECONNECT_ALERT();
                        if (originalCallback) {
                            try {
                                originalCallback();
                            } catch (error) {
                                console.error('Error executing original callback:', error);
                            }
                        }
                    }

                    this.basicAlert.showAlert(processedAlert);
                }
                break;
            case GTAlertType.ERROR:
                // XC不需要斷線重連按鈕
                alert.type = GTAlertType.BASIC_NONE;
                this.basicNoneAlert.closeBtn.node.active = commonStore.storeState.customConfig.canReConnectGS;
                this.basicNoneAlert.showAlert(processedAlert);
                break;
        }
    }


    /**
     * 處理警告框的回調以確保在回調後關閉警告框。
     * @param alert - 警告框參數。
     * @returns 更新後的警告框參數。
     */
    private processAlertCallback(alert: GTAlertPram): GTAlertPram {
        const callbackTypes = ['cancelCallback', 'confirmCallback', 'closeCallback'];

        for (const type of callbackTypes) {
            const callback = (alert as any)[type];
            if (callback && typeof callback === 'function') {
                (alert as any)[type] = () => {
                    this._closeAlert();
                    callback();
                };
            } else {
                (alert as any)[type] = () => {
                    this._closeAlert();
                };
            }
        }

        return alert;
    }

    /**
     * 關閉警告框面板。
     */
    private _closeAlert(): void {

        // 隐藏警报面板
        if (this.alertPanel.active) {
            //延遲一幀讓點擊事件被mask擋住不再往下傳
            this.scheduleOnce(() => {
                this._resetAlert();
                this.alertPanel.active = false;
            });
        }
    }

    private _resetAlert(): void {
        // 隐藏所有警报
        if (this.basicNoneAlert) this.basicNoneAlert.hideAlert();
        if (this.basicAlert) this.basicAlert.hideAlert();
        if (this.dialogAlert) this.dialogAlert.hideAlert();
        if (this.iconDialogAlert) this.iconDialogAlert.hideAlert();

        this.basicNoneAlert.closeBtn.node.active = true;
        this.basicAlert.confirmBtn.node.active = true;
        //this.dialogAlert.closeBtn.node.active = true;
        this.dialogAlert.confirmBtn.node.active = true;
        this.dialogAlert.cancelBtn.node.active = true;
        this.iconDialogAlert.confirmBtn.node.active = true;
        this.iconDialogAlert.cancelBtn.node.active = true;
    }

}
