import { _decorator, Component, find, instantiate, Node, Prefab, Sprite, SpriteFrame, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export const SCREEN_WIDTH = 510;
export const SCREEN_HEIGHT = 680;

export const SCREEN_HALF_WIDTH = SCREEN_WIDTH / 2;
export const SCREEN_HALF_HEIGHT = SCREEN_HEIGHT / 2;

@ccclass('Background')
export class Background extends Component {
    @property({ type: Prefab })
    private backgroundPrefab: Prefab;
    start() {
        this.createTileMap();
        this._target = find('Game/Player');
    }
    update(deltaTime: number) {
        //实时改变地图方块的位置。
        this.tryTile();
    }
    private rows = 9;
    private column = 9;
    private nodeSize = 170;
    private tileMapNodes: Node[][] = [];
    createTileMap() {
        for (let i = 0; i < this.rows; i++) {
            const rowNodes: Node[] = [];
            for (let u = 0; u < this.column; u++) {
                const tileMap = instantiate(this.backgroundPrefab);
                tileMap.setParent(this.node);
                const x = (u - 4) * this.nodeSize + SCREEN_HALF_WIDTH;
                const y = (i - 4) * this.nodeSize + SCREEN_HALF_HEIGHT;
                tileMap.setWorldPosition(v3(x, y, 0));
                rowNodes.push(tileMap);
            }
            this.tileMapNodes.push(rowNodes); //5行
        }
    }
    private _target: Node;
    private playerGildPosX: number = 0;
    private playerGildPosY: number = 0;
    tryTileX() {
        //计算出当前玩家的位置，相对于屏幕中心点的位置，在除以每个方块的单位，得到基于方块的位置。
        const playerGildPosX = Math.round((this._target.worldPosition.x - SCREEN_HALF_WIDTH) / this.nodeSize);

        if (playerGildPosX < this.playerGildPosX) {
            //将最后一列往前移
            const column = this.column - 1;
            for (let i = 0; i < this.rows; i++) {
                const instantiateTileMap = this.tileMapNodes[i][column];
                const newPosition: Vec3 = instantiateTileMap.worldPosition;
                newPosition.x -= this.column * this.nodeSize;
                instantiateTileMap.setWorldPosition(newPosition);

                this.tileMapNodes[i].splice(column, 1);
                this.tileMapNodes[i].unshift(instantiateTileMap);
            }
        }
        else if (playerGildPosX > this.playerGildPosX) {
            const column = 0;
            for (let i = 0; i < this.rows; i++) {
                const instantiateTileMap = this.tileMapNodes[i][column];
                const newPosition: Vec3 = instantiateTileMap.worldPosition;
                newPosition.x += this.nodeSize * this.column;
                instantiateTileMap.setWorldPosition(newPosition);

                this.tileMapNodes[i].splice(column, 1);
                this.tileMapNodes[i].push(instantiateTileMap);
            }
        }
        //更新玩家的相对屏幕位置。
        this.playerGildPosX = playerGildPosX;
    }
    tryTileY() {
        const playerGildPosY = Math.round((this._target.worldPosition.y - SCREEN_HALF_HEIGHT) / this.nodeSize);
        if (playerGildPosY < this.playerGildPosY) {
            //最上面的往下移
            const rows = this.rows - 1;
            const rowsNodes: Node[] = [];
            for (let i = 0; i < this.column; i++) {
                const instantiateTileMap = this.tileMapNodes[rows][i];
                const newPosition: Vec3 = instantiateTileMap.worldPosition;
                newPosition.y -= this.nodeSize * this.rows;
                instantiateTileMap.setWorldPosition(newPosition);

                rowsNodes.push(instantiateTileMap);
            }
            this.tileMapNodes.splice(rows, 1);
            this.tileMapNodes.unshift(rowsNodes); //最下面的加入到数组的最前方。
        }
        else if (playerGildPosY > this.playerGildPosY) {
            //最下面的往上移
            const rows = 0;
            const rowsNodes: Node[] = [];
            for (let i = 0; i < this.column; i++) {
                const instantiateTileMap = this.tileMapNodes[rows][i];
                const newPosition: Vec3 = instantiateTileMap.worldPosition;
                newPosition.y += this.nodeSize * this.rows;
                instantiateTileMap.setWorldPosition(newPosition);

                rowsNodes.push(instantiateTileMap);
            }
            this.tileMapNodes.splice(rows, 1);
            this.tileMapNodes.push(rowsNodes); //数组最后的渲染在最上面
        }
        this.playerGildPosY = playerGildPosY;
    }

    tryTile() {
        this.tryTileX();
        this.tryTileY();
    }
}





