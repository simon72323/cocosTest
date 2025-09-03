// import { CommonStore } from '@gt-npm/gt-lib-ts/es/h5GameTools/commonStore';
import { getEventManager } from '@common/manager/EventManager';
import { Logger } from '@common/utils/Logger';
import { getUrlQuery } from '@common/utils/UrlUtils';

/**
 * URL 輔助工具類
 * 處理遊戲相關的 URL 參數和導航
 */
export class UrlHelper {
    public static _instance: UrlHelper | null = null;

    // 遊戲相關屬性
    public gameType: string = '';
    public sid: string = '';
    public hallId: string = '';
    public userId: string = '';
    public rawLang: string = '';
    public lang: string = '';
    public rdaLang: string = '';
    public domain: string = '';
    public useProxy: boolean = false;
    public isDemo: boolean = false;
    public isSDK: boolean = false;
    public gameCode: string = '1';
    public gameKind: number = 5;
    public CDNIP: string = '';
    public exitOption: string = '';
    public site: string = 'BBIN';
    public subLink: string = '';
    public playtime: string = '';
    public gameLoaderEnterTime: number = 0;
    public memberDomain: string = '';
    public exitUrl: string = '';
    public parent: any;
    public firstPage: number = 0;
    public channel: number = 0;
    public pdIngress: string = 'PC';
    public pdIngressToken: string = '';
    public JpOpen: boolean = true;

    private constructor() {
        this.initializeFromParent();
        this.initializeFromUrl();
        this.initializeFromEnvironment();
    }

    public static getInstance(): UrlHelper {
        if (!UrlHelper._instance) {
            UrlHelper._instance = new UrlHelper();
        }
        return UrlHelper._instance;
    }

    /**
     * 從父窗口獲取參數
     */
    private initializeFromParent(): void {
        try {
            this.parent = (window as any).parent;
            this.parent.testGet; // 測試父窗口是否可訪問
        } catch {
            this.parent = window;
        }
    }

    /**
     * 從 URL 參數獲取值
     */
    private initializeFromUrl(): void {
        this.gameType = getUrlQuery('GameType') || this.parent.game_id || '';
        this.sid = getUrlQuery('sid') || this.parent.SessionID || getUrlQuery('SessionID') || '';
        this.hallId = getUrlQuery('HALLID') || this.parent.HallID || getUrlQuery('HallID') || getUrlQuery('hallID') || '';
        this.userId = this.parent.UserID || getUrlQuery('UserID') || '';
        this.exitOption = `${this.parent.ExitOption || getUrlQuery('ExitOption') || ''}`;
        this.rawLang = getUrlQuery('lang') || this.parent.lang || '';
        this.lang = this.identifyLang(this.rawLang, 'BB');
        this.rdaLang = this.identifyLang(this.rawLang, 'RD');
        this.site = this.parent.Site || getUrlQuery('Site') || 'BBIN';
        this.subLink = this.parent.subLink || getUrlQuery('subLink') || '';
        this.playtime = this.parent.playtime || getUrlQuery('playtime') || '';
        this.gameLoaderEnterTime = (window as any).gameLoaderEnterTime || 0;
        this.memberDomain = this.parent.memberDomain || getUrlQuery('memberDomain') || '';
        this.exitUrl = this.parent.exitUrl || getUrlQuery('exitUrl') || getUrlQuery('ExitUrl') || '';
        this.JpOpen = getUrlQuery('JP') ? getUrlQuery('JP') == '1' : true;
        this.channel = this.parent.pdChannel || getUrlQuery('channel') || 0;
        this.pdIngress = this.parent.pdIngress || getUrlQuery('ingress') || 'PC';
        this.pdIngressToken = this.parent.pdIngressToken || getUrlQuery('ingressToken') || '';
        this.isDemo = getUrlQuery('demo') === '1' || this.parent.Demo || getUrlQuery('Demo') === 'true' || getUrlQuery('demo') === 'true';
        this.isSDK = location.protocol == 'file:';
        this.useProxy = getUrlQuery('useProxy') === 'true';
        this.CDNIP = this.parent.CDNIP || getUrlQuery('CDNIP') || getUrlQuery('IP');
        this.firstPage = window.history.length;
    }

    /**
     * 從環境獲取域名信息
     */
    private async initializeFromEnvironment(): Promise<void> {
        if (this.isSDK) {
            await this.getDomainInfoSDK();
        } else {
            await this.getDomainInfoNormal();
        }
    }

    /**
     * 獲取 SDK 環境的域名信息
     */
    private async getDomainInfoSDK(): Promise<void> {
        const domain = getUrlQuery('domain');
        if (!domain) {
            console.warn('UrlHelper.getDomainInfoSDK Error : 網址沒有domain參數');
            return;
        }
        if (!/^http[s]?:/.test(domain)) {
            console.warn('UrlHelper.getDomainInfoSDK Error : domain參數需要包含http or https protocol');
            return;
        }
        const parser = new URL(domain);
        this.domain = parser.origin;
    }

