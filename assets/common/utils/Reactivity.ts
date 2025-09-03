import { getUrlQuery } from '@common/utils/UrlUtils';

/**
 * 工具函數類型定義
 */
const objectToString = Object.prototype.toString;
const toTypeString = (value: any): string => objectToString.call(value);

/**
 * 類型檢查函數
 */
export const isArray = Array.isArray;
export const isMap = (val: any): boolean => toTypeString(val) === '[object Map]';
export const isSet = (val: any): boolean => toTypeString(val) === '[object Set]';
export const isFunction = (val: any): boolean => typeof val === 'function';
export const isObject = (val: any): boolean => val !== null && typeof val === 'object';
export const isPlainObject = (val: any): boolean => toTypeString(val) === '[object Object]';
export const isPromise = (val: any): boolean => isObject(val) && isFunction(val.then) && isFunction(val.catch);

/**
 * 值比較函數
 */
export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue);

/**
 * 常量定義
 */
const __DEVELOPMENT__ = getUrlQuery('isDev') === 'true';
export const EMPTY_OBJ = __DEVELOPMENT__ ? Object.freeze({}) : {};
export const NOOP = (): void => { };
export const INITIAL_WATCHER_VALUE = {};

/**
 * 錯誤代碼枚舉
 */
export enum ErrorCodes {
    WATCH_GETTER = 'watcher getter',
    WATCH_CALLBACK = 'watcher callback',
    WATCH_CLEANUP = 'watcher cleanup function'
}

/**
 * 錯誤處理函數
 */
// function callWithErrorHandling(fn: Function, type: string, args?: any[]): any {
//     let res: any;
//     try {
//         res = args ? fn(...args) : fn();
//     } catch (err) {
//         console.warn(type, err);
//     }
//     return res;
// }

// function callWithAsyncErrorHandling(fn: Function | Function[], type: string, args?: any[]): any {
//     if (isFunction(fn)) {
//         const res = callWithErrorHandling(fn as Function, type, args);
//         if (res && isPromise(res)) {
//             res.catch((err: any) => {
//                 console.warn(err);
//             });
//         }
//         return res;
//     }

//     const values: any[] = [];
//     for (let i = 0; i < (fn as Function[]).length; i++) {
//         values.push(callWithAsyncErrorHandling((fn as Function[])[i], type, args));
//     }
//     return values;
// }

/**
 * 清理包管理
 */
export function createDisposeBag(): (() => void)[] {
    return [];
}

export function disWatch(disposeBag: (() => void)[]): void {
    while (disposeBag.length) {
        const dispose = disposeBag.pop();
        if (dispose) dispose();
    }
}

/**
 * 簡化的響應式系統
 */
export class SimpleReactiveSystem {
    private static instance: SimpleReactiveSystem | null = null;
    public watchers: Map<string, Function[]> = new Map();
    private reactiveData: Map<string, any> = new Map();

    public static getInstance(): SimpleReactiveSystem {
        if (!SimpleReactiveSystem.instance) {
            SimpleReactiveSystem.instance = new SimpleReactiveSystem();
        }
        return SimpleReactiveSystem.instance;
    }

    /**
     * 創建響應式數據
     */
    public reactive<T extends object>(obj: T): T {
        const proxy = new Proxy(obj, {
            get(target, key) {
                return target[key as keyof T];
            },
            set(target, key, value) {
                const oldValue = target[key as keyof T];
                target[key as keyof T] = value;

                // 觸發監聽器
                const system = SimpleReactiveSystem.getInstance();
                system.triggerWatchers(String(key), value, oldValue);

                return true;
            }
        });

        return proxy;
    }

    /**
     * 創建引用
     */
    public ref<T>(value: T): { value: T } {
        return this.reactive({ value });
    }

    /**
     * 監聽數據變化
     */
    public watch<T>(
        source: (() => T) | { value: T },
        callback: (newValue: T, oldValue: T) => void,
        options: { immediate?: boolean; deep?: boolean } = {}
    ): () => void {
        const key = Math.random().toString(36);
        const watchers = this.watchers.get(key) || [];

        if (options.immediate) {
            const currentValue = typeof source === 'function' ? source() : source.value;
            callback(currentValue, currentValue);
        }

        watchers.push(callback);
        this.watchers.set(key, watchers);

        // 返回清理函數
        return () => {
            const currentWatchers = this.watchers.get(key);
            if (currentWatchers) {
                const index = currentWatchers.indexOf(callback);
                if (index > -1) {
                    currentWatchers.splice(index, 1);
                }
            }
        };
    }

