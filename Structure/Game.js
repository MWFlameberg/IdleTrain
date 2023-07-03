function el(id) { return document.getElementById(id); };

var Game = {};
//#region Content Drawing
Game.DrawUpgrade = function(upgrade) {
    var container = Object.assign(document.createElement("div",), {id: "upgrade" + upgrade.id, className: "div-upgrade"});
    container.onclick = function() { Game.BuyUpgrade(this, upgrade.id) };
    var icon = Object.assign(document.createElement("div"), {id: "upgrade" + upgrade.id + "Icon", className: "div-upgradeIcon"});
    icon.style.backgroundImage = "url(/Images/upgrade-placeholder.png)";
    container.appendChild(icon);
    el("upgrades").appendChild(container);
};
Game.DrawItem = function(item) {
    var container = Object.assign(document.createElement("div",), {id: "item" + item.id, className: "div-purchase"});
    container.onclick = function() { Game.BuyItem(item.id) };
    container.onmouseover = function() { Game.tooltip.draw(item,'store') };
    container.onmouseout = function() { Game.tooltip.shouldHide = 1 }
    var icon = Object.assign(document.createElement("div"), {id: "item" + item.id + "Icon", className: "div-itemIcon"});
    icon.style.backgroundImage = "url(/Images/placeholder.png)";
    var content =Object.assign(document.createElement("div"), {id: "item" + item.id + "Content", className: "div-purchaseContent"});
    var name = Object.assign(document.createElement("div"), {id: "item" + item.id + "Name", className: "div-itemName", innerHTML: item.name});
    var cost = Object.assign(document.createElement("div"), {id: "item" + item.id + "Cost", className: "div-itemCost", innerHTML: item.getItemCost()});
    var owned = Object.assign(document.createElement("div"), {id: "item" + item.id + "Owned", className: "div-itemOwned", innerHTML: item.quantity});
    container.appendChild(icon);
    container.appendChild(content);
    content.appendChild(name);
    content.appendChild(cost);
    content.appendChild(owned);
    el("items").appendChild(container);
};
//#endregion
//#region Data Initialisation
Game.LoadItems = async function() {
    Game.Items = [];
    await $.getJSON("/Data/Items.json", function(response) {
        $.each(response, function(i, item) {
            Game.Items[i] = new Item(item.id, item.name, item.description, 
                item.stats.baseCost, item.stats.basePower, 
                item.stats.baseMultiplier);
        });
    });
    if(Game.Items.length > 0) {
        Game.Items.forEach(function(item) {
            Game.DrawItem(item);
        });
    }
};
Game.LoadUpgrades = async function() {
    Game.Upgrades = [];
    await $.getJSON("/Data/Upgrades.json", function(response) {
        $.each(response, function(i, upgrade) {
            var unlockReq = {}
            unlockReq.itemReq = upgrade.requirement.itemReq;
            unlockReq.amtReq = upgrade.requirement.amtReq;
            Game.Upgrades[i] = new Upgrade(upgrade.id, upgrade.name, upgrade.description, 
                upgrade.baseCost, upgrade.affectedItem, upgrade.basePower, unlockReq);
        });
    });
    if(Game.Upgrades.length > 0) {
        Game.Upgrades.forEach(function(upgrade) {
            if(upgrade.available) {
                Game.DrawUpgrade(upgrade);
            }
        });
    }
};
//#endregion
Game.UpdateTPS = function() {
    var total = 0;
    if(Game.Items.length > 0) {
        Game.Items.forEach(function(item) {total += item.getItemTotalPower()});
    }
    Game.TPS = total;
    document.getElementById("tps").innerHTML = Math.round(Game.TPS * 100) / 100;
};
Game.UpdateTP = function() {
    document.getElementById("total").innerHTML = Math.floor(Game.TP);
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
Game.CheckForNewUpgrades = function(itemPurchased) {
    Game.Upgrades.forEach(function(upgrade) {
        if(upgrade.canUnlockUpgrade(itemPurchased)) {
            Game.DrawUpgrade(upgrade);
            upgrade.available = true;
        }
    });
};
Game.BuyItem = function(itemID) {
    if(Game.TP >= Game.Items[itemID].getItemCost()) {
        Game.SubtractPower(Game.Items[itemID].getItemCost());
        Game.Items[itemID].quantity += 1;
        el("item" + itemID + "Owned").innerHTML = Game.Items[itemID].quantity;
        el("item" + itemID + "Cost").innerHTML = Game.Items[itemID].getItemCost();
        Game.UpdateTPS();
        Game.CheckForNewUpgrades(Game.Items[itemID]);
    } 
};
Game.BuyUpgrade = function(element, upgradeID) {
    if(Game.TP >= Game.Upgrades[upgradeID].upgradeCost && !Game.Upgrades[upgradeID].purchased) {
        Game.SubtractPower(Game.Upgrades[upgradeID].upgradeCost);
        Game.Upgrades[upgradeID].purchased = true;
        var upgradedItem = Game.Upgrades[upgradeID].upgradeItem;
        Game.Items[upgradedItem].powerMultiplier *= Game.Upgrades[upgradeID].upgradePower;
        element.style.display = "none";
        Game.UpdateTPS();
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
    this.tti = el('tooltipIcon');
    this.ttt = el('tooltipText');
    this.tta = el('tooltipAnchor');
};
Game.tooltip.draw = function(item, origin) {
    this.shouldHide = 0;
    this.text = item.name + '<br/>' + item.description ;
    this.origin = origin;
    this.tta.style.display = 'block';
    this.ttt.innerHTML = this.text;
    this.tti.style.backgroundImage = "url(/Images/upgrade-placeholder.png)";
    this.dynamic = 1;
    Game.tooltip.update();
    this.visible = 1;
};
Game.tooltip.update = function() {
    var x = 0;
    var y = 0;
    if (this.origin == 'store') {
        x = Game.windowW - 416 - this.tt.offsetWidth;
        y = Game.mouseY - 16;
    }
    if (this.dynamic == 1) {
        this.tta.style.left = x + 'px';
        this.tta.style.right = 'auto';
        this.tta.style.top = y + 'px';
        this.tta.style.bottom = 'auto';
    }
    if (this.shouldHide == 1) 
    { 
        this.hide(); 
    };
};
Game.tooltip.hide = function() {
    this.tta.style.display = 'none';
    this.ttt.innerHTML = '';
    this.tti.backgroundImage = '';
    this.dynamic = 0;
    this.visible = 0;
};
//#endregion
Game.GetMouseCoords = function(e) {
    var posx = 0;
	var posy = 0;
	
	if (e.clientX || e.clientY)
	{
		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	} 
    else if (e.pageX || e.pageY)
	{
		posx = e.pageX;
		posy = e.pageY;
	}

	Game.mouseX2 = Game.mouseX;
	Game.mouseY2 = Game.mouseY;
	Game.mouseX = posx / Game.scale;
	Game.mouseY = posy/ Game.scale;
}
Game.Resize = function(e) {
    var w = window.innerWidth;
    var h = window.innerHeight;

    var scale = Math.min(w/Math.max(1000,w), h/Math.max(200,h));
    Game.windowW = Math.floor(w/scale);
    Game.windowH = Math.floor(h/scale);

    if (scale == 1) {
        Game.wrapper.style.removeProperty('transform');
        Game.wrapper.style.width = '100%';
        Game.wrapper.style.height = '100%';
    }
    else {
        Game.wrapper.style.transform = 'scale(' + (scale) + ')';
        Game.wrapper.style.width = Game.windowW + 'px';
        Game.wrapper.style.height = Game.windowH + 'px';
    }
}
//#region Start Function and Loop
Game.Loop = function() {
    Game.TP = Math.round((Game.TP + (Game.TPS / 10)) * 100) / 100;
    Game.LTTP = Math.round((Game.LTTP + (Game.TPS / 10)) * 100) / 100;
    el("total").innerHTML = Math.floor(Game.TP);
    el("rawtotal").innerHTML = Game.TP;
    el("lifetimetotal").innerHTML = Game.LTTP;
    Game.tooltip.update();
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