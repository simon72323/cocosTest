/**
 * 數字工具類 - 提供數字格式化、隨機數生成、精確計算等功能
 */

/**
 * 數字格式化參數介面
 */
export interface FormatNumberParams {
    formatValue: number | string;
    roundCount?: number;
    thousandth?: boolean;
    keepDecimal?: boolean;
    isKFormat?: boolean;
    decimalType?: 'floor' | 'round';
}

/**
 * 數字工具類
 */
export class NumberUtils {
    /**
     * 獲取指定範圍內的隨機浮點數
     * @param start 起始值
     * @param end 結束值
     * @returns 隨機浮點數
     */
    public static getRandomFloat(start: number, end: number): number {
        return Math.random() * (end - start) + start;
    }

    /**
     * 獲取指定範圍內的隨機整數
     * @param start 起始值
     * @param end 結束值
     * @returns 隨機整數
     */
    public static getRandomInt(start: number, end: number): number {
        return Math.floor(Math.random() * (end - start + 1)) + start;
    }

    /**
     * 從陣列中隨機獲取指定數量的元素
     * @param array 源陣列
     * @param getCount 獲取數量
     * @returns 隨機選擇的陣列元素
     */
    public static getRandomArray<T>(array: T[], getCount: number): T[] {
        const newArr: T[] = [];
        const tempArray = [...array]; // 複製陣列避免修改原陣列

        for (let i = 0; i < getCount && tempArray.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * tempArray.length);
            const item = tempArray.splice(randomIndex, 1)[0];
            newArr.push(item);
        }

        // 按數字大小排序（如果是數字的話）
        return newArr.sort((a, b) => {
            if (typeof a === 'number' && typeof b === 'number') {
                return b - a;
            }
            return 0;
        });
    }

    /**
     * 千分位格式化
     * @param formatValue 要格式化的值
     * @returns 格式化後的字串
     */
    public static thousandFormat(formatValue: number | string): string {
        const valueStr = `${formatValue}`;
        if (isNaN(+valueStr)) {
            return valueStr;
        }

        const arr = valueStr.split('.');
        const re = /(\d{1,3})(?=(\d{3})+$)/g;
        const num = arr[0].replace(re, '$1,') + (arr.length === 2 ? `.${arr[1]}` : '');
        return num;
    }

    /**
     * 小數點格式化
     * @param formatValue 要格式化的值
     * @param roundCount 小數位數
     * @param type 捨入類型
     * @returns 格式化後的字串
     */
    public static pointFormat(formatValue: number | string, roundCount?: number, type: 'floor' | 'round' = 'floor'): string {
        const valueStr = `${formatValue}`;
        if (isNaN(+valueStr)) {
            return valueStr;
        }

        const slice = valueStr.split('.');
        if (slice.length === 1) {
            return `${valueStr}${roundCount ? `.${'0'.repeat(roundCount)}` : ''}`;
        }

        const decimalLength = slice[1].length;
        if (roundCount === undefined) {
            return valueStr;
        }

        const lengthDiff = roundCount - decimalLength;

        if (!lengthDiff) {
            return valueStr;
        }

        if (lengthDiff > 0) {
            return `${valueStr}${'0'.repeat(lengthDiff)}`;
        }

        let floorString = valueStr.slice(0, lengthDiff);

        if (type === 'round') {
            const checkNum = valueStr.slice(lengthDiff, lengthDiff + 1);
            floorString = +checkNum >= 5 ? (+`${floorString}51`).toFixed(roundCount) : floorString;
        }

        return floorString;
    }

    /**
     * 數字格式化
     * @param param 格式化參數
     * @returns 格式化後的字串
     */
    public static formatNumber(param: FormatNumberParams): string {
        const { formatValue, roundCount, thousandth, keepDecimal, isKFormat, decimalType = 'floor' } = param;
        const valueNum = +formatValue;

        if (isNaN(valueNum)) return `${formatValue}`;

        let calcValue: number | string = valueNum;
        let kSymbol = '';

        if (isKFormat && valueNum >= 1e5) {
            calcValue = NumberUtils.accMul(valueNum, 1e-3);
            kSymbol = 'K';
        }

        if (roundCount !== undefined) {
            calcValue = NumberUtils.pointFormat(calcValue, roundCount, decimalType);
            calcValue = keepDecimal ? calcValue : +calcValue;
        }

        const thousandthValue = thousandth ? NumberUtils.thousandFormat(calcValue) : `${calcValue}`;
        return `${thousandthValue}${kSymbol}`;
    }

    /**
     * 精確乘法
     * @param arg1 第一個數
     * @param arg2 第二個數
     * @returns 精確的乘積
     */
    public static accMul(arg1: number, arg2: number): number {
        const arg1Str = `${arg1}`;
        const arg2Str = `${arg2}`;
        let pow = 0;

        const arg1Decimal = arg1Str.split('.')[1];
        const arg2Decimal = arg2Str.split('.')[1];

        pow += arg1Decimal ? arg1Decimal.length : 0;
        pow += arg2Decimal ? arg2Decimal.length : 0;

        const r1 = +arg1Str.replace('.', '');
        const r2 = +arg2Str.replace('.', '');

        return r1 * r2 / Math.pow(10, pow);
    }

    /**
     * 精確除法
     * @param arg1 被除數
     * @param arg2 除數
     * @returns 精確的商
     */
    public static accDiv(arg1: number, arg2: number): number {
        const arg1Str = `${arg1}`;
        const arg2Str = `${arg2}`;

        const t1 = arg1Str.split('.')[1]?.length || 0;
        const t2 = arg2Str.split('.')[1]?.length || 0;

        const r1 = +arg1Str.replace('.', '');
        const r2 = +arg2Str.replace('.', '');

        return NumberUtils.accMul(r1 / r2, +`1e${t2 - t1}`);
    }

    /**
     * 精確加法
     * @param arg1 第一個數
     * @param arg2 第二個數
     * @returns 精確的和
     */
    public static accAdd(arg1: number, arg2: number): number {
        let r1 = 0;
        let r2 = 0;
        let m: number;

        try {
            r1 = arg1.toString().split('.')[1].length;
        } catch {
            // 忽略錯誤
        }

        try {
            r2 = arg2.toString().split('.')[1].length;
        } catch {
            // 忽略錯誤
        }

        m = Math.pow(10, Math.max(r1, r2));
        return (NumberUtils.accMul(arg1, m) + NumberUtils.accMul(arg2, m)) / m;
    }

    /**
     * 精確減法
     * @param arg1 被減數
     * @param arg2 減數
     * @returns 精確的差
     */
    public static accSub(arg1: number, arg2: number): number {
        return NumberUtils.accAdd(arg1, -arg2);
    }
}

// 匯出靜態方法作為獨立函數，保持向後相容性
export const getRandomFloat = NumberUtils.getRandomFloat;
export const getRandomInt = NumberUtils.getRandomInt;
export const getRandomArray = NumberUtils.getRandomArray;
export const thousandFormat = NumberUtils.thousandFormat;
export const pointFormat = NumberUtils.pointFormat;
export const formatNumber = NumberUtils.formatNumber;
export const accMul = NumberUtils.accMul;
export const accDiv = NumberUtils.accDiv;
export const accAdd = NumberUtils.accAdd;
export const accSub = NumberUtils.accSub;


