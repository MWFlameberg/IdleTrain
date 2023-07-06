Game.ItemUpgrades = [];
Game.ItemUpgrade = function(id, name, desc, extDesc, bCost,
                        iFile, iCoords, ttiFile, ttiCoords,
                        upgrades, reqs) {
    //General purpose properties.
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.extDesc = extDesc;
    this.iFile = iFile;
    this.iCoords = iCoords;
    this.ttiFile = ttiFile;
    this.ttiCoords = ttiCoords;
    //Base stat properties.
    this.bCost = bCost;
    this.cost = this.bCost;
    this.upgrades = upgrades;
    //Unlock properties.
    this.reqs = reqs;
    //Flag properties.
    this.unlocked = 0;
    this.visible = 0;

    this.buy = function() {
        var success = 0;
        if (Game.TP >= this.cost) {
            Game.TP -= this.cost;
            this.applyUpgrade();
            this.unlocked = 1;
            this.visible = 0;
            el('upgrade' + this.id).remove();
            Game.tooltip.hide();
            success = 1;
        }
        return success;
    };
    this.applyUpgrade = function() {
        for(let i = 0; i < this.upgrades.length; i++) {
            Game.ItemThings[this.upgrades[i].item].upgrade(this.upgrades[i].mult);
        }
    }
    this.unlock = function() {
        if (this.unlocked == 1) {
            return 0;
        }
        var unlockable = 1;
        for(let i = 0; i < this.reqs.length; i++) {
            if (Game.ItemThings[this.reqs[i].item].qty < this.reqs[i].qty) {
                unlockable = 0;
            }
        }
        if (unlockable == 1) {
            this.unlocked = 1;
        }
        return unlockable;
    }
    this.getTooltip = function() {
        return '<div id="tooltipItem">' +
                '<div class="tooltipIcon" style="float:left; background-position:' + this.ttiCoords.x + 'px ' + this.ttiCoords.y + 'px;background-image:url(' + this.ttiFile + ')"></div>' +
                '<div style="float:right; text-align:right;">' + this.cost + '</div>' +
                '<div class="tooltipHeader">' + this.name + '</div>' +
                '<div class="tooltipShortLine"></div>' +
                '<div class="tooltipDesc">' + this.desc + '</div>' +
            '</div>'
    };
    this.drawStoreItem = function() {
        var container = el('upgrades').appendChild(document.createElement('div'));
        container.id = 'upgrade' + this.id;
        container.className = 'upgradeItem';
        container.innerHTML = '<div class="upgradeIcon" style="float:left; background-position:' + this.iCoords.x + 'px ' + this.iCoords.y + 'px;background-image:url(' + this.iFile + ')"></div>'
        this.visible = 1;
        return container;
    }
    Game.ItemUpgrades.push(this);
}