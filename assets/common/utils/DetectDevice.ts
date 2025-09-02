import { Logger } from "@common/utils/Logger";
import { getUrlQuery } from "@common/utils/UrlUtils";

/**
 * 設備檢測工具類
 * 檢測設備類型、操作系統、瀏覽器等
 */
export class DetectDevice {

    /**
     * 是否為移動設備
     */
    static get isMobile(): boolean {
        return DetectDevice.iOS ||
            DetectDevice.Android ||
            DetectDevice.isAIO ||
            DetectDevice.BlackBerry ||
            DetectDevice.WindowsPhone ||
            DetectDevice.WindowsTablet ||
            DetectDevice.webOS;
    }

    /**
     * 是否為 PC
     */
    static get isPC(): boolean {
        return !DetectDevice.isMobile && !DetectDevice.isTablet;
    }

    /**
     * 桌面操作系統
     */
    static get desktopOS(): string {
        const target = navigator.userAgent;

        switch (true) {
            case target.includes("Windows NT 10.0"):
                return "Windows 10";
            case target.includes("Windows NT 6.2"):
                return "Windows 8";
            case target.includes("Windows NT 6.1"):
                return "Windows 7";
            case target.includes("Windows NT 6.0"):
                return "Windows Vista";
            case target.includes("Windows NT 5.1"):
                return "Windows XP";
            case target.includes("Windows NT 5.0"):
                return "Windows 2000";
            case target.includes("Windows NT"):
                return "Windows unknown";
            case target.includes("Mac"):
                return "Mac/iOS";
            case target.includes("X11"):
                return "UNIX";
            case target.includes("Linux"):
                return "Linux";
            default:
                return "";
        }
    }

