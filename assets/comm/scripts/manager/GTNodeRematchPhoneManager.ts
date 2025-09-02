import { getEventManager } from '@common/manager/EventManager';
import { Comm, GTCommEventMap } from '@common/h5GameTools/GTCommEvents';
import { Logger } from '@common/utils/Logger';
import { _decorator, Component, Node, UITransform, error, Size, view, screen } from 'cc';
import { GTLoadingCommTool as CommTool } from '../../../loading/script/comm/GTLoadingCommTool';

const { ccclass, property } = _decorator;

/**
 * Manages node repositioning and resizing for different phone aspect ratios.
 * This component adjusts UI elements to fit screens that are taller than the design resolution.
 * It uses a "lazy-store" approach to handle node positions, ensuring robustness against
 * engine layout timing issues and interference from other scripts.
 */
@ccclass('GTNodeRematchPhoneManager')
export class GTNodeRematchPhoneManager extends Component {

    @property([Node])
    repositionDownNode: Node[] = [];

    @property([Node])
    repositionUpNode: Node[] = [];

    @property([Node])
    resizeNode: Node[] = [];

    // Stores the original Y position of a node the first time it's about to be moved.
    private _nodeOriginY: { [uuid: string]: number } = {};
    // Stores the original height of a node the first time it's about to be resized.
    private _nodeOriginHeight: { [uuid: string]: number } = {};

    private onFixNodeBind!: () => void;
    private _boundOnSetGameCoreNodeReposition!: (obj: GTCommEventMap[Comm.SET_GAMECORENODE_REPOSITION]) => void;

    protected onLoad(): void {
        this._setupEventListener();
    }

    protected start(): void {
        // The initial fix is scheduled for the next frame to ensure the UI layout is stable.
        this.scheduleOnce(() => this.fixNode());
    }

    protected onDestroy(): void {
        this._clearEventListener();
    }

    /**
     * Sets up all event listeners for this component.
     */
    private _setupEventListener() {
        this.onFixNodeBind = () => {
            // this.fixNode.bind(this)
            setTimeout(this.fixNode.bind(this), 300);
        };
        this._boundOnSetGameCoreNodeReposition = this.onSetGameCoreNodeReposition.bind(this);

        window.addEventListener('resize', this.onFixNodeBind);
        screen.on('window-resize', this.onFixNodeBind, this);

        getEventManager().on(Comm.SET_GAMECORENODE_REPOSITION, this._boundOnSetGameCoreNodeReposition);
    }

    /**
     * Clears all event listeners set up by this component.
     */
    private _clearEventListener(): void {
        if (this.onFixNodeBind) {
            window.removeEventListener('resize', this.onFixNodeBind);
            screen.off('window-resize', this.onFixNodeBind, this);
        }
        if (this._boundOnSetGameCoreNodeReposition) {
            getEventManager().off(Comm.SET_GAMECORENODE_REPOSITION, this._boundOnSetGameCoreNodeReposition);
        }
    }

    /**
     * The main method for fixing node layout.
     * It determines if a fix is needed and either applies it or reverts any previous fix.
     */
    private fixNode() {
        if (CommTool.checkNeedRefixNode() && CommTool.canAutoFix()) {
            const fixH = CommTool.getFixY();
            this._applyFix(fixH)
        } else {
            this._revertFix();
        }
    }

    /**
     * Applies layout adjustments to all managed nodes.
     * @param fixH The total height adjustment value from CommTool.
     */
    private _applyFix(fixH: number) {
        const offset = fixH / 2;

        // Reposition nodes
        this._applyReposition(this.repositionDownNode, (origY, o) => origY + o, offset);
        this._applyReposition(this.repositionUpNode, (origY, o) => origY - o, offset);

        // Resize nodes
        this.resizeNode.forEach(node => {
            if (!node) return;
            const uiTransform = node.getComponent(UITransform);
            if (!uiTransform) return;

            // Lazy-store the original height if not already stored.
            if (this._nodeOriginHeight[node.uuid] === undefined) {
                this._nodeOriginHeight[node.uuid] = uiTransform.height;
            }

            const originalHeight = this._nodeOriginHeight[node.uuid];
            uiTransform.setContentSize(new Size(uiTransform.width, originalHeight + fixH));
        });

        view.emit('canvas-resize');
        Logger.debug('GTNodeRematchPhoneManager: Applied layout fix.');
    }

    /**
     * Reverts all managed nodes to their stored original positions and sizes.
     */
    private _revertFix() {
        // Revert positions
        const allRepositionNodes = [...this.repositionDownNode, ...this.repositionUpNode];
        allRepositionNodes.forEach(node => {
            if (node && this._nodeOriginY[node.uuid] !== undefined) {
                node.setPosition(node.position.x, this._nodeOriginY[node.uuid]);
            }
        });

        // Revert sizes
        this.resizeNode.forEach(node => {
            if (node && this._nodeOriginHeight[node.uuid] !== undefined) {
                const uiTransform = node.getComponent(UITransform);
                if (uiTransform) {
                    uiTransform.setContentSize(new Size(uiTransform.width, this._nodeOriginHeight[node.uuid]));
                }
            }
        });

        // Clear the stored origins after reverting, so they can be re-captured if a fix is needed again.
        this._nodeOriginY = {};
        this._nodeOriginHeight = {};
        Logger.debug('GTNodeRematchPhoneManager: Reverted layout fix.');
    }

    /**
     * A helper function to apply repositioning to a list of nodes.
     * @param nodes The list of nodes to reposition.
     * @param calculateNewY A function to calculate the new Y position.
     * @param offset The offset value to be used in the calculation.
     */
    private _applyReposition(nodes: Node[], calculateNewY: (originalY: number, offset: number) => number, offset: number) {
        nodes.forEach(node => {
            if (!node) return;

            // Lazy-store the original Y position if not already stored.
            if (this._nodeOriginY[node.uuid] === undefined) {
                this._nodeOriginY[node.uuid] = node.position.y;
            }

            const originalY = this._nodeOriginY[node.uuid];
            node.setPosition(node.position.x, calculateNewY(originalY, offset));
        });
    }

    /**
     * Event handler for remote repositioning requests.
     */
    private onSetGameCoreNodeReposition(obj: GTCommEventMap[Comm.SET_GAMECORENODE_REPOSITION]): void {
        if (CommTool.checkNeedRefixNode() && CommTool.canAutoFix()) {
            const fixH = CommTool.getFixY();
            const offset = fixH / 2;

            try {
                if (obj.upperNode) {
                    this._applyReposition(obj.upperNode, (origY, o) => origY - o, offset);
                }
                if (obj.downNode) {
                    this._applyReposition(obj.downNode, (origY, o) => origY + o, offset);
                }
                if (obj.callback) obj.callback(true, null as any);
            } catch (err) {
                error('GTNodeRematchPhoneManager: Error during remote repositioning.', err);
                if (obj.callback) obj.callback(false, err as any);
            }
        } else {
            // If no fix is needed, still need to signal success.
            if (obj.callback) obj.callback(true, null as any);
        }
    }
}

