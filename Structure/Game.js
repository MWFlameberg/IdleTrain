function el(id) { return document.getElementById(id); };

var Game = {};
//#region Content Drawing
Game.DrawUpgrade = function(upgrade) {
    var container = upgrade.drawStoreItem();
    container.onclick = function() { Game.BuyUpgrade(upgrade.id) };
    container.onmouseover = function() { Game.tooltip.draw(function() {return upgrade.getTooltip() }, 'store') };
    container.onmouseout = function() { Game.tooltip.shouldHide = 1 }
};
Game.DrawItem = function(item) {
    var container = item.drawStoreItem();
    container.onclick = function() { Game.BuyItem(item.id) };
    container.onmouseover = function() { Game.tooltip.draw(function() {return item.getTooltip() }, 'store') };
    container.onmouseout = function() { Game.tooltip.shouldHide = 1 }
};
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
    Game.LTTP += 1;
};
Game.ClickTrain = function() {
    Game.AddPower(1);
    Game.UpdateTP();
};
Game.CheckForNewUpgrades = function() {
    Game.ItemUpgrades.forEach(function(upgrade) {
        if (upgrade.unlock() == 1) {
            Game.DrawUpgrade(upgrade);
        }
    });
    Game.ItemThings.forEach(function(item) {
        if (item.unlock() == 1) {
            Game.DrawItem(item);
        }
    });
};
Game.BuyItem = function(itemID) {
    if (Game.ItemThings[itemID].buy(1) == 1) {
        el('item' + itemID + 'qty').innerHTML = Game.ItemThings[itemID].qty;
        el('item' + itemID + 'cost').innerHTML = Game.ItemThings[itemID].getCost();
        Game.CheckForNewUpgrades();
        Game.RecalcTPS();
    }
};
Game.BuyUpgrade = function(upgradeID) {
    if (Game.ItemUpgrades[upgradeID].buy() == 1) {
        Game.CheckForNewUpgrades();
        Game.RecalcTPS();
    }
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
Game.tooltip.draw = function(text, origin) {
    this.shouldHide = 0;
    this.text = text;
    this.origin = origin;
    if (typeof this.text === 'function') {
        this.tt.innerHTML = this.text();
    } else this.tt.innerHTML = this.text;
    this.tta.style.display = 'block';
    this.dynamic = 1;
    this.visible = 1;
    Game.tooltip.update();
};
Game.tooltip.update = function() {
    var x = 0;
    var y = 0;
    if (this.origin == 'store') {
        x = Game.windowW - 420 - this.tt.offsetWidth;
        y = Game.mouseY - 16;
    }
    if (this.dynamic == 1) {
        this.tta.style.left = x + 'px';
        this.tta.style.right = 'auto';
        this.tta.style.top = y + 'px';
        this.tta.style.bottom = 'auto';
    }
    if (this.shouldHide == 1) {
        this.hide();
    } else {
        if (typeof this.text === 'function') {
            this.tt.innerHTML = this.text();
        } else this.tt.innerHTML = this.text;
    }
};
Game.tooltip.hide = function() {
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
    Game.tooltip.update();
    Game.CheckForNewUpgrades();
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