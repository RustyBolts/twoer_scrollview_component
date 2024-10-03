import { _decorator, Component, instantiate, Label, Node, Event, ScrollView, Sprite } from 'cc';
import { PopupWindowComponent } from '../window/PopupWindowComponent';
const { ccclass, property } = _decorator;

export class TowerDungeonEvent extends Event {
    static CLEAR_TOWER_FLOOR = 'clear_tower_floor';
    constructor(name: string, bubbles?: boolean, detail?: any) {
        super(name, bubbles);
        this.detail = detail;
    }
    public detail: any = null;  // Custom property
}
@ccclass('TowerFloor')
export class TowerFloor extends Component {

    @property(Label)
    titleLabel: Label = null;

    @property(Node)
    mistFront: Node = null;

    @property(Sprite)
    contentSprite: Sprite = null;

    @property(PopupWindowComponent)
    popupWindow: PopupWindowComponent = null;

    private _type: string = '';

    refresh(type: string, id: string, isReady: boolean): void {
        this._type = type;

        this.titleLabel.string = id;// todo 讀 enemyTeam、chest、event 等的資料來處理
        this.contentSprite.node.active = isReady;
    }

    enter(): void {
        switch (this._type) {
            case 'enemyTeam':
                // todo 進入樓層的替代，進入後看是戰鬥還是處理事件
                this.popupWindow.openPopup('樓層', '進入戰鬥', [{
                    label: '成功', callback: () => {
                        this.finish(true);
                    }
                }, {
                    label: '失敗', callback: () => {
                        this.finish(false);
                    }
                }]);
                break;
            case 'dungeonChest':
                this.popupWindow.openPopup('樓層', '發現寶箱', [{
                    label: '開啟寶箱', callback: () => {
                        this.finish(true);
                    }
                }]);
                break;
            case 'dungeonEvent':
                this.popupWindow.openPopup('樓層', '觸發事件', [{
                    label: '解決', callback: () => {
                        this.finish(true);
                    }
                }]);
                break;
            default:
                break;
        }
    }

    /** 未開放的樓層 */
    block(maskIt: boolean = true): void {
        this.mistFront.active = maskIt;
    }

    finish(success: boolean): void {
        // 內容物件要隱藏
        this.contentSprite.node.active = false;
        this.node.dispatchEvent(new TowerDungeonEvent(TowerDungeonEvent.CLEAR_TOWER_FLOOR, true, { challenged: success }));
    }
}