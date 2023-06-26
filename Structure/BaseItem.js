class BaseItem {
    quantity = 0;
    constructor(baseCost, basePower, baseMultiplier) {
        this.baseCost = baseCost;
        this.basePower = basePower;
        this.baseMultiplier = baseMultiplier;
    }

    getItemPower() {
        return this.basePower * this.quantity;
    }

    getItemCost() {
        if(quantity = 0) {
            return baseCost;
        } else {
            return this.baseCost * (this.quantity * this.baseMultiplier)
        }
    }
}