Game.ItemThings = [];
Game.ItemThing = function(itemId, itemName, itemDesc, itemExtraDesc, itemIcon, tooltipIcon,
                            itemBaseCost, itemBasePower, itemCostMultiplier, itemReqs) {
    //Item Appearance properties.
    this.itemId = itemId;
    this.itemName = itemName;
    this.itemDesc = itemDesc;
    this.itemExtraDesc = itemExtraDesc;
    this.itemIcon = itemIcon;
    this.tooltipIcon = tooltipIcon;
    //Base Stat properties.
    this.itemBaseCost = itemBaseCost;
    this.itemBasePower = itemBasePower;
    this.itemCostMultiplier = itemCostMultiplier;
    //Up to Date Stat properties.
    this.itemCost = this.itemBaseCost;
    this.itemPower = this.itemBasePower;
    this.itemAmt = 0;
    this.itemTrainsPs = 0;
    this.itemTotalTrains = 0;
    //Unlock properties.
    this.itemReqs = itemReqs;
    this.itemUpgrades = [];
    //Flag properties.
    this.isUnlocked = 0;
    this.isEnabled = 0;
    this.isVisible = 0;
    //HTML properties.
    this.element;

    this.updateItem = function() {
        var multiplier = 1;
        this.itemUpgrades.forEach(function(upgrade) {
            multiplier = multiplier * upgrade.multiplier;
        });
        this.itemPower = this.itemBasePower * multiplier;
        this.itemTrainsPs = this.itemPower * this.itemAmt;
    };
    this.canBuyItem = function(amt) {
        var success = 0;
        var cost = this.getSumCost(amt);
        if(Game.trains >= cost) {
            success = 1;
        }
        return success;
    };
    this.buyItem = function(amt) {
        var success = 0;
        var cost = this.getSumCost(amt);
        if(Game.trains >= cost) {
            Game.Spend(cost);
            this.itemAmt += amt;
            this.itemCost = this.getSumCost(1);
            this.updateItem();
            success = 1;
        }
        return success;
    };
    this.sellItem = function(amt) {
        var success = 0;
        if (amt > this.itemAmt) {
            amt = this.itemAmt;
        };
        var cost = this.getSumSell(amt);
        Game.Earn(cost);
        this.itemAmt -= amt;
        this.itemCost = this.getSumCost(1);
        this.updateItem();
        success = 1;
        return success;
    };
    this.getSumCost = function(amt) {
        var cost = 0;
        for (var i = this.itemAmt; i < this.itemAmt + amt; i++) {
            cost += Math.ceil(this.itemBaseCost * Math.pow(this.itemCostMultiplier, i));
        }
        return cost;
    };
    this.getSumSell = function(amt) {
        if (this.itemAmt == 0) { return 0; };
        if (amt > this.itemAmt) { amt = this.itemAmt; };
        var cost = 0;
        var i = amt;
        do {
            cost += Math.ceil(this.itemBaseCost * Math.pow(this.itemCostMultiplier, this.itemAmt - 1) * 0.6);
            i--;
        } while (i > this.itemAmt - amt)
        return cost;
    };
    this.unlock = function() {
        if (this.isUnlocked == 1 && this.isVisible == 1) { return 0; }
        var unlockable = 1;
        this.itemReqs.forEach(function(req) {
            if (!req.unlock()) {
                unlockable = 0;
            }
        });
        if (unlockable == 1) { 
            this.isUnlocked = 1; 
            this.isVisible = 1;
        }
        return unlockable;
    };
    this.getTooltip = function() {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);

        return '<div id="tooltipItem">' +
                '<div class="tooltipIcon" style="float:left; background-position:' + this.tooltipIcon.x + 'px ' + this.tooltipIcon.y + 'px;background-image:url(' + this.tooltipIcon.file + ')"></div>' +
                '<div style="float:right; text-align:right;">' + cost + '</div>' +
                '<div class="tooltipHeader">' + this.itemName + '</div>' +
                '<div class="tooltipTag">' + 'owned: ' + this.itemAmt + '</div>' +
                '<div class="tooltipLine"></div>' +
                '<div class="tooltipDesc">' + this.itemDesc + '</div>' +
                '<div class="tooltipLine"></div>' +
                '<div class="tooltipStats">' + 'Each ' + this.itemName + ' generates ' + this.itemPower + ' per second.' + '</div>' +
                '<div class="tooltipStats">' + this.itemAmt + ' ' + this.itemName + ' generating ' + this.itemTrainsPs + ' per second.' + '</div>' +
                '<div class="tooltipStats">' + this.itemTotalTrains + ' generated so far' + '</div>' +
            '</div>'
    };
    this.drawStoreItem = function() {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);

        this.element = el('items').appendChild(document.createElement('div'));
        this.element.id = 'item' + this.itemId;
        this.element.className = 'storeItem';
        this.element.innerHTML = '<div class="storeIcon" style="float:left; background-position:' + this.itemIcon.x + 'px ' + this.itemIcon.y + 'px;background-image:url(' + this.itemIcon.file + ')"></div>' +
            '<div class="storeContent">' +
                '<div class="storeHeader">' + this.itemName + '</div>' +
                '<div id="item' + this.itemId + 'cost" class="storeDesc">' + cost + '</div>' +
                '<div id="item' + this.itemId + 'qty" class="storeOwned">' + this.itemAmt + '</div>' +
            '</div>'
        this.visible = 1;

        this.element.onclick = function() { Game.Buy(itemId, 'Item') };
        this.element.onmousemove = function() { Game.tooltip.drawTooltip(function() {return Game.ItemThings[itemId].getTooltip() }, 'store') };
        this.element.onmouseout =  function() { Game.tooltip.hideTooltip() };
    };
    this.refresh = function () {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);
        this.cost = this.getSumCost(Game.bulkQty);
        this.element.innerHTML = '<div class="storeIcon" style="float:left; background-position:' + this.itemIcon.x + 'px ' + this.itemIcon.y + 'px;background-image:url(' + this.itemIcon.file + ')"></div>' +
            '<div class="storeContent">' +
                '<div class="storeHeader">' + this.itemName + '</div>' +
                '<div id="item' + this.itemId + 'cost" class="storeDesc">' + cost + '</div>' +
                '<div id="item' + this.itemId + 'qty" class="storeOwned">' + this.itemAmt + '</div>' +
            '</div>'
    };
    Game.ItemThings.push(this);
}