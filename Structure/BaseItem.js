class BaseItem {
    quantity = 0;
    constructor(name, baseCost, basePower, baseMultiplier) {
        this.name = name;
        this.baseCost = baseCost;
        this.basePower = basePower;
        this.baseMultiplier = baseMultiplier;
    }

    getItemPower() {
        return this.basePower * this.quantity;
    }

    getItemCost() {
        if(this.quantity > 0) {
            return Math.trunc(this.baseCost * (this.quantity * this.baseMultiplier));
        } else {
            return this.baseCost;
        }
    }
}