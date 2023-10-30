import { _decorator, Animation, animation, AnimationClip, Component, Event, Node, UITransform, v2, v3, Vec2 } from 'cc';
const { ccclass, property } = _decorator;
import { RVO_test } from './RVO_test';
import { EnemySetting } from './EnemySetting';

//一些常量
const SCREEN_HEIGHT:number = 510;
const SCREEN_WIDTH:number = 680;
const SCREEN_HALF_HEIGHT:number = 255;
const SCREEN_HALF_WIDTH:number = 340;
const GRIDSIZE:number = 100;
const PLAYERRADIUS:number = 100;
const ENMEYRADIUS:number = 50;
@ccclass('Collisiion')
export class Collisiion extends Component {
    @property(Node)
    creame:Node;

    @property(Node)
    enemyTree:Node;

    @property(Node)
    player:Node;

    public enemies :Node[] = [];
    public gridSizeOfX = Math.ceil(SCREEN_WIDTH / GRIDSIZE);
    public gridSizeOfY = Math.ceil(SCREEN_HEIGHT / GRIDSIZE);
    public logicArray = new Array(this.gridSizeOfX * this.gridSizeOfY).fill(0);
    // public myEnemy:Node[] = RVO_test
    start() {
        console.log(this.calculateTargetLattice(this.creame));
        this.enemies = this.enemyTree.children;
    }

    update(deltaTime: number) {
        this.allTargetLattic();
    }
    //我觉得这个格子不是实际存在的，它只是一种计算方法
    createGrid(){
        const centerPoint = v2();
        const creamePosition = v3();
        this.creame.getWorldPosition(creamePosition);
        centerPoint.x = creamePosition.x;
        centerPoint.y = creamePosition.y;
        const startPoint = v2(centerPoint.x - SCREEN_HALF_WIDTH,centerPoint.y - SCREEN_HALF_HEIGHT);
        const gridLength = centerPoint.x + SCREEN_WIDTH;
        const gridWidth = centerPoint.y + SCREEN_HEIGHT;
        const gridSizeOfX = SCREEN_WIDTH / GRIDSIZE;
        const gridSizeOfY = SCREEN_HEIGHT / GRIDSIZE;
        //第一个格子需要减去偏移量。 （centerPoint.x - 1/2 screenwidth,centerPoint.y -  1/2 screenHeight);
        /**
         * eg:(50,0);位于那个格子 50/40 = 1.25 =》 2；0/40 = 0 向下取整 1  （1，0）
         * 对应的格子下标应该是 1 * gridSizeOFX + 0 * girdSizeOfY;
         */
    }
    //计算当前目标所在的格子；
    calculateTargetLattice(target:Node){
        const centerPoint = v2();
        const creamePosition = v3();
        this.creame.getWorldPosition(creamePosition);
        centerPoint.x = creamePosition.x;
        centerPoint.y = creamePosition.y;
        const startPoint = v2(centerPoint.x - SCREEN_HALF_WIDTH,centerPoint.y - SCREEN_HALF_HEIGHT);
        const gridSizeOfX = SCREEN_WIDTH / GRIDSIZE;
        const gridSizeOfY = SCREEN_HEIGHT / GRIDSIZE;

        const targetPosition = v3();
        target.getWorldPosition(targetPosition);
        const indexOfGrid = v2();
        indexOfGrid.x = Math.floor((targetPosition.x - startPoint.x)/GRIDSIZE);
        indexOfGrid.y = Math.floor((targetPosition.y - startPoint.y)/GRIDSIZE);
        let indexOfLogicArray:number = null;
        indexOfLogicArray = indexOfGrid.x * gridSizeOfX + indexOfGrid.y * gridSizeOfY;
        // this.logicArray[indexOfLogicArray] = 1;
        return indexOfLogicArray
        //修改它的逻辑状态
    }
    //得到和武器处于同一格子的所有的敌人；
    public needToHandleCollision:Node [] = [];
    allTargetLattic(){
        const weaponIndex = this.calculateTargetLattice(this.player);
        for(let i = 0 ; i < this.enemies.length ; i ++){
            const result = this.calculateTargetLattice(this.enemies[i]);
            if(weaponIndex === result){
                this.needToHandleCollision.push(this.enemies[i]);
            }else{

            }
        };
        this.detectObjectInGrid();
    }
    //检测格子中的对象
    detectObjectInGrid(){
        for(let i = 0 ; i < this.needToHandleCollision.length ; i ++){
            this.collisionOf_01(this.needToHandleCollision[i],this.player);
        }
    }
    //几种碰撞
    /**
     * 矩形与矩形：｜x1-x2| < (w1 + w1) / 2 && |y1 -y2| < (h1 + h2) /2;
     * 圆与圆：(x1-x2)^2 + (y1-y2)^2 < (r1 + r2) ^ 2;
     * 矩形与圆：|x1 - x2| < r1 + 1/2 * W && |y1 - y2| < r1 + 1/2 * H;
     */
    collisionOf_01(target01:Node,target02:Node){
        const positionOf01 = v3();
        target01.getWorldPosition(positionOf01);
        const positionOf02 = v3();
        target02.getWorldPosition(positionOf02);
        const contentSizeOf01 = target01.children[0].getComponent(UITransform).contentSize;
        const contentSizeOf02 = target02.children[0].getComponent(UITransform).contentSize;
        const minDistanceOfX = Math.abs(positionOf01.x - positionOf02.x) - (contentSizeOf01.x + contentSizeOf02.x)/2;
        const minDistanceOfY = Math.abs(positionOf01.y - positionOf02.y) - (contentSizeOf01.y + contentSizeOf02.y)/2;
        if(minDistanceOfX < 0 && minDistanceOfY < 0){
            //碰撞处理
            this.collisionHanding(target01);
            target01.getComponent(EnemySetting).isAttack = true;

        }else{
            const index = this.needToHandleCollision.indexOf(target01);
            if(index !== -1){
                this.needToHandleCollision.splice(index,1);
                this.scheduleOnce(()=>{target01.getComponent(EnemySetting).isAttack = false;},1);
                
            }
        }
    }
    //碰撞处理
    //因为rvo需要每帧设置物体的位置，所以我需要给它一个单独的属性。
    //所以敌人需要有一个属于自己的信息才能共享。
    collisionHanding(target:Node){
        // target.setWorldPosition(0,0,0);
        //播放死亡动画
        const a =  target.getComponent(Animation);
        a.play("Dying");
        this.scheduleOnce(()=>{
            target.removeFromParent();
        },1);
    }
}

