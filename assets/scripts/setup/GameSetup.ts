import { _decorator, Component, Node } from 'cc';
import { Tower } from '../tower/Tower';
const { ccclass, property } = _decorator;

@ccclass('GameSetup')
export class GameSetup extends Component {

    @property(Tower)
    private tower: Tower = null;

    @property(Node)
    towerButton: Node = null;

    protected onLoad(): void {
        this.tower.show(false);
    }

    protected start(): void {
        this.tower.tryReadChallengeTower();
    }

    onTower1Clicked(): void {
        this.tower.build('tower_1');
        this.tower.show();
        // this.towerButton.active = false;
    }
    onTower2Clicked(): void {
        this.tower.build('tower_2');
        this.tower.show();
        // this.towerButton.active = false;
    }

    onResetTowerStageClicked(): void {
        this.tower.delData('tower_1');
        this.tower.delData('tower_2');
    }
}


