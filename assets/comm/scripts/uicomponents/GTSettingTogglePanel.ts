import { commonStore } from '@common/h5GameTools/CommonStore';

import { Comm, GTLoaderButtonType } from '@common/h5GameTools/GTCommEvents';
import { gtmEvent } from '@common/h5GameTools/userAnalysis/GTEvent';
import { getEventManager } from '@common/manager/EventManager';
import { Logger } from '@common/utils/Logger';
import { urlHelper } from '@common/utils/UrlHelper';
import {
    _decorator, Component, Toggle, SpriteFrame, Button, Sprite
} from 'cc';

import { loadSprite, getSpritePath } from '@/comm/scripts/comm/GTCommUtils';

const { ccclass, property } = _decorator;

const SOUND_SPRITES = [
    'btn_function_soundOn_up',
    'btn_function_soundOff_up',
    'btn_function_soundOn_hover',
    'btn_function_soundOff_hover',
    'btn_function_soundOn_selected',
    'btn_function_soundOff_selected'
];

export enum GTSettingToggleType {
    NONE,
    EXIT,
    SOUND,
    EXCHANGE,
    HISTORY,
    RULE
}

export interface GTSettingTogglePanelDelegate {
    gtSettingPanel_onExitToggle(toggle: Toggle): void;
    gtSettingPanel_onSoundToggle(toggle: Toggle): void;
    gtSettingPanel_onExchangeToggle(toggle: Toggle): void;
    gtSettingPanel_onHistoryToggle(toggle: Toggle): void;
    gtSettingPanel_onRuleToggle(toggle: Toggle): void;
}

@ccclass('GTSettingTogglePanel')
export class GTSettingTogglePanel extends Component {
    @property(Toggle) public exitToggle: Toggle = null!;
    @property(Toggle) public soundToggle: Toggle = null!;
    @property(Toggle) public exchangeToggle: Toggle = null!;
    @property(Toggle) public historyToggle: Toggle = null!;
    @property(Toggle) public ruleToggle: Toggle = null!;
    @property(Button) public soundBtn: Button = null!;

    private _delegate: GTSettingTogglePanelDelegate | null = null;
    public panelType: GTSettingToggleType = GTSettingToggleType.NONE;
    private _isSpriteFramesLoaded = false;
    private _spriteFrames: Record<string, SpriteFrame> = {};

    public setDelegate(delegate: GTSettingTogglePanelDelegate): void {
        this._delegate = delegate;
    }

    private _callDelegate(methodName: keyof GTSettingTogglePanelDelegate, ...args: any[]): void {
        if (this._delegate && typeof this._delegate[methodName] === 'function') {
            (this._delegate[methodName] as Function)(...args);
        }
    }

    protected onLoad(): void {
        Logger.debug('GTSettingTogglePanel onLoad');
        this.exchangeToggle.isChecked = false;
        this.historyToggle.isChecked = false;
        this.ruleToggle.isChecked = false;

        this._setupToggleListeners();
    }

    public onEnable(): void {
        Logger.debug('GTSettingTogglePanel onEnable');

        if (!this._isSpriteFramesLoaded) {
            this._loadSpriteFrames().catch(err => {
                Logger.error('Failed to load sprite frames on enable', err);
            });
        } else {
            this._updateSoundBtnSprite(commonStore.storeState.bgAudioOn);
        }

        this._updateToggleStates();
    }

    private _registerToggleEvent(toggle: Toggle, type: GTSettingToggleType, handler?: (toggle: Toggle) => void) {
        toggle.node.on('toggle', (t: Toggle) => {
            if (t.isChecked) {
                this.panelType = type;
                if (handler) {
                    handler.call(this, t);
                }
            }
        }, this);
    }

    private _setupToggleListeners(): void {
        this._registerToggleEvent(this.exitToggle, GTSettingToggleType.EXIT, toggle => {
            this._callDelegate('gtSettingPanel_onExitToggle', toggle);
        });

        this._registerToggleEvent(this.soundToggle, GTSettingToggleType.SOUND, toggle => {
            this._callDelegate('gtSettingPanel_onSoundToggle', toggle);
        });

        this._registerToggleEvent(this.exchangeToggle, GTSettingToggleType.EXCHANGE, this._onExchangeToggle);
        this._registerToggleEvent(this.historyToggle, GTSettingToggleType.HISTORY, this._onHistoryToggle);
        this._registerToggleEvent(this.ruleToggle, GTSettingToggleType.RULE, this._onRuleToggle);
    }

