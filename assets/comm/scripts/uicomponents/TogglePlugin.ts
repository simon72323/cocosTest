import { _decorator, Toggle, SpriteFrame, Component, EventHandler, Sprite } from 'cc';
const { ccclass, property } = _decorator;

const ClassName: string = 'TogglePlugin';

@ccclass(ClassName)
export class TogglePlugin extends Component {

    @property(Toggle)
    toggleButton: Toggle = null!;

    protected _normalSprite: SpriteFrame = null!;
    protected _pressedSprite: SpriteFrame = null!;
    protected _hoverSprite: SpriteFrame = null!;
    protected _disabledSprite: SpriteFrame = null!;

    @property(SpriteFrame)
    get normalSprite(): SpriteFrame { return this.toggleButton?.normalSprite!; }

    set normalSprite(value: SpriteFrame) {
        if (this.toggleButton) this.toggleButton.normalSprite = value;
    }

    @property(SpriteFrame)
    get pressedSprite(): SpriteFrame { return this.toggleButton?.pressedSprite!; }

    set pressedSprite(value: SpriteFrame) {
        if (this.toggleButton) this.toggleButton.pressedSprite = value;
    }

    @property(SpriteFrame)
    get hoverSprite(): SpriteFrame { return this.toggleButton?.hoverSprite!; }

    set hoverSprite(value: SpriteFrame) {
        if (this.toggleButton) this.toggleButton.hoverSprite = value;
    }

    @property(SpriteFrame)
    get disabledSprite(): SpriteFrame { return this.toggleButton?.disabledSprite!; }

    set disabledSprite(value: SpriteFrame) {
        if (this.toggleButton) this.toggleButton.disabledSprite = value;
    }

    @property(SpriteFrame)
    protected checkedNormalSprite: SpriteFrame = null!;

    @property(SpriteFrame)
    protected checkedPressedSprite: SpriteFrame = null!;

    @property(SpriteFrame)
    protected checkedHoverSprite: SpriteFrame = null!;

    @property(SpriteFrame)
    protected checkedDisabledSprite: SpriteFrame = null!;

    public set checked(bool: boolean) {
        this.toggleButton.isChecked = bool;
    }

    public get checked(): boolean {
        return this.toggleButton.isChecked;
    }

    onLoad() {
        if (!this._normalSprite) {
            this.setup();
        }
        const toggle = this.node.getComponent(Toggle)!;
        const checkEventHandler = new EventHandler();
        // This Node is the node to which your event processing code component belongs
        checkEventHandler.target = this.node;
        // This is the script class name
        checkEventHandler.component = ClassName;
        checkEventHandler.handler = 'onCheckedToggle';
        checkEventHandler.customEventData = 'checked';

        toggle.checkEvents.push(checkEventHandler);
    }

    setup() {
        const toggle = this.node.getComponent(Toggle)!;
        this.toggleButton = toggle;
        this._normalSprite = toggle.normalSprite!;
        this._pressedSprite = toggle.pressedSprite!;
        this._hoverSprite = toggle.hoverSprite!;
        this._disabledSprite = toggle.disabledSprite!;
    }

    onCheckedToggle(event: Toggle) {
        if (!this._normalSprite) {
            this.setup();
        }

        const {
            // toggleButton,
            checkedNormalSprite, checkedHoverSprite, checkedDisabledSprite, checkedPressedSprite,
            _normalSprite, _hoverSprite, _disabledSprite, _pressedSprite
        } = this;

        if (event.isChecked) {
            event.target.getComponent(Sprite)!.spriteFrame = checkedNormalSprite;
            event.normalSprite = checkedNormalSprite;
            event.hoverSprite = checkedHoverSprite;
            event.disabledSprite = checkedDisabledSprite;
            event.pressedSprite = checkedPressedSprite;
        } else {
            event.target.getComponent(Sprite)!.spriteFrame = _normalSprite;
            event.normalSprite = _normalSprite;
            event.hoverSprite = _hoverSprite;
            event.disabledSprite = _disabledSprite;
            event.pressedSprite = _pressedSprite;
        }
    }
}