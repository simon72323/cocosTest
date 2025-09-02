declare namespace BBApi {
    export interface LoginBySidData {
        userID: number;
        sid: string;
        hallID: number;
        GameID: number;
        COID: number;
        Test: boolean;
        ExchangeRate: number;
        IP: string;
    }

    export interface LoginInfoData {
        event: boolean;
        Balance: number;
        Base: string;
        DefaultBase: string;
        BetCreditList: number[];
        DefaultBetCredit: number;
        EnableJP?: boolean;
        ExtraBetCreditList?: number[];
        ExtraDefaultCredit?: number;
        Rates: Record<string, number[]>;
        Roller?: LoginInfoData.Roller;
        UserAutoExchange?: LoginInfoData.UserAutoExchange;
        Currency: string;
        BuyFree?: boolean;
        LoginName?: string;
        AutoExchange: boolean;
        Credit?: number;
        BetBase?: string;
        isCash: boolean;
        userSetting: Record<string, any>;
        SingleBet: number;
        noExchange?: boolean;
        UserID?: number;
        LeftRound?: {
            BrickNum: string | number;
            LevelID: number;
        };
        UserName?: string;
        GameCode?: number;
        /** 舞獅奪寶彩球累績最大值 */
        HydrangeaMaxNum?: LoginInfoData.HydrangeaMaxNum;
    }

    namespace LoginInfoData {
        interface HydrangeaMaxNum {
            BlPu: number;
            GoRe: number;
            GrPi: number;
        }
        interface UserAutoExchange {
            IsAuto: boolean;
            Credit: number;
            BetBase: string;
            Record: any[];
        }

        interface Roller {
            Normal: number[][];
            Free: number[][];
            RespinNormal?: number[][];
            RespinFree?: number[][];
            LastRespinNormal?: number[][];
            LastRespinFree?: number[][];
            ExtraNormal?: number[][];
            ExtraFree?: number[][];
            ExtraRespinNormal?: number[][];
            ExtraRespinFree?: number[][];
            ExtraLastRespinNormal?: number[][];
            ExtraLastRespinFree?: number[][];
            NormalDown?: number[][];
            FreeDown?: number[][];
            [key: `Roller${number}`]: number[][] | undefined;
        }
    }

    export interface GetMachineDetailData {
        event: boolean;
        ExchangeRate: number;
        LoginName: string;
        Currency: string;
        HallID: number;
        UserID: number;
        Balance: number;
        Test: boolean;
        Base: string;
        DefaultBase: string;
        Credit: number;
        BetBase: string;
        WagersID: number;
    }

    export type UpdateJPData = [grand: number, major: number, minor: number, mini: number];

    export interface BBInitData extends LoginBySidData, LoginInfoData {}
}
