/** 建構式類型 */
type Constructor<T= {}> = new (...args: any[]) => T;
/** 把物件的key串成 'aaa' | 'bbb' | 'ccc' 的字串類型 */
type EnumType<T extends { [key: string]: any }> = T[keyof T];
/** 內容為optional的物件 */
type OptionalRecord<K extends string, V> = { [P in K]?: V };
/** 把物件內容轉成undefined */
type CovertToUndefinedObject<T> = { [key in keyof T]: undefined; }
/** 遞迴把物件轉為optional */
type DeepOptional<T> = { [P in keyof T]?: DeepOptional<T[P]>; };
/** 遞迴把物件轉為writeable */
type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
/** 遞迴把物件轉為required */
type DeepRequired<T> = { [P in keyof T]-?: DeepRequired<T[P]> };
/** 把物件轉為optional(僅轉換第一層屬性) */
type Optional<T extends Record<string, any>> = { [K in keyof T]?: T[K] };

type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> & {
    [P in K]?: T[P];
};

type DirectionSpec<T> = {
    common: DeepOptional<T>;
    portrait: DeepOptional<T>;
    landscape: DeepOptional<T>;
} | {
    common?: never;
    portrait: DeepOptional<T>;
    landscape: DeepOptional<T>;
} | {
    common: DeepOptional<T>;
    portrait: DeepOptional<T>;
    landscape?: never;
} | {
    common: DeepOptional<T>;
    portrait?: never;
    landscape: DeepOptional<T>;
} | ({
    common?: never;
    portrait?: never;
    landscape?: never;
} & T);

type PickStateProps<T> = {
    [K in keyof T as K extends `${string}State` ? K : never]: T[K]
};