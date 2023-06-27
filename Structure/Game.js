var Game = {};

Game.SubtractPower = function(power) {
    Game.TrainPower -= power;
};
Game.ClickTrain = function() {
    Game.TrainPower += 1;
    document.getElementById("total").innerHTML = Math.floor(Game.TrainPower);
}
Game.GetTotalTrainPower = function() {
    var total = 0;
    if(Game.Items.length > 0) {
        Game.Items.forEach(function(item) {total += item.getItemPower()});
    }
    return total;
};
Game.BuyItem = function(itemID) {
    if(Game.TrainPower >= Game.Items[itemID].getItemCost()) {
        Game.SubtractPower(Game.Items[itemID].getItemCost());
        Game.Items[itemID].quantity += 1;
        document.getElementById("item" + itemID + "Owned").innerHTML = Game.Items[itemID].quantity;
        document.getElementById("item" + itemID + "Cost").innerHTML = Game.Items[itemID].getItemCost();
        document.getElementById("tps").innerHTML = Game.GetTotalTrainPower();
    } 
};
Game.LoadItems = function() {
    if(Game.Items.length > 0) {
        Game.Items.forEach(function(item) {
            document.getElementById("item" + item.id + "Name").innerHTML = item.name;
            document.getElementById("item" + item.id + "Owned").innerHTML = item.quantity;
            document.getElementById("item" + item.id + "Cost").innerHTML = item.getItemCost();
        });
    }
};
Game.Loop = function() {
    Game.TrainPower += Game.GetTotalTrainPower() / 10;
    document.getElementById("total").innerHTML = Math.floor(Game.TrainPower);
};
Game.Launch = async function() {
    Game.TrainPower = 0;
    Game.Items = [];
    await $.getJSON("/Data/Items.json", function(response) {
        $.each(response, function(i, item) {
            Game.Items[i] = new BaseItem(item.id, item.name, item.description, 
                item.stats.baseCost, item.stats.basePower, 
                item.stats.baseMultiplier);
        });
    });
    Game.LoadItems();
};