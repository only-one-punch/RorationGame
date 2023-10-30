import { _decorator, Component, find, instantiate, math, Node, Prefab, RigidBody, RigidBody2D, v3, Vec3 } from 'cc';
import { SCREEN_HALF_HEIGHT, SCREEN_HALF_WIDTH } from './Background';
import { GameSetting, GreenGhostSettings } from './GameSetting';
import { EnemyNode } from './EnemyNode';
const { ccclass, property } = _decorator;

@ccclass('EnemySetting')
export class EnemySetting extends Component {
    public gameSetting:GameSetting = new GameSetting();
    public _name:string = "";
    public moveType:string = ""; //quick //small // middle
    public health:number = 0;
    public damage:number = 0;
    public speed:number = 0;
    public lifetime:number = 0;
    public xpReward:number = 0;
    public goldReward:number = 0;
    public healthPotionRewardChance:number = 0;
    public magnetRewardChance:number = 0;
    public chestRewardChance:number = 0;
    public enemies:Prefab [] = [];
    public playerWorldPosition:Vec3;
    public player:Node;
    public id:number = null;

    public greenGhostStatic:GreenGhostSettings = null;
    public isAttack:boolean = false;
    init(name:string){
        const enemy = new this.gameSetting[name]();
        this._name = enemy.name;
        this.moveType = enemy.moveType;
    }
    start() {
        this.greenGhostStatic =  new( this.gameSetting.GreenGhost);
        console.log(this.greenGhostStatic.health);
        this.player = find("Game/Player");
        this.node.getScale(scaleTmp);
    }

    update(deltaTime: number) {
        this.getEnemyMovePos();
    }
    //AaaBbb
    
    //enmey的移动，通过设置角速度来控制
    
    getEnemyMovePos(){
        this.player.getWorldPosition(tmp);
        this.playerWorldPosition = tmp;
        const direction = this.playerWorldPosition.subtract(this.node.worldPosition).normalize();
        const scaleX =scaleTmp.x;
        if(direction.x > 0){           
            this.node.setScale(scaleX,scaleTmp.y,scaleTmp.z);
        }else{
            this.node.setScale(-scaleX,scaleTmp.y,scaleTmp.z);
        }
        //设置移动速度
        
    }
}
const tmp = v3();
const scaleTmp = v3();
const velocity_tmp = math.v2()


