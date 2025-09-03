import { commonStore } from '@common/h5GameTools/CommonStore';
import { Logger } from '@common/utils/Logger';
import { urlHelper } from '@common/utils/UrlHelper';
import { _decorator, assetManager, Component, Sprite, SpriteFrame, Button, sp, Font, Node } from 'cc';

import { getSpritePath, loadSprite } from '@/comm/scripts/comm/GTCommUtils';
import { GTSpintBtn } from '@/comm/scripts/uicomponents/GTSpintBtn';
import { GTLoadingCommTool as CommTool } from '@/loading/script/comm/GTLoadingCommTool';

const { ccclass, property } = _decorator;
@ccclass('GTStyleManager')
export class GTStyleManager extends Component {
    @property(GTSpintBtn) public spinBtn: GTSpintBtn = null!;
    @property(Button) public fastOffBtn: Button = null!;
    @property(Button) public fastOnBtn: Button = null!;
    @property(Button) public autoSetBtn: Button = null!;
    @property(Button) public betSetBtn: Button = null!;
    @property(Button) public addBetBtn: Button = null!;
    @property(Button) public lessBetBtn: Button = null!;
    @property(Button) public settingBtn: Button = null!;
    @property(Sprite) public betIconSprite: Sprite = null!;
    @property(Button) public exchangeBtn: Button = null!;

    private gameBundle: any;
    private commonBundle: any;
    private buttonMap: Record<string, Button> = {};

    private resourcePath = 'gameCore/resources/Comm';
    private orginSourcePath = 'textures/ui';

    private requiredBtnImageNames: Record<string, Record<string, string>> = {
        spin_btn: {
            up: 'btn_spin_up',
            down: 'btn_spin_down',
            hover: 'btn_spin_hover',
            disable: 'btn_spin_disable',
            rotate: 'pic_spin',
            stop: 'pic_stop',
            infinite: 'pic_autoInfinite'
        },
        auto_btn: {
            up: 'btn_auto_up',
            down: 'btn_auto_down',
            hover: 'btn_auto_hover',
            disable: 'btn_auto_disable'
        },
        turbo_on_btn: {
            up: 'btn_turbo_on_up',
            down: 'btn_turbo_on_down',
            hover: 'btn_turbo_on_hover',
            disable: 'btn_turbo_on_disable'
        },
        turbo_off_btn: {
            up: 'btn_turbo_up',
            down: 'btn_turbo_down',
            hover: 'btn_turbo_hover',
            disable: 'btn_turbo_disable'
        },
        bet_set_btn: {
            up: 'btn_bet_up',
            down: 'btn_bet_down',
            hover: 'btn_bet_hover',
            disable: 'btn_bet_disable'
        },
        add_bet_btn: {
            up: 'btn_bet_increase_up',
            down: 'btn_bet_increase_down',
            hover: 'btn_bet_increase_hover',
            disable: 'btn_bet_increase_disable'
        },
        less_bet_btn: {
            up: 'btn_bet_decrease_up',
            down: 'btn_bet_decrease_down',
            hover: 'btn_bet_decrease_hover',
            disable: 'btn_bet_decrease_disable'
        },
        setting_btn: {
            up: 'btn_function_up',
            down: 'btn_function_down',
            hover: 'btn_function_hover',
            disable: 'btn_function_disable'
        },
        exchange_btn: {
            up: 'btn_credits_up',
            down: 'btn_credits_down',
            hover: 'btn_credits_hover',
            disable: 'btn_credits_disable'
        }
    };

    private requitedSpriteImageNames: Record<string, Record<string, string>> = {
        betInfo: {
            up: 'btn_info_bet_up'
        }
    };

    private requitedSpinBtnSpineNames: Record<string, string> = {
        spinBtn: 'spin_btn_spine'
    };

    private requitedFont: Record<string, string> = {
        spinAutoLabel: 'num_auto'
    };

    private _setSpecialSiteRule() {
        const config = commonStore.storeState.customConfig;
        if (!config.showCoinSymbol) {
            this.requiredBtnImageNames.bet_set_btn = {
                up: 'btn_bet_clean_up',
                down: 'btn_bet_clean_down',
                hover: 'btn_bet_clean_hover',
                disable: 'btn_bet_clean_disable'
            };
            this.requitedSpriteImageNames.betInfo = {
                up: 'btn_info_bet_clean_up'
            };
        }

        if (!config.canExchange || !config.showCoinSymbol) {
            this.requiredBtnImageNames.exchange_btn = {
                disable: 'btn_credits_up'
            };
        }
    }

