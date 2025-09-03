import { Logger } from '@common/utils/Logger';
import { urlHelper } from '@common/utils/UrlHelper';
import { AssetManager, assetManager, instantiate, Prefab, Node, Asset, SpriteFrame } from 'cc';

import { GTLoadingCommTool as CommTool } from '@/loading/script/comm/GTLoadingCommTool';

// 將 LoadType enum 保持在外部，方便其他檔案引用
export enum LoadType {
    GameScene = 'prefab/gameScene',
    LoadingScene = 'prefab/loadingScene',
    PubVersion = 'prefab/PubVersion',
    LoadingLangRes = 'langResources/loadingPage',
    GameCoreLangRes = 'langResources/gameCore'
}

/**
 * 一個工具類，封裝了所有與資源和 bundle 加載相關的方法。
 */
export class GTLoadingTool {

    /**
     * 從遠端 URL 獲取遊戲的 hash.json 並解析出對應的 bundle 版本號。
     * @param url hash.json 的完整路徑。
     * @returns bundle 的版本號字串。
     */
    public static async GETGameHashJson(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch JSON: ' + response.statusText);
            }
            const jsonData = await response.json();
            const gameObj = CommTool.getGameTypeObject(urlHelper.gameType);
            if (!gameObj) return '';
            const value: string = jsonData.assets.bundleVers[gameObj.name];
            return value;
        } catch (err) {
            console.error(err);
            return ''; // 或 throw err; 視需求
        }
    }

    /**
     * 根據 URL 和版本號加載 AssetManager.Bundle。
     * @param url bundle 的路徑。
     * @param gameHash bundle 的版本號。
     * @returns 返回一個 Promise，解析為 AssetManager.Bundle。
     */
    public static LoadAssetManagerBundle(url: string, gameHash: string): Promise<AssetManager.Bundle> {
        Logger.debug('LoadGameLoadingBundle');
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(url, { version: gameHash }, (err: Error | null, bundle: AssetManager.Bundle) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(bundle);
                }
            });
        });
    }

    /**
     * 從指定的 bundle 中加載任何類型的資源 (Asset)。
     * @param url 資源在 bundle 中的路徑。
     * @param bundleName bundle 的名稱。
     * @returns 返回一個 Promise，解析為 Asset。
     */
    public static LoadAssetBundle(url: string, bundleName: string): Promise<Asset> {
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(bundleName);
            if (!bundle) {
                const error = new Error(`Bundle "${bundleName}" not found.`);
                Logger.error(error.message);
                return reject(error);
            }
            bundle.load(url, Asset, (err, data) => {
                if (err) {
                    Logger.error(`Failed to load asset "${url}" from bundle "${bundleName}"`, err);
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    /**
     * 從指定的 bundle 中加載 SpriteFrame 資源。
     * @param url SpriteFrame 在 bundle 中的路徑。
     * @param bundleName bundle 的名稱。
     * @returns 返回一個 Promise，解析為 SpriteFrame。
     */
    public static LoadSpriteFrameBundle(url: string, bundleName: string): Promise<SpriteFrame> {
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(bundleName);
            if (!bundle) {
                const error = new Error(`Bundle "${bundleName}" not found.`);
                Logger.error(error.message);
                return reject(error);
            }
            bundle.load(url, SpriteFrame, (err, data) => {
                if (err) {
                    Logger.error(`Failed to load SpriteFrame "${url}" from bundle "${bundleName}"`, err);
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    /**
     * 根據預定義的 Prefab 類型 (LoadType) 從 bundle 中加載並實例化為 Node。
     * @param prefabType 要加載的 Prefab 類型。
     * @param bundleName bundle 的名稱。
     * @param onProgress 進度回調函式。
     * @returns 返回一個 Promise，解析為實例化的節點 (Node)。
     */
    public static LoadBundleByPrefabType(prefabType: LoadType, bundleName: string, onProgress?: (progress: number, type: LoadType) => void): Promise<Node> {
        const bundle = assetManager.getBundle(bundleName);
        Logger.debug(`開始下載 Prefab: ${prefabType}`);
        return new Promise((resolve, reject) => {
            if (!bundle) {
                const error = new Error(`Bundle "${bundleName}" not found.`);
                Logger.error(error.message);
                return reject(error);
            }
            bundle.load(prefabType, Prefab,
                (finished, total) => {
                    if (onProgress) {
                        onProgress(finished / total * 100, prefabType);
                    }
                }, (err, prefab) => {
                    if (err) {
                        Logger.error(`Failed to load Prefab "${prefabType}" from bundle "${bundleName}"`, err);
                        return reject(err);
                    }
                    let newNode = instantiate(prefab);
                    Logger.debug(`Prefab 下載完成: ${prefabType}`);
                    resolve(newNode);
                });
        });
    }

    /**
     * 根據指定的語言，從 bundle 中加載對應的語言資源目錄。
     * @param type 語言資源的類型 (讀取哪個目錄)。
     * @param bundleName bundle 的名稱。
     * @param lang 語言代碼 (例如 'en', 'cn')。
     * @param onProgress 進度回調函式。
     * @returns 返回一個 Promise，在加載完成時解析。
     */
    public static async LoadLangSource(type: LoadType, bundleName: string, lang: string, onProgress: (progress: number, type?: LoadType) => void): Promise<void> {
        Logger.debug(`開始下載Bundle ${bundleName} Lang: ${lang}`);
        return new Promise((resolve, reject) => {
            if (bundleName == 'luckyAce') {
                onProgress(100, type);
                return resolve();
            }
            const bundle = assetManager.getBundle(bundleName);
            if (!bundle) {
                const error = new Error(`Bundle "${bundleName}" not found.`);
                Logger.error(error.message);
                return reject(error);
            }
            bundle.loadDir(type + `/${lang}`, null, (finished, total) => {
                onProgress(finished / total * 100, type);
            }, (err, data) => {
                if (err || !data.length) {
                    Logger.error(`語言資源加載失敗: ${type}/${lang}。嘗試加載預設語言 'en'。`);
                    if (lang !== 'en') {
                        GTLoadingTool.LoadLangSource(type, bundleName, 'en', onProgress).then(() => {
                            Logger.debug(`嘗試加載成功 ${bundleName} Lang: en`);
                            resolve();
                        }).catch(err => {
                            reject(new Error(`預設語言 'en' 資源也加載失敗: ${type}` + err));
                        });
                    } else {
                        reject(new Error(`預設語言 'en' 資源也加載失敗: ${type}`));
                    }
                } else {
                    resolve();
                }
            });
        });
    }
}