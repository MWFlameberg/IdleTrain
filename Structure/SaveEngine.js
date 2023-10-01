function SaveGame(format) {
    var strSave = '';
    strSave += parseInt(Game.startDate) + '|' + parseInt(Game.fullStartDate) + '|';
    strSave += parseInt(Game.trains) + '|'; 
    strSave += parseInt(Game.timesAscended) + '|' + parseInt(Game.ascTrains) + '|';
    Game.StoreItems.forEach(function(i) {
        strSave += 'SI,' + i.id1 + ',' + i.id2 + ','
        strSave += i.amt + ',' + i.isUnlocked + ',' + i.trainsEarned + '|'
        i.subItems.forEach(function(j) {
            strSave += 'SSI,' + j.id1 + ',' + j.id2 + ','
            strSave += j.amt + ',' + j.isUnlocked + '|'
        });
    });

    Game.StoreTrainLines.forEach(function(i) {
        strSave += 'STL,' + i.id1 + ',' + i.id2 + ','
        strSave += i.amt + ',' + i.isUnlocked + ',' + i.trainsEarned + '|'
        i.subItems.forEach(function(j) {
            strSave += 'STLSI,' + j.id1 + ',' + j.id2 + ','
            strSave += j.amt + ',' + j.isUnlocked + '|'
        });
    });

    Game.StoreUpgrades.forEach(function(i) {
        strSave += 'SU,' + i.id1 + ',' + i.id2 + ','
        strSave += i.amt + ',' + i.isUnlocked + '|'
    });

    el('save-data').innerHTML = strSave;
};
function TestLoad() {
    var testString = '1696169138143|1696169138143|876|0|0|SI,0,-1,5,1,5.498933333333337|SSI,0,0,4,1|SSI,1,0,2,1|STL,0,-1,1,1,1000|STLSI,0,0,0,1|SU,0,-1,1,1|SU,1,-1,0,1|'
    LoadGame(testString);
}

function LoadGame(strSave) {
    var str = strSave.split('|');
    Game.startDate = parseInt(str[0]);
    Game.fullStartDate = parseInt(str[1]);
    Game.trains = parseInt(str[2]);
    Game.timesAscended = parseInt(str[3]);
    Game.ascTrains = parseInt(str[4]);
    
    for (let i = 5; i < str.length; i++) {
        if (str[i].startsWith('SI')) {
            subStr = str[i].split(',');
            Game.StoreItems[subStr[1]].amt = parseInt(subStr[3]);
            Game.StoreItems[subStr[1]].isUnlocked = parseInt(subStr[4]);
            Game.StoreItems[subStr[1]].trainsEarned = parseFloat(subStr[5]);
        } else if(str[i].startsWith('SSI')) {
            subStr = str[i].split(',');
            Game.StoreItems[subStr[2]].subItems[subStr[1]].amt = parseInt(subStr[3]);
            Game.StoreItems[subStr[2]].subItems[subStr[1]].isUnlocked = parseInt(subStr[4]);
        } else if (str[i].startsWith('STL')) {
            subStr = str[i].split(',');
            Game.StoreTrainLines[subStr[1]].amt = parseInt(subStr[3]);
            Game.StoreTrainLines[subStr[1]].isUnlocked = parseInt(subStr[4]);
            Game.StoreTrainLines[subStr[1]].trainsEarned = parseFloat(subStr[5]);
        } else if(str[i].startsWith('STLSI')) {
            subStr = str[i].split(',');
            Game.StoreTrainLines[subStr[2]].subItems[subStr[1]].amt = parseInt(subStr[3]);
            Game.StoreTrainLines[subStr[2]].subItems[subStr[1]].isUnlocked = parseInt(subStr[4]);
        } else if(str[i].startsWith('SU')) {
            subStr = str[i].split(',');
            Game.StoreUpgrades[subStr[1]].amt = parseInt(subStr[3]);
            Game.StoreUpgrades[subStr[1]].isUnlocked = parseInt(subStr[4]);
        };
    };

    Game.StoreItems.forEach(function(i) {
        i.update();
        i.subItems.forEach(function(j) {
            i.update();
        });
    });
    Game.StoreTrainLines.forEach(function(i) {
        i.update();
        i.subItems.forEach(function(j) {
            i.update();
        });
    });
    Game.StoreUpgrades.forEach(function(i) {
        i.update();
    });

    Game.refresh = 1;
    Game.recalcTps = 1;
}