    protected onLoad(): void {
        this._setSpecialSiteRule();
        this._setupEventListener();
        this._initializeButtonMap();
        Logger.debug('begin style check');
    }

    protected onDestroy(): void {
        // No longer needed as we are not using global events for this
    }

    private _setupEventListener() {
        // This is no longer needed as the update is triggered by a direct method call.
    }

    private _initializeButtonMap() {
        this.buttonMap = {
            spin_btn: this.spinBtn,
            auto_btn: this.autoSetBtn,
            turbo_on_btn: this.fastOnBtn,
            turbo_off_btn: this.fastOffBtn,
            bet_set_btn: this.betSetBtn,
            add_bet_btn: this.addBetBtn,
            less_bet_btn: this.lessBetBtn,
            setting_btn: this.settingBtn,
            exchange_btn: this.exchangeBtn
        };
    }

    /**
     * 公開的、可等待的方法，用於更新所有 UI 元件的風格資源。
     * @returns 一個在所有資源都更新完畢後才會完成的 Promise。
     */
    public async updateStyle(): Promise<void> {
        const gameObj = CommTool.getGameTypeObject(urlHelper.gameType);
        if (!gameObj) {
            Logger.error('無法獲取遊戲物件，中止風格更新。');
            return;
        }

        this.gameBundle = assetManager.getBundle(gameObj.name);
        this.commonBundle = assetManager.getBundle('comm');

        // 直接等待 checkAndSwapResources 這個核心非同步方法完成
        await this.checkAndSwapResources();
    }

    private async checkAndSwapResources() {
        if (!this.gameBundle) {
            Logger.error('Game bundle not found!');
            return;
        }

        try {
            // 首先，獲取所有需要用到的 SpriteFrame 資源
            const resources = await this.loadFallback(
                () => this._loadSpriteFramesFromBundle(this.gameBundle, this.resourcePath),
                () => this._loadSpriteFramesFromBundle(this.commonBundle, this.orginSourcePath)
            );

            if (!resources || resources.length === 0) {
                Logger.warn('No sprite assets found to swap.');
                // 即使沒有 SpriteFrame，Spine 和 Font 可能仍然需要更新
            }

            // 將所有獨立的更新任務放進一個 Promise 陣列中
            const updateTasks = [
                this.swapSprites(resources),
                this._updateBetInfoSprite(resources),
                this._updateSpinSpineSK(),
                this._updateSpinAutoFont()
            ];

            // 使用 Promise.all 來並行執行所有任務，並等待它們全部完成
            await Promise.all(updateTasks);
            await new Promise(resolve => setTimeout(resolve, 100));
            Logger.log('所有風格資源已成功並行更新完畢！');

        } catch (error) {
            Logger.error('Error loading resources:', error);
        }
    }

    private async loadFallback(first: () => Promise<SpriteFrame[]>, fallback: () => Promise<SpriteFrame[]>): Promise<SpriteFrame[]> {
        const result = await first();
        if (!result || result.length === 0) {
            return await fallback();
        }
        return result;
    }

    /**
     * 從指定的 AssetManager.Bundle 中非同步載入一個目錄下的所有 SpriteFrame。
     * @param bundle 要從中載入資源的 bundle。
     * @param path 相對於 bundle 的目錄路徑。
     * @returns 返回一個包含 SpriteFrame 陣列的 Promise。
     */
    private _loadSpriteFramesFromBundle(bundle: any, path: string): Promise<SpriteFrame[]> {
        if (!bundle) {
            Logger.error(`無效的 bundle，無法從路徑 "${path}" 載入資源。`);
            return Promise.resolve([]); // 返回一個空的 Promise，避免流程中斷
        }
        return new Promise(resolve => {
            bundle.loadDir(path, SpriteFrame, (err: any, assets: any) => {
                if (err) {
                    // 不再 reject，而是 log 錯誤並 resolve 一個空陣列，讓流程更健壯
                    Logger.error(`從 bundle "${bundle.name}" 載入目錄 "${path}" 失敗:`, err);
                    resolve([]);
                } else {
                    resolve(assets);
                }
            });
        });
    }

