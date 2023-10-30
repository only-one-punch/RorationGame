import { _decorator, color, Color, Component, find, instantiate, Node, Prefab, Sprite, v2, v3, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InitMap')
export class InitMap extends Component {
    @property(Node)
    public Map: Node = null;

    @property(Prefab)
    public mapTile: Prefab = null;

    @property(Node)
    public target: Node = null;

    @property(Prefab)
    public enemy: Prefab = null;

    @property(Number)
    public line: number = 1000;

    @property(Number)
    public column: number = 1000;

    @property(Number)
    public tileSize: number = 20;

    @property(Node)
    public enmeies: Node = null;

    public mapOffsetX: number;
    public mapOffsetY: number;
    public mapTileArray: Node[] = [];
    public enmeyNumber: number = 25;
    public enmeyNodeArray: Node[] = []; 
    public logicArray = new Array(1000000).fill(0);
    public screenLength: number = 500;
    public moveTime: number = 1;
    public temTime: number = 0;
    public offsets = [
        v2(-1, 1), v2(0, 1), v2(1, 1),
        v2(-1, 0), v2(1, 0),
        v2(-1, -1), v2(0, -1), v2(1, -1)
    ];
    start() {
        this.mapOffsetX = 0.5 * this.line * this.tileSize;
        this.mapOffsetY = 0.5 * this.line * this.tileSize;
        this.InitMap();
        //初始化敌人；
        this.enemyGenerator(this.target);
        this.logicArray.forEach((item, index) => {
            if (item == 1) {
                this.turnMapRedColor(index);
            } else {
                this.turnMapGreenColor(index);
            }
        })
    }

    update(deltaTime: number) {
        this.temTime += deltaTime;
        if (this.temTime > this.moveTime) {
            this.temTime = 0;
            this.enmeyNodeArray.forEach((item, index) => {
                const direction = this.enemiesMoveDirection(item, this.target);
                if (direction) {
                    this.newEnemyMove(item, direction, deltaTime);
                }
            });
        }
    }
    InitMap() {
        for (let y = 0; y < this.column; y++) {
            for (let x = 0; x < this.line; x++) {
                const tile = instantiate(this.mapTile);
                const posX = x * this.tileSize - this.mapOffsetX;
                const posY = y * this.tileSize - this.mapOffsetY;
                tile.setPosition(posX, posY, 0);
                this.Map.addChild(tile);
                // tile.getComponent(Sprite).color = new Color(155,0,0)
                this.mapTileArray.push(tile);
            }
        }
    }
    enemyGenerator(target: Node) {
        for (let i = 0; i < this.enmeyNumber; i++) {
            const enemy = instantiate(this.enemy);
            //设置位置，获取目标位置，在[0-size,5 + (0,5)];
            const targetPosOfMap = v2();
            targetPosOfMap.x = Math.ceil((target.position.x + this.mapOffsetX) / this.tileSize);
            targetPosOfMap.y = Math.ceil((target.position.y + this.mapOffsetY) / this.tileSize);
            // console.log(targetPosOfMap);
            const getRandomPosOfEnmey = () => {
                let enmeyPosOfMap = v3();
                let positiveOrNegativeX = Math.random() < 0.5 ? 1 : -1;
                let positiveOrNegativeY = Math.random() < 0.5 ? 1 : -1;
                let maxTries = 10; // 设置一个最大尝试次数，以避免无限循环
                for (let tries = 0; tries < maxTries; tries ++) {
                    enmeyPosOfMap.x = targetPosOfMap.x + (Math.ceil(Math.random() * 20) + 1) * positiveOrNegativeX;
                    enmeyPosOfMap.y = targetPosOfMap.y + (Math.ceil(Math.random() * 20) + 1) * positiveOrNegativeY;
                    const enemyPosIndex = enmeyPosOfMap.x + enmeyPosOfMap.y * this.column;
                    if (this.logicArray[enemyPosIndex] !== 1) {
                        return enmeyPosOfMap;
                    }
                }
                return null;
            }
            //同时修改占用信息
            const enmeyPosOfMap = getRandomPosOfEnmey();
            if (enmeyPosOfMap) {
                const enmeyPosOfMapIndex = enmeyPosOfMap.x + enmeyPosOfMap.y * this.column;
                this.logicArray[enmeyPosOfMapIndex] = 1;
                const enmeyPos = enmeyPosOfMap.multiplyScalar(this.tileSize);
                enmeyPos.subtract(v3(this.mapOffsetX,this.mapOffsetY, 0)); // 减去初始值
                enemy.setPosition(enmeyPos);
                this.enmeies.addChild(enemy);
                this.enmeyNodeArray.push(enemy);
            }
        }
    }
    judgmentCurPosOfMapTile(target: Node) {
        const coordinate = v2();
        coordinate.x = Math.ceil((target.position.x + this.mapOffsetX) / this.tileSize); // position - (-500) 这个 -500是指屏幕宽度
        coordinate.y = Math.ceil((target.position.y + this.mapOffsetY) / this.tileSize);
        // const indexOfMapTile = coordinate.x + coordinate.y * this.line;
        return coordinate;
    }
    enemiesMoveDirection(enemy: Node, target: Node) {
        const enemyCell = this.judgmentCurPosOfMapTile(enemy);
        // console.log(`前面的值：`, enemyCell);
        const targetCell = this.judgmentCurPosOfMapTile(this.target); //直接给了目标的位置
        const adjacentCells = [];
        for (const offset of this.offsets) {
            const adjacentCell = v2(enemyCell.x + offset.x, enemyCell.y + offset.y);
            adjacentCells.push(adjacentCell);
        };
        //判断这八个格子是否被占用,没有被占用的放入检测目标格子
        const detectionTargetArray = [];
        adjacentCells.forEach((item) => {
            const indexOfLogic = item.x + item.y * this.column;
            if (this.logicArray[indexOfLogic] == 0) {
                detectionTargetArray.push(item); //对应的方格的下标储存起来。
            }
        });
        //找到最近的格子
        const findClosestGrid = (detectionTargetArray, targetCell: Vec2) => {
            let closestGrid: Vec2 = null;
            let closestDistance = Number.POSITIVE_INFINITY; // 极大值
            detectionTargetArray.forEach((item: Vec2) => {
                //判断这些格子和目标格子之间距离
                const detectionCell = item;
                const dx = targetCell.x - item.x;
                const dy = targetCell.y - item.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                // console.log(`检测格子：${item} 距离目标的距离：${distance}`);
                // 如果当前格子的距离比最近格子的距离小，更新最近格子和距离
                if (distance < closestDistance) {
                    closestGrid = detectionCell;
                    closestDistance = distance;
                };
            })
            // console.log("距离目标最近的格子", closestGrid, targetCell);
            return closestGrid;
        }
        //最近的格子的下标
        const closestGrid = findClosestGrid(detectionTargetArray, targetCell);
        return closestGrid;
    }
    newEnemyMove(enemy: Node, direction: Vec2, deltaTime: number) {
        if (enemy && direction) {
            //确定direction 是改变的，没有问题。
            //enmey 的位置也是改变的没有问题。
            const enemyCell = v2();
            enemyCell.x = Math.floor((enemy.position.x + this.mapOffsetX) / this.tileSize);
            enemyCell.y = Math.floor((enemy.position.y + this.mapOffsetY) / this.tileSize);
            const targetPosition = v3(
                direction.x * this.tileSize - this.mapOffsetX,
                direction.y * this.tileSize - this.mapOffsetY,
                enemy.position.z);
            const preIndex = direction.x + direction.y * this.column;
            const curIndex = enemyCell.x + enemyCell.y * this.column;
            //判断两个值的大小，来控制物体是否转向
            if(enemyCell.x < direction.x){
                //右边
                enemy.scale = v3(1,1,0);
            }else{
                enemy.scale = v3(-1,1,0);
            }
            //计算得出的index的值也是没有问题的。
            // console.log(index, curindex);
            this.logicArray[curIndex] = 0;
            this.turnMapGreenColor(curIndex);
            this.logicArray[preIndex] = 1;
            this.turnMapRedColor(preIndex);
            enemy.setPosition(targetPosition);
        }
    }
    turnMapRedColor(index: number) {
        this.mapTileArray[index].getComponent(Sprite).color = new Color(255, 0, 0);
    }
    turnMapGreenColor(index: number) {
        if(!this.mapTileArray[index]) return;
        this.mapTileArray[index].getComponent(Sprite).color = new Color(0, 255, 0);
    }
    turnMapBlueColor(index: number) {
        this.mapTileArray[index].getComponent(Sprite).color = new Color(0, 0, 255);
    }
}