    public checkByType(type: GTSettingToggleType): void {
        Logger.debug('checkByType', type);
        this.panelType = type;
    }

    public exitBtnClick(): void {
        gtmEvent.LOADER_SETTING_EXIT_CLICK();
        this._callDelegate('gtSettingPanel_onExitToggle', null);
    }

    public soundBtnClick(): void {
        const soundOn = !commonStore.storeState.bgAudioOn;
        gtmEvent.LOADER_SETTING_SOUNDSET_CLICK();
        this._updateSoundBtnSprite(soundOn);
        commonStore.storeMutation.setData('bgAudioOn', soundOn);
        commonStore.storeMutation.setData('effectAudioOn', soundOn);
    }

    private _updateSoundBtnSprite(isOpen: boolean): void {
        if (!this._spriteFrames || Object.keys(this._spriteFrames).length === 0) {
            Logger.warn('No sprite frames loaded, skipping sound button update.');
            return;
        }

        const state = isOpen ? 'On' : 'Off';
        const prefix = `btn_function_sound${state}`;
        const btn = this.soundBtn;

        btn.normalSprite = this._spriteFrames[`${prefix}_up`];
        btn.hoverSprite = this._spriteFrames[`${prefix}_hover`];
        btn.pressedSprite = this._spriteFrames[`${prefix}_selected`];

        btn.node.getComponent(Sprite)!.markForUpdateRenderData();
    }


    private _onExchangeToggle(toggle: Toggle): void {
        this._callDelegate('gtSettingPanel_onExchangeToggle', toggle);
    }

    private _onHistoryToggle(toggle: Toggle): void {
        this._callDelegate('gtSettingPanel_onHistoryToggle', toggle);
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, {
            type: GTLoaderButtonType.none
        });
    }

    private _onRuleToggle(toggle: Toggle): void {
        this._callDelegate('gtSettingPanel_onRuleToggle', toggle);
        getEventManager().emit(Comm.LOADER_BUTTON_CLICK, {
            type: GTLoaderButtonType.none
        });
    }

    public _updateToggleStates(): void {
        const toggleMap: Record<GTSettingToggleType, Toggle> = {
            [GTSettingToggleType.NONE]: null!,
            [GTSettingToggleType.EXIT]: null!,
            [GTSettingToggleType.SOUND]: null!,
            [GTSettingToggleType.EXCHANGE]: this.exchangeToggle,
            [GTSettingToggleType.HISTORY]: this.historyToggle,
            [GTSettingToggleType.RULE]: this.ruleToggle
        };

        if (this.panelType in toggleMap) {
            toggleMap[this.panelType].isChecked = true;
            Logger.debug('panel ' + toggleMap[this.panelType].isChecked);
        }

        this.historyToggle.interactable = !urlHelper.isDemo;
        this.historyToggle.interactable = commonStore.storeState.customConfig.showBetHistory;
        this.exchangeToggle.node.active = commonStore.storeState.customConfig.canExchange;

        if (!commonStore.storeState.customConfig.canLeaveGame) {
            this.exitToggle.node.active = false;
        } else {
            this.exitToggle.node.active = urlHelper.exitOption !== '3';
        }
    }

    private async _loadSpriteFrames(): Promise<void> {
        const loadSpriteSafely = async (name: string): Promise<[string, SpriteFrame | null]> => {
            try {
                const frame = await loadSprite(getSpritePath(name));
                return [name, frame];
            } catch (err) {
                Logger.error(`Failed to load sprite: ${name}`, err);
                return [name, null];
            }
        };

        const results = await Promise.all(SOUND_SPRITES.map(loadSpriteSafely));
        results.forEach(([name, frame]) => {
            if (frame) {
                this._spriteFrames[name] = frame;
            } else {
                Logger.warn(`Using default sprite for ${name}`);
                // this._spriteFrames[name] = defaultSpriteFrame; // 可選 fallback
            }
        });

        this._isSpriteFramesLoaded = true;
        this._updateSoundBtnSprite(commonStore.storeState.bgAudioOn);
    }
}
