class ItemUpgrade {
    purchased;

    constructor(id, name, description, upgradeCost, upgradedItems, upgradeRequirements) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.upgradeCost = upgradeCost;
        this.upgradedItems = upgradedItems;
        this.upgradeRequirements = upgradeRequirements;
    }
    canPurchase(currentAmount) {
        return currentAmount >= this.upgradeCost;
    }
    purchase() {
        this.purchased = true;
    }
    isItemUpgraded(itemID) {
        return this.upgradedItems.includes(itemID);
    }
}
class ItemUpgradeStats {
    power;

    constructor(power) {
        this.power = power;
    }
}