    /**
     * 獲取正常環境的域名信息
     */
    private async getDomainInfoNormal(): Promise<void> {
        this.domain = location.origin;
    }

    /**
     * 獲取是否為安全連接
     */
    public get isSecure(): boolean {
        try {
            const domainUrl = new URL(this.domain);
            return domainUrl.protocol === 'https:';
        } catch {
            return false;
        }
    }

    /**
     * 獲取服務器 IP
     */
    public async fetchServerIP(): Promise<string> {
        try {
            const domainUrl = new URL(this.domain);
            const url = `${domainUrl.origin}/ipl/app/flash/pig/game/casinoH5/GameAPI/FxDataApi.php?gtype=${this.gameType}&dm=${domainUrl.host}`;
            const data = await (await fetch(url)).json();
            return data.link || '';
        } catch (e) {
            Logger.warn(e as any);
            return '';
        }
    }

    /**
     * 檢查 CDN 是否可用
     */
    public async checkCdnAlive(cdnProjectRoot: string, timeout: number): Promise<boolean> {
        const controller = new AbortController();
        setTimeout(() => {
            controller.abort();
        }, timeout);

        try {
            const response = await fetch(`${cdnProjectRoot}index.html?${Date.now()}`, {
                signal: controller.signal
            });
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * 識別語言
     */
    public identifyLang(lang: string, type: 'BB' | 'RD' = 'BB'): string {
        const commonLang = {
            ja: 'ja',
            vi: 'vi',
            th: 'th',
            id: 'id',
            es: 'es'
        };

        const specialLang = {
            BB: {
                tw: 'tw',
                cn: 'cn',
                kr: 'kr',
                en: 'us'
            },
            RD: {
                tw: 'zh-tw',
                cn: 'zh-cn',
                kr: 'ko',
                en: 'en'
            }
        };

        const finalLang = {
            ...commonLang,
            ...specialLang[type]
        };

        switch (lang) {
            case 'zh_tw':
            case 'zh-tw':
            case 'tw':
                return finalLang.tw;
            case 'zh_cn':
            case 'zh-cn':
            case 'cn':
            case 'ug':
                return finalLang.cn;
            case 'jp':
            case 'ja':
                return finalLang.ja;
            case 'vi':
            case 'vn':
                return finalLang.vi;
            case 'th':
                return finalLang.th;
            case 'id':
                return finalLang.id;
            case 'es':
                return finalLang.es;
            case 'kr':
            case 'ko':
                return finalLang.kr;
            case 'en':
            default:
                return finalLang.en;
        }
    }

    /**
     * 獲取研 A 的 domain
     */
    public getDomainRdA(): string {
        let subDomain = 'www.';

        switch (true) {
            case this.domain.includes('vir888'):
                subDomain = 'ts-m.';
                break;
            case this.domain.includes('vir999'):
                subDomain = 'www.';
                break;
            case this.domain.includes('04vip'):
                subDomain = 'test.';
                break;
            case this.domain.includes('//888.'):
                subDomain = '777.';
                break;
        }

        if (/^http[s]?:/.test(this.domain)) {
            return this.domain.replace(/(^http[s]?:\/\/)(.*)/, `$1${subDomain}$2`);
        }
        return this.domain;
    }

    /**
     * 獲取通用 URL 參數
     */
    // private _getCommonUrlParams(additionalParams: string = ""): string {
    //     const { enableJP } = CommonStore.shared.storeState;
    //     return `GameType=${this.gameType}&lang=${this.rawLang}&rnd=${Date.now()}&site=${this.site}&JpOpen=${enableJP}&uiversion=2${additionalParams}`;
    // }

    private _getCommonUrlParams(additionalParams: string = '', enableJP: boolean = true): string {
        return `GameType=${this.gameType}&lang=${this.rawLang}&rnd=${Date.now()}&site=${this.site}&JpOpen=${enableJP}&uiversion=2${additionalParams}`;
    }

    /**
     * 獲取下注紀錄網址
     */
    public getBetHistoryURL(): string {
        const commonParams = this._getCommonUrlParams(`&GameCode=${this.gameCode}&sid=${this.sid}`);
        return `${this.domain}/ipl/portal.php/game/betrecord_search/kind5?${commonParams}`;
    }

    /**
     * 獲取規則說明網址
     */
    public getRulePageURL(): string {
        const commonParams = this._getCommonUrlParams(`&ExitOption=${this.exitOption}`);
        return `${this.domain}/ipl/app/help.php?${commonParams}`;
    }

    /**
     * 獲取幫助網址
     */
    public getHelpURL(): string {
        const commonParams = this._getCommonUrlParams();
        return `${this.domain}/ipl/portal.php/game/httpredirect?type=casinoruleinfo&gametype=${this.gameType}&${commonParams}`;
    }

    /**
     * 獲取 CDN URL
     */
    public async getCdnUrl(): Promise<string> {
        const origin = location.href.split('index')[0];
        Logger.log(`[Origin Root] ${origin}`);

        if (this.CDNIP) {
            Logger.log(`[CDNIP] ${this.CDNIP}`);
            const projectRootPath = location.pathname.split('index.')[0];
            const cdnRootPath = projectRootPath.includes('flash/pig/')
                ? projectRootPath.replace('ipl/', '')
                : `app/flash/pig/game/casinoH5${projectRootPath}`;
            const cdnUrl = `${this.CDNIP}${cdnRootPath}`;

            if (await this.checkCdnAlive(cdnUrl, 3000)) {
                return cdnUrl;
            }
        }
        return origin;
    }

    /**
     * 獲取 WebSocket 主機
     */
    public async getWsHost(): Promise<string> {
        if (this.subLink) return this.subLink;

        const domainUrl = new URL(this.domain);
        if (this.useProxy) return domainUrl.host;

        const serverIP = await this.fetchServerIP();
        if (serverIP) return serverIP;

        if (this.isDemo) return `fxdemo.${domainUrl.host}`;
        return `fx8ec8.${domainUrl.host}`;
    }

    /**
     * 獲取 WebSocket URL
     */
    public async getWsUrl(wsHost?: string): Promise<string> {
        const linkHost = wsHost != null ? wsHost : await this.getWsHost();

        if (this.isSecure) {
            return `wss://${linkHost}/fxCasino/fxLB?gameType=${this.gameType}`;
        } else {
            return `ws://${linkHost}/fxCasino/fxLB?gameType=${this.gameType}`;
        }
    }

    /**
     * 離開遊戲
     */
    public leaveGame(): void {
        switch (this.exitOption) {
            case '1':
                window.close();
                setTimeout(() => {
                    getEventManager().emit('SHOW_ALERT', {
                        type: 'BASIC_NONE',
                        title: '',
                        content: 'close fail',
                        cancelBtnText: '',
                        confirmBtnText: ''
                    });
                }, 5000);
                break;
            case '2':
                if ((window as any).top) {
                    (window as any).top.location.href = this.exitUrl || '';
                }
                break;
            case '3':
                break;
            case '4':
                window.history.go(-1);
                break;
            default:
                if (!((window as any).top && (window as any).top.opener) && window.history.length > 1) {
                    const backNum = this.firstPage - window.history.length - 1;
                    history.go(backNum);
                } else {
                    (window as any).top?.close();
                }
                break;
        }
    }

    /**
     * 開啟下注紀錄視窗
     */
    public gotoBetHistory(): void {
        window.open(this.getBetHistoryURL(), '_blank');
    }

    /**
     * 開啟規則說明視窗
     */
    public gotoRulePage(): void {
        window.open(this.getRulePageURL(), '_blank');
    }

    /**
     * 開啟存款頁面
     */
    public gotoBankerPage(): void {
        if (typeof this.parent.DepositUrl === 'function') {
            this.parent.DepositUrl({
                sid: this.sid,
                lang: this.rdaLang,
                vnd: `${Date.now()}`
            });
        } else {
            const url = `${this.getDomainRdA()}/infe/macenter/common/basicinfocontroller/redirect.json?identityCode=${this.sid}&langx=${this.rdaLang}&&other=depositPlus&rnd${Date.now()}`;
            window.open(url, '_blank');
        }
    }

    /**
     * 根據錯誤退出遊戲
     */
    public exitByError(error: string): void {
        const exitMethod = (() => {
            switch (error) {
                case 'NOT_ENOUGH_BALANCE':
                case 'MAXIMUN_EXCHANGE':
                    return 'none';
                case 'CHOOSE_MAINTAIN':
                case 'SYSTEM_MAINTAIN':
                    return 'maintain';
                case 'SID_IS_NOT_EXIST':
                case 'API_EC_INVALID_USER_DATA':
                case 'API_EC_ACC_SID_INVALID':
                case 'API_EC_USER_DATA_ERROR':
                    return 'logout';
                case 'ACCOUNT_HAS_BEEN_SUSPENDED':
                case 'API_EC_ACC_STOP_BETTING':
                case 'API_EC_ACC_USER_STOP_BETTING':
                case 'API_EC_ACC_USER_ALL_STOP_BETTING':
                    return 'accountSuspended';
                default:
                    return 'exit';
            }
        })();

        if (exitMethod !== 'none') {
            this.exitGame(exitMethod);
        }
    }

    /**
     * 退出遊戲
     */
    public exitGame(exitMethod: string = 'exit'): void {
        // 這裡需要實現 AppTalking.shared.exit(exitMethod);
        console.log(`Exiting game with method: ${exitMethod}`);
        this.leaveGame();
    }
}

// 全局實例
export const urlHelper = new Proxy({} as UrlHelper, {
    get(target, prop: string | symbol) {
        // 檢查是否已有實例，如果有則直接返回，沒有才創建
        if (!UrlHelper._instance) {
            UrlHelper._instance = UrlHelper.getInstance();
        }

        // 返回實例的屬性或方法
        const instance = UrlHelper._instance;
        return instance[prop as keyof UrlHelper];
    }
});