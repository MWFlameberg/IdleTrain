BaseObject = function(id1, id2, name, desc1, desc2, icon, tooltipIcon) {
    //Core properties.
    this.id1 = id1;
    this.id2 = id2;
    this.name = name;
    this.desc1 = desc1;
    this.desc2 = desc2;
    this.icon = icon;
    this.tooltipIcon = tooltipIcon;
    //Quantifiable properties.
    this.amt = 0;
    //Flag properties.
    this.isUnlocked = 0;
    this.isEnabled = 0;
    this.isVisible = 0;
    this.isDymaic = 0;
    //HTML properties.
    this.element = null;
    //Functions
    this.resetObject = function() {
        this.isUnlocked = 0;
        this.isEnabled = 0;
        this.isVisible = 0;
        this.isDymaic = 0;
    };
    this.clear = function() {
        this.resetObject();
        if (this.element != null) {
            this.element.remove();
            this.element = null;
        }
    };
    this.enable = function() {
        enableElement(this.element);
        this.isEnabeled = 1;
    };
    this.disable = function() {
        disableElement(this.element);
        this.isEnabeled = 0;
    };
};
StoreObject = function(id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs) {
    //Parent calls.
    this.prototype = BaseObject;
    BaseObject.call(this, id1, id2, name, desc1, desc2, icon, tooltipIcon);
    //Base Stat properties.
    this.baseCost = baseCost;
    this.baseCostMult = baseCostMult;
    this.baseDiscount = 1.0;
    //Up to Date Stat properties.
    this.currentCost = this.baseCost;
    this.currentCostMult = this.baseCostMult;
    this.currentDiscount = this.baseDiscount;
    this.currentDiscountCost = this.currentCost * this.currentDiscount;
    //Prereq Collection properties.
    this.unlockReqs = unlockReqs;
    //Functions
    var parentResetObject = this.resetObject;
    this.resetObject = function() {
        parentResetObject.call(this);

        this.currentCost = this.baseCost;
        this.currentCostMult = this.baseCostMult;
        this.currentDiscount = this.baseDiscount;
        this.currentDiscountCost = this.currentCost * this.currentDiscount;
        this.unlockReqs.forEach(function(i) { i.reset() });
        this.unlock();
    };
    this.update = function() {
        this.currentCost = this.getBuyCost(1);
        this.currentDiscountCost = this.currentCost * this.currentDiscount
    };
    this.unlock = function() {
        if (this.isUnlocked == 1 && this.isVisible == 1) { return 0; }
        var unlockable = 1;
        this.unlockReqs.forEach(function(i) {
            if (!i.unlock()) {
                unlockable = 0;
            }
        });
        if (unlockable == 1) { 
            this.isUnlocked = 1; 
            this.isVisible = 1;
        }
        return unlockable;
    };
    this.buy = function(amt) {
        var success = 0;
        if(Game.trains >= this.getBuyCost(amt)) {
            Game.Spend(this.getBuyCost(amt));
            this.amt += amt;
            this.update();
            success = 1;
        }
        return success;
    };
    this.sell = function(amt) {
        var success = 0;
        if (amt > this.amt) { amt = this.amt; };
        var cost = this.getSellCost(amt);
        Game.Earn(cost, true);
        this.amt -= amt;
        this.update();
        success = 1;
        return success;
    };
    this.canBuy = function(amt) {
        return Game.trains >= this.getBuyCost(amt);
    };
    this.canSell = function(amt) {
        return this.amt > 0;
    };
    this.getBuyCost = function(amt) {
        var cost = 0;
        for (var i = this.amt; i < this.amt + amt; i++) {
            cost += Math.ceil(this.baseCost * this.currentDiscount * Math.pow(this.currentCostMult, i));
        }
        return cost;
    };
    this.getSellCost = function(amt) {
        if (this.amt == 0) { return 0; };
        if (amt > this.amt) { amt = this.amt; };
        var cost = 0;
        var i = amt;
        do {
            cost += Math.ceil(this.bCost * Math.pow(this.aCostMult, this.amt - 1) * 0.6);
            i--;
        } while (i > this.amt - amt)
        return cost;
    };
    this.getCurrentCost = function(amt) {
        if (Game.bulkMode == 1) 
            return this.getBuyCost(Game.bulkQty);
        else if (Game.bulkMode == 2) 
            return this.getSellCost(Game.bulkQty);
    }
};
StoreItem = function(id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs, basePower) {
    //Parent calls.
    this.prototype = StoreObject;
    StoreObject.call(this, id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs);
    //Base Stat properties.
    this.basePower = basePower;
    this.basePowerMult - 1;
    //Up to Date Stat properties.
    this.currentPower = this.basePower;
    this.currentPowerMult = this.basePowerMult;
    //Child Collection properties.
    this.upgrades = [];
    this.subItems = [];
    //Tracking properties.
    this.trainsEarned = 0;
    this.trainsPs = 0;
    //Functions
    var parentResetObject = this.resetObject;
    this.resetObject = function() {
        parentResetObject.call(this);

        this.currentPower = this.basePower;
        this.currentPowerMult = this.basePowerMult;
        this.trainsEarned = 0;
        this.trainsPs = 0;
    };
    var parentUpdate = this.update;
    this.update = function() {
        var upgPowerMult = 1;
        this.upgrades.forEach(function(i) {
            upgPowerMult *= i.multiplier;
        });
        var subPowerMult = 1;
        var subDiscountMult = 1;
        this.subItems.forEach(function(i) {
            subPowerMult += i.currentPowerMult;
            subDiscountMult *= i.currentDiscountMult;
        });

        this.currentDiscount = subDiscountMult
        this.currentPowerMult = upgPowerMult * subPowerMult;
        this.currentPower = this.basePower * this.currentPowerMult * 1;
        this.trainsPs = this.currentPower * this.amt

        parentUpdate.call(this);
    };
    this.drawTooltip = function() {
        return '<div id="tooltipItem">' +
                    '<div class="tooltipIcon" style="float:left; background-position:' + this.tooltipIcon.xCoord + 'px ' + this.tooltipIcon.yCoord + 'px;background-image:url(' + this.tooltipIcon.file + ')"></div>' +
                    '<div style="float:right; text-align:right;">' + this.getCurrentCost() + '</div>' +
                    '<div class="tooltipHeader">' + this.name + '</div>' +
                    '<div class="tooltipTag">' + 'owned: ' + this.amt + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipDesc">' + this.desc1 + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipStats">' + 'Each ' + this.name + ' generates ' + this.currentPower + ' per second.' + '</div>' +
                    '<div class="tooltipStats">' + this.amt + ' ' + this.name + ' generating ' + this.trainsPs + ' per second.' + '</div>' +
                    '<div class="tooltipStats">' + this.trainsEarned + ' generated so far' + '</div>' +
                '</div>'
    };
    this.drawStoreItem = function() {
        var itemContainer = el('items').appendChild(document.createElement('div'));
        itemContainer.id = 'item' + this.id + 'Container';
        itemContainer.className = 'itemContainer';
        this.element = itemContainer.appendChild(document.createElement('div'));
        this.element.id = 'item' + this.id;
        this.element.className = 'item';
        this.element.innerHTML = '<div class="itemIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yCoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
            '<div class="itemContent">' +
                '<div class="itemHeader">' + this.name + '</div>' +
                '<div id="item' + this.id + 'cost" class="itemDesc">' + this.getCurrentCost() + '</div>' +
                '<div id="item' + this.id + 'qty" class="itemOwned">' + this.amt + '</div>' +
            '</div>'
        this.isVisible = 1;
        this.element.onclick = function() { Game.Buy(id1, id2, 'Item') };
        this.element.onmousemove = function() { Game.tooltip.drawTooltip(function() {return Game.StoreItems[id1].drawTooltip() }, 'store') };
        this.element.onmouseout =  function() { Game.tooltip.hideTooltip() };
    };
    this.refreshStoreItem = function () {
        this.element.innerHTML = '<div class="itemIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yCoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
        '<div class="itemContent">' +
            '<div class="itemHeader">' + this.name + '</div>' +
            '<div id="item' + this.id + 'cost" class="itemDesc">' + this.getCurrentCost() + '</div>' +
            '<div id="item' + this.id + 'qty" class="itemOwned">' + this.amt + '</div>' +
        '</div>'
    };
    Game.StoreItems.push(this);
};
StoreSubItem = function(id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs, basePowerMult, baseSpeedMult, baseDiscountMult) {
    //Parent calls.
    this.prototype = StoreObject;
    StoreObject.call(this, id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs);
    //Base Stat properties.
    this.basePowerMult = basePowerMult;
    this.baseSpeedMult = baseSpeedMult;
    this.baseDiscountMult = baseDiscountMult;
    //Up to Date Stat properties.
    this.currentPowerMult = 0;
    this.currentSpeedMult = 0;
    this.currentDiscountMult = 1;
    //Child Collection properties.
    this.upgrades = [];
    this.subItems = [];
    //Functions
    var parentResetObject = this.resetObject;
    this.resetObject = function() {
        parentResetObject.call(this);

        this.currentPowerMult = 0;
        this.currentSpeedMult = 0;
        this.currentDiscountMult = 1;
    };
    var parentUpdate = this.update;
    this.update = function() {
        this.currentPowerMult = this.basePowerMult * this.amt;
        this.currentSpeedMult = this.baseSpeedMult * this.amt;
        this.currentDiscountMult = Math.pow(this.baseDiscountMult, this.amt);

        parentUpdate.call(this);

        Game.StoreItems[id2].update();
    };
    this.drawTooltip = function() {
        return '<div id="tooltipItem">' +
                    '<div class="tooltipIcon" style="float:left; background-position:' + this.tooltipIcon.xCoord + 'px ' + this.tooltipIcon.yCoord + 'px;background-image:url(' + this.tooltipIcon.file + ')"></div>' +
                    '<div style="float:right; text-align:right;">' + this.getCurrentCost() + '</div>' +
                    '<div class="tooltipHeader">' + this.name + '</div>' +
                    '<div class="tooltipTag">' + 'owned: ' + this.amt + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipDesc">' + this.desc1 + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipStats">' + 'Each ' + this.name + ' improves ' + Game.StoreItems[this.id2].name +' efficiency by ' + (this.currentPowerMult * 100) + '%.' + '</div>' +
                    '<div class="tooltipStats">' + 'Current improving efficiency by ' + (this.currentPowerMult * 100) * this.amt + '%.' + '</div>' +
                '</div>'
    };
    this.drawStoreItem = function() {
        this.element = el('item' + this.secId + 'Container').appendChild(document.createElement('div'));
        this.element.id = 'itemChild' + this.id1;
        this.element.className = 'itemChild';
        this.element.innerHTML = '<div class="itemChildIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yYoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
            '<div class="itemChildContent">' +
                '<div class="itemChildHeader">' + this.name + ' - ' + this.getCurrentCost() + '</div>' +
                '<div id="item' + this.id + 'qty" class="itemChildOwned">' + this.amt + '</div>' +
            '</div>'
        this.isVisible = 1;

        this.element.onclick = function() { Game.Buy(id1, id2, 'SubItem') };
        this.element.onmousemove = function() { Game.tooltip.drawTooltip(function() {return Game.StoreItems[id2].subItems[id1].drawTooltip() }, 'store') };
        this.element.onmouseout =  function() { Game.tooltip.hideTooltip() };
    };
    this.refreshStoreItem = function () {
        this.element.innerHTML = '<div class="itemChildIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yCoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
        '<div class="itemChildContent">' +
            '<div class="itemChildHeader">' + this.name + ' - ' + this.getCurrentCost() + '</div>' +
            '<div id="item' + this.id + 'qty" class="itemChildOwned">' + this.amt + '</div>' +
        '</div>'
    };
    Game.StoreItems[id2].subItems.push(this);
};