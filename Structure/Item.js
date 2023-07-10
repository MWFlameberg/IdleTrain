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
    this.enabled = 0;
    //HTML properties.
    this.element;
    //Historical properties.
    this.tps = 0;
    this.totalTP = 0;

    this.canBuy = function(qty) {
        var success = 0;
        var cost = this.getSumCost(qty);
        if (Game.TP >= cost) {
            success = 1;
        }
        return success;
    };
    this.buy = function(qty) {
        var success = 0;
        var cost = this.getSumCost(qty);
        if (Game.TP >= cost) {
            Game.TP -= cost;
            this.qty += qty;
            this.cost = this.getCost(1);
            this.update();
            success = 1;
        }
        return success;
    };
    this.sell = function(qty) {
        if (qty > this.qty) {
            qty = this.qty;
        };
        var cost = this.getSumSell(qty);
        this.qty -= qty;
        Game.TP += cost;
    };
    this.upgrade = function(mult) {
        this.powerMult *= mult;
        this.update();
    };
    this.getCost = function() {
        var cost = Math.ceil(this.bCost * Math.pow(this.bCostMult, this.qty));
        return cost;
    };
    this.getSumCost = function(qty) {
        var cost = 0;
        for (var i = this.qty; i < this.qty + qty; i++) {
            cost += Math.ceil(this.bCost * Math.pow(this.bCostMult, i));
        }
        return cost;
    };
    this.getSumSell = function(qty) {
        if (this.qty == 0) { return 0; };
        if (qty > this.qty) { qty = this.qty; };
        var cost = 0;
        var i = qty;
        do {
            cost += Math.ceil(this.bCost * Math.pow(this.bCostMult, this.qty - 1) * 0.6);
            i--;
        } while (i > this.qty - qty)
        return cost;
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
    };
    this.getTooltip = function() {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);

        return '<div id="tooltipItem">' +
                '<div class="tooltipIcon" style="float:left; background-position:' + this.ttiCoords.x + 'px ' + this.ttiCoords.y + 'px;background-image:url(' + this.ttiFile + ')"></div>' +
                '<div style="float:right; text-align:right;">' + cost + '</div>' +
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
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);

        this.element = el('items').appendChild(document.createElement('div'));
        this.element.id = 'item' + this.id;
        this.element.className = 'storeItem';
        this.element.innerHTML = '<div class="storeIcon" style="float:left; background-position:' + this.iCoords.x + 'px ' + this.iCoords.y + 'px;background-image:url(' + this.iFile + ')"></div>' +
            '<div class="storeContent">' +
                '<div class="storeHeader">' + this.name + '</div>' +
                '<div id="item' + this.id + 'cost" class="storeDesc">' + cost + '</div>' +
                '<div id="item' + this.id + 'qty" class="storeOwned">' + this.qty + '</div>' +
            '</div>'
        this.visible = 1;

        this.element.onclick = function() { Game.Buy(id, 'Item') };
        this.element.onmousemove = function() { Game.tooltip.drawTooltip(function() {return Game.ItemThings[id].getTooltip() }, 'store') };
        this.element.onmouseout =  function() { Game.tooltip.hideTooltip() };
    };
    this.refresh = function () {
        var cost = 0;
        if (Game.bulkMode == 1) cost =this.getSumCost(Game.bulkQty);
        else if (Game.bulkMode == 2) cost = this.getSumSell(Game.bulkQty);
        this.cost = this.getSumCost(Game.bulkQty);
        this.element.innerHTML = '<div class="storeIcon" style="float:left; background-position:' + this.iCoords.x + 'px ' + this.iCoords.y + 'px;background-image:url(' + this.iFile + ')"></div>' +
            '<div class="storeContent">' +
                '<div class="storeHeader">' + this.name + '</div>' +
                '<div id="item' + this.id + 'cost" class="storeDesc">' + cost + '</div>' +
                '<div id="item' + this.id + 'qty" class="storeOwned">' + this.qty + '</div>' +
            '</div>'
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