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

function formatNum(num, floats) {
    var negative = (num < 0);
    var decimal = '';
    var fixed = num.toFixed(floats);
    if (floats > 0) decimal = '.' + fixed.toString().split('.')[1];
    num = Math.floor(Math.abs(num));
    return negative ? '-' + num : num + decimal;
};
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
                if (Game.Items[this.id].amt >= this.amt)
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
/*==========================================================================
                    Data Loading from Files and Setup
==========================================================================*/
Game.LoadItems = async function() {
    await $.getJSON('/Data/Items.json', function(response) {
        $.each(response, function(i) {
            var reqs = [];
            $.each(this.itemReqs, function(j) {
                reqs.push(new UnlockReq(this.type, this.id, this.amt));
            });
            var itemIcon = new Icon(this.itemIcon.file, this.itemIcon.x, this.itemIcon.y);
            var tooltipIcon = new Icon(this.tooltipIcon.file, this.tooltipIcon.x, this.tooltipIcon.y);

            var parentId = this.itemId;
            new ItemParent(this.itemId, this.itemName, this.itemDesc, this.itemExtraDesc, itemIcon, tooltipIcon,
                this.itemBaseCost, this.itemBasePower, this.itemCostMultiplier, reqs);

            $.each(this.subItems, function(j) {
                var reqs = [];
                $.each(this.itemReqs, function(j) {
                    reqs.push(new UnlockReq(this.type, this.id, this.amt));
                });
                var itemIcon = new Icon(this.itemIcon.file, this.itemIcon.x, this.itemIcon.y);
                var tooltipIcon = new Icon(this.tooltipIcon.file, this.tooltipIcon.x, this.tooltipIcon.y);

                new ItemChild(this.itemId, this.itemName, this.itemDesc, this.itemExtraDesc, itemIcon, tooltipIcon,
                    this.itemBaseCost, this.itemCostMultiplier, this.itemBasePowerMult, this.itemBaseSpeedMult, this.itemBaseDiscountMult, reqs, parentId);
            });
        });
    });
};
Game.LoadUpgrades = async function() {
    await $.getJSON('/Data/Upgrades.json', function(response) {
        $.each(response, function(i) {
            var tempReqs = [];
            $.each(this.upgradeReqs, function(j) {
                tempReqs.push(new UnlockReq(this.type, this.id, this.amt));
            });
            var tempItems = [];
            $.each(this.upgradeItems, function(j) {
                tempItems.push({
                    itemId: this.itemId,
                    multiplier: this.multiplier
                });
            });
            var upgradeIcon = new Icon(this.upgradeIcon.file, this.upgradeIcon.x, this.upgradeIcon.y);
            var tooltipIcon = new Icon(this.tooltipIcon.file, this.tooltipIcon.x, this.tooltipIcon.y);

            new ItemUpgrade(this.upgradeId, this.upgradeName, this.upgradeDesc, this.upgradeExtraDesc, upgradeIcon, tooltipIcon,
                this.upgradeBaseCost, tempItems, tempReqs);
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
Game.Buy = function(id, type, parentId = -1) {
    if (type == 'Item') {
        if (Game.bulkMode == 1) {
            Game.Items[id].buyItem(Game.bulkQty, 1)
        } else if (Game.bulkMode == 2) {
            Game.Items[id].sellItem(Game.bulkQty)
        }
    } else if (type == 'ItemChild') {
        if (Game.bulkMode == 1) {
            Game.Items[parentId].children[id].buyItem(Game.bulkQty, 1)
        } else if (Game.bulkMode == 2) {
            Game.Items[parentId].children[id].sellItem(Game.bulkQty)
        }
    } else if (type == 'Upgrade') {
        Game.ItemUpgrades[id].buyUpgrade()
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
    Game.Items.forEach(function(item) {
        item.reset()
    });
    Game.Items.forEach(function(item) {
        item.updateItem()
    });
    Game.ItemUpgrades.forEach(function(upgrade) {
        upgrade.reset()
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
    Game.ItemUpgrades.forEach(function(i) {
        if (i.isVisible == 1) {
            if (i.canBuyUpgrade() && !i.isEnabled) {
                enableElement(el('upgrade' + i.upgradeId));
                i.isEnabled = 1
            } else if (!i.canBuyUpgrade()) {
                disableElement(el('upgrade' + i.upgradeId));
                i.isEnabled = 0
            }
        }
    });
    if (Game.bulkMode == 1) {
        Game.Items.forEach(function(i) {
            if (i.isVisible == 1) {
                if (i.buyItem(Game.bulkQty, 0) && !i.isEnabled) {
                    enableElement(el('item' + i.id));
                    i.isEnabled = 1
                } else if (!i.buyItem(Game.bulkQty, 0)) {
                    disableElement(el('item' + i.id));
                    i.isEnabled = 0
                }
                i.children.forEach(function(j) {
                    if (j.isVisible == 1) {
                        if (j.buyItem(Game.bulkQty, 0) && !j.isEnabled) {
                            enableElement(el('itemChild' + j.id));
                            j.isEnabled = 1
                        } else if (!j.buyItem(Game.bulkQty, 0)) {
                            disableElement(el('itemChild' + j.id));
                            j.isEnabled = 0
                        }
                    }
                });
            }
        });
    } else if (Game.bulkMode == 2) {
        Game.Items.forEach(function(i) {
            if (i.isVisible == 1) {
                if (i.amt > 0) {
                    enableElement(el('item' + i.id));
                    i.isEnabled = 1
                } else {
                    disableElement(el('item' + i.id));
                    i.isEnabled = 0
                }
                i.children.forEach(function(j) {
                    if (j.isVisible == 1) {
                        if (j.amt > 0) {
                            enableElement(el('itemChild' + j.id));
                            j.isEnabled = 1
                        } else {
                            disableElement(el('itemChild' + j.id));
                            j.isEnabled = 0
                        }
                    }
                });
            }
        });
    }
};
Game.DrawStore = function() {
    Game.ItemUpgrades.forEach(function(i) {
        if (i.unlock() && i.element == null) {
            i.drawStoreItem();
        } else if (!i.isVisible) {
            i.clearStoreItem()
        }
    });
    Game.Items.forEach(function(i) {
        if (i.unlock() && i.element == null) {
            i.drawStoreItem();
        } else if (!i.isVisible) {
            i.clearStoreItem()
        }
        i.children.forEach(function(j) {
            if (j.unlock() && j.element == null) {
                j.drawStoreItem();
            } else if (!j.isVisible) {
                j.clearStoreItem()
            }
        });
    });
}
Game.CalculateGains = function() {
    Game.trainsPs = 0;
    Game.Items.forEach(function(i) {
        Game.trainsPs += i.trainsPs;
        Game.itemTps += i.trainsPs;
    });
};
Game.Loop = function() {
    if (Game.recalcTps)
        Game.CalculateGains();

    Game.Earn(Game.trainsPs / Game.fps);
    Game.Items.forEach(function(item) {
        item.totalTrains += item.trainsPs / Game.fps;
    });

    Game.DrawStore();
    Game.CheckForPurchasable();

    if (Game.mouseMoved || Game.tooltip.dynamic)
        Game.tooltip.updateTooltip();
    if (Game.recalcTps)
        el('tps').innerHTML = 'per second: ' + Game.trainsPs;
    if (Game.refresh == 1) {
        Game.Items.forEach(function(i) {
            i.refresh();
            i.children.forEach(function(j) {
                j.refresh();
            })
        });
    }

    el('tpTotal').innerHTML = formatNum(Game.trains, 2);

    Game.recalcTps = 0;
    Game.refresh = 0;

    Game.ascPercent = ((Game.trainsEarned % Game.ascTrainsReq) / Game.ascTrainsReq) * 100
    el('ascendBar').style.width = Game.ascPercent + '%';

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
    Game.LoadUpgrades();
    Game.Clicker = new Clicker();
    Game.tooltip.initialise();
    Game.Loop();
};