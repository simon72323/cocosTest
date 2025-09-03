import { Logger } from '@common/utils/Logger';
import { assetManager, BufferAsset, TextAsset } from 'cc';

import { PathInfo } from '@/games/colorGame/script/enum/CGInterface';

export class CGPathManager {
    private static _instance: CGPathManager | null = null;
    protected _isSingleton: boolean = false;
    get isSingleton(): boolean { return this._isSingleton; }
    private _rawPathData: Map<number, any> = new Map(); // 存儲原始解壓數據
    private _pako: any;
    // constructor() {
    // this.init();
    // }

    /**
     * 初始化
     */
    public async init(): Promise<void> {
        return new Promise<void>(async resolve => {
            CGPathManager._instance = this;
            try {
                //pakoMin.txt檔轉換成js檔
                await new Promise<void>(resolve => {
                    assetManager.loadBundle('colorGame', (err, bundle) => {
                        bundle.load('script/tools/pako/pakoMin', TextAsset, async (err: Error | null, asset) => {
                            const pakoScript = asset.text;
                            const scriptElement = document.createElement('script');
                            scriptElement.textContent = pakoScript;
                            document.head.appendChild(scriptElement);
                            this._pako = (window as any).pako;
                            resolve();
                        });
                    });
                });
                // //下載pako功能
                // await new Promise<void>((resolve) => {
                //     const script = document.createElement('script');
                //     script.src = 'https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js';
                //     script.onload = () => resolve();
                //     document.head.appendChild(script);
                // });
                // this.pako = (window as any).pako; // 獲取pako對象

                // 使用 Promise.all 同時加載所有資源
                const bundle = await this.loadBundle();
                const loadPromises = [];

                for (let i = 1; i < 11; i++) {
                    loadPromises.push(this.loadAndProcessPath(bundle, i));
                }

                await Promise.all(loadPromises);
                resolve();
                Logger.debug('路徑資料加載完成', this._rawPathData);
            } catch (error) {
                Logger.error('初始化失敗:', error);
            }
        });
    }

    private loadBundle(): Promise<any> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle('colorGame', (err, bundle) => {
                if (err) reject(err);
                else resolve(bundle);
            });
        });
    }

    /**
     * 加載並處理路徑數據
     * @param bundle 
     * @param dataID 
     * @returns 
     */
    private loadAndProcessPath(bundle: any, dataID: number): Promise<void> {
        return new Promise((resolve, reject) => {
            bundle.load(`path/CGPath${dataID * 100}`, BufferAsset, async (err: Error | null, data: BufferAsset) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {

                    const uint8Array = new Uint8Array(data.buffer());
                    const jsonData = await this.decompressData(uint8Array);
                    // 直接存儲解壓後的原始數據
                    this._rawPathData.set(dataID - 1, jsonData);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    // 只在需要時才處理具體路徑數據
    public async getPathData(dataID: number, pathIndex: number): Promise<PathInfo> {
        return new Promise<PathInfo>(resolve => {
            const rawData = this._rawPathData.get(dataID);
            const pathData = rawData[pathIndex];
            resolve({
                pos: pathData.pos.map((posArray: number[]) => posArray.map(pos => pos / 100)),
                rotate: pathData.rotate.map((rotateArray: number[]) => rotateArray.map(rotate => rotate / 1000)),
                diceNumber: pathData.diceNumber
            });
        });
    }

    /**
     * 解壓縮Gzip資料
     * @param uint8Array 
     * @returns 
     */
    async decompressData(uint8Array: Uint8Array) {
        //pako解壓縮
        const decompressed = this._pako.inflate(uint8Array);
        const jsonString = new TextDecoder().decode(decompressed);
        const jsonData = JSON.parse(jsonString);
        //CompressionStream解壓縮Gzip資料
        // const ds = new DecompressionStream('gzip');
        // const decompressedStream = new Blob([uint8Array]).stream().pipeThrough(ds);
        // const decompressedBlob = await new Response(decompressedStream).blob();
        // const jsonString = await decompressedBlob.text();
        // const jsonData = JSON.parse(jsonString);
        return jsonData;
    }

    public static getInstance(): CGPathManager {
        if (!CGPathManager._instance) {
            CGPathManager._instance = new CGPathManager();
            CGPathManager._instance._isSingleton = true;
        }
        return CGPathManager._instance;
    }

    onDestroy() {
        this._rawPathData.clear();
        CGPathManager._instance = null;  // 添加這一行以清除單例
    }
}