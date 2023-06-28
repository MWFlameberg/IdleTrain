var Game = {};
//#region Data Initialisation
Game.LoadItems = async function() {
    Game.Items = [];
    await $.getJSON("/Data/Items.json", function(response) {
        $.each(response, function(i, item) {
            Game.Items[i] = new BaseItem(item.id, item.name, item.description, 
                item.stats.baseCost, item.stats.basePower, 
                item.stats.baseMultiplier);
        });
    });
    if(Game.Items.length > 0) {
        Game.Items.forEach(function(item) {
            var itemContainer = Object.assign(document.createElement("div",), {id: "item" + item.id, className: "div-purchase"});
            itemContainer.onclick = function() { Game.BuyItem(item.id) };
            var itemName = Object.assign(document.createElement("div"), {id: "item" + item.id + "Name", className: "div-itemName", innerHTML: item.name});
            var itemCost = Object.assign(document.createElement("div"), {id: "item" + item.id + "Cost", className: "div-itemCost", innerHTML: item.getItemCost()});
            var itemOwned = Object.assign(document.createElement("div"), {id: "item" + item.id + "Owned", className: "div-itemOwned", innerHTML: item.quantity});
            itemContainer.appendChild(itemName);
            itemContainer.appendChild(itemCost);
            itemContainer.appendChild(itemOwned);
            document.getElementById("purchase-container").appendChild(itemContainer);
        });
    }
};
Game.LoadUpgrades = async function() {
    Game.Upgrades = [];
    await $.getJSON("/Data/Upgrades.json", function(response) {
        $.each(response, function(i, item) {
            Game.Upgrades[i] = new ItemUpgrade(item.id, item.name, item.description, 
                item.upgradeCost, item.upgradeItem, item.upgradePower);
        });
    });
    if(Game.Upgrades.length > 0) {
        Game.Upgrades.forEach(function(upgrade) {
            var upgradeContainer = Object.assign(document.createElement("div",), {id: "upgrade" + upgrade.id, className: "div-upgrade"});
            upgradeContainer.onclick = function() { Game.BuyUpgrade(this, upgrade.id) };
            var upgradeName = Object.assign(document.createElement("div"), {id: "upgrade" + upgrade.id + "Name", className: "div-upgradeName", innerHTML: upgrade.name});
            var upgradeCost = Object.assign(document.createElement("div"), {id: "upgrade" + upgrade.id + "Cost", className: "div-upgradeCost", innerHTML: upgrade.upgradeCost});
            upgradeContainer.appendChild(upgradeName);
            upgradeContainer.appendChild(upgradeCost);
            document.getElementById("upgrade-container").appendChild(upgradeContainer);
        });
    }
};
//#endregion
Game.SubtractPower = function(power) {
    Game.TrainPower -= power;
};
Game.ClickTrain = function() {
    Game.TrainPower += 1;
    document.getElementById("total").innerHTML = Math.floor(Game.TrainPower);
}
Game.UpdateTPS = function() {
    var total = 0;
    if(Game.Items.length > 0) {
        Game.Items.forEach(function(item) {total += item.getItemPower()});
    }
    Game.TPS = total;
};
Game.BuyItem = function(itemID) {
    if(Game.TrainPower >= Game.Items[itemID].getItemCost()) {
        Game.SubtractPower(Game.Items[itemID].getItemCost());
        Game.Items[itemID].quantity += 1;
        document.getElementById("item" + itemID + "Owned").innerHTML = Game.Items[itemID].quantity;
        document.getElementById("item" + itemID + "Cost").innerHTML = Game.Items[itemID].getItemCost();
        Game.UpdateTPS();
        document.getElementById("tps").innerHTML = Math.round(Game.TPS * 100) / 100;
    } 
};
Game.BuyUpgrade = function(element, upgradeID) {
    if(Game.TrainPower >= Game.Upgrades[upgradeID].upgradeCost && !Game.Upgrades[upgradeID].purchased) {
        Game.SubtractPower(Game.Upgrades[upgradeID].upgradeCost);
        Game.Upgrades[upgradeID].purchased = true;
        var upgradedItem = Game.Upgrades[upgradeID].upgradeItem;
        Game.Items[upgradedItem].powerMultiplier *= Game.Upgrades[upgradeID].upgradePower;
        element.style.display = "none";
        Game.UpdateTPS();
        document.getElementById("tps").innerHTML = Math.round(Game.TPS * 100) / 100;
    }
};
//#region Start Function and Loop
Game.Loop = function() {
    Game.TrainPower = Math.round((Game.TrainPower + (Game.TPS / 10)) * 100) / 100;
    document.getElementById("total").innerHTML = Math.floor(Game.TrainPower);
    document.getElementById("rawtotal").innerHTML = Game.TrainPower;
};
Game.Launch = async function() {
    Game.TrainPower = 0;
    Game.TPS = 0;
    Game.LoadItems();
    Game.LoadUpgrades();
};
//#endregion