StoreUIItem = function(storeItem, type) {
    //Base UI properties.
    this.storeItem = storeItem;
    this.type = type;
    //Base UI properties.
    this.uiContainer = null;
    this.uiItem = null;
    this.uiContent = null;
    //Static UI properties.
    this.uiHeader = null;
    //Dynamic UI properties.
    this.uiCost = null;
    this.uiOwned = null;

    this.enable = function() {
        enableElement(this.uiItem);
    };
    this.disable = function() {
        disableElement(this.uiItem);
    };

    this.draw = function() {
        if (this.uiContainer !== null) { return; };

        this.uiContainer = el('items').appendChild(document.createElement('div'));
        this.uiContainer.id = 'store-' + this.type + '-' + this.storeItem.id1 + '-container';
        this.uiContainer.className = 'store-' + type + '-container';

        this.uiItem = this.uiContainer.appendChild(document.createElement('div'));
        this.uiItem.id = 'store-' + this.type + '-' + this.storeItem.id1;
        this.uiItem.className = 'store-' + this.type;
        this.uiItem.innerHTML = '<div class="store-' + this.type + '-icon" style="float:left; background-position:' + this.storeItem.icon.xCoord + 'px ' + this.storeItem.icon.yCoord + 'px;background-image:url(' + this.storeItem.icon.file + ')"></div>'

        this.uiContent = this.uiItem.appendChild(document.createElement('div'));
        this.uiContent.className = 'store-' + this.type + '-body';

        this.uiHeader = this.uiContent.appendChild(document.createElement('div'));
        this.uiHeader.className = 'store-' + this.type + '-header';
        this.uiHeader.innerHTML = this.storeItem.name;

        this.uiCost = this.uiContent.appendChild(document.createElement('div'));
        this.uiCost.className = 'store-' + this.type + '-cost';
        this.uiCost.innerHTML = formatNum(this.storeItem.getCurrentCost(), 0);

        this.uiOwned = this.uiContent.appendChild(document.createElement('div'));
        this.uiOwned.className = 'store-' + this.type + '-qty';
        this.uiOwned.innerHTML = formatNum(this.storeItem.amt, 0);

        this.storeItem.isVisible = 1;

        this.uiItem.onclick = function() { Game.Buy(storeItem.id1, storeItem.id2, 'Item') };
        this.uiItem.onmousemove = function() { Game.tooltip.drawTooltip(function() { return storeItem.drawTooltip() }, 'store') };
        this.uiItem.onmouseout =  function() { Game.tooltip.hideTooltip() };
    }
    this.refresh = function() {
        if (this.uiContainer === null) { return; };

        this.uiCost.innerHTML = formatNum(this.storeItem.getCurrentCost(), 0);
        this.uiOwned.innerHTML = formatNum(this.storeItem.amt, 0);
    }
    return this;
};
StoreUISubItem = function(storeItem, type, parentItem, parentType) {
    //Base UI properties.
    this.storeItem = storeItem;
    this.type = type;
    this.parentItem = parentItem;
    this.parentType = parentType;
    //Base UI properties.
    this.uiContainer = null;
    this.uiItem = null;
    this.uiContent = null;
    //Static UI properties.
    this.uiHeader = null;
    //Dynamic UI properties.
    this.uiCost = null;
    this.uiOwned = null;

    this.enable = function() {
        enableElement(this.uiItem);
    };
    this.disable = function() {
        disableElement(this.uiItem);
    };

    this.draw = function() {
        if (this.uiContainer !== null) { return; };

        this.uiContainer = el('store-' + this.parentType + '-' + this.parentItem + '-container').appendChild(document.createElement('div'));

        this.uiItem = this.uiContainer.appendChild(document.createElement('div'));
        this.uiItem.id = 'store-' + this.type + '-' + this.storeItem.id1;
        this.uiItem.className = 'store-' + this.type;
        this.uiItem.innerHTML = '<div class="store-' + this.type + '-icon" style="float:left; background-position:' + this.storeItem.icon.xCoord + 'px ' + this.storeItem.icon.yCoord + 'px;background-image:url(' + this.storeItem.icon.file + ')"></div>'

        this.uiContent = this.uiItem.appendChild(document.createElement('div'));
        this.uiContent.className = 'store-' + this.type + '-body';

        this.uiHeader = this.uiContent.appendChild(document.createElement('div'));
        this.uiHeader.className = 'store-' + this.type + '-header';
        this.uiHeader.innerHTML = this.storeItem.name + ' - ' + formatNum(this.storeItem.getCurrentCost(), 0);

        // this.uiCost = this.uiContent.appendChild(document.createElement('div'));
        // this.uiCost.className = 'store-' + this.type + '-desc';
        // this.uiCost.innerHTML = formatNum(this.storeItem.getCurrentCost(), 0);

        this.uiOwned = this.uiContent.appendChild(document.createElement('div'));
        this.uiOwned.className = 'store-' + this.type + '-qty';
        this.uiOwned.innerHTML = formatNum(this.storeItem.amt, 0);

        this.storeItem.isVisible = 1;

        this.uiItem.onclick = function() { Game.Buy(storeItem.id1, storeItem.id2, 'SubItem') };
        this.uiItem.onmousemove = function() { Game.tooltip.drawTooltip(function() { return storeItem.drawTooltip() }, 'store') };
        this.uiItem.onmouseout =  function() { Game.tooltip.hideTooltip() };
    }
    this.refresh = function() {
        if (this.uiContainer === null) { return; };

        this.uiHeader.innerHTML = this.storeItem.name + ' - ' + formatNum(this.storeItem.getCurrentCost(), 0);
        this.uiOwned.innerHTML = formatNum(this.storeItem.amt, 0);
    }
    return this;
}