class BaseItem {
    quantity = 0;
    constructor(id, name, description, baseCost, basePower, baseMultiplier) {
        this.id = id
        this.name = name;
        this.description = description
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