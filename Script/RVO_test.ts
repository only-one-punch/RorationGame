import { _decorator, Component, Node, v3, Vec3, instantiate, geometry, Prefab, v2 } from 'cc';
const { Ray } = geometry;
import { Simulator } from './RVO/Simulator';
import { RVOMath, Vector2 } from './RVO/Common';
import { EnemySetting } from './EnemySetting';
const { ccclass, property } = _decorator;

@ccclass('RVO_test')
export class RVO_test extends Component {
    @property(Prefab)
    enemy: Prefab;

    @property(Node)
    enemyTree: Node;

    @property(Node)
    player: Node;

    speed = 30;
    enemyNumber: number = 100;
    goals: Vec3[] = [];
    myEnemy: Node[] = [];
    start() {
        let simulator = Simulator.instance;
        //初始化rvo;
        simulator.setAgentDefaults(50, 8, 1, 1, 20, this.speed, new Vector2(0, 0));
        let playerWP = v3();
        this.player.getWorldPosition(playerWP);
        this.enemyGenerator(playerWP, this.enemy, 1);
    }

    enemyGenerator(initPos: Vec3, prefab: Prefab, mass: number) {
        let simulator = Simulator.instance;
        for (let i = 0; i < this.enemyNumber; i++) {
            const r = 300 * Math.random() + 300; // 圆的半径，适当调整这个值
            const randomAngle = Math.random() * 360;
            const radians = (randomAngle * Math.PI) / 180;
            // 生成随机位置，以玩家为圆心，半径为 r
            const x = initPos.x + r * Math.cos(radians);
            const y = initPos.y + r * Math.sin(radians);
            let p = new Vector2(x, y);
            //这里可以认为序号和idx是同步的
            let idx = simulator.addAgent(p);
            simulator.setAgentMass(idx, mass);
            const info = v3(p.x, p.y, idx);
            this.goals.push(info);
            const enemy = instantiate(prefab);
            //将rvo ID添加给 enemy对象。
            enemy.getComponent(EnemySetting).id = idx;
            this.myEnemy.push(enemy);
            enemy.setWorldPosition(p.x, p.y, 0);
            enemy.parent = this.enemyTree;
        }
    }
    setPreferredVelocities() {
        //获取当前的障碍物ID的数量；
        let agentCnt = Simulator.instance.getNumAgents();
        for (let i = 0; i < this.goals.length; i++) {
            //通过循环当前的目标数量，来获取地方当前的ID
            const id = this.goals[i].z; 
            //如果agent存在
            if (Simulator.instance.hasAgent(id)) {
                // 获取到当前的位置
                const a = Simulator.instance.getAgentPosition(id);
                if (a) {
                        //获取当前的障碍物的goal
                        let goal = new Vector2(this.goals[i].x, this.goals[i].y);
                        let goalVector = goal.minus(a);//相减；
                        if (RVOMath.absSq(goalVector) > 1.0) {
                            //获取物体运动的方向
                            goalVector = RVOMath.normalize(goalVector).scale(this.speed);
                        }
                        if (RVOMath.absSq(goalVector) < RVOMath.RVO_EPSILON) {
                            // Agent is within one radius of its goal, set preferred velocity to zero
                            Simulator.instance.setAgentPrefVelocity(id, new Vector2(0.0, 0.0));
                        }
                        else {
                            //这个i 是当前存在的agent的ID
                            Simulator.instance.setAgentPrefVelocity(id, goalVector);
                            let angle = Math.random() * 2.0 * Math.PI;
                            let dist = Math.random() * 0.0001;
                            Simulator.instance.setAgentPrefVelocity(id,
                                Simulator.instance.getAgentPrefVelocity(id).plus(new Vector2(Math.cos(angle), Math.sin(angle)).scale(dist)));
                        }
                }
            }

        }
    }
    enmeyMove(target: Node) {
        const targetPos = v3();
        target.getWorldPosition(targetPos);
        // console.log(this.enemyTree.children.length);
        for (let i = 0; i < this.enemyTree.children.length; i++) {
            let p = this.goals[i];
            if (p) {
                p.x = targetPos.x;
                p.y = targetPos.y;
            }

        }
    }
    update(dt: number) {
        //更新敌人的目标坐标
        this.enmeyMove(this.player);
         // 更新逻辑坐标
         this.setPreferredVelocities();
         Simulator.instance.run(dt);
        // 更新渲染坐标
        for (let i = 0; i <this.goals.length; i++) {
            //正确的ID(绑定在了goal上)
            const id = this.goals[i].z;
            //判断当前的ID是那个node的。
            const enemy = this.myEnemy.find((item)=>{
                return item.getComponent(EnemySetting).id === id;
            });
            if(enemy){
                if(this.myEnemy[i].getComponent(EnemySetting).isAttack){
                    Simulator.instance.removeAgent(id);//移除当前的对象；
                    this.goals.splice(i,1);
                }else{
                    let p = Simulator.instance.getAgentPosition(id);
                    this.myEnemy[i].setWorldPosition(p.x,p.y,0);
                }
            }
           
            //Rvo是没有接口可以直接操作当前角色的速度的。
            if (this.myEnemy[i].getComponent(EnemySetting).isAttack) {
                if (Simulator.instance.hasAgent(id)) {
                    //敌人死亡必须清理它的ID = 它的序号；
                    const idx = this.myEnemy[i].getComponent(EnemySetting).id;
                    Simulator.instance.removeAgent(idx);
                    const index = this.goals.findIndex((item, index) => {
                        if (item.z === idx) {
                            return index;
                        }
                    });
                    this.goals.splice(index, 1);
                }
            } else {
                if (Simulator.instance.hasAgent(i)) {
                    let p = Simulator.instance.getAgentPosition(i);
                    this.myEnemy[i].setWorldPosition(p.x, p.y, 0);
                }
            }
        }
       

    }

}


