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
    this.isDynamic = 0;
    //HTML properties.
    this.uiElement = null;
    //Functions
    this.resetObject = function() {
        this.isUnlocked = 0;
        this.isEnabled = 0;
        this.isVisible = 0;
        this.isDynamic = 0;
        this.amt = 0;
    };
    this.clear = function() {
        this.resetObject();
        if (this.uiElement != null) {
            this.uiElement.remove();
            this.uiElement = null;
        }
    };
    this.enable = function() {
        this.uiElement.enable();
        this.isEnabeled = 1;
    };
    this.disable = function() {
        this.uiElement.disable();
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
    this.baseDiscountMult = 1.0;
    //Up to Date Stat properties.
    this.currentCost = this.baseCost;
    this.currentCostMult = this.baseCostMult;
    this.currentDiscountMult = this.baseDiscountMult;
    this.currentDiscountCost = this.currentCost * this.currentDiscount;
    //Prereq Collection properties.
    this.unlockReqs = unlockReqs;
    //Functions
    var parentResetObject = this.resetObject;
    this.resetObject = function() {
        parentResetObject.call(this);

        this.currentCost = this.baseCost;
        this.currentCostMult = this.baseCostMult;
        this.baseDiscountMult = this.baseDiscountMult;
        this.currentDiscountCost = this.currentCost * this.currentDiscountMult;
        this.unlockReqs.forEach(function(i) { i.reset() });
        this.unlock();
    };
    this.update = function() {
        this.currentCost = this.getBuyCost(1);
        this.currentDiscountCost = this.currentCost * this.currentDiscountMult
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
        if (amt == -1) { amt = this.getBuyAmt() };
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
        if (amt == -1) { amt = this.amt; };
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
    var prevBuyAmt = 1;
    this.getBuyAmt = function () {
        var cost = 0;
        var i = this.amt;
        while (true) {
            var costToAdd = Math.ceil(this.baseCost * this.currentDiscountMult * Math.pow(this.currentCostMult, i));
            if (cost + costToAdd > Game.trains)
                break;
            else  
                cost += costToAdd;
            i++;
        }
        i -= this.amt;
        if (prevBuyAmt != i) { Game.refresh = 1};
        if (i == 0) { i = 1 };
        prevBuyAmt = i;
        return prevBuyAmt;
    }
    this.getBuyCost = function(amt) {
        var cost = 0;
        if (amt == -1) {
            amt = this.getBuyAmt();
        }
        for (var i = this.amt; i < this.amt + amt; i++) {
            cost += Math.ceil(this.baseCost * this.currentDiscountMult * Math.pow(this.currentCostMult, i));
        }
        
        return cost;
    };
    this.getSellCost = function(amt) {
        if (this.amt == 0) { return 0; };
        if (amt == -1) { amt = this.amt; };
        if (amt > this.amt) { amt = this.amt; };
        var cost = 0;
        var i = amt;
        do {
            cost += Math.ceil(this.baseCost * this.currentDiscountMult * Math.pow(this.currentCostMult, this.amt - 1) * 0.6);
            i--;
        } while (i > this.amt - amt)
        return cost;
    };
    this.getCurrentCost = function() {
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
    this.basePowerMult = 1;
    //Up to Date Stat properties.
    this.currentPower = this.basePower;
    this.currentPowerBonus = 0;
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

        this.subItems.forEach(function(i) {
            i.resetObject();
        });
        this.currentPower = this.basePower;
        this.currentPowerBonus = 0;
        this.currentPowerMult = this.basePowerMult;
        this.trainsEarned = 0;
        this.trainsPs = 0;
    };
    var parentUpdate = this.update;
    this.update = function() {
        var upgPowerMult = 1;
        this.upgrades.forEach(function(i) {
            upgPowerMult *= i.mult;
        });
        var subPowerBonus = 0;
        var subPowerMult = 1;
        var subDiscountMult = 1;
        this.subItems.forEach(function(i) {
            subPowerBonus += i.currentPowerBonus;
            subPowerMult += i.currentPowerMult;
            subDiscountMult *= i.currentDiscountMult;
        });

        this.currentDiscountMult = subDiscountMult
        this.currentPowerBonus = subPowerBonus;
        this.currentPowerMult = upgPowerMult * subPowerMult;
        this.currentPower = (this.basePower + this.currentPowerBonus) * this.currentPowerMult * 1 * Game.ascMultiplier;
        this.trainsPs = this.currentPower * this.amt

        parentUpdate.call(this);
    };
    this.drawTooltip = function() {
        return '<div id="tooltipItem">' +
                    '<div class="tooltipIcon" style="float:left; background-position:' + this.tooltipIcon.xCoord + 'px ' + this.tooltipIcon.yCoord + 'px;background-image:url(' + this.tooltipIcon.file + ')"></div>' +
                    '<div style="float:right; text-align:right;">' + formatNum(this.getCurrentCost(), 0) + '</div>' +
                    '<div class="tooltipHeader">' + this.name + '</div>' +
                    '<div class="tooltipTag">' + 'owned: ' + formatNum(this.amt, 0) + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipDesc">' + this.desc1 + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipStats">' + 'Each ' + this.name + ' generates ' + formatNum(this.currentPower, 1) + ' per second.' + '</div>' +
                    '<div class="tooltipStats">' + formatNum(this.amt, 0) + ' ' + this.name + ' generating ' + formatNum(this.trainsPs, 1) + ' per second.' + '</div>' +
                    '<div class="tooltipStats">' + formatNum(this.trainsEarned, 1) + ' generated so far' + '</div>' +
                '</div>'
    };
    Game.StoreItems.push(this);
};
StoreTrainLine = function(id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs, basePower, baseSpeed) {
    //Parent calls.
    this.prototype = StoreObject;
    StoreObject.call(this, id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs);
    //Base Stat properties.
    this.basePower = basePower;
    this.basePowerMult = 1;
    this.baseSpeed = baseSpeed;
    this.baseSpeedMult = 1;
    //Up to Date Stat properties.
    this.currentPower = this.basePower;
    this.currentPowerBonus = 0;
    this.currentPowerMult = this.basePowerMult;
    this.currentSpeed = this.baseSpeed;
    this.currentSpeedMult = this.baseSpeedMult;
    this.currentStart = -1;
    //Child Collection properties.
    this.upgrades = [];
    this.subItems = [];
    //Tracking properties.
    this.trainsEarned = 0;
    this.trainsPs = 0;
    //Flag properties.
    this.isDynamic = 1;
    //Functions
    var parentResetObject = this.resetObject;
    this.resetObject = function() {
        parentResetObject.call(this);

        this.subItems.forEach(function(i) {
            i.resetObject();
        });
        this.currentPower = this.basePower;
        this.currentPowerBonus = 0;
        this.currentPowerMult = this.basePowerMult;
        this.currentSpeed = this.baseSpeed;
        this.currentSpeedMult = this.baseSpeedMult;
        this.currentStart = -1;
        this.trainsEarned = 0;
        this.trainsPs = 0;
    };
    var parentUpdate = this.update;
    this.update = function() {
        var upgPowerMult = 1;
        this.upgrades.forEach(function(i) {
            upgPowerMult *= i.mult;
        });
        var subPowerMult = 1;
        var subPowerBonus = 0;
        var subSpeedMult = 1;
        var subDiscountMult = 1;
        this.subItems.forEach(function(i) {
            subPowerMult += i.currentPowerMult;
            subPowerBonus += i.currentPowerBonus;
            subSpeedMult *= i.currentSpeedMult;
            subDiscountMult *= i.currentDiscountMult;
        });

        this.currentDiscountMult = subDiscountMult;
        this.currentPowerBonus = subPowerBonus;
        this.currentPowerMult = upgPowerMult * subPowerMult;
        this.currentPower = (this.basePower + this.currentPowerBonus) * this.currentPowerMult * 1 * Game.ascMultiplier;
        this.currentSpeedMult = subSpeedMult;
        this.currentSpeed = this.baseSpeed * this.currentSpeedMult * 1;
        this.trainsPs = this.currentPower * this.amt;

        parentUpdate.call(this);
    };
    this.checkTimeElapse = function() {
        if (this.amt <= 0) 
            return 0;
        else if (this.currentStart < 0) {
            this.currentStart = Date.now();
            return 0;
        }
        else if (Date.now() - this.currentStart >= this.currentSpeed)
            return 1;
    }
    this.drawTooltip = function() {
        return '<div id="tooltipItem">' +
                    '<div class="tooltipIcon" style="float:left; background-position:' + this.tooltipIcon.xCoord + 'px ' + this.tooltipIcon.yCoord + 'px;background-image:url(' + this.tooltipIcon.file + ')"></div>' +
                    '<div style="float:right; text-align:right;">' + formatNum(this.getCurrentCost(), 0) + '</div>' +
                    '<div class="tooltipHeader">' + this.name + '</div>' +
                    '<div class="tooltipTag">' + 'owned: ' + formatNum(this.amt, 0) + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipDesc">' + this.desc1 + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipStats">' + 'Each ' + this.name + ' generates ' + formatNum(this.currentPower, 1) + ' per second.' + '</div>' +
                    '<div class="tooltipStats">' + formatNum(this.amt, 0) + ' ' + this.name + ' generating ' + formatNum(this.trainsPs, 1) + ' per second.' + '</div>' +
                    '<div class="tooltipStats">' + formatNum(this.trainsEarned, 1) + ' generated so far' + '</div>' +
                '</div>'
    };
    this.drawStoreItem = function() {
        var itemContainer = el('trainLines').appendChild(document.createElement('div'));
        itemContainer.id = 'trainLine' + this.id1 + 'Container';
        itemContainer.className = 'itemContainer';
        this.uiElement = itemContainer.appendChild(document.createElement('div'));
        this.uiElement.id = 'trainLine' + this.id1;
        this.uiElement.className = 'trainLine';
        this.uiElement.innerHTML = '<div class="trainLineIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yCoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
            '<div class="trainLineContent">' +
                '<div class="itemHeader">' + this.name + ' - ' + formatNum(this.getCurrentCost(), 0) + '</div>' +
                '<div id="item' + this.id1 + 'qty" class="trainLineOwned">' + formatNum(this.amt, 0) + '</div>' +
            '</div>' + 
            '<div id="trainLineBarContainer" class="barContainer">' + 
                '<div id="trainLine' + this.id1 + 'Bar" class="bar"></div>' + 
            '</div>'
        this.isVisible = 1;
        this.uiElement.onclick = function() { Game.Buy(id1, id2, 'Line') };
        this.uiElement.onmousemove = function() { Game.tooltip.drawTooltip(function() {return Game.StoreTrainLines[id1].drawTooltip() }, 'store') };
        this.uiElement.onmouseout =  function() { Game.tooltip.hideTooltip() };
    };
    this.refreshStoreItem = function () {
        this.uiElement.innerHTML = '<div class="trainLineIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yCoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
            '<div class="trainLineContent">' +
                '<div class="itemHeader">' + this.name + ' - ' + formatNum(this.getCurrentCost(), 0) + '</div>' +
                '<div id="item' + this.id1 + 'qty" class="trainLineOwned">' + formatNum(this.amt, 0) + '</div>' +
            '</div>' + 
            '<div id="trainLineBarContainer" class="barContainer">' + 
                '<div id="trainLine' + this.id1 + 'Bar" class="bar"></div>' + 
            '</div>'
    };
    Game.StoreTrainLines.push(this);
};
StoreSubObject = function(id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs, basePowerMult, basePowerBonus, baseSpeedMult, baseDiscountMult) {
    //Parent calls.
    this.prototype = StoreObject;
    StoreObject.call(this, id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs);
    //Base Stat properties.
    this.basePowerMult = basePowerMult;
    this.basePowerBonus = basePowerBonus;
    this.baseSpeedMult = baseSpeedMult;
    this.baseDiscountMult = baseDiscountMult;
    //Up to Date Stat properties.
    this.currentPowerMult = 0;
    this.currentPowerBonus = 0;
    this.currentSpeedMult = 1;
    this.currentDiscountMult = 1;
    //Functions
    var parentResetObject = this.resetObject;
    this.resetObject = function() {
        parentResetObject.call(this);

        this.currentPowerMult = 0;
        this.currentSpeedMult = 1;
        this.currentDiscountMult = 1;
    };
    var parentUpdate = this.update;
    this.update = function() {
        this.currentPowerMult = this.basePowerMult * this.amt;
        this.currentPowerBonus = this.basePowerBonus * this.amt;
        this.currentSpeedMult =  Math.pow(this.baseSpeedMult, this.amt);
        this.currentDiscountMult = Math.pow(this.baseDiscountMult, this.amt);

        parentUpdate.call(this);
    };
};
StoreSubItem = function(id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs, basePowerMult, basePowerBonus, baseSpeedMult, baseDiscountMult) {
    //Parent calls.
    this.prototype = StoreSubObject;
    StoreSubObject.call(this, id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs, basePowerMult, basePowerBonus, baseSpeedMult, baseDiscountMult);
    //Functions
    var parentUpdate = this.update;
    this.update = function() {
        parentUpdate.call(this);

        Game.StoreItems[id2].update();
    };
    this.drawTooltip = function() {
        var toolTip = '<div id="tooltipItem">' +
                    '<div class="tooltipIcon" style="float:left; background-position:' + this.tooltipIcon.xCoord + 'px ' + this.tooltipIcon.yCoord + 'px;background-image:url(' + this.tooltipIcon.file + ')"></div>' +
                    '<div style="float:right; text-align:right;">' + formatNum(this.getCurrentCost(), 0) + '</div>' +
                    '<div class="tooltipHeader">' + this.name + '</div>' +
                    '<div class="tooltipTag">' + 'owned: ' + this.amt + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipDesc">' + this.desc1 + '</div>' +
                    '<div class="tooltipLine"></div>'
        if (this.basePowerMult != 0) {
            toolTip += '<div class="tooltipStats">' + 'Each ' + this.name + ' improves ' + Game.StoreItems[this.id2].name +' strength by ' + formatNum((this.basePowerMult * 100), 2) + '%.' + '</div>' +
                                    '<div class="tooltipStats">' + 'Currently improving strength by ' + formatNum((this.currentPowerMult * 100), 2) + '%.' + '</div>'
        }
        if (this.baseSpeedMult != 1) {
            toolTip += '<div class="tooltipStats">' + 'Each ' + this.name + ' improves ' + Game.StoreItems[this.id2].name +' speed by ' + formatNum(((1 - this.baseSpeedMult) * 100), 2) + '%.' + '</div>' +
                                    '<div class="tooltipStats">' + 'Currently improving speed by ' +  formatNum(((1 - this.currentSpeedMult) * 100), 2) + '%.' + '</div>'
        }
        if (this.baseDiscountMult != 1) {
            toolTip += '<div class="tooltipStats">' + 'Each ' + this.name + ' reduces ' + Game.StoreItems[this.id2].name +' cost by ' + formatNum(((1 - this.baseDiscountMult) * 100), 2) + '%.' + '</div>' +
                                    '<div class="tooltipStats">' + 'Currently reducing cost by ' + formatNum(((1 - this.currentDiscountMult) * 100), 2) + '%.' + '</div>'
        }
                    
        toolTip += '</div>'
        return toolTip;
    };
    Game.StoreItems[id2].subItems.push(this);
};
StoreSubTrainLine = function(id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs, basePowerMult, basePowerBonus, baseSpeedMult, baseDiscountMult) {
    //Parent calls.
    this.prototype = StoreSubObject;
    StoreSubObject.call(this, id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs, basePowerMult, basePowerBonus, baseSpeedMult, baseDiscountMult);
    //Functions
    var parentUpdate = this.update;
    this.update = function() {
        parentUpdate.call(this);

        Game.StoreTrainLines[id2].update();
    };
    this.drawTooltip = function() {
        var toolTip = '<div id="tooltipItem">' +
                    '<div class="tooltipIcon" style="float:left; background-position:' + this.tooltipIcon.xCoord + 'px ' + this.tooltipIcon.yCoord + 'px;background-image:url(' + this.tooltipIcon.file + ')"></div>' +
                    '<div style="float:right; text-align:right;">' + formatNum(this.getCurrentCost(), 0) + '</div>' +
                    '<div class="tooltipHeader">' + this.name + '</div>' +
                    '<div class="tooltipTag">' + 'owned: ' + this.amt + '</div>' +
                    '<div class="tooltipLine"></div>' +
                    '<div class="tooltipDesc">' + this.desc1 + '</div>' +
                    '<div class="tooltipLine"></div>'
        if (this.basePowerMult != 0) {
            toolTip += '<div class="tooltipStats">' + 'Each ' + this.name + ' improves ' + Game.StoreTrainLines[this.id2].name +' strength by ' + formatNum((this.basePowerMult * 100), 2) + '%.' + '</div>' +
                        '<div class="tooltipStats">' + 'Currently improving strength by ' + formatNum((this.currentPowerMult * 100), 2) + '%.' + '</div>'
        }
        if (this.baseSpeedMult != 1) {
            toolTip += '<div class="tooltipStats">' + 'Each ' + this.name + ' improves ' + Game.StoreTrainLines[this.id2].name +' speed by ' + formatNum(((1 - this.baseSpeedMult) * 100), 2) + '%.' + '</div>' +
                        '<div class="tooltipStats">' + 'Currently improving speed by ' +  formatNum(((1 - this.currentSpeedMult) * 100), 2) + '%.' + '</div>'
        }
        if (this.baseDiscountMult != 1) {
            toolTip += '<div class="tooltipStats">' + 'Each ' + this.name + ' reduces ' + Game.StoreTrainLines[this.id2].name +' cost by ' + formatNum(((1 - this.baseDiscountMult) * 100), 2) + '%.' + '</div>' +
                        '<div class="tooltipStats">' + 'Currently reducing cost by ' + formatNum(((1 - this.currentDiscountMult) * 100), 2) + '%.' + '</div>'
        }
                    
        toolTip += '</div>'
        return toolTip;
    };
    this.drawStoreItem = function() {
        this.uiElement = el('trainLine' + this.id2 + 'Container').appendChild(document.createElement('div'));
        this.uiElement.id = 'itemChild' + this.id1;
        this.uiElement.className = 'itemChild';
        this.uiElement.innerHTML = '<div class="itemChildIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yYoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
            '<div class="itemChildContent">' +
                '<div class="itemChildHeader">' + this.name + ' - ' + formatNum(this.getCurrentCost(), 0) + '</div>' +
                '<div id="item' + this.id + 'qty" class="itemChildOwned">' + formatNum(this.amt, 0) + '</div>' +
            '</div>'
        this.isVisible = 1;

        this.uiElement.onclick = function() { Game.Buy(id1, id2, 'SubLine') };
        this.uiElement.onmousemove = function() { Game.tooltip.drawTooltip(function() {return Game.StoreTrainLines[id2].subItems[id1].drawTooltip() }, 'store') };
        this.uiElement.onmouseout =  function() { Game.tooltip.hideTooltip() };
    };
    this.draw
    this.refreshStoreItem = function () {
        this.uiElement.innerHTML = '<div class="itemChildIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yCoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
        '<div class="itemChildContent">' +
            '<div class="itemChildHeader">' + this.name + ' - ' + formatNum(this.getCurrentCost(), ) + '</div>' +
            '<div id="item' + this.id + 'qty" class="itemChildOwned">' + formatNum(this.amt, 0) + '</div>' +
        '</div>'
    };
    Game.StoreTrainLines[id2].subItems.push(this);
};
StoreUpgrade = function(id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs, upgradeItems) {
    //Parent calls.
    this.prototype = StoreObject;
    StoreObject.call(this, id1, id2, name, desc1, desc2, icon, tooltipIcon, baseCost, baseCostMult, unlockReqs);
    //Child Collection properties.
    this.upgradeItems = upgradeItems;
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
        this.upgradeItems.forEach(function(i) {
            if (i.type == 'Clicks') {
                Game.Clicker.clickUpgrades.push({id: this.id, mult: i.mult})
                Game.Clicker.updateClick();
            }
            else if (i.type == 'Items') {
                Game.StoreItems[i.id].upgrades.push({id: this.id, mult: i.mult})
                Game.StoreItems[i.id].update();
            }
            else if (i.type == 'Lines') {
                Game.StoreTrainLines[i.id].upgrades.push({id: this.id, mult: i.mult})
                Game.StoreTrainLines[i.id].update();
            }
        });
        if (this.uiElement != null) {
            this.uiElement.remove();
            this.uiElement = null;
        }
        parentUpdate.call(this);
    };
    this.buy = function(amt) {
        var success = 0;
        if(Game.trains >= this.getBuyCost(1)) {
            Game.Spend(this.getBuyCost(1));
            this.amt += amt;
            this.update();
            Game.tooltip.hideTooltip();
            success = 1;
        }
        return success;
    };
    this.canBuy = function(amt) {
        return Game.trains >= this.getBuyCost(1);
    };
    this.drawTooltip = function() {
        return '<div id="tooltipItem">' +
                '<div class="tooltipIcon" style="float:left; background-position:' + this.tooltipIcon.xCoord + 'px ' + this.tooltipIcon.yCoord + 'px;background-image:url(' + this.tooltipIcon.file + ')"></div>' +
                '<div style="float:right; text-align:right;">' + this.getCurrentCost() + '</div>' +
                '<div class="tooltipHeader">' + this.name + '</div>' +
                '<div class="tooltipShortLine"></div>' +
                '<div class="tooltipDesc">' + this.desc1 + '</div>' +
            '</div>'
    };
    this.drawStoreItem = function() {
        this.uiElement = el('upgrades').appendChild(document.createElement('div'));
        this.uiElement.id = 'upgrade' + this.id1;
        this.uiElement.className = 'item disabled';
        this.uiElement.innerHTML = '<div class="itemIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yCoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
        '<div class="itemContent">' +
            '<div class="itemHeader">' + this.name + '</div>' +
            '<div id="item' + this.id + 'cost" class="itemDesc">' + formatNum(this.getCurrentCost(), 0) + '</div>' +
        '</div>'
        this.isVisible = 1;

        this.uiElement.onclick = function() { Game.Buy(id1, id2, 'Upgrade') };
        this.uiElement.onmousemove = function() { Game.tooltip.drawTooltip(function() {return Game.StoreUpgrades[id1].drawTooltip() }, 'store') };
        this.uiElement.onmouseout =  function() { Game.tooltip.hideTooltip() };
    };
    this.getCurrentCost = function() {
        return this.getBuyCost(1);
    }
    Game.StoreUpgrades.push(this);
};
Achievement = function(id1, id2, name, desc1, desc2, icon, tooltipIcon, unlockReqs) {
    //Parent calls.
    this.prototype = BaseObject;
    BaseObject.call(this, id1, id2, name, desc1, desc2, icon, tooltipIcon);
    //Prereq Collection properties.
    this.unlockReqs = unlockReqs;
    //Functions
    this.unlock = function() {
        if (this.isUnlocked == 1) { return 0; }
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
    this.createAlert = function() {
        var content = '<div class="notificationIcon" style="float:left; background-position:' + this.icon.xCoord + 'px ' + this.icon.yCoord + 'px;background-image:url(' + this.icon.file + ')"></div>' +
        '<div class="notificationContent">' +
            '<div class="notificationHeader">' + this.name + '</div>' +
        '</div>'
        new GameAlert(64, content, this);
    };
    Game.Achievements.push(this);
};