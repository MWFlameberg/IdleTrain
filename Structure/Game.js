function el(id) { return document.getElementById(id); };

var Game = {};
//#region Content Drawing
Game.EnableElement = function(element) { element.classList.add('enabled'); };
Game.DisableElement = function(element) { element.classList.remove('enabled'); };
//#endregion
//#region Data Initialisation
Game.LoadItems = async function() {
    Game.Items = [];
    await $.getJSON('/Data/Items.json', function(response) {
        $.each(response, function(i, item) {
            var reqsTemp = [];
            $.each(item.reqs, function(j, reqs) {
                reqsTemp.push({item: reqs.item, qty: reqs.qty});
            });
            new Game.ItemThing(item.id, item.name, item.desc, item.extDesc,
                                item.stats.bCost, item.stats.bPower, item.stats.bCostMult, 
                                item.iFile, {x: item.iCoords.x, y: item.iCoords.y},
                                item.ttiFile, {x: item.ttiCoords.x, y: item.ttiCoords.y},
                                reqsTemp);
            if (Game.ItemThings[item.id].unlock() == 1) {
                Game.ItemThings[item.id].drawStoreItem();
            }
        });
    });
};
Game.LoadUpgrades = async function() {
    Game.Upgrades = [];
    await $.getJSON('/Data/Upgrades.json', function(response) {
        $.each(response, function(i, upgrade) {
            var upgradesTemp = [];
            $.each(upgrade.upgrades, function(j, upgrades) {
                upgradesTemp.push({item: upgrades.item, mult: upgrades.mult});
            });
            var reqsTemp = [];
            $.each(upgrade.reqs, function(j, reqs) {
                reqsTemp.push({item: reqs.item, qty: reqs.qty});
            });
            new Game.ItemUpgrade(upgrade.id, upgrade.name, upgrade.desc, 
                                upgrade.extDesc, upgrade.bCost, 
                                upgrade.iFile, {x: upgrade.iCoords.x, y: upgrade.iCoords.y},
                                upgrade.ttiFile, {x: upgrade.ttiCoords.x, y: upgrade.ttiCoords.y},
                                upgradesTemp, reqsTemp);
        });
    });
};
//#endregion
Game.UpdateTP = function() {
    document.getElementById('total').innerHTML = Math.floor(Game.TP);
};
Game.SubtractPower = function(power) {
    Game.TP -= power;
};
Game.AddPower = function(power) {
    Game.TP += power;
    Game.LTTP += power;
};
Game.ClickTrain = function() {
    Game.AddPower(1);
    Game.UpdateTP();
};
Game.CheckForPurchasable = function() {
    Game.ItemUpgrades.forEach(function(upgrade) {
        if(upgrade.visible == 1) {
            if (upgrade.canBuy() == 1 && upgrade.enabled == 1) {
                Game.EnableElement(el('upgrade' + upgrade.id));
                upgrade.enabled = 0
            }
            else if (upgrade.canBuy() == 0 && upgrade.enabled == 0) {
                Game.DisableElement(el('upgrade' + upgrade.id));
                upgrade.enabled = 1
            }
        }
    });

    if (Game.bulkMode == 1) {
        Game.ItemThings.forEach(function(item) {
            if (item.canBuy(Game.bulkQty) == 1 && item.enabled == 1) {
                Game.EnableElement(el('item' + item.id));
                item.enabled = 0
            }
            else if (item.canBuy(Game.bulkQty) == 0 && item.enabled == 0) {
                Game.DisableElement(el('item' + item.id));
                item.enabled = 1
            }
        });
    }
    else if (Game.bulkMode == 2) {
        Game.ItemThings.forEach(function(item) {
            if (item.qty > 0) {
                Game.EnableElement(el('item' + item.id));
                item.enabled = 0
            }
            else {
                Game.DisableElement(el('item' + item.id));
                item.enabled = 1
            }
        });
    }
    
}
Game.CheckForNewUnlocks = function() {
    Game.ItemUpgrades.forEach(function(upgrade) {
        if (upgrade.unlock() == 1) {
            upgrade.drawStoreItem();
        }
    });
    Game.ItemThings.forEach(function(item) {
        if (item.unlock() == 1) {
            item.drawStoreItem();
        }
    });
};
Game.Buy = function(id, type) {
    if (type == 'Item') {
        if (Game.bulkMode == 1) {
            Game.ItemThings[id].buy(Game.bulkQty)
            Game.refresh = 1;
        }
        else if (Game.bulkMode == 2) {
            Game.ItemThings[id].sell(Game.bulkQty)
                Game.refresh = 1;
        }
    }
    else if (type == 'Upgrade') {
        Game.ItemUpgrades[id].buy()
        Game.refresh = 1;
    }

    Game.CheckForNewUnlocks();
    Game.RecalcTPS();
};
//#region Tooltips
Game.tooltip = {};
Game.tooltip.initialise = function() {
    this.text = '';
    this.origin = '';
    this.visible = 0;
    this.dynamic = 0;
    this.shouldHide = 0;
    this.tt = el('tooltip');
    this.tta = el('tooltipAnchor');
};
Game.tooltip.drawTooltip = function(text, origin) {
    this.shouldHide = 0;
    this.text = text;
    this.origin = origin;
    this.updateTooltip();
    this.tta.style.display = 'block';
    this.dynamic = 1;
    this.visible = 1;
};
Game.tooltip.updateTooltip = function() {
    var x = 0;
    var y = 0;
    if (this.origin == 'store') {
        x = Game.windowW - 404 - this.tt.offsetWidth;
        y = Game.mouseY - 16;
    }
    if (this.dynamic == 1) {
        this.tta.style.left = x + 'px';
        this.tta.style.right = 'auto';
        this.tta.style.top = y + 'px';
        this.tta.style.bottom = 'auto';
    }
    if (this.shouldHide == 1) {
        this.hideTooltip();
    } else {
        if (typeof this.text === 'function') {
            this.tt.innerHTML = this.text();
        } else this.tt.innerHTML = this.text;
    }
};
Game.tooltip.hideTooltip = function() {
    this.tta.style.display = 'none';
    this.tt.innerHTML = '';
    this.dynamic = 0;
    this.visible = 0;
};
//#endregion
Game.GetMouseCoords = function(e) {
    var posx = 0;
    var posy = 0;

    if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    } else if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    }

    Game.mouseX2 = Game.mouseX;
    Game.mouseY2 = Game.mouseY;
    Game.mouseX = posx / Game.scale;
    Game.mouseY = posy / Game.scale;
}
Game.Resize = function(e) {
    var w = window.innerWidth;
    var h = window.innerHeight;

    var scale = Math.min(w / Math.max(1000, w), h / Math.max(200, h));
    Game.windowW = Math.floor(w / scale);
    Game.windowH = Math.floor(h / scale);

    if (scale == 1) {
        Game.wrapper.style.removeProperty('transform');
        Game.wrapper.style.width = '100%';
        Game.wrapper.style.height = '100%';
    } else {
        Game.wrapper.style.transform = 'scale(' + (scale) + ')';
        Game.wrapper.style.width = Game.windowW + 'px';
        Game.wrapper.style.height = Game.windowH + 'px';
    }
}
Game.StoreBulkMode = function(id) {
    if(id == 1) Game.bulkQty = 1;
    else if (id == 2) Game.bulkQty = 10;
    else if (id == 3) Game.bulkQty = 100;
    else if (id == 4) Game.bulkMode = 1;
    else if (id == 5) Game.bulkMode = 2;

    if(Game.bulkQty == 1) el('storeBulk1').className = 'storeBulkAmount selected'; else el('storeBulk1').className = 'storeBulkAmount';
    if(Game.bulkQty == 10) el('storeBulk10').className = 'storeBulkAmount selected'; else el('storeBulk10').className = 'storeBulkAmount';
    if(Game.bulkQty == 100) el('storeBulk100').className = 'storeBulkAmount selected'; else el('storeBulk100').className = 'storeBulkAmount';  
    if(Game.bulkMode == 1) el('storeBulkBuy').className = 'storeBulkMode selected'; else el('storeBulkBuy').className = 'storeBulkMode';
    if(Game.bulkMode == 2) el('storeBulkSell').className = 'storeBulkMode selected'; else el('storeBulkSell').className = 'storeBulkMode';

    Game.refresh = 1;
};
//#region Start Function and Loop
Game.RecalcTPS = function() {
    var totalTPS = 0.0;
    Game.ItemThings.forEach(function(item) {
        totalTPS += item.tps;
    });
    el('tps').innerHTML = totalTPS;
}
Game.Loop = function() {
    Game.ItemThings.forEach(function(item) {
        item.tick()
    });
    el('total').innerHTML = Math.floor(Game.TP);
    el('rawtotal').innerHTML = Game.TP;
    el('lifetimetotal').innerHTML = Game.LTTP;
    Game.tooltip.updateTooltip();
    Game.CheckForPurchasable();
    if(Game.refresh == 1) {
        Game.ItemThings.forEach(function(item) {
            item.refresh();
        });
        Game.refresh = 0;
    }
};
Game.Init = function() {
    Game.TP = 0;
    Game.LTTP = 0;
    Game.TPS = 0;

    Game.mouseX = 0;
    Game.mouseY = 0;
    Game.mouseX2 = 0;
    Game.mouseY2 = 0;

    Game.time = Date.now();
    Game.windowW = window.innerWidth;
    Game.windowH = window.innerHeight;
    Game.scale = 1;

    Game.refresh = 0;

    Game.bulkMode = 1;
    Game.bulkQty = 1;

    Game.wrapper = el('wrapper');
    document.addEventListener('mousemove', Game.GetMouseCoords);
    window.addEventListener('resize', Game.Resize);
}
Game.Launch = async function() {
    Game.Init();
    Game.LoadItems();
    Game.LoadUpgrades();
    Game.tooltip.initialise();
};
//#endregion