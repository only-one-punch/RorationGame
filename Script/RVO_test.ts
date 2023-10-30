import { _decorator, Component, Node, v3, Vec3, instantiate, geometry, Prefab } from 'cc';
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

    speed = 50;
    enemyNumber: number = 1000;
    goals: Vector2[] = [];
    public myEnemy: Node[] = [];
    public
    start() {
        let simulator = Simulator.instance;

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
            let idx = simulator.addAgent(p);
            console.log(idx);
            simulator.setAgentMass(idx, mass);
            this.goals.push(p);
            const enemy = instantiate(prefab);
            //将rvo ID添加给 enemy对象。
            enemy.getComponent(EnemySetting).id = idx;
            this.myEnemy.push(enemy);
            enemy.setWorldPosition(p.x, p.y, 0);
            enemy.parent = this.enemyTree;
        }
    }
    setPreferredVelocities() {
        let agentCnt = Simulator.instance.getNumAgents();
        for (let i = 0; i < agentCnt; i++) {
            if (Simulator.instance.hasAgent(i)) {
                const a = Simulator.instance.getAgentPosition(i);
                if (a) {
                    if (this.goals[i]) {
                        let goalVector = this.goals[i].minus(a);//相减；
                        if (RVOMath.absSq(goalVector) > 1.0) {
                            goalVector = RVOMath.normalize(goalVector).scale(this.speed);
                        }
                        if (RVOMath.absSq(goalVector) < RVOMath.RVO_EPSILON) {
                            // Agent is within one radius of its goal, set preferred velocity to zero
                            Simulator.instance.setAgentPrefVelocity(i, new Vector2(0.0, 0.0));
                        }
                        else {
                            Simulator.instance.setAgentPrefVelocity(i, goalVector);
                            let angle = Math.random() * 2.0 * Math.PI;
                            let dist = Math.random() * 0.0001;
                            Simulator.instance.setAgentPrefVelocity(i,
                                Simulator.instance.getAgentPrefVelocity(i).plus(new Vector2(Math.cos(angle), Math.sin(angle)).scale(dist)));
                        }
                    }
                }
            }


        }
    }
    enmeyMove(target: Node) {
        const targetPos = v3();
        target.getWorldPosition(targetPos);
        let index = 0;
        for (let i = 0; i < this.myEnemy.length; i++) {
            let p = this.goals[index++];
            if (this.goals[index]) {
                p.x = targetPos.x;
                p.y = targetPos.y;
            }

        }
    }
    update(dt: number) {
        //应该这样更新坐标才对呀
        // 更新渲染坐标
        for (let i = 0; i < Simulator.instance.getNumAgents(); i++) {
            //Rvo是没有接口可以直接操作当前角色的速度的。
            if (this.myEnemy[i].getComponent(EnemySetting).isAttack) {
                //敌人死亡必须清理它的ID
                const idx = this.myEnemy[i].getComponent(EnemySetting).id;
                Simulator.instance.removeAgent(idx);
                this.goals.splice(idx, 1);
            } else {
                if (Simulator.instance.hasAgent(i)) {
                    let p = Simulator.instance.getAgentPosition(i);
                    this.myEnemy[i].setWorldPosition(p.x, p.y, 0);
                }
            }
        }
        // 更新逻辑坐标
        this.setPreferredVelocities();
        Simulator.instance.run(dt);
        //更新目标坐标
        this.enmeyMove(this.player);

    }

}


