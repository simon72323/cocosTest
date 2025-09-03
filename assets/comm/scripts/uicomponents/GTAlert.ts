import { GTAlertPram, GTAlertType } from '@common/h5GameTools/GTCommEvents';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { getEventManager } from '@common/manager/EventManager';
import { Logger } from '@common/utils/Logger';
import { _decorator, Button, Component, Label, Node } from 'cc';

import { geti18nTex } from '@/comm/scripts/comm/GTCommTools';
import { GTLoaderEventType } from '@/comm/scripts/comm/GTLoaderEventType';

const { ccclass, property } = _decorator;

/**
 * GTAlert 類別
 *
 * 負責顯示不同類型的警告框，並管理其回調和自動關閉功能。
 */
@ccclass('GTAlert')
export class GTAlert extends Component {
    @property(Label) titleLabel: Label = null!;
    @property(Label) contentLabel: Label = null!;
    @property(Button) closeBtn: Button = null!;
    @property(Button) cancelBtn: Button = null!;
    @property(Label) cancelBtnLabel: Label = null!;
    @property(Button) confirmBtn: Button = null!;
    @property(Label) confirmBtnLabel: Label = null!;

    private _alert: GTAlertPram = null!;

    /**
     * 顯示警告框並設置相關的文字和按鈕回調。
     * @param alert - 警告框參數。
     */
    public showAlert(alert: GTAlertPram) {
        gtmEvent.LOADER_MAIN_ALERT_SHOW(alert.content);

        this._setAlertText(alert);

        // 設置按鈕監聽器
        const listeners = this._getButtonListeners(alert);
        listeners.forEach(({ button, callback }) => {
            if(button) this._setupButtonListener(button, callback);
        });

        // 如果設置了自動取消，則配置自動取消
        if (alert.autoCancel) {
            this._setupAutoCancel(alert.autoCancel, geti18nTex(alert.cancelBtnText), this.cancelBtnLabel, alert.cancelCallback!);
        }

        this._alert = alert;

        this.node.active = true;
        getEventManager().emit(GTLoaderEventType.ALERT_IS_SHOW, true);

    }

    /**
     * 設置警告框的標題和內容。
     * @param alert - 警告框參數。
     */
    private _setAlertText(alert: GTAlertPram) {
        this.titleLabel.string = geti18nTex(alert.title);
        this.contentLabel.string = geti18nTex(alert.content);
        if (this.confirmBtnLabel) {
            this.confirmBtnLabel.string = geti18nTex(alert.confirmBtnText);
            this.reloadBtn(this.confirmBtn);
        }
        if (this.cancelBtnLabel) {
            this.cancelBtnLabel.string = geti18nTex(alert.cancelBtnText);
            this.reloadBtn(this.cancelBtn);
        }

    }

    /**
     * 根據警告框類型獲取按鈕監聽函數。
     * @param alert - 警告框參數。
     * @returns 返回按鈕與其回調的對應列表。
     */
    private _getButtonListeners(alert: GTAlertPram) {
        const wrapCallback = (callback: Function | undefined, buttonType: string) => () => {
            // 根據按鈕類型發送不同的 GTM 事件
            switch (buttonType) {
                case 'confirm':
                    gtmEvent.LOADER_MAIN_ALERT_CONFIRM_CLICK(alert.confirmBtnText);
                    break;
                case 'cancel':
                    gtmEvent.LOADER_MAIN_ALERT_CANCEL_CLICK(alert.cancelBtnText);
                    break;
                case 'close':
                    gtmEvent.LOADER_MAIN_ALERT_CLOSE_CLICK('關閉');
                    break;
            }

            // 執行原始的 callback
            if (callback) {
                callback();
            }
        };

        switch (alert.type) {
            case GTAlertType.BASIC_NONE:
                return [{
                    button: this.closeBtn,
                    callback: wrapCallback(alert.cancelCallback, 'close')
                }];

            case GTAlertType.BASIC:
                return [{
                    button: this.confirmBtn,
                    callback: wrapCallback(alert.confirmCallback, 'confirm')
                }];

            case GTAlertType.DIALOG:
                return [
                    {
                        button: this.cancelBtn,
                        callback: wrapCallback(alert.cancelCallback, 'cancel')
                    },
                    {
                        button: this.confirmBtn,
                        callback: wrapCallback(alert.confirmCallback, 'confirm')
                    },
                    {
                        button: this.closeBtn,
                        callback: wrapCallback(alert.cancelCallback, 'close')
                    }
                ];

            case GTAlertType.ICON_ALERT_DIALOG:
                return [
                    {
                        button: this.cancelBtn,
                        callback: wrapCallback(alert.cancelCallback, 'cancel')
                    },
                    {
                        button: this.confirmBtn,
                        callback: wrapCallback(alert.confirmCallback, 'confirm')
                    }
                ];

            default:
                return [];
        }
    }

    /**
     * 設置按鈕的監聽器和回調。
     * @param button - 需要設置的按鈕。
     * @param callback - 按鈕被點擊時的回調函數。
     */
    private _setupButtonListener(button: Button, callback: () => void) {
        button.node.off(Node.EventType.TOUCH_END); // 移除之前的監聽
        button.node.once(Node.EventType.TOUCH_END, () => {
            callback?.();
            this.hideAlert();
        });
    }

    /**
     * 配置自動關閉的計時器。
     * @param sec - 自動取消的時間（秒）。
     * @param text - 取消按鈕的文本。
     * @param cancelLabel - 取消按鈕的標籤。
     * @param callback - 自動取消時的回調函數。
     */
    private _setupAutoCancel(sec: number, text: string, cancelLabel: Label, callback: () => void) {
        if (sec <= 0) return;
        let count = sec;
        this.schedule(() => {
            if (count <= 0 && callback) {
                callback?.();
                this.hideAlert();
            } else {
                if (cancelLabel) cancelLabel.string = `${text} ${count}`;
                count--;
            }
        }, 1, sec, 0.1);
    }

    /**
     * 隱藏警告框並清理相關狀態。
     */
    public hideAlert() {
        Logger.debug('hide Alert');
        this.node.active = false;
        this._alert = null!;
        this.unscheduleAllCallbacks();
        getEventManager().emit(GTLoaderEventType.ALERT_IS_SHOW, false);

    }

    private reloadBtn(btn: Button) {
        if (btn) {
            btn.interactable = false;
            btn.interactable = true;
        }
    }

}
