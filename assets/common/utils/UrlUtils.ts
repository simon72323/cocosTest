/**
 * URL 工具類
 * 提供 URL 參數解析和 Cookie 操作功能
 */
export class UrlUtils {

    /**
     * 獲取 URL 查詢參數值
     * @param name 參數名稱
     * @returns 參數值，如果不存在則返回空字符串
     */
    public static getUrlQuery(name: string): string {
        const formatName = name.replace(/([[\]])/g, '\\$1');
        const reg = new RegExp(`[\\?&]${formatName}=([^&#]*)`);
        const result = reg.exec(location.search);

        if (result && result[1]) {
            return decodeURIComponent(result[1].replace(/\+/g, ' '));
        }

        return '';
    }

    /**
     * 獲取 Cookie 值
     * @param cookieName Cookie 名稱
     * @returns Cookie 值，如果不存在則返回空字符串
     */
    public static getCookie(cookieName: string): string {
        const decodedCookie = decodeURIComponent(document.cookie);
        const reg = new RegExp(`(^|;\\s?)${cookieName}=([^;]*)(;|$)`);
        const result = reg.exec(decodedCookie);

        if (result && result[2]) {
            return result[2];
        }

        return '';
    }

    /**
     * 設置 Cookie
     * @param name Cookie 名稱
     * @param value Cookie 值
     * @param options Cookie 選項
     */
    public static setCookie(name: string, value: string, options: {
        expires?: Date;
        path?: string;
        domain?: string;
        secure?: boolean;
        sameSite?: 'Strict' | 'Lax' | 'None';
    } = {}): void {
        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

        if (options.expires) {
            cookieString += `; expires=${options.expires.toUTCString()}`;
        }

        if (options.path) {
            cookieString += `; path=${options.path}`;
        }

        if (options.domain) {
            cookieString += `; domain=${options.domain}`;
        }

        if (options.secure) {
            cookieString += '; secure';
        }

        if (options.sameSite) {
            cookieString += `; samesite=${options.sameSite}`;
        }

        document.cookie = cookieString;
    }

    /**
     * 刪除 Cookie
     * @param name Cookie 名稱
     * @param path Cookie 路徑
     * @param domain Cookie 域名
     */
    public static deleteCookie(name: string, path?: string, domain?: string): void {
        this.setCookie(name, '', {
            expires: new Date(0),
            path: path || '/',
            domain
        });
    }

    /**
     * 檢查 URL 是否包含指定參數
     * @param name 參數名稱
     * @returns 是否包含該參數
     */
    public static hasUrlParam(name: string): boolean {
        return this.getUrlQuery(name) !== '';
    }

    /**
     * 獲取所有 URL 參數
     * @returns 包含所有參數的對象
     */
    public static getAllUrlParams(): Record<string, string> {
        const params: Record<string, string> = {};
        const searchParams = new URLSearchParams(location.search);

        for (const [key, value] of searchParams.entries()) {
            params[key] = decodeURIComponent(value.replace(/\+/g, ' '));
        }

        return params;
    }

    /**
     * 構建查詢字符串
     * @param params 參數對象
     * @returns 查詢字符串
     */
    public static buildQueryString(params: Record<string, any>): string {
        const searchParams = new URLSearchParams();

        for (const [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined) {
                searchParams.append(key, String(value));
            }
        }

        return searchParams.toString();
    }

    /**
     * 解析 URL 查詢字符串
     * @param queryString 查詢字符串
     * @returns 參數對象
     */
    public static parseQueryString(queryString: string): Record<string, string> {
        const params: Record<string, string> = {};
        const searchParams = new URLSearchParams(queryString);

        for (const [key, value] of searchParams.entries()) {
            params[key] = decodeURIComponent(value.replace(/\+/g, ' '));
        }

        return params;
    }
}

// 導出單獨的函數，保持與原 mjs 的兼容性
export const getUrlQuery = UrlUtils.getUrlQuery;
export const getCookie = UrlUtils.getCookie;