import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameSetting')
export class GameSetting extends Component {
    public BlackGhost = BlackGhostSettings;
    public BrownGhost = BrownGhostSettings;
    public GreenGhost = GreenGhostSettings;
    public GrayWolf = GrayWolfSettings;
    public RedWolf = RedWolfSettings;
    public Kitsune = KitsuneSettings;
    public Yamabushi = YamabushiSettings;
}
//player的基础数值
export class PlayerSetting {
    public defaultHP = 0;
    public requiredXP: number[] = [];
    public speed = 0;
    public regenerationDelay = 0; //恢复延迟
    public magnetDuration = 0; //磁体持续时间
}
export class EnemySettings{
    public name = "";
    public moveType = ""; //quick //small // middle
    public health = 0;
    public damage = 0;
    public speed = 0;
    public lifetime = 0;

    public xpReward = 0;
    public goldReward = 0;
    public healthPotionRewardChance = 0;
    public magnetRewardChance = 0;
    public chestRewardChance = 0;
}
export class BlackGhostSettings{
    public name = "BlackGhost";
    public moveType = "quick"; //quick //slow // middle
    public health = 100;
    public damage = 1;
    public speed = 3;
    public lifetime = 30;

    public xpReward = 1;
    public goldReward = 1;
    public healthPotionRewardChance = 0;
    public magnetRewardChance = 0;
    public chestRewardChance = 0;
}
export class BrownGhostSettings{
    public name = "BrownGhost";
    public moveType = "middle"; //quick //small // middle
    public health = 200;
    public damage = 2;
    public speed = 2;
    public lifetime = 50;

    public xpReward = 2;
    public goldReward = 2;
    public healthPotionRewardChance = 0;
    public magnetRewardChance = 0;
    public chestRewardChance = 0;
}
export class GreenGhostSettings{
    public name = "GreenGhost";
    public moveType = "slow"; //quick //slow // middle
    public health = 300;
    public damage = 3;
    public speed = 1;
    public lifetime = 50;

    public xpReward = 3;
    public goldReward = 3;
    public healthPotionRewardChance = 0;
    public magnetRewardChance = 0;
    public chestRewardChance = 0;
}
export class GrayWolfSettings{
    public name = "GrayWolf";
    public moveType = "middle"; //quick //slow // middle
    public health = 200;
    public damage = 3;
    public speed = 2;
    public lifetime = 50;

    public xpReward = 3;
    public goldReward = 3;
    public healthPotionRewardChance = 0;
    public magnetRewardChance = 0;
    public chestRewardChance = 0;
}
export class RedWolfSettings{
    public name = "RedWolf";
    public moveType = "middle"; //quick //slow // middle
    public health = 300;
    public damage = 3;
    public speed = 2;
    public lifetime = 50;

    public xpReward = 3;
    public goldReward = 3;
    public healthPotionRewardChance = 0;
    public magnetRewardChance = 0;
    public chestRewardChance = 0;
}
export class KitsuneSettings{
    public name = "Kitsune";
    public moveType = "middle"; //quick //slow // middle
    public health = 1000;
    public damage = 5;
    public speed = 2;
    public lifetime = 100;

    public xpReward = 10;
    public goldReward = 10;
    public healthPotionRewardChance = 0.5;
    public magnetRewardChance = 0;
    public chestRewardChance = 1;
}
export class YamabushiSettings{
    public name = "Yamabushi";
    public moveType = "slow"; //quick //slow // middle
    public health = 1500;
    public damage = 5;
    public speed = 1;
    public lifetime = 100;

    public xpReward = 10;
    public goldReward = 10;
    public healthPotionRewardChance = 0.5;
    public magnetRewardChance = 0;
    public chestRewardChance = 1;
}

