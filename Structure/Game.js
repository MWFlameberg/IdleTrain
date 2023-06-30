var Game = {};
//#region Content Drawing
Game.DrawUpgrade = function(upgrade) {
    var container = Object.assign(document.createElement("div",), {id: "upgrade" + upgrade.id, className: "div-upgrade"});
    container.onclick = function() { Game.BuyUpgrade(this, upgrade.id) };
    var icon = Object.assign(document.createElement("div"), {id: "upgrade" + upgrade.id + "Icon", className: "div-upgradeIcon"});
    icon.style.backgroundImage = "url(/Images/upgrade-placeholder.png)";
    container.appendChild(icon);
    document.getElementById("upgrades").appendChild(container);
};
Game.DrawItem = function(item) {
    var container = Object.assign(document.createElement("div",), {id: "item" + item.id, className: "div-purchase"});
    container.onclick = function() { Game.BuyItem(item.id) };
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
    document.getElementById("items").appendChild(container);
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
        Game.Items.forEach(function(item) {total += item.getItemPower()});
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
        document.getElementById("item" + itemID + "Owned").innerHTML = Game.Items[itemID].quantity;
        document.getElementById("item" + itemID + "Cost").innerHTML = Game.Items[itemID].getItemCost();
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
//#region Start Function and Loop
Game.Loop = function() {
    Game.TP = Math.round((Game.TP + (Game.TPS / 10)) * 100) / 100;
    Game.LTTP = Math.round((Game.LTTP + (Game.TPS / 10)) * 100) / 100;
    document.getElementById("total").innerHTML = Math.floor(Game.TP);
    document.getElementById("rawtotal").innerHTML = Game.TP;
    document.getElementById("lifetimetotal").innerHTML = Game.LTTP;
};
Game.Launch = async function() {
    Game.TP = 0;
    Game.LTTP = 0;
    Game.TPS = 0;
    Game.LoadItems();
    Game.LoadUpgrades();
};
//#endregion