    /**
     * 是否為 iOS 設備
     */
    static get iOS(): boolean {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent) || DetectDevice.iPadOS;
    }

    /**
     * 是否為 iPhone 4 英寸
     */
    static get iPhone4Inch(): boolean {
        return /iPhone/i.test(navigator.userAgent) && screen.width < 375;
    }

    /**
     * 是否為 iPadOS
     */
    static get iPadOS(): boolean {
        const ua = window.navigator.userAgent;

        if (ua.includes("iPad")) {
            return true;
        } else if (ua.includes("Macintosh")) {
            if (window.navigator.maxTouchPoints && window.navigator.maxTouchPoints > 2) {
                return true;
            }
        }
        return false;
    }

    /**
     * 是否為平板
     */
    static get isTablet(): boolean {
        if (DetectDevice.isMobile) {
            if (DetectDevice.iOS) {
                return DetectDevice.iPadOS;
            } else if (DetectDevice.Android) {
                if (/Mobile/i.test(navigator.userAgent) && !/BTV-DL09/i.test(navigator.userAgent)) {
                    return false;
                }
                return true;
            } else if (DetectDevice.WindowsTablet) {
                return true;
            }
        }
        return false;
    }

    /**
     * 是否為 iOS WebView
     */
    static get iOSWebView(): boolean {
        return DetectDevice.iOS && !/safari/i.test(navigator.userAgent);
    }

    /**
     * 是否為 Android WebView
     */
    static get AndroidWebView(): boolean {
        return DetectDevice.Android && /wv/i.test(navigator.userAgent);
    }

    /**
     * 是否為 AIO 平台
     */
    static get isAIO(): boolean {
        return getUrlQuery("platform") === "AIO";
    }

    /**
     * 是否為 Android 設備
     */
    static get Android(): boolean {
        return /Android/i.test(navigator.userAgent);
    }

    /**
     * 是否為 BlackBerry 設備
     */
    static get BlackBerry(): boolean {
        return /BlackBerry/i.test(navigator.userAgent);
    }

    /**
     * 是否為 Windows Phone
     */
    static get WindowsPhone(): boolean {
        return /Windows Phone/i.test(navigator.userAgent);
    }

    /**
     * 是否為 Windows 平板
     */
    static get WindowsTablet(): boolean {
        return /Windows/i.test(navigator.userAgent) && /ARM/i.test(navigator.userAgent);
    }

    /**
     * 是否為 webOS
     */
    static get webOS(): boolean {
        return /webOS/i.test(navigator.userAgent);
    }

    /**
     * 獲取瀏覽器版本
     */
    static getBrowser(): string {
        const spaceSp = navigator.userAgent.split(" ");
        let browser = "";

        switch (true) {
            case DetectDevice.isUB:
            case DetectDevice.isOpera:
            case DetectDevice.isSafari:
            case DetectDevice.isFirefox:
            case DetectDevice.isEdge:
            case DetectDevice.isIE:
                browser = spaceSp[spaceSp.length - 1];
                break;
            case DetectDevice.isChrome:
                browser = spaceSp[spaceSp.length - 2];
                break;
            default:
                break;
        }

        if (/Mobile Safari/i.test(navigator.userAgent)) {
            browser = spaceSp[spaceSp.length - 1];
            if (browser.includes("Safari")) {
                browser = spaceSp[spaceSp.length - 4];
            }
            if (browser.includes("Gecko")) {
                browser = spaceSp[spaceSp.length - 3];
            }
        } else if (DetectDevice.Android && !browser) {
            browser = spaceSp[spaceSp.length - 2];
        }

        if (/iOS/i.test(navigator.userAgent)) {
            browser = spaceSp[spaceSp.length - 3];
        }

        return browser.replace(/\//g, " ");
    }

    /**
     * 獲取操作系統和版本
     */
    static getOSAndVersion(): string {
        const info = navigator.userAgent.split("(")[1].split(")")[0].split(";");

        if (DetectDevice.Android) {
            const androidVersion = info.find((item) => item.includes("Android"));
            return (androidVersion != null ? androidVersion : "").trim();
        } else if (DetectDevice.iOS) {
            const os = info[0];
            let verIndex = 0;
            let version = "";

            info.forEach((item, index) => {
                if (item.includes("OS")) {
                    verIndex = index;
                }
            });

            const versionPart = info[verIndex].split(" ");
            const osIndex = versionPart.indexOf("OS");

            if (~osIndex) {
                const versionString = navigator.userAgent.includes("Macintosh")
                    ? versionPart[osIndex + 2]
                    : versionPart[osIndex + 1];
                version = versionString.replace(/_/g, ".");
            }

            return `${os} ${version}`;
        } else {
            const desktopOS = DetectDevice.desktopOS;
            return desktopOS === "Mac/iOS"
                ? info[1].replace(/_/g, ".").trim()
                : desktopOS;
        }
    }

    /**
     * 是否為 UB 瀏覽器
     */
    static get isUB(): boolean {
        return navigator.userAgent.includes(" UB");
    }

    /**
     * 是否為 Opera 8.0+
     */
    static get isOpera(): boolean {
        return !!(window as any).opr?.addons ||
            !!(window as any).opera ||
            navigator.userAgent.includes(" OPR/");
    }

    /**
     * 是否為 Firefox 1.0+
     */
    static get isFirefox(): boolean {
        return navigator.userAgent.includes("Firefox") ||
            navigator.userAgent.includes("FxiOS");
    }

    /**
     * 是否為 Safari 3+
     */
    static get isSafari(): boolean {
        return /safari/i.test(navigator.userAgent) &&
            !/chrome/i.test(navigator.userAgent) &&
            !DetectDevice.isFirefox;
    }

    /**
     * 是否為 Internet Explorer 6-11
     */
    static get isIE(): boolean {
        return !!(document as any).documentMode;
    }

    /**
     * 是否為 Edge 20+
     */
    static get isEdge(): boolean {
        return navigator.userAgent.includes("Trident") ||
            /Edg(A|iOS|e)?\//.test(navigator.userAgent);
    }

    /**
     * 是否為 Chrome 1+
     */
    static get isChrome(): boolean {
        return /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9.]+)(:?\s|$)/.test(navigator.userAgent);
    }

    /**
     * 獲取顯卡信息
     */
    static getGraphicCardInfo(canvas: HTMLCanvasElement = document.createElement("canvas")): string {
        let graphicCard = "undefined";

        try {
            const webGL = canvas.getContext("webgl") ||
                (canvas as any).getContext("experimental-webgl");

            if (webGL) {
                const debugInfo = webGL.getExtension("WEBGL_debug_renderer_info");
                if (debugInfo) {
                    graphicCard = webGL.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }
        } catch (e) {
            Logger.error(e as any);
        }

        return graphicCard;
    }

    /**
     * 獲取設備信息
     */
    static getDeviceInfo(canvas?: HTMLCanvasElement): any {
        const spaceSp = navigator.userAgent.split(" ");
        let browser = DetectDevice.getBrowser();
        let webView = "false";
        let srs = `${screen.width}x${screen.height}`;
        let newaio = "";
        let ub: string[] = [];
        let encodeIP = "";
        let aio = false;
        let tablet = false;
        let pwa = false;

        if (DetectDevice.isMobile) {
            srs = `${screen.width * devicePixelRatio}x${screen.height * devicePixelRatio}`;
            aio = DetectDevice.isAIO;
            tablet = DetectDevice.isTablet;

            if (DetectDevice.iOS) {
                webView = DetectDevice.iOSWebView ? "is_iOSWebView" : "isnot_iOSWebView";
            } else if (DetectDevice.Android) {
                webView = DetectDevice.AndroidWebView ? "is_AndroidWebView" : "isnot_AndroidWebView";
            }

            if (aio) {
                browser = "";
                const gPortal = spaceSp.find((item) => item.includes("game_portal"));
                const gPlatform = spaceSp.find((item) => item.includes("game_platform"));
                newaio = `${gPlatform} ${gPortal}`;
            }
        }

        spaceSp.forEach((item) => {
            if (DetectDevice.isUB) {
                if (item.includes("Chrome") || item.includes("UB") || item.includes("CustomBrowser")) {
                    ub.push(item);
                }
            }
            if (item.includes("HTTP_BB_FORWARDED")) {
                encodeIP = item.split("HTTP_BB_FORWARDED/")[1];
            }
        });

        if ((navigator as any).standalone ||
            window.matchMedia("(display-mode: standalone)").matches) {
            pwa = true;
        }

        const deviceInfo = {
            rd: "fx",
            ua: navigator.userAgent,
            os: DetectDevice.getOSAndVersion(),
            srs,
            wrs: `${window.innerWidth}x${window.innerHeight}`,
            dpr: devicePixelRatio,
            pl: "H5",
            pf: browser,
            wv: webView,
            aio,
            vga: DetectDevice.getGraphicCardInfo(canvas),
            tablet,
            cts: Date.now(),
            mua: getUrlQuery("mua"),
            dtp: getUrlQuery("dtp"),
            newaio,
            ub: ub.join(" "),
            pwa,
            encodeIP: encodeIP || undefined
        };

        return deviceInfo;
    }
}