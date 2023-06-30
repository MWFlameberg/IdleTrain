class Upgrade {
    purchased;
    available;

    constructor(id, name, description, baseCost, affectedItem, basePower, unlockReq) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.baseCost = baseCost;
        this.affectedItem = affectedItem;
        this.basePower = basePower;
        this.unlockReq = unlockReq
        this.purchased = false;
        this.available = false;
    }
    canUnlockUpgrade(product) {
        if(this.available) {
            return false;
        } else if(this.unlockReq.itemReq != product.id) {
            return false;
        } else if(this.unlockReq.amtReq > product.quantity) {
            return false;
        } else {
            return true;
        }
    }
}