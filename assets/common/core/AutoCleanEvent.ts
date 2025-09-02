// export class AutoCleanupManager {
//     private static cleanupCallbacks: Array<() => void> = [];
//     private static _instance: AutoCleanupManager | null = null;
//     private static _hasEventListener: boolean = false; // 添加标志

//     public static getInstance(): AutoCleanupManager {
//         if (!AutoCleanupManager._instance) {
//             AutoCleanupManager._instance = new AutoCleanupManager();
//             // 只在第一次创建时添加事件监听器
//             if (!AutoCleanupManager._hasEventListener) {
//                 window.addEventListener('beforeunload', () => {
//                     AutoCleanupManager.clear();
//                 });
//                 AutoCleanupManager._hasEventListener = true;
//             }
//         }
//         return AutoCleanupManager._instance;
//     }

//     public static register(callback: () => void) {
//         AutoCleanupManager.cleanupCallbacks.push(callback);
//     }

//     private static clear() {
//         AutoCleanupManager.cleanupCallbacks.forEach(callback => {
//             try {
//                 callback();
//             } catch (error) {
//                 console.error('自动清理失败:', error);
//             }
//         });
//         AutoCleanupManager.cleanupCallbacks = [];
//         AutoCleanupManager._instance = null;
//     }
// }