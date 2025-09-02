/**
 * 語系管理器 (LanguageManager) - 用於管理遊戲多語言資源
 * 
 * 使用方式：
 * 1. 獲取實例：
 *    const langManager = LanguageManager.getInstance('遊戲名稱');
 * 
 * 2. 獲取語系翻譯文本：
 *    const data = await langManager.getLanguageData('資料夾名稱');
 *    // 返回對應語系的 JSON 數據
 * 
 * 3. 獲取語系圖片：
 *    const spriteFrame = await langManager.getSpriteFrame('圖片名稱', '資料夾名稱');
 *    // 返回對應語系的 SpriteFrame
 * 
 * 4. 獲取語系音效：
 *    const audioClip = await langManager.getAudioClip('音效名稱', '資料夾名稱');
 *    // 返回對應語系的 AudioClip
 * 
 * 5. 獲取語系spine：
 *    const skeletonData = await langManager.getSkeletonData('spine名稱', '資料夾名稱');
 *    // 返回對應語系的 spineSkeletonData
 * 
 * 資源路徑規範：
 * - 語系文本：langResources/{folder}/{語系}/{語系}.json
 * - 語系圖片：langResources/{folder}/{語系}/texture/{圖片名稱}/spriteFrame
 * - 語系音效：langResources/{folder}/{語系}/audio/{音效名稱}
 * - 語系spine：langResources/{folder}/{語系}/spine/{spine名稱}
 * 
 * 注意事項：
 * - 使用單例模式，確保整個應用程序中只有一個語系管理器實例
 * - 若指定語系資源不存在，將自動使用英文（en）作為預設語系
 * - 使用前必須設置遊戲名稱（gameName）
 */
import { _decorator, SpriteFrame, assetManager, AudioClip, JsonAsset, AssetManager, Component, Node, director, sp } from 'cc';
import { urlHelper } from '@common/utils/UrlHelper';
import { Logger } from '@common/utils/Logger';
import { LocalizedLabel } from '@common/components/localization/LocalizedLabel';
import { LocalizedSprite } from '@common/components/localization/LocalizedSprite';
import { LocalizedAudioSource } from '@common/components/localization/LocalizedAudioSource';
import { LocalizedSpineSkeleton } from '@common/components/localization/LocalizedSpineSkeleton';
import { LocalizedButtonSprite } from '@common/components/localization/LocalizedButtonSprite';

const { ccclass } = _decorator;

@ccclass('LanguageManager')
export class LanguageManager extends Component {
    private static _instance: LanguageManager | null = null;
    private _bundleName: string = '';

    /**
     * 獲取實例
     * @param bundleName 遊戲名稱
     * @returns 實例
     */
    public static getInstance(bundleName?: string): LanguageManager {
        if (!LanguageManager._instance) {
            const node = new Node('LanguageManager');
            director.getScene()!.addChild(node);
            director.addPersistRootNode(node);
            LanguageManager._instance = node.addComponent(LanguageManager);
        }

        // 如果有 bundleName，直接設置（避免循環調用）
        if (bundleName) {
            LanguageManager.setBundleName(bundleName);
        }

        return LanguageManager._instance;
    }

    /**
     * 加載語言包
     * @param bundleName bundle名稱
     */
    public static loadLanguageBundle(bundleName: string) {
        // 確保實例存在
        if (!LanguageManager._instance) {
            LanguageManager._instance = LanguageManager.getInstance();
        }
        LanguageManager.setBundleName(bundleName);
    }


    /**
     * 設置語言包
     * @param bundleName 語言包名稱
     */
    private static setBundleName(bundleName: string) {
        LanguageManager._instance!._bundleName = bundleName;
        LanguageManager._instance!.updateAllLocalizedComponents();
    }

    /**
     * 更新場景下的所有Localized組件
     */
    private updateAllLocalizedComponents() {
        // 更新場景下的spineSkeleton
        const localizedSpines = director.getScene()!.getComponentsInChildren(LocalizedSpineSkeleton);
        for (const spine of localizedSpines) {
            spine.setSpineSkeleton();
        }
        // 更新場景下的audioSource
        const localizedAudio = director.getScene()!.getComponentsInChildren(LocalizedAudioSource);
        for (const audio of localizedAudio) {
            audio.setAudioClip();
        }
        // 更新場景下的spriteFrame
        const localizedSprites = director.getScene()!.getComponentsInChildren(LocalizedSprite);
        for (const sprite of localizedSprites) {
            sprite.setSpriteFrame();
        }
        // 更新場景下的spriteButton
        const localizedSpriteButtons = director.getScene()!.getComponentsInChildren(LocalizedButtonSprite);
        for (const spriteButton of localizedSpriteButtons) {
            spriteButton.updateSpriteFrame();
        }
        // 更新場景下的label
        const localizedLabels = director.getScene()!.getComponentsInChildren(LocalizedLabel);
        for (const label of localizedLabels) {
            label.setLabel();
        }
    }
    /**
     * 釋放資源
     */
    protected onDestroy() {
        if (this !== LanguageManager._instance) {
            return;
        }
        LanguageManager._instance = null;
    }

