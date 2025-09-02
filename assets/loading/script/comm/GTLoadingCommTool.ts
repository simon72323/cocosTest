
import { urlHelper } from "@common/utils/UrlHelper";
import { Logger } from "@common/utils/Logger";
import { director, resources, SpriteFrame, sys, Vec3, view, screen, tween, Node, Sprite, UIOpacity, ResolutionPolicy, game } from "cc";
import { gameTypes } from "../../../resources/gameType";
import { GTLoadingTool } from "./GTLoadingTool";

/**
 * 一個工具類，封裝了所有與 Loading 過程相關的通用方法。
 */
export class GTLoadingCommTool {
    private static _gifContainer: HTMLDivElement | null = null;
    
    /**
     * 根據 gameType 字串，從 gameTypes 陣列中查找並返回對應的完整遊戲物件。
     * @param gameType 要查找的遊戲類型代碼 (例如 '5030')。
     * @returns 返回匹配的遊戲物件，如果找不到則返回 null。
     */
    public static getGameTypeObject(gameType: string): { type: string; name: string; autoFixView: boolean; } | null {
        const foundGame = gameTypes.find((game: any) => game.type === gameType);
        if (foundGame) {
            return foundGame;
        }
        Logger.warn(`在 gameTypes 中找不到 type 為 "${gameType}" 的遊戲物件。`);
        return null;
    }

    /**
     * 判斷當前裝置是否為 Mac 且使用 Retina 螢幕。
     * @returns 如果是，則返回 true。
     */
    public static isMacRetina(): boolean {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isRetina = window.devicePixelRatio > 1;
        return isMac && isRetina;
    }

    /**
     * 根據瀏覽器語言設定，標準化並設定全局語言代碼。
     */
    public static judgeLang(): void {
        let lang = '';
        switch (urlHelper.lang) {
            case "zh_tw":
            case "zh-tw":
            case "tw":
                lang = 'tw';
                break;
            case "zh_cn":
            case "zh-cn":
            case "cn":
            case "ug":
                lang = 'cn'
                break;
            default:
                lang = 'en';
                break;
        }
        urlHelper.rawLang = lang;
        urlHelper.lang = urlHelper.identifyLang(urlHelper.rawLang, 'BB');
        urlHelper.rdaLang = urlHelper.identifyLang(urlHelper.rawLang, 'RD');
    }

    /**
     * 創建一個用於提示「請轉成直立模式」的 GIF 容器，並附加到 HTML body 上。
     * 如果已經創建過，則直接返回現有的實例。
     * @param src GIF 圖片的路徑。
     * @returns 創建的或已存在的 HTMLDivElement。
     */
    public static createPortraitTipGif(src: string): HTMLDivElement {
        if (GTLoadingCommTool._gifContainer) {
            return GTLoadingCommTool._gifContainer;
        }

        const gifContainer = document.createElement('div');
        gifContainer.style.position = 'fixed';
        gifContainer.style.top = '50%';
        gifContainer.style.left = '50%';
        gifContainer.style.transform = 'translate(-50%, -50%)';
        gifContainer.style.width = '100%';
        gifContainer.style.height = '100%';
        gifContainer.style.backgroundColor = 'black';
        gifContainer.style.pointerEvents = 'none';
        gifContainer.style.overflow = 'visible';
        gifContainer.style.backgroundPosition = 'center';

        const gifImage = document.createElement('img');
        gifImage.src = src;
        gifImage.style.width = '100%';
        gifImage.style.height = '100%';
        gifImage.style.objectFit = 'contain';

        gifContainer.appendChild(gifImage);
        document.body.appendChild(gifContainer);
        gifContainer.style.display = 'none';
        
        GTLoadingCommTool._gifContainer = gifContainer;
        return gifContainer;
    }

