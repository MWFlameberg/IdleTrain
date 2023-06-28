class BaseItem {
    quantity = 0;
    powerMultiplier = 1;
    constructor(id, name, description, baseCost, basePower, baseMultiplier) {
        this.id = id
        this.name = name;
        this.description = description
        this.baseCost = baseCost;
        this.basePower = basePower;
        this.baseMultiplier = baseMultiplier;
    }
    getItemPower() {
        return (this.basePower * this.powerMultiplier) * this.quantity;
    }
    getItemCost() {
        if(this.quantity > 0) {
            return this.baseCost + Math.trunc(this.baseCost * (this.quantity * this.baseMultiplier));
        } else {
            return this.baseCost;
        }
    }
}
// Experimental Object based Items
// var ItemThing = {};
// ItemThing.Initialise = function(id, name, description, baseCost, basePower, baseMultiplier) {
//     ItemThing.id = id;
//     ItemThing.name = name;
//     ItemThing.description = description;
//     ItemThing.baseCost = baseCost;
//     ItemThing.basePower = basePower;
//     ItemThing.baseMultiplier = baseMultiplier
//     ItemThing.quantity = 0;
//     ItemThing.powerMultiplier = 1;
// };
// ItemThing.GetItemPower = function() {
//     return (this.basePower * this.powerMultiplier) * this.quantity;
// };
// ItemThing.GetItemCost = function() {
//     if(this.quantity > 0) {
//         return this.baseCost + Math.trunc(this.baseCost * (this.quantity * this.baseMultiplier));
//     } else {
//         return this.baseCost;
//     }
// };