    /**
     * 觸發監聽器
     */
    private triggerWatchers(key: string, newValue: any, oldValue: any): void {
        this.watchers.forEach(watchers => {
            watchers.forEach(watcher => {
                try {
                    watcher(newValue, oldValue);
                } catch (error) {
                    console.warn('Watcher error:', error);
                }
            });
        });
    }
}

/**
 * 導出簡化的響應式函數
 */
export const reactive = <T extends object>(obj: T): T => SimpleReactiveSystem.getInstance().reactive(obj);

export const ref = <T>(value: T): { value: T } => SimpleReactiveSystem.getInstance().ref(value);

export const watch = <T>(
    source: (() => T) | { value: T },
    callback: (newValue: T, oldValue: T) => void,
    options: { immediate?: boolean; deep?: boolean } = {}
): (() => void) => SimpleReactiveSystem.getInstance().watch(source, callback, options);

/**
 * 計算屬性
 */
export function computed<T>(getter: () => T): { readonly value: T } {
    let value: T;
    let dirty = true;

    const computedRef = {
        get value(): T {
            if (dirty) {
                value = getter();
                dirty = false;
            }
            return value;
        }
    };

    return computedRef;
}

/**
 * 效果函數
 */
export function effect(fn: () => void): () => void {
    let cleanup: (() => void) | undefined;

    const run = () => {
        if (cleanup) {
            cleanup();
        }

        try {
            fn();
        } catch (error) {
            console.warn('Effect error:', error);
        }
    };

    run();

    return () => {
        if (cleanup) {
            cleanup();
        }
    };
}

/**
 * 工具函數
 */
export const unref = <T>(ref: T | { value: T }): T => {
    if (ref && typeof ref === 'object' && 'value' in ref) {
        return (ref as { value: T }).value;
    }
    return ref;
};

export const toRef = <T extends object, K extends keyof T>(object: T, key: K) => ({
    get value() {
        return object[key];
    },
    set value(newValue: T[K]) {
        object[key] = newValue;
    }
});

export const toRefs = <T extends object>(object: T) => {
    const ret: Record<string, any> = {};
    for (const key of Object.keys(object)) {
        ret[key] = toRef(object, key as keyof T);
    }
    return ret;
};

/**
 * 只讀包裝
 */
export function readonly<T extends object>(obj: T): T {
    return new Proxy(obj, {
        get(target, key) {
            return target[key as keyof T];
        },
        set() {
            console.warn('Cannot modify readonly object');
            return false;
        }
    });
}

/**
 * 清理所有監聽器
 */
export function disWatchAll(): void {
    SimpleReactiveSystem.getInstance().watchers.clear();
}

/**
 * 其他必要的導出（保持兼容性）
 */
export const ITERATE_KEY = Symbol('iterate');
export const awaitRefChanged = <T>(refValue: { value: T }): Promise<{ newValue: T; oldValue: T }> => new Promise(resolve => {
    const clearWatch = watch(refValue, (newValue, oldValue) => {
        resolve({ newValue, oldValue });
        clearWatch();
    });
});

// 導出簡化版本的函數
export const computedFixed = computed;
export const effectFixed = effect;
export const watchFixed = watch;
export const watchLocal = watch;

// 導出類型檢查函數
export const isProxy = (): boolean => false;
export const isReactive = (): boolean => false;
export const isRef = (val: any): boolean => isObject(val) && 'value' in val;
export const isReadonly = (): boolean => false;
export const isShallow = (): boolean => false;

// 導出其他必要的函數（簡化實現）
export const customRef = () => ({});
export const deferredComputed = computed;
export const effectScope = () => ({});
export const enableTracking = () => { };
export const getCurrentScope = () => ({});
export const markRaw = <T>(obj: T): T => obj;
export const onScopeDispose = () => { };
export const pauseTracking = () => { };
export const proxyRefs = <T>(obj: T): T => obj;
export const shallowReactive = reactive;
export const shallowReadonly = readonly;
export const stop = () => { };
export const toRaw = <T>(obj: T): T => obj;
export const track = () => { };
export const trigger = () => { };
export const triggerRef = () => { };


