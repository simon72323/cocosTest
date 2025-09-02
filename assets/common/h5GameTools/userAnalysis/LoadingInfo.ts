import { Logger } from '@common/utils/Logger';
import { DetectDevice } from '../../utils/DetectDevice';
import { urlHelper } from '@common/utils/UrlHelper';
import { getUrlQuery } from '@common/utils/UrlUtils';
/**
 * 時間標籤鍵值枚舉
 */
export enum TimeLabelKeys {
    ENTRANCE = "entrance",
    LOADER = "loader",
    WS = "ws",
    LOGIN = "login",
    TAKE_MACHINE = "takeMachine",
    LOAD_INFO = "loadInfo",
    SETUP_COSTUME_START = "setupCostumeStart",
    SETUP_COSTUME_END = "setupCostumeEnd",
    MACHINE_DETAIL_START = "machineDetailStart",
    MACHINE_DETAIL_END = "machineDetailEnd"
}

/**
 * 時間標籤項目介面
 */
interface TimeLabelItem {
    label: string;
    preLabel?: TimeLabelItem;
    time: number;
    timeDiff: number;
    diffWith: (label: string) => number;
}

/**
 * 載入資訊管理類
 * 追蹤遊戲載入過程中的各個時間點
 */
export class LoadingInfo {
    private timeLabels: Record<string, TimeLabelItem> = {};
    private currentLabel: string = "";
    private firstTime: number = 0;
    private gameType: string = "";
    private userID: number = 0;
    private sendOnce: boolean = true;

    /**
     * 獲取共享實例
     */
    static getInstance(): LoadingInfo {
        if ((window as any).gtLibTsScope?.loadingInfo) {
            return (window as any).gtLibTsScope.loadingInfo;
        }

        if (!(window as any).gtLibTsScope) {
            (window as any).gtLibTsScope = {};
        }

        (window as any).gtLibTsScope.loadingInfo = new LoadingInfo();
        return (window as any).gtLibTsScope.loadingInfo;
    }

    /**
     * 添加時間標籤
     * @param label 標籤名稱
     */
    public push(label: string): void {
        if (this.timeLabels[label]) return;

        const self = this;
        const currentItem: TimeLabelItem = {
            label,
            preLabel: undefined,
            time: Date.now(),
            timeDiff: 0,
            diffWith(label2: string): number {
                const targetLabel = self.timeLabels[label2];
                return this.time - (targetLabel?.time || 0);
            }
        };

        const prevItem = this.timeLabels[this.currentLabel];
        if (prevItem) {
            const prevTime = prevItem.time;
            currentItem.timeDiff = currentItem.time - prevTime;
            currentItem.preLabel = prevItem;
        } else {
            const firstTime = (window as any).gameLoaderEnterTime || currentItem.time;
            currentItem.timeDiff = currentItem.time - firstTime;
            this.firstTime = firstTime;
        }

        this.currentLabel = label;
        this.timeLabels[label] = currentItem;
    }

    /**
     * 顯示所有時間標籤
     */
    public show(): void {
        let showString = "";
        let currentItem = this.timeLabels[this.currentLabel];

        while (currentItem) {
            const date = new Date(currentItem.time);
            const timeFormat = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getUTCMilliseconds()}`;

            showString = `${currentItem.preLabel?.label || "enterPage"} => ${currentItem.label}: 
          time: ${timeFormat}
          diff: ${currentItem.timeDiff}
        ${showString}`;
            currentItem = currentItem.preLabel!;  // 使用非空斷言 !
        }

        // console.log(showString);
    }

    /**
     * 獲取總載入時間
     */
    public totalTime(): number {
        const currentItem = this.timeLabels[this.currentLabel];
        if (!currentItem) return 0;
        return currentItem.time - this.firstTime;
    }

    /**
     * 獲取指定標籤的時間
     * @param label 標籤名稱
     */
    public getTime(label: string): number {
        return this.timeLabels[label]?.time || 0;
    }

    /**
     * 發送載入時間數據
     */
    public sendLoadingTime(): void {
        if (!this.timeLabels.loader ||
            !this.timeLabels.ws ||
            !this.timeLabels.login ||
            !this.timeLabels.loadInfo ||
            !this.timeLabels.setupCostumeEnd ||
            !this.sendOnce) {
            return;
        }

        const deviceInfo = DetectDevice.getDeviceInfo();

        const portal = (() => {
            const platform = getUrlQuery("platform");
            switch (platform) {
                case "AIO":
                    return deviceInfo.mua || "AIO";
                case "app":
                    return "APP";
                case "":
                    return DetectDevice.isPC ? "PC" : "Phone";
                default:
                    return "其他";
            }
        })();

        const clickGame = (urlHelper as any).gameLoaderEnterTime ||
            Math.floor(+(urlHelper as any).playtime * 1000) ||
            this.getTime(TimeLabelKeys.ENTRANCE);

        const rd1Domain = (urlHelper as any).memberDomain;
        const cdnDomain = (urlHelper as any).CDNIP || location.host;

        const data = {
            GameType: (urlHelper as any).gameType,
            HallID: (urlHelper as any).hallId,
            UserID: (urlHelper as any).userId,
            SessionID: (urlHelper as any).sid,
            Domain: location.host,
            Browser: deviceInfo.pf || "",
            OS: deviceInfo.os || "",
            Portal: portal,
            ClickGame: clickGame,
            Entrance: this.getTime(TimeLabelKeys.ENTRANCE),
            Loader: this.getTime(TimeLabelKeys.LOADER),
            WebSocket: this.getTime(TimeLabelKeys.WS),
            LoginCheck: this.getTime(TimeLabelKeys.LOGIN),
            TakeMachine: this.getTime(TimeLabelKeys.TAKE_MACHINE) || this.getTime(TimeLabelKeys.LOGIN),
            OnLoadInfo2: this.getTime(TimeLabelKeys.LOAD_INFO),
            GetMachineDetail: this.getTime(TimeLabelKeys.MACHINE_DETAIL_END) || this.getTime(TimeLabelKeys.LOAD_INFO),
            Complete: Math.max(
                this.getTime(TimeLabelKeys.SETUP_COSTUME_END),
                this.getTime(TimeLabelKeys.MACHINE_DETAIL_END)
            ),
            CDN: cdnDomain,
            MemberDomain: rd1Domain
        };

        const sendData = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
            sendData.append(key, `${value}`);
        });

        this.sendOnce = false;

        fetch(
            `${(urlHelper as any).domain}/ipl/portal.php/game/casinofrontend_entrance/loadingtime`,
            {
                method: "POST",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: sendData
            }
        ).catch(() => {
            Logger.warn("發送loadingtime失敗");
        });
    }
}

export const loadingInfo = LoadingInfo.getInstance();