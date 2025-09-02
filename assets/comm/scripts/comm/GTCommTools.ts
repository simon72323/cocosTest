import { commonStore } from "@common/h5GameTools/CommonStore";
import { GTLoaderCommStore } from "./GTLoderCommStore";
import { NumberUtils } from "@common/utils/NumberUtils";
import { Logger } from "@common/utils/Logger";


export function geti18nTex(str : string):string{
    let tempStr = str;
    if(commonStore.storeState.i18n){
        tempStr = commonStore.storeState.i18n[str];
    }
    return (tempStr)?tempStr:str;
}

export function getAutoExchangeCredit(): number {
    const { bet, exchangeCredit, balance, credit, exchangeAll } = commonStore.storeState;
    const exchangeLimit = GTLoaderCommStore.getInstance().getData('exchangeCreditLimit');

    const totalBalance = NumberUtils.accAdd(balance, credit);
    const actualLimit = Math.floor(NumberUtils.accSub(Math.min(totalBalance, exchangeLimit || 5000000000), credit));

    let exchangeAmount = Math.max(bet, exchangeCredit);
    return exchangeAll? actualLimit : exchangeAmount;
}

/**
     * 私有方法，功能為，計算輸入數字的小數位數。
     * @param num 要檢查的數字
     * @returns 小數位數
     */
export function getDecimalPlaces(num: number): number {
    const decimalPlaces = num.toString().split('.')[1];
    if (decimalPlaces) {
        return decimalPlaces.length;
    } else {
        return 0;
    }
}

// 檢查可不可以自動換分
export function canAutoExchangeCredit( ): boolean {
    const { autoExchange, balance } = commonStore.storeState;
    let actualLimit = getAutoExchangeCredit( );
    // return CommonStore.shared.storeState.isXC == false && autoExchange && balance >= 1 && balance >= actualLimit;
    if (commonStore.storeState.customConfig.canExchange == false){
        return false;
    }else {
        return autoExchange && balance >= 1 && balance >= actualLimit;        
    }
}

// 檢查餘額是否足夠
// export function isCreditEnough(rate:number = 1): boolean {
//     const { bet, credit } = CommonStore.shared.storeState;
//     return numberUtils.accMul(bet, rate) <= credit;
// }

export function isCreditEnough(rate: number = 1, bets?: number): boolean {
    const { bet, credit } = commonStore.storeState;

    // 檢查輸入值是否有效
    if (typeof bet !== 'number' || typeof credit !== 'number' || rate <= 0) {
        Logger.warn('Invalid bet, credit, or rate:', { bet, credit, rate });
        return false;
    }

    try {
        // 使用 bets 若存在，否則使用 bet
        return NumberUtils.accMul(bets ?? bet, rate) <= credit;
    } catch (e) {
        Logger.error('Error in accMul:', e);
        return false;
    }
}



