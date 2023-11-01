import { _decorator, Component, instantiate, Node, Prefab, v2, v3, Vec2, Vec3 } from 'cc';
import { Simulator } from './RVO/Simulator';
import { RVOMath, Vector2 } from './RVO/Common';
import { EnemySetting } from './EnemySetting';
import { Collisiion } from './Collision';
const { ccclass, property } = _decorator;

@ccclass('NewRVOTest')
export class NewRVOTest extends Component {
    @property(Prefab)
    enemy: Prefab;

    @property(Node)
    enemyTree: Node;

    @property(Node)
    player: Node;

    speed = 30;
    enemyNumber: number = 3;
    goals: Vec3[] = [];
    myEnemy: Node[] = [];

    start() {
        let simulator = Simulator.instance; 
        simulator.setAgentDefaults(50, 8, 1, 1, 20, this.speed, new Vector2(0, 0));
        let playerWP = v3();
        this.player.getWorldPosition(playerWP);
        this.enemyGenerator(playerWP, this.enemy, 1);
    }
    enemyGenerator(initPos, enemyPrefab: Prefab, mass: number) {
        //需要关联rvo的ID
        for (let i = 0; i < this.enemyNumber; i++) {
            const r = 300 * Math.random() + 300; // 圆的半径，适当调整这个值
            const randomAngle = Math.random() * 360;
            const radians = (randomAngle * Math.PI) / 180;
            // 生成随机位置，以玩家为圆心，半径为 r
            const x = initPos.x + r * Math.cos(radians);
            const y = initPos.y + r * Math.sin(radians);
            let p = new Vector2(x, y);
            //同步当前的位置和ID
            let id = Simulator.instance.addAgent(p);
            Simulator.instance.setAgentMass(id, 1);
            this.goals.push(v3(p.x, p.y, id));
            const enemy = instantiate(enemyPrefab);
            //将 rvo 的ID 同步给 节点；
            enemy.getComponent(EnemySetting).id = id;
            enemy.setWorldPosition(p.x, p.y, 0);
            this.enemyTree.addChild(enemy);
        }
    }
    setPreferredVelocities() {
        const agentCnt = Simulator.instance.getNumAgents();
        const enmeyCnt = this.enemyTree.children.length;
        for (let i = 0; i < enmeyCnt; i++) {
            const id = this.enemyTree.children[i].getComponent(EnemySetting).id;
            if (Simulator.instance.hasAgent(id)) {
                const a = Simulator.instance.getAgentPosition(id); // 通过ID获取方法
                if (a) {
                    //要查找到相同的ID的goal才能相减，所以还需要给goal一个ID。
                    const goalArray = this.goals[i];
                    if(!goalArray) return;
                    const goal = new Vector2(goalArray.x, goalArray.y);
                    let goalVector = goal.minus(a);//相减；
                    if (RVOMath.absSq(goalVector) > 1.0) {
                        goalVector = RVOMath.normalize(goalVector).scale(this.speed);
                    }
                    if (RVOMath.absSq(goalVector) < RVOMath.RVO_EPSILON) {
                        // Agent is within one radius of its goal, set preferred velocity to zero
                        Simulator.instance.setAgentPrefVelocity(id, new Vector2(0.0, 0.0));
                    }
                    else {
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
    //更新每个敌人的坐标；
    enmeyMove(target: Node) {
        const targetPos = v3();
        target.getWorldPosition(targetPos);
        for (let i = 0; i < this.goals.length; i++) {
            const p = this.goals[i];
            p.x = targetPos.x;
            p.y = targetPos.y;
        }
    }
    update(deltaTime: number) {
        this.enmeyMove(this.player);
        //每帧更新线速度，计算得出未来agent的坐标；
        this.setPreferredVelocities();
        Simulator.instance.run(deltaTime);
        // 更新渲染坐标
        for (let i = 0; i < this.enemyTree.children.length; i++) {
            //获取children的ID
            const id = this.enemyTree.children[i].getComponent(EnemySetting).id;
            //Rvo是没有接口可以直接操作当前角色的速度的。
            if (Simulator.instance.hasAgent(id)) {
                if (this.enemyTree.children[i].getComponent(EnemySetting).isAttack) {
                    //敌人死亡必须清理它的ID
                    Simulator.instance.removeAgent(id);
                    const goalIndex = this.goals.findIndex((item) => { item.z == id });
                    this.goals.splice(goalIndex, 1);
                } else {
                    let p = Simulator.instance.getAgentPosition(id);
                    //设置children[i]的position;
                    this.enemyTree.children[i].setWorldPosition(p.x, p.y, 0);
                }
            }
        }
    }
}

