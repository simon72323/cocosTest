/**
 * 啟動管理器 - 負責初始化遊戲的各種服務和配置
 */

import { CommonStore } from '@common/h5GameTools/CommonStore';
import { DetectDevice } from '@common/utils/DetectDevice';
import { Logger } from '@common/utils/Logger';
import { UrlHelper } from '@common/utils/UrlHelper';
import { getUrlQuery } from '@common/utils/UrlUtils';

/**
 * 添加 VConsole 調試工具
 */
function addVConsole(): void {
    // 檢查是否為 AIO 設備且為測試環境
    const betaAIO = DetectDevice.isAIO && UrlHelper.getInstance().domain.includes('game2.casinovir999.net');

    if (getUrlQuery('console') === '1' || betaAIO) {
        // 暫時註解 VConsole 功能，避免模組依賴問題
        Logger.debug('VConsole 功能已暫時停用');

        // TODO: 實作 VConsole 功能
        // 需要先安裝 vconsole 套件並配置 TypeScript 模組設定
    }
}

/**
 * 獲取國際化資源
 */
async function getI18n(): Promise<void> {
    try {
        const url = `${UrlHelper.getInstance().domain}/ipl/app/flash/pig/game/common/dict/${UrlHelper.getInstance().lang}.json?v=${Date.now()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const i18n = await response.json();
        CommonStore.getInstance().storeMutation.setData('i18n', i18n);

        Logger.debug('國際化資源載入成功');
    } catch (error) {
        Logger.error('國際化資源載入失敗:', error);
    }
}

/**
 * 啟動遊戲
 * 初始化所有必要的服務和配置
 */
async function boot(): Promise<void> {
    try {
        Logger.debug('開始啟動遊戲...');

        // 並行執行所有初始化任務
        await Promise.all([
            CommonStore.getInstance().boot(),
            getI18n(),
            addVConsole()
        ]);

        Logger.debug('遊戲啟動完成');
    } catch (error) {
        Logger.error('遊戲啟動失敗:', error);
        throw error;
    }
}

/**
 * 檢查遊戲是否已準備就緒
 */
function isGameReady(): boolean {
    // TODO: 實作遊戲就緒狀態檢查
    // 需要 CommonStore 提供 isReady 屬性或類似狀態
    return true;
}

/**
 * 等待遊戲準備就緒
 */
async function waitForGameReady(): Promise<void> {
    if (isGameReady()) {
        return;
    }

    return new Promise(resolve => {
        const checkReady = () => {
            if (isGameReady()) {
                resolve();
            } else {
                setTimeout(checkReady, 100);
            }
        };
        checkReady();
    });
}

// 匯出主要功能
export { boot as default, boot, getI18n, addVConsole, isGameReady, waitForGameReady };


