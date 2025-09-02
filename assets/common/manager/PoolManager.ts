/**
 * 對象池管理器使用示例：
 * 
 * // 1. 獲取對象池管理器單例
 * const poolManager = getPoolManager().getInstance();
 * 
 * // 2. 創建/獲取節點
 * const prefab: Prefab = xxx; // 你的預製體資源
 * const node = poolManager.get(prefab); // 從對象池獲取節點，如果池中無節點則會創建新的
 * 
 * // 3. 回收節點到對象池
 * poolManager.put(node); // 當節點不再使用時，將其放回對象池以供復用
 * 
 * // 4. 清理指定對象池
 * poolManager.clear("poolName"); // 清理特定名稱的對象池
 * 
 * // 5. 清理所有對象池
 * poolManager.clear(); // 不傳參數則清理所有對象池
 * 
 * // 6. 查詢對象池大小
 * const size = poolManager.getPoolSize("poolName"); // 獲取指定對象池中的節點數量
 */

/**
 * @api {class} PoolManager prefab節點創建回收
 * @apiName PoolManager
 * @apiGroup Manager
 * @apiDescription prefab節點創建回收
 */
import { _decorator, Component, Node, Prefab, director, instantiate, NodePool, UIOpacity } from 'cc';
const { ccclass } = _decorator;

@ccclass('PoolManager')
export default class PoolManager extends Component {
    private static _instance: PoolManager; // 使用單一實例
    private poolTable: Map<string, NodePool> = new Map();

    /**
     * 獲取對象池實例
     */
    public static getInstance(): PoolManager {
        if (!PoolManager._instance) {
            const node = new Node('PoolManager');
            director.getScene()!.addChild(node);
            PoolManager._instance = node.addComponent(PoolManager);
        }
        return PoolManager._instance;
    }

    /**
     * 釋放實例
     */
    protected onDestroy() {
        if (this !== PoolManager._instance) {
            return;
        }
        this.clear();//清理所有對象池
        PoolManager._instance = null!;//釋放實例
    }

    /**
     * 從對象池獲取節點
     * @param prefab 預製體
     */
    public get(prefab: Prefab): Node {
        const poolName = prefab.name;

        let pool = this.poolTable.get(poolName);
        if (!pool) {
            pool = new NodePool();
            this.poolTable.set(poolName, pool);
        }

        let node = pool.get();
        if (!node) {
            //如果池中沒有節點，創建新節點並放入池中
            node = instantiate(prefab);
        }

        return node;
    }

    /**
     * 將節點返回對象池
     * @param node 要返回的節點
     */
    public put(node: Node): void {
        this.resetNodeState(node);
        const pool = this.poolTable.get(node.name);
        if (pool) pool.put(node);
    }

    /**
     * 重置節點狀態
     */
    private resetNodeState(node: Node): void {
        this.resetNodeOpacity(node);// 重置透明度
        this.resetChildNodes(node);// 重置子節點狀態
    }

    /**
     * 重置子節點狀態
     */
    private resetChildNodes(node: Node): void {
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            this.resetNodeOpacity(child);
            this.resetChildNodes(child);// 重置子節點狀態
        }
    }

    /**
     * 重置節點透明度
     */
    private resetNodeOpacity(node: Node): void {
        const uiOpacity = node.getComponent(UIOpacity);
        if (uiOpacity) {
            uiOpacity.opacity = 255;
        }
    }

    /**
     * 清理指定對象池
     * @param poolName 可選，不傳則清理該實例下所有對象池
     */
    public clear(poolName?: string): void {
        if (poolName) {
            const pool = this.poolTable.get(poolName);
            if (pool) {
                pool.clear();
                this.poolTable.delete(poolName);
            }
        } else {
            this.poolTable.forEach(pool => pool.clear());
            this.poolTable.clear();
        }
    }

    /**
     * 獲取對象池大小
     * @param poolName 對象池名稱
     */
    public getPoolSize(poolName: string): number {
        const pool = this.poolTable.get(poolName);
        return pool ? pool.size() : 0;
    }
}

export const getPoolManager = () => {
    return PoolManager.getInstance();
}