import { _decorator, BoxCollider2D, Component, find, instantiate, Node, Prefab, RigidBody, RigidBody2D, v2, v3, Vec3 } from 'cc';
import {GameSetting,PlayerSetting} from "./GameSetting"
import { Background, SCREEN_HALF_HEIGHT, SCREEN_HALF_WIDTH } from './Background';
import { EnemySetting } from './EnemySetting';
const { ccclass, property } = _decorator;

@ccclass('EnemyNode')
export class EnemyNode extends Component {
    @property(Prefab) public enemies: Prefab[] = [];
    public gameSetting:GameSetting = new GameSetting();
    public playerWorldPosition:Vec3;

    start() {
        console.log();
        this.playerWorldPosition = find("Game/Player").getPosition(this.playerWorldPosition);//其实这里使获取到的是Player的worldPosition
        this.createEnemy('BlackGhost');
        // for(let i = 0 ; i < 100 ; i ++ ){
        //     this.createEnemy("BlackGhost");
        // }
    }
    createEnemy(name:string){
        // 找到对应名字的 prefab
        const enemyPrefab:Prefab = this.enemies.find((item)=>{
            return item.name == name;
        })
        //实例化对应的的 prefab
        const enemyNode = instantiate(enemyPrefab);
        enemyNode.setWorldPosition(this.getWorldPosition());
        this.node.addChild(enemyNode);
        enemyNode.addComponent(EnemySetting);
        enemyNode.addComponent(RigidBody2D);
        enemyNode.getComponent(RigidBody2D).gravityScale = 0;
        
    }
    //在距离玩家屏幕之外创建
    getWorldPosition(){
        const r = 200 * Math.random() + 300 ; // 圆的半径，适当调整这个值
        const randomAngle = Math.random() * 360;
        const radians = (randomAngle * Math.PI) / 180;
        // 生成随机位置，以玩家为圆心，半径为 r
        const x = this.playerWorldPosition.x + r * Math.cos(radians);
        const y = this.playerWorldPosition.y + r * Math.sin(radians);
        return v3(x, y);
    }
   
}
