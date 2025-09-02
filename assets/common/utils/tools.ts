import { NumberUtils } from '@common/utils/NumberUtils';

/**
 * 生成Promise
 * @param T 類型
 * @returns Promise
 */
export function generatePromise<T = void>() {
    let resolve!: (value: T) => void;
    let reject!: () => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return {
        promise,
        resolve,
        reject
    };
}


/**
 * 異步等待
 * @param sleepTime 等待時間(ms)
 */
export async function awaitSleep(sleepTime: number) {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, sleepTime);
    });
}

/**
 * 生成動畫Promise
 * @returns 動畫Promise
 */
type WaitAnimationResult = {
    stop: boolean;
    complete: boolean;
};
export function generateAnimationPromise() {
    const stop = generatePromise<'stop'>();
    const complete = generatePromise<'complete'>();
    const animation = new Promise<WaitAnimationResult>(async resolve => {
        const trigger = await Promise.race([stop.promise, complete.promise]);

        if (trigger === 'stop') {
            complete.reject();

            resolve({
                stop: true,
                complete: false
            });
            return;
        }

        stop.reject();
        resolve({
            stop: false,
            complete: true
        });
    });

    return {
        stop: () => stop.resolve('stop'),
        complete: () => complete.resolve('complete'),
        promise: animation
    };
}

/**
 * 創建面板時用來取得沒重複的key值，例如: spine_1
 * @param prefix: '_'前面的名稱
 * @param checkList: 檢查的清單，可給物件格式或陣列格式
 */
type CheckListItem = {
    key: string;
    [key: string]: any;
};
export function getValidElementKey(prefix: string, checkList: CheckListItem[] | Record<string, any>) {
    let keys: Record<string, any>;

    if (Array.isArray(checkList)) {
        keys = (checkList as CheckListItem[]).reduce<Record<string, any>>((stackKeys, item) => {
            stackKeys[item.key] = true;
            return stackKeys;
        }, {});
    } else {
        keys = checkList;
    }

    let searchIndex = 1;
    let checkName = `${prefix}_${searchIndex}`;

    while (keys[checkName]) {
        checkName = `${prefix}_${searchIndex++}`;
    }

    return checkName;
}

/**
 * 取得適用的index
 * @param array 陣列
 * @param index 索引
 * @returns 適用的索引
 */
export function getValidIndex(array: any[], index: number) {
    if (!array.length) return 0;

    let _index = index % array.length;

    if (_index < 0) {
        _index += array.length;
    }
    return _index;
}

/**
 * 取得適用的item
 * @param array 陣列
 * @param index 索引
 * @returns 適用的item
 */
export function getItemBydIndex<T>(array: T[], index: number): T | undefined {
    if (!array.length) return;

    const validIndex = getValidIndex(array, index);
    return array[validIndex];
}

/**
 * 從丟入的陣列中隨機一個值回傳
 * @param arr 陣列
 * @returns 隨機的值
 */
export function getRandomFromArray<T>(arr: T[]) {
    return arr[NumberUtils.getRandomInt(0, arr.length - 1)];
}

/**
 * 比率 1:10 -> 0.1
 * @param rate 比率
 * @returns 比率
 */
export function getChangeRate(rate: string) {
    const rateArr = rate.split(':');
    rateArr.forEach((v, i) => {
        rateArr[i] = v.replace('K', '000');
    });

    const count = NumberUtils.accDiv(+rateArr[0], +rateArr[1]);
    return count;
}

/**
 * 將信用點數轉換為餘額
 * @param credit 信用點數
 * @param rate 比率
 * @returns 餘額
 */
export function creditToBalance(credit: string | number, rate: string) {
    return NumberUtils.accMul(+credit, getChangeRate(rate));
}

/**
 * 生成保留小數的工廠
 * @param param 參數
 * @returns 保留小數的工廠
 */
export function generateKeepDecimalFactory(param: {
    finalAmount?: string | number;
    thousandth?: boolean;
    forceRoundCount?: number
}) {
    const { finalAmount = '', thousandth = false, forceRoundCount } = param;

    const decimalCount = forceRoundCount ?? `${finalAmount}`.split('.')[1]?.length ?? 0;

    return (currentAmount: string | number) => NumberUtils.formatNumber({
        formatValue: currentAmount,
        roundCount: decimalCount,
        keepDecimal: true,
        thousandth
    });
}

/**
 * 小數超過6位的數字當成浮點數誤差的數字
 * @param num 數字
 * @returns 是否為浮點數誤差
 */
export function maybeInvalidNumber(num: number | string) {
    const decimalCount = `${num}`.split('.')[1]?.length ?? 0;
    return decimalCount > 6;
}
