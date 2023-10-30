import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import { Background, SCREEN_WIDTH } from './Background';
@ccclass('GirdAlgorithm')
export class GirdAlgorithm extends Component {
    private grid : Node [][];
    start() {
        this.grid = this.initGrid();
    }

    update(deltaTime: number) {
        
    }
    private cellSize:number = 100; //单元格大小，是以最大的角色的长度来设置的，至少要单独占一个格子。
    initGrid(){
        const gridSizeX = 100;  //网格列数
        const gridSizeY = 100; //网格行数

        const grid = new Array(gridSizeX);

        //初始化网格 =》 二维数组
         for(let x = 0 ; x < gridSizeY ; x ++){
            gridSizeX[x] = new Array(gridSizeY);
            for(let y = 0 ; y < gridSizeY ; y++){
                grid[x][y] = [];
            }
         }
        return grid;
    }

    //添加游戏对象到单元格
    addGameObjectToGrid(gameObject:Node){
        const cellX = gameObject.worldPosition.x / this.cellSize;
        const cellY = gameObject.worldPosition.y / this.cellSize;
    }
}


