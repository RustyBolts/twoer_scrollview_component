import { _decorator, Component, instantiate, Event, ScrollView, Button } from 'cc';
import { TowerData } from '../database/TowerData';
import { TowerDungeonEvent, TowerFloor } from './TowerFloor';
import { PopupWindowComponent } from '../window/PopupWindowComponent';
import { StorageTool } from '../saveSysem/StorageTool';
const { ccclass, property } = _decorator;


@ccclass('Tower')
export class Tower extends Component {

    @property(ScrollView)
    private scrollView: ScrollView = null;

    @property(PopupWindowComponent)
    popupWindow: PopupWindowComponent = null;

    @property(Button)
    leaveButton: Button = null;

    private _towerId: string = '';
    private _towerData: TowerData = null;
    private _floorCount: number = 0;
    private _floorIndex: number = 0;
    private _stage: { [key: string]: string }[] = [];

    protected onLoad(): void {
        this.node.on(TowerDungeonEvent.CLEAR_TOWER_FLOOR, this.onClearTowerFloor, this);

        this.leaveButton.node.active = false;
    }

    protected onDestroy(): void {
        this.node.off(TowerDungeonEvent.CLEAR_TOWER_FLOOR, this.onClearTowerFloor, this);
    }

    tryReadChallengeTower(): boolean {
        const data = StorageTool.loadFromFile('challenge_tower_data');
        if (data) {
            this.build(data.towerId);
            this.show();
            return true;
        }

        return false;
    }

    build(towerId: string): void {
        this._towerId = towerId;
        const data = StorageTool.loadFromFile(`${this._towerId}_tower_data`);
        console.log(data);
        if (data) {
            this._floorIndex = data.index;
            this.setFakeTowerData(towerId);
        } else {
            this.setFakeTowerData(towerId);
            this._floorIndex = 0;
            this._stage.length = 0;
        }

        // 正在挑戰的塔
        StorageTool.saveToFile('challenge_tower_data', {
            towerId: this._towerId,
        });
    }

    show(active: boolean = true): void {
        this.node.active = active;

        if (active) {
            this.buildTower();
        } else {
            const children = this.scrollView.content.children;
            children.forEach((child) => child.off('click'));
            this._floorIndex = 0;
            this._stage.length = 0;
        }
    }

    private buildTower(): void {
        const children = this.scrollView.content.children;
        children.forEach((child) => child.active = false);

        const prefab = instantiate(children[0]);
        const index = this._floorIndex;
        this.leaveButton.node.active = index === this._floorCount;
        console.log(`Building tower floor ${index} / ${this._floorCount}`);

        this._stage = [];
        for (let i = 0; i < this._floorCount; i++) {
            const stageContents: { [key: string]: string }[] = [];

            const enemyTeam = this._towerData.enemyTeams[i];
            const dungeonEvent = this._towerData.events[i];
            const dungeonChest = this._towerData.chests[i];
            enemyTeam && stageContents.push({ type: 'enemyTeam', id: enemyTeam });
            dungeonEvent && stageContents.push({ type: 'dungeonEvent', id: dungeonEvent });
            dungeonChest && stageContents.push({ type: 'dungeonChest', id: dungeonChest });

            const floorContent = stageContents.sort(() => Math.random() - 0.5).shift();
            this._stage.push(floorContent);

            let floorNode = children[i];
            if (!floorNode) {
                floorNode = instantiate(prefab);
                floorNode.parent = this.scrollView.content;
            }
            floorNode.active = true;

            const isReady = i >= index;
            const floor = floorNode.getComponent(TowerFloor);
            floor.refresh(floorContent.type, floorContent.id, isReady);
            floor.block(index !== i);

            floorNode.off('click');
            if (isReady) {
                floorNode.on('click', () => {
                    console.log(`Clicked on ${floorContent.id}`);
                    floor.enter();
                });
                floorNode.getComponent(Button).enabled = true;
            }
        }

        prefab.destroy();

        // console.log(this._stage);
        this.scrollView.scrollToPercentVertical(index / this._floorCount, 0.25);
    }

    saveData(): void {
        // console.log('hero saving data');
        StorageTool.saveToFile(`${this._towerId}_tower_data`, {
            index: this._floorIndex,
        });
    }

    delData(towerId?: string): void {
        if (towerId)
            StorageTool.deleteFile(`${towerId}_tower_data`);
        else
            StorageTool.deleteFile(`${this._towerId}_tower_data`);
    }

    onClearTowerFloor(event: TowerDungeonEvent): void {
        if (this._floorIndex >= this._floorCount) {
            console.log('Tower floor is already cleared');
            return;
        }

        if (!event.detail.challenged) {
            this._floorIndex = 0;
            this.saveData();

            this.node.active = false;
            this.popupWindow.openPopup('挑戰失敗', '你已經失敗，再接再厲吧！', [{
                label: '再次挑戰', callback: () => {
                    this.show();
                }
            }, {
                label: '放棄離開', callback: () => {
                    this.node.active = false;
                    StorageTool.deleteFile('challenge_tower_data');
                }
            }]);
            return;
        }

        const children = this.scrollView.content.children;
        children.forEach((child) => child.off('click'));
        children[this._floorIndex].getComponent(Button).enabled = false;

        this._floorIndex++;
        this.saveData();

        if (this._floorIndex < this._floorCount) {
            this.buildTower();
        } else {
            this.popupWindow.openPopup('挑戰成功', '完成探索，獲得獎勵', [{
                label: '領取獎勵', callback: () => {
                    this.node.active = false;
                    StorageTool.deleteFile('challenge_tower_data');
                }
            }]);
        }
    }

    onLeaveClicked(): void {
        this.node.active = false;
    }

    private setFakeTowerData(towerId: string): void {
        switch (towerId) {
            case 'tower_1':
                this._towerData = TowerData.fromCSV({
                    id: 'tower_1',
                    name: 'Fake Tower',
                    reward: 'money x100',
                    challengeRank: '1',
                    enemyTeams: ['enemyTeam_1', 'enemyTeam_2', 'enemyTeam_3', '', 'enemyTeam_5'],
                    events: ['', '', '', 'event_4', ''],
                    chests: ['', '', 'chest_3', '', '']
                });
                break;
            case 'tower_2':
                this._towerData = TowerData.fromCSV({
                    id: 'tower_2',
                    name: 'Fake Tower 2',
                    reward: 'money x100',
                    challengeRank: '1',
                    enemyTeams: ['2enemyTeam_1', '2enemyTeam_2', '2enemyTeam_3', '', '2enemyTeam_5'],
                    events: ['', '', '', '2event_4', ''],
                    chests: ['', '', '2chest_3', '', '']
                });
                break;
            default:
                this._floorCount = 0;
                return;
        }

        this._floorCount = this._towerData.enemyTeams.length;
    }
}