    /**
     * 監聽視窗大小變化，並根據螢幕方向顯示或隱藏「直立模式提示」的 GIF。
     * 它會自動處理 GIF 容器的創建。
     */
    public static async handleWindowResize(): Promise<void> {
        if (!GTLoadingCommTool._gifContainer) {
            Logger.debug('沒有拿到gifContainer，正在創建...');
            try {
                const portraitAsset = await GTLoadingTool.LoadAssetBundle('textures/gif/portrait', 'comm');
                GTLoadingCommTool.createPortraitTipGif(portraitAsset.nativeUrl);
            } catch (error) {
                Logger.error('加載 portrait GIF 資源失敗:', error);
                return; // 如果資源加載失敗，則不繼續執行
            }
        }

        const gifContainer = GTLoadingCommTool._gifContainer;
        if (!gifContainer) {
            Logger.error('創建或獲取 gifContainer 失敗');
            return;
        }

        if (sys.platform !== sys.Platform.DESKTOP_BROWSER) {
            const isPortrait = window.innerHeight >= window.innerWidth;
            gifContainer.style.display = isPortrait ? 'none' : 'block';
        }
        Logger.debug(`handleWindowResize height = ${window.innerHeight} w = ${window.innerWidth}`);
    }
    /**
     * 處理視窗大小變化的核心邏輯，特別是針對桌面瀏覽器和行動裝置的適配。
     */
    public static onResize(): void { 
        const isDesktop = sys.platform === sys.Platform.DESKTOP_BROWSER; 
        const w = view.getDesignResolutionSize().width; 
        const h = view.getDesignResolutionSize().height; 
        const canvasSize = GTLoadingCommTool.getCanvas()!; 
        const aspectRatio = canvasSize.height / canvasSize.width; 
        let policy: number; 
        let policyName: string = ''; // 初始化變數
        
        if (isDesktop) { 
            // 桌面端保持原有的 resize 邏輯，不主動設定適配策略 
            director.root!.resize(screen.windowSize.width, screen.windowSize.height);
            view.setDesignResolutionSize(w, h, view.getResolutionPolicy()); 
        } else{
            // --- 行動裝置適配邏輯 --- 
            // 2. 判斷長寬比是否在安全區間內，透過位移物件來進行適配 
            if (GTLoadingCommTool.checkNeedRefixNode() || !GTLoadingCommTool.canAutoFix()) { 
                // 在安全區間內，使用 Fit Width 
                policy = ResolutionPolicy.FIXED_WIDTH; 
                policyName = 'FIXED_WIDTH'; 
            } else { 
                // 超出安全區間（例如 iPad 或過長的螢幕），切換到 Fit Height 
                // 以確保核心內容完整顯示，避免過度裁切 
                policy = ResolutionPolicy.FIXED_HEIGHT; 
                policyName = 'FIXED_HEIGHT'; 
            }
                // view.emit('design-resolution-changed'); 
            // 3. 應用解析度策略 // 取 WKWebView 可見範圍（比 screen 準確） 
            const cw = document.documentElement.clientWidth; 
            const ch = document.documentElement.clientHeight; 
            // 設定 canvas CSS 
            game.canvas!.style.position = "absolute"; 
            game.canvas!.style.left = "0px"; 
            game.canvas!.style.top = "0px"; 
            game.canvas!.style.width = `${cw}px`;
            game.canvas!.style.height = `${ch}px`; 
            director.root!.resize( screen.windowSize.width, screen.windowSize.height );

            view.setDesignResolutionSize(1080, 1920, policy); 
            view.resizeWithBrowserSize(true); 
            // 4. 觸發視圖更新事件
            view.emit('canvas-resize'); 
            Logger.debug(`Mobile set DesignResolutionSize w:${cw} h:${ch}`); 
        }    
        Logger.debug(`onResize [ResolutionPolicy] sys.platform: ${sys.platform} resize. 
            Screen: ${canvasSize.width}x${canvasSize.height}, 
            Ratio: ${aspectRatio.toFixed(3)}, 
            Policy set to: ${policyName},sys.platform: ${sys.platform}`); 
    }

