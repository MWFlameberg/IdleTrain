Clicker = function() {
    //Item Appearance properties.
    this.clickId = 0;
    this.clickName = 'Clicker';
    this.clickDesc = 'This is your clicker, get clicking.';
    this.clickExtraDesc = 'It clicks, what more do you need?';
    this.clickIcon = '/Images/placeholder.png';
    this.tooltipIcon = '/Images/tooltip-placeholder.png';
    //Base Stat properties.
    this.clickBasePower = 1;
    //Up to Date Stat properties.
    this.clickPower = this.clickBasePower;
    this.clickClicks = 0;
    this.clickTrains = 0;
    //Unlock properties.
    this.clickUpgrades = [];

    this.updateClick = function() {
        var multiplier = 1;
        this.clickUpgrades.forEach(function(upgrade) {
            multiplier = multiplier * upgrade.mult;
        });
        this.clickPower = this.clickBasePower * multiplier * Game.ascMultiplier;
    };
    this.click = function() {
        Game.Earn(this.clickPower);
        this.clickClicks++;
        this.clickTrains += this.clickPower;
        Game.trainClicks++;
        Game.trainsClicked += this.clickPower;
    }
};