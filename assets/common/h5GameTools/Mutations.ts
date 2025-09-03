import { Comm } from '@common/h5GameTools/GTCommEvents';
import { getEventManager } from '@common/manager/EventManager';
import { Logger } from '@common/utils/Logger';
import { urlHelper } from '@common/utils/UrlHelper';

/**
 * 状态接口
 */
export interface GameState {
    [key: string]: any;
    credit: number;
    wagersID: string;
    jackpot: number;
    userID: number;
    hallID: string;
    gameCode: string;
    isCash: boolean;
    userName: string;
    balance: number;
    enableJP: boolean;
    betCreditList: any[];
    bet: number;
    lineBet: number;
    autoExchange: boolean;
    exchangeCredit: number;
    exchangeAll: boolean;
    exchangeRecord: any[];
    isGCP: boolean;
    currency: string;
    base: string;
    baseList: string[];
    gameStatus: string;
}

/**
 * 游戏数据接口
 */
export interface GameData {
    Credit?: number;
    WagersID?: string;
    UserID?: number;
    userID?: number;
    HallID?: string;
    hallID?: string;
    data?: {
        gameCode?: string;
    };
    isCash?: boolean;
    LoginName?: string;
    Balance?: string;
    EnableJP?: boolean;
    BetCreditList?: any[];
    DefaultBetCredit?: number;
    UserAutoExchange?: {
        IsAuto?: boolean;
        Credit?: number;
        Record?: any[];
        BetBase?: string;
    };
    UserName?: string;
    Currency?: string;
    DefaultBase?: string;
    Base?: string;
    beginGameResult?: {
        data: GameData;
    };
}

/**
 * 使用状态变更器
 * @param state 游戏状态
 * @returns 状态变更器实例
 */
export function useMutations(state: GameState) {
    class Mutations {
        /**
         * 设置数据
         */
        setData(key: string, value: any): void {
            state[key] = value;
        }

        /**
         * 开始游戏
         */
        onBeginGame(data: GameData): void {
            Logger.debug('[CommonStore::onBegingame]', data);
            state.credit = parseFloat(data.Credit?.toString() || state.credit.toString());
            state.wagersID = data.WagersID || state.wagersID;
        }

        /**
         * 更新奖池
         */
        onUpdateJP(data: any): void {
            state.jackpot = data;
        }

        /**
         * 用户登录
         */
        onLogin(data: GameData): void {
            state.userID = data.UserID || data.userID || state.userID;
            state.hallID = data.HallID || data.hallID || state.hallID;
        }

        /**
         * 获取机器
         */
        onTakeMachine(data: GameData): void {
            state.gameCode = data?.data?.gameCode || state.gameCode;
        }

        /**
         * 加载信息
         */
        onOnLoadInfo(data: GameData): void {
            Logger.debug('[CommonStore::onOnLoadInfo]', data);
            state.isCash = data.isCash || false;
            state.userName = data.LoginName || '';
            state.userID = data.UserID || state.userID;
            state.credit = +(data.Credit || 0);
            state.balance = +(data.Balance || 0);
            state.enableJP = data.EnableJP ?? urlHelper.JpOpen;

            if (data.BetCreditList) {
                state.betCreditList = data.BetCreditList;
                state.bet = state.lineBet = data.DefaultBetCredit || 0;
            }

            if (data.UserAutoExchange) {
                state.autoExchange = data.UserAutoExchange.IsAuto ?? state.autoExchange;
                state.exchangeCredit = data.UserAutoExchange.Credit ?? state.exchangeCredit;
                state.exchangeAll = state.exchangeCredit === -1;
                state.exchangeRecord = data.UserAutoExchange.Record || state.exchangeRecord;
            }

            if (urlHelper.isDemo) {
                state.autoExchange = true;
                state.exchangeCredit = -1;
                state.exchangeAll = true;
            }

            if (data.UserName) {
                state.isGCP = true;
                state.userName = data.UserName;
                state.credit = +(data.Balance || 0);
            }

            state.currency = data.Currency || state.currency;
            state.base = data.UserAutoExchange?.BetBase || data.DefaultBase || state.base;
            state.baseList = (data.Base || '').split(';');
        }

        /**
         * 获取机器详情
         */
        onGetMachineDetail(data: GameData): void {
            Logger.debug('[CommonStore::onGetMachineDetail]', data);
            state.currency = data.Currency || state.currency;
            state.balance = +(data.Balance || 0);
            state.credit = +(data.Credit || 0);
        }

        /**
         * 积分兑换
         */
        onCreditExchange(data: GameData): void {
            Logger.debug('[CommonStore::onCreditExchange]', data);
            state.balance = +(data.Balance || state.balance);
            state.credit = +(data.Credit || state.credit);
        }

        /**
         * 余额兑换
         */
        onBalanceExchange(data: GameData): void {
            Logger.debug('[CommonStore::onBalanceExchange]', data);
            state.balance = +(data.Balance || 0);
            state.credit = 0;
        }

        /**
         * 中奖
         */
        onHitJackpot(data: GameData): void {
            Logger.debug('[CommonStore::onBalanceExchange]', data);
            this.onBeginGame(data.beginGameResult?.data || {} as GameData);
        }

        /**
         * 游戏结束
         */
        onEndGame(data: GameData): void {
            Logger.debug('[CommonStore::onEndGame]', data);
            state.credit = +(data.Credit || 0);
        }

        /**
         * 保持机器状态
         */
        onKeepMachineStatus(data: any): void {
            Logger.debug('[CommonStore::onKeepMachineStatus]', data);
        }

        /**
         * 双倍游戏
         */
        onDoubleGame(data: any): void {
            Logger.debug('[CommonStore::onDoubleGame]', data);
        }

        /**
         * 更新跑马灯
         */
        onUpdateMarquee(data: any): void {
            getEventManager().emit(Comm.SET_MARQUEE, { marquee: data });
        }

        /**
         * 改变游戏状态
         */
        changeGameStatus(gameStatus: string): void {
            state.gameStatus = gameStatus;
        }
    }

    return new Mutations();
}