    private async _loadSpineFromBundle(path: string): Promise<sp.SkeletonData[]> {
        return new Promise((resolve, reject) => {
            this.gameBundle.loadDir(path, sp.SkeletonData, (err: any, ske: any) => {
                if (err) {
                    Logger.error(`load ${path} fail~~~!`);
                    reject(err);
                }
                resolve(ske);
            });
        });
    }

    private async _loadFontFromBundle(fontPath: string): Promise<Font> {
        return new Promise((resolve, reject) => {
            this.gameBundle.load(fontPath, Font, (err: any, font: any) => {
                if (err) {
                    Logger.error(`字體加載失敗：${fontPath}`);
                    reject(err);
                }
                resolve(font);
            });
        });
    }

    private async swapSprites(assets: SpriteFrame[]) {
        for (const buttonType of Object.keys(this.requiredBtnImageNames)) {
            const states = this.requiredBtnImageNames[buttonType];
            const targetButton = this.buttonMap[buttonType] ?? null;
            if (!targetButton) {
                Logger.warn(`Target button for ${buttonType} not found!`);
                continue;
            }

            for (const state of Object.keys(states)) {
                const requiredName = states[state];
                let matchedAsset = assets.find(asset => asset.name === requiredName);

                if ((buttonType === 'bet_set_btn' || buttonType === 'exchange_btn') && !matchedAsset) {
                    try {
                        matchedAsset = await loadSprite(getSpritePath(requiredName));
                    } catch (error) {
                        Logger.error('替代圖片加載失敗', error);
                    }
                }
                if (matchedAsset) {
                    this._assignSpriteFrameToButton(state, matchedAsset, targetButton);
                } else {
                    Logger.warn(`No matching sprite frame found for ${requiredName} in ${buttonType}`);
                }
            }
        }
    }

    private async _updateSpinSpineSK() {
        try {
            const ske = await this._loadSpineFromBundle(`${this.resourcePath}/Spine/${this.requitedSpinBtnSpineNames.spinBtn}`);
            this.spinBtn.setSpinSpineSkeletonData(ske[0]);
        } catch (error) {
            Logger.error('SPINE更新失敗', error);
        }
    }

    private async _updateSpinAutoFont() {
        try {
            const font = await this._loadFontFromBundle(`${this.resourcePath}/Fnt/${this.requitedFont.spinAutoLabel}`);
            this.spinBtn.autoLabel.font = font;
            Logger.log('字體更新成功');
        } catch (error) {
            Logger.error('字體更新失敗', error);
        }
    }

    private async _updateBetInfoSprite(assets: SpriteFrame[]) {
        const requiredName = this.requitedSpriteImageNames.betInfo.up;
        let matchedAsset = assets.find(asset => asset.name === requiredName);

        if (!matchedAsset) {
            try {
                matchedAsset = await loadSprite(getSpritePath(requiredName));
            } catch (error) {
                Logger.error('尋找自己的gameBundle更新失敗', error);
                return;
            }
        }

        this.betIconSprite.spriteFrame = matchedAsset;
    }

    private _assignSpriteFrameToButton(state: string, spriteFrame: SpriteFrame, btn: Button): void {
        let tempNodeActive = btn.node.active;
        btn.node.active = true;
        switch (state) {
            case 'up':
                btn.normalSprite = spriteFrame;
                this._updateChildSpriteFrame(btn.node, ['sprite'], spriteFrame);
                break;
            case 'down':
                btn.pressedSprite = spriteFrame;
                break;
            case 'hover':
                btn.hoverSprite = spriteFrame;
                break;
            case 'disable':
                btn.disabledSprite = spriteFrame;
                break;
            case 'rotate':
                this._updateChildSpriteFrame(btn.node, ['sprite', 'rotate'], spriteFrame);
                break;
            case 'stop':
                this._updateChildSpriteFrame(btn.node, ['sprite', 'stopicon'], spriteFrame);
                break;
            case 'infinite':
                this._updateChildSpriteFrame(btn.node, ['sprite', 'infinite'], spriteFrame);
                break;
            default:
                Logger.warn(`Unknown state: ${state}`);
                break;
        }
        btn.node.active = tempNodeActive;
    }

    private _updateChildSpriteFrame(parent: Node, path: string[], frame: SpriteFrame): void {
        let current: Node | null = parent;
        for (const name of path) {
            current = current?.getChildByName(name) ?? null;
        }
        if (current) {
            const sprite = current.getComponent(Sprite);
            if (sprite) sprite.spriteFrame = frame;
        }
    }
}
