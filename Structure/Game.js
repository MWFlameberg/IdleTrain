/*==========================================================================
                    General Use and Utility Functions
==========================================================================*/
function el(id) {
    return document.getElementById(id);
};

function enableElement(element) {
    element.classList.add('enabled');
};

function disableElement(element) {
    element.classList.remove('enabled');
};

function formatEveryThirdPower(format, num)

{
	var base = 0
    var formatValue = '';
	if (!isFinite(num)) return 'Infinity';
	if (num >= 1000000)
	{
		num /= 1000;
		while(Math.round(num)>=1000)
		{
			num /= 1000;
			base++;
		}
		if (base >= format.length) {return 'Infinity';} else {formatValue = format[base];}
	}
	return (Math.round(num * 1000) / 1000) + formatValue;
}

var numFormatLong = [' thousand',' million',' billion',' trillion',' quadrillion',' quintillion',' sextillion',' septillion',' octillion',' nonillion'];
var numPrefix = ['','un','duo','tre','quattuor','quin','sex','septen','octo','novem'];
var numSuffix = ['decillion','vigintillion','trigintillion','quadragintillion','quinquagintillion','sexagintillion','septuagintillion','octogintillion','nonagintillion'];

for (var i in numPrefix)
	for (var ii in numSuffix)
        numFormatLong.push(' ' + numPrefix[ii] + numSuffix[i]);

var numFormatShort = ['k','M','B','T','Qa','Qi','Sx','Sp','Oc','No'];
var numPrefix = ['','Un','Do','Tr','Qa','Qi','Sx','Sp','Oc','No'];
var numSuffix = ['D','V','T','Qa','Qi','Sx','Sp','O','N'];
for (var i in numPrefix)
	for (var ii in numSuffix)
        numFormatShort.push(' ' + numPrefix[ii] + numSuffix[i]);

