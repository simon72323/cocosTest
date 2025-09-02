import CryptoJS from 'crypto-js';

/**
 * AES 加密工具類
 * 使用 CBC 模式和 PKCS7 填充
 */
export class AESCrypto {
    private secret: string;
    private key!: CryptoJS.lib.WordArray;
    private iv!: CryptoJS.lib.WordArray;

    /**
     * 構造函數
     * @param secret 加密密鑰（Base64 編碼，格式：key.iv）
     */
    constructor(secret: string) {
        this.secret = secret;
        this.init();
    }

    /**
     * 初始化加密參數
     * @param secret 可選的新密鑰
     */
    private init(secret?: string): void {
        if (secret) {
            this.secret = secret;
        }

        // 解碼 Base64 密鑰
        let decodedSecret = atob(
            this.secret.replace(/-/g, "+").replace(/_/g, "/")
        );
        
        // 分離 key 和 iv（格式：key.iv）
        const [key, iv] = decodedSecret.split(".");
        
        // 解析 key 和 iv
        this.iv = CryptoJS.enc.Utf8.parse(iv);
        this.key = CryptoJS.enc.Utf8.parse(key);
    }

    /**
     * 加密數據
     * @param data 要加密的數據（字符串或對象）
     * @returns 加密後的字符串
     */
    public encrypt(data: string | object): string {
        let dataString = data;
        
        // 如果數據不是字符串，轉換為 JSON 字符串
        if (typeof data !== "string") {
            dataString = JSON.stringify(data);
        }

        // 使用 AES 加密
        const cipherText = CryptoJS.AES.encrypt(dataString as string, this.key, {
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return cipherText.toString();
    }

    /**
     * 解密數據
     * @param data 要解密的數據
     * @returns 解密後的字符串
     */
    public decrypt(data: string): string {
        // 使用 AES 解密
        const plaintext = CryptoJS.AES.decrypt(data, this.key, {
            mode: CryptoJS.mode.CBC,
            iv: this.iv,
            padding: CryptoJS.pad.Pkcs7
        });

        return plaintext.toString(CryptoJS.enc.Utf8);
    }

    /**
     * 更新密鑰
     * @param newSecret 新的密鑰
     */
    public updateSecret(newSecret: string): void {
        this.init(newSecret);
    }

    /**
     * 獲取當前密鑰信息
     * @returns 密鑰信息
     */
    public getSecretInfo(): { hasKey: boolean; hasIv: boolean } {
        return {
            hasKey: !!this.key,
            hasIv: !!this.iv
        };
    }
}