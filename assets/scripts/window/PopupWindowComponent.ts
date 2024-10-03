import { _decorator, Component, Node, Label, Button, EventHandler, instantiate, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

export interface ButtonOption {
    label: string;
    callback: () => void;  // 使用箭头函数类型简化回调类型定义
}

@ccclass('PopupWindowComponent')
export class PopupWindowComponent extends Component {
    @property(Node)
    dialogNode: Node = null;

    @property(Label)
    titleLabel: Label = null;

    @property(Label)
    contentLabel: Label = null;

    @property(Node)
    buttonContainer: Node = null;

    @property(Button)
    buttonPrefab: Button = null;

    // private callbacks: Map<string, () => void> = new Map(); // 用于存储回调函数的映射
    private callbacks: { [key: string]: () => void } = {}; // 用于存储回调函数的映射

    async openPopup(title: string, content: string, buttons: ButtonOption[]) {
        this.node.active = true;
        await this.animateOpen();

        this.setupTitle(title);
        this.contentLabel.string = content;
        this.setupButtons(buttons);
    }

    setupTitle(title: string) {
        this.titleLabel.node.active = !!title;
        this.titleLabel.string = title || '';
    }

    setupButtons(buttons: ButtonOption[]) {
        this.buttonContainer.removeAllChildren();
        buttons.forEach((option, index) => {
            const buttonNode = instantiate(this.buttonPrefab.node);
            const button = buttonNode.getComponent(Button);
            const label = buttonNode.getComponentInChildren(Label);
            label.string = option.label;
            buttonNode.parent = this.buttonContainer;
            buttonNode.active = true;

            const key = `button_${index}`;
            // this.callbacks.set(key, option.callback);
            this.callbacks[key] = option.callback;

            let clickEventHandler = new EventHandler();
            clickEventHandler.target = this.node;
            clickEventHandler.component = 'PopupWindowComponent';
            clickEventHandler.handler = 'buttonClicked';
            clickEventHandler.customEventData = key;

            button.clickEvents.push(clickEventHandler);
        });
    }

    async buttonClicked(event, customEventData: string, ...args): Promise<void> {
        await this.animateClose();
        // const callback = this.callbacks.get(customEventData);// Map似乎沒辦法正確傳到 buttonClicked 裡面，所以改用 object 來存取
        const callback = this.callbacks[customEventData];
        callback?.();
    }

    async animateOpen(): Promise<void> {
        return new Promise(resolve => {
            this.dialogNode.scale = new Vec3(0, 0, 0);
            tween(this.dialogNode)
                .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'cubicInOut' })
                .call(() => resolve())
                .start();
        });
    }

    async animateClose(): Promise<void> {
        this.reset();
        return new Promise(resolve => {
            tween(this.dialogNode)
                .to(0.3, { scale: new Vec3(0, 0, 0) }, { easing: 'cubicInOut' })
                .call(() => {
                    resolve();
                    this.node.active = false;
                })
                .start();
        });
    }

    reset(): void {
        this.setupTitle('');
        this.contentLabel.string = '';
        // this.callbacks.clear();
        this.buttonContainer.removeAllChildren();
    }
}
