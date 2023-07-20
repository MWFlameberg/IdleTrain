Game.ItemUpgrades = [];
ItemUpgrade = function(upgradeId, upgradeName, upgradeDesc, upgradeExtraDesc, upgradeIcon, tooltipIcon,
                            upgradeBaseCost, upgradeItems, upgradeReqs) {
    //Upgrade Appearance properties.
    this.upgradeId = upgradeId;
    this.upgradeName = upgradeName;
    this.upgradeDesc = upgradeDesc;
    this.upgradeExtraDesc = upgradeExtraDesc;
    this.upgradeIcon = upgradeIcon;
    this.tooltipIcon = tooltipIcon;
    //Base Stat properties.
    this.upgradeBaseCost = upgradeBaseCost;
    //Unlock properties.
    this.upgradeReqs = upgradeReqs;
    this.upgradeItems = upgradeItems;
    //Flag properties.
    this.isUnlocked = 0;
    this.isEnabled = 0;
    this.isVisible = 0;
    //HTML properties.
    this.element;

    this.canBuyUpgrade = function(amt) {
        var success = 0;
        if (Game.trains >= this.upgradeBaseCost) {
            success = 1;
        }
        return success;
    };
    this.buyUpgrade = function(amt) {
        var success = 0;
        if (Game.trains >= this.upgradeBaseCost) {
            Game.Spend(this.upgradeBaseCost);
            this.applyUpgrade();
            this.isVisible = 0;
            Game.tooltip.hideTooltip();
            success = 1;
        }
        return success;
    };
    this.applyUpgrade = function() {
        this.upgradeItems.forEach(function(i) {
            if (i.itemId == -1) {
                Game.Clicker.clickUpgrades.push({upgradeId: this.upgradeId, multiplier: i.multiplier})
                Game.Clicker.updateClick();
            }
            else {
                Game.ItemThings[i.itemId].itemUpgrades.push({upgradeId: this.upgradeId, multiplier: i.multiplier})
                Game.ItemThings[i.itemId].updateItem();
            }
        });
    }
    this.unlock = function() {
        if (this.isUnlocked == 1) { return 0; }
        var unlockable = 1;
        this.upgradeReqs.forEach(function(req) {
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
        this.isUnlocked = 0;
        this.isEnabled = 0;
        this.isVisible = 0;
        this.upgradeReqs.forEach(function(req) { req.reset() });
        this.unlock();
    };
    this.getTooltip = function() {
        return '<div id="tooltipItem">' +
                '<div class="tooltipIcon" style="float:left; background-position:' + this.tooltipIcon.x + 'px ' + this.tooltipIcon.y + 'px;background-image:url(' + this.tooltipIcon.file + ')"></div>' +
                '<div style="float:right; text-align:right;">' + this.upgradeBaseCost + '</div>' +
                '<div class="tooltipHeader">' + this.upgradeName + '</div>' +
                '<div class="tooltipShortLine"></div>' +
                '<div class="tooltipDesc">' + this.upgradeDesc + '</div>' +
            '</div>'
    };
    this.drawStoreItem = function() {
        this.element = el('upgrades').appendChild(document.createElement('div'));
        this.element.id = 'upgrade' + this.upgradeId;
        this.element.className = 'upgradeItem';
        this.element.innerHTML = '<div class="upgradeIcon" style="float:left; background-position:' + this.upgradeIcon.x + 'px ' + this.upgradeIcon.y + 'px;background-image:url(' + this.upgradeIcon.file + ')"></div>'
        this.isVisible = 1;

        this.element.onclick = function() { Game.Buy(upgradeId, 'Upgrade') };
        this.element.onmousemove = function() { Game.tooltip.drawTooltip(function() {return Game.ItemUpgrades[upgradeId].getTooltip() }, 'store') };
        this.element.onmouseout =  function() { Game.tooltip.hideTooltip() };
    };
    this.clearStoreItem = function() {
        if (this.element != null) {
            this.element.remove();
            this.element = null;
        }
    };
    Game.ItemUpgrades.push(this);
};