    /**
     * 獲取語系翻譯資料(語系.json)
     * @param folder 資料夾名稱(預設為gameCore)
     * @returns 語系翻譯資料
     */
    public async getLanguageData(folderName: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const bundle = await this.getBundle();
            const lang = urlHelper.lang;
            const langPath = `langResources/${folderName}/${lang}/${lang}`;
            const defaultPath = `langResources/${folderName}/en/en`;
            const languageData = bundle?.get(langPath, JsonAsset) || bundle?.get(defaultPath, JsonAsset);//語系.json
            if (languageData) {
                resolve(languageData.json);
            } else {
                Logger.error(`無法獲取${lang}語系翻譯資料: ${langPath}`);
            }
        });
    }

    /**
     * 取得遊戲語系spriteFrame
     * @param spriteName 圖片名稱
     * @param folder 資料夾名稱(預設為gameCore)
     * @returns spriteFrame
     */
    public async getSpriteFrame(spriteName: string, folderName: string): Promise<SpriteFrame> {
        return new Promise(async (resolve, reject) => {
            const bundle = await this.getBundle();
            const lang = urlHelper.lang;
            const langPath = `langResources/${folderName}/${lang}/texture/${spriteName}/spriteFrame`;
            const defaultPath = `langResources/${folderName}/en/texture/${spriteName}/spriteFrame`;
            const spriteFrame = bundle?.get(langPath, SpriteFrame) || bundle?.get(defaultPath, SpriteFrame);
            if (spriteFrame) {
                resolve(spriteFrame);
            } else {
                Logger.error(`無法獲取${lang}語系SpriteFrame: ${langPath}`);
            }
        });
    }

    /**
     * 取得語系audioClip
     * @param audioName 音效名稱
     * @param folder 資料夾名稱(預設為gameCore)
     * @returns audioClip
     */
    public async getAudioClip(audioName: string, folderName: string): Promise<AudioClip> {
        return new Promise(async (resolve, reject) => {
            const bundle = await this.getBundle();
            const lang = urlHelper.lang;
            const langPath = `langResources/${folderName}/${lang}/audio/${audioName}`;
            const defaultPath = `langResources/${folderName}/en/audio/${audioName}`;
            const audioClip = bundle?.get(langPath, AudioClip) || bundle?.get(defaultPath, AudioClip);
            if (audioClip) {
                resolve(audioClip);
            } else {
                Logger.error(`無法獲取${lang}語系AudioClip: ${langPath}`);
            }
        });
    }

    /**
     * 取得遊戲語系spineSkeletonData
     * @param spineName 圖片名稱
     * @param folder 資料夾名稱(預設為gameCore)
     * @returns spineSkeletonData
     */
    public async getSkeletonData(spineName: string, folderName: string): Promise<sp.SkeletonData> {
        return new Promise(async (resolve, reject) => {
            const bundle = await this.getBundle();
            const lang = urlHelper.lang;
            const langPath = `langResources/${folderName}/${lang}/spine/${spineName}`;
            const defaultPath = `langResources/${folderName}/en/spine/${spineName}`;
            const skeletonData = bundle?.get(langPath, sp.SkeletonData) || bundle?.get(defaultPath, sp.SkeletonData);
            if (skeletonData) {
                resolve(skeletonData);
            } else {
                Logger.error(`無法獲取${lang}語系spineSkeleton: ${langPath}`);
            }
        });
    }

    /**
     * 獲取遊戲bundle
     * @returns bundle
     */
    private async getBundle(): Promise<AssetManager.Bundle | null> {
        if (!this._bundleName) {
            Logger.error('Game name is not set');
            return null;
        }
        const existingBundle = assetManager.getBundle(this._bundleName);
        if (existingBundle) {
            return existingBundle;
        }

        return new Promise((resolve, reject) => {
            assetManager.loadBundle(this._bundleName, (err, bundle) => {
                if (err) {
                    Logger.error(`無法獲取${this._bundleName} bundle: ${err}`);
                    return;
                }
                resolve(bundle);
            });
        });
    }
}

export const getLanguageManager = () => {
    return LanguageManager.getInstance();
}