    /**
     * 從 resources/texture/logo/ 目錄下加載指定的 SpriteFrame。
     * @param picName 圖片名稱 (不含副檔名)。
     * @returns 返回一個 Promise，解析為 SpriteFrame。
     */
    public static async loadPicFromRes(picName: string): Promise<SpriteFrame> {
        return new Promise((resolve, reject) => {
            resources.load(`texture/logo/${picName}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    Logger.error(`加載 Logo 圖片失敗: ${picName}`, err);
                    return reject(err);
                }
                resolve(spriteFrame);
            });
        });
    }

    /**
     * 根據螢幕是橫向還是縱向，為 Sprite 設置不同的 SpriteFrame。
     * @param sprite 目標 Sprite 組件。
     * @param landPicStr 橫向時使用的圖片名稱。
     * @param portPicStr 縱向時使用的圖片名稱。
     */
    public static async setBGLogoTwoPic(sprite: Sprite, landPicStr: string, portPicStr: string): Promise<void> {
        const canvas = this.getCanvas();
        if (!canvas) return;

        if (canvas.width > canvas.height) {
            sprite.spriteFrame = await this.loadPicFromRes(landPicStr);
            this.scaleSpriteSizeToCanvas(sprite);
        } else {
            sprite.spriteFrame = await this.loadPicFromRes(portPicStr);
        }
    }

    public static scaleSpriteSizeToCanvas(sprite: Sprite):void{
        const canvas = this.getCanvas();
        if (!canvas) return;

        const imageWidth = 1920; // 最小寬度
        const resizeWidth = Math.max((canvas.width * (1920 / canvas.height)), imageWidth);
        const scale = new Vec3(resizeWidth / imageWidth, resizeWidth / imageWidth, 1);
        sprite.node.setScale(scale);
    }

    /**
     * 對指定的 Node 做漸變顯示或隱藏。
     * @param node 目標節點。
     * @param show true 為顯示, false 為隱藏。
     * @param duration 動畫時間 (秒)，預設 0.5。
     * @returns 返回一個 Promise，在動畫完成時解析。
     */
    public static setNodeFade(node: Node, show: boolean, duration: number = 0.5): Promise<void> {
        return new Promise(resolve => {
            if (!node) return resolve();
            let opacity = node.getComponent(UIOpacity);
            if (!opacity) {
                try{
                    opacity = node.addComponent(UIOpacity);
                }catch{
                    Logger.error('無法添加 UIOpacity 組件 --> '+ node.name);
                    node.active = show;
                    return resolve();
                }
            }
            if (show) node.active = true;
            tween(opacity)
                .to(duration, { opacity: show ? 255 : 0 })
                .call(() => {
                    node.active = show;
                    resolve();
                })
                .start();
        });
    }

    /**
     * 檢查是否需要修正節點位置。
     * 主要用於判斷是否在桌面端或使用 FIXED_WIDTH 策略時需要調整節點位置。
     * @returns 如果需要修正，則返回 true；否則返回 false。
     */
    public static checkNeedRefixNode(): boolean {
        
        const policy = view.getResolutionPolicy();
        const canvasSize = this.getCanvas()!;
        const aspectRatio = canvasSize.height / canvasSize.width;
         // 該區間由使用者定義的「寬度」和「高度」安全範圍共同決定
        const minRatio = 16 / 9.4; 
        // 桌面端或FixHeight不需要調整上下
        const needRefix = ((aspectRatio >= minRatio));
        
        Logger.debug(`checkNeedRefixNode aspectRatio:${aspectRatio} canvasHeight:${canvasSize.height} canvasWidth:${canvasSize.width} policy:${policy.getContentStrategy().strategy} `);
        return needRefix;
    }

    public static canAutoFix(): boolean{
        const isDesktop = sys.platform === sys.Platform.DESKTOP_BROWSER;
        const isDevMode = this.checkIsDevMode();
        
        // 添加调试信息
        Logger.debug(`canAutoFix - gameType: ${urlHelper.gameType}`);
        const gameTypeObject = this.getGameTypeObject(urlHelper.gameType);
        Logger.debug(`canAutoFix - gameTypeObject:`, gameTypeObject);
        
        if (!gameTypeObject) {
            Logger.warn(`canAutoFix - 找不到游戏类型 ${urlHelper.gameType}，使用默认值 false`);
            return false;
        }
        
        const gameAutoFix = gameTypeObject.autoFixView;
        const autoFix = !isDesktop &&( isDevMode || gameAutoFix );
        Logger.debug(`canAutoFix autoFix:${autoFix}  `);
        return autoFix;
    }

    /**
     * 計算並返回因長寬比不同而需要修正的 Y 軸距離。
     * @returns 需要向下修正的 Y 軸距離。
     */
    public static getFixY(): number {
        const canvas = this.getCanvas();
        if (!canvas) return 0;

        const widthRatio = canvas.width / 1080;
        const expectedHeight = widthRatio * 1920;
        const heightDifference = expectedHeight - canvas.height;

        return (heightDifference / widthRatio);
    }

    /**
     * 安全地獲取 HTML 中的 <canvas> 元素。
     * @returns 返回 HTMLCanvasElement，如果找不到則返回 null。
     */
    public static getCanvas(): HTMLCanvasElement | null {
        return document.getElementsByTagName('canvas')[0] || null;
    }

    public static getScaleRatioFromDesign(): number {
        return 1080/this.getCanvas()!.width;
    }

    public static  checkIsTestMode(): boolean {
        const domain = this._extractDomain(urlHelper.domain);
        Logger.warn(domain);

        const testDomains = ['localhost', 'bb-in555.com', 'casinovir999.net'];
        if (testDomains.indexOf(domain) !== -1) {
            return true;
        }
        return false;
    }

    public static checkIsDevMode(): boolean {
        const domain = this._extractDomain(urlHelper.domain);
        Logger.warn(domain);

        const testDomains = ['dowincasino-dev.com', 'bb-in555.com'];
        if (testDomains.indexOf(domain) !== -1) {
            return true;
        }
        return false;
    }
    
    private static _extractDomain(url: string): string {
        const regex = /^(?:https?:\/\/)?(?:www\.)?([^\/:]+)/;
        const match = url.match(regex);
        if (match) {
            const domainParts = match[1].split('.');
            return domainParts.slice(-2).join('.'); // 只保留主域名和頂級域名
        }
        return '';
    }


}
