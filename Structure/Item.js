Game.Items = [];
Game.ItemChildren = [];
Item = function(itemId, itemName, itemDesc, itemExtraDesc, itemIcon, tooltipIcon,
                            itemBaseCost, itemBasePower, itemCostMultiplier, itemReqs,
                            itemParent = -1) {
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
    this.itemBaseMultiplier = 1;
    //Up to Date Stat properties.
    this.itemCost = this.itemBaseCost;
    this.itemPower = this.itemBasePower;
    this.itemAmt = 0;
    this.itemTrainsPs = 0;
    this.itemTotalTrains = 0;
    this.itemMultiplier = this.itemBaseMultiplier;
    //Unlock properties.
    this.itemReqs = itemReqs;
    this.itemUpgrades = [];
    this.itemParent = itemParent;
    this.itemMultipliers = [];
    this.itemType = (this.itemParent == -1 ? 'Parent' : 'Child');
    //Flag properties.
    this.isUnlocked = 0;
    this.isEnabled = 0;
    this.isVisible = 0;
    //HTML properties.
    this.element;

    this.updateItem = function() {
        var multiplier = 1;
        this.itemUpgrades.forEach(function(i) {
            multiplier = multiplier * i.multiplier;
        });
        var childMultiplier = 1;
        this.itemMultipliers.forEach(function(i) {
            childMultiplier = childMultiplier + (i.multiplier * i.amt);
        });
        if (this.itemType == 'Parent') {
            this.itemPower = this.itemBasePower * multiplier * Game.ascMultiplier * childMultiplier;
            this.itemTrainsPs = this.itemPower * this.itemAmt;
        }
        else if(this.itemType == 'Child') {
            Game.Items[this.itemParent].itemMultipliers[this.itemId] = {childId: this.itemId, amt: this.itemAmt, multiplier: this.itemPower}
            Game.Items[this.itemParent].updateItem();
        }
        
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
        Game.Earn(cost, true);
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
    this.reset = function() {
        this.itemCost = this.itemBaseCost;
        this.itemPower = this.itemBasePower;
        this.itemAmt = 0;
        this.itemTrainsPs = 0;
        this.itemTotalTrains = 0;
        this.itemUpgrades = [];
        this.isUnlocked = 0;
        this.isEnabled = 0;
        this.isVisible = 0;
        this.itemReqs.forEach(function(req) { req.reset() });
        this.unlock();
    };
    this.getTooltip = function() {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);

        if (this.itemType == 'Parent')
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
        else if (this.itemType == 'Child') 
            return '<div id="tooltipItem">' +
                    '<div class="tooltipIcon" style="float:left; background-position:' + this.tooltipIcon.x + 'px ' + this.tooltipIcon.y + 'px;background-image:url(' + this.tooltipIcon.file + ')"></div>' +
                    '<div style="float:right; text-align:right;">' + cost + '</div>' +
                    '<div class="tooltipHeader">' + this.itemName + '</div>' +
                    '<div class="tooltipTag">' + 'owned: ' + this.itemAmt + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipDesc">' + this.itemDesc + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipStats">' + 'Each ' + this.itemName + ' improves ' + Game.Items[this.itemParent].itemName +' efficiency by ' + (this.itemPower * 100) + '%.' + '</div>' +
                    '<div class="tooltipStats">' + 'Current improving efficiency by ' + (this.itemPower * 100) * this.itemAmt + '%.' + '</div>' +
                '</div>'
    };
    this.drawStoreItem = function() {
        if (this.itemType == 'Parent')
            this.drawStoreParent();
        else if(this.itemType == 'Child')
            this.drawStoreChild();
    };
    this.drawStoreParent = function() {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);

        tempElement = el('items').appendChild(document.createElement('div'));
        tempElement.id = 'item' + this.itemId + 'Container';
        tempElement.className = 'itemContainer';
        this.element = tempElement.appendChild(document.createElement('div'));
        this.element.id = 'item' + this.itemId;
        this.element.className = 'item';
        this.element.innerHTML = '<div class="itemIcon" style="float:left; background-position:' + this.itemIcon.x + 'px ' + this.itemIcon.y + 'px;background-image:url(' + this.itemIcon.file + ')"></div>' +
            '<div class="itemContent">' +
                '<div class="itemHeader">' + this.itemName + '</div>' +
                '<div id="item' + this.itemId + 'cost" class="itemDesc">' + cost + '</div>' +
                '<div id="item' + this.itemId + 'qty" class="itemOwned">' + this.itemAmt + '</div>' +
            '</div>'
        this.isVisible = 1;

        this.element.onclick = function() { Game.Buy(itemId, 'Item') };
        this.element.onmousemove = function() { Game.tooltip.drawTooltip(function() {return Game.Items[itemId].getTooltip() }, 'store') };
        this.element.onmouseout =  function() { Game.tooltip.hideTooltip() };
    };
    this.drawStoreChild = function() {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);

        this.element = el('item' + this.itemParent + 'Container').appendChild(document.createElement('div'));
        this.element.id = 'itemChild' + this.itemId;
        this.element.className = 'itemChild';
        this.element.innerHTML = '<div class="itemChildIcon" style="float:left; background-position:' + this.itemIcon.x + 'px ' + this.itemIcon.y + 'px;background-image:url(' + this.itemIcon.file + ')"></div>' +
            '<div class="itemChildContent">' +
                '<div class="itemChildHeader">' + this.itemName + ' - ' + cost + '</div>' +
                '<div id="item' + this.itemId + 'qty" class="itemChildOwned">' + this.itemAmt + '</div>' +
            '</div>'
        this.isVisible = 1;

        this.element.onclick = function() { Game.Buy(itemId, 'ItemChild') };
        this.element.onmousemove = function() { Game.tooltip.drawTooltip(function() {return Game.ItemChildren[itemId].getTooltip() }, 'store') };
        this.element.onmouseout =  function() { Game.tooltip.hideTooltip() };
    };
    this.clearStoreItem = function() {
        if (this.element != null) {
            this.element.remove();
            this.element = null;
        }
    };
    this.refresh = function () {
        if (this.itemType == 'Parent')
            this.refreshParent();
        else if(this.itemType == 'Child')
            this.refreshChild();
    };
    this.refreshParent = function() {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);
        this.cost = this.getSumCost(Game.bulkQty);
        this.element.innerHTML = '<div class="itemIcon" style="float:left; background-position:' + this.itemIcon.x + 'px ' + this.itemIcon.y + 'px;background-image:url(' + this.itemIcon.file + ')"></div>' +
        '<div class="itemContent">' +
            '<div class="itemHeader">' + this.itemName + '</div>' +
            '<div id="item' + this.itemId + 'cost" class="itemDesc">' + cost + '</div>' +
            '<div id="item' + this.itemId + 'qty" class="itemOwned">' + this.itemAmt + '</div>' +
        '</div>'
    };
    this.refreshChild = function() {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);
        this.cost = this.getSumCost(Game.bulkQty);
        this.element.innerHTML = '<div class="itemChildIcon" style="float:left; background-position:' + this.itemIcon.x + 'px ' + this.itemIcon.y + 'px;background-image:url(' + this.itemIcon.file + ')"></div>' +
        '<div class="itemChildContent">' +
            '<div class="itemChildHeader">' + this.itemName + ' - ' + cost + '</div>' +
            '<div id="item' + this.itemId + 'qty" class="itemChildOwned">' + this.itemAmt + '</div>' +
        '</div>'
    };
    if (this.itemType == 'Parent')
        Game.Items.push(this);
    else if (this.itemType == 'Child')
        Game.ItemChildren.push(this);
}