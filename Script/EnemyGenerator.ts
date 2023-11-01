import { _decorator, Component, find, instantiate, Node, Prefab, Script, TypeScript, v3 } from 'cc';
import { EnemySetting } from './EnemySetting';
import { EnemySettings, GameSetting } from './GameSetting';
import { Game } from './Game';
import { Vector2 } from './RVO/Common';
import { Simulator } from './RVO/Simulator';
import { NewRVOTest } from './NewRVOTest';
const { ccclass, property } = _decorator;

@ccclass('enemyBuilder')
export class enemyBuilder extends Component {
    @property(Prefab)
    public enemies: Prefab[] = [];
    
    @property(Script)
    gameTS:Script;


    gameSetting: GameSetting = null;
    player:Node = null;
    private _RadiusOfEnemy:number = 300 * Math.random() + 300;
    gameTime:number = null;
    enemyNumber:number = 0;
    enemyTree:Node = null;
    start() {
        this.gameSetting = new GameSetting();
        this.player = find("Game/Player");
        this.enemyTree = find("Game/EnemyTree"); 
    }
    tem = 0;
    create = 1;
    update(deltaTime: number) {
        this.gameTime += deltaTime; //因为game Time是同步的，这里就不浪费算力去查找了。
        this.tem +=deltaTime;
        if(this.tem > this.create){
            this.calculateEnemyNumber(this.gameTime);
            this.tem = 0 ;
        }
    }

    //随机生成
    randomEnemyKind(){
        const enmeyIndex = Math.floor(Math.random()*this.enemies.length); 
        const enemyPrefab = this.enemies[enmeyIndex];
        const curEnmeyName = enemyPrefab.name;
        const enemyNode = instantiate(enemyPrefab);
        enemyNode.addComponent(EnemySetting);
        enemyNode.getComponent(EnemySetting).init(curEnmeyName);
        const p = this.randomPosition(this.player.position);
        enemyNode.setWorldPosition(p);
        enemyNode.parent = this.enemyTree;
        return enemyNode;
    }
    randomPosition(initPos){
        const randomAngle = Math.random() * 360;
        const radians = (randomAngle * Math.PI) / 180;
        const r = this._RadiusOfEnemy;
        // 生成随机位置，以玩家为圆心，半径为 r
        const x = initPos.x + r * Math.cos(radians);
        const y = initPos.y + r * Math.sin(radians);
        let p = v3(x,y,0);
        return p;
    }
    /**
     * 生成敌人的规律
     * 5s生成一小波敌人，20s生成一波一大波敌人
     * 敌人数量可以通过生成的时间来控制
     * 小波敌人大概是 20 ，大波敌人 100；
     * 
     */
    calculateEnemyNumber(gameTime) {
        let a = 2;
        let smallWaveInterval = 5; // 5秒生成一小波敌人
        let largeWaveInterval = 20; // 20秒生成一大波敌人
        const timeElapsed = Math.ceil(gameTime);
        if (timeElapsed % largeWaveInterval === 0) {
            // 在大波敌人生成的时刻，生成大波敌人（例如100个）
            this.enemyNumber = 10;
            this.generateEnemies();
        } else if (timeElapsed % smallWaveInterval === 0) {
            // 在小波敌人生成的时刻，生成小波敌人（例如20个）
            this.enemyNumber = 5;
            this.generateEnemies();
        } else if(timeElapsed % a === 0){
            // 如果不是生成敌人的时刻，返回0表示不生成敌人
            this.enemyNumber = 3;
            this.generateEnemies();
        }
    }
    //同步到rvo上
    generateEnemies(){
        for(let i = 0 ; i < this.enemyNumber ; i++){
          const enemyNode = this.randomEnemyKind();
          let p = new Vector2(enemyNode.worldPosition.x,enemyNode.worldPosition.y);
          let id = Simulator.instance.addAgent(p);
          enemyNode.getComponent(EnemySetting).id = id;
          Simulator.instance.setAgentMass(id,1);
          const goals = find("Game/RVO_Test").getComponent(NewRVOTest).goals;
          goals.push(v3(p.x,p.y,id));
        }
    }
}

