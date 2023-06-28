class ItemUpgrade {
    purchased;

    constructor(id, name, description, upgradeCost, upgradeItem, upgradePower) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.upgradeCost = upgradeCost;
        this.upgradeItem = upgradeItem;
        this.upgradePower = upgradePower;
    }
}