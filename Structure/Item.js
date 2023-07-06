Game.ItemThings = [];
Game.ItemThing = function(id, name, desc, extDesc, bCost, bPower, bCostMult, 
                        iFile, iCoords, ttiFile, ttiCoords, reqs) {
    //General purpose properties.
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.extDesc = extDesc;
    this.iFile = iFile;
    this.iCoords = iCoords;
    this.ttiFile = ttiFile;
    this.ttiCoords = ttiCoords;
    //Stat properties.
    this.bCost = bCost;
    this.bPower = bPower;
    this.bCostMult = bCostMult;
    this.cost = this.bCost;
    this.power = this.bPower;
    this.qty = 0;
    this.powerMult = 1;
    //Unlock properties.
    this.reqs = reqs;
    //Flag properties.
    this.unlocked = 0;
    this.visible = 0;

    this.tps = 0;
    this.totalTP = 0;

    this.buy = function(qty) {
        var success = 0;
        for (var i = 0; i < qty; i++) {
            var cost = this.getCost();
            if (Game.TP >= cost) {
                Game.TP -= cost;
                this.qty++;
                this.cost = this.getCost();
                this.update();
                success = 1;
            }
        }
        return success;
    };
    this.upgrade = function(mult) {
        this.powerMult *= mult;
        this.update();
    };
    this.getCost = function() {
        var cost = this.bCost * Math.pow(this.bCostMult, this.qty);
        return Math.ceil(cost);
    };
    this.getSumCost = function(qty) {
        var cost = 0;
        for (var i = this.qty; i < this.qty + qty; i++) {
            cost += this.bCost * Math.pow(this.bCostMult, i)
        }
        return Math.ceil(cost);
    };
    this.unlock = function() {
        if (this.unlocked == 1) {
            return 0;
        }
        var unlockable = 1;
        for(let i = 0; i < this.reqs.length; i++) {
            if (this.reqs[i].item == -1) {
                if (Game.LTTP < this.reqs[i].qty) {
                    unlockable = 0;
                }
            }
            else
            {
                if (Game.ItemThings[this.reqs[i].item].qty < this.reqs[i].qty) {
                    unlockable = 0;
                }
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
                '<div style="float:right; text-align:right;">' + this.getCost() + '</div>' +
                '<div class="tooltipHeader">' + this.name + '</div>' +
                '<div class="tooltipTag">' + 'owned: ' + this.qty + '</div>' +
                '<div class="tooltipLine"></div>' +
                '<div class="tooltipDesc">' + this.desc + '</div>' +
                '<div class="tooltipLine"></div>' +
                '<div class="tooltipStats">' + 'Each ' + this.name + ' generates ' + this.power + ' per second.' + '</div>' +
                '<div class="tooltipStats">' + this.qty + ' ' + this.name + ' generating ' + this.tps + ' per second.' + '</div>' +
                '<div class="tooltipStats">' + Math.floor(this.totalTP) + ' generated so far' + '</div>' +
            '</div>'
    };
    this.drawStoreItem = function() {
        var container = el('items').appendChild(document.createElement('div'));
        container.id = 'item' + this.id;
        container.className = 'storeItem';
        container.innerHTML = '<div class="storeIcon" style="float:left; background-position:' + this.iCoords.x + 'px ' + this.iCoords.y + 'px;background-image:url(' + this.iFile + ')"></div>' +
            '<div class="storeContent">' +
                '<div class="storeHeader">' + this.name + '</div>' +
                '<div id="item' + id + 'cost" class="storeDesc">' + this.getCost() + '</div>' +
                '<div id="item' + id + 'qty" class="storeOwned">' + this.qty + '</div>' +
            '</div>'
        this.visible = 1;
        return container;
    };
    this.update = function() {
        this.power = Math.round(((this.bPower * this.powerMult)) * 100) / 100;
        this.tps = Math.round(((this.power * this.qty)) * 100) / 100;
    };
    this.tick = function() {
        this.totalTP += Math.round(((this.tps / 10)) * 100) / 100;
        Game.TP += Math.round(((this.tps / 10)) * 100) / 100;
        Game.LTTP += Math.round(((this.tps / 10)) * 100) / 100;
    };
    Game.ItemThings.push(this);
}