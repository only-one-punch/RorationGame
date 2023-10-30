import { _decorator, Camera, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import { EnemyNode } from './EnemyNode';

@ccclass('Game')
export class Game extends Component {
    @property(Camera)
    mainCamera: Camera;

    @property(Node)
    player:Node;

    @property(Node)
    UI_Panel:Node;
    start() {
        console.log(this.player.worldPosition)
    }

    update(deltaTime: number) {
        //相机跟随
        this.mainCamera.node.setWorldPosition(this.player.worldPosition);
        //遥感UI跟随
        this.UI_Panel.setWorldPosition(this.player.worldPosition);
    }

    //创造敌人群

}


