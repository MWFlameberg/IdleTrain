Game.Items = [];
Item = function(id, name, desc, extraDesc, icon, tooltipIcon, bCost, bPower, bCostMult, bPowerMult, bSpeedMult, bDiscountMult, unlockReqs, secId = -1) {
    //Item Appearance properties.
    this.id = id;
    this.secId = secId
    this.name = name;
    this.desc = desc;
    this.extraDesc = extraDesc;
    this.icon = icon;
    this.tooltipIcon = tooltipIcon;
    //Base Stat properties.
    this.bCost = bCost;
    this.bPower = bPower;
    this.bCostMult = bCostMult;
    this.bPowerMult = bPowerMult;
    this.bSpeedMult = bSpeedMult;
    this.bDiscountMult = bDiscountMult;
    //Actual Stat properties.
    this.aCost = this.bCost;
    this.aPower = this.bPower;
    this.aCostMult = this.bCostMult;
    this.aCostDiscount = 1;
    this.aPowerMult = 0;
    this.aSpeedMult = 0;
    this.aDiscountMult = 1;
    //Quantity properties.
    this.amt = 0;
    this.trainsPs = 0;
    this.totalTrains = 0;
    //Unlock properties.
    this.unlockReqs = unlockReqs;
    this.upgrades = [];
    this.children = [];
    //Flag properties.
    this.isUnlocked = 0;
    this.isEnabled = 0;
    this.isVisible = 0;
    //HTML properties.
    this.element;

    this.updateItem = function() {
        //Defined in inherited object
    };
    this.buyItem = function(amt, isBuy) {
        var success = 0;
        var cost = this.getSumCost(amt);
        if(Game.trains >= cost) {
            if(isBuy) {
                Game.Spend(cost);
                this.amt += amt;
                this.aCost = this.getSumCost(1);
                this.updateItem();
            }
            success = 1;
        }
        return success;
    };
    this.sellItem = function(amt) {
        var success = 0;
        if (amt > this.amt) { amt = this.amt; };
        var cost = this.getSumSell(amt);
        Game.Earn(cost, true);
        this.amt -= amt;
        this.aCost = this.getSumCost(1);
        this.updateItem();
        success = 1;
        return success;
    };
    this.getSumCost = function(amt) {
        var cost = 0;
        for (var i = this.amt; i < this.amt + amt; i++) {
            cost += Math.ceil(this.bCost * this.aCostDiscount * Math.pow(this.aCostMult, i));
        }
        return cost;
    };
    this.getSumSell = function(amt) {
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
    this.reset = function() {
        //Reset actual stats to base.
        this.aCost = this.bCost;
        this.aPower = this.bPower;
        this.aCostMult = this.bCostMult;
        this.aCostDiscount = 1;
        this.aPowerMult = 0;
        this.aSpeedMult = 0;
        this.aDiscountMult = 1;
        //Reset quantity properties.
        this.amt = 0;
        this.trainsPs = 0;
        this.totalTrains = 0;
        //Reset unlock properties
        this.upgrades = [];
        this.children.forEach(function(i) { i.reset() });
        this.unlockReqs.forEach(function(i) { i.reset() });
        //Reset flags.
        this.isUnlocked = 0;
        this.isEnabled = 0;
        this.isVisible = 0;
        
        this.unlock();
    };
    this.clearStoreItem = function() {
        if (this.element != null) {
            this.element.remove();
            this.element = null;
        }
    };
    this.getTooltip = function() {
        //Defined in inherited object
    };
    this.drawStoreItem = function() {
        //Defined in inherited object
    };
    this.refresh = function () {
        //Defined in inherited object
    };
};
ItemParent = function(id, name, desc, extraDesc, icon, tooltipIcon, bCost, bPower, bCostMult, unlockReqs) {
    __proto__: Item;
    Item.call(this, id, name, desc, extraDesc, icon, tooltipIcon, bCost, bPower, bCostMult, 0, 0, 1, unlockReqs, secId = -1);

    this.updateItem = function() {
        var multiplier = 1;
        this.upgrades.forEach(function(i) {
            multiplier = multiplier * i.multiplier;
        });
        var cPowerMult = 1;
        var cSpeedMult = 1;
        var cDiscountMult = 1;
        this.children.forEach(function(i) {
            cPowerMult += i.aPowerMult;
            cSpeedMult += i.aSpeedMult;
            cDiscountMult *= i.aDiscountMult
        });
        this.aPowerMult = cPowerMult;
        this.aSpeedMult = cSpeedMult;
        this.aCostDiscount = cDiscountMult;

        this.aPower = this.bPower * multiplier * Game.ascMultiplier * this.aPowerMult;
        this.trainsPs = this.aPower * this.amt;
    };
    this.getTooltip = function() {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);

        return '<div id="tooltipItem">' +
                    '<div class="tooltipIcon" style="float:left; background-position:' + this.tooltipIcon.xCoord + 'px ' + this.tooltipIcon.yCoord + 'px;background-image:url(' + this.tooltipIcon.file + ')"></div>' +
                    '<div style="float:right; text-align:right;">' + cost + '</div>' +
                    '<div class="tooltipHeader">' + this.name + '</div>' +
                    '<div class="tooltipTag">' + 'owned: ' + this.amt + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipDesc">' + this.desc + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipStats">' + 'Each ' + this.name + ' generates ' + this.aPower + ' per second.' + '</div>' +
                    '<div class="tooltipStats">' + this.amt + ' ' + this.name + ' generating ' + this.trainsPs + ' per second.' + '</div>' +
                    '<div class="tooltipStats">' + this.totalTrains + ' generated so far' + '</div>' +
                '</div>'
    };
    this.drawStoreItem = function() {
        var cost = 0;
        if (Game.bulkMode == 1) cost = this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);

        tempElement = el('items').appendChild(document.createElement('div'));
        tempElement.id = 'item' + this.id + 'Container';
        tempElement.className = 'itemContainer';
        this.element = tempElement.appendChild(document.createElement('div'));
        this.element.id = 'item' + this.id;
        this.element.className = 'item';
        this.element.innerHTML = '<div class="itemIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yCoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
            '<div class="itemContent">' +
                '<div class="itemHeader">' + this.name + '</div>' +
                '<div id="item' + this.id + 'cost" class="itemDesc">' + cost + '</div>' +
                '<div id="item' + this.id + 'qty" class="itemOwned">' + this.amt + '</div>' +
            '</div>'
        this.isVisible = 1;

        this.element.onclick = function() { Game.Buy(id, 'Item') };
        this.element.onmousemove = function() { Game.tooltip.drawTooltip(function() {return Game.Items[id].getTooltip() }, 'store') };
        this.element.onmouseout =  function() { Game.tooltip.hideTooltip() };
    };
    this.refresh = function () {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);
        this.cost = this.getSumCost(Game.bulkQty);
        this.element.innerHTML = '<div class="itemIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yCoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
        '<div class="itemContent">' +
            '<div class="itemHeader">' + this.name + '</div>' +
            '<div id="item' + this.id + 'cost" class="itemDesc">' + cost + '</div>' +
            '<div id="item' + this.id + 'qty" class="itemOwned">' + this.amt + '</div>' +
        '</div>'
    };
    Game.Items.push(this);
}
ItemChild = function(id, name, desc, extraDesc, icon, tooltipIcon, bCost, bCostMult, bPowerMult, bSpeedMult, bDiscountMult, unlockReqs, secId) {
    __proto__: Item
    Item.call(this, id, name, desc, extraDesc, icon, tooltipIcon, bCost, 0, bCostMult, bPowerMult, bSpeedMult, bDiscountMult, unlockReqs, secId);

    this.updateItem = function() {
        this.aPowerMult = this.bPowerMult * this.amt;
        this.aSpeedMult = this.bSpeedMult * this.amt;
        this.aDiscountMult = Math.pow(this.bDiscountMult,this.amt);
        Game.Items[this.secId].updateItem();
    };
    this.getTooltip = function() {
        var cost = 0;
        if (Game.bulkMode == 1) cost = this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);

        return '<div id="tooltipItem">' +
                    '<div class="tooltipIcon" style="float:left; background-position:' + this.tooltipIcon.xCoord + 'px ' + this.tooltipIcon.yCoord + 'px;background-image:url(' + this.tooltipIcon.file + ')"></div>' +
                    '<div style="float:right; text-align:right;">' + cost + '</div>' +
                    '<div class="tooltipHeader">' + this.name + '</div>' +
                    '<div class="tooltipTag">' + 'owned: ' + this.amt + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipDesc">' + this.desc + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipStats">' + 'Each ' + this.name + ' improves ' + Game.Items[this.secId].name +' efficiency by ' + (this.aPowerMult * 100) + '%.' + '</div>' +
                    '<div class="tooltipStats">' + 'Current improving efficiency by ' + (this.aPowerMult * 100) * this.amt + '%.' + '</div>' +
                '</div>'
    };
    this.drawStoreItem = function() {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);

        this.element = el('item' + this.secId + 'Container').appendChild(document.createElement('div'));
        this.element.id = 'itemChild' + this.id;
        this.element.className = 'itemChild';
        this.element.innerHTML = '<div class="itemChildIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yYoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
            '<div class="itemChildContent">' +
                '<div class="itemChildHeader">' + this.name + ' - ' + cost + '</div>' +
                '<div id="item' + this.id + 'qty" class="itemChildOwned">' + this.amt + '</div>' +
            '</div>'
        this.isVisible = 1;

        this.element.onclick = function() { Game.Buy(id, 'ItemChild', secId) };
        this.element.onmousemove = function() { Game.tooltip.drawTooltip(function() {return Game.Items[secId].children[id].getTooltip() }, 'store') };
        this.element.onmouseout =  function() { Game.tooltip.hideTooltip() };
    };
    this.refresh = function () {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);
        this.cost = this.getSumCost(Game.bulkQty);
        this.element.innerHTML = '<div class="itemChildIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yCoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
        '<div class="itemChildContent">' +
            '<div class="itemChildHeader">' + this.name + ' - ' + cost + '</div>' +
            '<div id="item' + this.id + 'qty" class="itemChildOwned">' + this.amt + '</div>' +
        '</div>'
    };
    Game.Items[secId].children.push(this);
};