function formatNum(num, floats) {
    var negative = (num < 0);
    var decimal = '';
    var fixed = num.toFixed(floats);
    if (floats > 0 && num < 1000) decimal = '.' + fixed.toString().split('.')[1];
    num = Math.floor(Math.abs(num));
    var output = ''
    var output = formatEveryThirdPower(numFormatLong, num).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
    return negative ? '-' + output : output + decimal;
};
function formatNumSimple(num) {
	var input = num.toString();
	var output = '';
	for (var i in input)
	{
		if ((input.length-i) % 3 == 0 && i > 0) 
            output += ',';
		output += input[i];
	}
	return output;
}
/*==========================================================================
                    Useful/Reused Objects for storage
==========================================================================*/
Icon = function(file, xCoord, yCoord) {
    this.file = file;
    this.xCoord = xCoord;
    this.yCoord = yCoord;
};
UnlockReq = function(unlockType, id, amt) {
    this.unlockType = unlockType
    this.id = id;
    this.amt = amt;
    this.unlocked = 0;

    this.unlock = function() {
        if (this.unlocked == 1) {
            return 1;
        };
        switch (this.unlockType) {
            case "Trains":
                if (Game.trainsEarned >= this.amt)
                    this.unlocked = 1;
                break;
            case "Clicks":
                if (Game.trainClicks >= this.amt)
                    this.unlocked = 1;
                break;
            case "Items":
                if (Game.StoreItems[this.id].amt >= this.amt)
                    this.unlocked = 1;
                break;
            default:
                return 0;
        }
        return this.unlocked;
    };
    this.reset = function() {
        this.unlocked = 0;
    }
};
var Game = {};
Game.StoreItems = [];
Game.StoreUpgrades = [];
Game.StoreTrainLines = [];
/*==========================================================================
                    Data Loading from Files and Setup
==========================================================================*/
Game.LoadItems = async function() {
    await $.getJSON('/Data/Items.json', function(response) {
        $.each(response, function(i) {
            var reqs = [];
            $.each(this.unlockReqs, function(j) {
                reqs.push(new UnlockReq(this.type, this.id, this.amt));
            });
            var icon = new Icon(this.icon.file, this.icon.x, this.icon.y);
            var tooltipIcon = new Icon(this.tooltipIcon.file, this.tooltipIcon.x, this.tooltipIcon.y);

            var parentId = this.id1;
            new StoreItem(this.id1, -1, this.name, this.desc1, this.desc2, icon, tooltipIcon, this.baseCost, this.baseCostMult, reqs, this.basePower);

            $.each(this.subItems, function(j) {
                var reqs = [];
                $.each(this.unlockReqs, function(j) {
                    reqs.push(new UnlockReq(this.type, this.id, this.amt));
                });
                var icon = new Icon(this.icon.file, this.icon.x, this.icon.y);
                var tooltipIcon = new Icon(this.tooltipIcon.file, this.tooltipIcon.x, this.tooltipIcon.y);
                new StoreSubItem(this.id1, parentId, this.name, this.desc1, this.desc2, icon, tooltipIcon, this.baseCost, this.baseCostMult, reqs, this.basePowerMult, this.baseSpeedMult, this.baseDiscountMult);
            });
        });
    });
};
Game.LoadTrainLines = async function() {
    await $.getJSON('/Data/TrainLines.json', function(response) {
        $.each(response, function(i) {
            var reqs = [];
            $.each(this.unlockReqs, function(j) {
                reqs.push(new UnlockReq(this.type, this.id, this.amt));
            });
            var icon = new Icon(this.icon.file, this.icon.x, this.icon.y);
            var tooltipIcon = new Icon(this.tooltipIcon.file, this.tooltipIcon.x, this.tooltipIcon.y);

            var parentId = this.id1;
            new StoreTrainLine(this.id1, -1, this.name, this.desc1, this.desc2, icon, tooltipIcon, this.baseCost, this.baseCostMult, reqs, this.basePower, this.baseSpeed);

            $.each(this.subItems, function(j) {
                var reqs = [];
                $.each(this.unlockReqs, function(j) {
                    reqs.push(new UnlockReq(this.type, this.id, this.amt));
                });
                var icon = new Icon(this.icon.file, this.icon.x, this.icon.y);
                var tooltipIcon = new Icon(this.tooltipIcon.file, this.tooltipIcon.x, this.tooltipIcon.y);
                new StoreSubTrainLine(this.id1, parentId, this.name, this.desc1, this.desc2, icon, tooltipIcon, this.baseCost, this.baseCostMult, reqs, this.basePowerMult, this.baseSpeedMult, this.baseDiscountMult);
            });
        });
    });
};
Game.LoadUpgrades = async function() {
    await $.getJSON('/Data/Upgrades.json', function(response) {
        $.each(response, function(i) {
            var reqs = [];
            $.each(this.unlockReqs, function(j) {
                reqs.push(new UnlockReq(this.type, this.id, this.amt));
            });
            var upgItems = [];
            $.each(this.upgradeItems, function(j) {
                upgItems.push({type: this.type, id: this.id, mult: this.mult});
            });
            var icon = new Icon(this.icon.file, this.icon.x, this.icon.y);
            var tooltipIcon = new Icon(this.tooltipIcon.file, this.tooltipIcon.x, this.tooltipIcon.y);
            
            new StoreUpgrade(this.id1, -1, this.name, this.desc1, this.desc2, icon, tooltipIcon, this.baseCost, this.baseCostMult, reqs, upgItems);
        });
    });
};
/*==========================================================================
                    User Action and UI Interaction
==========================================================================*/
Game.TakeAction = function() {
    Game.lastAction = Date.now();
};
Game.Spend = function(amt) {
    Game.trains -= amt;
};
Game.Earn = function(amt, sold = false) {
    Game.trains += amt;
    if (!sold)
        Game.trainsEarned += amt;
};
Game.ClickTrain = function() {
    Game.Clicker.click();
};
Game.Buy = function(id1, id2, type) {
    if (type == 'Item') {
        if (Game.bulkMode == 1) {
            Game.StoreItems[id1].buy(Game.bulkQty)
        } else if (Game.bulkMode == 2) {
            Game.StoreItems[id1].sell(Game.bulkQty)
        }
    }
    else if (type == 'Line') {
        if (Game.bulkMode == 1) {
            Game.StoreTrainLines[id1].buy(Game.bulkQty)
        } else if (Game.bulkMode == 2) {
            Game.StoreTrainLines[id1].sell(Game.bulkQty)
        }
    } else if (type == 'SubItem') {
        if (Game.bulkMode == 1) {
            Game.StoreItems[id2].subItems[id1].buy(Game.bulkQty)
        } else if (Game.bulkMode == 2) {
            Game.StoreItems[id2].subItems[id1].sell(Game.bulkQty)
        }
    } else if (type == 'SubLine') {
        if (Game.bulkMode == 1) {
            Game.StoreTrainLines[id2].subItems[id1].buy(Game.bulkQty)
        } else if (Game.bulkMode == 2) {
            Game.StoreTrainLines[id2].subItems[id1].sell(Game.bulkQty)
        }
    } else if (type == 'Upgrade') {
        Game.StoreUpgrades[id1].buy(1)
    }
    Game.refresh = 1;
    Game.recalcTps = 1;
};
Game.StoreBulkMode = function(id) {
    if (id == 1) Game.bulkQty = 1;
    else if (id == 2) Game.bulkQty = 10;
    else if (id == 3) Game.bulkQty = 100;
    else if (id == 4) Game.bulkMode = 1;
    else if (id == 5) Game.bulkMode = 2;

    if (Game.bulkQty == 1) el('storeBulk1').classList.add("selected");
    else el('storeBulk1').classList.remove("selected");
    if (Game.bulkQty == 10) el('storeBulk10').classList.add("selected");
    else el('storeBulk10').classList.remove("selected");
    if (Game.bulkQty == 100) el('storeBulk100').classList.add("selected");
    else el('storeBulk100').classList.remove("selected");
    if (Game.bulkMode == 1) el('storeBulkBuy').classList.add("selected");
    else el('storeBulkBuy').classList.remove("selected");
    if (Game.bulkMode == 2) el('storeBulkSell').classList.add("selected");
    else el('storeBulkSell').classList.remove("selected");

    Game.refresh = 1;
};
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
};
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
};
/*==========================================================================
                        Ascension Logic
==========================================================================*/
Game.Ascend = function() {
    Game.ascTrains += Game.trainsEarned;
    Game.ascMultiplier = 1 + 0.01 * Math.floor(Game.ascTrains / Game.ascTrainsReq);
    Game.timesAscended++;

    Game.lastAscension = Date.now();

    Game.trainsEarned = 0;
    Game.trains = 0;
    Game.trainsPs = 0;
    Game.trainClicks = 0;
    Game.trainsClicked = 0;
    Game.itemTps = 0;

    Game.recalcTps = 1;
    Game.refresh = 1;

    Game.ResetItems();
};
Game.ResetItems = function() {
    Game.StoreItems.forEach(function(item) {
        item.resetObject();
        item.update();
    });
    Game.StoreUpgrades.forEach(function(upgrade) {
        upgrade.resetObject();
    });
    Game.StoreTrainLines.forEach(function(i) {
        i.resetObject();
        i.update();
    });
    
};
Game.GetAscendTooltip = function() {
    return '<div id="tooltipItem">' +
        '<div class="tooltipHeader">' + 'Ascend' + '</div>' +
        '<div class="tooltipStats">' + 'You currently have ' + Math.floor(Game.ascTrains / Game.ascTrainsReq) + ' ascension power.' + '</div>' +
        '<div class="tooltipLine"></div>' +
        '<div class="tooltipStats">' + 'You need ' + (Game.ascTrainsReq - ((Game.trainsEarned + Game.ascTrains) % Game.ascTrainsReq)) + ' for 1 more ascension power.' + '</div>' +
        '<div class="tooltipStats">' + 'If you ascend now, you will gain ' + Math.floor(Game.trainsEarned / Game.ascTrainsReq) + ' more ascension power.' + '</div>' +
        '<div class="tooltipLine"></div>' +
        '<div class="tooltipStats">' + 'You have been on your current run for ' + ((Date.now() - Game.lastAscension) / 1000) + ' seconds.' + '</div>' +
        '</div>'
}
/*==========================================================================
                Tooltip Control and functionality
==========================================================================*/
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
    } else if (this.origin == 'ascend') {
        x = Game.windowW - 404 - this.tt.offsetWidth;
        y = 76;
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
/*==========================================================================
                Core Loop function and loop based logic
==========================================================================*/
Game.CheckForPurchasable = function() {
    Game.StoreUpgrades.forEach(function(i) {
        if (i.isVisible == 1 && i.element != null) {
            if (i.canBuy(1) && !i.isEnabled) {
                i.enable();
            } else if (!i.canBuy(1)) {
                i.disable();
            }
        }
    });
    if (Game.bulkMode == 1) {
        Game.StoreItems.forEach(function(i) {
            if (i.isVisible == 1 && i.element != null) {
                if (i.canBuy(Game.bulkQty) && !i.isEnabled) {
                    i.enable();
                } else if (!i.canBuy(Game.bulkQty)) {
                    i.disable();
                }
                i.subItems.forEach(function(j) {
                    if (j.isVisible == 1 && j.element != null) {
                        if (j.canBuy(Game.bulkQty) && !j.isEnabled) {
                            j.enable();
                        } else if (!j.canBuy(Game.bulkQty)) {
                            j.disable();
                        }
                    }
                });
            }
        });
        Game.StoreTrainLines.forEach(function(i) {
            if (i.isVisible == 1 && i.element != null) {
                if (i.canBuy(Game.bulkQty) && !i.isEnabled) {
                    i.enable();
                } else if (!i.canBuy(Game.bulkQty)) {
                    i.disable();
                }
                i.subItems.forEach(function(j) {
                    if (j.isVisible == 1 && j.element != null) {
                        if (j.canBuy(Game.bulkQty) && !j.isEnabled) {
                            j.enable();
                        } else if (!j.canBuy(Game.bulkQty)) {
                            j.disable();
                        }
                    }
                });
            }
        });
    } else if (Game.bulkMode == 2) {
        Game.StoreItems.forEach(function(i) {
            if (i.isVisible == 1 && i.element != null) {
                if (i.canSell() && !i.isEnabled) {
                    i.enable();
                } else if (!i.canSell()) {
                    i.disable();
                }
                i.subItems.forEach(function(j) {
                    if (j.isVisible == 1 && j.element != null) {
                        if (j.canSell() && !j.isEnabled) {
                            j.enable();
                        } else if (!i.canSell()) {
                            j.disable();
                        }
                    }
                });
            }
        });
        Game.StoreTrainLines.forEach(function(i) {
            if (i.isVisible == 1 && i.element != null) {
                if (i.canSell() && !i.isEnabled) {
                    i.enable();
                } else if (!i.canSell()) {
                    i.disable();
                }
                i.subItems.forEach(function(j) {
                    if (j.isVisible == 1 && j.element != null) {
                        if (j.canSell() && !j.isEnabled) {
                            j.enable();
                        } else if (!i.canSell()) {
                            j.disable();
                        }
                    }
                });
            }
        });
    }
};
Game.DrawStore = function() {
    Game.StoreUpgrades.forEach(function(i) {
        if (i.unlock() && i.element == null) {
            i.drawStoreItem();
        } else if (!i.isVisible) {
            i.clear()
        }
    });
    Game.StoreItems.forEach(function(i) {
        if (i.unlock() && i.element == null) {
            i.drawStoreItem();
        } else if (!i.isVisible) {
            i.clear()
        }
        i.subItems.forEach(function(j) {
            if (j.unlock() && j.element == null) {
                j.drawStoreItem();
            } else if (!j.isVisible) {
                j.clear()
            }
        });
    });
    Game.StoreTrainLines.forEach(function(i) {
        if (i.unlock() && i.element == null) {
            i.drawStoreItem();
        } else if (!i.isVisible) {
            i.clear()
        }
        i.subItems.forEach(function(j) {
            if (j.unlock() && j.element == null) {
                j.drawStoreItem();
            } else if (!j.isVisible) {
                j.clear()
            }
        });
    });
};
Game.CalculateGains = function() {
    Game.trainsPs = 0;
    Game.StoreItems.forEach(function(i) {
        Game.trainsPs += i.trainsPs;
        Game.itemTps += i.trainsPs;
    });
};
Game.Loop = function() {
    if (Game.recalcTps)
        Game.CalculateGains();

    Game.Earn(Game.trainsPs / Game.fps);
    Game.StoreItems.forEach(function(item) {
        item.trainsEarned += item.trainsPs / Game.fps;
    });
    Game.StoreTrainLines.forEach(function(item) {
        if (item.checkTimeElapse()) {
            Game.Earn(item.trainsPs);
            item.trainsEarned += item.trainsPs;
            item.currentStart = Date.now();
        }
    });

    Game.DrawStore();
    Game.CheckForPurchasable();

    if (Game.mouseMoved || Game.tooltip.dynamic)
        Game.tooltip.updateTooltip();
    if (Game.recalcTps)
        el('tps').innerHTML = 'per second: ' + formatNum(Game.trainsPs, 1);
    if (Game.refresh == 1) {
        Game.StoreItems.forEach(function(i) {
            i.refreshStoreItem();
            i.subItems.forEach(function(j) {
                j.refreshStoreItem();
            });
        });
        Game.StoreTrainLines.forEach(function(i) {
            i.refreshStoreItem();
            i.subItems.forEach(function(j) {
                j.refreshStoreItem();
            });
        });
    }

    el('tpTotal').innerHTML = formatNum(Game.trains, 0);

    Game.recalcTps = 0;
    Game.refresh = 0;

    Game.ascPercent = ((Game.trainsEarned % Game.ascTrainsReq) / Game.ascTrainsReq) * 100
    el('ascendBar').style.width = Game.ascPercent + '%';

    Game.StoreTrainLines.forEach(function(i) {
        el('trainLine' + i.id1 + 'Bar').style.width = (((Date.now() - i.currentStart) / i.currentSpeed) * 100) + '%';
    });

    Game.loopT++;
    setTimeout(Game.Loop, 1000 / Game.fps);
};
/*==========================================================================
                    Game Startup and Initialisation
==========================================================================*/
Game.Init = function() {
    // Train based variables.
    Game.trainsEarned = 0;
    Game.trains = 0;
    Game.trainsPs = 0;
    Game.trainClicks = 0;
    Game.trainsClicked = 0;
    Game.itemTps = 0;
    // Date and Time based variables.
    Game.startDate = Date.now();
    Game.fullStartDate = Date.now();
    Game.currentDate = Date.now();
    Game.lastAction = Date.now();
    Game.lastAscension = Date.now();
    // UI and Mouse based variables.
    Game.mouseX = 0;
    Game.mouseY = 0;
    Game.mouseX2 = 0;
    Game.mouseY2 = 0;
    Game.mouseMoved = 0;
    Game.windowW = window.innerWidth;
    Game.windowH = window.innerHeight;
    Game.scale = 1;
    // Gamestate Flag based variables.
    Game.refresh = 0;
    Game.bulkMode = 1;
    Game.bulkQty = 1;
    Game.recalcTps = 0;
    // Ascension based variables.
    Game.timesAscended = 0;
    Game.ascTrains = 0;
    Game.ascTrainsReq = 100;
    Game.ascMultiplier = 1;
    Game.ascPercent = 0;
    // Loop/Timing based variables.
    Game.loopT = 0;
    Game.fps = 30;
    // Document Element based variables.
    Game.wrapper = el('wrapper');
    // Event Listeners.
    document.addEventListener('mousemove', Game.GetMouseCoords);
    window.addEventListener('resize', Game.Resize);
};
Game.Launch = async function() {
    Game.Init();
    Game.LoadItems();
    Game.LoadTrainLines();
    Game.LoadUpgrades();
    Game.Clicker = new Clicker();
    Game.tooltip.initialise();
    Game.Loop();
};